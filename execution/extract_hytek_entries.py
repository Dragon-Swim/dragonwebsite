#!/usr/bin/env python3
"""抽 HY-TEK / Crystal Reports 的「Individual Meet Entries Report」→ JSON。

用法:
    python execution/extract_hytek_entries.py ".tmp/dragon name entry.pdf"
    python execution/extract_hytek_entries.py entry.pdf -o .tmp/pv-oct.json --txt .tmp/pv-oct.txt
    python execution/extract_hytek_entries.py entry.pdf --json     # 只把 JSON 打到 stdout

产出 JSON 结构:
    {
      "source": "<pdf 路径>",
      "meet": { "name": "PV October Open", "startDate": "2026-10-09", "endDate": "2026-10-11",
                "raw": "PV October Open  09-Oct-26 to 11-Oct-26 Yards" },
      "counts": { "female": 9, "male": 17, "total": 26, "reportTotalAthletes": 26 },
      "athletes": [ { "name": "Celina Feng", "age": 10, "gender": "FEMALE" }, ... ]
    }

为什么要有这个脚本(而不是在 Node 里抽)
--------------------------------------
PyMuPDF 能同时读文本和坐标，而 Node 侧没有等价的 PDF 工具。抽出的 JSON 是纯数据，
下游的 execution/meet-entries-vs-registrations.mjs 只吃 JSON，不碰 PDF —— 所以
PDF 解析和业务匹配可以各自单独重跑、单独调试。

自校验(关键)
------------
报告的末页自带 `Total Athletes: N`。抽到的名字数如果 != N 就直接报错退出(exit 1)，
绝不静默输出一份漏人的名单 —— 「少了一个孩子」这种错误一旦发出去就收不回来。

坐标而非纯文本行
----------------
Crystal Reports 把姓名和 "(age)" 放在不同的文本块里。按 `get_text("text")` 的行切分
有时会把它们拆开；本脚本按 (block, line) 归组、按 y 排序再拼接，实测与报告的
Total Athletes 完全一致。名字行的判定是「同一行里出现 (数字)」。
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

try:
    import fitz  # PyMuPDF
except ImportError:  # pragma: no cover
    sys.exit(
        "需要 PyMuPDF:  pip install pymupdf\n"
        "(只读、纯 wheel,无编译依赖)"
    )

# Windows 控制台默认 cp1252,中文输出会 UnicodeEncodeError。强制 UTF-8,
# 让脚本在 cmd / PowerShell / CI 下行为一致(不依赖 chcp 或 PYTHONIOENCODING)。
for _stream in (sys.stdout, sys.stderr):
    if hasattr(_stream, "reconfigure"):
        _stream.reconfigure(encoding="utf-8")

MONTHS = {
    "jan": "01", "feb": "02", "mar": "03", "apr": "04", "may": "05", "jun": "06",
    "jul": "07", "aug": "08", "sep": "09", "oct": "10", "nov": "11", "dec": "12",
}

# "PV October Open 09-Oct-26 to 11-Oct-26 Yards"
# 注意: 坐标重建后的行只含单个空格,所以这里不能要求 \s{2,}(早期版本就是这么漏掉比赛名的,
# 结果邮件主题里出现了空的比赛名)。用非贪婪 name + 具体的日期模式来定位。
MEET_RE = re.compile(
    r"^\s*(?P<name>.+?)\s+(?P<start>\d{1,2}-[A-Za-z]{3}-\d{2})\s+to\s+(?P<end>\d{1,2}-[A-Za-z]{3}-\d{2})"
)
AGE_RE = re.compile(r"\((\d{1,2})\)\s*$")
GENDER_RE = re.compile(r"^(FEMALE|MALE)\b")
# 末页汇总: "Female IE's: 42" / "Total Athletes: 26" (标签与数字可能在同一行,也可能分块)
TOTAL_ATHLETES_RE = re.compile(r"Total\s*Athletes", re.I)


def _iso(datestr: str) -> str | None:
    m = re.match(r"(\d{1,2})-([A-Za-z]{3})-(\d{2})", datestr)
    if not m:
        return None
    day, mon, yy = m.group(1), m.group(2).lower(), m.group(3)
    if mon not in MONTHS:
        return None
    return f"20{yy}-{MONTHS[mon]}-{int(day):02d}"


def _lines(page) -> list[str]:
    """Reconstruct visual lines: group words by (block, line), order left→right."""
    groups: dict[tuple[int, int], list] = {}
    for w in page.get_text("words"):  # x0, y0, x1, y1, word, block, line, word_no
        groups.setdefault((w[5], w[6]), []).append(w)
    rows = []
    for _key, words in groups.items():
        words.sort(key=lambda w: w[0])
        rows.append((min(w[1] for w in words), " ".join(w[4] for w in words)))
    rows.sort(key=lambda r: r[0])
    return [text for _y, text in rows]


def extract(pdf_path: Path) -> dict:
    doc = fitz.open(pdf_path)
    athletes: list[dict] = []
    meet: dict = {}
    report_total: int | None = None
    gender: str | None = None
    all_lines: list[str] = []

    for page in doc:
        for line in _lines(page):
            all_lines.append(line)
            s = line.strip()
            if not s:
                continue

            if not meet:
                m = MEET_RE.match(s)
                if m:
                    meet = {
                        "name": m.group("name").strip(),
                        "startDate": _iso(m.group("start")),
                        "endDate": _iso(m.group("end")),
                        "raw": s,
                    }

            g = GENDER_RE.match(s)
            if g:
                gender = g.group(1)
                continue

            if TOTAL_ATHLETES_RE.search(s):
                nums = re.findall(r"(\d{1,3})", s)
                if nums:
                    report_total = int(nums[-1])
                continue

            a = AGE_RE.search(s)
            if a:
                name = AGE_RE.sub("", s).strip()
                # 汇总行/表头不含 "(age)"; 但保险起见跳过明显不是名字的
                if name and not name.lower().startswith(("total", "female ie", "male ie")):
                    athletes.append({"name": name, "age": int(a.group(1)), "gender": gender})

    # "Total Athletes:" 与数字分块时, 数字单独成行 —— 在它后面找
    if report_total is None:
        for i, s in enumerate(all_lines):
            if TOTAL_ATHLETES_RE.search(s):
                for nxt in all_lines[i + 1: i + 3]:
                    n = re.findall(r"(\d{1,3})", nxt or "")
                    if n:
                        report_total = int(n[-1])
                        break
                break

    female = sum(1 for a in athletes if a["gender"] == "FEMALE")
    male = sum(1 for a in athletes if a["gender"] == "MALE")
    return {
        "source": str(pdf_path),
        "meet": meet,
        "counts": {
            "female": female,
            "male": male,
            "total": len(athletes),
            "reportTotalAthletes": report_total,
        },
        "athletes": athletes,
        "_text": "\n".join(all_lines),
    }


def main() -> int:
    ap = argparse.ArgumentParser(description="HY-TEK Individual Meet Entries Report → JSON")
    ap.add_argument("pdf", help="报名表 PDF 路径")
    ap.add_argument("-o", "--out", help="JSON 输出路径 (默认 <pdf>.entries.json)")
    ap.add_argument("--txt", help="附带把重建的文本行也写一份,便于人工核对")
    ap.add_argument("--json", action="store_true", help="只把 JSON 打到 stdout,不写文件")
    args = ap.parse_args()

    pdf_path = Path(args.pdf)
    if not pdf_path.exists():
        print(f"找不到文件: {pdf_path}", file=sys.stderr)
        return 2

    data = extract(pdf_path)
    text = data.pop("_text")
    out_path = Path(args.out) if args.out else pdf_path.with_suffix(".entries.json")

    # ── 自校验: 抽到的人数必须等于报告自带的 Total Athletes ──
    counts = data["counts"]
    ok = counts["reportTotalAthletes"] is None or counts["reportTotalAthletes"] == counts["total"]

    if args.json:
        print(json.dumps(data, ensure_ascii=False, indent=2))
    else:
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        if args.txt:
            Path(args.txt).write_text(text, encoding="utf-8")

        print(f"来源: {data['source']}")
        if data["meet"]:
            mt = data["meet"]
            print(f"比赛: {mt['name']}  {mt.get('startDate')} → {mt.get('endDate')}")
        print(f"选手: {counts['total']} 人 (女 {counts['female']} / 男 {counts['male']})")
        print(f"报告自带 Total Athletes: {counts['reportTotalAthletes']}")
        print("")
        for a in data["athletes"]:
            print(f"  {a['name']:<28} {a['age']:>2}  {a['gender'] or ''}")
        print("")
        print(f"JSON → {out_path}")
        if args.txt:
            print(f"文本行 → {args.txt}")

    if not ok:
        print(
            f"\n✗ 自校验失败: 抽到 {counts['total']} 人, 报告写的是 "
            f"{counts['reportTotalAthletes']} 人。\n"
            f"  多半是 PDF 版式和预期不同 —— 请人工核对,不要直接用这份名单。",
            file=sys.stderr,
        )
        return 1

    print(f"\n✓ 自校验通过: {counts['total']} 人 (与报告一致)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
