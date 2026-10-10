#!/usr/bin/env node
// Wave 8B content-only release gate. Do not exempt unrelated Markdown or affiliate changes.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {consolidatedRedirects} from '../src/data/consolidated-redirects.mjs';

const slugs=['bimmercode-pricing','bimmerlink-pricing','carly-subscription-cost','protool-pricing'];
const fail=(msg)=>{throw new Error('Wave 8B pricing QA: '+msg)};
const assert=(ok,msg)=>{if(!ok)fail(msg)};
const original=(p)=>execFileSync('git',['show','origin/main:'+p],{encoding:'utf8'});
const heads=(t)=>[...t.matchAll(/^## (.+)$/gm)].map(x=>x[1]);
const assets=(t)=>[...new Set([...t.matchAll(/\/images\/[\w/-]+\.(?:svg|webp|png|jpg)/g)].map(x=>x[0]))];
const countWords=(t)=>t.replace(/^---[\s\S]*?---/,'').replace(/<[^>]+>/g,' ').match(/[\p{L}\p{N}]+(?:[-'][\p{L}\p{N}]+)*/gu)?.length||0;
const report=[];
const expected=slugs.map(s=>'src/content/articles/'+s+'.md');
const changed=execFileSync('git',['diff','--name-only','origin/main...HEAD','--','src/content/articles'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
assert(changed.length===4,'only four editorial source files must change: '+changed.join(', '));
assert(changed.every(p=>expected.includes(p)),'unapproved article modification: '+changed.join(', '));
for(const slug of slugs){
 const p='src/content/articles/'+slug+'.md';
 const old=original(p),current=fs.readFileSync(p,'utf8');
 assert(current!==old,slug+' has not changed');
 // ArticlePage already supplies the visible H1: a second Markdown H1 would
 // produce duplicate primary headings and weaken presentation quality.
 const body=current.replace(/^---[\\s\\S]*?---/,'');
 assert(!/^# [^#]/m.test(body),slug+' embeds a duplicate H1 in article body');
 for(const k of ['slug','section','publishedAt','heroImage','affiliate','draft']){
   const pattern=new RegExp('^'+k+':.*$','m');
   assert(old.match(pattern)?.[0]===current.match(pattern)?.[0],slug+' changed historical frontmatter '+k);
 }
 assert(/^updatedAt: 2026-10-10$/m.test(current),slug+' update date not recorded');
 assert(/^pricingChecked: 2026-10-10$/m.test(current),slug+' pricing review date not recorded');
 assert(/^affiliate: false$/m.test(current),slug+' affiliate flag changed');
 const words=countWords(current);
 assert(words>=1600,slug+' has insufficient researched body: '+words+' words');
 const origAssets=assets(old),newAssets=assets(current);
 assert(origAssets.every(a=>newAssets.includes(a)),slug+' lost original figure(s): '+origAssets.filter(a=>!newAssets.includes(a)));
 for(const src of origAssets)assert(fs.existsSync('public'+src),slug+' missing media '+src);
 for(const h of heads(old))assert(heads(current).includes(h),slug+' original editorial section removed: '+h);
 assert(heads(current).length>=heads(old).length+4,slug+' needs new decision-specific sections');
 assert(current.includes('/tools/bmw-diagnostic-software-price-ledger/'),slug+' lost canonical pricing ledger link');
 assert(current.includes('October 2026'),slug+' missing update qualification');
 assert(current.includes('three-year')||current.includes('Three-year'),slug+' lacks 3-year cost exercise');
 const firstPartyLinks=[...current.matchAll(/https:\/\/[^\s)]+/g)].map(m=>m[0]);
 assert(firstPartyLinks.length>=2,slug+' requires first-party sources');
 for(const retired of Object.keys(consolidatedRedirects)){
   assert(!current.includes('/guides/'+retired+'/'),slug+' links to retired guide '+retired);
 }
 report.push({slug,bodyWords:words,headings:heads(current).length,originalFigureAssetsKept:origAssets.length,externalLinks:firstPartyLinks.length});
}
// Reflow the existing affiliate units after the longer articles without changing product
// identities, quantities, variant types or any unrelated published placement plan.
const oldPlans=JSON.parse(original('src/affiliate/placement-plan.generated.json'));
const newPlans=JSON.parse(fs.readFileSync('src/affiliate/placement-plan.generated.json','utf8'));
assert(Object.keys(oldPlans).length===Object.keys(newPlans).length,'affiliate placement inventory changed');
for(const [slug,plan] of Object.entries(oldPlans)){
  const next=newPlans[slug];
  assert(next,'missing affiliate placement plan '+slug);
  if(!slugs.includes(slug)){
    assert(JSON.stringify(plan)===JSON.stringify(next),'unrelated affiliate placement modified '+slug);
    continue;
  }
  assert(plan.placements.length===next.placements.length,'affiliate unit count changed '+slug);
  for(let i=0;i<plan.placements.length;i++){
    const a=plan.placements[i],b=next.placements[i];
    const routeOnlyAlternative=['carly-subscription-cost','protool-pricing'].includes(slug);
    const permittedVariantShift=routeOnlyAlternative&&a.position==='top'&&a.variant==='recommended_equipment'&&b.variant==='product_card';
    assert(a.position===b.position&&(a.variant===b.variant||permittedVariantShift)&&JSON.stringify(a.productKeys)===JSON.stringify(b.productKeys),'affiliate product or position changed '+slug);
    if(routeOnlyAlternative&&a.position==='top')assert(b.variant==='product_card'&&b.role.includes('not ')&&b.role.includes('compatible hardware'),'alternative app route presented as recommended compatible equipment: '+slug);
  }
}
assert(fs.readdirSync('src/content/articles').filter(f=>f.endsWith('.md')).length===69,'source inventory drifted');
assert(Object.keys(consolidatedRedirects).length===32,'original redirect cohort drifted');
for(const r of report)console.log('WAVE8B GUIDE PASS',JSON.stringify(r));
console.log('WAVE8B PRICING QA PASS — 4 rebuilt guide URLs, 69 sources, 32 redirects and pre-existing assets intact.');
