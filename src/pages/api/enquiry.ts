// Contact form handler. Runs on Vercel as a small server function.
//
// Flow: size check → validate fields → verify Cloudflare Turnstile →
// email the enquiry to Declan (Resend) → send the enquirer a confirmation
// (if not flagged as spam). Responds with JSON; the page only goes to
// /thanks when this returns ok.
//
// Honeypot: the form has a hidden field people never see. A filled-in honeypot
// doesn't throw the enquiry away (a browser's autofill can fill it by mistake):
// the spam check still decides, and anything that gets through is delivered
// marked "[Possible spam]" with no automatic reply.
//
// Duplicates: the form sends a random submission_id with each enquiry. It is
// passed to Resend as an Idempotency-Key, and Resend delivers a given key only
// once within 24 hours. So a double tap, a retry after a dropped connection, or
// a resend after pressing Back can't email the same enquiry twice.
//
// Checkboxes: "agree_terms" (required: agreeing to the Terms of Use) and
// "subscribe" (optional, unticked by default: the free kit and monthly email).
// Agreeing to the Terms is never treated as marketing consent. Only a ticked
// "subscribe" box adds someone to MailerLite, and the alert to Declan records
// what they agreed to, when, and which wording version they saw.
//
// Settings (Vercel → Project → Settings → Environment Variables):
//   RESEND_API_KEY        required  Resend API key (sending access)
//   TURNSTILE_SECRET_KEY  required  Cloudflare Turnstile secret key
//   ENQUIRY_TO            optional  where enquiries go (default declan@…)
//   ENQUIRY_FROM          optional  sender (default website@pilotsystems.com.au)
//   MAILERLITE_API_KEY    optional  see src/lib/server/mailerlite.ts
//   MAILERLITE_GROUP_ID   optional  see src/lib/server/mailerlite.ts

import type { APIRoute } from 'astro';
import { getSecret } from 'astro:env/server';
import { addSubscriber, describeResult, type SubscribeResult } from '../../lib/server/mailerlite';
import { CONSENT_VERSION, enquiryOptIn, kit } from '../../data/consent';

export const prerender = false;

// Settings are read when a request arrives (Vercel environment variables on the
// live site, the local .env file in `astro dev`). Don't look them up through
// import.meta.env here: that made Astro copy the secret values into the built
// server file.
const env = (name: string) => getSecret(name);

const MAX_BODY_BYTES = 32 * 1024; // a full-length enquiry is well under this
const MAX_TOKEN_CHARS = 2048; // the longest spam-check token Cloudflare issues
const UPSTREAM_TIMEOUT_MS = 4000; // how long to wait for Cloudflare or Resend
const LIMITS = { name: 100, phone: 30, email: 200, trade: 100, suburb: 100, message: 3000 };
type Field = keyof typeof LIMITS;
const FIELDS = Object.keys(LIMITS) as Field[];

// The pattern browsers use for <input type="email">, plus "the domain has a dot".
// It only ever runs on text that has already passed the length limit.
const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// One-line fields: no line breaks, control characters or invisible formatting
// characters, and single spaces. (These fields end up in the email subject.)
const oneLine = (s: string) =>
  s.normalize('NFC').replace(/[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]+/gu, ' ').replace(/\s+/g, ' ').trim();

// The message: keep line breaks (as one character each) and tabs, drop other
// control characters.
const multiLine = (s: string) =>
  s.replace(/\r\n?|\p{Zl}|\p{Zp}/gu, '\n').replace(/[^\P{Cc}\n\t]/gu, '').trim();

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

// Anything other than a clear "yes" from Cloudflare counts as a failed check,
// including Cloudflare being slow or unreachable.
async function verifyTurnstile(token: string, ip: string | null, secret: string) {
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set('remoteip', ip);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    console.error('Spam check could not be completed');
    return false;
  }
}

async function sendEmail(apiKey: string, payload: Record<string, unknown>, idempotencyKey?: string) {
  const headers: Record<string, string> = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
  let res: Response;
  try {
    res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch {
    console.error('Resend could not be reached');
    return false;
  }
  // 409 with an idempotency key means Resend already has this exact enquiry
  // (sent, or still sending from the first attempt). Don't send it again.
  if (res.status === 409 && idempotencyKey) {
    console.warn('Duplicate enquiry suppressed');
    return true;
  }
  if (!res.ok) {
    // Log the status only, never the response body (it can echo enquiry details).
    console.error('Resend error', res.status);
    return false;
  }
  return true;
}

export const POST: APIRoute = async (context) => {
  const { request } = context;

  // Nothing genuine is anywhere near this big, so don't spend time reading it.
  if (Number(request.headers.get('content-length')) > MAX_BODY_BYTES) {
    return json({ ok: false, error: 'too_large' }, 413);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: 'bad_request' }, 400);
  }

  // Text only: a file sent in place of a field counts as empty.
  const get = (k: string) => {
    const v = form.get(k);
    return typeof v === 'string' ? v.trim() : '';
  };

  // Server-side validation (never trust the browser alone). Sizes are checked
  // before anything else is done with a field, so the tidying and pattern checks
  // below only ever run on short text.
  const oversized = FIELDS.filter((k) => get(k).length > LIMITS[k] * 2);
  if (oversized.length) return json({ ok: false, error: 'invalid', fields: oversized }, 400);

  const data = {
    name: oneLine(get('name')),
    phone: oneLine(get('phone')),
    email: get('email'),
    trade: oneLine(get('trade')),
    suburb: oneLine(get('suburb')),
    message: multiLine(get('message')),
  };

  const errors = new Set<Field | 'agree_terms'>(FIELDS.filter((k) => data[k].length > LIMITS[k]));
  if (!data.name) errors.add('name');
  // Email is required; phone is optional, but if given it must look like a number.
  if (data.phone && data.phone.replace(/\D/g, '').length < 8) errors.add('phone');
  if (!data.email || !EMAIL_RE.test(data.email)) errors.add('email');
  if (!data.trade) errors.add('trade');
  if (!data.suburb) errors.add('suburb');
  if (!data.message) errors.add('message');
  // Required: agreeing to the Terms of Use. Optional: the kit and monthly email.
  if (get('agree_terms') !== 'yes') errors.add('agree_terms');
  const wantsEmails = get('subscribe') === 'yes';
  if (errors.size) return json({ ok: false, error: 'invalid', fields: [...errors] }, 400);

  // Honeypot (see the note at the top): filled in means "treat with suspicion".
  const flagged = get('company_website') !== '';

  const apiKey = env('RESEND_API_KEY');
  const secret = env('TURNSTILE_SECRET_KEY');
  if (!apiKey || !secret) {
    console.error('Enquiry form is missing RESEND_API_KEY or TURNSTILE_SECRET_KEY');
    return json({ ok: false, error: 'not_configured' }, 500);
  }

  // Client-made ID for this enquiry (letters, digits and dashes only). Older
  // cached pages may not send one; they still work, just without the dedupe.
  const submissionId = /^[A-Za-z0-9-]{16,64}$/.test(get('submission_id')) ? get('submission_id') : '';

  const token = get('cf-turnstile-response');
  let ip: string | null = null;
  try { ip = context.clientAddress; } catch { ip = null; }
  if (!token || token.length > MAX_TOKEN_CHARS || !(await verifyTurnstile(token, ip, secret))) {
    return json({ ok: false, error: 'spam_check_failed' }, 400);
  }

  const to = env('ENQUIRY_TO') || 'declan@pilotsystems.com.au';
  const from = env('ENQUIRY_FROM') || 'Pilot Systems Website <website@pilotsystems.com.au>';
  // The browser says which page the form was on. It's only a hint, so tidy and cap it.
  const page = oneLine((request.headers.get('referer') ?? '').slice(0, 300)) || 'pilotsystems.com.au/contact';
  const sentAt = new Date().toLocaleString('en-AU', { timeZone: 'Australia/Melbourne', dateStyle: 'medium', timeStyle: 'short' });
  const key = (kind: string) => (submissionId ? `enquiry-${kind}/${submissionId}` : undefined);
  const tel = data.phone.replace(/[^\d+]/g, '');

  const e = {
    name: escapeHtml(data.name), phone: escapeHtml(data.phone), email: escapeHtml(data.email),
    trade: escapeHtml(data.trade), suburb: escapeHtml(data.suburb), message: escapeHtml(data.message).replace(/\n/g, '<br>'),
  };

  // Optional marketing signup. Only if they ticked the box, and never for an
  // enquiry flagged as possible spam. Done before the alert so the alert can say
  // whether it worked. A failure never stops the enquiry going through.
  let signup: SubscribeResult | 'skipped_spam' | null = null;
  if (wantsEmails) {
    signup = flagged ? 'skipped_spam' : await addSubscriber({ email: data.email, name: data.name, trade: data.trade, source: 'Enquiry form', ip });
  }
  const signupLine =
    signup === null ? 'No'
    : signup === 'skipped_spam' ? 'Ticked, but NOT added because this enquiry was flagged as possible spam.'
    : describeResult(signup);
  const consentLine = wantsEmails
    ? `They ticked "${enquiryOptIn.label}" (wording version ${CONSENT_VERSION}) when sending this enquiry on ${sentAt}. Keep this email as the consent record.`
    : '';

  const row = (label: string, value: string) =>
    `<tr><td style="padding:8px 12px;font-weight:700;vertical-align:top;border-bottom:1px solid #eee">${label}</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${value}</td></tr>`;

  // 1. Alert to Declan
  const alertOk = await sendEmail(apiKey, {
    from,
    to: [to],
    reply_to: data.email,
    subject: `${flagged ? '[Possible spam] ' : ''}New enquiry: ${data.trade} in ${data.suburb}`,
    html: `<div style="font-family:Arial,sans-serif;font-size:15px;color:#1c1726">
      <h2 style="margin:0 0 12px">New website enquiry</h2>
      <table style="border-collapse:collapse;width:100%;max-width:600px">
        ${row('Name', e.name)}
        ${row('Phone', e.phone ? `<a href="tel:${tel}">${e.phone}</a>` : 'Not given')}
        ${row('Email', e.email ? `<a href="mailto:${e.email}">${e.email}</a>` : 'Not given')}
        ${row('Trade', e.trade)}
        ${row('Suburb', e.suburb)}
        ${row('Message', e.message)}
        ${row('Sent', escapeHtml(sentAt))}
        ${row('From page', escapeHtml(page))}
        ${row('Terms of Use', 'Agreed')}
        ${row('Kit + monthly email', escapeHtml(signupLine))}
      </table>
      ${consentLine ? `<p style="margin-top:12px;color:#6b6577">${escapeHtml(consentLine)}</p>` : ''}
      <p style="margin-top:16px;color:#6b6577">Aim to reply within 24 hours.</p>
    </div>`,
    text: `New website enquiry\n\nName: ${data.name}\nPhone: ${data.phone || 'Not given'}\nEmail: ${data.email}\nTrade: ${data.trade}\nSuburb: ${data.suburb}\n\nMessage:\n${data.message}\n\nSent: ${sentAt}\nFrom page: ${page}\nTerms of Use: Agreed\nKit + monthly email: ${signupLine}${consentLine ? `\n\n${consentLine}` : ''}`,
  }, key('alert'));

  if (!alertOk) return json({ ok: false, error: 'send_failed' }, 502);

  // 2. Confirmation to the enquirer (email is required, but not if flagged). If this one
  // fails, the enquiry still reached Declan, so we still report success.
  //
  // This email goes to an address a stranger typed in, so the only thing of
  // theirs it repeats is a plain first name (letters, hyphen, apostrophe).
  // Anything else becomes "there". That stops the form being used to send
  // someone a link or a message that appears to come from us.
  if (data.email && !flagged) {
    const firstWord = data.name.split(' ')[0];
    const first = /^\p{L}[\p{L}'\u2019-]{0,29}$/u.test(firstWord) ? firstWord : 'there';
    // If they asked for the kit: MailerLite sends it when they were added;
    // otherwise give them the link here so they aren't left waiting.
    const kitUrl = `https://www.pilotsystems.com.au${kit.pdf}`;
    const kitHtml = !wantsEmails ? ''
      : signup === 'added' ? '<p>You also asked for the free Tradie Follow-Up Kit. It\u2019s on its way in a separate email.</p>'
      : `<p>You also asked for the free Tradie Follow-Up Kit. You can download it here: <a href="${kitUrl}">${kitUrl}</a></p>`;
    const kitText = !wantsEmails ? ''
      : signup === 'added' ? '\n\nYou also asked for the free Tradie Follow-Up Kit. It\u2019s on its way in a separate email.'
      : `\n\nYou also asked for the free Tradie Follow-Up Kit. You can download it here: ${kitUrl}`;
    await sendEmail(apiKey, {
      from,
      to: [data.email],
      reply_to: to,
      subject: 'Thanks for getting in touch, Pilot Systems',
      html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#1c1726">
        <p>Hi ${escapeHtml(first)},</p>
        <p>Thanks for your enquiry. It's come through, and we aim to be in touch within 24 hours to set up your free discovery call.</p>
        ${kitHtml}
        <p>If it's urgent, call us on <a href="tel:+61457471392">0457 471 392</a>.</p>
        <p>Cheers,<br>Declan<br>Pilot Systems<br><a href="https://www.pilotsystems.com.au">pilotsystems.com.au</a></p>
      </div>`,
      text: `Hi ${first},\n\nThanks for your enquiry. It's come through, and we aim to be in touch within 24 hours to set up your free discovery call.${kitText}\n\nIf it's urgent, call us on 0457 471 392.\n\nCheers,\nDeclan\nPilot Systems\npilotsystems.com.au`,
    }, key('confirm'));
  }

  return json({ ok: true });
};

export const ALL: APIRoute = () => {
  const res = json({ ok: false, error: 'method_not_allowed' }, 405);
  res.headers.set('Allow', 'POST');
  return res;
};
