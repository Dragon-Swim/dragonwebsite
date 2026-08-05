#!/usr/bin/env python3
"""
parse_usas_standards.py — 从 USA Swimming 2024-2028 Motivational Standards PDF
的文本抽取结果生成 `src/data/timeStandards.data.js`(纯数据,可再生成)。

输入: .tmp/standards-raw.txt(由 pypdf 抽取的逐页文本,见下方 NOTES)
输出: src/data/timeStandards.data.js — TIME_STANDARDS 数据对象

数据布局(每"行"一条记录,12 个时间):
  [6 个女生时间] 事件名 + course [6 个男生时间]
  女生列序:  B BB A AA AAA AAAA(左→右,越来越快)
  男生列序:  AAAA AAA AA A BB B(左→右,越来越快),即男生 B 在最后
  同一级别女生必慢于男生(女生时间 > 男生时间)

已知文本形态(抽取时已确认):
  - 行间 `*` 是脚注标记,不是分隔符,必须剥离
  - "200 MED-R" / "400 MED-R" 会被换行拆成两行(次行是裸 course 标记 "SCY"/"SCM"/"LCM")
  - 页脚 "Page N of 9"、页眉 "USA Swimming…"、"10/7/…"、列头 "B BB A AA AAA AAAA …" 需跳过
  - 年龄组标题行: "10 & under Girls Event 10 & under Boys"(决定本条及后续行的年龄组)
  - 每 course 段内年龄组固定顺序出现: 10 & under → 11-12 → 13-14 → 15-16 → 17-18

校验(脚本内断言):
  - 每行恰好 12 个时间
  - 女生 B>BB>A>AA>AAA>AAAA;男生 AAAA<AAA<AA<A<BB<B(秒数)
  - 同级别女生秒数 > 男生秒数
用法: python execution/parse_usas_standards.py
"""
import re
import json
from pathlib import Path

RAW = Path(__file__).resolve().parent.parent / ".tmp" / "standards-raw.txt"
OUT = Path(__file__).resolve().parent.parent / "src" / "data" / "timeStandards.data.js"

TIME_RE = re.compile(r"(?:\d+):(\d{2})\.(\d{2})|(\d{2})\.(\d{2})")
LEVELS_GIRLS = ["B", "BB", "A", "AA", "AAA", "AAAA"]  # 左→右
LEVELS_BOYS = ["AAAA", "AAA", "AA", "A", "BB", "B"]   # 左→右(倒序)

AGE_GROUP_RE = re.compile(r"^(\d+\s*&\s*under|11-12|13-14|15-16|17-18)\s+Girls Event\s+(\d+\s*&\s*under|11-12|13-14|15-16|17-18)\s+Boys$")


def parse_time(tok: str) -> float:
    """'39.79' → 39.79;'1:30.79' → 90.79。"""
    if ":" in tok:
        m, s = tok.split(":")
        return int(m) * 60 + float(s)
    return float(tok)


def extract_times(line: str) -> list[float]:
    return [parse_time(m.group(0)) for m in TIME_RE.finditer(line)]


def extract_event_tokens(line: str) -> list[str]:
    """非时间、非脚注标记的词元(事件名,如 ['50','FR','SCY'])。"""
    return [t for t in line.replace("*", " ").split() if not TIME_RE.match(t)]


def main() -> None:
    lines = [ln.rstrip("\n") for ln in RAW.read_text(encoding="utf-8").splitlines()]

    # 1) 拼接被换行拆开的接力行(MED-R/FR-R)。拆行形态:
    #    "3:14.99 * ... * 200 MED-R" / "SCY" / "2:15.39 * ... *"
    #    即 3 个物理行 = 一条记录(女生 6 时间 + 事件名 + course + 男生 6 时间)。
    #    只有接力名会被拆行 — 条件收紧避免误并标题行。
    merged: list[str] = []
    i = 0
    while i < len(lines):
        ln = lines[i]
        real = [t for t in ln.split() if t != "*"]
        if real and real[-1] in ("MED-R", "FR-R"):
            # 合并裸 course 行;若再下一行以时间开头(男生 6 时间),一并合并
            if i + 1 < len(lines):
                ln = ln + " " + lines[i + 1]
                i += 1
                if i + 1 < len(lines) and TIME_RE.match(lines[i + 1].strip()):
                    ln = ln + " " + lines[i + 1]
                    i += 1
        merged.append(ln)
        i += 1

    # 2) 逐行解析
    data: dict[str, dict[str, dict[str, dict[str, float]]]] = {}
    cur_age_group: str | None = None
    n_rows = 0
    for ln in merged:
        stripped = ln.strip()
        if not stripped or stripped.startswith(("USA Swimming", "10/7/", "Page ")):
            continue
        if stripped.startswith("B BB A AA AAA AAAA"):  # 列头
            continue
        m = AGE_GROUP_RE.match(stripped)
        if m:
            cur_age_group = m.group(1)
            data.setdefault(cur_age_group, {})
            continue
        if not TIME_RE.match(stripped):
            print(f"[skip] 未识别行: {stripped!r}")
            continue

        times = extract_times(stripped)
        assert len(times) == 12, f"行时间数 != 12: {stripped!r} ({len(times)})"
        assert cur_age_group is not None, f"年龄组未定: {stripped!r}"
        event_toks = extract_event_tokens(stripped)
        assert len(event_toks) >= 3, f"事件名缺失: {stripped!r}"

        course = event_toks[-1].upper()
        assert course in ("SCY", "SCM", "LCM"), f"未知 course {course!r}: {stripped!r}"
        event_key = " ".join(event_toks[:-1])  # 如 "50 FR"、"200 MED-R"
        girls, boys = times[:6], times[6:]

        # 校验:级别单调(秒数 B 最大/最慢,AAAA 最小/最快)
        for k in range(5):
            assert girls[k] > girls[k + 1], f"女生级别序异常 {event_key}: {stripped!r}"
            assert boys[k] < boys[k + 1], f"男生级别序异常 {event_key}: {stripped!r}"
        # 校验:同级别大多女生慢于男生(男生列是倒序,同级别在镜像位 5-k);
        # 但低龄组 B 档(最慢档)存在女生快于男生的真实特例(如 11-12 50 FL B 档
        # 三 course 均女生快 0.20s,USAS 官方表如此)— 只警告不断言
        for k in range(6):
            if not girls[k] > boys[5 - k]:
                print(
                    f"[info] 女生@{LEVELS_GIRLS[k]}快于男生(官方表特例): "
                    f"{event_key} {course}"
                )

        data[cur_age_group].setdefault(course, {})
        data[cur_age_group][course][event_key] = {
            "girls": {lvl: round(g, 2) for lvl, g in zip(LEVELS_GIRLS, girls)},
            "boys": {lvl: round(b, 2) for lvl, b in zip(LEVELS_BOYS, boys)},
        }
        n_rows += 1

    # 3) 全量统计 + 完整性校验
    # 期望事件数(2024-2028 官方表结构,经 pypdf+pymupdf 双引擎交叉确认):
    #   15-16/17-18 无 50 BK/BR/FL(19);10&U LCM 无 100 IM(13);11-12 LCM 无 800 FR-R(21)
    EXPECTED = {
        ("10 & under", "SCY"): 14, ("10 & under", "SCM"): 14, ("10 & under", "LCM"): 13,
        ("11-12", "SCY"): 22, ("11-12", "SCM"): 22, ("11-12", "LCM"): 21,
        ("13-14", "SCY"): 22, ("13-14", "SCM"): 22, ("13-14", "LCM"): 22,
        ("15-16", "SCY"): 19, ("15-16", "SCM"): 19, ("15-16", "LCM"): 19,
        ("17-18", "SCY"): 19, ("17-18", "SCM"): 19, ("17-18", "LCM"): 19,
    }
    print(f"解析完成: {n_rows} 行 × 12 时间(期望 {sum(EXPECTED.values())} 行)")
    assert n_rows == sum(EXPECTED.values()), f"行数不符: {n_rows} vs 期望 {sum(EXPECTED.values())}"
    for ag, courses in data.items():
        for course, events in courses.items():
            n = len(events)
            print(f"  {ag:10s} {course}: {n} 事件")
            assert n == EXPECTED[(ag, course)], f"{ag} {course} 事件数 {n} != 期望 {EXPECTED[(ag, course)]}"
    for ag in ("10 & under", "11-12", "13-14", "15-16", "17-18"):
        assert ag in data, f"缺少年龄组 {ag}"
        for course in ("SCY", "SCM", "LCM"):
            assert course in data[ag], f"{ag} 缺少 {course}"

    # 4) 生成 JS 数据模块
    js = (
        "// 自动生成 — 请勿手改。由 execution/parse_usas_standards.py 从\n"
        "// .tmp/2028-motivational-standards-age-group.pdf 抽取(USAS 2024-2028 周期)。\n"
        "// 结构: ageGroup → course → '距离 泳姿' → { girls: {B..AAAA: 秒}, boys: {B..AAAA: 秒} }\n"
        '// 数值为"≤该秒数即达此级别"的阈值,单位秒;女生列序 B BB A AA AAA AAAA,\n'
        "// 男生同构(B..AAAA)。渲染与查找逻辑见 timeStandards.js。\n"
        "export const TIME_STANDARDS = "
        + json.dumps(data, indent=2, ensure_ascii=False)
        + ";\n"
    )
    OUT.write_text(js, encoding="utf-8")
    print(f"已写入 {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
