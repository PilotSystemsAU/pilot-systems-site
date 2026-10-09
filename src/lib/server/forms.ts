// Shared helpers for the signup form handler (/api/subscribe).
// These match the helpers in /api/enquiry, which was security-reviewed on
// 7 October 2026 and keeps its own copies so that review still holds.

export const UPSTREAM_TIMEOUT_MS = 4000; // how long to wait for Cloudflare or Resend
export const MAX_TOKEN_CHARS = 2048; // the longest spam-check token Cloudflare issues

// The pattern browsers use for <input type="email">, plus "the domain has a dot".
// Only ever run it on text that has already passed a length limit.
export const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// One-line fields: no line breaks, control or invisible formatting characters, single spaces.
export const oneLine = (s: string) =>
  s.normalize('NFC').replace(/[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]+/gu, ' ').replace(/\s+/g, ' ').trim();

export const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

// Anything other than a clear "yes" from Cloudflare counts as a failed check,
// including Cloudflare being slow or unreachable.
export async function verifyTurnstile(token: string, ip: string | null, secret: string) {
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

export async function sendEmail(apiKey: string, payload: Record<string, unknown>) {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    if (!res.ok) {
      // Status only, never the body (it can echo personal details).
      console.error('Resend error', res.status);
      return false;
    }
    return true;
  } catch {
    console.error('Resend could not be reached');
    return false;
  }
}
