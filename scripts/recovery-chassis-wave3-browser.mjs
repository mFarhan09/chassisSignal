import {chromium} from 'playwright-core';
const browser=await chromium.launch();
const issues=[];
for(const width of [390,768,1280]) {
 const p=await browser.newPage({viewport:{width,height:900}});
 const res=await p.goto('http://127.0.0.1:4399/tools/bmw-scanner-capability-database/',{waitUntil:'networkidle'});
 if(res.status()!==200)issues.push('http '+width);
 if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2))issues.push('overflow '+width);
 const rows=p.locator('tr[data-maker]');
 if(await rows.count()!==5)issues.push('row count '+width);
 await p.locator('#manufacturer').selectOption('Autel');
 if(await rows.evaluateAll(a=>a.filter(x=>!x.hidden).length)!==2)issues.push('Autel filter '+width);
 await p.locator('#rowtype').selectOption('family');
 if(await p.locator('#empty').isHidden())issues.push('empty state '+width);
 await p.locator('#manufacturer').selectOption('Launch');
 if(await rows.evaluateAll(a=>a.filter(x=>!x.hidden).length)!==1)issues.push('family filter '+width);
 const cards=await p.locator('section:last-of-type .related-grid article').count();
 if(cards!==12)issues.push('related card count '+width+': '+cards);
 await p.close();
}
await browser.close();
console.log(JSON.stringify({viewports:[390,768,1280],issues}));
if(issues.length)process.exitCode=1;
