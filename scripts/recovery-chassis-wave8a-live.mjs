#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { consolidatedRedirects } from '../src/data/consolidated-redirects.mjs';

const origin=(process.env.CHASSIS_LIVE_ORIGIN||'https://chassissignal.com').replace(/\/$/,'');
const strict=process.argv.includes('--strict');
const outputDir=process.env.WAVE8A_OUTPUT_DIR||'reports/recovery/wave8a-live';
fs.mkdirSync(outputDir,{recursive:true});
const expected=Object.entries(consolidatedRedirects);
if(expected.length!==32)throw Error('Expected 32 audited merger sources; actual '+expected.length);

const urls=[];
for(const [slug,destination] of expected){
 for(const suffix of ['/', '']){
  urls.push({kind:'retired',slug,url:origin+'/guides/'+slug+suffix,expected:destination+'#'+slug});
 }
}
for(const destination of new Set(Object.values(consolidatedRedirects)))urls.push({kind:'canonical',url:origin+destination,expected:destination});
urls.push({kind:'robots',url:origin+'/robots.txt'});
urls.push({kind:'sitemap',url:origin+'/sitemap-index.xml'});
const results=[];
async function inspect(input){
 const start=Date.now();
 const record={...input,checkedAt:new Date().toISOString(),status:null,location:null,ok:false,reason:null};
 try{
  const r=await fetch(input.url,{redirect:'manual',headers:{'user-agent':'ChassisSignal-Recovery-Audit/8A (+site-owner-check)'},signal:AbortSignal.timeout(14000)});
  record.status=r.status;record.location=r.headers.get('location');
  record.elapsedMs=Date.now()-start;
  if(input.kind==='retired'){
   const found=record.location?new URL(record.location,input.url):null;
   const target=new URL(origin+input.expected);
   record.ok=r.status===301 && found?.origin===target.origin && found?.pathname===target.pathname && found?.hash===target.hash;
   if(!record.ok)record.reason='Expected exact 301 to '+input.expected+'; received '+r.status+' / '+(record.location||'(no Location)');
  }else if(input.kind==='canonical'){
   record.ok=r.status===200;
   if(!record.ok)record.reason='Canonical destination must return 200 (no further redirect)';
   if(record.ok){const h=await r.text();record.hasCanonical=/<link[^>]*rel=["']canonical["']/i.test(h)||/<link[^>]*href=["'][^"']+["'][^>]*rel=["']canonical["']/i.test(h);if(!record.hasCanonical){record.ok=false;record.reason='HTML missing canonical link'}}
  }else{
   record.ok=r.status===200;
   if(!record.ok)record.reason='Expected HTTP 200';
   if(record.ok)record.body=await r.text();
  }
 }catch(e){record.elapsedMs=Date.now()-start;record.reason='Network/access: '+String(e.message||e)}
 return record;
}
let cursor=0;
async function worker(){
 while(cursor<urls.length){const idx=cursor++; const rec=await inspect(urls[idx]); results[idx]=rec;await new Promise(r=>setTimeout(r,95));}
}
await Promise.all(Array.from({length:3},()=>worker()));
const sitemapIndex=results.find(x=>x.kind==='sitemap');
let sitemap={indexReachable:!!sitemapIndex?.ok,childFiles:[],oldUrlsFound:[],missingCanonicalTargets:[],robotsSitemapPointer:false,error:null};
const robot=results.find(x=>x.kind==='robots');
sitemap.robotsSitemapPointer=!!robot?.body?.includes('https://chassissignal.com/sitemap-index.xml');
if(sitemapIndex?.ok){
 const children=[...sitemapIndex.body.matchAll(/<loc>([^<]+\.xml)<\/loc>/g)].map(x=>x[1]);
 sitemap.childFiles=children;
 const bodies=[sitemapIndex.body];
 for(const u of children.slice(0,15)){
  const c=await inspect({kind:'sitemap',url:u});
  if(!c.ok){sitemap.error='Failed to fetch '+u+' status '+c.status+' '+c.reason;continue}
  bodies.push(c.body);
 }
 const full=bodies.join('\n');
 for(const [slug] of expected){if(full.includes(origin+'/guides/'+slug+'/')||full.includes(origin+'/guides/'+slug+'<'))sitemap.oldUrlsFound.push(slug);}
 for(const target of new Set(Object.values(consolidatedRedirects))){if(!full.includes(origin+target))sitemap.missingCanonicalTargets.push(target);}
 if(!children.length)sitemap.error='Sitemap index did not list child .xml sitemaps';
}else sitemap.error='Sitemap index unavailable; site discovery cannot be verified';
const failed=results.filter(x=>!x.ok);
const verification={generatedAt:new Date().toISOString(),origin,scope:{originalAuditPages:65,redirectedPublicGuides:32,redirectVariants:64,canonicalTargets:5,gscMetricsFetched:false},summary:{source301Pass:results.filter(x=>x.kind==='retired'&&x.ok).length,source301Total:64,canonicals200:results.filter(x=>x.kind==='canonical'&&x.ok).length,canonicalTotal:5,robotsOk:!!robot?.ok,robotsSitemapPointer:sitemap.robotsSitemapPointer,sitemapOldUrlsFound:sitemap.oldUrlsFound.length,sitemapTargetsMissing:sitemap.missingCanonicalTargets.length,failures:failed.length},sitemap,results:results.map(({body,...data})=>data)};
const hardIssues=failed.length + sitemap.oldUrlsFound.length + sitemap.missingCanonicalTargets.length + (sitemap.error?1:0) + (sitemap.robotsSitemapPointer?0:1);
const pretty=JSON.stringify(verification,null,2)+'\n';
fs.writeFileSync(path.join(outputDir,'production-verification.json'),pretty);
const markdown=['# Chassis Signal Wave 8A — production redirect verification','',
'Checked: '+verification.generatedAt,'Origin: '+origin,'','## Release checks',
'| Check | Confirmed | Expected |','|---|---:|---:|',
'| Exact old-url HTTP 301 | '+verification.summary.source301Pass+' | 64 |',
'| Canonical HTTP 200 + canonical link | '+verification.summary.canonicals200+' | 5 |',
'| Retired URLs present in live sitemap | '+sitemap.oldUrlsFound.length+' | 0 |',
'| Canonical targets missing from sitemap | '+sitemap.missingCanonicalTargets.length+' | 0 |',
'| robots.txt points at sitemap-index.xml | '+(sitemap.robotsSitemapPointer?'Yes':'No')+' | Yes |',
'','## Failed responses / deployment blockers',
...(failed.length?failed.map(x=>'- `'+x.url+'` — '+x.reason):['None in requested HTTP checks']),
...(sitemap.error?['- Sitemap: '+sitemap.error]:[]),
...(sitemap.oldUrlsFound.map(x=>'- Retired URL remains in sitemap: '+x)),
...(sitemap.missingCanonicalTargets.map(x=>'- Canonical missing from sitemap: '+x)),
'','## Interpretation','These are observed HTTP results at the time of the run. They do not prove Google has processed the redirect, selected the correct canonical, indexed the target or restored search visibility. GSC page/query/indexation exports are still required.',
'','Status: '+(hardIssues?'BLOCKED / INVESTIGATE':'PASS — production HTTP checks')];
fs.writeFileSync(path.join(outputDir,'PRODUCTION_VERIFICATION.md'),markdown.join('\n')+'\n');
console.log('LIVE WAVE8A:',JSON.stringify(verification.summary),'hardIssues='+hardIssues,'out='+outputDir);
if(strict&&hardIssues)process.exitCode=1;
