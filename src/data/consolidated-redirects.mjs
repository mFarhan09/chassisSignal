// Forensic merge-source-to-canonical dispositions from the Chassis October 4 forensic audit.
// Keep in sync with public/_redirects; every former URL must get a real HTTP 301.
export const consolidatedRedirects = {
  "bimmercode-vs-carly": "/tools/bmw-diagnostic-software-comparison/",
  "bimmercode-vs-foxwell-nt530": "/tools/bmw-diagnostic-software-comparison/",
  "bimmercode-vs-protool": "/tools/bmw-diagnostic-software-comparison/",
  "bimmerlink-vs-bimmer-tool": "/tools/bmw-diagnostic-software-comparison/",
  "bimmerlink-vs-carly": "/tools/bmw-diagnostic-software-comparison/",
  "bimmerlink-vs-foxwell-nt530": "/tools/bmw-diagnostic-software-comparison/",
  "bimmerlink-vs-protool": "/tools/bmw-diagnostic-software-comparison/",
  "ista-vs-bimmerlink": "/tools/bmw-diagnostic-software-comparison/",
  "protool-vs-carly": "/tools/bmw-diagnostic-software-comparison/",
  "protool-vs-ista": "/tools/bmw-diagnostic-software-comparison/",
  "obdlink-cx-vs-lx": "/tools/bmw-obd-adapter-comparison/",
  "obdlink-cx-vs-mx-plus": "/tools/bmw-obd-adapter-comparison/",
  "obdlink-cx-vs-unicarscan-ucsi-2100": "/tools/bmw-obd-adapter-comparison/",
  "obdlink-cx-vs-vlinker-bm-plus": "/tools/bmw-obd-adapter-comparison/",
  "obdlink-cx-vs-vlinker-mc-plus": "/tools/bmw-obd-adapter-comparison/",
  "obdlink-ex-vs-enet-cable": "/tools/bmw-obd-adapter-comparison/",
  "obdlink-mx-plus-vs-lx": "/tools/bmw-obd-adapter-comparison/",
  "obdlink-mx-plus-vs-vlinker-bm-plus": "/tools/bmw-obd-adapter-comparison/",
  "vlinker-bm-plus-vs-mc-plus": "/tools/bmw-obd-adapter-comparison/",
  "autophix-7910-vs-foxwell-nt530": "/tools/bmw-scanner-capability-database/",
  "bmw-code-reader-vs-scan-tool": "/tools/bmw-scanner-capability-database/",
  "creator-c310-plus-vs-foxwell-nt530": "/tools/bmw-scanner-capability-database/",
  "foxwell-nt530-vs-autel-mk808s-bmw": "/tools/bmw-scanner-capability-database/",
  "foxwell-nt530-vs-nt710": "/tools/bmw-scanner-capability-database/",
  "icarsoft-bmm-v3-vs-foxwell-nt530": "/tools/bmw-scanner-capability-database/",
  "launch-x431-vs-autel-for-bmw": "/tools/bmw-scanner-capability-database/",
  "bmw-enet-vs-bluetooth-obd": "/guides/bmw-diagnostic-interface-map/",
  "bmw-f-series-vs-g-series-obd-adapter": "/guides/bmw-diagnostic-interface-map/",
  "bmw-icom-vs-enet": "/guides/bmw-diagnostic-interface-map/",
  "bmw-icom-vs-k-dcan": "/guides/bmw-diagnostic-interface-map/",
  "k-dcan-vs-enet-cable": "/guides/bmw-diagnostic-interface-map/",
  "mini-diagnostic-app": "/tools/bmw-vehicle-interface-compatibility/"
};
// Additive, separately governed conversion decisions from the two ORIGINAL
// CONVERT TO DATABASE/TOOL forensic actions. Keep old 32 P0 cohort immutable.
export const convertedToolSourceRedirects = {
  "autel-scanner-for-bmw": "/tools/bmw-scanner-capability-database/",
  "bmw-bidirectional-scan-tool-functions": "/tools/bmw-scanner-capability-database/"
};
export const publicGuideRedirects = {...consolidatedRedirects, ...convertedToolSourceRedirects};
export const retiredGuidePaths = new Set(Object.keys(publicGuideRedirects).flatMap(slug => [`/guides/${slug}/`,`/guides/${slug}`]));
export const publishedGuidesAfterAuditMerges = 69 - Object.keys(consolidatedRedirects).length;
export const visibleGuidesAfterApprovedToolConversions = 69 - Object.keys(publicGuideRedirects).length;
