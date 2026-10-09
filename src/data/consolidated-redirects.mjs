// P0 source-to-canonical dispositions from the Chassis October 4 forensic audit.
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
  "vlinker-bm-plus-vs-mc-plus": "/tools/bmw-obd-adapter-comparison/"
};
export const retiredGuidePaths = new Set(Object.keys(consolidatedRedirects).flatMap(slug => [`/guides/${slug}/`,`/guides/${slug}`]));
export const publishedGuidesAfterP0 = 69 - Object.keys(consolidatedRedirects).length;
