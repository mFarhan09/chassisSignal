import fs from 'node:fs';
const routes=['bmw-diagnostic-software-comparison','bmw-scanner-capability-database'];
const check=(yes,why)=>{if(!yes)throw new Error(why)};
for(const slug of routes){
 const filename='dist/tools/'+slug+'/index.html';
 check(fs.existsSync(filename),'missing existing resource '+slug);
 const html=fs.readFileSync(filename,'utf8');
 for(const name of ['article-header shell','article-layout article-layout--no-hero','article-dek','article-meta','toc','class="prose tool-article-prose"','evidence-panel','methodology'])check(html.includes(name),'missing article-presentation feature '+name+' for '+slug);
 check(html.includes('aria-label="Table of contents"'),'TOC missing on '+slug);
 check(html.includes('class="key-findings"'),'evidence strip missing '+slug);
 check(html.includes('rel="canonical"'),'canonical missing on '+slug);
 check(html.includes('/guides/'),'related article links missing '+slug);
 const figures=html.match(/<picture>/g)||[];check(figures.length>=2,'original SVG picture elements lost on '+slug);
 check(!html.includes('<main class="software-shell">')&&!html.includes('<main class="capability-shell">'),'nested main remains on '+slug);
}
const matrix=fs.readFileSync('dist/tools/bmw-diagnostic-software-comparison/index.html','utf8');
const rel=matrix.lastIndexOf('id="related-guides"'),sources=matrix.lastIndexOf('id="primary-sources"');
check(rel>sources,'Wave 2 related guides must appear at end after primary sources');
const scanner=fs.readFileSync('dist/tools/bmw-scanner-capability-database/index.html','utf8');
check(scanner.lastIndexOf('id="related-guides"')>scanner.lastIndexOf('id="primary-sources"'),'Wave 3 related guides not at end');
console.log('Article-style QA PASS: both existing resources match standard header, reading layout, TOC, evidence rail and preserved SVGs; related sections at end.');
