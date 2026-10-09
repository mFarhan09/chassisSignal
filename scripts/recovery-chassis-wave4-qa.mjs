import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const ok=(v,message)=>{if(!v)throw Error(message)};
const routes=['/tools/bmw-vehicle-interface-compatibility/','/guides/bmw-diagnostic-interface-map/'];
const slugs=['bmw-f-series-vs-g-series-obd-adapter','k-dcan-vs-enet-cable','bmw-icom-vs-enet','bmw-icom-vs-k-dcan','bmw-enet-vs-bluetooth-obd','obdlink-ex-vs-enet-cable','bimmerlink-adapter'];
const images=[['tools/bmw-vehicle-interface-compatibility/',['interface-selection.svg','interface-selection-mobile.svg','proof-chain.svg','proof-chain-mobile.svg']],['guides/bmw-diagnostic-interface-map/',['interface-topology.svg','interface-topology-mobile.svg','operation-boundaries.svg','operation-boundaries-mobile.svg']]];
const sitemap=fs.readdirSync('dist').filter(n=>n.startsWith('sitemap')&&n.endsWith('.xml')).map(n=>fs.readFileSync('dist/'+n,'utf8')).join('\n');
ok(fs.existsSync('dist/sitemap-index.xml'),'no sitemap-index.xml');
for(let i=0;i<routes.length;i++){const route=routes[i],h=fs.readFileSync('dist'+route+'index.html','utf8');
 ok(sitemap.includes('https://chassissignal.com'+route),'new route absent from XML sitemap: '+route);
 for(const s of ['article-header shell','article-layout article-layout--no-hero','class="prose tool-article-prose"','class="toc"','key-findings','evidence-panel','related-guides'])ok(h.includes(s),'missing Chassis native article presentation '+s+' on '+route);
 ok(h.includes('rel="canonical"')&&h.includes(route),'canonical error '+route);
 const [folder,names]=images[i];for(const n of names){ok(fs.existsSync('dist/images/'+folder+n),'lost new SVG '+n);ok(h.includes(n),'SVG not embedded '+n)}
 for(const slug of slugs)ok(h.includes('/guides/'+slug+'/'),'missing reciprocal original related article '+slug);
 ok(h.indexOf('id="related-guides"')>h.indexOf('id="source-ledger"')||h.indexOf('id="related-guides"')>h.indexOf('id="sources"'),'related articles not at end '+route);
 ok(!h.includes('data-affiliate-link'),'unapproved affiliate on recovery resource');
 for(const host of ['bimmercode.app','bmwtechinfo.bmwgroup.com','bimmergeeks.net'])ok(h.includes(host),'source missing '+host);
}
for(const slug of slugs){const file='src/content/articles/'+slug+'.md';ok(fs.existsSync(file),'source removed '+slug);const s=fs.readFileSync(file,'utf8');for(const route of routes)ok(s.includes(route),'source missing new interface link '+slug+route);ok(fs.existsSync('dist/guides/'+slug+'/index.html'),'article output lost '+slug)}
ok(fs.readdirSync('src/content/articles').filter(x=>x.endsWith('.md')).length===69,'original 69 article source count changed');
const changes=execFileSync('git',['diff','--name-only','origin/main','--','src/content/articles/'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
ok(changes.length===slugs.length,'modified article count not seven: '+changes.length);for(const f of changes)ok(slugs.includes(f.replace('src/content/articles/','').replace('.md','')),'unexpected article edit '+f);
const redirects=fs.readFileSync('public/_redirects','utf8').trim().split(/\r?\n/);
ok(redirects.length===2&&redirects.includes('/home / 301')&&redirects.includes('/articles /research/ 301'),'unapproved redirect modification');
for(const hub of ['compatibility','coding-adapters','guides']){const h=fs.readFileSync('dist/'+hub+'/index.html','utf8');for(const route of routes)ok(h.includes(route),'hub link not discoverable '+hub+route);}
const parts=[['src/pages/tools/bmw-vehicle-interface-compatibility/index.astro','src/components/VehicleInterfaceResearch.astro','src/components/VehicleCaseStudies.astro'],['src/pages/guides/bmw-diagnostic-interface-map.astro','src/components/DiagnosticInterfaceMapResearch.astro','src/components/InterfaceMapCaseStudies.astro']];
for(const docs of parts){let words=0;for(const path of docs){let s=fs.readFileSync(path,'utf8');if(path.startsWith('src/pages/'))s=s.slice(s.indexOf('<ResearchToolArticleLayout'),s.indexOf('<style'));words+=s.replace(/<[^>]*>/g,' ').replace(/\{[^{}]*\}/g,' ').split(/\s+/).filter(Boolean).length}ok(words>=1800,'resource too short '+docs[0]+': '+words);console.log('Editorial length '+docs[0]+': '+words+' words (approx excluding dynamically rendered rows)')}
console.log('Wave 4: native article style, eight new SVGs, 7 original articles preserved, 2 sitemap entries, sources, links, 301 invariants — PASS');
