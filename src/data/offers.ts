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
      'Accessibility checks (keyboard use, colour contrast, headings and form labels) and security basics in place',
      '2 rounds of changes',
      'Launch, a walkthrough and a short guide',
    ],
    timeline: 'Ready for your review 5 business days after we have your content and access. It goes live once you sign it off and the final payment is made.',
    pricingTimeline: 'Ready for your review 5 business days after your content and access are in',
    payments: '50% to book, 50% after you sign it off, before launch',
    ongoing: '+ $49/month Website Care (includes hosting) from launch',
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
      'Missed-call text-back: callers you miss get an automatic text (we check your carrier, plan and phone before you pay)',
      "An automatic reply to website enquiries, so customers know you've got it",
      'An alert to your phone when a new enquiry comes in',
      'Website and missed-call enquiries saved in one place, with where they came from',
      'Tracking that shows which pages and sources bring in enquiries',
      'A check of your Google Business Profile, with recommendations',
      '3 rounds of changes',
      "A 30-day review: we look at what's working and make up to 2 hours of adjustments",
    ],
    timeline: 'Usually 2–4 weeks to launch, from when we have your content and access.',
    pricingTimeline: 'Usually 2–4 weeks once your content and access are in',
    payments: '40% to book, 40% at design approval, 20% after you sign it off, before launch',
    ongoing: '+ $49/month Website Care (includes hosting) from launch',
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
  ['Automatic enquiry reply and alerts', '—', '✓'],
  ['Enquiry tracking', '—', '✓'],
  ['Google Business Profile check', '—', '✓'],
  ['Rounds of changes', '2', '3'],
  ['30-day review', '—', '✓'],
];

export const systemsPricing = [
  { name: 'Lead Capture Pack', price: 'from $1,490', payments: "50% to book, 50% once it's tested and you've signed it off", href: '/services#lead-capture' },
  { name: 'Software Tune-up (up to 3 features)', price: 'from $690', payments: "50% to book, 50% once it's tested and you've signed it off", href: '/services#tune-up' },
  { name: 'Single feature setup', price: 'from $390', payments: "50% to book, 50% once it's tested and you've signed it off", href: '/services#tune-up' },
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
      'One small text or image change each month (up to 15 minutes)',
      'We aim to respond within 24 hours',
      'Required while we host your website',
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
      'Reconnecting expired logins, where possible',
      'Up to 1 hour of fixes a month per package (bigger jobs quoted first)',
      'We aim to respond within 24 hours',
      'Optional',
    ],
  },
];
