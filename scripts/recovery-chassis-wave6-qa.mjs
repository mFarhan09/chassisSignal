import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const check=(condition,message)=>{if(!condition)throw Error(message)};
const slugs=['bmw-service-reset-tool','bmw-battery-registration-scanner','bmw-injector-coding-tool','ista-valvetronic-relearn','bmw-transfer-case-adaptation-reset-tool','bmw-electric-parking-brake-service-mode-scanner','bmw-brake-bleed-scan-tool','bmw-steering-angle-sensor-calibration-tool','bmw-tpms-diagnostic-tool','bmw-dpf-regeneration-scan-tool','bmw-electronic-water-pump-diagnostic-tool','bmw-ride-height-calibration-scan-tool','bmw-bidirectional-scan-tool-functions','bmw-coding-vs-programming'];
const route='/tools/bmw-service-function-matrix/';
const htmlFile='dist'+route+'index.html';check(fs.existsSync(htmlFile),'Wave 6 destination not built');
const html=fs.readFileSync(htmlFile,'utf8');
for(const marker of ['article-header shell','article-layout article-layout--no-hero','class="prose tool-article-prose"','class="toc"','key-findings','evidence-panel','id="related-guides"','id="kind"','id="risk"','id="empty-state"'])check(html.includes(marker),'missing native Chassis presentation or task control: '+marker);
check(html.includes('rel="canonical"')&&html.includes(route),'missing self-canonical');
check(!html.includes('data-affiliate-link'),'unapproved affiliate placement');
for(const term of ['Battery registration','Valvetronic','parking brake','DPF','TPMS','ECU software programming','BMW Group','Autel'])check(html.toLowerCase().includes(term.toLowerCase()),'service content missing: '+term);
const svgNames=['service-operation-ladder.svg','service-operation-ladder-mobile.svg','eligibility-proof-chain.svg','eligibility-proof-chain-mobile.svg'];
for(const name of svgNames){const file='dist/images/tools/bmw-service-function-matrix/'+name;check(fs.existsSync(file),'original SVG missing '+name);check(html.includes(name),'SVG not referenced '+name)}
const src=fs.readdirSync('src/content/articles').filter(s=>s.endsWith('.md'));check(src.length===69,'original 69 article source inventory changed');
const modified=execFileSync('git',['diff','--name-only','origin/main','--','src/content/articles/'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
check(modified.length===slugs.length,'only fourteen specialist source files should change, saw '+modified.length);
for(const changed of modified)check(slugs.includes(changed.replace('src/content/articles/','').replace('.md','')),'unauthorized specialist changed: '+changed);
for(const slug of slugs){
 const source='src/content/articles/'+slug+'.md',original=execFileSync('git',['show','origin/main:'+source],{encoding:'utf8'}),current=fs.readFileSync(source,'utf8');
 check(current.startsWith(original),'original research overwritten instead of append-only '+slug);
 const existing=[...original.matchAll(/\/images\/[^\s"'()]+\.svg/g)].map(m=>m[0]);
 for(const figure of existing)check(current.includes(figure),'lost original figure '+figure);
 check(current.includes(route),'no reciprocal internal link '+slug);
 check(html.includes('/guides/'+slug+'/'),'new related section lacks article '+slug);
 check(fs.existsSync('dist/guides/'+slug+'/index.html'),'old article route no longer built '+slug);
}
const assetDiff=execFileSync('git',['diff','--name-only','origin/main','--','public/images/'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
check(assetDiff.length===4,'expected exactly 4 new wave6 SVG files; actual '+assetDiff.length);
for(const p of assetDiff)check(p.startsWith('public/images/tools/bmw-service-function-matrix/')&&p.endsWith('.svg'),'modified unrelated existing image '+p);
check(html.lastIndexOf('id="related-guides"')>html.lastIndexOf('id="sources"'),'related articles must come after sources at end');
for(const hub of ['battery-service-tools','guides','scanners','research'])check(fs.readFileSync('dist/'+hub+'/index.html','utf8').includes(route),'hub fails to link new matrix '+hub);
const sitemapFiles=fs.readdirSync('dist').filter(s=>/^sitemap.*\.xml$/.test(s));check(sitemapFiles.includes('sitemap-index.xml'),'sitemap-index missing');
check(sitemapFiles.map(s=>fs.readFileSync('dist/'+s,'utf8')).join('\n').includes('https://chassissignal.com'+route),'new URL not in XML sitemap');
const redirects=fs.readFileSync('public/_redirects','utf8').trim().split(/\r?\n/);check(redirects.length===2&&redirects.includes('/home / 301')&&redirects.includes('/articles /research/ 301'),'unexpected redirect change');
const docs=['src/pages/tools/bmw-service-function-matrix/index.astro','src/components/ServiceFunctionResearch.astro','src/components/ServiceFunctionCases.astro'];let words=0;
for(const doc of docs){let content=fs.readFileSync(doc,'utf8');if(doc.includes('/pages/'))content=content.slice(content.indexOf('<ResearchToolArticleLayout'),content.indexOf('<script>'));words+=content.replace(/<[^>]*>/g,' ').replace(/\{[^{}]*\}/g,' ').split(/\s+/).filter(Boolean).length}
check(words>=3200,'content below substantial editorial threshold: '+words);
for(const host of ['bmwtechinfo.bmwgroup.com','autel.com','bimmerlink.app','bimmercode.app'])check(html.includes(host),'primary source URL missing '+host);
console.log('WAVE 6 PASS:',{editorialWords:words,existingGuides:src.length,reciprocalSpecialists:slugs.length,svgAssets:assetDiff.length,sitemap:true,redirectChanges:0});
