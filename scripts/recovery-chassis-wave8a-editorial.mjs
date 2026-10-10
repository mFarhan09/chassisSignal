#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {consolidatedRedirects} from '../src/data/consolidated-redirects.mjs';
const assert=(x,why)=>{if(!x)throw Error(why)};
const snapshot=JSON.parse(fs.readFileSync('recovery/data/chassis-forensic-audit-2026-10-04.json','utf8'));
const strategy=JSON.parse(fs.readFileSync('recovery/data/chassis-wave8a-editorial-decisions.json','utf8'));
const rows=snapshot.rows;
assert(rows.length===65,'Original Chassis audit must contain 65 rows');
const groups=Object.groupBy(rows,r=>r.action);
for(const [action,count] of Object.entries({'SUBSTANTIAL REBUILD':26,'REDIRECT AFTER MERGE':19,'MERGE':13,'KEEP + MINOR IMPROVEMENT':5,'CONVERT TO DATABASE/TOOL':2}))assert(groups[action]?.length===count,'Original audit action mix changed: '+action);
const merged=[...(groups.MERGE||[]),...(groups['REDIRECT AFTER MERGE']||[])];
assert(Object.keys(consolidatedRedirects).length===merged.length,'Audit merge count != redirect map');
for(const entry of merged){
 const slug=new URL(entry.url).pathname.split('/').filter(Boolean).at(-1);
 assert(consolidatedRedirects[slug]===entry.merge_target,'Audit-to-redirect mismatch for '+slug);
}
const originals=fs.readdirSync('src/content/articles').filter(n=>n.endsWith('.md'));
assert(originals.length===69,'Original Markdown inventory is no longer 69');
const rebuild=groups['SUBSTANTIAL REBUILD'];
assert(Object.keys(strategy.entries).length===26,'Editorial decision map must include exactly 26 candidates');
const outputDir=process.env.WAVE8A_EDITORIAL_OUTPUT||'reports/recovery/wave8a-editorial';
fs.mkdirSync(outputDir,{recursive:true});
function numeric(x){const n=Number(x);return Number.isFinite(n)?n:null}
const out=[];
for(const original of rebuild){
 const slug=new URL(original.url).pathname.split('/').filter(Boolean).at(-1);
 const dec=strategy.entries[slug];
 assert(dec,'Missing audit decision for '+slug);
 assert(dec.originalPriority===original.priority,'Mismatched historic priority '+slug);
 assert(!consolidatedRedirects[slug],'A rebuild candidate is unexpectedly redirected: '+slug);
 const filepath='src/content/articles/'+slug+'.md';
 assert(fs.existsSync(filepath),'Missing content source '+filepath);
 const source=fs.readFileSync(filepath,'utf8');
 const body=source.replace(/^---[\s\S]*?---\s*/,'');
 const wordCount=body.replace(/<[^>]*>/g,' ').replace(/\{[^}]*\}/g,' ').trim().split(/\s+/).filter(Boolean).length;
 const headings=[...body.matchAll(/^## (.+)$/gm)].map(x=>x[1]);
 const svgPaths=[...new Set([...source.matchAll(/\/images\/guides\/[^\s"'()<>]+\.svg/g)].map(x=>x[0]))];
 const externalLinks=[...new Set([...source.matchAll(/https?:\/\/[^\s"'()<>)]+/g)].map(x=>x[0].replace(/[.,;]+$/,'')))].filter(x=>!x.startsWith('https://chassissignal.com/'));
 const related=[...new Set([...source.matchAll(/\/(?:tools|guides)\/[a-z0-9/-]+\/?/g)].map(x=>x[0]))];
 const readRevisions=[...source.matchAll(/updatedAt:\s*([^\s]+)/g)].map(x=>x[1]);
 const historicalImpressions=numeric(original.export_period_impressions);
 const historicalPosition=numeric(original.export_period_position);
 const shallowFlag=wordCount<1200;
 const noDirectSources=externalLinks.length===0;
 const auditSignals={lowContextWordCount:shallowFlag,noDirectExternalUrlInBody:noDirectSources,highTechnicalRisk:/brake|parking.brake|steering|ride.height|dpf|injector|water.pump|valvetronic|transfer.case/i.test(slug),priceVolatility:/pricing|subscription|without.subscription/.test(slug),possibleSharedIntent:dec.action==='INTENT_DECISION_GATE'};
 const historicalPriorityWeight=original.priority==='P1'?50:35;
 const opportunityTieBreaker=Math.min(15,Math.round(Math.log2((historicalImpressions||0)+1)*1.6));
 const triageScore=historicalPriorityWeight+opportunityTieBreaker+(shallowFlag?6:0)+(noDirectSources?8:0)+(auditSignals.highTechnicalRisk?4:0);
 out.push({slug,url:original.url,title:original.current_topic,cluster:original.cluster,searchIntent:original.intent,historical:{impressions:historicalImpressions,averagePosition:historicalPosition,priority:original.priority,confidence:original.confidence,closestInternalCompetitor:original.closest_internal_competitor,overlap:original.intent_overlap,reason:original.reason},current:{sourceWordsApprox:wordCount,h2Sections:headings.length,svgReferences:svgPaths.length,originalSvgReferences:svgPaths,externalUrlsInBody:externalLinks.length,internalLinksInBody:related.length,frontmatterUpdatedAt:readRevisions.at(-1)||null,flaggedSignals:auditSignals},decision:dec.action,editorialGoal:dec.editorialGoal,sourceEvidenceNeeded:dec.verificationNeeded,releaseConditions:dec.releaseConditions,triageScore});
}
out.sort((a,b)=>b.triageScore-a.triageScore || (b.historical.impressions||0)-(a.historical.impressions||0)||a.slug.localeCompare(b.slug));
const p1=out.filter(r=>r.historical.priority==='P1').length, p2=out.length-p1;
const status={date:new Date().toISOString(),source:'October 4 2026 original Chassis forensic CSV + current GitHub article Markdown',cohort:{audited:65,mergedAndRedirected:32,substantialRebuild:26,keepMinor:5,convertToDatabaseOrTool:2,stillIndependentlyDiscoverableGuides:37},rebuildDecisions:{inPlace:out.filter(x=>x.decision==='REBUILD_IN_PLACE').length,intentGate:out.filter(x=>x.decision==='INTENT_DECISION_GATE').length,p1,p2},limitations:['Historical export-period impressions and positions are not current traffic. The audit lacked page-by-date and query-by-page joins.','Word counts and raw external URL counts are screening signals, not an automatic content-quality verdict.','All actions are provisional editorial decisions; no source retired or redirected during 8A.','No fresh top-N live SERP audit, current GSC metrics or independent vehicle testing are claimed.'],records:out};
fs.writeFileSync(path.join(outputDir,'REBUILD_CANDIDATE_AUDIT.json'),JSON.stringify(status,null,2)+'\n');
function cell(x){return String(x??'—').replaceAll('|','\\|')}
const md=['# Chassis Signal Wave 8A — original 26-URL substantive rebuild audit','',
'Prepared '+status.date+' from the user’s October 4 forensic CSV and current retained article Markdown.','',
'## Scope and release interpretation','',
'- Original forensic cohort: **65** audited URLs, comprising **32 merge/redirect**, **26 substantial rebuild**, **5 keep/minor**, and **2 tool/database conversion**.',
'- Audit decisions: **'+status.rebuildDecisions.inPlace+' rebuild-in-place**, **'+status.rebuildDecisions.intentGate+' intent-review gates**, original audit **'+p1+' P1 / '+p2+' P2**.',
'- All 26 articles remain unchanged on this diagnostic Wave 8A branch. No speculative 301s, content deletions, or paid SEO calls.',
'- Ranking below is an **editorial workload triage score**, not Google ranking probability. It uses original P1/P2, historical impression volume, approximate source length, visible direct external links and technical risk; **never** treat it as a substitute for current GSC and SERP evidence.',
'','## Prioritized page-by-page inventory','',
'| Order | Original guide | Audit priority | Historic impressions* | Current approx words | SVG refs | Direct external URLs | Provisional action |',
'|---:|---|---|---:|---:|---:|---:|---|'];
for(const [i,r] of out.entries())md.push('| '+(i+1)+' | `'+r.slug+'` | '+r.historical.priority+' | '+cell(r.historical.impressions)+' | '+r.current.sourceWordsApprox+' | '+r.current.svgReferences+' | '+r.current.externalUrlsInBody+' | '+r.decision+' |');
md.push('','*The October 4 forensic export period—not a new GSC measurement. Daily pre/post data were not available in the source.','',
'## Individual rebuilding briefs and acceptance gates');
for(const [i,r] of out.entries()){
 md.push('',`${i+1}. **${r.title}** — [original page](${r.url})`,
 '- Cluster: `'+r.cluster+'` · Original audit: '+r.historical.priority+' / '+r.historical.confidence+' · Nearest previously reported overlap: '+r.historical.closestInternalCompetitor,
 '- Prior forensic rationale: '+r.historical.reason,
 '- Current source snapshot: ≈'+r.current.sourceWordsApprox+' words, '+r.current.h2Sections+' H2s, '+r.current.svgReferences+' SVG references, '+r.current.externalUrlsInBody+' visible external URLs; original diagrams stay preserved.',
 '- **Decision:** '+r.decision+'. '+r.editorialGoal,
 '- **Verification:** '+r.sourceEvidenceNeeded,
 '- **Exit:** independent task necessity; verifiable first-party claims; complete original evidence/diagram preservation; visual, affiliate, semantic and sitemap QA. For an intent gate, do not redirect without query-by-page evidence and a reviewed source-to-target ledger.');
}
md.push('','## Other forensic closeout categories');
for(const category of ['KEEP + MINOR IMPROVEMENT','CONVERT TO DATABASE/TOOL']){
 md.push('','### '+category);
 for(const item of groups[category]){
  const slug=new URL(item.url).pathname.split('/').filter(Boolean).at(-1);
  md.push('- `'+slug+'` — original priority '+item.priority+'; requested action: '+item.reason+(item.merge_target?' Proposed resource: `'+item.merge_target+'`.':''));
 }
}
md.push('','## Missing external signals and next execution gates','','1. Obtain a post-deployment production 301/sitemap report from Wave 8A’s live monitor and investigate any unexpected 200/302/404/5xx, missing fragments, redirect chains or sitemap leakage.','2. Export GSC page, query, day and indexation data after Wave 7; join pages and queries where available. Compare to pre-update historical baseline, but do not infer a penalty is lifted.','3. Choose the first rebuild cohort using this report and verified recent demand; conduct independent SERP/source research and produce substantial editorial changes, retaining exact relevant diagrams.','4. For the 3 intent-review entries, first decide whether the task is genuinely independent or should be merged into an existing canonical resource, and preserve the source claims/graphics before an approved 301.','5. Close the five minor and two tool-conversion dispositions only after reviewing the actual delivered tool features and original article gaps.','',
'**No SEO recovery or production deployment certification is made by this editorial audit.**');
fs.writeFileSync(path.join(outputDir,'REBUILD_CANDIDATE_AUDIT.md'),md.join('\n')+'\n');
console.log('WAVE 8A EDITORIAL AUDIT PASS',JSON.stringify({cohort:status.cohort,decisions:status.rebuildDecisions,firstFive:out.slice(0,5).map(x=>x.slug),outputDir}));
