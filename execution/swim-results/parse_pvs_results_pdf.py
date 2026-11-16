#!/usr/bin/env python3
"""把 PVS 官方 **成绩 PDF**(Hy-Tek "Results")解析成与 `sync_pvs_results.py` 同形状的 JSON。

为什么需要
----------
2026-11-16 发现 PVS 把 `MeetResults27-21.zip`(Loughmiller Memorial)错传成了另一场
(2026 Autumn Mini Meet,与 `MeetResults27-24.zip` 逐字节相同)。同目录下的
`2627meet/27-21-results.pdf` 却是正确的 Loughmiller 成绩。于是 zip 路线整条断掉,
只能用 PDF 兜底 —— 这正是 docs/swim-results-fetch.md §13.5 预留的退路。

PDF 与 `.hy3` 的差别(写库时必须知道)
------------------------------------
* **没有 USA-S ID**。所以输出里 `memberId` 留空,由 `import_pvs_results.mjs`
  按「姓名 + 性别 + 比赛日年龄」唯一匹配注册表,匹配不上/同名多人一律跳过。
* **没有分段(splits)**,也没有 DQ 代码(PDF 只写 "DQ")。
* 只有**个人项目**;本场的 PDF 里没有接力条目(有也会跳过,与 USAS 口径一致)。
* 名次、成绩、报名成绩(NT 表示无)都在。

列布局(实测 2026-11-16,MM 8.0 "For Office Use Only" 格式)
----------------------------------------------------------
每行运动员数据在 PDF 里是**同一 y 上的一行文字**,按 x 分列:

    place(<46) | name(46..190) | age(190..209) | team(209..360) | seed(360..432) | finals(>=432)

队名单独占一行只是取整误差造成的错觉(y 相差 0.1),按 ±3 聚类即可。

用法
----
    python execution/swim-results/parse_pvs_results_pdf.py \
        --pdf .tmp/swim-results/2627/27-21-results.pdf \
        --team "Dragon Swim Team-PV" \
        --key 27-21 --name "2026 FXFX Loughmiller Memorial Invitational" \
        --start 2026-11-06 --end 2026-11-08 \
        --out .tmp/swim-results/pvs/meets/27-21.json

本脚本**只读 PDF、只写一个 JSON**,绝不碰 Firestore。
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:  # noqa: BLE001
    pass

import fitz  # PyMuPDF

SCHEMA = 1

STROKE = [
    ("Individual Medley", "IM"),
    ("IM", "IM"),
    ("Freestyle", "FR"),
    ("Backstroke", "BK"),
    ("Breaststroke", "BR"),
    ("Butterfly", "FL"),
]
COURSE = {"Yard": "SCY", "Yards": "SCY", "Meter": "LCM", "Meters": "LCM", "SCY": "SCY", "LCM": "LCM"}

# 列边界(实测 2026-11-16,MM 8.0 结果表);左闭右开
COL_PLACE_END = 46      # 名次(右对齐,"---" 表示 DQ/无成绩)
COL_NAME_END = 190      # 姓名列结束
COL_AGE_END = 209       # 年龄(右对齐在 ~199)
COL_TEAM_END = 356      # 队名列结束
COL_SEED_START = 356    # 报名成绩(NT / 1:35.57)
COL_FINALS_START = 420  # 决赛成绩 / DQ
EVENT_RE = re.compile(
    r"^\(?Event\s+(?P<num>\d+)\s+(?P<sex>Boys|Girls|Mixed)\s+"
    r"(?P<age>\d+(?:\s*-\s*\d+|\s*&\s*(?:Under|Over))?)\s+"
    r"(?P<dist>\d+)\s+(?P<course>Yard|Yards|Meter|Meters)\s+"
    r"(?P<stroke>[A-Za-z ]+?)\s*\)?$"
)


def fmt_time(seconds: float | None) -> str | None:
    if seconds is None:
        return None
    cs = int(round(seconds * 100))
    if cs >= 6000:
        return f"{cs // 6000}:{(cs % 6000) / 100:05.2f}"
    return f"{cs / 100:.2f}"


def parse_time(text: str) -> float | None:
    s = (text or "").strip()
    if not s or s.upper() in {"NT", "DQ", "NS", "DNF", "SCR", "—", "---"}:
        return None
    m = re.fullmatch(r"(?:(\d+):)?(\d{1,2})\.(\d{1,2})", s)
    if not m:
        return None
    mins = int(m.group(1) or 0)
    sec = int(m.group(2)) + int(m.group(3).ljust(2, "0")) / 100
    return round(mins * 60 + sec, 2)


def age_bounds(label: str) -> tuple[int | None, int | None]:
    s = (label or "").replace(" ", "")
    if s.endswith("&Under"):
        return None, int(s[: -len("&Under")])
    if "-" in s:
        a, b = s.split("-", 1)
        return int(a), int(b)
    return None, None


def stroke_of(text: str) -> str | None:
    t = (text or "").strip()
    for name, code in STROKE:
        if t == name:
            return code
    return None


def rows_of_page(page) -> list[list[tuple[float, str]]]:
    """把一页的 word 按 y 聚成「视觉行」。返回 [[(x, text), ...], ...]。"""
    words = sorted(page.get_text("words"), key=lambda w: (w[1], w[0]))
    groups: list[list] = []
    for w in words:
        if groups and abs(w[1] - groups[-1][0]) <= 3:
            groups[-1][1].append(w)
        else:
            groups.append([w[1], [w]])
    out = []
    for _, ws in groups:
        ws.sort(key=lambda w: w[0])
        out.append([(w[0], w[4]) for w in ws])
    return out


def col_text(cells: list[tuple[float, str]], lo: float, hi: float | None) -> str:
    return " ".join(t for x, t in cells if x >= lo and (hi is None or x < hi)).strip()


def parse_pdf(path: Path, team: str) -> tuple[list[dict], dict]:
    doc = fitz.open(path)
    event = None                      # 当前项目:{num, sex, dist, stroke, course, ageLabel}
    athletes: dict[tuple, dict] = {}
    stats = {"pages": doc.page_count, "rows": 0, "ourRows": 0, "skippedOtherTeam": 0,
             "relayRows": 0, "badRows": []}
    team_norm = re.sub(r"\s+", " ", team).strip().lower()

    for page in doc:
        for cells in rows_of_page(page):
            text = " ".join(t for _, t in cells)
            m = EVENT_RE.match(text)
            if m:
                stroke = stroke_of(m.group("stroke"))
                if m.group("stroke").strip().lower().endswith("relay"):
                    event = {"relay": True, "num": int(m.group("num"))}
                    continue
                if not stroke:
                    event = {"bad": True, "num": int(m.group("num"))}
                    continue
                event = {
                    "num": int(m.group("num")),
                    "sex": m.group("sex"),
                    "ageLabel": m.group("age"),
                    "dist": int(m.group("dist")),
                    "stroke": stroke,
                    "course": COURSE.get(m.group("course"), "SCY"),
                }
                continue

            # 表头 / 页眉 / 分隔线
            if any(k in text for k in ("Name Age Team", "Finals Time", "Seed Time")):
                continue

            cells_team = [t for x, t in cells if COL_AGE_END - 2 <= x < COL_TEAM_END]
            if not cells_team or not re.search(r"-(PV|VA|MD|DC|MA)$", " ".join(cells_team)):
                continue

            stats["rows"] += 1
            team_text = " ".join(cells_team)
            if re.sub(r"\s+", " ", team_text).strip().lower() != team_norm:
                stats["skippedOtherTeam"] += 1
                continue
            stats["ourRows"] += 1

            if not event or event.get("relay") or event.get("bad"):
                stats["relayRows"] += 1
                continue

            name = col_text(cells, COL_PLACE_END, COL_NAME_END)
            place_raw = col_text(cells, 0, COL_PLACE_END)
            age_raw = col_text(cells, COL_NAME_END, COL_AGE_END)
            seed_raw = col_text(cells, COL_SEED_START, COL_FINALS_START)
            finals_raw = col_text(cells, COL_FINALS_START, None)
            if finals_raw == "":
                # 列位置漂移时退化为「行尾最后一个 token 是成绩」
                finals_raw = cells[-1][1]
                seed_raw = cells[-2][1] if len(cells) > 1 else ""
            if "," not in name or not re.fullmatch(r"\d{1,2}", age_raw or ""):
                stats["badRows"].append(text)
                continue
            last, first = [p.strip() for p in name.split(",", 1)]
            first = re.sub(r"\s+", " ", first)
            age = int(age_raw)
            seed = parse_time(seed_raw)
            if finals_raw.upper() in {"DQ", "NS", "DNF", "SCR"}:
                status = finals_raw.upper()
                seconds = None
            else:
                seconds = parse_time(finals_raw)
                status = "ok" if seconds is not None else "?"
            place = None
            if re.fullmatch(r"\d{1,3}", place_raw or ""):
                place = int(place_raw)

            k = (last.lower(), first.lower(), age)
            a = athletes.setdefault(k, {
                "memberId": "",
                "idKind": "none",
                "lastName": last,
                "firstName": first,
                "age": age,
                "sex": {"Boys": "M", "Girls": "F"}.get(event["sex"]),
                "swims": [],
            })
            a["swims"].append({
                "eventNo": event["num"],
                "distance": event["dist"],
                "stroke": event["stroke"],
                "eventSex": event["sex"],
                "ageMin": age_bounds(event["ageLabel"])[0],
                "ageMax": age_bounds(event["ageLabel"])[1],
                "course": event["course"],
                "eventCode": f"{event['dist']} {event['stroke']} {event['course']}",
                "round": "F",
                "seconds": seconds,
                "timeText": fmt_time(seconds),
                "status": status,
                "place": place,
                "seedSeconds": seed,
                "timeDrop": round(seconds - seed, 2) if (seconds is not None and seed) else None,
                "dqCode": None,
                "dqReason": None,
                "swimDate": None,       # 由 main 填赛事开始日
                "splits": [],
            })

    out = list(athletes.values())
    for a in out:
        a["swims"].sort(key=lambda s: (s["eventNo"] or 0))
        # 自检:计时决赛不会同一项目游两遍;重复说明事件头没跟上(列/页边界漂移)
        codes = [s["eventCode"] for s in a["swims"]]
        dup = {c for c in codes if codes.count(c) > 1}
        if dup:
            stats["badRows"].append(
                f"{a['firstName']} {a['lastName']}: 重复项目 {sorted(dup)}")
    return out, stats


def apply_aliases(athletes: list[dict], aliases: list[str]) -> None:
    """把 PDF 里的昵称改成注册名,例如 "Willy Ye=William Ye"。

    只做**显式、逐条给出**的映射 —— 不做模糊匹配。改名后仍要由
    `import_pvs_results.mjs` 用「姓名+性别+年龄」唯一命中注册表才会写库。
    """
    for spec in aliases:
        if "=" not in spec:
            raise SystemExit(f"--alias 格式应为 \"PDF 名=注册名\",收到:{spec!r}")
        src, dst = [s.strip() for s in spec.split("=", 1)]
        src_last, src_first = [s.strip() for s in src.split(",", 1)] if "," in src else \
            (src.split()[-1], " ".join(src.split()[:-1]))
        hits = [a for a in athletes
                if a["lastName"].lower() == src_last.lower() and a["firstName"].lower() == src_first.lower()]
        if len(hits) != 1:
            raise SystemExit(f"--alias {spec!r}: PDF 里命中 {len(hits)} 人,应为 1")
        dst_last, dst_first = [s.strip() for s in dst.split(",", 1)] if "," in dst else \
            (dst.split()[-1], " ".join(dst.split()[:-1]))
        a = hits[0]
        print(f"alias: {a['firstName']} {a['lastName']} → {dst_first} {dst_last}(PDF 昵称 → 注册名)")
        a["firstName"], a["lastName"] = dst_first, dst_last
        a["sourceName"] = f"{src_first} {src_last}"


def main() -> int:
    ap = argparse.ArgumentParser(description="PVS 成绩 PDF → 与 hy3 同形状的 JSON(只读 PDF)")
    ap.add_argument("--pdf", required=True)
    ap.add_argument("--team", default="Dragon Swim Team-PV")
    ap.add_argument("--key", required=True, help="PVS 场次键,如 27-21")
    ap.add_argument("--name", required=True, help="赛事名(写进 meet.name)")
    ap.add_argument("--start", required=True, help="YYYY-MM-DD")
    ap.add_argument("--end", default=None, help="YYYY-MM-DD,默认同 start")
    ap.add_argument("--course", default="SCY")
    ap.add_argument("--alias", action="append", default=[],
                    help='显式昵称映射,如 "Willy Ye=William Ye";可重复')
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    pdf = Path(args.pdf)
    athletes, stats = parse_pdf(pdf, args.team)
    if not athletes:
        print(f"❌ 没有解析到 {args.team} 的运动员:{pdf}")
        return 1

    apply_aliases(athletes, args.alias)
    if len({(a["lastName"].lower(), a["firstName"].lower(), a["age"]) for a in athletes}) != len(athletes):
        print("❌ 昵称映射后出现重复的「姓名+年龄」,拒绝继续")
        return 1

    for a in athletes:
        for s in a["swims"]:
            s["swimDate"] = args.start

    swims = sum(len(a["swims"]) for a in athletes)
    dq = sum(1 for a in athletes for s in a["swims"] if s["status"] == "DQ")
    bad = sum(1 for a in athletes for s in a["swims"] if s["status"] not in ("ok", "DQ", "NS", "DNF", "SCR"))

    doc = {
        "schema": SCHEMA,
        "source": {
            "kind": "pvs-pdf",
            "zip": None,
            "file": pdf.name,
            "fetchedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "note": "PVS 的 TM zip 错传成另一场(27-24 Autumn Mini),本场改用官方成绩 PDF 兜底",
        },
        "meet": {
            "key": args.key,
            "number": args.key,
            "name": args.name,
            "venue": None,
            "startDate": args.start,
            "endDate": args.end or args.start,
            "course": args.course,
            "sanction": None,
        },
        "teams": {"count": None, "of": [args.team]},
        "counts": {
            "athletes": None,
            "swims": None,
            "ourAthletes": len(athletes),
            "ourSwims": swims,
            "ourDq": dq,
            "relays": 0,
        },
        "hasOurTeam": True,
        "athletes": athletes,
    }

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(doc, ensure_ascii=False, indent=1), encoding="utf-8")

    print(f"{pdf.name}: {stats['pages']} 页 · 数据行 {stats['rows']} 条 · 本队 {stats['ourRows']} 条")
    print(f"→ 运动员 {len(athletes)} 人 / 成绩 {swims} 条(DQ {dq},无法识别状态 {bad})")
    if stats["badRows"]:
        print(f"⚠ 结构异常行 {len(stats['badRows'])} 条(已跳过):")
        for t in stats["badRows"][:10]:
            print(f"   {t}")
    print("逐人:")
    for a in sorted(athletes, key=lambda x: (x["lastName"].lower(), x["firstName"].lower())):
        print(f"  {a['firstName']} {a['lastName']:<22} age {a['age']:>2} {a['sex'] or '?'} "
              f"swims {len(a['swims']):>2}")
    print(f"→ {out}")
    return 1 if bad or stats["badRows"] else 0


if __name__ == "__main__":
    sys.exit(main())
