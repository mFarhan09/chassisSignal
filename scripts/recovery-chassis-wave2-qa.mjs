import fs from 'node:fs';
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
const count=fs.readdirSync('src/content/articles').filter(n=>n.endsWith('.md')).length;assert(count===69,'69 legacy articles expected, got '+count);
console.log('Chassis Wave 2 PASS: 69 original articles, ten source links, five software categories, four original SVGs, two hubs, no redirects, no affiliate units.');
