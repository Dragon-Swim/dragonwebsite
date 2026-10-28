#!/usr/bin/env python
"""
parse_pvs_meet_pdf.py — 把 PVS 赛程单(PDF)抽成结构化 JSON:比赛信息 + 场次 + 逐条项目/达标线。

为什么需要:
  `add_meet.mjs` 只会写 name/startDate/endDate/location/season/sourceUrl 六个字段。
  要做「家长按项目自己报名 + 达标提醒」,必须先把赛程单里的**项目表**变成数据:
  哪个项目号、哪个年龄组、哪个性别、在第几场、SCY/LCM 各自的 No-Slower-Than 秒数。

做法(确定性,不用 LLM 读表):
  PyMuPDF 的 `page.find_tables()` 按表格线切格子 —— PVS 的单页表头是
  「Girls Event # | SCY | LCM | 项目名 | SCY | LCM | Boys Event #」7 列。
  **坑:合并单元格**。1650 自由泳的两个年龄组(13-14 / Open)共用一个项目号,
  第 2 行的号码格是空的 → 必须继承上一行的号,否则会把 Open 1650 漏掉。

自校验(不过就退出码 1,不产出文件):
  1. 每个项目号只属于一个性别;女子号 = 男子号 - 1(成对)
  2. 同一 (项目号, 年龄组) 不重复
  3. 秒数在合理区间(接力 20~1200s;1650 最长 ~1400s)
  4. 项目号连续性:出现过的号 + 未出现的号 = 1..max,并把缺口打出来(缺口应只有接力/未设项目)
  5. 与「Finals Order of Events」(第 11-12 页)交叉核对:决赛表里列出的每个
     个人项目号,都必须在预赛表里出现过

用法:
  python execution/meet-entry/parse_pvs_meet_pdf.py .tmp/meet-27-41/27-41-ma.pdf \
      -o .tmp/meet-27-41/events.json
"""
import argparse
import json
import re
import sys
from collections import Counter

import fitz

# Windows 控制台默认 cp1252,中文/标点会直接 UnicodeEncodeError。
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')


# ── 文本 → 秒 ────────────────────────────────────────────────────────────────
def parse_time(text):
    """'1:12.49' → 72.49 | '55.99' → 55.99 | '--'/'' → None"""
    if not text:
        return None
    t = text.strip()
    if t in ('--', '-', ''):
        return None
    m = re.fullmatch(r'(?:(\d+):)?(\d{1,2}(?:\.\d{1,2})?)', t)
    if not m:
        raise ValueError(f'无法解析的时间: {text!r}')
    mins = int(m.group(1) or 0)
    secs = float(m.group(2))
    return round(mins * 60 + secs, 2)


# ── 项目名 → 结构化 ──────────────────────────────────────────────────────────
STROKES = {
    'free': 'FR',
    'back': 'BK',
    'breast': 'BR',
    'fly': 'FL',
    'im': 'IM',
    'medley relay': 'MED',
}
STROKE_LABEL = {v: k for k, v in STROKES.items() if k != 'medley relay'}
STROKE_LABEL['MED'] = 'medley relay'

AGE_GROUP_RE = re.compile(
    r'^(10\s*&\s*under|10&U|11-12|12&U|12\s*&\s*under|13-14|13\s*&\s*over|Open)\b',
    re.IGNORECASE,
)
NAME_RE = re.compile(
    r'^(?P<age>10\s*&\s*under|10&U|11-12|12&U|12\s*&\s*under|13-14|13\s*&\s*over|Open)\s+'
    r'(?P<distance>\d{2,4})\s+(?P<stroke>Free|Back|Breast|Fly|IM|Medley)\s*(?P<relay>Relay)?$',
    re.IGNORECASE,
)


def normalize_age(age):
    a = age.replace(' ', '').upper()
    if a in ('10&UNDER', '10&U'):
        return '10&U'
    if a in ('12&UNDER', '12&U'):
        return '12&U'
    if a == '13&OVER':
        return 'Open'
    return age


def parse_event_name(raw):
    """'*13-14 1650 Free' → dict;'^13-14 800 Free Relay' → relay=True"""
    name = raw.strip().lstrip('*^#').strip()
    name = re.sub(r'\s+', ' ', name)
    m = NAME_RE.match(name)
    if not m:
        raise ValueError(f'无法解析的项目名: {raw!r}')
    stroke_word = m.group('stroke').lower()
    relay = bool(m.group('relay'))
    if stroke_word == 'medley':
        if not relay:
            raise ValueError(f'Medley 只应出现在接力里: {raw!r}')
        stroke = 'MED'
    else:
        stroke = STROKES[stroke_word]
    return {
        'ageGroup': normalize_age(m.group('age')),
        'distance': int(m.group('distance')),
        'stroke': stroke,
        'relay': relay,
        'label': name,
    }


# ── 场次:按页码 / 表格顺序人工对应(PVS 单版式固定) ────────────────────────
# (page_index, table_index) → session_id
SESSION_OF_TABLE = {
    (7, 0): 'thu-pm',
    (7, 1): 'fri-am',
    (8, 0): 'fri-pm',
    (8, 1): 'sat-am',
    (9, 0): 'sat-pm',
    (9, 1): 'sun-am',
    (10, 0): 'sun-pm',
}

SESSIONS = [
    {'id': 'thu-pm', 'date': '2026-12-10', 'day': 'Thu', 'kind': 'distance+relays',
     'warmup': '4:30–5:15 PM', 'start': '5:20 PM',
     'audience': 'All ages (1650 / 500 free / 800 free relays)'},
    {'id': 'fri-am', 'date': '2026-12-11', 'day': 'Fri', 'kind': 'prelim',
     'warmup': '6:30–8:00 AM', 'start': '8:05 AM', 'audience': '13-14 / Open'},
    {'id': 'fri-pm', 'date': '2026-12-11', 'day': 'Fri', 'kind': 'prelim',
     'warmup': '12:30–1:30 PM', 'start': '1:35 PM', 'audience': '11-12 / 10&U'},
    {'id': 'fri-finals', 'date': '2026-12-11', 'day': 'Fri', 'kind': 'finals',
     'warmup': '13&O 4:15–5:00 / 12&U 5:00–5:25 PM', 'start': '5:30 PM',
     'audience': 'Qualifiers only (A + B finals)'},
    {'id': 'sat-am', 'date': '2026-12-12', 'day': 'Sat', 'kind': 'prelim',
     'warmup': '6:30–8:00 AM', 'start': '8:05 AM', 'audience': '13-14 / Open'},
    {'id': 'sat-pm', 'date': '2026-12-12', 'day': 'Sat', 'kind': 'prelim',
     'warmup': '12:30–1:30 PM', 'start': '1:35 PM', 'audience': '11-12 / 10&U'},
    {'id': 'sat-finals', 'date': '2026-12-12', 'day': 'Sat', 'kind': 'finals',
     'warmup': '13&O 4:15–5:00 / 12&U 5:00–5:25 PM', 'start': '5:30 PM',
     'audience': 'Qualifiers only (A + B finals)'},
    {'id': 'sun-am', 'date': '2026-12-13', 'day': 'Sun', 'kind': 'prelim',
     'warmup': '6:30–8:00 AM', 'start': '8:05 AM', 'audience': '13-14 / Open'},
    {'id': 'sun-pm', 'date': '2026-12-13', 'day': 'Sun', 'kind': 'prelim',
     'warmup': '12:30–1:30 PM', 'start': '1:35 PM', 'audience': '11-12 / 10&U'},
    {'id': 'sun-finals', 'date': '2026-12-13', 'day': 'Sun', 'kind': 'finals',
     'warmup': '13&O 4:15–5:00 / 12&U 5:00–5:25 PM', 'start': '5:30 PM',
     'audience': 'Qualifiers only'},
]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('pdf')
    ap.add_argument('-o', '--out', required=True)
    args = ap.parse_args()

    doc = fitz.open(args.pdf)
    events = []
    errors = []

    for (page_idx, table_idx), session_id in SESSION_OF_TABLE.items():
        page = doc[page_idx]
        tables = page.find_tables().tables
        if table_idx >= len(tables):
            errors.append(f'第 {page_idx + 1} 页只有 {len(tables)} 个表,缺第 {table_idx} 个')
            continue
        rows = tables[table_idx].extract()
        header = [str(c or '').strip() for c in rows[0]]
        if 'Girls' not in ' '.join(header) or 'Boys' not in ' '.join(header):
            errors.append(f'第 {page_idx + 1} 页第 {table_idx} 个表表头不像项目表: {header}')
            continue

        girls_no, boys_no = None, None   # 合并单元格 → 继承上一行
        for row in rows[1:]:
            cells = [str(c or '').strip() for c in row]
            if len(cells) != 7:
                errors.append(f'第 {page_idx + 1} 页表 {table_idx}: 列数 {len(cells)} ≠ 7: {cells}')
                continue
            g_no, g_scy, g_lcm, name, b_scy, b_lcm, b_no = cells
            if g_no:
                girls_no = int(g_no)
            if b_no:
                boys_no = int(b_no)
            if not name:
                errors.append(f'项目名为空: {cells}')
                continue

            info = parse_event_name(name)
            for gender, ev_no, scy, lcm in (
                ('F', girls_no, g_scy, g_lcm),
                ('M', boys_no, b_scy, b_lcm),
            ):
                if ev_no is None:
                    errors.append(f'{info["label"]} 缺 {gender} 项目号')
                    continue
                try:
                    st_scy = parse_time(scy)
                    st_lcm = parse_time(lcm)
                except ValueError as e:
                    errors.append(f'项目 {ev_no} ({info["label"]}): {e}')
                    continue
                if info['relay'] and st_lcm is not None:
                    errors.append(f'接力项目 {ev_no} 不该有 LCM 达标线: {lcm!r}')
                events.append({
                    'eventNo': ev_no,
                    'gender': gender,
                    'ageGroup': info['ageGroup'],
                    'distance': info['distance'],
                    'stroke': info['stroke'],
                    'relay': info['relay'],
                    'sessionId': session_id,
                    'standards': {'SCY': st_scy, 'LCM': st_lcm},
                })

    # ── 自校验 ──────────────────────────────────────────────────────────────
    checks = []

    # 1. 项目号 → 单一性别;女子号 = 男子号 - 1
    by_no = {}
    for e in events:
        by_no.setdefault(e['eventNo'], set()).add(e['gender'])
    mixed = [no for no, gs in by_no.items() if len(gs) > 1]
    checks.append((f'每个项目号只属于一个性别', not mixed, mixed))

    odd = sorted(no for no, gs in by_no.items() if 'F' in gs)
    even = sorted(no for no, gs in by_no.items() if 'M' in gs)
    unpaired = [no for no in odd if no + 1 not in by_no]
    checks.append((f'女子项目号 {len(odd)} 个全部有对应的男子号(+1)', not unpaired, unpaired))

    # 2. (号, 年龄组, 性别) 唯一
    dup = [k for k, n in Counter(
        (e['eventNo'], e['ageGroup'], e['gender']) for e in events).items() if n > 1]
    checks.append(('同一 (项目号, 年龄组, 性别) 不重复', not dup, dup))

    # 3. 秒数合理
    bad = []
    for e in events:
        for course, sec in e['standards'].items():
            if sec is None:
                continue
            lo, hi = (60, 1500) if e['distance'] >= 1000 else (15, 900)
            if not (lo <= sec <= hi):
                bad.append(f'{e["eventNo"]} {e["ageGroup"]} {course}={sec}')
    checks.append(('所有达标线秒数在合理区间', not bad, bad))

    # 4. 号码连续性(只报缺口,不算失败)
    max_no = max(by_no) if by_no else 0
    gaps = [n for n in range(1, max_no + 1) if n not in by_no]
    checks.append((f'项目号 1..{max_no} 共 {max_no} 个,其中 {len(gaps)} 个未在项目表出现', True, gaps))

    # 5. 决赛表交叉核对(第 11-12 页)
    finals_page = doc[10]
    finals_nums = set()
    for t in finals_page.find_tables().tables:
        for row in t.extract():
            cells = [str(c or '').strip() for c in row]
            nums = [c for c in cells if re.fullmatch(r'\d{1,3}', c)]
            if len(nums) == 2:
                finals_nums.update(int(n) for n in nums)
    # 第 12 页是同一张表的后半(周六/周日),单独再取一次
    for t in doc[11].find_tables().tables:
        for row in t.extract():
            cells = [str(c or '').strip() for c in row]
            nums = [c for c in cells if re.fullmatch(r'\d{1,3}', c)]
            if len(nums) == 2:
                finals_nums.update(int(n) for n in nums)
    # 不计入决赛的:1000/1650(计时决赛)、12&U 500(计时决赛)、全部接力
    timed_final = {1, 2, 3, 4, 103, 104}
    relay_nos = {e['eventNo'] for e in events if e['relay']}
    expect_in_finals = {e['eventNo'] for e in events if not e['relay']} - timed_final
    missing = sorted(n for n in expect_in_finals if n not in finals_nums)
    checks.append((
        f'个人项目在决赛表里都能找到({len(expect_in_finals)} 个应出现,决赛表 {len(finals_nums)} 个)',
        not missing, missing))

    print(f'\n解析: {len(events)} 条 (项目号, 年龄组, 性别) 记录;'
          f' 项目号 {len(by_no)} 个; 预赛场次 {len(SESSION_OF_TABLE)} 个')
    individual = [e for e in events if not e['relay']]
    print(f'  个人项目条目 {len(individual)}、接力 {len(events) - len(individual)}')
    print(f'  年龄组分布: {dict(sorted(Counter(e["ageGroup"] for e in events).items()))}')
    print('')

    ok = True
    for label, passed, detail in checks:
        print(f'  {"✓" if passed else "✗"} {label}' + (f'  → {detail}' if detail else ''))
        ok = ok and passed
    if errors:
        print('\n错误:')
        for e in errors:
            print('  -', e)
        ok = False

    if not ok:
        print('\n✗ 自校验未通过,未写文件。')
        sys.exit(1)

    meet = {
        'name': 'Riley Eaton Holiday Invitational',
        'startDate': '2026-12-10',
        'endDate': '2026-12-13',
        'location': 'Germantown Indoor Swim Center, 18000 Central Park Circle, Boyds, MD 20841',
        'season': '2026-2027',
        'sourceUrl': 'https://www.files.pvswim.org/2627meet/27-41-ma.pdf',
        'sanction': 'PVI-27-41',
        'host': 'Rockville Montgomery Swim Club',
        'entryDeadline': '2026-12-01T20:00:00-05:00',
        'entryFeePerEvent': 11,
        'maxIndividualEvents': 6,
        'maxIndividualEventsPerDay': 3,
        'qualifyingPeriodStart': '2024-10-01',
        'noTimeEntries': False,
        'courses': ['SCY', 'LCM'],
        'relayLimitPerClub': 3,
        'bonusRule': '1-2 qualifying times → 2 bonus events; 3-4-5 → 1 bonus; 6 → none',
        'ageGroups': ['10&U', '11-12', '12&U', '13-14', 'Open'],
        'ageDeterminedOn': '2026-12-10',
        'sessions': SESSIONS,
        'events': sorted(events, key=lambda e: (e['eventNo'], e['ageGroup'], e['gender'])),
    }
    with open(args.out, 'w', encoding='utf-8') as f:
        json.dump(meet, f, ensure_ascii=False, indent=2)
    print(f'\n写出: {args.out}')


if __name__ == '__main__':
    main()
