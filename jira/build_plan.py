#!/usr/bin/env python3
"""Generate and validate the current Jira-synchronized plan using Python stdlib.
Source: plan-data.json + descriptions.json + BACKLOG-P1.md + AC-TASK-MAP.json.
Run from any directory: python3 jira/build_plan.py [--check]
--check validates and compares generated artifacts without writing.
"""
import collections,csv,datetime,io,json,re,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
DATA=json.loads((ROOT/'jira/plan-data.json').read_text())
ISSUES=DATA['issues'];BY={x['id']:x for x in ISSUES};TASKS={k:x for k,x in BY.items() if x['type']=='Task'}
ACS=json.loads((ROOT/'jira/AC-TASK-MAP.json').read_text())
DESCRIPTIONS=json.loads((ROOT/'jira/descriptions.json').read_text())
DESCRIPTION_AUDIT=json.loads((ROOT/'jira/description-source-audit.json').read_text())
ASSESSMENT=json.loads((ROOT/'jira/workload-assessment.json').read_text())
LOAD=ASSESSMENT['items']
BASE=datetime.date.fromisoformat(DATA['start_date'])
PEOPLE=['Tình','Đông','Tùng','Cường','Nhạn','Kỳ','Thư']
QA=[k for k,x in TASKS.items() if 'kiem-thu' in x['labels']]
SPRINTS=DATA['sprints']
PRIMARY_COMPONENTS={'FE':'chinh-fe','BE':'chinh-be','QA & DevOps':'chinh-qa-devops'}
GOALS=[s['goal'] for s in DATA['sprint_metadata']]
LIVE=json.loads((ROOT/'jira/current-jira-snapshot.json').read_text())
LIVE_BY={x['key']:x for x in LIVE['issues']}
VERSIONS={v['name']:v for v in DATA['releases']}
TOTAL_HOURS=DATA['total_hours']
def task_points(x):return x['story_points']
def date(slot):return BASE+datetime.timedelta(days=slot//2)
def ds(slot,year=False):return date(slot).strftime('%d/%m/%Y' if year else '%d/%m')
def when(slot):return ds(slot)
def task_group(story):return [x for x in TASKS.values() if x['story']==story]
def story_ids(epic):return [x['id'] for x in ISSUES if x['type']=='Story' and x['parent']==epic]
def ancestors(t):
 out=set()
 def visit(k):
  for d in TASKS[k]['deps']:
   if d not in out:out.add(d);visit(d)
 visit(t);return out
def table(head,rows):return '| '+' | '.join(head)+' |\n|'+'|'.join('---' for _ in head)+'|\n'+''.join('| '+' | '.join(str(c).replace('\n','<br>') for c in row)+' |\n' for row in rows)
def ac_ids(t):return [r['ac'] for r in ACS if r['verification_task']==t]
def sprint_hours(x,n):
 lo,hi=SPRINTS[n-1];return round(x['hours']*max(0,min(hi,x['end_slot'])-max(lo,x['start_slot']))/(x['end_slot']-x['start_slot']),2)
def work_sprints(story):return [n for n in range(1,5) if any(sprint_hours(x,n) for x in task_group(story))]
def story_due(story):return 2*(datetime.date.fromisoformat(BY[story]['due_date'])-BASE).days
def description(key):
 d=DESCRIPTIONS[key]
 parts=['**Mục tiêu**\n\n'+d['goal'],'**Bối cảnh công việc**\n\n'+d['context']]
 for field,label in [('requirements','Yêu cầu cần đáp ứng'),('steps','Việc cần làm'),('deliverables','Kết quả bàn giao'),('acceptance','Điều kiện hoàn thành')]:
  parts.append('**'+label+'**\n\n'+'\n'.join('- '+item for item in d[field]))
 parts.append('**Phạm vi và phối hợp**\n\n'+d['boundary'])
 return '\n\n'.join(parts)
def task_description(x):return description(x['id'])
def validate():
 assert collections.Counter(x['type'] for x in ISSUES)=={'Epic':9,'Story':27,'Task':71}
 assert len(BY)==107 and len({x['issue_id'] for x in ISSUES})==107
 assert set(DESCRIPTIONS)==set(BY),'Description membership differs'
 assert set(DESCRIPTION_AUDIT)==set(BY),'Description source audit membership differs'
 for key,audit in DESCRIPTION_AUDIT.items():
  assert audit['sources'] and all(isinstance(s,str) and s.strip() for s in audit['sources']),f'{key}: missing BA sources'
  assert audit['changes'] and all(isinstance(s,str) and s.strip() for s in audit['changes']),f'{key}: missing review record'
 assert len({description(k) for k in BY})==107,'Duplicate Description'
 for k,d in DESCRIPTIONS.items():
  assert set(d)=={'goal','context','requirements','steps','deliverables','acceptance','boundary'},k
  for field in ['goal','context','boundary']:assert isinstance(d[field],str) and d[field].strip(),(k,field)
  for field in ['requirements','steps','deliverables','acceptance']:
   assert isinstance(d[field],list) and d[field] and all(isinstance(s,str) and s.strip() for s in d[field]),(k,field)
  text=description(k)
  assert not re.search(r'TODO|TBD|\[điền|\[bổ sung',text,re.I),(k,'Placeholder')
 for k,x in BY.items():
  assert x['components'] and len(x['components'])==len(set(x['components'])),(k,'Components')
  assert set(x['components'])<=set(DATA['component_catalog']),(k,'Unknown component')
  assert x['labels'] and len(x['labels'])==len(set(x['labels'])),(k,'Labels')
  assert all(re.fullmatch(r'[A-Za-z0-9-]+',label) for label in x['labels']),(k,'Invalid label')
  if x['type']=='Task':
   primary=x['primary_component']
   assert primary in PRIMARY_COMPONENTS and set(x['components'])&set(PRIMARY_COMPONENTS)=={primary},(k,'Exactly one primary component required')
   assert set(x['labels'])&set(PRIMARY_COMPONENTS.values())=={PRIMARY_COMPONENTS[primary]},(k,'Primary label differs')
  else:
   children=[t for t in TASKS.values() if (t['parent']==k if x['type']=='Epic' else t['story']==k)]
   assert set(x['components'])==set().union(*(set(t['components']) for t in children)),(k,'Components must cover child tasks')
  if x['type']=='Epic':assert int(x['issue_id'])==int(k[-2:])+1
  if x['type']=='Task':assert int(x['issue_id'])==int(k[1:])+36
 for num,k in enumerate(sorted(k for k,x in BY.items() if x['type']=='Story'),10):assert int(BY[k]['issue_id'])==num
 assert sum(x['hours'] for x in TASKS.values())==TOTAL_HOURS==880
 assert set(LOAD)==set(TASKS),'Missing task assessment'
 for k,v in LOAD.items():
  assert v['load_units'] in {2,3,5,8,13} and v['reason'].strip(),k
 revision=DATA['allocation_revision']
 for k,x in TASKS.items():
  owner=x['owner'];group=x['primary_component']
  assert owner in PEOPLE,k
  if group=='BE':assert owner in {'Tình','Đông','Tùng','Cường'},(k,'BE role')
  if group=='FE':
   assert owner in {'Tình','Nhạn','Kỳ','Cường'},(k,'FE role')
   if owner=='Cường':assert k in revision['cuong_fe_allowed'],(k,'FE support scope')
  if group=='QA & DevOps':
   assert owner in {'Tình','Thư','Nhạn','Kỳ'} or (k=='T06' and owner=='Cường'),(k,'QA role')
   if owner in {'Nhạn','Kỳ'}:assert k in QA,(k,'FE supports testing only')
 for k,owner in {'T01':'Tình','T12':'Tình','T20':'Tùng','T24':'Tình','T33':'Tình','T59':'Đông','T66':'Tình','T70':'Tình','T02':'Thư','T51':'Thư','T71':'Thư','T06':'Cường'}.items():
  assert TASKS[k]['owner']==owner,(k,'Core responsibility')
 assert len({TASKS[k]['owner'] for k in ['T05','T07','T10']})==1,'Keep chess rules together'
 def hours_for(person,group):return sum(x['hours'] for x in TASKS.values() if x['owner']==person and x['primary_component']==group)
 assert hours_for('Cường','FE')<=revision['cuong_fe_max_hours']
 if hours_for('Cường','FE'):assert hours_for('Cường','BE')<revision['cuong_be_before_hours']
 for person in ['Nhạn','Kỳ']:
  assert hours_for(person,'FE')>=60 and hours_for(person,'QA & DevOps')<=revision['frontend_qa_max_hours'],(person,'Preserve main FE role')
 loads={p:sum(LOAD[k]['load_units'] for k,x in TASKS.items() if x['owner']==p) for p in PEOPLE}
 for person,hours in revision['targets'].items():
  assert sum(x['hours'] for x in TASKS.values() if x['owner']==person)==hours,(person,'Approved allocation')
 assert TASKS['T49']['owner']=='Kỳ'
 assert abs(sum(sum(sprint_hours(x,n) for n in range(1,5)) for x in TASKS.values())-TOTAL_HOURS)<0.05
 assert len(QA)==20
 from graphlib import TopologicalSorter
 assert len(list(TopologicalSorter({k:x['deps'] for k,x in TASKS.items()}).static_order()))==71
 occupancy=collections.Counter();parallel=collections.Counter()
 for k,x in TASKS.items():
  assert BY[x['parent']]['type']=='Epic' and BY[x['story']]['parent']==x['parent']
  assert 0<x['hours']<=4*(x['end_slot']-x['start_slot']),k
  assert x['start_slot']%2==0 and x['end_slot']%2==0,k
  lo,hi=SPRINTS[x['sprint']-1];assert lo<=x['start_slot']<hi and x['start_slot']<x['end_slot']<=52,k
  for d in x['deps']:assert TASKS[d]['end_slot']<=x['start_slot'],(k,d)
  for slot in range(x['start_slot'],x['end_slot']):occupancy[x['owner'],slot]+=1;parallel[slot]+=1
 assert max(occupancy.values())==1 and max(parallel.values())<=7
 for q in QA:
  st=TASKS[q]['story'];impl=[k for k,x in TASKS.items() if x['story']==st and k not in QA]
  impl+= {'US-07.2':['T58'],'US-05.3':['T25'],'US-08.3':['T38']}.get(st,[])
  assert all(TASKS[q]['owner']!=TASKS[t]['owner'] for t in impl),(q,'self-test')
 assert len(ACS)==268 and len({r['ac'] for r in ACS})==268
 ac_source={}
 for line in (ROOT/'BACKLOG-P1.md').read_text().splitlines():
  if re.match(r'^\| AC-',line):
   cells=[z.strip() for z in line.strip('|').split('|')];ac_source[cells[0]]=dict(zip(['given','when','then','test_level'],cells[1:]))
 assert set(ac_source)=={r['ac'] for r in ACS}
 for r in ACS:
  assert r['criterion']==ac_source[r['ac']],('AC text drift',r['ac'])
  v=r['verification_task'];assert v in TASKS
  for t in r['implementation_tasks']:
   assert t in TASKS
   if v in QA and t!=v and TASKS[t]['primary_component']!='QA & DevOps':
    assert TASKS[v]['owner']!=TASKS[t]['owner'],('AC self-verification',r['ac'],v,t)
   if t!=v:
    assert TASKS[t]['end_slot']<=TASKS[v]['start_slot'],('AC readiness',r['ac'],t,v)
    assert t in ancestors(v),('AC dependency missing',r['ac'],t,v)
 assert set(QA+['T51','T66'])<=ancestors('T70')
 assert all(TASKS[k]['end_slot']<=TASKS['T51']['start_slot'] for k in TASKS if k not in QA+['T51','T66','T70','T71'])
 assert TASKS['T71']['due_date']==DATA['deadline']=='2026-11-04'
 assert all(x['due_date']<=DATA['deadline'] for x in TASKS.values())
 validate_live_parity()
 return parallel

def backlog_update():
 s=(ROOT/'BACKLOG-P1.md').read_text()
 # Epic point totals are derived from Task estimates, not copied from the old plan.
 lines=s.splitlines()
 for n,line in enumerate(lines):
  if re.match(r'^\| EP-\d\d \|',line):
   cells=[z.strip() for z in line.strip('|').split('|')]
   if cells[0] in BY and len(cells)==6:
    cells[4]=str(sum(task_points(t) for t in TASKS.values() if t['parent']==cells[0]))
    lines[n]='| '+' | '.join(cells)+' |'
  elif line.startswith('| **Cộng** |') and '27 Story' in line:
   lines[n]='| **Cộng** | | | 27 Story | **'+str(sum(task_points(t) for t in TASKS.values()))+'** | |'
 s='\n'.join(lines)+'\n'
 for st in [x['id'] for x in ISSUES if x['type']=='Story']:
  patt=r'(#### '+re.escape(st)+r' · .*?)(?=\n#### |\n### |\n## |\Z)'
  def replace(m):
   group=task_group(st);stamp='*Sprint thi công:* '+', '.join('S'+str(n) for n in work_sprints(st))+f". *Story Points:* **{sum(task_points(x) for x in group)}** (tổng điểm {len(group)} Task, {sum(x['hours'] for x in group)} giờ)."
   return re.sub(r'^\*Sprint(?: thi công)?:\*.*$',stamp,m[0],flags=re.M)
  s,n=re.subn(patt,replace,s,flags=re.S);assert n==1,st
 a=s.index('### 9.2 Phân bổ Sprint');b=s.index('## 10. Truy vết',a)
 rows=[]
 for n,(lo,hi) in enumerate(SPRINTS,1):
  group=[x for x in TASKS.values() if x['sprint']==n]
  rows.append([f'S{n}',ds(lo)+'–'+ds(hi-1),len(group),sum(x['hours'] for x in group),sum(task_points(x) for x in group),GOALS[n-1]])
 s=s[:a]+'### 9.2 Phân bổ Sprint\n\nĐồng bộ Jira ngày 10/10: 36 Epic/Story BA Done, 71 Task To Do; cả bốn Sprint chưa bắt đầu. Thi công dự kiến từ 10/10. Story BA không vào Sprint; một Story có thể được thi công/kiểm ở nhiều Sprint. Task gắn Sprint bắt đầu; ngày kết thúc có thể sang Sprint kế tiếp. Giờ/điểm trong bảng nhóm là toàn bộ ước lượng của Task, không phải công thực hiện trong riêng Sprint đó.\n\n'+table(['Sprint','Ngày','Task','Giờ','Điểm','Kết quả dự kiến'],rows)+'\nLịch chi tiết, phụ thuộc và điều kiện bàn giao ở [KE-HOACH-JIRA.md](KE-HOACH-JIRA.md). Tổng 880 giờ; hoàn thành và Release v1.0 ngày 04/11/2026, không còn nửa ngày dự phòng cố định.\n\n---\n\n'+s[b:]
 s=s.replace('Máy cờ cấp Khó độ sâu 6 trong 3 giây bằng TypeScript chưa có số đo','Máy cờ cấp Khó có mục tiêu độ sâu 6/ngân sách 3 giây; chưa có số đo')
 return s

def story_body(st,backlog):
 return description(st)

def issue_fields(x,backlog):
 return {'start':datetime.date.fromisoformat(x['start_date']).strftime('%d/%m/%Y'),
         'due':datetime.date.fromisoformat(x['due_date']).strftime('%d/%m/%Y'),
         'fix':', '.join(x['fix_versions']),'description':description(x['id'])}

def generate_csv(backlog):
 maxdeps=max(len(x['deps']) for x in TASKS.values())
 maxlabels=max(len(x['labels']) for x in ISSUES);maxcomponents=max(len(x['components']) for x in ISSUES)
 header=['Issue Id','Parent Id','Issue Type','Summary','Description','Assignee','Reporter','Sprint','Fix Version','Original Estimate','Start date','Due date']+['Labels']*maxlabels+['Components']*maxcomponents+['Priority','Status','Story Points','Story','Issue Key','Resolution','Remaining Estimate','Assignee account ID','Reporter account ID']+['Blocked by']*maxdeps
 buf=io.StringIO(newline='');w=csv.writer(buf,lineterminator='\n');w.writerow(header)
 for x in ISSUES:
  f=issue_fields(x,backlog);task=x['type']=='Task';labels=x['labels'][:]
  components=x['components']
  row=[x['issue_id'],BY[x['parent']]['issue_id'] if x['parent'] else '',x['type'],x['id']+' · '+x['title'],f['description'],x['owner'] if task else 'Tình','Tình',f"XIAN Sprint {x['sprint']}" if task else '',f['fix'],str(x['hours']*3600) if task else '',f['start'],f['due'],*(labels+['']*(maxlabels-len(labels))),*(components+['']*(maxcomponents-len(components))),x['priority'],x['status'],task_points(x) if task else '',BY[x['story']]['issue_id'] if task else '',x['jira_key'],x['resolution'] or '',str(x['remaining_hours']*3600) if task else '',x['assignee_account_id'],x['reporter_account_id']]
  deps=[BY[d]['issue_id'] for d in x['deps']] if task else [];w.writerow(row+deps+['']*(maxdeps-len(deps)))
 return '\ufeff'+buf.getvalue()

def generate_detail(backlog):
 out=['# Danh sách mục Jira XIAN — đồng bộ 10/10/2026\n', '> **9 Epic · 27 Story · 71 Task = 107 mục.** Sinh từ `plan-data.json`, `descriptions.json`, BACKLOG-P1 và AC-TASK-MAP; đồng bộ snapshot Jira hiện tại: 36 mục BA Done, 71 Task To Do, 880 giờ, hạn 04/11; cả bốn Sprint chưa bắt đầu.\n',
 'Epic/Story là việc BA, không có Sprint/ước lượng ở trường Jira. Story và Task đều có cha Epic; Task liên kết *relates to* Story. Một Story có thể có Task ở nhiều Sprint. Ngày Epic/Story lấy nguyên giá trị Jira; Epic bắt đầu trước Story, Story trước Task. BA Done nghĩa là đặc tả đã chốt, không phải phần mềm đã nghiệm thu. BA không gắn Release triển khai.\n',
 '**Cơ sở nội dung:** Toàn bộ 107 Description đã được đối chiếu với [BA-SCOPE-DECISIONS.md](../BA-SCOPE-DECISIONS.md). Quyết định và đặc tả sản phẩm đã được duyệt; Epic/Story diễn đạt nội dung bàn giao, đối chiếu và truy vết theo bản đã chốt, không yêu cầu duyệt lại. Task giữ bảy phần Description, cụ thể hóa việc triển khai và kiểm chứng. Ưu tiên Phần 0 khi có nội dung cũ khác nhau; chức năng dành cho P2 không đưa vào P1. Thiết kế kỹ thuật cụ thể, lựa chọn dịch vụ được giao cho đội phát triển và bằng chứng kiểm thử vẫn cần thực hiện; đặc tả đã duyệt không có nghĩa phần mềm đã đạt nghiệm thu.\n',
 'Mỗi mục ghi các phần quyết định BA liên quan và mục nghiệm thu bổ sung trong BACKLOG-P1 khi cần; nhật ký đối chiếu nằm trong [description-source-audit.json](description-source-audit.json). Lịch, phân công, giờ, điểm và trạng thái lấy từ current-jira-snapshot.json; nhãn sprint cũ không thay thế trường Sprint.\n']
 for ep in [x for x in ISSUES if x['type']=='Epic']:
  group=[ep]
  for st in [BY[k] for k in story_ids(ep['id'])]:group += [st]+sorted(task_group(st['id']),key=lambda x:x['id'])
  for x in group:
   f=issue_fields(x,backlog);task=x['type']=='Task';level=2 if x['type']=='Epic' else 3 if x['type']=='Story' else 4
   out.append('#'*level+' '+x['id']+' · '+x['title']+'\n')
   fields=[['Issue Id',x['issue_id']],['Issue Type',x['type']],['Parent',x['parent'] or '—'],['Assignee',x['owner'] if task else 'Tình'],['Reporter','Tình'],['Priority',x['priority']],['Status',x['status']],['Resolution',x['resolution'] or '—'],['Jira Key',x['jira_key']],['Start date',f['start']],['Due date',f['due']],['Sprint',f"XIAN Sprint {x['sprint']}" if task else '—'],['Fix version',f['fix']],['Original Estimate',str(x['hours'])+' giờ' if task else '—'],['Remaining Estimate',str(x['remaining_hours'])+' giờ' if task else '—'],['Story Points',task_points(x) if task else '—']]
   if task:fields += [['Story (relates to)',x['story']],['Is blocked by',', '.join(x['deps']) or '—']]
   elif x['type']=='Story':fields += [['Task thực hiện',', '.join(y['id'] for y in task_group(x['id']))],['Sprint thi công',', '.join('S'+str(n) for n in work_sprints(x['id']))]]
   fields += [['Component chính',x.get('primary_component','Tổng hợp phạm vi các Task')],['Components',', '.join(x['components'])],['Labels',', '.join(x['labels'])],['Nguồn đặc tả (BA / AC)',', '.join(DESCRIPTION_AUDIT[x['id']]['sources'])]]
   out += [table(['Trường','Giá trị'],fields),'\n**Description**\n\n'+f['description']+'\n\n---\n']
 return '\n'.join(out)

def traceability_md():
 out=['# Truy vết nghiệm thu — 268 AC / 71 Task\n', '> Phân công dự kiến, **chưa có TC đã thực thi, chưa có PASS**. TC dùng mã AC tương ứng, thêm hậu tố cho nhiều nhánh. Tiêu chí nguồn: BACKLOG-P1; dữ liệu máy đọc: AC-TASK-MAP.json.\n',
 'Task được nghiệm thu theo đúng AC giao trong bảng. Các AC chưa đủ đầu vào chuyển tới Task tích hợp được ghi rõ; không công bố 100% Story từ kiểm cục bộ. T51 kiểm hồi quy đầy đủ sau mọi triển khai, có thể song song QA chuyên đề; T70 chờ cả hai nhóm và T66. Mỗi bằng chứng cần bản dựng, môi trường, dữ liệu, ngày/người chạy và kết quả PASS/FAIL/BLOCKED.\n']
 for st in [x['id'] for x in ISSUES if x['type']=='Story']:
  rows=[[r['ac'],', '.join(r['implementation_tasks']),r['verification_task'],'Tích hợp/đối soát' if r['stage']=='integration' else 'Task',r['notes']] for r in ACS if r['story']==st]
  out += ['## '+st+' · '+BY[st]['title']+'\n',table(['AC','Task triển khai/đầu vào','Nghiệm thu tại','Mức','Ghi chú'],rows)]
 return '\n'.join(out)

def components_md():
 counts=collections.Counter(t['primary_component'] for t in TASKS.values())
 out=['# Components và Labels cho 107 mục Jira\n',
 'Mỗi Task có đúng một component chính: **FE** (giao diện), **BE** (xử lý máy chủ/luật/dữ liệu) hoặc **QA & DevOps** (kiểm thử/hạ tầng/vận hành). Ngoài ra có một hoặc nhiều component chức năng. Nhóm chính phản ánh công việc, không suy ra từ tên người được giao. Ví dụ người làm máy chủ vẫn có thể nhận Task thuộc QA & DevOps khi dựng hạ tầng.\n',
 'Epic và Story tổng hợp component từ các Task thuộc phạm vi; vì vậy có thể đồng thời chứa FE, BE và QA & DevOps. Đây là phạm vi sản phẩm liên quan; Epic/Story vẫn là công việc đặc tả, không thay đổi phân công hoặc ước lượng.\n',
 'Component chính được ghi rõ trong dữ liệu kế hoạch và bảng dưới. Khi nhập Jira, nhãn `chinh-fe`, `chinh-be` hoặc `chinh-qa-devops` giữ dấu hiệu nhóm chính; không dựa vào vị trí đầu tiên trong danh sách Components. Epic/Story không có nhãn nhóm chính của Task.\n',
 '## Danh mục component\n',table(['Tên chính xác','Ý nghĩa'],list(DATA['component_catalog'].items())),
 '\n## Quy ước Labels\n',
 '- `p1`: thuộc bản bàn giao đầu tiên.\n- `sprint-1` đến `sprint-4`: nhãn khớp trường Sprint hiện tại của Task; khi đổi Sprint cần cập nhật nhãn tương ứng.\n- `chinh-fe`, `chinh-be`, `chinh-qa-devops`: đúng một nhãn nhóm chính trên mỗi Task.\n- `dac-ta`: công việc đặc tả ở Epic/Story; mã `EP-xx` giữ liên hệ nhóm yêu cầu.\n- `phat-trien`, `kiem-thu`: triển khai tính năng hoặc kiểm thử chuyên đề. Các công việc đặc thù dùng `ha-tang`, `chuan-bi-kiem-thu`, `thu-nghiem-ky-thuat`, `kiem-thu-tich-hop`, `do-chat-luong`, `dong-goi-phat-hanh`, `tong-duyet`.\n- Nhãn chức năng viết không dấu, nối bằng gạch ngang: `tai-khoan`, `luat-co`, `camera-va-mic`… tương ứng component chức năng để dễ lọc.\n',
 '## Phân bố Task theo nhóm chính\n',table(['Component chính','Số Task'],[[c,counts[c]] for c in PRIMARY_COMPONENTS]),
 '\n## Chuẩn bị nhập Jira\n',
 'Tạo/đối chiếu danh mục Components bằng đúng tên bên trên trong dự án đích. CSV xuất mỗi giá trị vào một cột lặp tên `Components` hoặc `Labels`; khi thử nhập cần ánh xạ toàn bộ các cột cùng tên vào trường tương ứng và kiểm việc nhận nhiều giá trị. Không tách chuỗi bằng dấu phẩy hoặc chỉ lấy cột đầu. Không dùng trình đọc CSV chỉ giữ một giá trị cho tên cột trùng.\n',
 'Bản xuất dùng nhãn để nhận biết nhóm chính, không yêu cầu thêm trường tùy chỉnh. Nhãn sprint đã được đồng bộ; trường Sprint là nguồn lịch hiện hành (xem KIEM-TRA-KE-HOACH.md). Kiểm sau nhập: đủ 107 mục có Components/Labels; mỗi Task có đúng một nhóm chính và đúng nhãn; các component chức năng không bị mất. Components/Labels lấy nguyên snapshot Jira, đã đọc lại sau khi sửa 13 nhãn sprint trên Jira.\n',
 '## Danh sách đầy đủ\n',table(['Mã','Loại','Component chính','Components','Labels'],[[x['id'],x['type'],x.get('primary_component','Tổng hợp'),', '.join(x['components']),', '.join(x['labels'])] for x in ISSUES])]
 return '\n'.join(out)

def workload_md():
 out=['# Đánh giá nội dung 71 Task — giờ và người đồng bộ 10/10/2026\n',ASSESSMENT['method']+'\n',
 'Đơn vị tải dưới đây là nhận định tương đối để phân công, không phải giờ, Story Points trên Jira hoặc thước đo năng lực. Không lấy giờ hay số tiêu chí nghiệm thu làm công thức tính. Giờ và người lấy theo Jira hiện tại (880 giờ), lý do đánh giá tải tương đối giữ từ đợt 09/10; điều này không xác nhận các ước lượng đã chính xác.\n',
 table(['Mức tải','Cách hiểu'],ASSESSMENT['scale'].items()),
 '\nMỗi lý do xét đầu ra, nhánh xử lý, phần cần phối hợp và trách nhiệm kiểm chứng. T10 có ít giờ nhưng nhiều quy tắc kết thúc ván; T15 chủ yếu dùng lại thành phần biểu mẫu đăng nhập. T68/T69 có phạm vi kiểm rộng dù chỉ 8 giờ mỗi Task: cần chuẩn bị dữ liệu và môi trường trước, ghi nhận thời gian thực và cập nhật lịch nếu vượt dự kiến. Không coi điểm tải là bằng chứng chắc chắn không quá tải.\n',
 table(['Task','Công việc','Người','Giờ dự kiến','Đơn vị tải','Cơ sở đánh giá'],[[k,x['title'],x['owner'],x['hours'],LOAD[k]['load_units'],LOAD[k]['reason']] for k,x in TASKS.items()]),
 '\nKhi bắt đầu triển khai, cập nhật đánh giá bằng khối lượng thực còn lại, vướng mắc và mức sẵn sàng của đầu vào. Nếu cần đổi ước lượng, tính lại lịch và ngày dự phòng; không giữ các con số chỉ để bảng nhìn cân bằng.\n']
 return '\n'.join(out)

def validate_export(value,backlog):
 rows=list(csv.reader(io.StringIO(value.lstrip('\ufeff'))));header=rows[0]
 assert len(rows)==108 and all(len(row)==len(header) for row in rows[1:]),'CSV shape'
 cols={name:[i for i,v in enumerate(header) if v==name] for name in set(header)}
 seen=set()
 for row in rows[1:]:
  def get(name):return row[cols[name][0]]
  key=get('Summary').split(' · ',1)[0];assert key in BY and key not in seen;seen.add(key)
  x=BY[key];f=issue_fields(x,backlog)
  assert get('Issue Id')==str(x['issue_id']) and get('Issue Type')==x['type'],key
  assert get('Description')==description(key),key
  assert get('Issue Key')==x['jira_key'] and get('Status')==x['status'] and get('Resolution')==(x['resolution'] or ''),key
  assert get('Assignee account ID')==x['assignee_account_id'] and get('Reporter account ID')==x['reporter_account_id'],key
  assert get('Parent Id')==(str(BY[x['parent']]['issue_id']) if x['parent'] else ''),key
  assert get('Assignee')==(x['owner'] if x['type']=='Task' else 'Tình'),key
  assert get('Start date')==f['start'] and get('Due date')==f['due'] and get('Fix Version')==f['fix'],key
  for name,field in [('Components','components'),('Labels','labels')]:
   assert [row[i] for i in cols[name] if row[i]]==x[field],(key,name)
  if x['type']=='Task':
   assert int(get('Original Estimate'))==x['hours']*3600 and int(get('Story Points'))==task_points(x),key
   assert get('Sprint')=='XIAN Sprint '+str(x['sprint']),key
   assert get('Story')==str(BY[x['story']]['issue_id']),key
   assert [row[i] for i in cols['Blocked by'] if row[i]]==[str(BY[k]['issue_id']) for k in x['deps']],key
   assert int(get('Remaining Estimate'))==x['remaining_hours']*3600,key
   assert all(x['due_date']<=VERSIONS[v]['releaseDate'] for v in x['fix_versions']),key
  else:assert not get('Original Estimate') and not get('Sprint') and not get('Story Points') and not get('Fix Version') and not get('Remaining Estimate'),key
 assert seen==set(BY)

def normalize_description(text):
 return re.sub(r'\s+', ' ', re.sub(r'(?m)^[-*] ', '', text).replace('\\_', '_')).strip()

def label_mismatches():
 return [(x['jira_key'],x['id'],', '.join(z for z in x['labels'] if z.startswith('sprint-')),f"XIAN Sprint {x['sprint']}") for x in TASKS.values() if {z for z in x['labels'] if z.startswith('sprint-')}!={'sprint-'+str(x['sprint'])}]

def validate_live_parity():
 assert len(LIVE_BY)==len(ISSUES)==107
 assert all(s['state']=='future' for s in DATA['sprint_metadata'])
 assert DATA['sprint_metadata']==LIVE['sprints'] and DATA['releases']==LIVE['versions']
 by_jira={x['jira_key']:x['id'] for x in ISSUES}
 for x in ISSUES:
  y=LIVE_BY[x['jira_key']]
  assert x['jira_id']==y['id'] and x['type']==y['type'] and x['id']+' · '+x['title']==y['summary'],x['id']
  assert x['start_date']==y['start'] and x['due_date']==y['due'],x['id']
  assert x['status']==y['status'] and x['resolution']==y['resolution'],x['id']
  assert x['assignee_account_id']==y['assignee']['id'] and x['reporter_account_id']==y['reporter']['id'],x['id']
  assert x['owner']=={'TÌNH 4851_NGUYỄN NGỌC':'Tình','Võ Thành Đông':'Đông','nguyenhoangtungtuyhoa':'Tùng','Tưởng Lê khoa Cường-4572':'Cường','4841_Lê Thị Xuân Nhạn':'Nhạn','Gia Kỳ':'Kỳ','Nguyễn Minh Thư':'Thư'}[y['assignee']['name']],x['id']
  assert x['priority']==y['priority'] and x['components']==y['components'] and x['labels']==y['labels'],x['id']
  assert x['parent']==by_jira.get(y['parent']),x['id']
  assert normalize_description(description(x['id']))==normalize_description(y['description']),(x['id'],'description drift')
  assert x['fix_versions']==[v['name'] for id in y['versions'] for v in LIVE['versions'] if v['id']==id],x['id']
  if x['type']=='Task':
   assert (x['hours'],x['remaining_hours'],x['spent_hours'],x['story_points'])==(y['hours'],y['remaining_hours'],y['spent_hours'],y['points']),x['id']
   assert x['remaining_hours']==x['hours'] and x['spent_hours']==0 and x['status']=='To Do' and x['resolution'] is None,x['id']
   assert date(x['start_slot']).isoformat()==y['start'] and date(x['end_slot']-1).isoformat()==y['due'],x['id']
   assert DATA['sprint_metadata'][x['sprint']-1]['id']==y['sprint'],x['id']
   assert x['deps']==sorted(by_jira[l['inward']] for l in y['links'] if l['type']=='Blocks' and l.get('inward')),x['id']
   assert any(l['type']=='Relates' and by_jira.get(l.get('inward') or l.get('outward'))==x['story'] for l in y['links']),x['id']
   assert BY[x['parent']]['start_date']<BY[x['story']]['start_date']<x['start_date'],x['id']
   assert x['fix_versions'] and all(x['due_date']<=VERSIONS[v]['releaseDate'] for v in x['fix_versions']),x['id']
  else:
   assert x['status']=='Done' and x['resolution']=='Done' and not x['fix_versions'] and y['sprint'] is None,x['id']


def generate_plan(parallel):
 out=['# KẾ HOẠCH JIRA — Cờ Tướng Online (XIAN)\n',
 '> **Đồng bộ Jira ngày 10/10/2026 · phiên bản 3.0.** 9 Epic + 27 Story BA đã Done; 71 Task triển khai To Do, **880 giờ**, hạn hoàn thành và Release v1.0 **04/11/2026**. Cả bốn Sprint chưa bắt đầu.\n',
 'Nguồn dữ liệu: [snapshot Jira](jira/current-jira-snapshot.json), [kế hoạch](jira/plan-data.json), [Description](jira/descriptions.json). Nghiệp vụ: [BA](BA-SCOPE-DECISIONS.md), [backlog](BACKLOG-P1.md), [truy vết 268 AC](jira/TRUY-VET-AC.md). [Danh sách 107 mục](jira/JIRA-MUC-CHI-TIET.md) và [CSV đối chiếu](jira/xian-import.csv) được sinh từ cùng nguồn.\n',
 '## 1. Quy tắc lịch và cách đọc\n',
 '- Lịch theo **ngày**, tính cả ngày bắt đầu và ngày kết thúc, kể cả cuối tuần. Mỗi người tối đa một Task/ngày; toàn nhóm tối đa bảy Task/ngày. Task phụ thuộc chỉ bắt đầu từ ngày sau khi đầu vào kết thúc.\n- Ước lượng giờ độc lập với độ dài thanh lịch. Một Task 4 giờ vẫn chiếm một ngày trong ràng buộc một Task/người/ngày; không suy ra giờ làm bằng số ngày × 8. Mỗi Task không vượt 8 giờ/ngày nếu phân bổ đều trong khoảng lịch.\n- Epic và Story là hồ sơ BA đã chốt; Done của BA không đại diện cho phần mềm đã hoàn thành. Story và Task cùng thuộc Epic, liên kết với nhau bằng relates to. Ngày BA giữ nguyên giá trị Jira, có thể kết thúc trước Task cuối.\n- Task gắn Sprint theo ngày bắt đầu, có thể kéo qua Sprint sau. **Trường Sprint** là nguồn chính; 71/71 nhãn sprint đã khớp trường Sprint sau đợt sửa 13 nhãn cũ.\n- Story Points lấy nguyên Jira, không tự tính lại từ giờ mới. Các bảng chia giờ theo Sprint phân bổ đều ước lượng trên số ngày lịch, chỉ là cách trình bày kế hoạch, không phải giờ đã làm.\n- Tổng duyệt T71 chiếm ngày 04/11 (8 giờ); **không còn cam kết chiều 04/11 dự phòng**. Mốc demo 05/11 trong hồ sơ cũ là lịch sử; hạn kế hoạch hiện tại là 04/11.\n',
 table(['Chỉ số','Kết quả'],[['Epic / Story / Task','9 / 27 / 71'],['Giờ / Story Points',f"{TOTAL_HOURS} / {sum(task_points(x) for x in TASKS.values())}"],['Phụ thuộc trực tiếp',sum(len(x['deps']) for x in TASKS.values())],['Song song tối đa',max(parallel.values())],['Hạn hoàn thành',DATA['deadline']],['Trạng thái Sprint','4 future; chưa bắt đầu']]),
 '\n## 2. Phân công\n',
 table(['Người','Task','Giờ','S1 giờ phân bổ','S2','S3','S4'],[[p,sum(x['owner']==p for x in TASKS.values()),sum(x['hours'] for x in TASKS.values() if x['owner']==p),*[round(sum(sprint_hours(x,n) for x in TASKS.values() if x['owner']==p),2) for n in range(1,5)]] for p in PEOPLE]),
 '\nNhạn và Thư mỗi người tăng từ 104 lên 120 giờ; T37 thuộc Tình. Tổng giờ là 880, chưa bao gồm giờ BA/điều phối riêng. Phân công không bằng nhau tuyệt đối; xem [cơ sở phân công](jira/PHAN-CONG-CAN-BANG.md) và [đánh giá nội dung](jira/DANH-GIA-KHOI-LUONG.md).\n',
 '## 3. Sprint\n']
 for n,(lo,hi) in enumerate(SPRINTS,1):
  group=sorted([x for x in TASKS.values() if x['sprint']==n],key=lambda x:(x['start_slot'],x['id']))
  out += [f"### XIAN Sprint {n} · {ds(lo)}–{ds(hi-1)} · chưa bắt đầu\n",GOALS[n-1]+'\n',
   f"{len(group)} Task · {sum(x['hours'] for x in group)} giờ ước lượng của các Task gắn Sprint.\n",
   table(['Task / Jira','Tên','Story','Người','Giờ','Điểm Jira','Bắt đầu','Kết thúc','Phụ thuộc'],[[x['id']+' / '+x['jira_key'],x['title'],x['story'],x['owner'],x['hours'],task_points(x),when(x['start_slot']),when(x['end_slot']-1),', '.join(x['deps']) or '—'] for x in group])]
 out += ['\n## 4. Lịch BA và trạng thái\n',
 table(['Mã','Jira','Bắt đầu','Kết thúc dự kiến','Status','Resolution'],[[x['id'],x['jira_key'],x['start_date'],x['due_date'],x['status'],x['resolution']] for x in ISSUES if x['type']!='Task']),
 '\nCác ngày trên là trường kế hoạch, không phải ngày hoàn tất thực tế. 36 mục BA đã Done và không gắn Fix version. Tiến độ sản phẩm được tính từ Task và bằng chứng nghiệm thu.\n',
 '## 5. Release và workflow\n',
 table(['Release','Bắt đầu','Hạn','Trạng thái','Task'],[[v['name'],v['startDate'],v['releaseDate'],'Unreleased',sum(v['name'] in x['fix_versions'] for x in TASKS.values())] for v in DATA['releases']]),
 '\nRelease chỉ chứa Task triển khai, hiện 0% hoàn thành. T50 / XIAN-86 kết thúc 31/10 và thuộc v1.0.\n',
 'Workflow XIAN: To Do → Ready for Code → In Progress → Ready For Test → Done. Transition 5 đặt Resolution = Done; Mở lại (transition 9) đưa Done → To Do và xóa Resolution. Đã lưu và đọc lại cấu hình; chưa chuyển thử Task thật. Workflow dùng chung cho các loại công việc trong XIAN.\n',
 '## 6. Lịch từng người và số Task mỗi ngày\n']
 for p in PEOPLE:
  out += ['### '+p+'\n',table(['Task','Giờ','Bắt đầu','Kết thúc'],[[x['id'],x['hours'],when(x['start_slot']),when(x['end_slot']-1)] for x in sorted(TASKS.values(),key=lambda x:(x['start_slot'],x['id'])) if x['owner']==p])]
 out += [table(['Ngày','Task theo kế hoạch'],[[ds(n),parallel[n]] for n in range(0,52,2)]),
 '\n## 7. Description từng Task\n']
 for ep in [x for x in ISSUES if x['type']=='Epic']:
  out.append('### '+ep['id']+' · '+ep['title']+'\n')
  for x in TASKS.values():
   if x['parent']==ep['id']:out += ['#### '+x['id']+' · '+x['title']+'\n',task_description(x)+'\n']
 out += ['\n## 8. Kiểm chứng và sử dụng dữ liệu\n',
 'T51 hồi quy sau triển khai; T70 chờ T51, T66 và toàn bộ QA chuyên đề; T71 tổng duyệt bản phát hành. Mọi tiêu chí bắt buộc cần bằng chứng thực tế. Nếu đầu vào trễ hoặc ước lượng không đủ, cập nhật lịch thay vì tự hạ ngưỡng hoặc ghi PASS cho ca chưa chạy.\n',
 'CSV là bản xuất đối chiếu **các mục đã tồn tại**, gồm Issue Key, Resolution và định danh tài khoản. Không nhập như các mục mới; không dùng import CSV để ép chuyển trạng thái. Script local không ghi lên Jira.\n',
 'Để cập nhật nguồn, lấy snapshot Jira mới vào `jira/current-jira-snapshot.json`, chạy `python3 jira/sync_plan_from_snapshot.py`, `python3 jira/build_plan.py`, rồi `python3 jira/build_plan.py --check`. Bộ kiểm đối chiếu dữ liệu với snapshot, 268 AC, phụ thuộc, giới hạn ngày, người kiểm độc lập và các đầu ra. Đây là kiểm dữ liệu kế hoạch, chưa phải kiểm phần mềm.\n',
 '[Báo cáo kiểm tra](jira/KIEM-TRA-KE-HOACH.md) · [Trạng thái hiện hành](jira/CURRENT-JIRA-STATE.md).\n']
 return '\n'.join(out)


def report(parallel):
 out=['# Kiểm tra kế hoạch đồng bộ Jira — 10/10/2026\n',
 table(['Kiểm tra','Kết quả'],[['Dữ liệu','107 mục khớp snapshot Jira: 9 Epic, 27 Story, 71 Task'],['Description','107/107 đủ bảy phần, khớp nội dung Jira'],['Status / Resolution','36 BA Done/Done; 71 Task To Do/Resolution trống'],['Giờ ước lượng / còn lại',f'{TOTAL_HOURS} / {TOTAL_HOURS}; chưa ghi giờ thực tế'],['Story Points Jira',sum(task_points(x) for x in TASKS.values())],['AC',len(ACS)],['Phụ thuộc',sum(len(x['deps']) for x in TASKS.values())],['Giới hạn ngày',f"Tối đa {max(parallel.values())} Task/ngày; mỗi người 1 Task/ngày"],['Thứ tự bắt đầu','Epic < Story < Task'],['Độc lập nghiệm thu chuyên đề','Đạt theo AC và phạm vi Task'],['Release','Task không vượt hạn phiên bản; BA không gắn phiên bản'],['Hạn cuối',DATA['deadline']],['Sprint','4 future; chưa bắt đầu'],['Task qua ranh giới Sprint',', '.join(k for k,x in TASKS.items() if x['end_slot']>SPRINTS[x['sprint']-1][1])]]),
 '\n## Đối chiếu nhãn Sprint trên Jira\n',
 f'Đã đối chiếu 71 Task; số nhãn lệch trường Sprint: **{len(label_mismatches())}**. Trường Sprint là nguồn chính. Lịch sử sửa 13 nhãn: [sprint-label-sync-2026-10-10.json](https://github.com/twotnguyen/XIANGQI/blob/a586f372549561d8c2f0f508bc7ab10d431d5ef7/jira/sprint-label-sync-2026-10-10.json).\n',
 table(['Jira','Task','Nhãn hiện tại','Sprint thực tế'],label_mismatches()) if label_mismatches() else 'Toàn bộ nhãn `sprint-*` khớp Sprint thực tế.\n',
 '\n## Giới hạn\n',
 '- Lịch có cuối tuần; không còn nửa ngày dự phòng 04/11.\n- Giờ theo Sprint được phân bổ đều trên các ngày của Task để trình bày, không phải giờ log hoặc lịch giờ cụ thể.\n- Cấu hình Resolution đã lưu và đọc lại, chưa thử chuyển Task thật.\n- Không xác nhận mã sản phẩm, ca kiểm thử, gate, thiết bị hoặc quyền GitHub của từng người đã sẵn sàng.\n- Kiểm khớp snapshot không thay thế truy vấn live khi Jira có thay đổi mới.\n\nTái chạy: `python3 jira/build_plan.py --check`.\n']
 return '\n'.join(out)


def allocation_md():
 out=['# Phân công hiện hành — 880 giờ\n',
 'Đồng bộ từ Jira ngày 10/10/2026. 71 Task To Do; BA Done theo dõi riêng; chưa bắt đầu Sprint.\n',
 table(['Người','Task','Giờ','Tải đánh giá','S1 giờ phân bổ','S2','S3','S4'],[[p,sum(x['owner']==p for x in TASKS.values()),sum(x['hours'] for x in TASKS.values() if x['owner']==p),sum(LOAD[k]['load_units'] for k,x in TASKS.items() if x['owner']==p),*[round(sum(sprint_hours(x,n) for x in TASKS.values() if x['owner']==p),2) for n in range(1,5)]] for p in PEOPLE]),
 '\nGiờ Sprint chỉ là phân bổ đều ước lượng trên số ngày lịch để báo cáo. Mỗi người tối đa một Task/ngày, tối đa 8 giờ/ngày; cả nhóm tối đa 7 Task/ngày. Có làm cuối tuần. Hạn cuối 04/11, không còn buổi chiều dự phòng cố định.\n',
 'T37 thuộc Tình. Nhạn tăng 16 giờ tại T11/T19/T21/T62; Thư tăng 16 giờ tại T02/T71. Lý do cụ thể nằm trong Description tương ứng. Tổng giờ khác nhau theo phạm vi được giao; không phải khẳng định mức tải đã bằng nhau.\n']
 for p in PEOPLE:
  out += ['## '+p+'\n',DATA['allocation_revision']['rationale'][p]+'\n',table(['Task / Jira','Công việc','Nhóm chính','Giờ','Sprint','Bắt đầu','Kết thúc'],[[x['id']+' / '+x['jira_key'],x['title'],x['primary_component'],x['hours'],x['sprint'],when(x['start_slot']),when(x['end_slot']-1)] for x in sorted(TASKS.values(),key=lambda x:(x['start_slot'],x['id'])) if x['owner']==p])]
 return '\n'.join(out)

def mapping_md():
 return '# Ánh xạ chính thức 107 mục Jira — đồng bộ 10/10/2026\n\n' + 'Mã và tài khoản lấy từ snapshot Jira hiện hành. Issue Id là mã nội bộ; Jira Key và Jira ID là định danh đã đọc từ Jira, không suy ra bằng phép cộng.\n\n' + table(['Mã Jira','Mã kế hoạch','Loại','Người nhận','Giờ','Status','Nội dung'],[[x['jira_key'],x['id'],x['type'],x['owner'],x.get('hours','—'),x['status'],x['id']+' · '+x['title']] for x in ISSUES])

def mapping_json():
 return json.dumps({'status':'synced_from_jira_snapshot','date':DATA['synced_at'],'project_key':'XIAN','source_snapshot':DATA['source_snapshot'], 'items':[{'local_id':x['id'],'target_key':x['jira_key'],'jira_id':x['jira_id'],'issue_type':x['type'],'summary':x['id']+' · '+x['title'],'assignee_name':x['owner'],'assignee_account_id':x['assignee_account_id'],'reporter_account_id':x['reporter_account_id'],'parent_key':BY[x['parent']]['jira_key'] if x['parent'] else None,'story_relates_to_key':BY[x['story']]['jira_key'] if x['type']=='Task' else None,'blocked_by_keys':[BY[k]['jira_key'] for k in x.get('deps',[])],'hours':x.get('hours',0),'status':x['status'],'resolution':x['resolution']} for x in ISSUES]},ensure_ascii=False,indent=2)+'\n'

def main():
 parallel=validate();backlog=backlog_update()
 outputs={'jira/ANH-XA-JIRA-107-MUC.md':mapping_md(),'jira/jira-key-account-mapping.json':mapping_json(),'BACKLOG-P1.md':backlog,'KE-HOACH-JIRA.md':generate_plan(parallel),'jira/JIRA-MUC-CHI-TIET.md':generate_detail(backlog),'jira/xian-import.csv':generate_csv(backlog),'jira/TRUY-VET-AC.md':traceability_md(),'jira/KIEM-TRA-KE-HOACH.md':report(parallel),'jira/COMPONENTS-LABELS.md':components_md(),'jira/PHAN-CONG-CAN-BANG.md':allocation_md(),'jira/DANH-GIA-KHOI-LUONG.md':workload_md()}
 validate_export(outputs['jira/xian-import.csv'],backlog)
 check='--check' in sys.argv
 for name,value in outputs.items():
  path=ROOT/name
  if check:assert path.exists() and path.read_bytes()==value.encode('utf-8'),('Generated file differs',name)
  else:path.write_bytes(value.encode('utf-8'))
 print(('CHECK PASS' if check else 'GENERATED')+': 107 issues, 71 tasks, 880 hours, 268 AC; schedule, acceptance dependencies, 107 descriptions and component/label assignments valid.')
if __name__=='__main__':main()
