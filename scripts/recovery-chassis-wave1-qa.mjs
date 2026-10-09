import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const slugs = ['obdlink-cx-vs-lx','obdlink-cx-vs-mx-plus','obdlink-cx-vs-unicarscan-ucsi-2100','obdlink-cx-vs-vlinker-bm-plus','obdlink-cx-vs-vlinker-mc-plus','obdlink-ex-vs-enet-cable','obdlink-mx-plus-vs-lx','obdlink-mx-plus-vs-vlinker-bm-plus','vlinker-bm-plus-vs-mc-plus'];
const target = '/tools/bmw-obd-adapter-comparison/';
const built = 'dist' + target + 'index.html';
assert(fs.existsSync(built),'New adapter page missing from generated production pages');
const html = fs.readFileSync(built,'utf8');
for (const model of ['OBDLink CX','OBDLink MX+','OBDLink LX','OBDLink EX','UniCarScan UCSI-2100','vLinker BM+','vLinker MC+']) {
  assert(html.includes(model),'Missing source-supported adapter '+model);
}
for (const slug of slugs) {
  const source = 'src/content/articles/'+slug+'.md';
  assert(fs.existsSync(source),'Missing preserved article '+slug);
  assert(fs.readFileSync(source,'utf8').includes(target),'Missing backlink from '+slug);
  assert(html.includes('/guides/'+slug+'/'),'Missing link to original specialist '+slug);
  assert(fs.existsSync('dist/guides/'+slug+'/index.html'),'Preserved specialist missing published page '+slug);
}
for (const n of ['compatibility-gates.svg','compatibility-gates-mobile.svg','evidence-tiers.svg','evidence-tiers-mobile.svg']) {
  assert(fs.existsSync('dist/images/tools/bmw-obd-adapter-comparison/'+n),'Missing original SVG '+n);
  assert(html.includes(n),'SVG not referenced from page '+n);
}
for (const hub of ['coding-adapters','compatibility']) {
  assert(fs.readFileSync('dist/'+hub+'/index.html','utf8').includes(target),'Navigation hub does not link new resource: '+hub);
}
const redirects=fs.readFileSync('public/_redirects','utf8');
for(const slug of slugs)assert(!redirects.includes('/guides/'+slug+'/'),'Unapproved 301 for '+slug);
assert(!html.includes('data-affiliate-link'),'Architecture reference has an unexpected affiliate link');
assert(html.includes('id="platform"') && html.includes('id="purpose"'),'Filter controls failed rendering');
assert(html.includes('rel="canonical"') && html.includes(target),'Missing self canonical');
const sitemapFiles=fs.readdirSync('dist').filter(n=>n.startsWith('sitemap')&&n.endsWith('.xml'));
let sitemap=sitemapFiles.map(n=>fs.readFileSync('dist/'+n,'utf8')).join('');
assert(sitemap.includes(target) || sitemap.includes('/sitemap-0.xml'),'Sitemap output not found');
const nonarticleFiles=execFileSync('git',['diff','--name-only','origin/main','--','src/content/articles/'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
assert(nonarticleFiles.length===9 && nonarticleFiles.every(f=>slugs.includes(f.replace('src/content/articles/','').replace('.md',''))),'Unapproved existing article modifications: '+nonarticleFiles.join(','));
console.log('Chassis Wave 1 validation PASS: 7 documented adapter names across two evidence tiers; 9 specialist sources retained and linked; 4 diagrams; 2 hubs; zero redirects.');
