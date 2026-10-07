// FAQ answers shared across pages, so each answer is written once.
const all = {
  own: { q: 'Do I own my website?', a: "Yes. Your domain, content and accounts are in your name. We host your site as part of Website Care, and if you ever want to leave, we'll move it to your own account." },
  howLong: { q: 'How long does it take?', a: 'Pilot Presence is built in 5 business days once we have your content and access. Most projects go from first call to launch in 2–4 weeks. Your proposal gives you a date.' },
  provide: { q: 'What do I need to provide?', a: "About 45 minutes for an interview about your business. We write the words from that, and you check the facts. We'll also need your logo, any photos you have, and access to your domain." },
  guarantee: { q: 'Do you guarantee more jobs or Google rankings?', a: "No one can honestly promise that, so we won't. What we can do is everything that's in your control: a fast website Google can easily understand, pages built around the services and suburbs you want more work in, and systems that make sure every enquiry gets a reply, even when you're on the tools. Ranking higher only pays off if you catch the people who call. That's the part we make sure you don't miss." },
  payments: { q: 'How do payments work?', a: "A deposit to book, then the rest in stages. You never pay the final amount until you've approved the site and it's ready to go live." },
  software: { q: 'Do I have to change my job software?', a: "No. We start with what you already use, and set up features you're paying for but may not be using." },
  other: { q: "What if I need something that isn't listed?", a: "Ask us. If we can do it well, we'll quote it. If we can't, we'll tell you." },
  phone: { q: 'Will missed-call text-back work with my phone?', a: 'It works with most Australian mobile plans that allow call forwarding. We check your carrier, plan and phone during the discovery call, before you pay anything.' },
  spam: { q: 'Will my customers get spammed?', a: 'No. You approve every message, and we set clear rules for when messages send and when they stop. For example, quote follow-ups stop as soon as the customer replies.' },
  founding: { q: 'Why are these "founding rates"?', a: "We're a new business. These rates are for our first 5 projects while we build our portfolio. In return, we ask for a short feedback call 30 days after launch." },
  upfront: { q: 'Do I have to pay everything upfront?', a: "No. A deposit books your project, and the rest is paid in stages. The final payment is only due once you've approved the site for launch." },
  careCompulsory: { q: 'Is Website Care compulsory?', a: "Hosting is included in Website Care, so you need it while we host your site. If you'd rather host it yourself, we'll move it to your own account." },
  gst: { q: 'Do you charge GST?', a: "No. Pilot Systems isn't registered for GST, so no GST is added." },
};

export const homeFaqs = [all.own, all.howLong, all.provide, all.guarantee, all.payments, all.software, all.other];
export const servicesFaqs = [all.software, all.guarantee, all.other, all.phone, all.spam];
export const pricingFaqs = [all.founding, all.upfront, all.careCompulsory, all.gst];
