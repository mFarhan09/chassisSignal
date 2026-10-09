import {chromium} from 'playwright-core';
const browser=await chromium.launch();
const issues=[];
for(const width of [390,768,1280]){
 const page=await browser.newPage({viewport:{width,height:900}});
 const url='http://127.0.0.1:4399/tools/bmw-service-function-matrix/';
 const response=await page.goto(url,{waitUntil:'networkidle'});
 if(response?.status()!==200)issues.push('new article HTTP status '+width);
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2))issues.push('unexpected full-page overflow '+width);
 if(await page.locator('h1').count()!==1)issues.push('H1 count '+width);
 if(await page.locator('nav[aria-label="Table of contents"] a').count()<6)issues.push('missing native article TOC '+width);
 if(await page.locator('#related-guides a[href^="/guides/"]').count()<14)issues.push('missing related article cards '+width);
 if(await page.locator('picture source').count()<2)issues.push('missing mobile SVG source '+width);
 const pictures=await page.locator('picture img').evaluateAll(nodes=>nodes.map(x=>x.currentSrc||x.src));
 for(const src of pictures){const r=await page.request.get(src);if(!r.ok())issues.push('SVG asset not served '+src);}
 const rows=page.locator('tr[data-kind]');if(await rows.count()!==14)issues.push('task row count '+width);
 await page.locator('#kind').selectOption('reset');
 const resetCount=await rows.evaluateAll(nodes=>nodes.filter(x=>!x.hidden).length);
 if(resetCount!==1)issues.push('reset filter expected 1, got '+resetCount+' width='+width);
 await page.locator('#risk').selectOption('critical');
 if(await page.locator('#empty-state').isHidden())issues.push('contradictory filters do not reveal empty state '+width);
 await page.locator('#kind').selectOption('all');
 const critical=await rows.evaluateAll(nodes=>nodes.filter(x=>!x.hidden).length);
 if(critical!==5)issues.push('critical filter expected 5, got '+critical+' width='+width);
 await page.locator('#risk').selectOption('all');
 const restored=await rows.evaluateAll(nodes=>nodes.filter(x=>!x.hidden).length);
 if(restored!==14)issues.push('restored results expected 14, got '+restored+' width='+width);
 await page.close();
}
await browser.close();
console.log(JSON.stringify({testedWidths:[390,768,1280],issues}));
if(issues.length)process.exitCode=1;
