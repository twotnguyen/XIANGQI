#!/usr/bin/env node
// Checks planning artifacts only. Does not run application tests or assert runtime PASS.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const dir=join(root,'docs/10-issues');
const errors=[];
const read=p=>readFileSync(p,'utf8');
const issueFiles=readdirSync(dir).filter(n=>/^ISSUE-\d{3}\.md$/.test(n)).sort();
const issues=new Map();
const depIds=text=>Array.from(text.matchAll(/(\d{3})(?:[–-](\d{3}))?/g)).flatMap(([,a,b])=>b?Array.from({length:Number(b)-Number(a)+1},(_,i)=>String(Number(a)+i).padStart(3,'0')):[a]);
for(const file of issueFiles){
 const id=file.slice(6,9),s=read(join(dir,file));
 const deps=s.match(/\*\*Phụ thuộc:\*\* (.*?) ·/);
 if(!deps)errors.push(`${file}: missing dependency header`);
 const depsText=deps?.[1]??'';
 issues.set(id,{text:s,depsText,deps:depIds(depsText)});
 if(!s.includes(`ISSUE-${id}`))errors.push(`${file}: title ID`);
 for(const label of ['MỤC TIÊU','ĐỌC TRƯỚC','PHẠM VI','PASS','BẰNG CHỨNG'])if(!s.includes(label))errors.push(`${file}: missing ${label}`);
 if(!/```(?:bash|sh)/.test(s))errors.push(`${file}: missing executable command block`);
 if(!/tests\/[^`\s]+\.(?:test|spec)\.(?:ts|tsx)|tests\/bootstrap\/[^`\s]+\.mjs|scripts\/[^`\s]+\.(?:mjs|ts)/.test(s))errors.push(`${file}: missing test/verification path`);
 if(!/\b(?:[TG]\d{3}-\d+|TS-[A-Z]+-\d+)/.test(s)&&id!=='112')errors.push(`${file}: missing test IDs`);
 if(!/\[ \]/.test(s))errors.push(`${file}: missing checklist`);
 if(/\bTBD\b|<implement here>|làm tương tự issue trước/.test(s))errors.push(`${file}: unresolved implementation placeholder`);
 if(!s.includes('AC-COVERAGE.md'))errors.push(`${file}: missing AC responsibility reference`);
}
for(let i=1;i<=138;i++)if(!issues.has(String(i).padStart(3,'0')))errors.push(`Missing issue ${i}`);
if(issues.size!==138)errors.push(`Expected138 issues, got${issues.size}`);
const color=new Map(),trail=[];
function visit(id){
 if(color.get(id)===1){errors.push(`Cycle ${[...trail,id].join(' → ')}`);return;}
 if(color.get(id)===2)return;
 color.set(id,1);trail.push(id);
 for(const dep of issues.get(id)?.deps??[]){if(!issues.has(dep))errors.push(`${id}: missing dependency${dep}`);else visit(dep);}
 trail.pop();color.set(id,2);
}
for(const id of issues.keys())visit(id);
function ancestors(id,seen=new Set()){
 for(const dep of issues.get(id)?.deps??[])if(!seen.has(dep)){seen.add(dep);ancestors(dep,seen);}
 return seen;
}
for(let n=118;n<=124;n++)if(!ancestors(String(n)).has('032'))errors.push(`${n}: missing AI gate032`);
for(let n=113;n<=117;n++)if(!ancestors(String(n)).has('112'))errors.push(`${n}: missing media gate112`);
for(let n=1;n<=135;n++)if(n!==53&&!ancestors('136').has(String(n).padStart(3,'0')))errors.push(`Local acceptance136 misses dependency${n}`);
for(const dep of ['053','136'])if(!ancestors('137').has(dep))errors.push(`Internet acceptance137 misses dependency${dep}`);
const orderPath=join(dir,'EXECUTION-ORDER.md');
if(existsSync(orderPath)){
 const order=Array.from(read(orderPath).matchAll(/^\| \d+ \| \[ISSUE-(\d{3})/gm),m=>m[1]),done=new Set();
 for(const id of order){for(const dep of issues.get(id)?.deps??[])if(!done.has(dep))errors.push(`Execution order${id} before dependency${dep}`);if(done.has(id))errors.push(`Duplicate execution order${id}`);done.add(id);}
 if(done.size!==138)errors.push(`Execution order size${done.size}`);
}else errors.push('Missing EXECUTION-ORDER.md');
const index=read(join(dir,'INDEX.md'));let indexRows=0;
for(const line of index.split('\n')){
 const m=line.match(/^\| (?:\*\*)?(\d{3})(?:\*\*)? \|/);if(!m)continue;indexRows++;
 const issue=issues.get(m[1]);if(!issue){errors.push(`Index unknown${m[1]}`);continue;}
 const expected=issue.depsText==='không có'?'—':issue.depsText;
 if(line.split('|')[3].trim()!==expected)errors.push(`Index dependency differs${m[1]}`);
}
if(indexRows!==138)errors.push(`Index rows${indexRows}`);
const registry=read(join(root,'docs/06-acceptance/requirement-register.md'));
const acIds=new Set(Array.from(registry.matchAll(/^\| `(AC-[A-Z]+-\d+)`/gm),m=>m[1]));
const matrix=read(join(dir,'AC-COVERAGE.md'));const mappings=Array.from(matrix.matchAll(/^\| `(AC-[A-Z]+-\d+)` \| \[ISSUE-(\d{3})\]/gm));
const mapped=new Set();
for(const [,ac,id]of mappings){
 if(mapped.has(ac))errors.push(`Duplicate AC ${ac}`);mapped.add(ac);
 if(!acIds.has(ac))errors.push(`Unknown AC ${ac}`);
 if(!issues.has(id))errors.push(`AC${ac} missing owner${id}`);
 else if(!issues.get(id).text.includes(ac))errors.push(`${ac}: owner${id} lacks backlink`);
}
for(const ac of acIds)if(!mapped.has(ac))errors.push(`Unassigned AC${ac}`);
const allPlans=readdirSync(dir).filter(f=>f.endsWith('.md'));
for(const name of allPlans){
 const file=join(dir,name);let s=read(file).replace(/```[^\n]*\n[\s\S]*?```/g,'').replace(/`[^`\n]*`/g,'');
 for(const [,url]of s.matchAll(/\[[^\]\n]+\]\(([^)]+)\)/g)){
  if(/^[a-z]+:/i.test(url)||url.startsWith('#'))continue;
  const target=decodeURIComponent(url.split('#')[0].replace(/^<|>$/g,''));
  if(target&&!existsSync(resolve(dirname(file),target)))errors.push(`${name}: broken link${target}`);
 }
}
const stats={issues:issues.size,dependencyEdges:[...issues.values()].reduce((a,i)=>a+i.deps.length,0),indexRows,canonicalAc:acIds.size,assignedAc:mapped.size,errors};
console.log(JSON.stringify(stats,null,2));
if(errors.length)process.exitCode=1;
