import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {consolidatedRedirects,convertedToolSourceRedirects,retiredGuidePaths,publishedGuidesAfterAuditMerges} from '../src/data/consolidated-redirects.mjs';
const assert=(v,msg)=>{if(!v)throw Error(msg)};
const entries=Object.entries(consolidatedRedirects);
assert(entries.length===32,'forensic audit must contain 32 merge/redirect candidates');
assert(entries.filter(x=>x[1]==='/tools/bmw-diagnostic-software-comparison/').length===10,'software P0 count');
assert(entries.filter(x=>x[1]==='/tools/bmw-obd-adapter-comparison/').length===9,'adapter P0 count');
assert(entries.filter(x=>x[1]==='/tools/bmw-scanner-capability-database/').length===7,'scanner merge count');
assert(entries.filter(x=>x[1]==='/guides/bmw-diagnostic-interface-map/').length===5,'interface merge count');
assert(entries.filter(x=>x[1]==='/tools/bmw-vehicle-interface-compatibility/').length===1,'MINI merge count');
const lines=fs.readFileSync('dist/_redirects','utf8').trim().split(/\r?\n/);
assert(lines.includes('/home / 301')&&lines.includes('/articles /research/ 301'),'existing redirects lost');
assert(lines.length===70,'64 Wave7 variants, four separately approved tool-conversion variants and two originals required; got '+lines.length);
assert(new Set(lines.map(x=>x.split(' ')[0])).size===lines.length,'duplicate 301 source');
// Additive conversion audit: never reclassify the original 32 wave7 sources.
assert(Object.keys(convertedToolSourceRedirects).length===2,'two approved tool conversions required');
for(const [slug,target] of Object.entries(convertedToolSourceRedirects)){
 for(const variant of ['/guides/'+slug+'/','/guides/'+slug]){
  assert(lines.includes(variant+' '+target+'#'+slug+' 301'),'tool conversion 301 missing '+variant);
  assert(retiredGuidePaths.has(variant),'tool conversion exclusion missing '+variant);
 }
}

const sitemapFiles=fs.readdirSync('dist').filter(n=>n.startsWith('sitemap')&&n.endsWith('.xml'));assert(sitemapFiles.includes('sitemap-index.xml'),'sitemap index missing');
const sitemap=sitemapFiles.map(x=>fs.readFileSync('dist/'+x,'utf8')).join('\n');
const mainLinks=['/guides/','/software/','/comparisons/','/coding-adapters/','/compatibility/'];
for(const [slug,target] of entries){
 for(const variant of ['/guides/'+slug+'/','/guides/'+slug]){
   const rule=variant+' '+target+'#'+slug+' 301';
   assert(lines.includes(rule),'redirect wrong or absent: '+rule);
   assert(retiredGuidePaths.has(variant),'sitemap exclusion missing '+variant);
 }
 assert(!sitemap.includes('https://chassissignal.com/guides/'+slug+'/'),'retired guide appears in XML sitemap '+slug);
 assert(sitemap.includes('https://chassissignal.com'+target),'destination missing sitemap '+target);
 const legacy='src/content/articles/'+slug+'.md';
 assert(fs.existsSync(legacy),'original research source deleted: '+slug);
 const original=execFileSync('git',['show','origin/main:'+legacy],{encoding:'utf8'});
 assert(fs.readFileSync(legacy,'utf8')===original,'source research modified or erased: '+slug);
 const targetHtml=fs.readFileSync('dist'+target+'index.html','utf8');
 assert(targetHtml.includes('id="'+slug+'"'),'destination has no true merged section '+slug);
 const svgMatches=[...new Set([...original.matchAll(/\/images\/guides\/[^\s"'()\]<>]+\.svg/g)].map(x=>x[0]))];
 const desktops=svgMatches.filter(s=>!s.endsWith('-mobile.svg'));
 assert(desktops.length>=1,'source lacks expected original SVG '+slug);
 assert(desktops.some(s=>targetHtml.includes(s)),'source original visual not transferred '+slug);
 assert(targetHtml.includes('Original')||targetHtml.includes('original'),'missing diagram provenance '+target);
 assert(!targetHtml.includes('href="/guides/'+slug+'/"'),'canonical links to old redirected source '+slug);
}
assert(fs.readdirSync('src/content/articles').filter(n=>n.endsWith('.md')).length===69,'source archive was not preserved');
assert(publishedGuidesAfterAuditMerges===37,'visible guide count expected 37');
for(const page of mainLinks){const file='dist'+page+'index.html';if(fs.existsSync(file)){const h=fs.readFileSync(file,'utf8');for(const slug of Object.keys(consolidatedRedirects))assert(!h.includes('href="/guides/'+slug+'/"'),'hub advertises retired comparison '+slug+' in '+page)}}
const originalChanges=execFileSync('git',['diff','--name-only','origin/main','--','src/content/articles/'],{encoding:'utf8'}).trim();
const modified=originalChanges.split('\n').filter(Boolean);
const approved8b=['bimmercode-pricing','bimmerlink-pricing','carly-subscription-cost','protool-pricing'].map(s=>'src/content/articles/'+s+'.md');
const explicit8b=(process.env.CHASSIS_WAVE8B_EDITORIAL_REBUILD==='1' && modified.length===4 && modified.every(p=>approved8b.includes(p)));
// Wave 7's archive rule applies unchanged in every context other than this explicitly
// audited four-file Wave 8B rebuild. Wave 8B must also pass the separate original-H2,
// image, SVG, frontmatter and 69-source preservation gate.
const approved8c=[
 'bmw-battery-registration-scanner','bmw-brake-bleed-scan-tool','bmw-dpf-regeneration-scan-tool',
 'bmw-electric-parking-brake-service-mode-scanner','bmw-injector-coding-tool','bmw-parking-sensor-diagnostic-tool',
 'bmw-ride-height-calibration-scan-tool','bmw-steering-angle-sensor-calibration-tool',
 'bmw-tpms-diagnostic-tool','bmw-transfer-case-adaptation-reset-tool','ista-valvetronic-relearn'
].map(s=>'src/content/articles/'+s+'.md');
const explicit8c=(process.env.CHASSIS_WAVE8C_BATCH1_REBUILD==='1' && modified.length===11 &&
  modified.every(p=>approved8c.includes(p)));
// Preserve the original 32 merged-source Markdown files byte-for-byte. Only the 11
// independently audited, non-retired specialist guides can change under this opt-in.
const approved8d=[
 'bimmerlink-adapter','bmw-electronic-water-pump-diagnostic-tool',
 'bmw-scanner-for-used-car-inspection','bmw-scanner-without-subscription','bmw-service-reset-tool',
 'bmw-vanos-diagnostic-tool','bmw-wheel-speed-sensor-diagnostic-tool','launch-x431-bmw',
 'bmw-diagnostic-software-windows','carly-vs-foxwell-nt530','obd-app-vs-handheld-scanner'
].map(s=>'src/content/articles/'+s+'.md');
const explicit8d=(process.env.CHASSIS_WAVE8D_BATCH3_REBUILD==='1' && modified.length===11 &&
  modified.every(p=>approved8d.includes(p)));
// These three original intent-decision-gate sources may be *enhanced in place*,
// but this exception does not authorize any 301, retirement or proven intent claim.
const approvedFinalMinor=[
 'bmw-battery-drain-diagnostic-tool','bmw-coding-vs-programming',
 'bmw-frm-module-diagnostic-tool','bmw-no-communication-with-obd-scanner',
 'bmw-scanner-abs-airbag-codes'
].map(s=>'src/content/articles/'+s+'.md');
const explicitFinalMinor=(process.env.CHASSIS_FINAL_MINOR_REBUILD==='1' && modified.length===5 &&
  modified.every(p=>approvedFinalMinor.includes(p)));
// This opt-in protects every prior source; Wave 9 conversion source Markdown
// is unchanged and its complete public evidence is rendered by the canonical.
assert(!originalChanges||explicit8b||explicit8c||explicit8d||explicitFinalMinor,
 '32 archived sources must remain untouched; allow only exact 8B/8C/8D or final-five rebuild cohort');
assert(sitemapFiles.length>1,'sitemap content file missing');
console.log('AUDIT MERGE+301 CONSOLIDATION PASS:',{retiredPublicURLs:entries.length,redirectRules:entries.length*2,publishedDiscoveryGuides:publishedGuidesAfterAuditMerges,preservedSourceArticles:69,sitemap:true,destinations:5});
