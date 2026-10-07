// Friendly email checks for the contact form.
//
// emailProblem(): a plain-English reason an address can't be right, or '' if it looks fine.
// emailSuggestion(): a likely fix for a misspelt common provider ("gmial.com" → "gmail.com"),
// or '' if there's nothing to suggest. A suggestion never blocks sending — people
// with unusual but real addresses can ignore it.

// Common providers for Australian tradies and small businesses.
const DOMAINS = [
  'gmail.com', 'outlook.com', 'outlook.com.au', 'hotmail.com', 'hotmail.com.au',
  'live.com', 'live.com.au', 'yahoo.com', 'yahoo.com.au', 'icloud.com', 'me.com',
  'bigpond.com', 'bigpond.net.au', 'optusnet.com.au', 'iinet.net.au', 'tpg.com.au',
  'internode.on.net', 'westnet.com.au', 'aapt.net.au', 'dodo.com.au',
];

// Real domains that sit one letter away from a common one. Never "correct" these.
const LEAVE_ALONE = new Set(['mail.com', 'email.com', 'ymail.com', 'gmx.com', 'msn.com', 'aol.com', 'zoho.com', 'proton.me', 'protonmail.com']);

// Misspelt endings that are never right on their own.
const TLD_FIXES: Record<string, string> = {
  con: 'com', cmo: 'com', ocm: 'com', vom: 'com', xom: 'com', comm: 'com', cm: 'com', om: 'com',
  'com.ua': 'com.au', 'com.u': 'com.au', 'com.a': 'com.au', 'com.aus': 'com.au', 'cpm.au': 'com.au',
  'net.ua': 'net.au', 'nte.au': 'net.au',
};

// Letters added, removed, swapped or changed (Damerau–Levenshtein, optimal string alignment).
function distance(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

export function emailProblem(raw: string): string {
  const v = raw.trim();
  if (!v) return '';
  if (/\s/.test(v)) return "Email addresses can't have spaces in them.";
  const at = (v.match(/@/g) ?? []).length;
  if (at === 0) return 'Your email needs an @ symbol, like name@gmail.com.';
  if (at > 1) return 'Your email should only have one @ symbol.';
  const [local, domain] = v.split('@');
  if (!local) return 'Add the part before the @, like name@gmail.com.';
  if (!domain) return 'Add the part after the @, like name@gmail.com.';
  if (!domain.includes('.') || domain.startsWith('.') || domain.endsWith('.') || domain.includes('..'))
    return 'The part after the @ looks incomplete, like gmail.com.';
  if (!/^[a-z0-9.-]+$/i.test(domain)) return 'The part after the @ has a character that can’t be in an email.';
  return '';
}

export function emailSuggestion(raw: string): string {
  const v = raw.trim();
  if (emailProblem(v) || !v) return '';
  const at = v.lastIndexOf('@');
  const local = v.slice(0, at);
  const domain = v.slice(at + 1).toLowerCase();
  if (DOMAINS.includes(domain) || LEAVE_ALONE.has(domain)) return '';

  // 1. Closest common provider, if it's only a slip of the finger away.
  let best = '';
  let bestScore = Infinity;
  for (const d of DOMAINS) {
    const score = distance(domain, d);
    if (score < bestScore) { best = d; bestScore = score; }
  }
  const allowed = domain.length >= 9 ? 2 : 1;
  if (bestScore > 0 && bestScore <= allowed) return `${local}@${best}`;

  // 2. Otherwise just fix an obviously wrong ending (works for business domains too).
  for (const [wrong, right] of Object.entries(TLD_FIXES)) {
    if (domain.endsWith(`.${wrong}`)) return `${local}@${domain.slice(0, -wrong.length)}${right}`;
  }
  return '';
}
