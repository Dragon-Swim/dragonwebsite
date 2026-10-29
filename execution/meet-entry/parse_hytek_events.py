#!/usr/bin/env python3
"""parse_hytek_events.py — Hy-Tek 赛事项目包(.ev3) → add_meet.mjs 可直接吃的 JSON。

为什么需要这个脚本
------------------
赛程数据以前是靠 `parse_pvs_meet_pdf.py` 从赛程单 PDF 里"看表格"抽出来的:
版式一变就崩,合并单元格还要特判(27-41 的 1650/1000 共用项目号)。
主办方其实同时提供一个机器可读的 `.ev3`(Meet Manager → Team Manager 的赛事项目包),
它是同一份赛程的**权威数据**:27-41 实测 152 行里 118 行与我们 PDF 解析逐字一致,
剩下 2 行是 PDF 的合并单元格错位(12&U 500 自的 LCM 线)。所以赛程改用 .ev3 导入。

线上样本里还有一处真实差异,说明必须用机器文件而不是 PDF:
    27-41 #33 12&U 女 500FR   PDF LCM=5:25.99   .ev3 LCM=5:29.99
    27-41 #44 12&U 男 500FR   PDF LCM=5:23.99   .ev3 LCM=5:27.99

与 PDF 解析的分工(关键,别指望单个文件齐全)
------------------------------------------
`.ev3` 给:      项目号 / 性别 / 距离 / 泳姿 / 年龄区间 / SCY+LCM 达标线 / 场次序号 /
                场次开始时间 / 报名费 / 最多项数 / 截止日 / 达标期起点 / 主办方 / 场地 / LSC / course
`.ev3` 不给:    场次的**日期**与类型(预赛/决赛)、热身时间、观众年龄说明、
                bonus 规则、接力每队限报数、是否收 NT —— 这些只写在赛程单正文里。

所以场次信息可以 `--sessions-from <events.json>` 从同一场的 PDF 解析结果借过来
(按**场次序号**对齐,不是按 id 字符串)。借不到时会话只有编号 + 开始时间,
`date` 留空并标记 `sessionsIncomplete: true` 且打印警告 —— 这时 maxPerDay 校验不可靠,
不要直接开给家长用。

格式要点(实测 27-41 / 27-29 / 27-21 三份,共 152 + 89 + 118 行)
----------------------------------------------------------------
文件是分号分隔、变长字段的纯文本,每行以 `*>` 结尾。第 1 行是比赛头,之后每行一个项目。

头部(0 基): 0 名称 | 1 场地 | 2 起始 | 3 结束 | 4 **定龄日** | 5 course | 10 主办方 |
             11 Hy-Tek 版本 | 13 每天最多项数 | 14 sanction | 16 达标期起点 | 18 每项报名费 |
             19 最多项数 | 23 报名截止 | 24-28 地址 | 30 LSC
项目行:      0 序号 | 1 项目号(可带年龄组后缀 1A/1B/1C/1D) | 4 I=个人 R=接力 |
             5 性别(W/M 或 G/B) | 6 年龄下限 | 7 年龄上限 | 8 距离 | 9 泳姿字母 |
             16 LCM 达标线 | 20 SCY 达标线 | 21 场次号 | 22 场内项目序号 | 24 场次开始时间

两个必须记住的坑:
  1. **年龄按"比赛第一天"算** —— `.ev3` 的 field[4] 就是那天,四场比赛实测都等于起始日;
     不要写死"首日",读这个字段。
  2. **接力只有 SCY 线**(36 行 f16 为空)。而 27-21 / 27-29 这类邀请赛**整场没有达标线**,
     两种都属于正常,不能当成缺失报错。

用法
----
    # 最省事:直接从官网下的 zip 读
    python execution/meet-entry/parse_hytek_events.py .tmp/meet-entry/samples/events/27-41-events.zip \
        -o .tmp/meet-entry/imports/27-41.json \
        --source-url "https://www.files.pvswim.org/2627meet/27-41-events.zip"

    # 同一场已经有 PDF 解析结果时,借它的场次日期/类型
    python execution/meet-entry/parse_hytek_events.py <zip|ev3> -o out.json \
        --sessions-from .tmp/meet-27-41/events.json --deadline "2026-12-01T20:00:00-05:00"

    # 只打印不写文件
    python execution/meet-entry/parse_hytek_events.py <ev3> --json
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import zipfile
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

# ── 码表(来自实测样本) ───────────────────────────────────────────────────────
STROKE_OF = {"A": "FR", "B": "BK", "C": "BR", "D": "FL", "E": "IM"}
# 接力里 E = 混合泳接力(个人项目里 E = IM)
RELAY_STROKE_OF = {"A": "FR", "E": "MED"}
# 性别码在各场文件里写法不统一,三种都出现过:
#   W/M  27-41、27-29 的大项
#   G/B  27-21(男童/女童)
#   F    27-29、27-21 的部分行
#   X    混合项目(mixed),男女都能报 —— 27-29 有 32 行是这种
SEX_OF = {"W": "F", "M": "M", "G": "F", "B": "M", "F": "F", "X": "X"}
COURSE_OF = {"Y": "SCY", "L": "LCM", "S": "SCM"}

HEAD_NAME, HEAD_VENUE = 0, 1
HEAD_START, HEAD_END, HEAD_AGE_DATE, HEAD_COURSES = 2, 3, 4, 5
HEAD_HOST, HEAD_MAX_PER_DAY = 10, 13
HEAD_SANCTION, HEAD_QUAL_START = 14, 16
HEAD_FEE, HEAD_MAX_EVENTS, HEAD_DEADLINE = 18, 19, 23
HEAD_ADDR1, HEAD_CITY, HEAD_STATE, HEAD_ZIP, HEAD_LSC = 24, 26, 27, 28, 30

ROW_CODE, ROW_KIND, ROW_SEX = 1, 4, 5
ROW_AGE_MIN, ROW_AGE_MAX, ROW_DIST, ROW_STROKE = 6, 7, 8, 9
ROW_LCM, ROW_SCY = 16, 20
ROW_SESSION, ROW_ORDER, ROW_START = 21, 22, 24


def parse_time(text: str) -> float | None:
    """'1:12.49' → 72.49 | '59.99' → 59.99 | ''/'--' → None"""
    if not text:
        return None
    t = text.strip()
    if t in ("--", "-", ""):
        return None
    m = re.fullmatch(r"(?:(\d+):)?(\d{1,2}(?:\.\d{1,2})?)", t)
    if not m:
        raise ValueError(f"无法解析的时间: {text!r}")
    return round(int(m.group(1) or 0) * 60 + float(m.group(2)), 2)


def iso_date(mm_dd_yyyy: str) -> str | None:
    """'12/10/2026' → '2026-12-10';兼容已经 ISO 的输入。"""
    s = (mm_dd_yyyy or "").strip()
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}", s):
        return s
    m = re.fullmatch(r"(\d{1,2})/(\d{1,2})/(\d{4})", s)
    if not m:
        return None
    mm, dd, yy = int(m.group(1)), int(m.group(2)), int(m.group(3))
    return f"{yy:04d}-{mm:02d}-{dd:02d}"


def season_of(start_iso: str) -> str:
    """USA Swimming 赛季:9 月起到次年 8 月。2026-12-10 → '2026-2027'。"""
    y, m = int(start_iso[:4]), int(start_iso[5:7])
    return f"{y}-{y + 1}" if m >= 9 else f"{y - 1}-{y}"


def age_label(age_min: int, age_max: int) -> str:
    """(min, max) → 显示用标签。只影响显示与旧逻辑兜底,判断一律用数值区间。

    刻意与 27-41 现有数据保持一致的几个: (0,10)→10&U、(0,12)→12&U、
    (11,12)→11-12、(13,14)→13-14、(0,109)/(15,109)→Open。
    """
    if age_max >= 100:
        return "Open" if age_min in (0, 15) else f"{age_min}&O"
    if age_min == 0:
        return f"{age_max}&U"
    return f"{age_min}-{age_max}"


def load_rows(path: Path) -> tuple[list[str], list[list[str]], str]:
    """读 .ev3 / .hyv / 含它们的 .zip → (头部字段, 项目行, 实际文件名)。"""
    source = path
    tmp = None
    if path.suffix.lower() == ".zip":
        with zipfile.ZipFile(path) as z:
            names = z.namelist()
            pick = next((n for n in names if n.lower().endswith(".ev3")), None)
            if pick is None:
                hilite = [n for n in names if n.lower().endswith(".hyv")]
                raise SystemExit(
                    f"✗ {path.name} 里没有 .ev3"
                    + (f"(只有 .hyv:{hilite[0]})。`.hyv` 是给 Team Manager 4.0G 及更早的旧格式,"
                       "字段布局不同;请向主办方要 .ev3,或直接用同目录的 .ev3。" if hilite else "")
                )
            label = f"{path.name} → {pick}"
            text = z.read(pick).decode("latin-1")
        source = Path(label)
    else:
        text = path.read_text(encoding="latin-1")
        if path.suffix.lower() == ".hyv":
            raise SystemExit("✗ 这是 `.hyv`(旧格式)。请改用同目录的 `.ev3`。")

    lines = [ln for ln in text.splitlines() if ln.strip()]
    if not lines:
        raise SystemExit(f"✗ {path} 是空的")

    def cells(line: str) -> list[str]:
        return line.rstrip().removesuffix("*>").rstrip("*>").split(";")

    head = cells(lines[0])
    rows = [cells(ln) for ln in lines[1:] if re.fullmatch(r"\d+", cells(ln)[0] or "")]
    return head, rows, str(source)


def build_events(rows, open_min_age, warn):
    events, seen = [], {}
    for r in rows:
        if len(r) < 25:
            warn.append(f"项目行列数不足({len(r)}):{';'.join(r)[:80]}")
            continue
        code = r[ROW_CODE].strip()
        m = re.fullmatch(r"(\d+)([A-Za-z]*)", code)
        if not m:
            warn.append(f"项目号无法解析:{code!r}")
            continue
        event_no = int(m.group(1))
        try:
            age_min, age_max = int(r[ROW_AGE_MIN]), int(r[ROW_AGE_MAX])
            distance = int(r[ROW_DIST])
        except ValueError:
            warn.append(f"{code}: 年龄/距离不是数字")
            continue
        if age_min > age_max:
            warn.append(f"{code}: 年龄下限 {age_min} > 上限 {age_max}")
        relay = r[ROW_KIND].strip().upper() == "R"
        sex_raw = r[ROW_SEX].strip().upper()
        gender = SEX_OF.get(sex_raw)
        if gender is None:
            warn.append(f"{code}: 未知性别码 {sex_raw!r}")
            continue
        stroke_raw = r[ROW_STROKE].strip().upper()
        table = RELAY_STROKE_OF if relay else STROKE_OF
        stroke = table.get(stroke_raw)
        if stroke is None:
            warn.append(f"{code}: 未知泳姿字母 {stroke_raw!r}(relay={relay})")
            continue
        try:
            scy = parse_time(r[ROW_SCY])
            lcm = parse_time(r[ROW_LCM])
        except ValueError as e:
            warn.append(f"{code}: {e}")
            continue
        if relay and lcm is not None:
            warn.append(f"{code}: 接力不该有 LCM 达标线(实测为空),这里读到 {lcm}")
        if not relay and scy is None and lcm is not None:
            warn.append(f"{code}: 只有 LCM 线没有 SCY 线,检查列位是否错位")

        label = age_label(age_min, age_max)
        key = (event_no, label, gender)
        if key in seen:
            warn.append(f"重复项目行:{event_no} {label} {gender}")
            continue
        seen[key] = True
        events.append({
            "eventNo": event_no,
            "gender": gender,
            "ageGroup": label,
            # ↓ 新增:判断一律用数值区间,标签只做显示(见 src/utils/meetEligibility.js)
            "ageMin": age_min,
            "ageMax": age_max,
            # 赛程单原文"open events which are open to all ages" —— 但这事**不能只看数字**:
            # PVS 的 Open 组在 .ev3 里编码成 15-109(颁奖按 15+ 算),而报名对任何年龄开放;
            # Loughmiller 的 13-109 则真是"13 岁及以上",不是开放组。
            # 所以判据是「下限为 0 或 open_min_age(默认 15)」+ 上限 >=100,与 age_label 一致;
            # 主办方口径不同时用 --open-min-age 覆盖。
            "openToAll": age_max >= 100 and age_min in (0, open_min_age),
            "distance": distance,
            "stroke": stroke,
            "relay": relay,
            "sessionId": f"s{int(r[ROW_SESSION])}" if r[ROW_SESSION].strip().isdigit() else "",
            "standards": {"SCY": scy, "LCM": lcm},
            # 项目码（"1A" / "2F" / "51B"）：SDIF 的 D0 27/4 "Event Number" 存的就是这个，
            # 不是纯数字 —— 同一个号码下不同年龄组靠后缀区分。不带它，写出来的
            # .cl2 会让 Meet Manager 找不到项目。
            "eventCode": code,
            # 原始编码，便于回查(不进 Firestore:strip_private 会去掉 _ 开头的键)
            "_code": code,
            "_order": int(r[ROW_ORDER]) if r[ROW_ORDER].strip().isdigit() else None,
            "_start": r[ROW_START].strip(),
        })
    events.sort(key=lambda e: (e["eventNo"], e["ageGroup"], e["gender"]))
    return events


def build_sessions(rows, borrowed, warn):
    """场次:序号 → {id, date, day, kind, warmup, start, audience}

    ⚠ 关键:`.ev3` 的 `field[21]` 是**场次在整个赛程里的序号**,不是"第几个预赛场次"。
    27-41 实测只出现 1,2,3,5,6,8,9 —— 缺的 4/7/10 正是**决赛场次**(没人"报名"决赛,
    所以项目行不引用它们)。因此绝不能按出现顺序重新编号,否则场次会整体串位。

    于是:`borrowed`(同场 PDF 解析出的 10 条 sessions)优先**整表采用**,
    `.ev3` 的序号只用来建立 idx → id 的映射;没有 borrowed 时才按 1..max 合成。
    """
    idx_to_start = {}
    for r in rows:
        if len(r) <= ROW_SESSION:
            continue
        s, t = r[ROW_SESSION].strip(), r[ROW_START].strip()
        if s.isdigit():
            idx_to_start.setdefault(int(s), t)
    if not idx_to_start:
        warn.append("项目行里没有场次号,无法建立场次表")
        return [], {}, True

    borrowed = borrowed or []
    max_idx = max(idx_to_start)

    if borrowed:
        # 整表采用 PDF 的场次表(含决赛);只校验 .ev3 的序号没越界
        over = sorted(i for i in idx_to_start if i > len(borrowed))
        if over:
            warn.append(
                f".ev3 场次号 {over} 超出借来的场次表({len(borrowed)} 条)—— 请人工核对"
            )
        sessions = []
        id_by_idx = {}
        for i, s in enumerate(borrowed, start=1):
            s = dict(s)
            s["idx"] = i
            if not s.get("start"):
                s["start"] = idx_to_start.get(i, "")
            sessions.append(s)
            id_by_idx[i] = s["id"]
            if i not in idx_to_start:
                s["_noEntries"] = True   # 决赛场这类:没有任何报名项目
        return sessions, id_by_idx, False

    sessions, id_by_idx = [], {}
    for i in range(1, max_idx + 1):
        start = idx_to_start.get(i, "")
        sid = f"s{i}"
        sessions.append({"id": sid, "date": "", "day": "", "kind": "",
                         "warmup": "", "start": start, "audience": "", "idx": i})
        id_by_idx[i] = sid
    warn.append(
        "场次日期未知(date 为空):`.ev3` 不含场次日历。"
        "用 --sessions-from <该场 PDF 解析出的 events.json> 补齐,"
        "否则 maxPerDay 校验不可靠,不要直接开给家长"
    )
    return sessions, id_by_idx, True


def strip_private(obj):
    """去掉以 `_` 开头的诊断字段。

    `add_meet.mjs` 会把 `events[]` / `sessions[]` **原样**写进 Firestore,
    所以 `_code` / `_order` / `_noEntries` 这类只在解析时用的东西不能留在产物里
    (152 行各多 3 个字段就是白占体积,还会让人以为它们是数据的一部分)。
    """
    if isinstance(obj, dict):
        return {k: strip_private(v) for k, v in obj.items() if not k.startswith("_")}
    if isinstance(obj, list):
        return [strip_private(v) for v in obj]
    return obj


def main() -> int:
    ap = argparse.ArgumentParser(description="Hy-Tek .ev3 赛事项目包 → add_meet.mjs 用的 JSON")
    ap.add_argument("events", help=".ev3 / .hyv / 含 .ev3 的 .zip")
    ap.add_argument("-o", "--out", help="输出 JSON(默认 <输入>.events.json)")
    ap.add_argument("--sessions-from", help="同场 PDF 解析结果 events.json,借它的场次日期/类型")
    ap.add_argument("--deadline", help='报名截止,如 "2026-12-01T20:00:00-05:00";缺省用 .ev3 的日期')
    ap.add_argument("--location", help="地点(覆盖 .ev3 的场地+地址拼接)")
    ap.add_argument("--sanction", help="sanction 号(覆盖 .ev3 field[14])")
    ap.add_argument("--host", help="主办方全名(覆盖 .ev3 的缩写,如 RMSC - MCRD)")
    ap.add_argument("--source-url", help="这份赛事文件的来源 URL")
    ap.add_argument("--max-events", type=int, help="覆盖最多个人项数")
    ap.add_argument("--max-per-day", type=int, help="覆盖每天最多项数")
    ap.add_argument("--bonus-rule", help="bonus 规则文字(只在赛程单正文里有)")
    ap.add_argument("--relay-limit", type=int, help="每队每项接力最多几队")
    ap.add_argument("--open-min-age", type=int, default=15,
                    help="年龄上限>=100 且下限<=此值的组视为 open-to-all(默认 15)")
    ap.add_argument("--json", action="store_true", help="只把 JSON 打到 stdout,不写文件")
    args = ap.parse_args()

    src = Path(args.events)
    if not src.exists():
        print(f"✗ 找不到文件:{src}", file=sys.stderr)
        return 2

    head, rows, source_label = load_rows(src)
    if not rows:
        print(f"✗ {src} 里没有项目行", file=sys.stderr)
        return 1

    warn: list[str] = []
    events = build_events(rows, args.open_min_age, warn)

    # ── 头部 ────────────────────────────────────────────────────────────────
    name = head[HEAD_NAME].strip()
    start = iso_date(head[HEAD_START])
    end = iso_date(head[HEAD_END]) or start
    age_on = iso_date(head[HEAD_AGE_DATE]) or start
    if not start:
        print(f"✗ 无法解析比赛日期:{head[HEAD_START]!r}", file=sys.stderr)
        return 1
    if age_on != start:
        warn.append(f"定龄日 {age_on} 不等于首日 {start} —— 本场按定龄日算年龄")

    # `.ev3` 里的名字常带年份前缀("2026 Riley Eaton Holiday Invitational"),
    # 而站点里已经存在的是不带年份的名字。不剥掉的话 add_meet.mjs 的
    # (name, season) 去重会认不出来,变成重复新增一个 meet 文档。
    year_prefixed = re.fullmatch(r"\s*(\d{4})\s+(.+)", name)
    if year_prefixed and year_prefixed.group(1) == start[:4]:
        stripped = year_prefixed.group(2).strip()
        warn.append(f'比赛名去掉年份前缀:"{name}" → "{stripped}"(避免与既有文档重复)')
        name = stripped

    courses = [COURSE_OF[c] for c in head[HEAD_COURSES].upper() if c in COURSE_OF]
    unknown_courses = [c for c in head[HEAD_COURSES].upper() if c not in COURSE_OF]
    # 只保留引擎真正能用的 SCY/LCM(项目行里也只带这两条达标线)。
    # 主办方 header 里可能还有 SCM(27-41 的 "YLS"),原码留在 _importSource.courseCode 里备查。
    dropped = [c for c in courses if c not in ("SCY", "LCM")]
    if dropped:
        courses = [c for c in courses if c in ("SCY", "LCM")]
        warn.append(f"course 里的 {dropped} 已略过(项目行没有对应达标线),原码见 _importSource.courseCode")
    if unknown_courses:
        warn.append(
            f"course 码 {''.join(unknown_courses)} 未识别,已忽略(course 全是 {head[HEAD_COURSES]!r});"
            " SCY/LCM 判断不受影响,但若该场有这类项目需人工确认"
        )

    venue = head[HEAD_VENUE].strip()
    addr = ", ".join(x for x in (head[HEAD_ADDR1].strip(), head[HEAD_CITY].strip()) if x)
    tail = " ".join(x for x in (head[HEAD_STATE].strip(), head[HEAD_ZIP].strip()) if x)
    location = args.location or ", ".join(x for x in (venue, addr, tail) if x)
    # 主办方文件没填完时会出现占位符(27-29 就是 "add your facility" / "your city" / "11111")
    if not args.location and re.search(r"(add your facility|your city|your state|\b11111\b)", location, re.I):
        warn.append(f"场地字段是主办方的占位符({location!r}) —— 用 --location 传真实地点")

    ev3_deadline = iso_date(head[HEAD_DEADLINE])
    deadline = args.deadline or ev3_deadline
    if deadline and len(deadline) == 10:
        warn.append(
            f"截止日只有日期({deadline}),`.ev3` 不含具体时刻 —— 请照赛程单正文用 --deadline "
            "补成 ISO(例如 2026-12-01T20:00:00-05:00),否则会被当成当天 00:00"
        )

    # 01/01/1970 是 Hy-Tek 表示"本场没有达标期"的哨兵值(27-21 就是),
    # 直接透传会变成"1970 年之后的成绩都算在窗口内" —— 语义上等价于不限,
    # 但留个 null 更诚实,也让 buildBestTimesIndex 走它自己的无窗口分支。
    qual_start = iso_date(head[HEAD_QUAL_START])
    if qual_start and qual_start <= "1970-01-01":
        qual_start = None
        warn.append("达标期起点是 1970-01-01(Hy-Tek 的「无达标期」哨兵)→ 记为 null,不限成绩时间")

    borrowed = None
    if args.sessions_from:
        try:
            borrowed = json.loads(Path(args.sessions_from).read_text(encoding="utf-8")).get("sessions")
        except Exception as e:  # noqa: BLE001
            print(f"✗ 读不到 --sessions-from:{e}", file=sys.stderr)
            return 1

    sessions, id_by_idx, incomplete = build_sessions(rows, borrowed, warn)
    missing_sid = []
    for e in events:
        token = e["sessionId"] or ""
        idx = int(token[1:]) if re.fullmatch(r"s\d+", token) else None
        if idx is None or idx not in id_by_idx:
            missing_sid.append(e["_code"])
            continue
        e["sessionId"] = id_by_idx[idx]
    if missing_sid:
        warn.append(f"{len(set(missing_sid))} 个项目行对不上场次号:{sorted(set(missing_sid))[:8]}")

    # ── 自校验 ──────────────────────────────────────────────────────────────
    checks = []
    no_standards = [e for e in events if e["standards"]["SCY"] is None and e["standards"]["LCM"] is None]
    with_standards = len(events) - len(no_standards)
    checks.append((f"达标线:{with_standards} 行有 / {len(no_standards)} 行无(邀请赛整场没有是正常的)",
                   True, []))
    bad_secs = []
    for e in events:
        for course in ("SCY", "LCM"):
            sec = e["standards"][course]
            if sec is None:
                continue
            lo, hi = (60, 1600) if e["distance"] >= 1000 else (12, 900)
            if not (lo <= sec <= hi):
                bad_secs.append(f'{e["_code"]} {e["ageGroup"]} {course}={sec}')
    checks.append(("达标线秒数在合理区间", not bad_secs, bad_secs))

    dup = [f'{e["_code"]}' for e in events]  # build_events 已去重,统计即可
    checks.append((f"(项目号,年龄组,性别) 唯一 → {len(events)} 行", True, []))

    sexes = sorted({e["gender"] for e in events})
    checks.append((f"性别码全部可识别:{','.join(sexes)}", True, []))
    labels = sorted({e["ageGroup"] for e in events})
    checks.append((f"年龄组标签:{' / '.join(labels)}", True, []))
    open_rows = [e for e in events if e["openToAll"]]
    checks.append((f"open-to-all 项目行:{len(open_rows)}(可 --open-min-age 调整)", True, []))

    host = head[HEAD_HOST].strip()
    # 27-29 的 host 字段里塞的是许可证文字("Potomac Valley Swimming - For Office Use Only License"),
    # 这不是主办方名字,写进库里只会误导。
    if re.search(r"for office use only|license", host, re.I):
        warn.append(f'.ev3 的 host 字段是许可证文字({host!r}),已置空 —— 需要就用 --host 传')
        host = ""

    meet = {
        "name": name,
        "startDate": start,
        "endDate": end,
        "location": location,
        "season": season_of(start),
        "sourceUrl": args.source_url,
        "sanction": args.sanction or head[HEAD_SANCTION].strip() or None,
        "host": args.host or host or None,
        "entryDeadline": deadline,
        "entryFeePerEvent": int(head[HEAD_FEE]) if head[HEAD_FEE].strip().isdigit() else None,
        "maxIndividualEvents": args.max_events or (int(head[HEAD_MAX_EVENTS]) if head[HEAD_MAX_EVENTS].strip().isdigit() else None),
        "maxIndividualEventsPerDay": args.max_per_day or (int(head[HEAD_MAX_PER_DAY]) if head[HEAD_MAX_PER_DAY].strip().isdigit() else None),
        "qualifyingPeriodStart": qual_start,
        "courses": courses or ["SCY"],        "relayLimitPerClub": args.relay_limit,
        "bonusRule": args.bonus_rule,
        "ageGroups": labels,
        "ageDeterminedOn": age_on,
        "sessions": sessions,
        "sessionsIncomplete": incomplete,
        "events": events,
        "_source": {
            "file": source_label,
            "lsc": head[HEAD_LSC].strip() or None,
            "courseCode": head[HEAD_COURSES].strip(),
            "warnings": warn,
        },
    }

    # ── 输出 ────────────────────────────────────────────────────────────────
    individual = sum(1 for e in events if not e["relay"])
    print(f"\n来源: {source_label}")
    print(f"比赛: {name}  {start} → {end}   place={location}")
    print(f"      定龄日 {age_on} · course {head[HEAD_COURSES]} → {courses} · 赛季 {season_of(start)}")
    print(f"      截止 {deadline or '(缺)'} · 每项 ${meet['entryFeePerEvent']} · 最多 {meet['maxIndividualEvents']} 项 / 每天 {meet['maxIndividualEventsPerDay']}")
    print(f"项目: {len(events)} 行(个人 {individual} / 接力 {len(events) - individual})· 项目号 {len({e['eventNo'] for e in events})} 个")
    print(f"场次: {len(sessions)} 个" + ("  ⚠ 日期未知" if incomplete else ""))
    print("")
    ok = True
    for label, passed, detail in checks:
        print(f'  {"✓" if passed else "✗"} {label}' + (f"  → {detail}" if detail else ""))
        ok = ok and passed
    if warn:
        print("\n注意:")
        for w in warn:
            print("  !", w)

    if args.json:
        print(json.dumps(strip_private(meet), ensure_ascii=False, indent=2))
        return 0 if ok else 1

    out = Path(args.out) if args.out else src.with_suffix(".events.json")
    if not ok:
        print("\n✗ 自校验未通过,未写文件。")
        return 1
    out.parent.mkdir(parents=True, exist_ok=True)
    payload = strip_private(meet)
    payload["_importWarnings"] = warn        # 只给人工看,不进 Firestore(add_meet 只取白名单)
    payload["_importSource"] = meet["_source"]
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n写出: {out}")
    print("下一步:node execution/data-admin/add_meet.mjs --from-json "
          f"{out} --dry-run")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
