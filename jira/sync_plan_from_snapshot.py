#!/usr/bin/env python3
"""Refresh local planning inputs from the read-only Jira snapshot; no network writes."""
import datetime
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
HEADINGS = [('goal', 'Mục tiêu'), ('context', 'Bối cảnh công việc'),
            ('requirements', 'Yêu cầu cần đáp ứng'), ('steps', 'Việc cần làm'),
            ('deliverables', 'Kết quả bàn giao'), ('acceptance', 'Điều kiện hoàn thành'),
            ('boundary', 'Phạm vi và phối hợp')]
NAMES = {'TÌNH 4851_NGUYỄN NGỌC': 'Tình', 'Võ Thành Đông': 'Đông',
         'nguyenhoangtungtuyhoa': 'Tùng', 'Tưởng Lê khoa Cường-4572': 'Cường',
         '4841_Lê Thị Xuân Nhạn': 'Nhạn', 'Gia Kỳ': 'Kỳ', 'Nguyễn Minh Thư': 'Thư'}

def write(name, data):
    (ROOT / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

def parse_description(text):
    result = {}
    for i, (field, heading) in enumerate(HEADINGS):
        begin = text.index('**' + heading + '**') + len(heading) + 4
        end = text.index('**' + HEADINGS[i + 1][1] + '**', begin) if i + 1 < len(HEADINGS) else len(text)
        body = text[begin:end].strip()
        if field in {'goal', 'context', 'boundary'}:
            result[field] = body
        else:
            result[field] = [part.strip() for part in re.split(r'(?m)^[*-] ', body) if part.strip()]
    return result

def main():
    source = json.loads((ROOT / 'current-jira-snapshot.json').read_text())
    data = json.loads((ROOT / 'plan-data.json').read_text())
    base = datetime.date.fromisoformat(data['start_date'])
    id_by_key = {x['key']: x['summary'].split(' · ', 1)[0] for x in source['issues']}
    live = {id_by_key[x['key']]: x for x in source['issues']}
    assert set(live) == {x['id'] for x in data['issues']}
    sprint_numbers = {s['id']: int(s['name'].rsplit(' ', 1)[1]) for s in source['sprints']}
    versions = {v['id']: v['name'] for v in source['versions']}
    descriptions = {}
    for x in data['issues']:
        y = live[x['id']]
        x.update(jira_key=y['key'], jira_id=y['id'], title=y['summary'].split(' · ', 1)[1],
                 owner=NAMES[y['assignee']['name']], assignee_account_id=y['assignee']['id'],
                 reporter_account_id=y['reporter']['id'], status=y['status'], resolution=y['resolution'],
                 start_date=y['start'], due_date=y['due'], fix_versions=[versions[v] for v in y['versions']],
                 priority=y['priority'], components=y['components'], labels=y['labels'],
                 parent=id_by_key.get(y['parent']))
        descriptions[x['id']] = parse_description(y['description'])
        # Remove superseded duplicated descriptions from the original import model.
        for stale in ['description', 'steps', 'output']:
            x.pop(stale, None)
        if x['type'] == 'Task':
            stories = [id_by_key[l.get('inward') or l.get('outward')] for l in y['links']
                       if l['type'] == 'Relates' and (l.get('inward') or l.get('outward')) in id_by_key
                       and id_by_key[l.get('inward') or l.get('outward')].startswith('US-')]
            assert len(stories) == 1, y['key']
            x.update(hours=y['hours'], remaining_hours=y['remaining_hours'], spent_hours=y['spent_hours'],
                     story_points=y['points'], sprint=sprint_numbers[y['sprint']], story=stories[0],
                     deps=sorted(id_by_key[l['inward']] for l in y['links'] if l['type'] == 'Blocks' and l.get('inward')),
                     start_slot=2 * (datetime.date.fromisoformat(y['start']) - base).days,
                     end_slot=2 * ((datetime.date.fromisoformat(y['due']) - base).days + 1))
    tasks = [x for x in data['issues'] if x['type'] == 'Task']
    data.update(version='3.0', synced_at=source['synced_at'], deadline=next(v['releaseDate'] for v in source['versions'] if v['name']=='v1.0'), buffer_date=None,
                source_snapshot='current-jira-snapshot.json', total_hours=sum(x['hours'] for x in tasks),
                sprint_metadata=source['sprints'], releases=source['versions'],
                sprints=[[2*(datetime.date.fromisoformat(s['startDate'][:10])-base).days,
                          2*((datetime.date.fromisoformat(s['endDate'][:10])-base).days+1)] for s in source['sprints']],
                schedule_notes={'date_precision': 'day; inclusive start and due; slots encode date boundaries only',
                                'task_sprint_policy': 'Actual Jira Sprint field denotes start. Sprint labels are synchronized to the actual Sprint field.',
                                'completion': '2026-11-04', 'buffer': None,
                                'hours_distribution': 'For reporting only, distribute task estimate uniformly over its calendar dates; not logged work.'})
    revision = data['allocation_revision']
    revision.update(date=source['synced_at'], method='jira_live_880', note='Đồng bộ trực tiếp Jira: 880 giờ, hạn 04/11; T37 thuộc Tình; Nhạn/Thư 120 giờ.',
                    targets={p: sum(x['hours'] for x in tasks if x['owner'] == p) for p in NAMES.values()})
    revision.pop('changes', None)
    revision['rationale']['Tình'] += ' Phân công hiện tại gồm T37 chat; tổng 156 giờ.' if 'T37 chat' not in revision['rationale']['Tình'] else ''
    revision['rationale']['Nhạn'] = 'Giữ FE và kiểm thử độc lập theo Jira; T11/T19/T21/T62 tăng tổng cộng 16 giờ cho các nhánh đã đặc tả, tổng 120 giờ.'
    revision['rationale']['Thư'] = 'T02 tăng từ 20 lên 32 giờ, bắt đầu 14/10; T71 tăng từ 4 lên 8 giờ. Chuẩn bị dữ liệu, kiểm thử, hồi quy và tổng duyệt: 120 giờ.'
    write('plan-data.json', data)
    write('descriptions.json', descriptions)
    print(f"Synced {len(live)} issues, {data['total_hours']} hours; no Jira writes")

if __name__ == '__main__':
    main()
