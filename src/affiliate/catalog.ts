export interface ProductCandidateDefinition {
  productKey: string;
  brand: string;
  model: string;
  category: string;
  aliases: string[];
}

export const productCandidateCatalog: ProductCandidateDefinition[] = [
  ['obdlink-cx', 'OBDLink', 'CX', 'Bluetooth OBD adapter', ['OBDLink CX']],
  ['obdlink-mx-plus', 'OBDLink', 'MX+', 'Bluetooth OBD adapter', ['OBDLink MX+', 'OBDLink MX Plus']],
  ['obdlink-lx', 'OBDLink', 'LX', 'Bluetooth OBD adapter', ['OBDLink LX']],
  ['obdlink-ex', 'OBDLink', 'EX', 'USB OBD adapter', ['OBDLink EX']],
  ['vlinker-bm-plus', 'Vgate', 'vLinker BM+', 'Bluetooth OBD adapter', ['vLinker BM+', 'Vgate vLinker BM+']],
  ['vlinker-mc-plus', 'Vgate', 'vLinker MC+', 'Wireless OBD adapter', ['vLinker MC+', 'Vgate vLinker MC+']],
  ['foxwell-nt530', 'Foxwell', 'NT530', 'BMW diagnostic scanner', ['Foxwell NT530']],
  ['foxwell-nt530-plus', 'Foxwell', 'NT530 Plus', 'BMW diagnostic scanner', ['Foxwell NT530 Plus']],
  ['icarsoft-bmm-v3', 'iCarsoft', 'BMM V3.0', 'BMW diagnostic scanner', ['iCarsoft BMM V3.0', 'iCarsoft BMM V3']],
  ['unicarscan-ucsi-2100', 'UniCarScan', 'UCSI-2100', 'Bluetooth OBD adapter', ['UniCarScan UCSI-2100', 'UniCarScan']],
  ['foxwell-nt710', 'Foxwell', 'NT710', 'BMW diagnostic scanner', ['Foxwell NT710']],
  ['autophix-7910', 'AUTOPHIX', '7910', 'BMW diagnostic scanner', ['AUTOPHIX 7910', 'Autophix 7910']],
  ['autel-mk808s', 'Autel', 'MK808S', 'Diagnostic tablet', ['Autel MK808S']],
  ['autel-mk808s-ts', 'Autel', 'MK808S-TS', 'TPMS diagnostic tablet', ['Autel MK808S-TS']],
  ['autel-mk900', 'Autel', 'MaxiCOM MK900', 'Diagnostic tablet', ['Autel MK900', 'Autel MaxiCOM MK900', 'MaxiCOM MK900']],
  ['autel-mx900', 'Autel', 'MaxiCheck MX900', 'Diagnostic tablet', ['Autel MX900', 'Autel MaxiCheck MX900', 'MaxiCheck MX900']],
  ['ancel-bm700-pro', 'ANCEL', 'BM700 Pro', 'BMW diagnostic scanner', ['ANCEL BM700 Pro']],
  ['autel-ds808s', 'Autel', 'DS808S', 'Diagnostic tablet', ['Autel DS808S']],
  ['autel-maxisys-ultra-s2', 'Autel', 'MaxiSys Ultra S2', 'Workshop diagnostic tablet', ['Autel MaxiSys Ultra S2']],
  ['creator-c310-plus', 'Creator', 'C310+', 'BMW diagnostic scanner', ['Creator C310+']],
  ['carly-universal-scanner', 'Carly', 'Universal Scanner', 'Bluetooth OBD adapter', ['Carly Universal Scanner']],
  ['innova-5610', 'Innova', '5610', 'Diagnostic scanner', ['Innova 5610']],
  ['bimmergeeks-bluetooth-adapter', 'BimmerGeeks', 'Bluetooth Adapter', 'Bluetooth OBD adapter', ['BimmerGeeks Bluetooth Adapter']],
  ['bimmergeeks-expert-k-dcan', 'BimmerGeeks', 'Expert K+DCAN', 'USB diagnostic cable', ['BimmerGeeks Expert K+DCAN']],
  ['bmw-icom-next', 'BMW', 'ICOM Next', 'Workshop diagnostic interface', ['BMW ICOM Next']],
  ['k-dcan-cable', 'Generic', 'K+DCAN cable', 'USB diagnostic cable', ['K+DCAN cable', 'K DCAN cable']],
  ['bmw-enet-cable', 'Generic', 'BMW ENET cable', 'Ethernet diagnostic cable', ['BMW ENET Cable', 'ENET cable']],
  ['launch-creader-elite-bmw', 'LAUNCH', 'Creader Elite BMW', 'BMW diagnostic scanner', ['LAUNCH Creader Elite BMW']],
  ['launch-creader-elite-x', 'LAUNCH', 'Creader Elite X', 'Diagnostic scanner', ['LAUNCH Creader Elite X']],
  ['launch-x431-throttle-v', 'LAUNCH', 'X-431 Throttle V', 'Workshop diagnostic tablet', ['LAUNCH X-431 Throttle V', 'Launch X-431 Throttle V']],
  ['launch-x431-torque-link', 'LAUNCH', 'X-431 Torque Link', 'Vehicle communication interface', ['LAUNCH X-431 Torque Link']],
  ['launch-smartlink-c', 'LAUNCH', 'SmartLink C', 'Vehicle communication interface', ['SmartLink C']],
  ['autel-vcmi-2', 'Autel', 'VCMI 2', 'Vehicle communication interface', ['VCMI 2']],
  ['autel-md909-pro', 'Autel', 'MaxiDiag MD909 Pro', 'Diagnostic scanner', ['Autel MD909 Pro', 'MaxiDiag MD909 Pro']],
  ['fluke-88v', 'Fluke', '88V Deluxe Automotive Multimeter', 'Automotive multimeter', ['Fluke 88V', '88V Deluxe Automotive Multimeter']],
  ['autel-mx808s', 'Autel', 'MaxiCheck MX808S', 'Diagnostic tablet', ['Autel MaxiCheck MX808S', 'Autel MX808S']],
  ['autel-mx808s-ts', 'Autel', 'MaxiCheck MX808S-TS', 'TPMS diagnostic tablet', ['Autel MaxiCheck MX808S-TS', 'Autel MX808S-TS']],
  ['autel-mk900-bt', 'Autel', 'MaxiCOM MK900-BT', 'Wireless diagnostic tablet', ['Autel MaxiCOM MK900-BT', 'Autel MK900-BT']],
  ['autel-ds808s-bt', 'Autel', 'MaxiDAS DS808S-BT', 'Wireless diagnostic tablet', ['Autel MaxiDAS DS808S-BT', 'Autel DS808S-BT']],
  ['autel-maxisys-ultra', 'Autel', 'MaxiSYS Ultra', 'Workshop diagnostic platform', ['Autel MaxiSYS Ultra']],
  ['autophix-7910p-plus', 'AUTOPHIX', '7910P+', 'BMW diagnostic scanner', ['AUTOPHIX 7910P+', 'Autophix 7910P+']],
  ['launch-crp919e-bt', 'LAUNCH', 'X-431 CRP919E BT', 'Wireless diagnostic tablet', ['LAUNCH CRP919E BT', 'LAUNCH X-431 CRP919E BT']],
  ['launch-x431-pro3s-plus', 'LAUNCH', 'X-431 PRO3S+', 'Workshop diagnostic tablet', ['LAUNCH X-431 PRO3S+', 'LAUNCH PRO3S+']],
  ['launch-creader-elite-bmw-v2', 'LAUNCH', 'Creader Elite V2.0 for BMW', 'BMW diagnostic scanner', ['LAUNCH Creader Elite V2.0 for BMW']],
  ['innova-5610-bundle', 'Innova', '5610 + 3380 bundle', 'Diagnostic scanner and borescope bundle', ['Innova 5610 bundle']],
  ['ancel-ds500bt', 'ANCEL', 'DS500BT', 'Wireless diagnostic tablet', ['ANCEL DS500BT']],
  ['mhd-universal-wifi-adapter', 'MHD Tuning', 'Universal Wi-Fi Adapter', 'Wireless BMW diagnostic adapter', ['MHD Universal Wi-Fi Adapter', 'MHD Universal WIFI Adapter']],
  ['launch-crp919-max', 'LAUNCH', 'CRP 919 MAX', 'Diagnostic tablet', ['LAUNCH CRP 919 MAX', 'CRP 919 MAX', 'CRP-919 MAX']],
  ['schumacher-inc100', 'Schumacher Electric', 'INC100', 'Programming power supply', ['Schumacher INC100', 'INC100']]
].map(([productKey, brand, model, category, aliases]) => ({ productKey, brand, model, category, aliases })) as ProductCandidateDefinition[];

function normalize(value: string): string {
  return value.toLowerCase().replace(/[™®]/g, '').replace(/[‐‑–—]/g, '-').replace(/\s+/g, ' ').trim();
}

export function detectProductKeys(text: string): string[] {
  const haystack = normalize(text);
  return productCandidateCatalog
    .filter((candidate) => candidate.aliases.some((alias) => haystack.includes(normalize(alias))))
    .map((candidate) => candidate.productKey);
}

export function candidateByKey(productKey: string): ProductCandidateDefinition | undefined {
  return productCandidateCatalog.find((candidate) => candidate.productKey === productKey);
}
