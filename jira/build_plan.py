#!/usr/bin/env python3
"""Generate and validate the 09 Oct 2026 Jira baseline using only Python stdlib.
Source: plan-data.json + BACKLOG-P1.md + AC-TASK-MAP.json.
Run from any directory: python3 jira/build_plan.py [--check]
--check validates and compares generated artifacts without writing.
"""
import collections,csv,datetime,io,json,re,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
DATA=json.loads((ROOT/'jira/plan-data.json').read_text())
ISSUES=DATA['issues'];BY={x['id']:x for x in ISSUES};TASKS={k:x for k,x in BY.items() if x['type']=='Task'}
ACS=json.loads((ROOT/'jira/AC-TASK-MAP.json').read_text())
BASE=datetime.date.fromisoformat(DATA['start_date'])
PEOPLE=['Tình','Đông','Tùng','Cường','Nhạn','Kỳ','Thư']
QA=[k for k,x in TASKS.items() if 'kiem-thu' in x['labels']]
SPRINTS=DATA['sprints']
GOALS=[
'Khung ứng dụng, đăng ký OTP, lõi luật và bàn cờ tương tác; thử media/xác thực/phiên sớm. Chưa tuyên bố nghiệm thu toàn bộ đăng nhập có Google.',
'Tạo/vào phòng, ván online cơ bản, Google/Khách, máy cờ có baseline; hoàn thiện các backend phòng/chat. Một số AC liên chức năng chờ S3–S4.',
'Hoàn tất mọi phần triển khai P1: phiên, bạn bè, media, AI, Sảnh/người xem, phục hồi; chạy QA chuyên đề đã đủ đầu vào.',
'Hồi quy đầy đủ và QA còn lại trên bản tích hợp, đo NFR/gate, đóng gói và tổng duyệt 03/11; 04/11 dự phòng.'
]
def date(slot):return BASE+datetime.timedelta(days=slot//2)
def ds(slot,year=False):return date(slot).strftime('%d/%m/%Y' if year else '%d/%m')
def when(slot):return ds(slot)+(' sáng' if slot%2==0 else ' chiều')
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
def work_sprints(story):return sorted({x['sprint'] for x in task_group(story)})
def story_due(story):
 group=task_group(story)
 return max(x['end_slot']-1 for x in group) if story in ['US-00.5','US-08.3'] else min(x['start_slot'] for x in group)
def acceptance_text(x):
 ids=ac_ids(x['id'])
 return ('AC được giao: '+', '.join(ids)+'. ' if ids else 'Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. ')+('PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. ')+('Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.')
def task_description(x):
 deps=', '.join(x['deps']) or 'Không có'
 return '\n'.join([
 '**Mục tiêu:** '+x['title']+' — phục vụ '+x['story']+' '+BY[x['story']]['title']+'.',
 '**Đầu vào (phải xong trước):** '+deps+'.',
 '**Việc cần làm:**',*['- '+z for z in x['steps']],
 '**Đầu ra:** '+x['output'],
 '**Cách kiểm và điều kiện PASS:** '+acceptance_text(x),
 '**Lịch:** '+f"{x['owner']} · {x['hours']} giờ · {points(x['hours'])} Story Points · {when(x['start_slot'])} → {when(x['end_slot']-1)} · XIAN Sprint {x['sprint']}.",
 '**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.'
 ])
def validate():
 assert collections.Counter(x['type'] for x in ISSUES)=={'Epic':9,'Story':27,'Task':71}
 assert len(BY)==107 and len({x['issue_id'] for x in ISSUES})==107
 for k,x in BY.items():
  if x['type']=='Epic':assert int(x['issue_id'])==int(k[-2:])+1
  if x['type']=='Task':assert int(x['issue_id'])==int(k[1:])+36
 for num,k in enumerate(sorted(k for k,x in BY.items() if x['type']=='Story'),10):assert int(BY[k]['issue_id'])==num
 assert sum(x['hours'] for x in TASKS.values())==920
 assert len(QA)==20
 from graphlib import TopologicalSorter
 assert len(list(TopologicalSorter({k:x['deps'] for k,x in TASKS.items()}).static_order()))==71
 occupancy=collections.Counter();parallel=collections.Counter()
 for k,x in TASKS.items():
  assert BY[x['parent']]['type']=='Epic' and BY[x['story']]['parent']==x['parent']
  assert x['hours']==4*(x['end_slot']-x['start_slot']),k
  lo,hi=SPRINTS[x['sprint']-1];assert lo<=x['start_slot']<x['end_slot']<=hi,k
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
   if t!=v:
    assert TASKS[t]['end_slot']<=TASKS[v]['start_slot'],('AC readiness',r['ac'],t,v)
    assert t in ancestors(v),('AC dependency missing',r['ac'],t,v)
 assert set(QA+['T51','T66'])<=ancestors('T70')
 assert all(TASKS[k]['end_slot']<=TASKS['T51']['start_slot'] for k in TASKS if k not in QA+['T51','T66','T70','T71'])
 assert TASKS['T71']['end_slot']<=50
 assert not any(occupancy[p,slot] for p in PEOPLE for slot in [50,51])
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
 s=s[:a]+'### 9.2 Phân bổ Sprint\n\nNgày 09/10 lập lại BA/kế hoạch; chưa có Task đã triển khai. Thi công từ 10/10. Story BA không vào Sprint; một Story có thể được thi công/kiểm ở nhiều Sprint. Mỗi Task nằm trọn trong một Sprint.\n\n'+table(['Sprint','Ngày','Task','Giờ','Điểm','Kết quả dự kiến'],rows)+'\nLịch chi tiết, phụ thuộc và điều kiện bàn giao ở [KE-HOACH-JIRA.md](KE-HOACH-JIRA.md). Tổng 920 giờ; ngày 04/11 dự phòng, demo 05/11.\n\n---\n\n'+s[b:]
 s=s.replace('Máy cờ cấp Khó độ sâu 6 trong 3 giây bằng TypeScript chưa có số đo','Máy cờ cấp Khó có mục tiêu độ sâu 6/ngân sách 3 giây; chưa có số đo')
 return s

def story_body(st,backlog):
 m=re.search(r'#### '+re.escape(st)+r' · [^\n]+\n(.*?)(?=\n#### |\n### |\n## |\Z)',backlog,re.S);assert m,st
 text=m[1].strip().removesuffix('---').strip()
 return text+f"\n\nStory là việc BA, hạn R1 {ds(story_due(st))}; không vào Sprint. Done đặc tả không đồng nghĩa chức năng đã PASS. Nơi nghiệm thu từng AC: jira/TRUY-VET-AC.md."

def issue_fields(x,backlog):
 typ=x['type'];start=DATA['planning_date'];fix='v1.0'
 if typ=='Task':
  due=ds(x['end_slot']-1,True);start=ds(x['start_slot'],True);fix=['v0.1','v0.2','v0.3','v1.0'][x['sprint']-1];desc=task_description(x)
 elif typ=='Story':due=ds(story_due(x['id']),True);desc=story_body(x['id'],backlog);fix=['v0.1','v0.2','v0.3','v1.0'][max(work_sprints(x['id']))-1]
 else:
  due=ds(max(story_due(st) for st in story_ids(x['id'])),True)
  desc=x['description'].split('\n\nStory là')[0]+ '\n\nEpic là phần việc BA, Done khi các Story được PO duyệt theo R1. Kết quả sản phẩm chỉ nghiệm thu khi AC của các Story đạt.\nStory: '+', '.join(story_ids(x['id']))+'.'
  group=[t for t in TASKS.values() if t['parent']==x['id']]
  desc+=f"\nTổng tham khảo: {len(group)} Task, {sum(t['hours'] for t in group)} giờ, {sum(points(t['hours']) for t in group)} điểm. Không nhập tổng vào trường ước lượng/điểm của Epic."
 if typ!='Task':start=datetime.date.fromisoformat(DATA['planning_date']).strftime('%d/%m/%Y')
 return {'start':start,'due':due,'fix':fix,'description':desc}

def generate_csv(backlog):
 maxdeps=max(len(x['deps']) for x in TASKS.values())
 header=['Issue Id','Parent Id','Issue Type','Summary','Description','Assignee','Reporter','Sprint','Fix Version','Original Estimate','Start date','Due date','Labels','Labels','Priority','Status','Story Points','Story']+['Blocked by']*maxdeps
 buf=io.StringIO(newline='');w=csv.writer(buf,lineterminator='\n');w.writerow(header)
 for x in ISSUES:
  f=issue_fields(x,backlog);task=x['type']=='Task';labels=x['labels'][:]
  if task:labels=[f"sprint-{x['sprint']}",'kiem-thu' if x['id'] in QA else 'phat-trien']
  row=[x['issue_id'],BY[x['parent']]['issue_id'] if x['parent'] else '',x['type'],x['id']+' · '+x['title'],f['description'],x['owner'] if task else 'Tình','Tình',f"XIAN Sprint {x['sprint']}" if task else '',f['fix'],str(x['hours']*3600) if task else '',f['start'],f['due'],*(labels+['',''])[:2],x['priority'],'To Do',points(x['hours']) if task else '',BY[x['story']]['issue_id'] if task else '']
  deps=[BY[d]['issue_id'] for d in x['deps']] if task else [];w.writerow(row+deps+['']*(maxdeps-len(deps)))
 return '\ufeff'+buf.getvalue()

def generate_detail(backlog):
 out=['# Danh sách mục Jira XIAN — kế hoạch lập lại 09/10/2026\n', '> **9 Epic · 27 Story · 71 Task = 107 mục.** Sinh từ `plan-data.json`, BACKLOG-P1 và AC-TASK-MAP; mọi mục nhập To Do. Ngày 09/10 lập kế hoạch, thi công 10/10–03/11; 04/11 dự phòng, demo 05/11.\n',
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
 '- 8 giờ/người/ngày, làm cả cuối tuần; một Task một người, không làm hai Task cùng thời điểm; 4 giờ/nửa ngày. Không đưa 8→12 giờ vào lịch cơ sở.\n- Epic/Story là sản phẩm BA theo hướng dẫn giảng viên; Task thường cùng có cha Epic, liên kết Story. Không đổi thành Sub-task, không thêm Epic P2 vào 107 mục nhập.\n- Từng Task nằm trọn trong một Sprint. Một Story có thể trải nhiều Sprint để có đủ phần triển khai và kiểm tích hợp; thay quy tắc cũ ép toàn bộ Task của Story vào cùng Sprint.\n- Tình giữ lõi luật, realtime, máy cờ và backend media/phục hồi. Chuyển giao diện thường lệ sang FE và chuẩn bị đáp án thử sang Tester; không bỏ chức năng.\n- T33 không phải chờ FE T25; T52 không phải chờ FE T25; T59 không phải chờ FE T38: hợp đồng bàn giao ở T12, đầu-cuối được kiểm tại T45/T60/T68. Những phụ thuộc thực còn lại vẫn phải hoàn tất trước khi bắt đầu.\n- T51 chạy **đầy đủ** sau tất cả triển khai, song song QA chuyên đề bằng tài khoản/phòng thử riêng. T70 phải chờ T51, T66 và toàn bộ 20 QA, mọi tiêu chí bắt buộc PASS.\n- Lỗi sửa và kiểm lại trong Task sở hữu; 04/11 là dự phòng, không có Task cơ sở. Giữ đúng số Epic/Story/Task; không tạo thêm issue loại này để chứa TC hoặc công việc quản lý.\n',
 table(['Chỉ số kiểm trên dữ liệu','Kết quả'],[['Epic / Story / Task','9 / 27 / 71'],['Giờ / điểm',f'{hours} giờ / {pts} điểm'],['Task QA chuyên đề / Task khác','20 / 51'],['AC / NFR / Gate / Demo','268 / 12 / 9 / 10'],['Phụ thuộc trực tiếp sau bỏ cạnh bắc cầu',edges],['Task chạy đồng thời cao nhất',max(parallel.values())],['Trùng người / sai thứ tự / thiếu tham chiếu','0 / 0 / 0'],['Hoàn tất cơ sở',when(TASKS['T71']['end_slot']-1)],['Dự phòng','04/11 cả ngày'],['Demo','05/11/2026']]),
 '\nCác kiểm tra trên chỉ chứng minh lịch đáp ứng các ràng buộc đã mô hình hoá. Chúng không chứng minh ước lượng hoặc giải pháp kỹ thuật chắc chắn đúng. Chọn mức song song 7 theo trần BA; không giữ tuyên bố cũ tối đa 5.\n',
 '## 2. Cấu trúc và nguồn lực\n',table(['Epic','Nội dung','Story','Task'],[[x['id'],x['title'],len(story_ids(x['id'])),sum(t['parent']==x['id'] for t in TASKS.values())] for x in ISSUES if x['type']=='Epic']),
 '\n'+table(['Người','S1 giờ','S2 giờ','S3 giờ','S4 giờ','Tổng','Còn trong công suất 208h'],[[p,*[sum(x['hours'] for x in TASKS.values() if x['owner']==p and x['sprint']==n) for n in range(1,5)],sum(x['hours'] for x in TASKS.values() if x['owner']==p),208-sum(x['hours'] for x in TASKS.values() if x['owner']==p)] for p in PEOPLE]),
 '\nCông suất 10/10–04/11 là 26 ngày × 8 giờ = 208 giờ/người, toàn nhóm 1.456 giờ. Tình 164 giờ, giữ 100% công suất kỹ thuật theo BA, không tự trừ vai trò PO/SM. Giờ trống phục vụ review, sửa lỗi và kiểm lại; không phải toàn bộ đều chuyển được sang đường công việc của người khác.\n',
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
 'Ngày04/11 không phân Task mới: ưu tiên sửa lỗi và chạy lại các kiểm tra ảnh hưởng trên cùng bản dựng. Nếu việc bắt buộc vẫn FAIL/BLOCKED, báo PO với số đo và tác động; không tự cắt P1 hoặc đổi ngưỡng. Tình kín 56 giờ ở S1 và S2 nên vẫn là điểm tập trung rủi ro; phát hiện trễ phải cập nhật dữ liệu lịch và kiểm lại ngay.\n',
 'Thời gian chuyển sang FE/data giữ nguyên tổng phạm vi: T33 chuyển 8h UI sang T58; T52 chuyển 4h overlay sang T25; T59 chuyển 4h UI sang T38 và 4h dữ liệu đáp án sang T02. T42/T46/T65 chuyển khỏi Tình. T04 +8h thử auth/phục hồi, T06 +8h thử phiên, T13/T17/T69 mỗi Task +4h kiểm biên: tăng tổng từ 892 lên 920h.\n',
 '## 9. Chuẩn bị nhập Jira\n',
 '1. Lưu/export bản Jira hiện có và xác định chính xác tập mục cũ cần thay. Tệp này không tự xoá hay nhập dữ liệu.\n2. Tạo bốn Sprint theo mục 3 và bốn Fix version; Epic/Story không gán Sprint.\n3. Ánh xạ bảy tên Assignee/Reporter sang tài khoản Jira thực tế; kiểm quyền và các trường Time tracking/Story Points dành cho Task. CSV hiện giữ tên người để PO kiểm, chưa có định danh tài khoản Jira.\n4. Thử nhập và kiểm trên cấu hình Jira thực tế: UTF-8, ngày dd/MM/yyyy, Original Estimate tính bằng giây; Issue Id/Parent Id ánh xạ quan hệ, Story ánh xạ relates to, các cột Blocked by ánh xạ is blocked by. Không giả định mọi giao diện nhập đều nhận các trường giống nhau.\n5. Sau thử nhập, đếm9/27/71, kiểm cha Epic, liên kết Story/phụ thuộc, người làm, Sprint/ngày/điểm/giờ và trạng thái To Do. Nếu trình nhập không nhận liên kết bằng ID nội bộ, lập bảng ID→issue key sau nhập rồi tạo liên kết theo bảng đó.\n',
 '## 10. Tái tạo và kiểm tra\n',
 'Nguồn lịch/nội dung Task: `jira/plan-data.json`. Nguồn luật/AC: BA và BACKLOG-P1. Bản đồ nghiệm thu: `jira/AC-TASK-MAP.json`. Chạy `python3 jira/build_plan.py` để sinh lại tệp; `python3 jira/build_plan.py --check` kiểm số lượng, lịch, phụ thuộc, người kiểm độc lập, đầu vào268AC và độ đồng bộ các đầu ra. Không cần thư viện ngoài. Báo cáo: [KIEM-TRA-KE-HOACH](jira/KIEM-TRA-KE-HOACH.md).\n']
 return '\n'.join(out)

def report(parallel):
 return '# Kiểm tra kế hoạch lập lại 09/10/2026\n\n'+table(['Kiểm tra dữ liệu kế hoạch','Kết quả'],[
 ['Danh tính/membership Jira','9 Epic, 27 Story, 71 Task; 107 ID duy nhất'],['Giờ',920],['Điểm',sum(points(x['hours']) for x in TASKS.values())],['QA chuyên đề',len(QA)],['AC duy nhất / truy vết',len(ACS)],['Phụ thuộc trực tiếp',sum(len(x['deps']) for x in TASKS.values())],['Chu trình / tham chiếu thiếu / sai thứ tự','0 / 0 / 0'],['Trùng người / kiểm Story tự triển khai','0 / 0'],['Task vượt ranh Sprint',0],['AC nghiệm thu trước đầu vào hoặc thiếu đường phụ thuộc',0],['Song song tối đa',max(parallel.values())],['T51 bắt đầu sau mọi triển khai','Đạt; QA chuyên đề chạy song song'],['T70 chờ toàn bộ QA + T51 + T66','Đạt'],['Hoàn tất kế hoạch',when(TASKS['T71']['end_slot']-1)],['04/11 dự phòng','Không có Task cơ sở']])+ '\n**Giới hạn:** đây là kiểm tra cấu trúc/lịch dự kiến, không phải kiểm thử ứng dụng. Chưa có mã triển khai, TC thực thi, số đo gate hoặc xác nhận import trên Jira. Bằng chứng PASS/FAIL/BLOCKED sẽ được ghi khi thực hiện.\n\nTái chạy: `python3 jira/build_plan.py --check`.\n'

def main():
 parallel=validate();backlog=backlog_update()
 outputs={'BACKLOG-P1.md':backlog,'KE-HOACH-JIRA.md':generate_plan(parallel),'jira/JIRA-MUC-CHI-TIET.md':generate_detail(backlog),'jira/xian-import.csv':generate_csv(backlog),'jira/TRUY-VET-AC.md':traceability_md(),'jira/KIEM-TRA-KE-HOACH.md':report(parallel)}
 check='--check' in sys.argv
 for name,value in outputs.items():
  path=ROOT/name
  if check:assert path.exists() and path.read_bytes()==value.encode('utf-8'),('Generated file differs',name)
  else:path.write_bytes(value.encode('utf-8'))
 print(('CHECK PASS' if check else 'GENERATED')+': 107 issues, 71 tasks, 920 hours, 268 AC; schedule and acceptance dependencies valid.')
if __name__=='__main__':main()
