from pathlib import Path
import re,json
root=Path(__file__).resolve().parents[2]
items=json.loads((root/'docs/planning/issue-manifest.json').read_text())
errors=[]
ids={x['n'] for x in items}
if ids!=set(range(1,33)): errors.append('Issue IDs not 001..032')
visiting=set();done=set()
def visit(n):
 if n in visiting: errors.append(f'Dependency cycle at {n}');return
 if n in done:return
 visiting.add(n)
 for d in next(x for x in items if x['n']==n)['deps']:
  if d not in ids:errors.append(f'Missing dependency {d}')
  else:visit(d)
 visiting.remove(n);done.add(n)
for x in items:visit(x['n'])
required=['## Mục tiêu và giới hạn','## Tệp và trách nhiệm','## Hợp đồng đầu vào / đầu ra','## Các bước thực hiện','## Tình huống nghiệm thu','## Lệnh kiểm chứng','## Điều kiện hoàn thành']
for x in items:
 p=root/'docs/issues'/x['file'];s=p.read_text()
 for h in required:
  if h not in s:errors.append(f'{p.name}:missing {h}')
 for d in x['deps']:
  if f'ISSUE-{d:03d}' not in s:errors.append(f'{p.name}:missing dependency reference')
 if len(re.findall(r'^\|',s,re.M))<5:errors.append(f'{p.name}:too few acceptance cases')
test_plan=(root/'docs/specs/08-TEST-EXECUTION.md').read_text()
matrix=test_plan.split('## Ma trận test tối thiểu theo issue',1)[1].split('## Fixture terminal',1)[0]
test_rows=re.findall(r'^\| ISSUE-(\d{3}) \|',matrix,re.M)
if sorted(test_rows)!=[f'{n:03d}' for n in range(1,33)]:
 errors.append('Test matrix must contain exactly one row per issue')
for x in items:
 s=(root/'docs/issues'/x['file']).read_text()
 if '08-TEST-EXECUTION.md' not in s or f"T{x['n']:03d}-xx" not in s:
  errors.append(f"{x['file']}:missing test matrix/case ID handoff")
covered=set(r for x in items for r in x['req'])
if covered!={f'R{i:02d}' for i in range(1,17)}:errors.append('Requirement coverage mismatch')
mds=list((root/'docs').rglob('*.md'))+list(root.glob('*.md'))
linkcount=0
for p in mds:
 s=p.read_text(encoding='utf8')
 if '\ufffd' in s:errors.append(f'{p}:encoding')
 if len(re.findall(r'^```',s,re.M))%2:errors.append(f'{p}:unbalanced code fence')
 for label,target in re.findall(r'\[([^\]\n]+)\]\(([^)\n]+)\)',s):
  if target.startswith(('http:','https:','mailto:','#')):continue
  target=target.split('#')[0]
  if not target:continue
  linkcount+=1
  if not (p.parent/target).resolve().exists():errors.append(f'{p.relative_to(root)}:broken link {target}')
 for line in s.splitlines():
  if re.search(r'\b(TBD|CHANGEME|REPLACE_ME)\b',line):errors.append(f'{p}:unresolved placeholder')
print(json.dumps({'markdownFiles':len(mds),'issueCount':len(items),'requirementsCovered':len(covered),'testMatrixRows':len(test_rows),'localLinksChecked':linkcount,'dependencyGraph':'acyclic' if len(done)==32 else 'invalid','errors':errors},ensure_ascii=False,indent=2))
raise SystemExit(1 if errors else 0)
