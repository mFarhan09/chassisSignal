// Follow-up gate: preserve the recovered baseline while allowing two additive citation ledgers.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const read=p=>fs.readFileSync(p,'utf8');
const original=p=>execFileSync('git',['show','origin/main:'+p],{encoding:'utf8'});
const citations=new Set(['autel-mk900-bmw-compatibility.md','foxwell-nt710-vs-autel-mk900-bmw.md']);
const files=fs.readdirSync('src/content/articles').filter(p=>p.endsWith('.md'));
assert.equal(files.length,69);
for(const name of files){
 const path='src/content/articles/'+name,before=original(path),after=read(path);
 if(!citations.has(name)){assert.equal(after,before,'Original article changed: '+name);continue;}
 const adjusted=before.replace(/^updatedAt:.*$/m,'updatedAt: 2026-10-11');
 assert.ok(after.startsWith(adjusted),'Citation fix removed original evidence: '+name);
 const added=after.slice(adjusted.length);
 assert.ok(added.includes('## Primary sources and verification scope'));
 assert.ok(added.includes('https://autel.com/mk3/4171.jhtml'));
 assert.ok(added.includes('https://autel.com/u/cms/www/202604/200157383ity.pdf'));
}
for(const path of ['public/_redirects','src/data/consolidated-redirects.mjs','src/affiliate/product-registry.generated.json','src/affiliate/placement-plan.generated.json'])assert.equal(read(path),original(path),'Recovery/affiliate baseline changed: '+path);
for(const slug of ['bmw-diagnostic-software-comparison','bmw-scanner-capability-database']){
 const body=read('dist/tools/'+slug+'/index.html');
 const ids=[...body.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(ids.length,new Set(ids).size,'Duplicate IDs: '+slug);
 assert.equal((body.match(/<h1(?:\s[^>]*)?>/g)||[]).length,1,'Main heading count: '+slug);
 for(const m of body.matchAll(/\bhref="#([^"]+)"/g))assert.ok(ids.includes(m[1]),'Broken fragment: '+slug+'#'+m[1]);
}
console.log('RECOVERY SECOND AUDIT PASS: all 69 originals preserved; two additive citation ledgers; redirects, affiliate baseline and tool fragments verified.');
