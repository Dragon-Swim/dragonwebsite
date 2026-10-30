#!/usr/bin/env python3
"""从 PVS 官方成绩包(Hy-Tek `.hy3`)抽出本队每场比赛的完整成绩 → JSON。

用法:
    python execution/swim-results/sync_pvs_results.py                 # 增量:只处理新出现/有更新的场次
    python execution/swim-results/sync_pvs_results.py --only 27-26     # 只跑指定场次(逗号分隔)
    python execution/swim-results/sync_pvs_results.py --force          # 忽略 manifest 全部重下
    python execution/swim-results/sync_pvs_results.py --no-download    # 只用 .tmp 里已缓存的 zip
    python execution/swim-results/sync_pvs_results.py --dry-run        # 只列要做什么,不落盘

输入(只读网络,不碰 Firestore):
    https://www.files.pvswim.org/<season>tm/     Apache 目录索引(文件名 + 修改时间 + 大小)

输出:
    .tmp/swim-results/pvs/meets/<meetKey>.json   每场一份,只含本队队员
    .tmp/swim-results/pvs/manifest.json          zip 的 mtime/size/sha256 + 处理状态
    .tmp/swim-results/zips/<name>.zip            zip 缓存(--no-download 复用)

为什么走这条路(2026-10-29 实测)
--------------------------------
PVS 每场比赛除了给人看的 `-results.pdf`,还挂一个 `MeetResults<season>-<n>.zip`,
里面是 Meet Manager 导出的完整赛事数据库(`.hy3` + `.cl2`),**全队所有队员每条成绩
都在里面**。所以"全队抓一次成绩"从「32 个队员 × 3 分钟冷却 ≈ 96 分钟」变成
「每场 1 次 ~0.5MB 下载」。

已实测的一致性(2026-10-29,对 10/09-11、10/24-25 两场):
    Firestore 里 USAS 抓来的 193 条成绩,与本脚本解析出的 193 条
    **时间 0 差异、名次 0 差异**;`.hy3` 另多出 3 条 USAS 根本不返回的(DQ 1、弃赛 2)。

`.hy3` 格式要点(字段偏移全部来自公开逆向文档 + 本仓库实测)
---------------------------------------------------------
* 定长 130 字符/行 = 128 数据 + 2 位行校验(CP-1252,CRLF)。校验算法已实测 12606/12606 通过。
* 层级:A1 文件头 → B1 赛事 → B2 主办 → 每队(C1 队伍 → 每个运动员 D1 → 每项 E1 报名 → E2 成绩
  → G1 分段 → H1 犯规原因)。**队伍归属靠 C1 区块的先后顺序**,D1 记录本身不带队名。
* E1/E2 用冠军号(第 4-8 位)回指 D1;实测 22 个文件 0 条错位,但本脚本仍逐条校验。
* USA-S ID 在第 70-83 位。绝大多数是 14 位 SWIMS ID(就是我们 `swimResults` 的文档 ID),
  但少数仍是老的「生日+姓名缩写」格式(如 `101416ISAMYE**`),需要上层按姓名+生日兜底。
* 犯规(E2 状态位 `Q`)**保留成绩时间**,弃赛/退赛(`F`/`R`/`D`)时间为空。

为什么不在前端做
----------------
`files.pvswim.org` 不返回任何 CORS 头(实测 HEAD/OPTIONS 都没有 `Access-Control-Allow-Origin`),
浏览器从 dragonswim.org 读不到这个 zip。所以放本机跑,和 `execution/data-admin/*.mjs` 一个路子。

本脚本**只读**:只下载和写 `.tmp/`,绝不写 Firestore。
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import re
import sys
import urllib.request
import zipfile
from datetime import datetime, timezone
from pathlib import Path

try:  # Windows 控制台默认 cp936,中文日志会炸
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:  # noqa: BLE001
    pass

BASE = "https://www.files.pvswim.org"
DEFAULT_OUT = Path(".tmp/swim-results/pvs")
DEFAULT_ZIP_CACHE = Path(".tmp/swim-results/zips")
DEFAULT_TEAM = "DRAG"
SCHEMA = 1

STROKE = {"A": "FR", "B": "BK", "C": "BR", "D": "FL", "E": "IM"}
DIVING = {"F", "G"}
COURSE = {"Y": "SCY", "L": "LCM", "S": "SCM"}
STATUS = {"": "ok", "Q": "DQ", "D": "DNF", "F": "NS", "R": "NS", "S": "EXH"}
NO_TIME_STATUS = {"DNF", "NS"}

# 目录索引一行(实测 2026-10-29):
# <tr><td ...>&nbsp;</td><td><a href="MeetResults27-26.zip">...</a>   </td>
#   <td align="right">2026-10-26 12:41  </td><td align="right">435K</td><td>&nbsp;</td></tr>
ROW_RE = re.compile(
    r'<a href="(?P<name>[^"]+\.zip)">.*?</td>\s*'
    r'<td align="right">\s*(?P<mtime>[\d-]+ [\d:]+)\s*</td>\s*'
    r'<td align="right">\s*(?P<size>[\d.]+[KMG]?)\s*</td>',
    re.S,
)
NAME_RE = re.compile(r"^MeetResults(\d+)-(\d+)(?:-(.+))?\.zip$", re.I)


# --------------------------------------------------------------------------- 网络


def http_get(url: str, timeout: int = 180) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "dragonswim-results-sync"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def season_for(today: datetime) -> str:
    """PVS 赛季以 9 月为界:2026-10 → '2627',2026-03 → '2526'。"""
    return f"{today.year % 100:02d}{(today.year + 1) % 100:02d}" if today.month >= 9 \
        else f"{(today.year - 1) % 100:02d}{today.year % 100:02d}"


def parse_index(html: str, season_dir: str) -> list[dict]:
    """`season_dir` 是 4 位的目录名(2627),不是文件名里的 2 位前缀(27)。"""
    out = []
    for m in ROW_RE.finditer(html):
        name = m.group("name")
        nm = NAME_RE.match(name)
        if not nm:
            continue
        year, num, suffix = nm.group(1), nm.group(2), nm.group(3)
        # MeetResults27-9.zip 与 MeetResults27-09.zip 是同一个文件的两种上传,归一化后去重
        key = f"{year}-{int(num):02d}" + (f"-{suffix.lower()}" if suffix else "")
        out.append({
            "key": key,
            "zip": name,
            "mtime": m.group("mtime"),
            "size": m.group("size"),
            "url": f"{BASE}/{season_dir}tm/{name}",
            "padded": len(num) == 2,
        })
    # 同 key 多份时优先用补零命名的那份
    best: dict[str, dict] = {}
    for row in out:
        cur = best.get(row["key"])
        if cur is None or (row["padded"] and not cur["padded"]):
            best[row["key"]] = row
    return sorted(best.values(), key=lambda r: (int(r["key"].split("-")[0]), int(r["key"].split("-")[1]),
                                                r["key"]))


# --------------------------------------------------------------------------- hy3


def sl(s: str, a: int, b: int) -> str:
    """1-based 闭区间取列。"""
    return s[a - 1:b]


def checksum_ok(line: str) -> bool:
    """130 列 = 128 数据 + 2 位校验;算法 `(2*偶数位和 + 奇数位和)//21 + 205`,末两位倒序。"""
    raw = line.encode("cp1252", "replace")
    if len(raw) < 130:
        return False
    data = raw[:128]
    s_odd = sum(data[i] for i in range(0, 128, 2))
    s_even = sum(data[i] for i in range(1, 128, 2))
    result = (2 * s_even + s_odd) // 21 + 205
    return raw[128:130].decode("ascii", "replace") == f"{result % 10}{(result // 10) % 10}"


def fmt_time(sec: float | None) -> str | None:
    """72.5 → '1:12.50';40.26 → '40.26'。与前端 formatSwimTime 的展示一致。"""
    if sec is None:
        return None
    cs = int(round(sec * 100))
    if cs >= 6000:
        return f"{cs // 6000}:{(cs % 6000) / 100:05.2f}"
    return f"{cs / 100:.2f}"


def num(s: str, default=None):
    s = s.strip()
    if not s or not re.fullmatch(r"-?\d+(\.\d+)?", s):
        return default
    v = float(s)
    return int(v) if v.is_integer() else v


def parse_hy3(text: str, team: str, zip_name: str) -> dict:
    """解析一个 `.hy3`。返回赛事信息 + 本队运动员及其成绩。"""
    raw_lines = [ln for ln in text.splitlines() if ln.strip()]

    bad_checksum = 0
    meet = {"name": None, "venue": None, "startDate": None, "endDate": None,
            "course": None, "sanction": None, "fileType": None}
    teams: dict[str, str] = {}
    club = None
    athlete = None
    pending = None      # 最近一条 E1,等它的 E2
    last_swim = None    # 用来挂 G1 分段 / H1 犯规原因
    our: list[dict] = []
    our_ids: set[str] = set()
    relays: list[dict] = []
    counts = {"athletes": 0, "swims": 0, "e1": 0, "e2": 0, "orphanE1": 0, "orphanE2": 0, "diving": 0}

    for ln in raw_lines:
        if len(ln) < 130 or not checksum_ok(ln):
            bad_checksum += 1
        d = ln[:128]                      # 数据区(不含 2 位校验)
        code = d[:2]

        if code == "A1":
            meet["fileType"] = sl(d, 3, 4).strip()
        elif code == "B1":
            meet["name"] = sl(d, 3, 47).strip()
            meet["venue"] = sl(d, 48, 92).strip()
            meet["startDate"] = iso_date(sl(d, 93, 100))
            meet["endDate"] = iso_date(sl(d, 101, 108))
        elif code == "B2":
            meet["course"] = COURSE.get(sl(d, 99, 99).strip())
            meet["sanction"] = sl(d, 109, 116).strip()
        elif code == "C1":
            club = sl(d, 3, 7).strip()
            teams[club] = sl(d, 8, 37).strip()
        elif code == "D1":
            counts["athletes"] += 1
            mid = sl(d, 70, 83).strip()
            athlete = {
                "memberId": mid,
                "idKind": classify_id(mid),
                "lastName": sl(d, 9, 28).strip(),
                "firstName": sl(d, 29, 48).strip(),
                "preferred": sl(d, 49, 68).strip() or None,
                "middleInitial": sl(d, 69, 69).strip() or None,
                "age": num(sl(d, 98, 99)),
                "sex": sl(d, 3, 3).strip(),
                "dob": ymd(sl(d, 89, 96)),
                "club": club,
                "swims": [],
            }
            if club == team:
                our.append(athlete)
                if mid:
                    our_ids.add(mid)
            pending = None
            last_swim = None
        elif code == "E1":
            counts["e1"] += 1
            if athlete is None:
                counts["orphanE1"] += 1
                pending = None
                continue
            stroke = sl(d, 22, 22).strip()
            if stroke in DIVING:
                counts["diving"] += 1
                pending = None
                continue
            pending = {
                "eventNo": num(sl(d, 39, 42)),
                "distance": num(sl(d, 16, 21)),
                "stroke": STROKE.get(stroke, "?"),
                "eventSex": sl(d, 15, 15).strip() or None,
                "ageMin": num(sl(d, 23, 25)),
                "ageMax": num(sl(d, 26, 28)),
                "seedSeconds": num(sl(d, 53, 59)),
                "seedCourse": COURSE.get(sl(d, 60, 60).strip()),
            }
        elif code == "E2":
            counts["e2"] += 1
            if pending is None or athlete is None:
                counts["orphanE2"] += 1
                last_swim = None
                continue
            seconds = num(sl(d, 5, 11))
            status = STATUS.get(sl(d, 13, 13).strip(), "?")
            course = COURSE.get(sl(d, 12, 12).strip())
            seed = pending["seedSeconds"]
            counts["swims"] += 1
            swim = {
                **{k: pending[k] for k in ("eventNo", "distance", "stroke", "eventSex", "ageMin", "ageMax")},
                "course": course,
                "eventCode": f"{pending['distance']} {pending['stroke']} {course}".strip(),
                "round": sl(d, 3, 3).strip() or "F",
                "seconds": seconds,
                "timeText": fmt_time(seconds),
                "status": status,
                "heat": num(sl(d, 22, 23)),
                "lane": num(sl(d, 25, 26)),
                "place": num(sl(d, 31, 33)) or None,
                "heatPlace": num(sl(d, 28, 29)) or None,
                "seedSeconds": seed,
                "seedCourse": pending["seedCourse"],
                "timeDrop": round(seconds - seed, 2) if (seconds and seed) else None,
                "dqCode": sl(d, 14, 15).strip() or None,
                "dqReason": None,
                "swimDate": iso_date(sl(d, 88, 95)),
                "splits": [],
            }
            athlete["swims"].append(swim)
            last_swim = swim
            pending = None
        elif code == "G1" and last_swim is not None:
            body = sl(d, 3, 128)
            for i in range(0, len(body) - 10, 11):
                blk = body[i:i + 11]
                counter, secs = num(blk[1:3]), num(blk[3:11])
                if counter is not None and secs:
                    last_swim["splits"].append({"counter": counter, "seconds": secs})
        elif code == "H1" and last_swim is not None:
            # H1 = 记录码 + 2 位犯规码(与 E2 第 14-15 位一致) + 原因全文
            if last_swim["dqCode"] is None:
                last_swim["dqCode"] = sl(d, 3, 4).strip() or None
            reason = sl(d, 5, 128).strip()
            if reason:
                last_swim["dqReason"] = reason
        elif code in ("F1", "F2", "F3") and sl(d, 3, 6).strip() == team:
            relays.append({"code": code, "line": d.strip()})

    for a in our:
        a["swims"].sort(key=lambda s: (s["eventNo"] or 0, s["round"] != "F"))

    return {
        "meet": meet,
        "teams": teams,
        "ourAthletes": our,
        "ourIds": sorted(our_ids),
        "relays": relays,
        "counts": counts,
        "badChecksum": bad_checksum,
    }


def iso_date(mm_dd_yyyy: str) -> str | None:
    s = (mm_dd_yyyy or "").strip()
    if not re.fullmatch(r"\d{8}", s):
        return None
    try:
        return datetime.strptime(s, "%m%d%Y").strftime("%Y-%m-%d")
    except ValueError:
        return None


def ymd(mm_dd_yyyy: str) -> str | None:
    return iso_date(mm_dd_yyyy)


def classify_id(mid: str) -> str:
    """`swims` = 14 位 SWIMS ID(就是我们 `swimResults` 的文档 ID);
    `legacy` = 老格式「生日 6 位 + 姓名缩写 8 位」,用 `*` 补齐(如 `101416ISAMYE**`)。

    只用 `*` 判定:老格式里不含 `*` 的(如 `033199BRIAALLI`)与 SWIMS ID 长得一模一样,
    猜不出就别猜 —— 上层按姓名+生日兜底,对不上的会进「待确认」清单。
    """
    if not mid:
        return "none"
    if "*" in mid:
        return "legacy"
    return "swims" if re.fullmatch(r"[0-9A-Z]{14}", mid) else "unknown"


# --------------------------------------------------------------------------- 主流程


def load_manifest(path: Path) -> dict:
    if path.exists():
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            print(f"⚠ manifest 损坏,按空处理:{path}")
    return {"schema": SCHEMA, "meets": {}}


def main() -> int:
    ap = argparse.ArgumentParser(description="从 PVS 成绩包解析本队成绩(只读,不写 Firestore)")
    ap.add_argument("--season", default=None, help="赛季,如 2627;默认按今天推算")
    ap.add_argument("--team", default=DEFAULT_TEAM, help=f"队伍代码,默认 {DEFAULT_TEAM}")
    ap.add_argument("--out", default=str(DEFAULT_OUT), help="输出目录")
    ap.add_argument("--zip-cache", default=str(DEFAULT_ZIP_CACHE), help="zip 缓存目录")
    ap.add_argument("--only", default=None, help="只处理这些场次,逗号分隔,如 27-07-claude,27-26")
    ap.add_argument("--force", action="store_true", help="忽略 manifest,全部重下重解")
    ap.add_argument("--no-download", action="store_true", help="只用已缓存的 zip(离线/复跑)")
    ap.add_argument("--dry-run", action="store_true", help="只打印计划,不写任何文件")
    args = ap.parse_args()

    season = args.season or season_for(datetime.now())
    out_dir = Path(args.out)
    zip_dir = Path(args.zip_cache)
    manifest_path = out_dir / "manifest.json"
    meets_dir = out_dir / "meets"

    print(f"赛季 {season}  ·  队伍 {args.team}  ·  输出 {out_dir}")
    if args.no_download:
        index = None
        print("(--no-download:跳过目录索引,只按缓存 zip 处理)")
    else:
        index_html = http_get(f"{BASE}/{season}tm/").decode("utf-8", "replace")
        index = parse_index(index_html, season)
        print(f"目录索引:{len(index)} 个成绩包")

    manifest = load_manifest(manifest_path)
    known = manifest.setdefault("meets", {})

    if index is None:
        todo = [{"key": k, "zip": v["zip"], "url": None, "mtime": None, "size": None}
                for k, v in known.items()]
    else:
        if args.only:
            wanted = {s.strip() for s in args.only.split(",")}
            index = [r for r in index if r["key"] in wanted]
            missing = wanted - {r["key"] for r in index}
            if missing:
                print(f"⚠ 目录里没有这些场次:{sorted(missing)}")
        todo = []
        for row in index:
            prev = known.get(row["key"])
            changed = not prev or prev.get("zip") != row["zip"] or prev.get("mtime") != row["mtime"] \
                or prev.get("size") != row["size"] or not prev.get("ok")
            if args.force or changed:
                todo.append(row)

    if not todo:
        print("✅ 没有新场次,也没有更新的包。")
        return 0
    print(f"待处理 {len(todo)} 个包" + ("" if args.force else "(新增或 mtime/大小有变化)"))

    if args.dry_run:
        for row in todo:
            prev = known.get(row["key"])
            flag = "NEW" if not prev else "CHANGED"
            print(f"   [{flag}] {row['key']:16s} {row['zip']:34s} {row['mtime']}  {row['size']}")
        print("(--dry-run:未下载、未写盘)")
        return 0

    zip_dir.mkdir(parents=True, exist_ok=True)
    meets_dir.mkdir(parents=True, exist_ok=True)

    failures = 0
    summary = []
    for row in todo:
        key, zip_name = row["key"], row["zip"]
        cached = zip_dir / zip_name
        try:
            if args.no_download:
                if not cached.exists():
                    raise FileNotFoundError(f"缓存里没有 {cached}")
                blob = cached.read_bytes()
            elif cached.exists() and row.get("mtime") == known.get(key, {}).get("mtime"):
                blob = cached.read_bytes()
            else:
                blob = http_get(row["url"])
                cached.write_bytes(blob)

            sha = hashlib.sha256(blob).hexdigest()
            with zipfile.ZipFile(io.BytesIO(blob)) as z:
                hy3_names = [n for n in z.namelist() if n.lower().endswith(".hy3")]
                if not hy3_names:
                    raise ValueError(f"zip 里没有 .hy3(只有 {z.namelist()})")
                text = z.read(hy3_names[0]).decode("cp1252", "replace")
                cl2 = any(n.lower().endswith(".cl2") for n in z.namelist())

            parsed = parse_hy3(text, args.team, zip_name)
            m = parsed["meet"]
            our_swims = sum(len(a["swims"]) for a in parsed["ourAthletes"])
            dq = sum(1 for a in parsed["ourAthletes"] for s in a["swims"] if s["status"] == "DQ")

            # ---- 自校验:宁可整场失败,也不要静默写进一份残缺数据
            problems = []
            if parsed["badChecksum"]:
                problems.append(f"{parsed['badChecksum']} 行校验位不通过(文件可能损坏)")
            if m["fileType"] not in ("07", "04"):
                problems.append(f"A1 文件类型码是 {m['fileType']!r},不是成绩文件(07/04)")
            if not m["name"] or not m["startDate"]:
                problems.append("B1 缺赛事名或开始日期")
            if not parsed["teams"]:
                problems.append("没有任何 C1 队伍记录")
            if parsed["counts"]["e1"] and parsed["counts"]["orphanE1"] > parsed["counts"]["e1"] * 0.05:
                problems.append(f"E1 孤儿比例过高:{parsed['counts']['orphanE1']}/{parsed['counts']['e1']}")
            bad_time = [s for a in parsed["ourAthletes"] for s in a["swims"]
                        if s["status"] not in NO_TIME_STATUS and (s["seconds"] or 0) <= 0]
            if bad_time:
                problems.append(f"{len(bad_time)} 条有成绩状态的记录时间为 0")
            if problems:
                raise ValueError(";".join(problems))

            doc = {
                "schema": SCHEMA,
                "source": {
                    "kind": "pvs-hy3",
                    "season": season,
                    "zip": zip_name,
                    "url": row["url"],
                    "bytes": len(blob),
                    "modified": row["mtime"],
                    "sha256": sha,
                    "hasCl2": cl2,
                    "fetchedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                },
                "meet": {
                    "key": key,
                    "number": key,
                    "name": m["name"],
                    "venue": m["venue"],
                    "startDate": m["startDate"],
                    "endDate": m["endDate"],
                    "course": m["course"],
                    "sanction": m["sanction"],
                },
                "teams": {"count": len(parsed["teams"]), "of": sorted(parsed["teams"])},
                "counts": {
                    "athletes": parsed["counts"]["athletes"],
                    "swims": parsed["counts"]["swims"],
                    "ourAthletes": len(parsed["ourAthletes"]),
                    "ourSwims": our_swims,
                    "ourDq": dq,
                    "relays": len(parsed["relays"]),
                },
                "hasOurTeam": bool(parsed["ourAthletes"]),
                "athletes": parsed["ourAthletes"],
            }
            (meets_dir / f"{key}.json").write_text(
                json.dumps(doc, ensure_ascii=False, indent=1), encoding="utf-8")

            known[key] = {
                "zip": zip_name, "mtime": row["mtime"], "size": row["size"],
                "sha256": sha, "ok": True,
                "meetName": m["name"], "startDate": m["startDate"], "endDate": m["endDate"],
                "course": m["course"], "ourAthletes": len(parsed["ourAthletes"]),
                "ourSwims": our_swims, "ourDq": dq,
                "processedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            }
            summary.append(known[key] | {"key": key})
            flag = "★" if parsed["ourAthletes"] else " "
            print(f" {flag} {key:16s} {m['startDate']}~{m['endDate']}  {m['name'][:38]:38s} "
                  f"{m['course'] or '--'}  我们 {len(parsed['ourAthletes']):2d} 人/"
                  f"{our_swims:3d} 条" + (f"/{dq} DQ" if dq else ""))
        except Exception as e:  # noqa: BLE001
            failures += 1
            known[key] = (known.get(key) or {}) | {"zip": zip_name, "ok": False, "error": str(e)}
            print(f" ✗ {key:16s} 失败:{e}")

    manifest["schema"] = SCHEMA
    manifest["season"] = season
    manifest["team"] = args.team
    manifest["updatedAt"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=1), encoding="utf-8")

    ours = [r for r in summary if r["ourAthletes"]]
    print(f"\n完成:{len(summary) - failures} 成功 / {failures} 失败;"
          f"其中有本队参加的 {len(ours)} 场")
    if ours:
        print("本队参加场次:" + ", ".join(f"{r['key']}({r['ourAthletes']}人)" for r in ours))
    print(f"manifest → {manifest_path}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
