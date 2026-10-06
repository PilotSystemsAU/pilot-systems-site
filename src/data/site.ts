// Single source of truth for business details used across the site.
export const site = {
  name: 'Pilot Systems',
  url: 'https://www.pilotsystems.com.au',
  phoneDisplay: '0457 471 392',
  phoneHref: 'tel:+61457471392',
  phoneIntl: '+61457471392',
  email: 'declan@pilotsystems.com.au',
  abn: '19 717 753 395',
  location: 'Melbourne, Victoria',
  owner: 'Declan Cawthorn',
  legalName: 'Declan Thomas Cawthorn',
  tagline: 'Websites and practical automations for Australian tradies.',
  description: 'Websites and practical automations for Australian trade businesses.',
  cta: 'Book a free discovery call',
};

export const nav = [
  { href: '/services', label: 'What We Do' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

// Social profiles: add each full URL. An entry with an empty url is not shown.
export const socials: { name: 'Facebook' | 'Instagram' | 'LinkedIn' | 'TikTok' | 'YouTube'; url: string }[] = [
  { name: 'Facebook', url: '' },
  { name: 'Instagram', url: '' },
  { name: 'LinkedIn', url: '' },
  { name: 'TikTok', url: '' },
  { name: 'YouTube', url: '' },
];

export const trades = [
  'Electricians', 'Plumbers', 'Builders', 'Carpenters', 'Landscapers', 'Painters',
  'Roofers', 'Handymen', 'Tilers', 'Plasterers', 'Concreters', 'Fencers',
  'Bricklayers', 'Air conditioning techs', 'Solar installers', 'Glaziers',
];
