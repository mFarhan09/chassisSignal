export interface PricingEvidence {
 id: string;
 product: string;
 entitlement: string;
 usd: number | null;
 charge: 'one-time-unlock' | 'annual' | 'access-period' | 'quote-required';
 observed: string;
 market: string;
 includesAdapter: 'yes' | 'no' | 'varies';
 scope: string;
 source: string;
 warning: string;
}
export const evidenceReviewed = '2026-10-10';
export const pricingEvidence: PricingEvidence[] = [
 {id:'bimmercode-full-ios',product:'BimmerCode',entitlement:'Full Version (US iOS App Store)',usd:49.99,charge:'one-time-unlock',observed:evidenceReviewed,market:'US Apple App Store',includesAdapter:'no',scope:'In-app Full Version purchase; supported feature coding on eligible vehicles',source:'https://apps.apple.com/us/app/bimmercode/id1130787459',warning:'Not a universal cross-platform license; recheck store and supported vehicle before buying.'},
 {id:'bimmerlink-full-ios',product:'BimmerLink',entitlement:'Full Version (US iOS App Store)',usd:39.99,charge:'one-time-unlock',observed:evidenceReviewed,market:'US Apple App Store',includesAdapter:'no',scope:'Fault memories, live data and supported vehicle service functions',source:'https://apps.apple.com/us/app/bimmerlink/id1065360416',warning:'Not the BimmerCode license; app and supported adapter are separate.'},
 {id:'bimmerlink-carplay-ios',product:'BimmerLink',entitlement:'CarPlay Add-On (US iOS App Store)',usd:9.99,charge:'one-time-unlock',observed:evidenceReviewed,market:'US Apple App Store',includesAdapter:'no',scope:'Optional CarPlay capability in addition to supported app purchase',source:'https://apps.apple.com/us/app/bimmerlink/id1065360416',warning:'Optional add-on, not a substitute for the main app entitlement.'},
 {id:'protool-diagnostics',product:'ProTool',entitlement:'Diagnostics license',usd:99.99,charge:'one-time-unlock',observed:evidenceReviewed,market:'BimmerGeeks USD store',includesAdapter:'no',scope:'Documented diagnostic scope with battery/injector coding exceptions',source:'https://www.bimmergeeks.net/protool',warning:'Android-only app; vehicle and hardware support must be verified separately.'},
 {id:'protool-coding',product:'ProTool',entitlement:'Coding license',usd:99.99,charge:'one-time-unlock',observed:evidenceReviewed,market:'BimmerGeeks USD store',includesAdapter:'no',scope:'Documented coding scope; not same as full diagnostics entitlement',source:'https://www.bimmergeeks.net/protool',warning:'No universal coding coverage for older BMW chassis.'},
 {id:'protool-master',product:'ProTool',entitlement:'Master (diagnostics + coding)',usd:174.99,charge:'one-time-unlock',observed:evidenceReviewed,market:'BimmerGeeks USD store',includesAdapter:'no',scope:'Bundled coding and diagnostics licensing',source:'https://www.bimmergeeks.net/product-page/master-license',warning:'Adapter is not included; eligible Android device is required.'},
 {id:'carly-bmw-premium',product:'Carly',entitlement:'Premium subscription (exact BMW quote required)',usd:null,charge:'annual',observed:evidenceReviewed,market:'Varies by country, vehicle, channel',includesAdapter:'varies',scope:'Brand/vehicle-conditioned advanced feature access and renewal',source:'https://www.mycarly.com/pricing/',warning:'Do not use an advertised starting price as a universal current BMW checkout quote.'},
 {id:'bmw-tis-day',product:'BMW AOS/TIS',entitlement:'1-day North America subscription',usd:32,charge:'access-period',observed:evidenceReviewed,market:'North America BMW TIS portal',includesAdapter:'no',scope:'Access to eligible technical-information service content under subscription and account conditions',source:'https://bmwtechinfo.bmwgroup.com/tisUI/',warning:'North America portal only; programming requires additional interface, PC and qualified procedures.'},
 {id:'bmw-tis-month',product:'BMW AOS/TIS',entitlement:'1-month North America subscription',usd:270,charge:'access-period',observed:evidenceReviewed,market:'North America BMW TIS portal',includesAdapter:'no',scope:'Time-limited access, not a consumer scanner license',source:'https://bmwtechinfo.bmwgroup.com/tisUI/',warning:'Do not multiply by years as a renewal without knowing actual use.'},
 {id:'bmw-tis-year',product:'BMW AOS/TIS',entitlement:'1-year North America subscription',usd:2700,charge:'access-period',observed:evidenceReviewed,market:'North America BMW TIS portal',includesAdapter:'no',scope:'Time-limited regional technical access under portal conditions',source:'https://bmwtechinfo.bmwgroup.com/tisUI/',warning:'Requires separate eligibility and equipment; prices may change.'}
];
