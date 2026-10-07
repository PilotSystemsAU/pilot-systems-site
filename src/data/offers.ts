// Offers and prices — change them here and every page updates.
// Founding rates for the first 5 projects. No GST added (not registered).

export const websites = [
  {
    id: 'presence',
    name: 'Pilot Presence',
    price: '$1,790',
    priceLabel: 'Fixed price',
    oneLine: 'A professional website that makes you easy to find, trust and contact.',
    bestFor: 'Sole traders and small crews who need a professional website that makes them easy to find, trust and contact.',
    pricingBestFor: 'Looking professional and being easy to contact',
    includesIntro: "What's included:",
    includes: [
      'Up to 5 pages (for example Home, Services, About, Gallery, Contact)',
      'We write the words from a 45-minute chat with you',
      'A layout designed for your trade, not an untouched template',
      'Built for phones first, with a tap-to-call button on every page',
      'A quote form with spam protection, sent straight to your inbox',
      'Your ABN, licence details, service areas and social links',
      'Google basics: page titles, a sitemap, local business details, and Google Search Console set up',
      'Built to accessibility guidelines, with security basics in place',
      '2 rounds of changes',
      'Launch, a walkthrough, and 30 days of free fixes',
    ],
    timeline: 'Built in 5 business days once we have your content and access.',
    pricingTimeline: 'Built in 5 business days once content is ready',
    payments: '50% to book, 50% before launch',
  },
  {
    id: 'lead-engine',
    name: 'Pilot Lead Engine',
    price: '$4,490',
    priceLabel: 'Fixed price',
    featured: true,
    oneLine: 'A bigger website, plus missed-call text-back and lead capture, so fewer enquiries slip through.',
    bestFor: 'Established businesses that already get work and want fewer enquiries slipping through.',
    pricingBestFor: "Not missing enquiries you're already getting",
    includesIntro: 'Everything in Pilot Presence, plus:',
    includes: [
      'Up to 12 pages, including a page for each main service and each key area you work in',
      'Missed-call text-back: callers you miss get a text straight away (where your phone plan supports it)',
      "An instant reply to every website enquiry, so customers know you've got it",
      'An alert to your phone for every new enquiry',
      'Every enquiry saved in one place, with where it came from',
      'Tracking that shows which pages and sources bring in enquiries',
      'A check of your Google Business Profile, with recommendations',
      '3 rounds of changes',
      "A 30-day review: we look at what's working and fine-tune it",
    ],
    timeline: 'Usually 2–4 weeks from deposit to launch.',
    pricingTimeline: 'Usually 2–4 weeks',
    payments: '40% to book, 40% at design approval, 20% before launch',
  },
];

export const comparison: [string, string, string][] = [
  ['Pages', 'Up to 5', 'Up to 12'],
  ['Words written for you', '✓', '✓'],
  ['Built for phones, tap-to-call', '✓', '✓'],
  ['Quote form with spam protection', '✓', '✓'],
  ['Google basics and Search Console', '✓', '✓'],
  ['Service and area pages', '—', '✓'],
  ['Missed-call text-back', '—', '✓'],
  ['Instant enquiry reply and alerts', '—', '✓'],
  ['Enquiry tracking', '—', '✓'],
  ['Google Business Profile check', '—', '✓'],
  ['Rounds of changes', '2', '3'],
  ['Free fixes after launch', '30 days', '30 days'],
  ['30-day review', '—', '✓'],
];

export const systemsPricing = [
  { name: 'Lead Capture Pack', price: 'from $1,490', payments: "50% to book, 50% once it's tested and working", href: '/services#lead-capture' },
  { name: 'Software Tune-up (up to 3 features)', price: 'from $690', payments: "50% to book, 50% once it's tested and working", href: '/services#tune-up' },
  { name: 'Single feature setup', price: 'from $390', payments: "50% to book, 50% once it's tested and working", href: '/services#tune-up' },
  { name: 'Something else', price: 'Quoted after a free call', payments: 'Set out in your proposal', href: '/services#something-else' },
];

export const care = [
  {
    id: 'website-care',
    name: 'Website Care',
    price: '$49',
    per: '/month',
    items: [
      'Hosting for your website',
      'Uptime monitoring',
      'A monthly check that your enquiry form is still delivering',
      'Regular security and software updates',
      'One small text or image change each month',
      'Replies within 1 business day',
    ],
  },
  {
    id: 'systems-care',
    name: 'Systems Care',
    price: '$79',
    per: '/month per package',
    items: [
      'Alerts if something stops working',
      'A monthly test of your setup from start to finish',
      'Fixes when a software provider changes something',
      'Reconnecting expired logins',
      'Replies within 1 business day',
    ],
  },
];
