import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const ok=(condition,message)=>{if(!condition)throw new Error(message)};
const diagnosticSlugs=['bmw-no-communication-with-obd-scanner','bmw-frm-module-diagnostic-tool','bmw-battery-drain-diagnostic-tool','bmw-vanos-diagnostic-tool','bmw-electric-parking-brake-service-mode-scanner','bmw-electronic-water-pump-diagnostic-tool','bmw-wheel-speed-sensor-diagnostic-tool','bmw-steering-angle-sensor-calibration-tool','bmw-dpf-regeneration-scan-tool','bmw-ride-height-calibration-scan-tool','bmw-parking-sensor-diagnostic-tool','bmw-transfer-case-adaptation-reset-tool'];
const pricingSlugs=['bimmercode-pricing','bimmerlink-pricing','carly-subscription-cost','protool-pricing','bmw-scanner-without-subscription','bimmercode-vs-protool','bimmerlink-vs-carly','protool-vs-ista'];
const all=[...diagnosticSlugs,...pricingSlugs];
const routes=[{route:'/guides/bmw-module-troubleshooting/',folder:'guides/bmw-module-troubleshooting',pics:['diagnostic-evidence-ladder.svg','diagnostic-evidence-ladder-mobile.svg','diagnostic-failure-domains.svg','diagnostic-failure-domains-mobile.svg'],slugs:diagnosticSlugs},
 {route:'/tools/bmw-diagnostic-software-price-ledger/',folder:'tools/bmw-diagnostic-software-price-ledger',pics:['ownership-cost-components.svg','ownership-cost-components-mobile.svg','entitlement-decision.svg','entitlement-decision-mobile.svg'],slugs:pricingSlugs}];
const main=fs.readdirSync('src/content/articles').filter(s=>s.endsWith('.md'));ok(main.length===69,'Article count changed: '+main.length);
const generatedSitemaps=fs.readdirSync('dist').filter(s=>/^sitemap.*\.xml$/.test(s)).map(s=>fs.readFileSync('dist/'+s,'utf8')).join('\n');
ok(fs.existsSync('dist/sitemap-index.xml'),'Missing auto-generated sitemap index');
for(const {route,folder,pics,slugs} of routes){
 const output='dist'+route+'index.html';ok(fs.existsSync(output),'Missing new page '+route);
 const html=fs.readFileSync(output,'utf8');
 ok(generatedSitemaps.includes('https://chassissignal.com'+route),'Sitemap missing '+route);
 for(const name of ['article-header shell','article-layout article-layout--no-hero','class="prose tool-article-prose"','class="key-findings"','class="toc"','evidence-panel','related-grid'])ok(html.includes(name),'Native article presentation missing '+name+' on '+route);
 ok(html.includes('rel="canonical"')&&html.includes(route),'Wrong canonical '+route);
 for(const pic of pics){ok(fs.existsSync('dist/images/'+folder+'/'+pic),'Missing SVG '+pic);ok(html.includes(pic),'SVG not rendered '+pic)}
 for(const slug of slugs){ok(html.includes('/guides/'+slug+'/'),'Related article link absent: '+slug);const p='src/content/articles/'+slug+'.md';ok(fs.existsSync(p),'Existing article source missing: '+slug);ok(fs.existsSync('dist/guides/'+slug+'/index.html'),'Existing article route not generated '+slug);ok(fs.readFileSync(p,'utf8').includes(route),'Backlink missing from '+slug)}
 const relatedPosition=html.lastIndexOf('id="related-guides"');ok(relatedPosition>html.lastIndexOf('id="sources"')&&relatedPosition>html.lastIndexOf('id="source-ledger"'),'Related section not at end '+route);
 ok(!html.includes('data-affiliate-link'),'Unexpected affiliate placement in '+route);
 ok(html.includes('10 October 2026'),'Missing current evidence-review label '+route);
}
const module=fs.readFileSync('dist/guides/bmw-module-troubleshooting/index.html','utf8');
ok(module.includes('id="area"')&&module.includes('id="empty-state"'),'Symptom finder elements missing');
const pricing=fs.readFileSync('dist/tools/bmw-diagnostic-software-price-ledger/index.html','utf8');
for(const host of ['apps.apple.com','bimmergeeks.net','mycarly.com','bmwtechinfo.bmwgroup.com'])ok(pricing.includes(host),'Source domain missing '+host);
for(const input of ['license','years','adapter','host','extra','quote'])ok(pricing.includes('id="'+input+'"'),'Calculator input missing '+input);
for(const amount of ['$49.99','$39.99','$9.99','$174.99','$2,700']) {
 if(amount==='$2,700')continue;
 ok(pricing.includes(amount),'Expected source-quoted amount absent '+amount);
}
ok(pricing.includes('Get exact quote'),'Carly exact quote incorrectly filled');
const targetPaths=execFileSync('git',['diff','--name-only','origin/main','--','src/content/articles/'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
ok(targetPaths.length===all.length,'Only twenty existing specialists should change, got '+targetPaths.length);
for(const p of targetPaths){const slug=p.replace('src/content/articles/','').replace('.md','');ok(all.includes(slug),'Unapproved article edit '+p);
 const original=execFileSync('git',['show','origin/main:'+p],{encoding:'utf8'});
 const current=fs.readFileSync(p,'utf8');
 const svgPaths=[...original.matchAll(/\/images\/[^\s"'()]+\.svg/g)].map(x=>x[0]);
 for(const asset of svgPaths)ok(current.includes(asset),'Preexisting article SVG lost '+slug+': '+asset);
 const oldBody=original.replace(/updatedAt: 2026-\d\d-\d\d/g,'updatedAt: DATE');
 const newBody=current.replace(/updatedAt: 2026-\d\d-\d\d/g,'updatedAt: DATE');
 ok(newBody.startsWith(oldBody),'Original article content altered, not just appended: '+slug);
}
const changedAssets=execFileSync('git',['diff','--name-only','origin/main','--','public/images/'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
ok(changedAssets.length===8,'Exactly eight SVGs expected, got '+changedAssets.length);
for(const p of changedAssets)ok(p.startsWith('public/images/guides/bmw-module-troubleshooting/')||p.startsWith('public/images/tools/bmw-diagnostic-software-price-ledger/'),'Modified an unrelated original visual '+p);
const redirects=fs.readFileSync('public/_redirects','utf8').trim().split(/\r?\n/);
ok(redirects.length===2&&redirects.includes('/home / 301')&&redirects.includes('/articles /research/ 301'),'Unexpected or missing 301 mapping');
for(const hub of ['guides','scanners','battery-service-tools','software','comparisons','research']){
 const html=fs.readFileSync('dist/'+hub+'/index.html','utf8');
 if(['guides','scanners','battery-service-tools','research'].includes(hub))ok(html.includes('/guides/bmw-module-troubleshooting/'),'Symptom hub undiscoverable from '+hub);
 if(['software','comparisons','battery-service-tools','research'].includes(hub))ok(html.includes('/tools/bmw-diagnostic-software-price-ledger/'),'Pricing ledger undiscoverable from '+hub);
}
const editorial=[{files:['src/pages/guides/bmw-module-troubleshooting.astro','src/components/ModuleTroubleshootingResearch.astro','src/components/ModuleTroubleshootingScenarios.astro'],floor:2500},
 {files:['src/pages/tools/bmw-diagnostic-software-price-ledger/index.astro','src/components/PricingEntitlementResearch.astro','src/components/PricingDecisionCases.astro'],floor:2700}];
for(const {files,floor} of editorial){
 let words=0;
 for(const p of files){let t=fs.readFileSync(p,'utf8');if(p.includes('src/pages/'))t=t.slice(t.indexOf('<ResearchToolArticleLayout'),t.indexOf('<script'));words+=t.replace(/<[^>]*>/g,' ').replace(/\{[^{}]*\}/g,' ').trim().split(/\s+/).filter(Boolean).length}
 ok(words>=floor,'Research too short '+files[0]+': '+words+' expected '+floor);
 console.log('Source-prose words approx '+files[0]+' '+words);
}
console.log('Wave 5 PASS: 2 article-style resources, 8 original SVGs, 20 preserved and linked guides, 69 old article sources, 301s, sitemaps, price evidence and ownership UI.');
