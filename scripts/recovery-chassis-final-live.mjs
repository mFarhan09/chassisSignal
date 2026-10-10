#!/usr/bin/env node
// Run ONLY after main is deployed to chassissignal.com. No paid providers.
// Checks every original forensic URL, old redirect variants and XML sitemap.
import fs from 'node:fs';
import {publicGuideRedirects,consolidatedRedirects,convertedToolSourceRedirects} from '../src/data/consolidated-redirects.mjs';
const origin=(process.env.CHASSIS_LIVE_ORIGIN||'https://chassissignal.com').replace(/\/$/,'');
const strict=process.argv.includes('--strict');
const output=process.env.CHASSIS_FINAL_LIVE_OUTPUT||'reports/recovery/final-65-live';
fs.mkdirSync(output,{recursive:true});
const audit=JSON.parse(fs.readFileSync('recovery/data/chassis-forensic-audit-2026-10-04.json','utf8'));
const rows=audit.rows.filter(x=>x.site==='chassis-signal');
if(rows.length!==65)throw Error('Live verifier expects exactly 65 source URLs');
const pending=[],active=[];
for(const r of rows){
  const slug=r.url.split('/').filter(Boolean).at(-1);
  if(publicGuideRedirects[slug])pending.push({slug,target:publicGuideRedirects[slug]});
  else active.push({slug,url:r.url});
}
if(pending.length!==34||active.length!==31)throw Error('Unexpected 34 redirect / 31 active partition');
const jobs=[
 ...pending.flatMap(x=>['/',''].map(suffix=>({kind:'301',slug:x.slug,url:origin+'/guides/'+x.slug+suffix,expected:x.target+'#'+x.slug}))),
 ...active.map(x=>({kind:'200',slug:x.slug,url:origin+'/guides/'+x.slug+'/'})),
 ...new Set(Object.values(publicGuideRedirects))].map(target=>({kind:'canonical',url:origin+target,expected:target})),
 {kind:'robots',url:origin+'/robots.txt'},
 {kind:'sitemap-index',url:origin+'/sitemap-index.xml'}
];
const checked=new Array(jobs.length);
const agent={'user-agent':'ChassisSignal-Forensic-Audit/9B (owner-controlled, no paid API)'};
async function inspect(item){
  const rec={...item,checkedAt:new Date().toISOString(),status:null,location:null,ok:false,reason:null};
  try{
    const resp=await fetch(item.url,{redirect:'manual',headers:agent,signal:AbortSignal.timeout(18000)});
    rec.status=resp.status;rec.location=resp.headers.get('location');
    if(item.kind==='301'){
      const found=rec.location?new URL(rec.location,item.url):null,expected=new URL(origin+item.expected);
      rec.ok=resp.status===301&&found?.origin===expected.origin&&found?.pathname===expected.pathname&&found?.hash===expected.hash;
      if(!rec.ok)rec.reason='Expected 301 Location '+item.expected+'; got '+resp.status+' / '+(rec.location||'(none)');
    }else if(item.kind==='200'||item.kind==='canonical'){
      rec.ok=resp.status===200;
      if(rec.ok){
        const html=await resp.text();
        const canonical=[...html.matchAll(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)/gi),...html.matchAll(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/gi)].map(m=>m[1]);
        rec.hasCanonical=canonical.some(x=>x.startsWith(origin));
        rec.noindex=/<meta[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
        rec.ok=rec.hasCanonical&&!rec.noindex;
        if(!rec.ok)rec.reason='Page lacks appropriate canonical or marked noindex';
      }else rec.reason='Expected HTTP 200';
    }else{
      rec.ok=resp.status===200;
      rec.body=rec.ok?await resp.text():'';
      if(!rec.ok)rec.reason='Expected HTTP 200';
    }
  }catch(e){rec.reason=String(e.message||e)}
  return rec;
}
let cursor=0;
async function worker(){while(cursor<jobs.length){const i=cursor++;checked[i]=await inspect(jobs[i]);await new Promise(r=>setTimeout(r,110));}}
await Promise.all(Array.from({length:4},()=>worker()));
const sitemapIndex=checked.find(x=>x.kind==='sitemap-index'),robots=checked.find(x=>x.kind==='robots');
const sitemapChildren=[...(sitemapIndex?.body||'').matchAll(/<loc>([^<]+\.xml)<\/loc>/g)].map(x=>x[1]);
const sitemapResult={children:sitemapChildren,oldUrls:[],missingActive:[],missingCanonicalTargets:[],unreachableChildren:[],robotsPointer:!!robots?.body?.includes(origin+'/sitemap-index.xml')};
const xmls=[];
for(const url of sitemapChildren.slice(0,20)){
  const r=await inspect({kind:'sitemap-index',url});
  if(!r.ok)sitemapResult.unreachableChildren.push({url,status:r.status,reason:r.reason});
  else xmls.push(r.body);
}
const fullXML=xmls.join('\n');
for(const r of pending){if(fullXML.includes(origin+'/guides/'+r.slug+'/')||fullXML.includes(origin+'/guides/'+r.slug+'<'))sitemapResult.oldUrls.push(r.slug)}
for(const r of active){if(!fullXML.includes(origin+'/guides/'+r.slug+'/'))sitemapResult.missingActive.push(r.slug)}
for(const target of new Set(Object.values(publicGuideRedirects))){if(!fullXML.includes(origin+target))sitemapResult.missingCanonicalTargets.push(target)}
const summary={generatedAt:new Date().toISOString(),origin,originalAuditRows:65,originalWave7Sources:Object.keys(consolidatedRedirects).length,approvedToolConversions:Object.keys(convertedToolSourceRedirects).length,redirectVariants:68,activeGuides:31,passes:checked.filter(x=>x.ok).length,failures:checked.filter(x=>!x.ok).length,redirect301Pass:checked.filter(x=>x.kind==='301'&&x.ok).length,redirect301Expected:68,active200Pass:checked.filter(x=>x.kind==='200'&&x.ok).length,active200Expected:31,canonicalTargetsOK:checked.filter(x=>x.kind==='canonical'&&x.ok).length,canonicalTargetsExpected:new Set(Object.values(publicGuideRedirects)).size,robotsOK:!!robots?.ok,robotsSitemapPointer:sitemapResult.robotsPointer,sitemap:sitemapResult,unverifiedGscIntentGates:['bmw-diagnostic-software-windows','carly-vs-foxwell-nt530','obd-app-vs-handheld-scanner']};
const bad=summary.failures+sitemapResult.oldUrls.length+sitemapResult.missingActive.length+sitemapResult.missingCanonicalTargets.length+sitemapResult.unreachableChildren.length+(sitemapResult.robotsPointer?0:1)+(sitemapChildren.length?0:1);
fs.writeFileSync(output+'/production-verification.json',JSON.stringify({summary,results:checked.map(({body,...record})=>record)},null,2)+'\n');
const notes=['# Chassis Final 65-URL Live Release Audit','','Checked: '+summary.generatedAt,'Origin: '+origin,'',
 '| Verification | Passed | Expected |','| --- | ---: | ---: |',
 '| Real 301 responses and exact destinations | '+summary.redirect301Pass+' | 68 |',
 '| Retained guide HTTP 200 + canonical | '+summary.active200Pass+' | 31 |',
 '| Canonical destination HTTP 200 + canonical | '+summary.canonicalTargetsOK+' | '+summary.canonicalTargetsExpected+' |',
 '| Active guide URLs absent from sitemap | '+sitemapResult.missingActive.length+' | 0 |',
 '| Retired guide URLs present in sitemap | '+sitemapResult.oldUrls.length+' | 0 |',
 '| Robots sitemap declaration | '+(sitemapResult.robotsPointer?'Yes':'No')+' | Yes |','',
 '## Failures',...(bad?[...checked.filter(x=>!x.ok).map(x=>'- '+x.url+': '+x.reason),...sitemapResult.oldUrls.map(x=>'- Retired URL in sitemap: '+x),...sitemapResult.missingActive.map(x=>'- Missing active URL from sitemap: '+x),...sitemapResult.missingCanonicalTargets.map(x=>'- Missing canonical target in sitemap: '+x),...sitemapResult.unreachableChildren.map(x=>'- Child sitemap unavailable: '+x.url)]:['None in automated checks']),
 '','## Evidence boundary','No GSC or indexing API access; all three independent search-intent gates remain open.'];
fs.writeFileSync(output+'/production-verification.md',notes.join('\n')+'\n');
console.log('CHASSIS FINAL LIVE AUDIT',JSON.stringify({summary:{...summary,sitemap:undefined},hardFailures:bad}));
if(strict&&bad)process.exitCode=1;
