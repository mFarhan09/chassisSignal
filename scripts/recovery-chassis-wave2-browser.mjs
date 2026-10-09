import { chromium } from 'playwright-core';
const browser=await chromium.launch();
const findings=[];
for(const width of [390,768,1280]){
 const page=await browser.newPage({viewport:{width,height:900}});
 const response=await page.goto('http://127.0.0.1:4399/tools/bmw-diagnostic-software-comparison/',{waitUntil:'networkidle'});
 if(response?.status()!==200)findings.push('HTTP '+width);
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2))findings.push('overflow '+width);
 const rows=page.locator('tr[data-product]');
 if(await rows.count()!==5)findings.push('five rows '+width);
 await page.locator('#job').selectOption('workshop');
 const chosen=await rows.evaluateAll(a=>a.filter(x=>!x.hidden).map(x=>x.dataset.product));
 if(chosen.length!==1||chosen[0]!=='BMW ISTA')findings.push('workshop filter '+width);
 await page.locator('#product').selectOption('Carly');
 if(await page.locator('#empty').isHidden())findings.push('empty state '+width);
 await page.locator('#job').selectOption('all');
 const next=await rows.evaluateAll(a=>a.filter(x=>!x.hidden).map(x=>x.dataset.product));
 if(next.length!==1||next[0]!=='Carly')findings.push('product filter '+width);
 await page.close();
}
await browser.close();
console.log(JSON.stringify({viewports:[390,768,1280],findings}));
if(findings.length)process.exitCode=1;
