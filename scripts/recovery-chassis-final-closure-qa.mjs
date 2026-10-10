#!/usr/bin/env node
// Chassis Signal final forensic closure gate. Evidence preservation and build
// behavior are mechanically verified; vendor truth and Google recovery are not.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {consolidatedRedirects,convertedToolSourceRedirects,publicGuideRedirects,retiredGuidePaths,visibleGuidesAfterApprovedToolConversions} from '../src/data/consolidated-redirects.mjs';
const fail=message=>{throw Error('CHASSIS FINAL CLOSURE: '+message)};
const assert=(condition,message)=>{if(!condition)fail(message)};
const read=p=>fs.readFileSync(p,'utf8');
const original=p=>execFileSync('git',['show','origin/main:'+p],{encoding:'utf8'});
const words=s=>(s.replace(/^---[\s\S]*?---/,'').replace(/<[^>]+>/g,' ').match(/[\p{L}\p{N}]+(?:[-'][\p{L}\p{N}]+)*/gu)||[]).length;
const headers=s=>[...s.matchAll(/^## ([^\r\n]+)/gm)].map(x=>x[1]);
const assets=s=>[...new Set([...s.matchAll(/\/images\/[\w/-]+\.(?:svg|webp|png|jpg|jpeg)/g)].map(x=>x[0]))];
const paths=()=>fs.readdirSync('src/content/articles').filter(x=>x.endsWith('.md')).sort();
const minor=[
 'bmw-battery-drain-diagnostic-tool','bmw-coding-vs-programming',
 'bmw-frm-module-diagnostic-tool','bmw-no-communication-with-obd-scanner',
 'bmw-scanner-abs-airbag-codes'
];
const migrated=['autel-scanner-for-bmw','bmw-bidirectional-scan-tool-functions'];
const gates=['bmw-diagnostic-software-windows','carly-vs-foxwell-nt530','obd-app-vs-handheld-scanner'];
const audit=JSON.parse(read('recovery/data/chassis-forensic-audit-2026-10-04.json'));
const rows=audit.rows.filter(r=>r.site==='chassis-signal');
assert(rows.length===65,'must preserve exactly 65 original Chassis rows');
const tally=Object.fromEntries(['REDIRECT AFTER MERGE','MERGE','SUBSTANTIAL REBUILD','KEEP + MINOR IMPROVEMENT','CONVERT TO DATABASE/TOOL'].map(a=>[a,rows.filter(r=>r.action===a).length]));
assert(tally['REDIRECT AFTER MERGE']===19&&tally.MERGE===13&&tally['SUBSTANTIAL REBUILD']===26&&tally['KEEP + MINOR IMPROVEMENT']===5&&tally['CONVERT TO DATABASE/TOOL']===2,'original 65 forensic action splits changed');
const ledger=JSON.parse(read('recovery/data/chassis-final-65url-discovery-ledger-2026-10-10.json'));
assert(ledger.rows.length===65&&new Set(ledger.rows.map(x=>x.slug)).size===65,'ledger not 65 unique originals');
const la=JSON.parse(read('recovery/data/chassis-wave8a-editorial-decisions.json'));
assert(Object.keys(la.entries).length===26,'original Wave8A 26 candidates changed');
assert(gates.every(s=>la.entries[s]?.action==='INTENT_DECISION_GATE'&&!Object.hasOwn(publicGuideRedirects,s)),'three original GSC intent gates silently closed');
assert(gates.every(s=>ledger.rows.find(x=>x.slug===s)?.status==='PROVISIONAL_INTENT_REQUIRES_GSC'),'intent ledger mislabels GSC resolution');
assert(Object.keys(consolidatedRedirects).length===32,'original 32-URL P0 wave changed');
assert(Object.keys(convertedToolSourceRedirects).length===2,'two separate tool migrations absent');
assert(Object.keys(publicGuideRedirects).length===34,'public retired count should be 34');
assert(visibleGuidesAfterApprovedToolConversions===35,'published discovery inventory should be 35');
assert(paths().length===69,'all 69 original article Markdown files must remain');
const changed=execFileSync('git',['diff','--name-only','origin/main...HEAD','--','src/content/articles/'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
assert(changed.length===5&&changed.every(s=>minor.map(x=>'src/content/articles/'+x+'.md').includes(s)),
  'only exact five minor article sources may change: '+changed.join(', '));
for(const slug of minor){
  const f='src/content/articles/'+slug+'.md', before=original(f), after=read(f);
  assert(after!==before,slug+': promised improvement absent');
  assert(/^updatedAt: 2026-10-10$/m.test(after),slug+': missing reviewed date');
  for(const field of ['slug','section','publishedAt','heroImage','draft','affiliate']){
    const re=new RegExp('^'+field+':.*$','m');
    assert(before.match(re)?.[0]===after.match(re)?.[0],slug+': changed historical frontmatter '+field);
  }
  for(const h of headers(before))assert(headers(after).includes(h),slug+': erased original H2 '+h);
  assert(headers(after).length>=headers(before).length+1,slug+': no added research section');
  assert(words(after)>=1800,slug+': research is too abbreviated '+words(after));
  assert(after.includes('October 2026'),slug+': dated primary review missing');
  assert([...after.matchAll(/https?:\/\/[^\s)]+/g)].length>=3,slug+': inadequate direct citations');
  for(const asset of assets(before)){
    assert(assets(after).includes(asset),slug+': original graphic lost '+asset);
    assert(fs.existsSync('public'+asset),slug+': original graphic missing '+asset);
  }
  for(const link of [...new Set([...before.matchAll(/https?:\/\/[^\s)]+/g)].map(x=>x[0]))])
    assert(after.includes(link),slug+': erased original external source '+link);
  console.log('MINOR PAGE PASS',slug,{words:words(after),h2:headers(after).length,media:assets(after).length});
}
for(const slug of [...Object.keys(consolidatedRedirects),...migrated]){
  const f='src/content/articles/'+slug+'.md';
  assert(fs.existsSync(f),slug+': original research deleted');
  assert(read(f)===original(f),slug+': archived original was modified');
}
assert(migrated.every(s=>ledger.rows.find(x=>x.slug===s)?.action==='CONVERT TO DATABASE/TOOL'),'two conversions not original forensic decisions');
const component=read('src/components/ScannerConvertedEvidence.astro');
assert(component.includes('<AutelContent />')&&component.includes('<ActiveContent />'),'original complete rendered bodies not integrated');
for(const slug of migrated)assert(component.includes('id="'+slug+'"'),slug+': conversion landing anchor missing');
const planBefore=JSON.parse(original('src/affiliate/placement-plan.generated.json'));
const planAfter=JSON.parse(read('src/affiliate/placement-plan.generated.json'));
assert(Object.keys(planBefore).length===Object.keys(planAfter).length,'affiliate placement inventory changed');
for(const [slug,p] of Object.entries(planBefore)){
  const now=planAfter[slug];
  assert(now,'missing product plan for '+slug);
  if(!minor.includes(slug)){assert(JSON.stringify(p)===JSON.stringify(now),'unrelated affiliate plan changed '+slug);continue;}
  assert(p.placements.length===now.placements.length,'affiliate unit count changed '+slug);
  for(let i=0;i<p.placements.length;i++){
    const a=p.placements[i],b=now.placements[i];
    for(const key of ['position','variant','productKeys'])assert(JSON.stringify(a[key])===JSON.stringify(b[key]),'affiliate product/key changed '+slug+' '+key);
  }
  const b=read('src/content/articles/'+slug+'.md').replace(/^---[\s\S]*?---/,'');
  const h=[...b.matchAll(/^## ([^\r\n]+)/gm)].map(x=>({name:x[1],index:x.index}));
  const end=now.placements.find(x=>x.position==='end'),middle=now.placements.find(x=>x.position==='middle');
  assert(end&&middle&&h[end.anchorIndex]?.name===end.headingText&&h[middle.anchorIndex]?.name===middle.headingText,'affiliate placement headings drift '+slug);
  const total=words(b),pos=words(b.slice(0,h[end.anchorIndex+1]?.index??b.length))/total;
  assert(pos>=0.75&&pos<=0.99,slug+': last affiliate unit too early or at footer '+pos);
}
assert(read('src/affiliate/product-registry.generated.json')===original('src/affiliate/product-registry.generated.json'),'product registry modified');
const redirectRules=read('public/_redirects').trim().split(/\r?\n/);
assert(redirectRules.length===70,'expect 68 explicit variants plus 2 baseline redirects');
for(const [slug,target] of Object.entries(publicGuideRedirects)){
  for(const variant of ['/guides/'+slug+'/', '/guides/'+slug]){
    assert(redirectRules.includes(variant+' '+target+'#'+slug+' 301'),slug+': missing explicit 301 '+variant);
    assert(retiredGuidePaths.has(variant),slug+': not excluded from sitemap');
  }
}
const file='dist/tools/bmw-scanner-capability-database/index.html';
if(fs.existsSync('dist')){
 assert(fs.existsSync(file),'build missing canonical scanner database');
 const html=read(file),sitemaps=fs.readdirSync('dist').filter(x=>/^sitemap.*\.xml$/.test(x)).map(x=>read('dist/'+x)).join('\n');
 for(const slug of migrated){
   assert(html.includes('id="'+slug+'"'),slug+': rendered destination anchor missing');
   assert(sitemaps.includes('https://chassissignal.com/tools/bmw-scanner-capability-database/'),'scanner database absent from sitemap');
   assert(!sitemaps.includes('https://chassissignal.com/guides/'+slug+'/'),slug+': retired conversion still in XML sitemap');
   const old=read('src/content/articles/'+slug+'.md');
   for(const img of assets(old)){
     assert(html.includes(img),slug+': failed to transfer source media to canonical '+img);
     assert(fs.existsSync('public'+img),slug+': source asset missing '+img);
   }
 }
 assert(html.includes('Autel MK808S versus MK900')&&html.includes('Command-level evidence hierarchy'),'summary-level evidence not migrated');
 const liveLines=read('dist/_redirects').trim().split(/\r?\n/);
 assert(JSON.stringify(liveLines)===JSON.stringify(redirectRules),'built redirect rules drifted');
}
console.log('CHASSIS FINAL CLOSURE PASS',{auditRows:65,originalMergeSources:32,sourcePreservedToolConversions:2,minorEnhanced:5,gscPending:gates.length,preservedMarkdown:69,newRedirectVariants:4,publicRedirectVariants:68});
