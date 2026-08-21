export const primaryNav = [
  { label: 'Scanners', href: '/scanners/' },
  { label: 'Coding adapters', href: '/coding-adapters/' },
  { label: 'Software', href: '/software/' },
  { label: 'Comparisons', href: '/comparisons/' },
  { label: 'Compatibility', href: '/compatibility/' },
  { label: 'Research', href: '/research/' }
] as const;

export const categories = [
  { index: '01', title: 'Diagnostic scanners', href: '/scanners/', copy: 'BMW-focused handheld and advanced scanner research.', tone: 'light' },
  { index: '02', title: 'Coding adapters', href: '/coding-adapters/', copy: 'BLE, Wi-Fi and ENET interfaces, explained by ecosystem.', tone: 'dark' },
  { index: '03', title: 'Software & apps', href: '/software/', copy: 'Capabilities, ownership models and documented compatibility.', tone: 'image' },
  { index: '04', title: 'Compatibility', href: '/compatibility/', copy: 'Chassis, protocol, software and adapter relationships.', tone: 'line' },
  { index: '05', title: 'Battery & service', href: '/battery-service-tools/', copy: 'Registration, reset and service-function research.', tone: 'light' },
  { index: '06', title: 'Comparisons', href: '/comparisons/', copy: 'Direct, evidence-aware tool and app comparisons.', tone: 'dark' }
] as const;

export type Hub = {
  slug: string;
  eyebrow: string;
  title: string;
  intro: string;
  focus: string[];
  note: string;
};

export const hubs: Hub[] = [
  { slug: 'scanners', eyebrow: 'Research hub / 01', title: 'Diagnostic scanners', intro: 'Research into handheld, app-connected and workshop-grade scanners for BMW and MINI owners—without reducing compatibility to a single badge.', focus: ['Diagnostic depth', 'Service functions', 'Ownership cost', 'Chassis coverage'], note: 'Scanner functions can vary by chassis, model year, software release and regional specification.' },
  { slug: 'coding-adapters', eyebrow: 'Research hub / 02', title: 'Coding adapters', intro: 'A structured look at BLE, Wi-Fi and ENET interfaces used by BMW and MINI coding and diagnostic apps.', focus: ['Connection method', 'App support', 'Platform support', 'Generation fit'], note: 'An adapter can be electrically compatible while remaining unsupported by a specific app.' },
  { slug: 'software', eyebrow: 'Research hub / 03', title: 'Software & apps', intro: 'Independent explainers for owner-facing coding, diagnostics and service software, with careful separation between documented and reported capabilities.', focus: ['App purpose', 'Supported platforms', 'Licensing', 'Adapter ecosystem'], note: 'App behavior and compatibility can change with software releases; verify current vendor documentation.' },
  { slug: 'comparisons', eyebrow: 'Research hub / 04', title: 'Comparisons', intro: 'Calm, factual comparisons built around ownership model, connection type, documented functions and compatibility—not unsupported scores.', focus: ['Like-for-like scope', 'Documented differences', 'Evidence gaps', 'Decision context'], note: '“Best” only makes sense after the vehicle, intended task and tolerance for subscriptions are known.' },
  { slug: 'compatibility', eyebrow: 'Research hub / 05', title: 'Compatibility index', intro: 'A developing map of the relationships between BMW and MINI chassis generations, protocols, adapters, apps and scanners.', focus: ['E-Series', 'F-Series', 'G-Series', 'MINI'], note: 'Compatibility is a chain. Vehicle, interface, software and intended function all need to align.' },
  { slug: 'battery-service-tools', eyebrow: 'Research hub / 06', title: 'Battery & service tools', intro: 'Research into battery registration, service resets and adjacent maintenance functions with safety and evidence labels kept visible.', focus: ['Battery registration', 'Service resets', 'System coverage', 'Procedure risk'], note: 'Battery registration is not the same as battery coding. Follow vehicle-specific service information.' },
  { slug: 'research', eyebrow: 'Publication index', title: 'All research', intro: 'Guides, comparisons and compatibility notes in one evidence-aware editorial index.', focus: ['Buyer guides', 'Explainers', 'Comparisons', 'Compatibility'], note: 'Early-stage research is clearly labelled when primary evidence remains incomplete.' }
];

export const editorialPages = [
  {
    slug: 'about', eyebrow: 'About the publication', title: 'Independent by design.', intro: 'Chassis Index is a specialist publication for BMW and MINI owners navigating diagnostic scanners, coding adapters, software and compatibility.', sections: [
      ['What we research', 'We organize primary documentation, manufacturer material, app compatibility information and carefully qualified community evidence into readable owner-focused research.'],
      ['What we do not claim', 'We do not imply hands-on testing where none has occurred, invent credentials, manufacture compatibility conclusions or present marketing claims as independent findings.'],
      ['Why compatibility matters', 'A tool name alone rarely answers the real question. Chassis generation, model year, protocol, adapter, app version and intended function can all change the result.'],
      ['Editorial philosophy', 'Useful research should make uncertainty visible. We prefer a defensible “needs verification” label to a confident but unsupported answer.']
    ]
  },
  {
    slug: 'methodology', eyebrow: 'Research system / v1.0', title: 'How Chassis Index researches.', intro: 'A transparent workflow for separating documentation, claims, owner reports and verified observations.', sections: [
      ['01 — Define the question', 'We begin with a specific owner decision: vehicle generation, intended task, tool category and practical constraints.'],
      ['02 — Build the source set', 'Primary technical documentation and current app compatibility material take priority. Manufacturer product pages are treated as claims until corroborated.'],
      ['03 — Map compatibility', 'We compare the vehicle, protocol, interface, platform, software and function as a connected system. Unknowns remain unknown.'],
      ['04 — Qualify community evidence', 'Repeated owner reports can reveal patterns and edge cases, but they are not presented as universal truth.'],
      ['05 — Fact-check and publish', 'Language, dates, evidence labels, safety implications and conflicts are reviewed before publication.'],
      ['06 — Update when evidence changes', 'Software, documentation and product lineups move. Material changes receive an updated date and corrections are recorded.']
    ]
  },
  {
    slug: 'editorial-standards', eyebrow: 'Editorial & safety', title: 'Accuracy before certainty.', intro: 'Our standards are designed for a subject where an overconfident answer can waste money—or damage a vehicle.', sections: [
      ['Evidence language', '“Documented” means traceable to current official documentation. “Manufacturer claim” identifies a first-party product claim. “Community reported” describes a pattern that may not be universal.'],
      ['No fabricated testing', 'We do not invent test fleets, screenshots, reliability scores, awards, diagnostic readings or hands-on conclusions. Hands-on labels require retained project evidence.'],
      ['Compatibility discipline', 'We avoid collapsing model year, chassis, protocol and app support into a single generic “works with BMW” claim.'],
      ['Safety classification', 'High-risk topics include flashing, module recovery, SRS, ABS, coding and electrical procedures. These require stronger sources, prerequisites and visible cautions.'],
      ['When to seek professional help', 'Stop when a procedure could immobilize the vehicle, affect safety systems or exceeds the available evidence and recovery plan.']
    ]
  },
  {
    slug: 'affiliate-disclosure', eyebrow: 'Transparency', title: 'Editorial judgment is not for sale.', intro: 'Chassis Index may eventually earn a commission when a reader purchases through certain clearly identified links.', sections: [
      ['Current status', 'No specific affiliate relationship is represented by this launch version. Links without an affiliate destination remain ordinary research links.'],
      ['Editorial separation', 'Commercial relationships should not determine conclusions, evidence labels or the inclusion of relevant limitations.'],
      ['Link treatment', 'Affiliate links, when introduced, will be identified and use appropriate sponsored and security attributes. Prices and availability should be verified at the destination.']
    ]
  },
  {
    slug: 'privacy', eyebrow: 'Legal / launch policy', title: 'Privacy, in plain language.', intro: 'This launch-ready policy explains the data the publication is designed to use. Business-specific details remain clearly marked for completion.', sections: [
      ['Site delivery', 'Hosting providers may process standard request information such as IP address, browser type and timestamps to deliver and secure the site.'],
      ['Analytics', 'Analytics are disabled unless a valid environment configuration is supplied. If enabled later, this policy should be updated with provider, retention and consent details.'],
      ['Contact information', 'Information voluntarily sent for corrections or enquiries should be used only to respond, maintain editorial records and meet legal obligations.'],
      ['Cookies', 'The static launch site does not require advertising or authentication cookies. Future optional services must be disclosed before activation.'],
      ['Details to complete before launch', '[Business operator name, jurisdiction, contact email and effective date must be added before collecting personal data.]']
    ]
  }
] as const;
