// Adds a subscriber to MailerLite (server only).
//
// Settings (Vercel → Project → Settings → Environment Variables):
//   MAILERLITE_API_KEY   MailerLite API token (mark it Sensitive)
//   MAILERLITE_GROUP_ID  ID of the "Newsletter" group. Joining this group starts
//                        the welcome automation in MailerLite.
//
// If either is missing, or MailerLite doesn't answer in time, the caller gets
// 'not_configured' or 'failed' and emails Declan the details instead, so a
// signup is never lost. Nothing here logs personal details.
//
// Single opt-in: subscribers are added as active. In MailerLite, keep
// Account settings → Subscribe settings → "Double opt-in for API and
// integrations" switched OFF, or they'd be sent a confirmation email instead.

import { getSecret } from 'astro:env/server';
import { CONSENT_VERSION } from '../../data/consent';

export type SubscribeResult = 'added' | 'not_configured' | 'failed';

const TIMEOUT_MS = 3000;

// MailerLite wants "yyyy-MM-dd HH:mm:ss" (UTC).
const stamp = (d: Date) => d.toISOString().slice(0, 19).replace('T', ' ');

export async function addSubscriber(input: {
  email: string;
  name?: string;
  trade?: string;
  source: 'Enquiry form' | 'Kit page';
  ip?: string | null;
}): Promise<SubscribeResult> {
  const apiKey = getSecret('MAILERLITE_API_KEY');
  const groupId = getSecret('MAILERLITE_GROUP_ID');
  if (!apiKey || !groupId) return 'not_configured';

  const now = stamp(new Date());
  const fields: Record<string, string> = {
    signup_source: input.source,
    consent_version: CONSENT_VERSION,
  };
  if (input.name) fields.name = input.name;
  if (input.trade) fields.trade = input.trade;

  const body: Record<string, unknown> = {
    email: input.email,
    fields,
    groups: [groupId],
    status: 'active',
    // They've just ticked the box or used the kit form, so this is fresh consent,
    // even if they unsubscribed in the past.
    resubscribe: true,
    subscribed_at: now,
    opted_in_at: now,
  };
  if (input.ip) {
    body.ip_address = input.ip;
    body.optin_ip = input.ip;
  }

  try {
    const res = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (res.status === 200 || res.status === 201) return 'added';
    // Status only, never the body (it can echo the email address).
    console.error('MailerLite error', res.status);
    return 'failed';
  } catch {
    console.error('MailerLite could not be reached');
    return 'failed';
  }
}

// Plain-English line for Declan's alert emails.
export function describeResult(result: SubscribeResult): string {
  if (result === 'added') return 'Yes, added to MailerLite. The welcome emails start automatically.';
  if (result === 'not_configured') return 'Yes, but NOT added: MailerLite isn’t connected yet. Add them to the Newsletter group by hand.';
  return 'Yes, but NOT added: MailerLite didn’t accept it. Add them to the Newsletter group by hand.';
}
