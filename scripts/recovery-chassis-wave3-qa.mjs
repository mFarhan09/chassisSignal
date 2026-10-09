import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const check=(c,m)=>{if(!c)throw Error(m)};
const slugs=['foxwell-nt530-vs-nt710','foxwell-nt710-vs-autel-mk900-bmw','foxwell-nt710-vs-nt809bt-bmw','autel-scanner-for-bmw','launch-x431-vs-autel-for-bmw','bmw-bidirectional-scan-tool-functions','bmw-scanner-abs-airbag-codes','bmw-battery-registration-scanner','bmw-scanner-for-used-car-inspection','bmw-scanner-without-subscription','bmw-brake-bleed-scan-tool','bmw-code-reader-vs-scan-tool'];
const route='/tools/bmw-scanner-capability-database/';
check(fs.existsSync('dist'+route+'index.html'),'missing scanner route');
const h=fs.readFileSync('dist'+route+'index.html','utf8');
for(const term of ['Foxwell NT530','Foxwell NT710','Autel MK808S','Autel MK900','Launch X-431'])check(h.includes(term),'model not rendered '+term);
for(const s of slugs){const f='src/content/articles/'+s+'.md';check(fs.existsSync(f),'source removed '+s);check(fs.readFileSync(f,'utf8').includes(route),'no reciprocal link '+s);check(h.includes('/guides/'+s+'/'),'missing internal link '+s);check(fs.existsSync('dist/guides/'+s+'/index.html'),'published source route missing '+s)}
for(const name of ['capability-layers.svg','capability-layers-mobile.svg','risk-boundaries.svg','risk-boundaries-mobile.svg']){check(h.includes(name),'svg not referenced '+name);check(fs.existsSync('dist/images/tools/bmw-scanner-capability-database/'+name),'svg absent '+name)}
for(const hub of ['scanners','compatibility'])check(fs.readFileSync('dist/'+hub+'/index.html','utf8').includes(route),'hub missing link '+hub);
for(const slug of slugs)check(!fs.readFileSync('public/_redirects','utf8').includes('/guides/'+slug+'/'),'unapproved retirement '+slug);
check(!h.includes('data-affiliate-link'),'unexpected affiliate placement');
check(h.includes('rel="canonical"')&&h.includes(route),'canonical absent');
check(h.includes('id="manufacturer"')&&h.includes('id="rowtype"'),'filters absent');
check(fs.readdirSync('src/content/articles').filter(x=>x.endsWith('.md')).length===69,'original article count changed');
const diff=execFileSync('git',['diff','--name-only','origin/main','--','src/content/articles/'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
check(diff.length===slugs.length,'expected only 12 permitted Markdown changes, got '+diff.length);
for(const f of diff)check(slugs.includes(f.replace('src/content/articles/','').replace('.md','')),'unapproved article edit '+f);
const files=['src/pages/tools/bmw-scanner-capability-database/index.astro','src/components/ScannerResearch.astro'];
let words=0;for(const f of files){let s=fs.readFileSync(f,'utf8');if(f.includes('/pages/'))s=s.slice(s.indexOf('<BaseLayout'),s.indexOf('<script>'));words+=s.replace(/<[^>]*>/g,' ').replace(/\{[^{}]*\}/g,' ').split(/\s+/).filter(Boolean).length}
check(words>=2100,'not substantial: '+words);
for(const host of ['autel.com','foxwelldiag.com','cnlaunch.com'])check(h.includes(host),'missing vendor source '+host);
console.log('WAVE3 PASS:',{words,preserved:69,reciprocal:12,svgs:4,hubs:2,retired:0});
