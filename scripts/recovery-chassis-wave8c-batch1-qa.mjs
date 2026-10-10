#!/usr/bin/env node
// Chassis Signal Wave 8C — exactly 11 additive specialist rebuilds.
// This script enforces preservation and scope, not source truth or hands-on function support.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {consolidatedRedirects} from '../src/data/consolidated-redirects.mjs';
const cohort=[
 'bmw-battery-registration-scanner','bmw-brake-bleed-scan-tool','bmw-dpf-regeneration-scan-tool',
 'bmw-electric-parking-brake-service-mode-scanner','bmw-injector-coding-tool','bmw-parking-sensor-diagnostic-tool',
 'bmw-ride-height-calibration-scan-tool','bmw-steering-angle-sensor-calibration-tool','bmw-tpms-diagnostic-tool',
 'bmw-transfer-case-adaptation-reset-tool','ista-valvetronic-relearn'
];
const excludedPricing=new Set(['bimmercode-pricing','bimmerlink-pricing','carly-subscription-cost','protool-pricing']);
const err=s=>{throw new Error('WAVE8C BATCH1: '+s)};
const ok=(c,s)=>{if(!c)err(s)};
const old=p=>execFileSync('git',['show','origin/main:'+p],{encoding:'utf8'});
const words=s=>(s.replace(/^---[\s\S]*?---/,'').replace(/<[^>]*>/g,' ').match(/[\p{L}\p{N}]+(?:[-'][\p{L}\p{N}]+)*/gu)||[]).length;
const heads=s=>[...s.matchAll(/^## ([^\r\n]+)/gm)].map(x=>x[1]);
const media=s=>[...new Set([...s.matchAll(/\/images\/[\w/-]+\.(?:svg|png|webp|jpg|jpeg)/g)].map(x=>x[0]))];
const changed=execFileSync('git',['diff','--name-only','origin/main...HEAD','--','src/content/articles/'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
const allowed=cohort.map(s=>'src/content/articles/'+s+'.md');
ok(changed.length===11&&changed.every(s=>allowed.includes(s)),'only the exact eleven target article sources may change: '+changed.join(', '));
const audit=JSON.parse(fs.readFileSync('recovery/data/chassis-wave8a-editorial-decisions.json','utf8'));
ok(Object.keys(audit.entries).length===26,'original candidate count changed');
ok(cohort.every(s=>audit.entries[s]?.action==='REBUILD_IN_PLACE'),'one or more cohort entries lack approval to rebuild in place');
ok(cohort.every(s=>!excludedPricing.has(s)),'Wave 8B article touched');
const report=[];
for(const slug of cohort){
 const p='src/content/articles/'+slug+'.md';
 const before=old(p),now=fs.readFileSync(p,'utf8'),oldH=heads(before),newH=heads(now);
 ok(now!==before,slug+': rebuild missing');
 const b=now.replace(/^---[\s\S]*?---/,'');
 ok(!/^# [^#]/m.test(b),slug+': duplicate article-level H1');
 ok(/^updatedAt: 2026-10-10$/m.test(now),slug+': new reviewed date missing');
 for(const k of ['slug','section','publishedAt','heroImage','draft','affiliate']){
  const regex=new RegExp('^'+k+':.*$','m');
  ok(before.match(regex)?.[0]===now.match(regex)?.[0],slug+': historical frontmatter '+k+' modified');
 }
 const w=words(now);
 ok(w>=1600,slug+': insufficient body evidence, '+w+' words');
 ok(newH.length>=oldH.length+2,slug+': fewer than two new research sections');
 ok(oldH.every(h=>newH.includes(h)),slug+': original research section was deleted');
 ok(now.includes('October 2026'),slug+': no dated evidence update');
 ok(now.includes('/tools/bmw-service-function-matrix/')||slug==='bmw-parking-sensor-diagnostic-tool',slug+': lost function evidence canonical');
 // Do not mistake an archived image's /images/guides/<retired-slug>/ asset
 // path for a live hyperlink. Only Markdown/HTML link destinations are blocked.
 ok(!Object.keys(consolidatedRedirects).some(s=>
   now.includes('](/guides/'+s+'/') || now.includes('href="/guides/'+s+'/') ||
   now.includes("href='/guides/"+s+"/")),slug+': direct link to retired guide remains');
 const urls=[...now.matchAll(/https?:\/\/[^\s)]+/g)].map(m=>m[0]);
 ok(urls.length>=2,slug+': insufficient cited primary source links');
 const beforeMedia=media(before), afterMedia=media(now);
 ok(beforeMedia.length>=2,slug+': original visual research absent unexpectedly');
 for(const asset of beforeMedia){
  ok(afterMedia.includes(asset),slug+': lost original article media '+asset);
  ok(fs.existsSync('public'+asset),slug+': referenced media file absent '+asset);
 }
 const beforeExternal=[...new Set([...before.matchAll(/https?:\/\/[^\s)]+/g)].map(x=>x[0]))];
 for(const url of beforeExternal)ok(now.includes(url),slug+': existing outside source lost '+url);
 report.push({slug,bodyWords:w,originalMediaPreserved:beforeMedia.length,sectionCount:newH.length,sourceLinks:urls.length});
}
ok(Object.keys(consolidatedRedirects).length===32,'prior 32 redirects changed');
ok(fs.readdirSync('src/content/articles').filter(x=>x.endsWith('.md')).length===69,'69 article sources not preserved');

const originalPlan=JSON.parse(old('src/affiliate/placement-plan.generated.json'));
const currentPlan=JSON.parse(fs.readFileSync('src/affiliate/placement-plan.generated.json','utf8'));
ok(Object.keys(originalPlan).length===Object.keys(currentPlan).length,'affiliate inventory count changed');
for(const [slug,plan] of Object.entries(originalPlan)){
 const current=currentPlan[slug];
 ok(current,'missing affiliate placement '+slug);
 if(!cohort.includes(slug)){ok(JSON.stringify(plan)===JSON.stringify(current),'unrelated affiliate plan changed: '+slug);continue}
 ok(plan.placements.length===current.placements.length,'affiliate unit count changed: '+slug);
 for(let i=0;i<plan.placements.length;i++){
  const a=plan.placements[i],b=current.placements[i];
  ok(a.position===b.position&&a.variant===b.variant&&JSON.stringify(a.productKeys)===JSON.stringify(b.productKeys),
    'original approved product, link type or slot changed: '+slug);
 }
 const article=fs.readFileSync('src/content/articles/'+slug+'.md','utf8');
 const body=article.replace(/^---[\s\S]*?---/,'');
 const hs=[...body.matchAll(/^##\s+(.+)$/gm)];
 const by=Object.fromEntries(current.placements.map(x=>[x.position,x]));
 ok(by.top&&by.middle&&by.end,'long guide lacks three placements '+slug);
 ok(by.top.anchorIndex<by.middle.anchorIndex&&by.middle.anchorIndex<by.end.anchorIndex,slug+': affiliate order invalid');
 for(const p of current.placements){
  ok(p.headingText===hs[p.anchorIndex]?.[1],slug+': placement heading drift '+p.position);
 }
 const arrival=x=>hs[x.anchorIndex+1]?.index/body.length||1;
 ok(arrival(by.middle)>=0.30&&arrival(by.middle)<=0.75,slug+': middle is outside useful region');
 ok(arrival(by.end)>=0.78&&arrival(by.end)<=0.99,slug+': end is outside useful region');
}
for(const p of ['src/affiliate/article-mappings.generated.json','src/affiliate/product-registry.generated.json']){
 ok(old(p)===fs.readFileSync(p,'utf8'),'original approved affiliate mapping/registry changed: '+p);
}
for(const r of report)console.log('WAVE8C ARTICLE PASS',JSON.stringify(r));
console.log('WAVE8C BATCH1 PASS — 11 distinct specialist guide rebuilds, 69 original articles, 32 redirect sources, and all original media retained.');
