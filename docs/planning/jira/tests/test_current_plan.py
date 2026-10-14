"""Independent checks of the Jira snapshot and its generated export."""
import collections
import csv
import datetime
import importlib.util
import io
from pathlib import Path
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('build_plan', ROOT / 'tools' / 'build_plan.py')
plan = importlib.util.module_from_spec(spec)
spec.loader.exec_module(plan)


class CurrentPlanTests(unittest.TestCase):
    def test_plan_links_to_complete_descriptions_without_copying_them(self):
        schedule = plan.generate_plan(plan.validate())
        details = plan.generate_detail('')
        for key in plan.TASKS:
            self.assertIn(f'(jira/reports/JIRA-MUC-CHI-TIET.md#{key.lower()})', schedule)
            self.assertIn(f'<a id="{key.lower()}"></a>', details)
            self.assertIn(plan.description(key), details)
            self.assertNotIn(plan.description(key), schedule)


    def test_daily_capacity_includes_both_endpoints(self):
        days = collections.defaultdict(list)
        for task in plan.LIVE['issues']:
            if task['type'] != 'Task':
                continue
            day = datetime.date.fromisoformat(task['start'])
            end = datetime.date.fromisoformat(task['due'])
            while day <= end:
                days[day].append(task)
                day += datetime.timedelta(days=1)
        self.assertTrue(days)
        for day, tasks in days.items():
            self.assertLessEqual(len(tasks), 7, day)
            owners = [t['assignee']['id'] for t in tasks]
            self.assertEqual(len(owners), len(set(owners)), day)
        self.assertEqual(max(days), datetime.date(2026, 11, 4))

    def test_dependencies_finish_on_an_earlier_date(self):
        count = 0
        for task in plan.LIVE['issues']:
            if task['type'] == 'Task':
                for link in task['links']:
                    if link['type'] == 'Blocks' and link.get('inward'):
                        count += 1
                        self.assertLess(plan.LIVE_BY[link['inward']]['due'], task['start'], task['key'])
        self.assertEqual(count, 186)

    def test_ba_precedes_implementation_and_progress_is_separate(self):
        for task in plan.TASKS.values():
            story = plan.BY[task['story']]
            epic = plan.BY[task['parent']]
            self.assertLess(epic['start_date'], story['start_date'])
            self.assertLess(story['start_date'], task['start_date'])
            self.assertEqual(task['status'], 'To Do')
            self.assertIsNone(task['resolution'])
            for ba in (epic, story):
                self.assertEqual((ba['status'], ba['resolution']), ('Done', 'Done'))
                self.assertEqual(ba['fix_versions'], [])
        self.assertTrue(all(s['state'] == 'future' for s in plan.LIVE['sprints']))

    def test_estimates_and_points_are_independent_in_export(self):
        rows = list(csv.DictReader(io.StringIO(plan.generate_csv('').lstrip('\ufeff'))))
        tasks = {r['Summary'].split(' · ')[0]: r for r in rows if r['Issue Type'] == 'Task'}
        self.assertEqual(sum(int(r['Original Estimate']) for r in tasks.values()), 880 * 3600)
        self.assertEqual(sum(int(r['Remaining Estimate']) for r in tasks.values()), 880 * 3600)
        self.assertEqual(sum(int(r['Story Points']) for r in tasks.values()), 198)
        self.assertEqual(int(tasks['T02']['Original Estimate']), 32 * 3600)
        self.assertEqual(int(tasks['T02']['Story Points']), 5)
        self.assertEqual(tasks['T71']['Due date'], '04/11/2026')

    def test_parity_guard_rejects_status_and_estimate_drift(self):
        plan.validate_live_parity()
        for change in ({'hours': 999}, {'resolution': 'Done'}, {'status': 'Done'}):
            with self.subTest(change=change), patch.dict(plan.TASKS['T02'], change):
                with self.assertRaises(AssertionError):
                    plan.validate_live_parity()

    def test_sprint_report_uses_dates_and_detects_label_drift(self):
        task = {'hours': 12, 'start_slot': 12, 'end_slot': 16}
        self.assertEqual(plan.sprint_hours(task, 1), 6)
        self.assertEqual(plan.sprint_hours(task, 2), 6)
        self.assertEqual(plan.label_mismatches(), [])
        self.assertEqual(plan.TASKS['T03']['sprint'], 2)
        self.assertIn('sprint-2', plan.TASKS['T03']['labels'])
        with patch.dict(plan.TASKS['T03'], {'labels': ['sprint-1']}):
            self.assertEqual(len(plan.label_mismatches()), 1)


if __name__ == '__main__':
    unittest.main()
