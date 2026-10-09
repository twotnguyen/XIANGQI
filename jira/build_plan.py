#!/usr/bin/env python3
"""Generate and validate the 09 Oct 2026 Jira baseline using only Python stdlib.
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
ASSESSMENT=json.loads((ROOT/'jira/workload-assessment.json').read_text())
LOAD=ASSESSMENT['items']
BASE=datetime.date.fromisoformat(DATA['start_date'])
PEOPLE=['Tình','Đông','Tùng','Cường','Nhạn','Kỳ','Thư']
QA=[k for k,x in TASKS.items() if 'kiem-thu' in x['labels']]
SPRINTS=DATA['sprints']
PRIMARY_COMPONENTS={'FE':'chinh-fe','BE':'chinh-be','QA & DevOps':'chinh-qa-devops'}
GOALS=[
'Khung ứng dụng, đăng ký OTP, lõi luật và bàn cờ tương tác; thử media/xác thực/phiên sớm. Chưa tuyên bố nghiệm thu toàn bộ đăng nhập có Google.',
'Tạo/vào phòng, ván online cơ bản, Google/Khách, máy cờ có baseline; hoàn thiện các backend phòng/chat. Một số AC liên chức năng chờ S3–S4.',
'Hoàn tất phần lớn triển khai P1; T52 nối lại hoàn tất đầu S4. Chạy QA chuyên đề đã đủ đầu vào.',
'Hồi quy đầy đủ và QA còn lại trên bản tích hợp, đo NFR/gate, đóng gói và tổng duyệt sáng 04/11; chiều 04/11 dự phòng.'
]
def date(slot):return BASE+datetime.timedelta(days=slot//2)
def ds(slot,year=False):return date(slot).strftime('%d/%m/%Y' if year else '%d/%m')
def when(slot):return ds(slot)+(' sáng' if slot%2==0 else ' chiều')
def finish_sprint(x):return next(n for n,(lo,hi) in enumerate(SPRINTS,1) if lo<x['end_slot']<=hi)
def points(h):return 1 if h<=4 else 2 if h<=8 else 3 if h<=16 else 5 if h<=24 else 8 if h<=40 else 13
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
 lo,hi=SPRINTS[n-1];return 4*max(0,min(hi,x['end_slot'])-max(lo,x['start_slot']))
def work_sprints(story):return [n for n in range(1,5) if any(sprint_hours(x,n) for x in task_group(story))]
def story_due(story):
 group=task_group(story)
 return max(x['end_slot']-1 for x in group) if story in ['US-00.5','US-08.3'] else min(x['start_slot'] for x in group)
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
 assert len({description(k) for k in BY})==107,'Duplicate Description'
 for k,d in DESCRIPTIONS.items():
  assert set(d)=={'goal','context','requirements','steps','deliverables','acceptance','boundary'},k
  for field in ['goal','context','boundary']:assert isinstance(d[field],str) and d[field].strip(),(k,field)
  for field in ['requirements','steps','deliverables','acceptance']:
   assert isinstance(d[field],list) and d[field] and all(isinstance(s,str) and s.strip() for s in d[field]),(k,field)
  text=description(k)
  assert not re.search(r'\b(?:AC-\d|US-\d|EP-\d|T\d{2}\b|GATE-|NFR-\d|R1\b|TC\b|PO\b|BA\b|BE\b|FE\b)',text),(k,'Unexplained planning shorthand')
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
 assert sum(x['hours'] for x in TASKS.values())==848
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
 approved=json.loads((ROOT/'jira/allocation-proposal-848.json').read_text())['assignments']
 assert len(approved)==71 and {r['task'] for r in approved}==set(TASKS)
 for r in approved:
  x=TASKS[r['task']];assert (x['owner'],x['hours'])==(r['owner'],r['hours']),(r['task'],'Approved task differs')
 for k,x in TASKS.items():
  assert {z for z in x['labels'] if z.startswith('sprint-')}=={'sprint-'+str(x['sprint'])},(k,'Sprint label')
 assert sum(sum(sprint_hours(x,n) for n in range(1,5)) for x in TASKS.values())==848
 assert len(QA)==20
 from graphlib import TopologicalSorter
 assert len(list(TopologicalSorter({k:x['deps'] for k,x in TASKS.items()}).static_order()))==71
 occupancy=collections.Counter();parallel=collections.Counter()
 for k,x in TASKS.items():
  assert BY[x['parent']]['type']=='Epic' and BY[x['story']]['parent']==x['parent']
  assert x['hours']==4*(x['end_slot']-x['start_slot']),k
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
 assert TASKS['T71']['end_slot']<=51
 assert not any(occupancy[p,slot] for p in PEOPLE for slot in [51])
 return parallel

def backlog_update():
 s=(ROOT/'BACKLOG-P1.md').read_text()
 # Epic point totals are derived from Task estimates, not copied from the old plan.
 lines=s.splitlines()
 for n,line in enumerate(lines):
  if re.match(r'^\| EP-\d\d \|',line):
   cells=[z.strip() for z in line.strip('|').split('|')]
   if cells[0] in BY and len(cells)==6:
    cells[4]=str(sum(points(t['hours']) for t in TASKS.values() if t['parent']==cells[0]))
    lines[n]='| '+' | '.join(cells)+' |'
  elif line.startswith('| **Cộng** |') and '27 Story' in line:
   lines[n]='| **Cộng** | | | 27 Story | **'+str(sum(points(t['hours']) for t in TASKS.values()))+'** | |'
 s='\n'.join(lines)+'\n'
 for st in [x['id'] for x in ISSUES if x['type']=='Story']:
  patt=r'(#### '+re.escape(st)+r' · .*?)(?=\n#### |\n### |\n## |\Z)'
  def replace(m):
   group=task_group(st);stamp='*Sprint thi công:* '+', '.join('S'+str(n) for n in work_sprints(st))+f". *Story Points:* **{sum(points(x['hours']) for x in group)}** (tổng điểm {len(group)} Task, {sum(x['hours'] for x in group)} giờ)."
   return re.sub(r'^\*Sprint(?: thi công)?:\*.*$',stamp,m[0],flags=re.M)
  s,n=re.subn(patt,replace,s,flags=re.S);assert n==1,st
 a=s.index('### 9.2 Phân bổ Sprint');b=s.index('## 10. Truy vết',a)
 rows=[]
 for n,(lo,hi) in enumerate(SPRINTS,1):
  group=[x for x in TASKS.values() if x['sprint']==n]
  rows.append([f'S{n}',ds(lo)+'–'+ds(hi-1),len(group),sum(x['hours'] for x in group),sum(points(x['hours']) for x in group),GOALS[n-1]])
 s=s[:a]+'### 9.2 Phân bổ Sprint\n\nNgày 09/10 lập lại BA/kế hoạch; chưa có Task đã triển khai. Thi công từ 10/10. Story BA không vào Sprint; một Story có thể được thi công/kiểm ở nhiều Sprint. Task gắn Sprint bắt đầu; ngày kết thúc có thể sang Sprint kế tiếp. Giờ/điểm trong bảng nhóm là toàn bộ ước lượng của Task, không phải công thực hiện trong riêng Sprint đó.\n\n'+table(['Sprint','Ngày','Task','Giờ','Điểm','Kết quả dự kiến'],rows)+'\nLịch chi tiết, phụ thuộc và điều kiện bàn giao ở [KE-HOACH-JIRA.md](KE-HOACH-JIRA.md). Tổng 848 giờ; chiều 04/11 dự phòng, demo 05/11.\n\n---\n\n'+s[b:]
 s=s.replace('Máy cờ cấp Khó độ sâu 6 trong 3 giây bằng TypeScript chưa có số đo','Máy cờ cấp Khó có mục tiêu độ sâu 6/ngân sách 3 giây; chưa có số đo')
 return s

def story_body(st,backlog):
 return description(st)

def issue_fields(x,backlog):
 typ=x['type'];start=DATA['planning_date'];fix='v1.0'
 if typ=='Task':
  due=ds(x['end_slot']-1,True);start=ds(x['start_slot'],True);fix=['v0.1','v0.2','v0.3','v1.0'][finish_sprint(x)-1];desc=task_description(x)
 elif typ=='Story':due=ds(story_due(x['id']),True);desc=story_body(x['id'],backlog);fix=['v0.1','v0.2','v0.3','v1.0'][max(work_sprints(x['id']))-1]
 else:
  due=ds(max(story_due(st) for st in story_ids(x['id'])),True)
  desc=description(x['id'])
 if typ!='Task':start=datetime.date.fromisoformat(DATA['planning_date']).strftime('%d/%m/%Y')
 return {'start':start,'due':due,'fix':fix,'description':desc}

def generate_csv(backlog):
 maxdeps=max(len(x['deps']) for x in TASKS.values())
 maxlabels=max(len(x['labels']) for x in ISSUES);maxcomponents=max(len(x['components']) for x in ISSUES)
 header=['Issue Id','Parent Id','Issue Type','Summary','Description','Assignee','Reporter','Sprint','Fix Version','Original Estimate','Start date','Due date']+['Labels']*maxlabels+['Components']*maxcomponents+['Priority','Status','Story Points','Story']+['Blocked by']*maxdeps
 buf=io.StringIO(newline='');w=csv.writer(buf,lineterminator='\n');w.writerow(header)
 for x in ISSUES:
  f=issue_fields(x,backlog);task=x['type']=='Task';labels=x['labels'][:]
  components=x['components']
  row=[x['issue_id'],BY[x['parent']]['issue_id'] if x['parent'] else '',x['type'],x['id']+' · '+x['title'],f['description'],x['owner'] if task else 'Tình','Tình',f"XIAN Sprint {x['sprint']}" if task else '',f['fix'],str(x['hours']*3600) if task else '',f['start'],f['due'],*(labels+['']*(maxlabels-len(labels))),*(components+['']*(maxcomponents-len(components))),x['priority'],'To Do',points(x['hours']) if task else '',BY[x['story']]['issue_id'] if task else '']
  deps=[BY[d]['issue_id'] for d in x['deps']] if task else [];w.writerow(row+deps+['']*(maxdeps-len(deps)))
 return '\ufeff'+buf.getvalue()

def generate_detail(backlog):
 out=['# Danh sách mục Jira XIAN — kế hoạch lập lại 09/10/2026\n', '> **9 Epic · 27 Story · 71 Task = 107 mục.** Sinh từ `plan-data.json`, `descriptions.json`, BACKLOG-P1 và AC-TASK-MAP; mọi mục nhập To Do. Ngày 09/10 lập kế hoạch, thi công từ 10/10 đến sáng 04/11; chiều 04/11 dự phòng, demo 05/11.\n',
 'Epic/Story là việc BA, không có Sprint/ước lượng ở trường Jira. Story và Task đều có cha Epic; Task liên kết *relates to* Story. Một Story có thể có Task ở nhiều Sprint. R1 mặc định hạn Story là ngày Task đầu bắt đầu; US-08.3/US-00.5 giữ ngoại lệ hạn Task cuối để đóng hồ sơ bằng chứng, không tự thay ngưỡng AC.\n']
 for ep in [x for x in ISSUES if x['type']=='Epic']:
  group=[ep]
  for st in [BY[k] for k in story_ids(ep['id'])]:group += [st]+sorted(task_group(st['id']),key=lambda x:x['id'])
  for x in group:
   f=issue_fields(x,backlog);task=x['type']=='Task';level=2 if x['type']=='Epic' else 3 if x['type']=='Story' else 4
   out.append('#'*level+' '+x['id']+' · '+x['title']+'\n')
   fields=[['Issue Id',x['issue_id']],['Issue Type',x['type']],['Parent',x['parent'] or '—'],['Assignee',x['owner'] if task else 'Tình'],['Reporter','Tình'],['Priority',x['priority']],['Status','To Do'],['Start date',f['start']],['Due date',f['due']],['Sprint',f"XIAN Sprint {x['sprint']}" if task else '—'],['Fix version',f['fix']],['Original Estimate',str(x['hours'])+' giờ' if task else '—'],['Story Points',points(x['hours']) if task else '—']]
   if task:fields += [['Story (relates to)',x['story']],['Is blocked by',', '.join(x['deps']) or '—']]
   elif x['type']=='Story':fields += [['Task thực hiện',', '.join(y['id'] for y in task_group(x['id']))],['Sprint thi công',', '.join('S'+str(n) for n in work_sprints(x['id']))]]
   fields += [['Component chính',x.get('primary_component','Tổng hợp phạm vi các Task')],['Components',', '.join(x['components'])],['Labels',', '.join(x['labels'])]]
   out += [table(['Trường','Giá trị'],fields),'\n**Description**\n\n'+f['description']+'\n\n---\n']
 return '\n'.join(out)

def traceability_md():
 out=['# Truy vết nghiệm thu — 268 AC / 71 Task\n', '> Phân công dự kiến, **chưa có TC đã thực thi, chưa có PASS**. TC dùng mã AC tương ứng, thêm hậu tố cho nhiều nhánh. Tiêu chí nguồn: BACKLOG-P1; dữ liệu máy đọc: AC-TASK-MAP.json.\n',
 'Task được nghiệm thu theo đúng AC giao trong bảng. Các AC chưa đủ đầu vào chuyển tới Task tích hợp được ghi rõ; không công bố 100% Story từ kiểm cục bộ. T51 kiểm hồi quy đầy đủ sau mọi triển khai, có thể song song QA chuyên đề; T70 chờ cả hai nhóm và T66. Mỗi bằng chứng cần bản dựng, môi trường, dữ liệu, ngày/người chạy và kết quả PASS/FAIL/BLOCKED.\n']
 for st in [x['id'] for x in ISSUES if x['type']=='Story']:
  rows=[[r['ac'],', '.join(r['implementation_tasks']),r['verification_task'],'Tích hợp/đối soát' if r['stage']=='integration' else 'Task',r['notes']] for r in ACS if r['story']==st]
  out += ['## '+st+' · '+BY[st]['title']+'\n',table(['AC','Task triển khai/đầu vào','Nghiệm thu tại','Mức','Ghi chú'],rows)]
 return '\n'.join(out)

def generate_plan(parallel):
 hours=sum(x['hours'] for x in TASKS.values());pts=sum(points(x['hours']) for x in TASKS.values());edges=sum(len(x['deps']) for x in TASKS.values())
 out=['# KẾ HOẠCH JIRA — Cờ Tướng Online (XIAN)\n',
 '> **Phiên bản 2.0 · Lập lại 09/10/2026.** Nhóm xác nhận chưa triển khai. Ngày 09/10 dành cho BA/kế hoạch; ngày công đầu tiên 10/10. **Giữ 9 Epic, 27 Story, 71 Task; hạn demo 05/11.** Lịch là ước lượng có điều kiện kiểm chứng, không phải cam kết các gate đã đạt.\n',
 '> Nguồn: [BA](BA-SCOPE-DECISIONS.md), [backlog](BACKLOG-P1.md), [bản đồ nghiệm thu](jira/TRUY-VET-AC.md). Tệp nhập: [xian-import.csv](jira/xian-import.csv); bản đầy đủ: [JIRA-MUC-CHI-TIET](jira/JIRA-MUC-CHI-TIET.md). Chưa nhập hoặc xoá dữ liệu Jira.\n',
 '## 1. Nguyên tắc và thay đổi so với kế hoạch cũ\n',
 '- 8 giờ/người/ngày, làm cả cuối tuần; một Task một người, không làm hai Task cùng thời điểm; 4 giờ/nửa ngày. Không đưa 8→12 giờ vào lịch cơ sở.\n- Epic/Story là sản phẩm BA theo hướng dẫn giảng viên; Task thường cùng có cha Epic, liên kết Story. Không đổi thành Sub-task, không thêm Epic P2 vào 107 mục nhập.\n- Task gắn Sprint bắt đầu; một số Task kéo dài sang Sprint kế tiếp, ngày bắt đầu/kết thúc thể hiện đầy đủ. Một Story có thể trải nhiều Sprint để có đủ phần triển khai và kiểm tích hợp; thay quy tắc cũ ép toàn bộ Task của Story vào cùng Sprint.\n- Tùng sở hữu trọn lõi luật cờ. Tùng nhận T20 ván trực tuyến; Đông nhận T54 danh sách phòng và T59 tinh chỉnh máy cờ. Tình giữ kết nối thời gian thực, xây máy cờ và hình/tiếng; nhận việc ở các khâu để cân tải. Đông và Tùng chỉ làm BE; Cường hỗ trợ FE khi đã giảm BE; Nhạn/Kỳ hỗ trợ Thư kiểm thử.\n- T33 không phải chờ FE T25; T52 không phải chờ FE T25; T59 không phải chờ FE T38: hợp đồng bàn giao ở T12, đầu-cuối được kiểm tại T45/T60/T68. Những phụ thuộc thực còn lại vẫn phải hoàn tất trước khi bắt đầu.\n- T51 chạy **đầy đủ** sau tất cả triển khai, song song QA chuyên đề bằng tài khoản/phòng thử riêng. T70 phải chờ T51, T66 và toàn bộ 20 QA, mọi tiêu chí bắt buộc PASS.\n- Lỗi sửa và kiểm lại trong Task sở hữu; sáng 04/11 tổng duyệt, chiều 04/11 dự phòng. Giữ đúng số Epic/Story/Task; không tạo thêm issue loại này để chứa TC hoặc công việc quản lý.\n',
 table(['Chỉ số kiểm trên dữ liệu','Kết quả'],[['Epic / Story / Task','9 / 27 / 71'],['Giờ / điểm',f'{hours} giờ / {pts} điểm'],['Task QA chuyên đề / Task khác','20 / 51'],['AC / NFR / Gate / Demo','268 / 12 / 9 / 10'],['Phụ thuộc trực tiếp sau bỏ cạnh bắc cầu',edges],['Task chạy đồng thời cao nhất',max(parallel.values())],['Trùng người / sai thứ tự / thiếu tham chiếu','0 / 0 / 0'],['Hoàn tất cơ sở',when(TASKS['T71']['end_slot']-1)],['Dự phòng','04/11 buổi chiều'],['Demo','05/11/2026']]),
 '\nCác kiểm tra trên chỉ chứng minh lịch đáp ứng các ràng buộc đã mô hình hoá. Chúng không chứng minh ước lượng hoặc giải pháp kỹ thuật chắc chắn đúng. Chọn mức song song 7 theo trần BA; không giữ tuyên bố cũ tối đa 5.\n',
 '## 2. Cấu trúc và nguồn lực\n',table(['Epic','Nội dung','Story','Task'],[[x['id'],x['title'],len(story_ids(x['id'])),sum(t['parent']==x['id'] for t in TASKS.values())] for x in ISSUES if x['type']=='Epic']),
 '\n'+table(['Người','S1 giờ','S2 giờ','S3 giờ','S4 giờ','Tổng','Còn trong công suất 208h'],[[p,*[sum(sprint_hours(x,n) for x in TASKS.values() if x['owner']==p) for n in range(1,5)],sum(x['hours'] for x in TASKS.values() if x['owner']==p),208-sum(x['hours'] for x in TASKS.values() if x['owner']==p)] for p in PEOPLE]),
 '\nCông suất 10/10–04/11 là 26 ngày × 8 giờ = 208 giờ/người, toàn nhóm 1.456 giờ. Phân công ưu tiên đúng vai trò và đánh giá nội dung từng Task: Tình 140 giờ; giờ của các thành viên khác khác nhau theo tính chất công việc. Đánh giá tải xét phạm vi, độ khó, tích hợp và kiểm chứng, độc lập với giờ dự kiến và Story Points. Xem [đánh giá đủ 71 Task](jira/DANH-GIA-KHOI-LUONG.md). Epic/Story và điều phối của Tình chưa có giờ ước lượng riêng trong 848 giờ. Giờ trống phục vụ review, sửa lỗi và kiểm lại; không phải toàn bộ đều chuyển được sang đường công việc của người khác. Chi tiết chuyển việc và lịch: [PHAN-CONG-CAN-BANG](jira/PHAN-CONG-CAN-BANG.md).\n',
 '## 3. Sprint và kết quả bàn giao\n']
 for n,(lo,hi) in enumerate(SPRINTS,1):
  group=[x for x in TASKS.values() if x['sprint']==n]
  out += [f"### XIAN Sprint {n} · {ds(lo)}–{ds(hi-1)} · {['v0.1','v0.2','v0.3','v1.0'][n-1]}\n",GOALS[n-1]+'\n',f"**{len(group)} Task · {sum(x['hours'] for x in group)} giờ · {sum(points(x['hours']) for x in group)} điểm.**\n",table(['Task','Tên','Story','Người','Giờ','Điểm','Bắt đầu','Kết thúc','Phụ thuộc'],[[x['id'],x['title'],x['story'],x['owner'],x['hours'],points(x['hours']),when(x['start_slot']),when(x['end_slot']-1),', '.join(x['deps']) or '—'] for x in sorted(group,key=lambda y:(y['start_slot'],y['id']))])]
 out += ['\n## 4. R1 — ngày Epic/Story và nghiệm thu sản phẩm\n',
 'Mọi Epic/Story bắt đầu **09/10**. Story mặc định có hạn ngày Task đầu tiên bắt đầu và phải được PO duyệt trước giờ bắt đầu Task đó; US-08.3 và US-00.5 giữ ngoại lệ tới ngày Task cuối để đóng hồ sơ kiểm chứng. **Các ngưỡng AC đã chốt trước thi công, không chờ số đo để hạ tiêu chuẩn.** Epic có hạn theo Story muộn nhất. Mọi mục nhập To Do; không tự đánh dấu Done dựa trên ngày kế hoạch.\n',
 table(['Story','Hạn BA theo R1','Thi công','Sprint có Task'],[[x['id'],ds(story_due(x['id'])),ds(min(t['start_slot'] for t in task_group(x['id'])))+' → '+ds(max(t['end_slot']-1 for t in task_group(x['id']))),', '.join('S'+str(n) for n in work_sprints(x['id']))] for x in ISSUES if x['type']=='Story']),
 '\nStory BA Done không được dùng làm chỉ số chức năng hoàn thành. Chức năng chỉ được nghiệm thu khi mọi AC trong bản đồ đã PASS; QA Task sớm chỉ chịu phần được giao. Story Points chỉ nhập vào Task, tiếp tục quy đổi từ giờ theo thang cũ; không nhập tổng điểm vào Story/Epic.\n',
 '## 5. Cổng kỹ thuật và thứ tự nghiệm thu\n',
 table(['Gate','Thử/đo sớm','Nghiệm thu thật / đối soát'],[
 ['SMTP','T04 · '+ds(TASKS['T04']['end_slot']-1),'T13: email ngoài nhóm, 5 thư/giờ, lỗi dịch vụ; T66 đối soát'],
 ['EMAIL','T04 · '+ds(TASKS['T04']['end_slot']-1),'Gọi API trực tiếp; đổi được email thì BLOCKED; T66 đối soát'],
 ['AUTH-USERNAME','T09 · '+ds(TASKS['T09']['end_slot']-1),'T17: đăng nhập/khoá mật khẩu; nhánh Google tại T48'],
 ['GOOGLE / GUEST','T04 thử cấu hình · '+ds(TASKS['T04']['end_slot']-1),'T35 triển khai thật; T48 nghiệm thu; các nhánh ghế/phiên ở T51/T69'],
 ['SESSION','T06 thử mô hình · '+ds(TASKS['T06']['end_slot']-1),'T56 trên ván thật, T69 kiểm phiên/đăng xuất; không dùng mô phỏng thay PASS'],
 ['MEDIA','T06 LAN/Cloud/HTTPS · '+ds(TASKS['T06']['end_slot']-1),'T33 + T58, T45 và T64 nghiệm thu quyền thật'],
 ['ENGINE','T24 baseline · '+ds(TASKS['T24']['end_slot']-1),'T59 tinh chỉnh/đo '+ds(TASKS['T59']['end_slot']-1)+'; T68 kiểm độc lập'],
 ['REALTIME','T12 thử socket nền · '+ds(TASKS['T12']['end_slot']-1),'T66: 50 người/10 ván tích hợp thật; không đạt chặn T70']]),
 '\nBa quyết định PO ngày 09/10 đã ghi vào AC hiện có: username từ cấm ở bước nhập; thắng/thua ưu tiên trước hoà 120; server restart phòng tự tạo về WAITING. Giữ 268 mã AC; các biến thể TC bổ sung không tạo issue Jira mới.\n',
 '## 6. Lịch từng người và mức song song\n']
 for p in PEOPLE:
  out += ['### '+p+'\n',table(['Task','Giờ','Bắt đầu','Kết thúc'],[[x['id'],x['hours'],when(x['start_slot']),when(x['end_slot']-1)] for x in sorted(TASKS.values(),key=lambda y:y['start_slot']) if x['owner']==p])]
 out += [table(['Ngày','Sáng','Chiều'],[[ds(n),parallel[n],parallel[n+1]] for n in range(0,52,2)]),
 '\n## 7. Mô tả từng Task\n']
 for ep in [x for x in ISSUES if x['type']=='Epic']:
  out.append('### '+ep['id']+' · '+ep['title']+'\n')
  for x in TASKS.values():
   if x['parent']==ep['id']:out += ['#### '+x['id']+' · '+x['title']+'\n',task_description(x)+'\n']
 out += ['\n## 8. Dự phòng và điều kiện đổi kế hoạch\n',
 'Sáng 04/11 tổng duyệt; chỉ còn chiều 04/11 dự phòng. Nếu điều kiện bắt buộc chưa đạt, báo người phụ trách và cập nhật lịch; không tự cắt phạm vi hoặc hạ ngưỡng. Bảng giờ từng Sprint tính theo phần thời gian thực nằm trong Sprint; bảng nhóm Task theo Sprint bắt đầu.\n',
 'Áp dụng 18 điều chỉnh giảm giờ theo khả năng AI hỗ trợ và tái sử dụng, tổng 920 xuống 848 giờ; xem jira/DANH-GIA-ORIGINAL-ESTIMATE.md. Giữ nguyên Description và tiêu chí nghiệm thu.\n',
 '## 9. Chuẩn bị nhập Jira\n',
 'Components và Labels của 107 mục đã khai báo trong dữ liệu nguồn và CSV. Xem [danh mục và phân loại đầy đủ](jira/COMPONENTS-LABELS.md); tạo/đối chiếu Components trước khi nhập, ánh xạ đủ các cột Components/Labels lặp tên. Nhãn chinh-fe/chinh-be/chinh-qa-devops xác định nhóm chính của Task.\n',
 '**Chưa dùng CSV này để cập nhật trực tiếp Jira khi cần giữ XIAN-1–XIAN-107.** Issue Id là mã tham chiếu nội bộ, không phải khóa XIAN hoặc ID hệ thống Jira. CSV chưa có cột khóa cập nhật và định danh tài khoản thật. Xem [rà soát trước nhập](jira/RA-SOAT-TRUOC-NHAP-JIRA.md).\n\n1. Lưu/export bản Jira hiện có và xác định chính xác tập mục cũ cần thay. Tệp này không tự xoá hay nhập dữ liệu.\n2. Đối chiếu bốn Sprint và bốn Fix version trước khi tạo để tránh trùng. Epic/Story không gán Sprint. Fix version của Task theo Sprint hoàn tất; Sprint/nhãn của Task là Sprint bắt đầu. Khi đóng Sprint, chuyển việc chưa hoàn thành sang Sprint kế tiếp và giữ lịch sử.\n3. Ánh xạ bảy tên Assignee/Reporter sang tài khoản Jira thực tế; kiểm quyền và các trường Time tracking/Story Points dành cho Task. CSV hiện giữ tên người để PO kiểm, chưa có định danh tài khoản Jira.\n4. Thử nhập và kiểm trên cấu hình Jira thực tế: UTF-8, ngày dd/MM/yyyy, Original Estimate tính bằng giây; Issue Id/Parent Id ánh xạ quan hệ, Story ánh xạ relates to, các cột Blocked by ánh xạ is blocked by. Không giả định mọi giao diện nhập đều nhận các trường giống nhau.\n5. Sau thử nhập, đếm 9/27/71, kiểm cha Epic, liên kết Story/phụ thuộc, người làm, Sprint/ngày/điểm/giờ và trạng thái To Do. Nếu trình nhập không nhận liên kết bằng ID nội bộ, lập bảng ID→issue key sau nhập rồi tạo liên kết theo bảng đó.\n',
 '## 10. Tái tạo và kiểm tra\n',
 'Nguồn lịch, phân công và phạm vi: `jira/plan-data.json`. Nguồn Description của toàn bộ 107 mục: `jira/descriptions.json`; sửa tệp này rồi sinh lại, không sửa riêng CSV hoặc bản Markdown. Nguồn luật/AC: BA và BACKLOG-P1. Bản đồ nghiệm thu: `jira/AC-TASK-MAP.json`. Chạy `python3 jira/build_plan.py` để sinh lại tệp; `python3 jira/build_plan.py --check` kiểm số lượng, lịch, phụ thuộc, người kiểm độc lập, đầu vào268AC và độ đồng bộ các đầu ra. Không cần thư viện ngoài. Báo cáo: [KIEM-TRA-KE-HOACH](jira/KIEM-TRA-KE-HOACH.md).\n']
 return '\n'.join(out)

def report(parallel):
 return '# Kiểm tra kế hoạch lập lại 09/10/2026\n\n'+table(['Kiểm tra dữ liệu kế hoạch','Kết quả'],[
 ['Danh tính/membership kế hoạch local','9 Epic, 27 Story, 71 Task; 107 ID duy nhất'],['Description độc lập','107/107; đủ mục tiêu, bối cảnh, yêu cầu, việc làm, bàn giao, điều kiện hoàn thành và phạm vi'],['Mã kế hoạch không giải thích trong Description','0; kiểm riêng nội dung mô tả, giữ mã liên kết ở các trường quản lý'],['Components / Labels','107/107; mỗi Task đúng một nhóm chính và nhãn tương ứng'],['CSV','107 dòng dữ liệu; kiểm đủ trường, cột lặp, ước lượng giây và Fix version theo ngày hoàn tất'],['Phân công theo vai trò','Đạt; BE/FE/Tester và phạm vi hỗ trợ được kiểm tra'],['Đánh giá khối lượng','71/71 Task có lý do; áp dụng phân công và 848 giờ đã thống nhất'],['Độc lập kiểm chuyên đề theo từng AC','Không tự nghiệm thu phần tính năng mình triển khai'],['Giờ',848],['Điểm',sum(points(x['hours']) for x in TASKS.values())],['QA chuyên đề',len(QA)],['AC duy nhất / truy vết',len(ACS)],['Phụ thuộc trực tiếp',sum(len(x['deps']) for x in TASKS.values())],['Chu trình / tham chiếu thiếu / sai thứ tự','0 / 0 / 0'],['Trùng người / kiểm Story tự triển khai','0 / 0'],['Task kéo sang Sprint kế tiếp',', '.join(k for k,x in TASKS.items() if x['end_slot']>SPRINTS[x['sprint']-1][1])],['AC nghiệm thu trước đầu vào hoặc thiếu đường phụ thuộc',0],['Song song tối đa',max(parallel.values())],['T51 bắt đầu sau mọi triển khai','Đạt; QA chuyên đề chạy song song'],['T70 chờ toàn bộ QA + T51 + T66','Đạt'],['Hoàn tất kế hoạch',when(TASKS['T71']['end_slot']-1)],['04/11','Sáng tổng duyệt; chiều dự phòng']])+ '\n**Giới hạn:** đây là kiểm tra cấu trúc/lịch dự kiến, không phải kiểm thử ứng dụng. Chưa có mã triển khai, TC thực thi, số đo gate hoặc xác nhận import trên Jira. Bằng chứng PASS/FAIL/BLOCKED sẽ được ghi khi thực hiện.\n\nTái chạy: `python3 jira/build_plan.py --check`.\n'

def components_md():
 counts=collections.Counter(t['primary_component'] for t in TASKS.values())
 out=['# Components và Labels cho 107 mục Jira\n',
 'Mỗi Task có đúng một component chính: **FE** (giao diện), **BE** (xử lý máy chủ/luật/dữ liệu) hoặc **QA & DevOps** (kiểm thử/hạ tầng/vận hành). Ngoài ra có một hoặc nhiều component chức năng. Nhóm chính phản ánh công việc, không suy ra từ tên người được giao. Ví dụ người làm máy chủ vẫn có thể nhận Task thuộc QA & DevOps khi dựng hạ tầng.\n',
 'Epic và Story tổng hợp component từ các Task thuộc phạm vi; vì vậy có thể đồng thời chứa FE, BE và QA & DevOps. Đây là phạm vi sản phẩm liên quan; Epic/Story vẫn là công việc đặc tả, không thay đổi phân công hoặc ước lượng.\n',
 'Component chính được ghi rõ trong dữ liệu kế hoạch và bảng dưới. Khi nhập Jira, nhãn `chinh-fe`, `chinh-be` hoặc `chinh-qa-devops` giữ dấu hiệu nhóm chính; không dựa vào vị trí đầu tiên trong danh sách Components. Epic/Story không có nhãn nhóm chính của Task.\n',
 '## Danh mục component\n',table(['Tên chính xác','Ý nghĩa'],list(DATA['component_catalog'].items())),
 '\n## Quy ước Labels\n',
 '- `p1`: thuộc bản bàn giao đầu tiên.\n- `sprint-1` đến `sprint-4`: Sprint bắt đầu của Task; xem ngày kết thúc khi Task kéo sang Sprint sau.\n- `chinh-fe`, `chinh-be`, `chinh-qa-devops`: đúng một nhãn nhóm chính trên mỗi Task.\n- `dac-ta`: công việc đặc tả ở Epic/Story; mã `EP-xx` giữ liên hệ nhóm yêu cầu.\n- `phat-trien`, `kiem-thu`: triển khai tính năng hoặc kiểm thử chuyên đề. Các công việc đặc thù dùng `ha-tang`, `chuan-bi-kiem-thu`, `thu-nghiem-ky-thuat`, `kiem-thu-tich-hop`, `do-chat-luong`, `dong-goi-phat-hanh`, `tong-duyet`.\n- Nhãn chức năng viết không dấu, nối bằng gạch ngang: `tai-khoan`, `luat-co`, `camera-va-mic`… tương ứng component chức năng để dễ lọc.\n',
 '## Phân bố Task theo nhóm chính\n',table(['Component chính','Số Task'],[[c,counts[c]] for c in PRIMARY_COMPONENTS]),
 '\n## Chuẩn bị nhập Jira\n',
 'Tạo/đối chiếu danh mục Components bằng đúng tên bên trên trong dự án đích. CSV xuất mỗi giá trị vào một cột lặp tên `Components` hoặc `Labels`; khi thử nhập cần ánh xạ toàn bộ các cột cùng tên vào trường tương ứng và kiểm việc nhận nhiều giá trị. Không tách chuỗi bằng dấu phẩy hoặc chỉ lấy cột đầu. Không dùng trình đọc CSV chỉ giữ một giá trị cho tên cột trùng.\n',
 'Bản xuất dùng nhãn để nhận biết nhóm chính, không yêu cầu thêm trường tùy chỉnh. Kiểm sau nhập: đủ 107 mục có Components/Labels; mỗi Task có đúng một nhóm chính và đúng nhãn; các component chức năng không bị mất. Đây là dữ liệu chuẩn bị nhập, chưa phải xác nhận cấu hình hay dữ liệu trên Jira thật.\n',
 '## Danh sách đầy đủ\n',table(['Mã','Loại','Component chính','Components','Labels'],[[x['id'],x['type'],x.get('primary_component','Tổng hợp'),', '.join(x['components']),', '.join(x['labels'])] for x in ISSUES])]
 return '\n'.join(out)

def workload_md():
 out=['# Đánh giá nội dung 71 Task — 09/10/2026\n',ASSESSMENT['method']+'\n',
 'Đơn vị tải dưới đây là nhận định tương đối để phân công, không phải giờ, Story Points trên Jira hoặc thước đo năng lực. Không lấy giờ hay số tiêu chí nghiệm thu làm công thức tính. Giữ nguyên ước lượng thời gian hiện có để kiểm lịch; điều này không xác nhận các ước lượng đã chính xác.\n',
 table(['Mức tải','Cách hiểu'],ASSESSMENT['scale'].items()),
 '\nMỗi lý do xét đầu ra, nhánh xử lý, phần cần phối hợp và trách nhiệm kiểm chứng. T10 có ít giờ nhưng nhiều quy tắc kết thúc ván; T15 chủ yếu dùng lại thành phần biểu mẫu đăng nhập. T68/T69 có phạm vi kiểm rộng dù chỉ 8 giờ mỗi Task: cần chuẩn bị dữ liệu và môi trường trước, ghi nhận thời gian thực và cập nhật lịch nếu vượt dự kiến. Không coi điểm tải là bằng chứng chắc chắn không quá tải.\n',
 table(['Task','Công việc','Người','Giờ dự kiến','Đơn vị tải','Cơ sở đánh giá'],[[k,x['title'],x['owner'],x['hours'],LOAD[k]['load_units'],LOAD[k]['reason']] for k,x in TASKS.items()]),
 '\nKhi bắt đầu triển khai, cập nhật đánh giá bằng khối lượng thực còn lại, vướng mắc và mức sẵn sàng của đầu vào. Nếu cần đổi ước lượng, tính lại lịch và ngày dự phòng; không giữ các con số chỉ để bảng nhìn cân bằng.\n']
 return '\n'.join(out)

def allocation_md():
 out=['# Phân công đã áp dụng — 848 giờ\n',
 'Giữ 9 Epic, 27 Story, 71 Task. T20 sang Tùng; T54/T59 sang Đông; T33 ở Tình; T49 giữ Kỳ. Tình có nhiều giờ Task nhất. Đã đồng bộ tài liệu local và CSV, chưa cập nhật Jira thật.\n',
 table(['Người','Task','Giờ','Tải đánh giá','S1 giờ','S2 giờ','S3 giờ','S4 giờ'],[[p,sum(x['owner']==p for x in TASKS.values()),sum(x['hours'] for x in TASKS.values() if x['owner']==p),sum(LOAD[k]['load_units'] for k,x in TASKS.items() if x['owner']==p),*[sum(sprint_hours(x,n) for x in TASKS.values() if x['owner']==p) for n in range(1,5)]] for p in PEOPLE]),
 '\nGiờ Sprint tính theo phần thời gian thực nằm trong từng Sprint. Task gắn Sprint bắt đầu, có thể kéo sang Sprint sau; không tạo thêm Task. Tổng duyệt sáng 04/11, chiều 04/11 dự phòng, demo 05/11. Lịch làm tối đa 8 giờ/ngày, có cuối tuần. Việc điều phối, rà mã và hỗ trợ ngoài Task chưa có ước lượng riêng.\n',
 'Cường giữ BE và thử nguyên mẫu, hỗ trợ 32 giờ FE; Nhạn/Kỳ giữ FE chính và hỗ trợ QA 44/24 giờ. Đông/Tùng chỉ nhận BE. Thư giữ kiểm thử chính, hồi quy và tổng duyệt. Người kiểm chuyên đề không tự nghiệm thu tính năng mình triển khai.\n',
 'Tình bàn giao máy cờ T24 cho Đông làm T59: mã, giao diện gọi, cấu hình, bộ đo và số liệu ban đầu. T68 vẫn là kiểm độc lập. Điểm tải là nhận định nội dung, không phải giờ hoặc thước đo công bằng; không giữ kết luận cũ rằng sáu người đều 52–57 điểm.\n']
 for p in PEOPLE:
  out+=['## '+p+'\n',DATA['allocation_revision']['rationale'][p]+'\n',table(['Task','Công việc','Nhóm chính','Giờ','Sprint bắt đầu','Bắt đầu','Kết thúc'],[[x['id'],x['title'],x['primary_component'],x['hours'],x['sprint'],when(x['start_slot']),when(x['end_slot']-1)] for x in sorted(TASKS.values(),key=lambda x:(x['start_slot'],x['id'])) if x['owner']==p])]
 out+=['\nMã T01–T71 là mã nội bộ; phải đối chiếu khóa XIAN trước khi cập nhật Jira thật.\n']
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
  assert get('Parent Id')==(str(BY[x['parent']]['issue_id']) if x['parent'] else ''),key
  assert get('Assignee')==(x['owner'] if x['type']=='Task' else 'Tình'),key
  assert get('Start date')==f['start'] and get('Due date')==f['due'] and get('Fix Version')==f['fix'],key
  for name,field in [('Components','components'),('Labels','labels')]:
   assert [row[i] for i in cols[name] if row[i]]==x[field],(key,name)
  if x['type']=='Task':
   assert int(get('Original Estimate'))==x['hours']*3600 and int(get('Story Points'))==points(x['hours']),key
   assert get('Sprint')=='XIAN Sprint '+str(x['sprint']),key
   assert get('Story')==str(BY[x['story']]['issue_id']),key
   assert [row[i] for i in cols['Blocked by'] if row[i]]==[str(BY[k]['issue_id']) for k in x['deps']],key
   assert ['v0.1','v0.2','v0.3','v1.0'].index(get('Fix Version'))+1==finish_sprint(x),key
  else:assert not get('Original Estimate') and not get('Sprint') and not get('Story Points'),key
 assert seen==set(BY)

def main():
 parallel=validate();backlog=backlog_update()
 outputs={'BACKLOG-P1.md':backlog,'KE-HOACH-JIRA.md':generate_plan(parallel),'jira/JIRA-MUC-CHI-TIET.md':generate_detail(backlog),'jira/xian-import.csv':generate_csv(backlog),'jira/TRUY-VET-AC.md':traceability_md(),'jira/KIEM-TRA-KE-HOACH.md':report(parallel),'jira/COMPONENTS-LABELS.md':components_md(),'jira/PHAN-CONG-CAN-BANG.md':allocation_md(),'jira/DANH-GIA-KHOI-LUONG.md':workload_md()}
 validate_export(outputs['jira/xian-import.csv'],backlog)
 check='--check' in sys.argv
 for name,value in outputs.items():
  path=ROOT/name
  if check:assert path.exists() and path.read_bytes()==value.encode('utf-8'),('Generated file differs',name)
  else:path.write_bytes(value.encode('utf-8'))
 print(('CHECK PASS' if check else 'GENERATED')+': 107 issues, 71 tasks, 848 hours, 268 AC; schedule, acceptance dependencies, 107 descriptions and component/label assignments valid.')
if __name__=='__main__':main()
