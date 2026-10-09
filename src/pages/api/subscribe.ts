// Kit signup handler (/kit page). Runs on Vercel as a small server function.
//
// Flow: size check → validate → verify Cloudflare Turnstile → add to MailerLite.
// If MailerLite isn't connected or fails, Declan is emailed the details (via
// Resend) so he can add them by hand. Either way the visitor goes to /kit/thanks,
// where they can download the kit straight away.
//
// Pressing "Send me the kit" is the consent. The statement above the button
// (src/data/consent.ts) says what they'll get, how often, and how to stop.
//
// Honeypot: a filled-in hidden field means "probably a bot". The visitor is still
// sent to the thank-you page (so a person whose browser autofilled it can still
// download the kit), but they're not added to the list.
//
// Settings: TURNSTILE_SECRET_KEY, RESEND_API_KEY, ENQUIRY_TO, ENQUIRY_FROM (as for
// /api/enquiry), plus MAILERLITE_API_KEY and MAILERLITE_GROUP_ID (see
// src/lib/server/mailerlite.ts).

import type { APIRoute } from 'astro';
import { getSecret } from 'astro:env/server';
import { EMAIL_RE, MAX_TOKEN_CHARS, escapeHtml, json, oneLine, sendEmail, verifyTurnstile } from '../../lib/server/forms';
import { addSubscriber, describeResult } from '../../lib/server/mailerlite';
import { CONSENT_VERSION, kitFormConsent } from '../../data/consent';

export const prerender = false;

const MAX_BODY_BYTES = 16 * 1024;
const LIMITS = { name: 100, email: 200, trade: 100 };
type Field = keyof typeof LIMITS;
const FIELDS = Object.keys(LIMITS) as Field[];

export const POST: APIRoute = async (context) => {
  const { request } = context;

  if (Number(request.headers.get('content-length')) > MAX_BODY_BYTES) {
    return json({ ok: false, error: 'too_large' }, 413);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: 'bad_request' }, 400);
  }
  const get = (k: string) => {
    const v = form.get(k);
    return typeof v === 'string' ? v.trim() : '';
  };

  const oversized = FIELDS.filter((k) => get(k).length > LIMITS[k] * 2);
  if (oversized.length) return json({ ok: false, error: 'invalid', fields: oversized }, 400);

  const data = { name: oneLine(get('name')), email: get('email'), trade: oneLine(get('trade')) };
  const errors = new Set<Field>(FIELDS.filter((k) => data[k].length > LIMITS[k]));
  if (!data.email || !EMAIL_RE.test(data.email)) errors.add('email');
  if (errors.size) return json({ ok: false, error: 'invalid', fields: [...errors] }, 400);

  const secret = getSecret('TURNSTILE_SECRET_KEY');
  if (!secret) {
    console.error('Signup form is missing TURNSTILE_SECRET_KEY');
    return json({ ok: false, error: 'not_configured' }, 500);
  }

  const token = get('cf-turnstile-response');
  let ip: string | null = null;
  try { ip = context.clientAddress; } catch { ip = null; }
  if (!token || token.length > MAX_TOKEN_CHARS || !(await verifyTurnstile(token, ip, secret))) {
    return json({ ok: false, error: 'spam_check_failed' }, 400);
  }

  // Honeypot filled: let the visitor through to the download, but don't add them.
  if (get('company_website') !== '') {
    console.warn('Kit signup skipped: honeypot filled');
    return json({ ok: true });
  }

  const result = await addSubscriber({ email: data.email, name: data.name, trade: data.trade, source: 'Kit page', ip });
  if (result === 'added') return json({ ok: true });

  // Not added: tell Declan so the signup isn't lost. The visitor still gets the kit.
  const apiKey = getSecret('RESEND_API_KEY');
  if (apiKey) {
    const to = getSecret('ENQUIRY_TO') || 'declan@pilotsystems.com.au';
    const from = getSecret('ENQUIRY_FROM') || 'Pilot Systems Website <website@pilotsystems.com.au>';
    const sentAt = new Date().toLocaleString('en-AU', { timeZone: 'Australia/Melbourne', dateStyle: 'medium', timeStyle: 'short' });
    const status = describeResult(result);
    await sendEmail(apiKey, {
      from,
      to: [to],
      subject: 'New kit signup: add to MailerLite by hand',
      html: `<div style="font-family:Arial,sans-serif;font-size:15px;color:#1c1726">
        <h2 style="margin:0 0 12px">New kit signup</h2>
        <p>${escapeHtml(status)}</p>
        <p><strong>Email:</strong> ${escapeHtml(data.email)}<br>
        <strong>Name:</strong> ${escapeHtml(data.name || 'Not given')}<br>
        <strong>Trade:</strong> ${escapeHtml(data.trade || 'Not given')}<br>
        <strong>Signed up:</strong> ${escapeHtml(sentAt)} on the /kit page</p>
        <p style="color:#6b6577"><strong>Consent record (keep this email):</strong> they pressed "Send me the kit" under this statement, version ${CONSENT_VERSION}:<br>"${escapeHtml(kitFormConsent)}"</p>
      </div>`,
      text: `New kit signup\n\n${status}\n\nEmail: ${data.email}\nName: ${data.name || 'Not given'}\nTrade: ${data.trade || 'Not given'}\nSigned up: ${sentAt} on the /kit page\n\nConsent record (keep this email): they pressed "Send me the kit" under this statement, version ${CONSENT_VERSION}:\n"${kitFormConsent}"`,
    });
  } else {
    console.error('Kit signup not recorded: MailerLite and Resend both unavailable');
  }
  return json({ ok: true });
};

export const ALL: APIRoute = () => {
  const res = json({ ok: false, error: 'method_not_allowed' }, 405);
  res.headers.set('Allow', 'POST');
  return res;
};
