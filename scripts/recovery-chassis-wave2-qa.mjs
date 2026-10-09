import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const assert=(value,message)=>{if(!value)throw new Error(message)};
const slugs=['bimmercode-vs-carly','bimmercode-vs-foxwell-nt530','bimmercode-vs-protool','bimmerlink-vs-bimmer-tool','bimmerlink-vs-carly','bimmerlink-vs-foxwell-nt530','bimmerlink-vs-protool','ista-vs-bimmerlink','protool-vs-carly','protool-vs-ista'];
const path='/tools/bmw-diagnostic-software-comparison/',file='dist'+path+'index.html';
assert(fs.existsSync(file),'new matrix route absent');
const html=fs.readFileSync(file,'utf8');
for(const name of ['BimmerCode','BimmerLink','Carly','ProTool','BMW ISTA'])assert(html.includes(name),'missing comparison entry '+name);
for(const slug of slugs){const p='src/content/articles/'+slug+'.md';assert(fs.existsSync(p),'source deleted '+slug);assert(fs.readFileSync(p,'utf8').includes(path),'backlink missing '+slug);assert(html.includes('/guides/'+slug+'/'),'source link missing '+slug);assert(fs.existsSync('dist/guides/'+slug+'/index.html'),'published page missing '+slug)}
for(const fileName of ['software-control-planes.svg','software-control-planes-mobile.svg','verification-chain.svg','verification-chain-mobile.svg']){assert(fs.existsSync('dist/images/tools/bmw-diagnostic-software-comparison/'+fileName),'missing SVG '+fileName);assert(html.includes(fileName),'image not embedded '+fileName)}
for(const hub of ['software','comparisons'])assert(fs.readFileSync('dist/'+hub+'/index.html','utf8').includes(path),'hub link missing '+hub);
for(const slug of slugs)assert(!fs.readFileSync('public/_redirects','utf8').includes('/guides/'+slug+'/'),'unapproved redirect '+slug);
assert(!html.includes('data-affiliate-link'),'no affiliate placements on matrix');
assert(html.includes('rel="canonical"')&&html.includes(path),'self-canonical absent');
assert(html.includes('id="job"')&&html.includes('id="product"'),'filter inputs missing');
let changed=[];try{changed=execFileSync('git',['diff','--name-only','origin/main','--','src/content/articles/'],{encoding:'utf8'}).split('\n').filter(Boolean)}catch(e){console.warn('Source whitelist diff requires origin/main reference: '+e.message)}
if(changed.length){assert(changed.length===slugs.length,'Only ten approved specialist files can change; actual '+changed.length);for(const file of changed)assert(slugs.includes(file.replace('src/content/articles/','').replace('.md','')),'Unapproved article changed: '+file)}
const count=fs.readdirSync('src/content/articles').filter(n=>n.endsWith('.md')).length;assert(count===69,'69 legacy articles expected, got '+count);
const editorialFiles=['src/pages/tools/bmw-diagnostic-software-comparison/index.astro','src/components/SoftwareComparisonResearch.astro','src/components/SoftwareUseCaseDeepDive.astro'];
let editorialWords=0;
for(const editorialFile of editorialFiles){let source=fs.readFileSync(editorialFile,'utf8');if(editorialFile.includes('/pages/'))source=source.slice(source.indexOf('<BaseLayout'),source.indexOf('<script>'));editorialWords+=source.replace(/<[^>]*>/g,' ').replace(/\{[^{}]*\}/g,' ').split(/\s+/).filter(Boolean).length}
assert(editorialWords>=3200,'Destination content below editorial length floor: '+editorialWords);
for(const phrase of ['BimmerCode','BimmerLink','Carly','ProTool','ISTA','manufacturer','license','battery','adapter'])assert(html.toLowerCase().includes(phrase.toLowerCase()),'Editorial coverage missing '+phrase);
for(const hostname of ['bimmercode.app','bimmerlink.app','mycarly.com','bimmergeeks.net','bmwtechinfo.bmwgroup.com'])assert(html.includes(hostname),'Primary official source not cited: '+hostname);
console.log('Chassis Wave 2 PASS: 69 original articles, ten source links, five software categories, four original SVGs, two hubs, >3200 body words, official vendor sources, no redirects, no affiliate units.');
