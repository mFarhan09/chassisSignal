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
assert(fs.readdirSync('src/content/articles').filter(f=>f.endsWith('.md')).length===69,'source inventory drifted');
assert(Object.keys(consolidatedRedirects).length===32,'original redirect cohort drifted');
for(const r of report)console.log('WAVE8B GUIDE PASS',JSON.stringify(r));
console.log('WAVE8B PRICING QA PASS — 4 rebuilt guide URLs, 69 sources, 32 redirects and pre-existing assets intact.');
