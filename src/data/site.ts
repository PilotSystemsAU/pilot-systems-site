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
export const socials: { name: 'Facebook' | 'Instagram' | 'LinkedIn' | 'TikTok' | 'YouTube' | 'X'; url: string }[] = [
  { name: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61594162504603' },
  { name: 'Instagram', url: 'https://www.instagram.com/pilot.systems/' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/declan-cawthorn-1180a9232/' },
  { name: 'TikTok', url: 'https://www.tiktok.com/@pilot.systems' },
  { name: 'YouTube', url: 'https://www.youtube.com/@PilotSystemsAU' },
  { name: 'X', url: 'https://x.com/PilotSystemsAU' },
];

export const trades = [
  'Electricians', 'Plumbers', 'Builders', 'Carpenters', 'Landscapers', 'Painters',
  'Roofers', 'Handymen', 'Tilers', 'Plasterers', 'Concreters', 'Fencers',
  'Bricklayers', 'Air conditioning techs', 'Solar installers', 'Glaziers',
];
