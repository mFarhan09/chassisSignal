import { chromium } from 'playwright-core';
const browser = await chromium.launch();
let errors=[];
for (const width of [390,768,1280]) {
 const page=await browser.newPage({viewport:{width,height:900}});
 const r=await page.goto('http://127.0.0.1:4399/tools/bmw-obd-adapter-comparison/',{waitUntil:'networkidle'});
 if(r.status()!==200)errors.push('HTTP '+width);
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2))errors.push('overflow '+width);
 await page.locator('#platform').selectOption('ios');
 const shown=await page.locator('tbody tr[data-transport]').evaluateAll(a=>a.filter(x=>!x.hidden).length);
 if(shown!==2)errors.push('iOS filter '+width);
 await page.locator('#transport').selectOption('USB wired');
 if(await page.locator('#no-results').isHidden())errors.push('empty state '+width);
 await page.close();
}
await browser.close();
console.log(JSON.stringify({checks:9,errors}));
if(errors.length)process.exit(1);
