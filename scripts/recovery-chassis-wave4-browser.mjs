import {chromium} from 'playwright-core';
const browser=await chromium.launch();
const errors=[];
for(const width of [390,768,1280]){
 const page=await browser.newPage({viewport:{width,height:900}});
 for(const path of ['/tools/bmw-vehicle-interface-compatibility/','/guides/bmw-diagnostic-interface-map/']){
  const response=await page.goto('http://127.0.0.1:4399'+path,{waitUntil:'networkidle'});
  if(response.status()!==200)errors.push('HTTP '+path+' '+width);
  if(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2))errors.push('unexpected overflow '+path+' '+width);
  if(await page.locator('h1').count()!==1)errors.push('H1 count '+path);
  if(await page.locator('nav[aria-label="Table of contents"] a').count()<5)errors.push('TOC links '+path);
  if(await page.locator('#related-guides a[href^="/guides/"]').count()<7)errors.push('related articles '+path);
 }
 await page.goto('http://127.0.0.1:4399/tools/bmw-vehicle-interface-compatibility/',{waitUntil:'networkidle'});
 const rows=page.locator('tbody tr[data-generation]');
 if(await rows.count()!==10)errors.push('initial evidence rows '+width);
 await page.locator('#generation').selectOption('I');
 await page.locator('#job').selectOption('diagnosis');
 if(await page.locator('#empty').isHidden())errors.push('expected empty evidence state '+width);
 await page.locator('#job').selectOption('mobile');
 const n=await rows.evaluateAll(a=>a.filter(x=>!x.hidden).length);
 if(n!==1)errors.push('I series filter expected 1 got '+n+' at '+width);
 await page.locator('#job').selectOption('workshop');
 const m=await rows.evaluateAll(a=>a.filter(x=>!x.hidden).length);
 if(m!==1)errors.push('workshop override expected 1 got '+m+' at '+width);
 await page.close();
}
await browser.close();
console.log(JSON.stringify({widths:[390,768,1280],errors}));
if(errors.length)process.exitCode=1;
