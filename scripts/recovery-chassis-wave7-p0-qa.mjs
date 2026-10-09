import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {consolidatedRedirects,retiredGuidePaths,publishedGuidesAfterAuditMerges} from '../src/data/consolidated-redirects.mjs';
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
assert(lines.length===66,'64 exact source redirect variants and two originals required; got '+lines.length);
assert(new Set(lines.map(x=>x.split(' ')[0])).size===lines.length,'duplicate 301 source');
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
assert(!originalChanges,'retirement should preserve raw research unchanged, not delete original');
assert(sitemapFiles.length>1,'sitemap content file missing');
console.log('AUDIT MERGE+301 CONSOLIDATION PASS:',{retiredPublicURLs:entries.length,redirectRules:entries.length*2,publishedDiscoveryGuides:publishedGuidesAfterAuditMerges,preservedSourceArticles:69,sitemap:true,destinations:5});
