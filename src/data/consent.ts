// Marketing consent wording. One source for what people see and what gets recorded.
//
// The exact wording someone saw is part of the consent record, so if you change any
// of this text, also change CONSENT_VERSION (use the date it goes live). The version
// is stored with each subscriber in MailerLite and shown in enquiry alerts.
//
// Rules this wording follows (Spam Act 2003 and the ACMA's guidance):
// - marketing consent is always a separate, optional, unticked choice;
// - it says what people will get, how often, and how to stop;
// - TradeTrust-type news is named here, at the point of consent, not in the Terms.

export const CONSENT_VERSION = '2026-10-12';

// Optional box on the enquiry form (unticked by default)
export const enquiryOptIn = {
  label: "Send me the free Tradie Follow-Up Kit and Pilot Systems' monthly email for tradies",
  hint: "You'll get the kit by email, two short tips over the next week, then one email a month. It may include news about other projects for tradies from Pilot Systems' founder. Unsubscribe any time with one click in any email.",
};

// Required box on the enquiry form. Agreeing to the Terms of Use is not marketing consent.
export const termsAgreement = {
  label: 'I agree to the',
  linkText: 'Terms of Use',
  error: 'Please tick the box to agree to the Terms of Use.',
};

// Statement above the button on the /kit signup form. Pressing the button is the consent.
export const kitFormConsent =
  "You'll get the kit straight away, two short tips by email over the next week, then Pilot Systems' monthly email for tradies. It may include news about other projects for tradies from Pilot Systems' founder. Unsubscribe any time with one click in any email.";

// The free resource
export const kit = {
  name: 'The Tradie Follow-Up Kit',
  tagline: 'A 15-minute enquiry check and 10 messages you can copy today',
  pdf: '/downloads/tradie-follow-up-kit.pdf',
};
