import type { ProductRecord } from './types';

export const rolloutProductMetadata: Record<string, Partial<ProductRecord>> = {
  'icarsoft-bmm-v3': {
    manufacturerUrl: 'https://www.icarsoft-us.com/products/bmw-v3-0',
    editorialSummary: 'For the iCarsoft-versus-Foxwell decision, the BMM V3.0 is the brand-dedicated BMW/MINI/Rolls-Royce handheld; confirm the exact SKU and the specific BMW service functions for your VIN before purchase.',
    compatibilityNotes: 'Confirm the exact BMW/MINI, model year (pre-2001 needs the 20-pin adapter path) and the specific modules and service functions before purchase.'
  },
  'foxwell-nt530': {
    manufacturerUrl: 'https://www.foxwelldiag.com/products/foxwell-nt530',
    editorialSummary: 'Foxwell NT530 with the BMW software authorization is the multi-brand-plus-software side of the comparison; this listing is the NT530, not NT530 Plus. Confirm the exact SKU, installed BMW software and the specific function before purchase.',
    compatibilityNotes: 'Reaches BMW modules only with the BMW software authorization; coding-adjacent scope is SKU/software-revision specific and excludes ECU flash and full OEM-level programming. Confirm the exact unit and function.'
  },
  'unicarscan-ucsi-2100': {
    manufacturerUrl: 'https://www.wgsoft.de/',
    editorialSummary: 'UniCarScan UCSI-2100 is the OEM-protocol Bluetooth adapter compared against OBDLink CX for BimmerCode and BimmerLink; confirm current app support for the exact BMW before purchase.',
    compatibilityNotes: 'Confirm the exact BMW/MINI, phone platform and current BimmerCode/BimmerLink support before purchase.'
  },
  'obdlink-mx-plus': {
    manufacturerUrl: 'https://www.obdlink.com/products/obdlink-mxp/',
    compatibilityNotes: 'Confirm the exact vehicle, mobile platform, app and requested function before purchase.',
    imageMode: 'manufacturer_source',
    imagePathOrUrl: '/images/products/obdlink-mx-plus-official.jpg',
    imageRightsSource: 'https://www.obdlink.com/wp-content/uploads/2020/07/main_2024.jpg',
    imageRightsStatus: 'manufacturer_attributed_editorial',
    imageAttribution: 'Product image: OBDLink.',
    imageAlt: 'OBDLink MX+ Bluetooth diagnostic adapter',
    imageSha256: '83605CD089E4CE5D8159BE0725D3EB716FDEBEB1CA477B64A755BBED9C34C259'
  },
  'obdlink-lx': {
    manufacturerUrl: 'https://www.obdlink.com/products/obdlink-lx/',
    compatibilityNotes: 'Confirm the exact vehicle, Android or Windows platform, app and requested function before purchase.',
    imageMode: 'manufacturer_source',
    imagePathOrUrl: '/images/products/obdlink-lx-official.png',
    imageRightsSource: 'https://www.obdlink.com/wp-content/uploads/2013/09/lx_store.png',
    imageRightsStatus: 'manufacturer_attributed_editorial',
    imageAttribution: 'Product image: OBDLink.',
    imageAlt: 'OBDLink LX Bluetooth diagnostic adapter',
    imageSha256: '05BB6421A58A78A08C552A43BC843091BD810F8794C2C40FD035D36081339285'
  },
  'obdlink-ex': {
    manufacturerUrl: 'https://www.obdlink.com/products/obdlink-ex/',
    compatibilityNotes: 'FORScan and Ford-oriented; do not treat OBDLink EX as a BMW ENET interface.',
    imageMode: 'manufacturer_source',
    imagePathOrUrl: '/images/products/obdlink-ex-official.webp',
    imageRightsSource: 'https://www.obdlink.com/wp-content/uploads/2020/07/ex_store_image_sm.webp',
    imageRightsStatus: 'manufacturer_attributed_editorial',
    imageAttribution: 'Product image: OBDLink.',
    imageAlt: 'OBDLink EX USB FORScan adapter',
    imageSha256: '1966493F7B0C599DC339C8E647AF413889BF63446CA4B3CB075076EADEE58799'
  },
  'vlinker-bm-plus': {
    manufacturerUrl: 'https://www.vgatemall.com/products-detail/i-15/',
    compatibilityNotes: 'Confirm the BMW or MINI, app and phone platform; the supplied listing also includes an OBD splitter.',
    imageMode: 'manufacturer_source',
    imagePathOrUrl: '/images/products/vlinker-bm-plus-official.jpg',
    imageRightsSource: 'https://www.vgatemall.com/u_file/fileUpload/2022-11/09/2022110910486.jpg',
    imageRightsStatus: 'manufacturer_attributed_editorial',
    imageAttribution: 'Product image: Vgate.',
    imageAlt: 'Vgate vLinker BM+ Bluetooth adapter',
    imageSha256: '19EAD894CCA0CF2FA2118015ACE802C5586DD75DA5B21D75D349D449143BAA9C'
  },
  'vlinker-mc-plus': {
    manufacturerUrl: 'https://www.vgatemall.com/products-detail/i-5/',
    compatibilityNotes: 'Confirm the exact vehicle, app, phone platform and requested function before purchase.',
    imageMode: 'manufacturer_source',
    imagePathOrUrl: '/images/products/vlinker-mc-plus-official.jpg',
    imageRightsSource: 'https://www.vgatemall.com/u_file/fileUpload/2022-11/08/2022110829805.jpg',
    imageRightsStatus: 'manufacturer_attributed_editorial',
    imageAttribution: 'Product image: Vgate.',
    imageAlt: 'Vgate vLinker MC+ wireless OBD adapter',
    imageSha256: '8B33F0BB3A5A7233733617DFFDE9D7587669F00BE0EE6A69316CF815C2CA71C8'
  },
  'autel-mx808s': {
    manufacturerUrl: 'https://store.autel.com/products/autel-maxicheck-mx808',
    compatibilityNotes: 'This is MX808S, not MK808S. Confirm the exact BMW and function in Autel coverage.',
    imageMode: 'manufacturer_source',
    imagePathOrUrl: '/images/products/autel-mx808s-official.png',
    imageRightsSource: 'https://cdn.shopify.com/s/files/1/0502/1722/2337/files/MX808S-01.png?v=1700467537',
    imageRightsStatus: 'manufacturer_attributed_editorial',
    imageAttribution: 'Product image: Autel.',
    imageAlt: 'Autel MaxiCheck MX808S diagnostic tablet',
    imageSha256: 'A517B4D3A2365C665023863E4ED138737627FCFF2CB71DDDA06CAA872C0A6E66'
  },
  'autel-mk900-bt': {
    manufacturerUrl: 'https://store.autel.com/products/maxicom-mk900bt',
    compatibilityNotes: 'This is MK900-BT, not wired MK900. Confirm the exact BMW and function in Autel coverage.',
    imageMode: 'manufacturer_source',
    imagePathOrUrl: '/images/products/autel-mk900-bt-official.png',
    imageRightsSource: 'https://cdn.shopify.com/s/files/1/0502/1722/2337/files/MK900-BT_03_1.png?v=1732093424',
    imageRightsStatus: 'manufacturer_attributed_editorial',
    imageAttribution: 'Product image: Autel.',
    imageAlt: 'Autel MaxiCOM MK900-BT wireless diagnostic tablet',
    imageSha256: '604761A262470D5B7D5ACD2598CF822D6FBDACD621B4B66B3F23B53729F3E050'
  },
  'autel-mx900': {
    manufacturerUrl: 'https://store.autel.com/products/maxicheck-mx900',
    compatibilityNotes: 'Confirm the exact BMW, model year, market, system and function in Autel coverage.',
    imageMode: 'manufacturer_source',
    imagePathOrUrl: '/images/products/autel-mx900-official.png',
    imageRightsSource: 'https://cdn.shopify.com/s/files/1/0502/1722/2337/files/MX900-01.png?v=1700740055',
    imageRightsStatus: 'manufacturer_attributed_editorial',
    imageAttribution: 'Product image: Autel.',
    imageAlt: 'Autel MaxiCheck MX900 diagnostic tablet',
    imageSha256: '2567B90D599CBF6B3B5CBC04C5D38D6A8E38E3DA4495DB973C4B7267AF4F072A'
  },
  'autel-mx808s-ts': {
    manufacturerUrl: 'https://store.autel.com/products/maxicheck-mx808s-ts',
    compatibilityNotes: 'This is MX808S-TS, not MK808S-TS. Confirm vehicle and function coverage.',
    imageMode: 'manufacturer_source',
    imagePathOrUrl: '/images/products/autel-mx808s-ts-official.webp',
    imageRightsSource: 'https://cdn.shopify.com/s/files/1/0502/1722/2337/files/MX808S-TS-01.webp?v=1756181128',
    imageRightsStatus: 'manufacturer_attributed_editorial',
    imageAttribution: 'Product image: Autel.',
    imageAlt: 'Autel MaxiCheck MX808S-TS diagnostic and TPMS tablet',
    imageSha256: '3936D25CE3AFDDB13F6C023CFAE78BD9639DCBDF6CDBE1619404657C82D62666'
  },
  'autel-md909-pro': {
    manufacturerUrl: 'https://store.autel.com/products/maxidiag-md909-pro',
    compatibilityNotes: 'Service functions vary; confirm the exact BMW, engine, year and market in Autel coverage.',
    imageMode: 'manufacturer_source',
    imagePathOrUrl: '/images/products/autel-md909-pro-official.webp',
    imageRightsSource: 'https://cdn.shopify.com/s/files/1/0502/1722/2337/files/MD909_Pro-1.webp?v=1759990593',
    imageRightsStatus: 'manufacturer_attributed_editorial',
    imageAttribution: 'Product image: Autel.',
    imageAlt: 'Autel MaxiDiag MD909 Pro diagnostic scanner',
    imageSha256: '44AB64D374398DF68B8369BC77F75D02FE046A7656CB4B31B94F09B3B162C0D3'
  },
  'fluke-88v': {
    manufacturerUrl: 'https://www.fluke.com/en-us/product/electrical-testing/digital-multimeters/fluke-88v-a-kit',
    compatibilityNotes: 'Follow safe meter setup and the vehicle-specific electrical diagnostic procedure.',
    imageMode: 'manufacturer_source',
    imagePathOrUrl: '/images/products/fluke-88v-kit-official.jpg',
    imageRightsSource: 'https://media.fluke.com/e61fff20-72b2-4d46-882c-b108006a5364_original__size.jpg',
    imageRightsStatus: 'manufacturer_attributed_editorial',
    imageAttribution: 'Product image: Fluke.',
    imageAlt: 'Fluke 88V/A automotive multimeter combo kit',
    imageSha256: '597324CC7F916526ECEF3CC6BA44F77B53B716E239B124B76543F28095DAC405'
  },
  'launch-crp919e-bt': {
    manufacturerUrl: 'https://en.cnlaunch.com/products-detail/i-245.html',
    compatibilityNotes: 'This is CRP919E BT, not CRP919 MAX. Confirm BMW and function availability.',
    imageMode: 'manufacturer_source',
    imagePathOrUrl: '/images/products/launch-crp919e-bt-official.png',
    imageRightsSource: 'https://en.cnlaunch.com/tmp/thumbnail/e6311b1ae574936d5bd18a4302b8de90.580x580.0.png',
    imageRightsStatus: 'manufacturer_attributed_editorial',
    imageAttribution: 'Product image: LAUNCH.',
    imageAlt: 'LAUNCH X-431 CRP919E BT diagnostic tablet',
    imageSha256: 'A4138C70E3C20283462B3D20797AE304F9B464FC81407846B8263510018E2B74'
  },
  'schumacher-inc100': {
    manufacturerUrl: 'https://www.schumacherelectric.com/products/100a-flash-reprogrammer-power-supply-with-battery-support/',
    compatibilityNotes: 'Supporting power equipment only; use within manufacturer limits and the vehicle procedure.',
    imageMode: 'manufacturer_source',
    imagePathOrUrl: '/images/products/schumacher-inc100-official.webp',
    imageRightsSource: 'https://cdn.schumacherelectric.com/wp-content/uploads/2021/07/INC100_US_Can_image__14240.1630477954.1280.1280.webp',
    imageRightsStatus: 'manufacturer_attributed_editorial',
    imageAttribution: 'Product image: Schumacher Electric.',
    imageAlt: 'Schumacher INC100 flash reprogrammer power supply',
    imageSha256: '61D39794D9472AA9ACDDAEFE213DE9732CDC71B8ABF6907F87A45772BC59453D'
  },
  'autel-ds808s-bt': {
    manufacturerUrl: 'https://store.autel.com/products/maxidas-ds808s-bt',
    compatibilityNotes: 'This is DS808S-BT, not wired DS808S. Confirm BMW and function coverage.',
    imageMode: 'manufacturer_source',
    imagePathOrUrl: '/images/products/autel-ds808s-bt-official.png',
    imageRightsSource: 'https://cdn.shopify.com/s/files/1/0502/1722/2337/files/DS808S-BT-1_563383d0-d054-43bf-9a02-771b111bd2df.png?v=1703493137',
    imageRightsStatus: 'manufacturer_attributed_editorial',
    imageAttribution: 'Product image: Autel.',
    imageAlt: 'Autel MaxiDAS DS808S-BT wireless diagnostic tablet',
    imageSha256: '180B82AFB340B6862446E1C6F1BD81511757280F93677867324D26F6DABEC005'
  },
  'autel-maxisys-ultra': {
    manufacturerUrl: 'https://store.autel.com/products/autel-maxisys-ultra',
    compatibilityNotes: 'This is standard MaxiSYS Ultra, not Ultra S2. Confirm BMW, market, module and function.',
    imageMode: 'manufacturer_source',
    imagePathOrUrl: '/images/products/autel-maxisys-ultra-official.webp',
    imageRightsSource: 'https://cdn.shopify.com/s/files/1/0502/1722/2337/files/MS_ULTRA.webp?v=1756108736',
    imageRightsStatus: 'manufacturer_attributed_editorial',
    imageAttribution: 'Product image: Autel.',
    imageAlt: 'Autel MaxiSYS Ultra workshop diagnostic platform',
    imageSha256: '0C4AFA7B85BBF5E301B4EF250C04810D2FA8602586D2533EA462A653FDC4D002'
  },
  'autophix-7910p-plus': {
    manufacturerUrl: 'https://www.autophix.com/product/7910',
    compatibilityNotes: 'The exact 7910P+ lacks a current first-party page; verify BMW, function and listing contents.',
    imageMode: 'site_owned',
    imagePathOrUrl: '/images/products/autophix-7910p-plus-category.svg',
    imageRightsSource: '/images/products/autophix-7910p-plus-category.svg',
    imageRightsStatus: 'site_owned',
    imageAttribution: 'Category illustration by Chassis Signal.',
    imageAlt: 'Brand-neutral BMW diagnostic scanner category illustration',
    imageSha256: 'AE785E1F9AC278565D1D83D488A0BB635BCFE5CEA72DA30ADB91B2031A4383EC'
  },
  'creator-c310-plus': {
    manufacturerUrl: 'https://forobd2tool.com/wp-content/download/Creator%20C310%2B/c310_manual.pdf',
    compatibilityNotes: 'No current first-party Creator page was found; confirm vehicle and function coverage.',
    imageMode: 'site_owned',
    imagePathOrUrl: '/images/products/creator-c310-plus-category.svg',
    imageRightsSource: '/images/products/creator-c310-plus-category.svg',
    imageRightsStatus: 'site_owned',
    imageAttribution: 'Category illustration by Chassis Signal.',
    imageAlt: 'Brand-neutral compact BMW scanner category illustration',
    imageSha256: 'ACC7BFF56D53F92020432EC1631873909E2F7A45F521FB7147AAC7BB3053AB88'
  },
  'innova-5610-bundle': {
    manufacturerUrl: 'https://www.innova.com/collections/innova-obd2-scanners/products/carscan-pro-5610',
    compatibilityNotes: 'The listing bundles 5610 and 3380; confirm bundle contents and BMW feature coverage.',
    imageMode: 'site_owned',
    imagePathOrUrl: '/images/products/innova-5610-bundle-category.svg',
    imageRightsSource: '/images/products/innova-5610-bundle-category.svg',
    imageRightsStatus: 'site_owned',
    imageAttribution: 'Category illustration by Chassis Signal.',
    imageAlt: 'Brand-neutral scanner and inspection camera bundle illustration',
    imageSha256: '75DB030904C06244F636C801E065D684DD3DAD3F348FC0211626EC5FFBAEE346'
  },
  'launch-creader-elite-bmw-v2': {
    manufacturerUrl: 'https://en.cnlaunch.com/products-detail/i-281.html',
    compatibilityNotes: 'Confirm BMW software selection, exact vehicle and requested function.',
    imageMode: 'manufacturer_source',
    imagePathOrUrl: '/images/products/launch-creader-elite-v2-official.png',
    imageRightsSource: 'https://en.cnlaunch.com/tmp/thumbnail/471dd1b53e02f1185515d4dd9fdc7bea.580x580.0.png',
    imageRightsStatus: 'manufacturer_attributed_editorial',
    imageAttribution: 'Product image: LAUNCH.',
    imageAlt: 'LAUNCH Creader Elite V2.0 diagnostic scanner',
    imageSha256: 'C64EA17432D1D3C8AB12205EA08C4F5A0D58E056CB21E687ABDA67515449A41B'
  },
  'launch-x431-pro3s-plus': {
    manufacturerUrl: 'https://en.cnlaunch.com/products-detail/i-314.html',
    compatibilityNotes: 'Confirm hardware generation, BMW, market, module and function in LAUNCH coverage.',
    imageMode: 'manufacturer_source',
    imagePathOrUrl: '/images/products/launch-x431-pro3s-plus-official.png',
    imageRightsSource: 'https://en.cnlaunch.com/tmp/thumbnail/24808de824a0dd09ac1964c583c60406.580x580.0.png',
    imageRightsStatus: 'manufacturer_attributed_editorial',
    imageAttribution: 'Product image: LAUNCH.',
    imageAlt: 'LAUNCH X-431 PRO3S+ workshop diagnostic tablet',
    imageSha256: '6D4354D9376EF72CDCFCAC01026E91BFFCDD3F681D7D91F5CB6BDB68E7A9D082'
  },
  'ancel-ds500bt': {
    manufacturerUrl: 'https://www.ancel.com/blogs/news/ancel-february-2026-scanner-update-new-versions-features',
    compatibilityNotes: 'No exact first-party product page was found; confirm model, BMW coverage and function.',
    imageMode: 'site_owned',
    imagePathOrUrl: '/images/products/ancel-ds500bt-category.svg',
    imageRightsSource: '/images/products/ancel-ds500bt-category.svg',
    imageRightsStatus: 'site_owned',
    imageAttribution: 'Category illustration by Chassis Signal.',
    imageAlt: 'Brand-neutral wireless diagnostic tablet category illustration',
    imageSha256: 'D5B35EE0FBEED732B2D8ABB062249EE056D46D0EADCAE4CA6B505F8278D7BB92'
  },
};
