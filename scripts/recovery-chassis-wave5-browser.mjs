import {chromium} from 'playwright-core';
const browser=await chromium.launch();
const problems=[];
const paths=['/guides/bmw-module-troubleshooting/','/tools/bmw-diagnostic-software-price-ledger/'];
for(const width of [390,768,1280]){
 const page=await browser.newPage({viewport:{width,height:900}});
 for(const p of paths){
  const response=await page.goto('http://127.0.0.1:4399'+p,{waitUntil:'networkidle'});
  if(response?.status()!==200)problems.push('HTTP '+p+' '+width);
  if(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2))problems.push('horizontal page overflow '+p+' '+width);
  if(await page.locator('h1').count()!==1)problems.push('H1 count '+p+' '+width);
  if(await page.locator('nav[aria-label="Table of contents"] a').count()<5)problems.push('missing native TOC '+p+' '+width);
  if(await page.locator('picture source').count()<2)problems.push('mobile original diagrams missing '+p+' '+width);
  const figures=await page.locator('figure picture img').evaluateAll(imgs=>imgs.map(e=>({src:e.currentSrc||e.src,complete:e.complete,naturalWidth:e.naturalWidth})));
  if(figures.some(f=>!f.complete||f.naturalWidth===0))problems.push('SVG not rendered '+p+' '+width);
 }
 await page.goto('http://127.0.0.1:4399/guides/bmw-module-troubleshooting/',{waitUntil:'networkidle'});
 const rows=page.locator('.finder-item');
 if(await rows.count()!==12)problems.push('Module card count '+width);
 await page.locator('#area').selectOption('body');
 const shown=await rows.evaluateAll(list=>list.filter(e=>!e.hidden).length);
 if(shown!==2)problems.push('Body filter expected two, got '+shown+' at '+width);
 await page.locator('#area').selectOption('all');
 const restored=await rows.evaluateAll(list=>list.filter(e=>!e.hidden).length);
 if(restored!==12)problems.push('Restore module filter '+width);
 await page.goto('http://127.0.0.1:4399/tools/bmw-diagnostic-software-price-ledger/',{waitUntil:'networkidle'});
 const read=()=>page.locator('#cost-status').innerText();
 if(!(await read()).includes('incomplete'))problems.push('Unfilled pricing quote needs incomplete state '+width);
 await page.locator('#license').selectOption('protool-master');
 await page.locator('#years').selectOption('3');
 await page.locator('#adapter').fill('49.99');
 await page.locator('#host').fill('0');
 await page.locator('#extra').fill('0');
 if(!(await read()).includes('$224.98'))problems.push('One-time license math '+width+': '+await read());
 await page.locator('#license').selectOption('carly-bmw-premium');
 if(!(await read()).includes('incomplete'))problems.push('Annual unquoted Carly must not invent price '+width);
 await page.locator('#quote').fill('100');
 if(!(await read()).includes('$349.99'))problems.push('Annual Carly math '+width+': '+await read());
 await page.locator('#license').selectOption('bmw-tis-day');
 if(!(await read()).includes('$81.99'))problems.push('TIS day must count once '+width+': '+await read());
 await page.close();
}
await browser.close();
console.log(JSON.stringify({widths:[390,768,1280],pages:paths.length,issues:problems}));
if(problems.length)process.exitCode=1;
