// Contact form handler. Runs on Vercel as a small server function.
//
// Flow: check honeypot → validate fields → verify Cloudflare Turnstile →
// email the enquiry to Declan (Resend) → send the enquirer a confirmation
// (only if they gave an email). Responds with JSON; the page only goes to
// /thanks when this returns ok.
//
// Settings (Vercel → Project → Settings → Environment Variables):
//   RESEND_API_KEY        required  Resend API key (sending access)
//   TURNSTILE_SECRET_KEY  required  Cloudflare Turnstile secret key
//   ENQUIRY_TO            optional  where enquiries go (default declan@…)
//   ENQUIRY_FROM          optional  sender (default website@pilotsystems.com.au)

import type { APIRoute } from 'astro';

export const prerender = false;

const env = (name: string) => (import.meta.env[name] as string | undefined) ?? process.env[name];

const LIMITS = { name: 100, phone: 30, email: 200, trade: 100, suburb: 100, message: 3000 };

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

async function verifyTurnstile(token: string, ip: string | null, secret: string) {
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  if (!res.ok) return false;
  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}

async function sendEmail(apiKey: string, payload: Record<string, unknown>) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    // Log the status only, never the response body (it can echo enquiry details).
    console.error('Resend error', res.status);
    return false;
  }
  return true;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: 'bad_request' }, 400);
  }

  const get = (k: string) => String(form.get(k) ?? '').trim();

  // Honeypot: people never see this field. If it's filled in, pretend it worked.
  if (get('company_website')) return json({ ok: true });

  const data = {
    name: get('name'),
    phone: get('phone'),
    email: get('email'),
    trade: get('trade'),
    suburb: get('suburb'),
    message: get('message'),
  };

  // Server-side validation (never trust the browser alone)
  const errors: string[] = [];
  if (!data.name) errors.push('name');
  if (data.phone.replace(/\D/g, '').length < 8) errors.push('phone');
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.push('email');
  if (!data.trade) errors.push('trade');
  if (!data.suburb) errors.push('suburb');
  if (!data.message) errors.push('message');
  for (const [k, max] of Object.entries(LIMITS)) {
    if ((data as Record<string, string>)[k].length > max) errors.push(k);
  }
  if (errors.length) return json({ ok: false, error: 'invalid', fields: [...new Set(errors)] }, 400);

  const apiKey = env('RESEND_API_KEY');
  const secret = env('TURNSTILE_SECRET_KEY');
  if (!apiKey || !secret) {
    console.error('Enquiry form is missing RESEND_API_KEY or TURNSTILE_SECRET_KEY');
    return json({ ok: false, error: 'not_configured' }, 500);
  }

  const token = get('cf-turnstile-response');
  let ip: string | null = null;
  try { ip = clientAddress; } catch { ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null; }
  if (!token || !(await verifyTurnstile(token, ip, secret))) {
    return json({ ok: false, error: 'spam_check_failed' }, 400);
  }

  const to = env('ENQUIRY_TO') || 'declan@pilotsystems.com.au';
  const from = env('ENQUIRY_FROM') || 'Pilot Systems Website <website@pilotsystems.com.au>';
  const page = request.headers.get('referer') ?? 'pilotsystems.com.au/contact';
  const sentAt = new Date().toLocaleString('en-AU', { timeZone: 'Australia/Melbourne', dateStyle: 'medium', timeStyle: 'short' });
  const tel = data.phone.replace(/[^\d+]/g, '');

  const e = {
    name: escapeHtml(data.name), phone: escapeHtml(data.phone), email: escapeHtml(data.email),
    trade: escapeHtml(data.trade), suburb: escapeHtml(data.suburb), message: escapeHtml(data.message).replace(/\n/g, '<br>'),
  };

  const row = (label: string, value: string) =>
    `<tr><td style="padding:8px 12px;font-weight:700;vertical-align:top;border-bottom:1px solid #eee">${label}</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${value}</td></tr>`;

  // 1. Alert to Declan
  const alertOk = await sendEmail(apiKey, {
    from,
    to: [to],
    reply_to: data.email || undefined,
    subject: `New enquiry: ${data.trade} in ${data.suburb}`,
    html: `<div style="font-family:Arial,sans-serif;font-size:15px;color:#1c1726">
      <h2 style="margin:0 0 12px">New website enquiry</h2>
      <table style="border-collapse:collapse;width:100%;max-width:600px">
        ${row('Name', e.name)}
        ${row('Phone', `<a href="tel:${tel}">${e.phone}</a>`)}
        ${row('Email', e.email ? `<a href="mailto:${e.email}">${e.email}</a>` : 'Not given')}
        ${row('Trade', e.trade)}
        ${row('Suburb', e.suburb)}
        ${row('Message', e.message)}
        ${row('Sent', escapeHtml(sentAt))}
        ${row('From page', escapeHtml(page))}
      </table>
      <p style="margin-top:16px;color:#6b6577">Aim to reply within 24 hours.</p>
    </div>`,
    text: `New website enquiry\n\nName: ${data.name}\nPhone: ${data.phone}\nEmail: ${data.email || 'Not given'}\nTrade: ${data.trade}\nSuburb: ${data.suburb}\n\nMessage:\n${data.message}\n\nSent: ${sentAt}\nFrom page: ${page}`,
  });

  if (!alertOk) return json({ ok: false, error: 'send_failed' }, 502);

  // 2. Confirmation to the enquirer (only if they gave an email). If this one
  // fails, the enquiry still reached Declan, so we still report success.
  if (data.email) {
    const first = escapeHtml(data.name.split(/\s+/)[0] || data.name);
    await sendEmail(apiKey, {
      from,
      to: [data.email],
      reply_to: to,
      subject: 'Thanks for getting in touch, Pilot Systems',
      html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#1c1726">
        <p>Hi ${first},</p>
        <p>Thanks for your enquiry. It's come through, and we aim to be in touch within 24 hours to set up your free discovery call.</p>
        <p>If it's urgent, call us on <a href="tel:+61457471392">0457 471 392</a>.</p>
        <p>Cheers,<br>Declan<br>Pilot Systems<br><a href="https://www.pilotsystems.com.au">pilotsystems.com.au</a></p>
      </div>`,
      text: `Hi ${data.name.split(/\s+/)[0] || data.name},\n\nThanks for your enquiry. It's come through, and we aim to be in touch within 24 hours to set up your free discovery call.\n\nIf it's urgent, call us on 0457 471 392.\n\nCheers,\nDeclan\nPilot Systems\npilotsystems.com.au`,
    });
  }

  return json({ ok: true });
};

export const ALL: APIRoute = () => json({ ok: false, error: 'method_not_allowed' }, 405);
