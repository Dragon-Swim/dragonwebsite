#!/usr/bin/env python3

"""
extract_standards_text.py — 把 USA Swimming 2024-2028 Motivational Standards PDF
抽成 parse_usas_standards.py 需要的逐页文本(页标记格式固定为 "=== PAGE n ===")。

为什么单独成脚本:parser 依赖的是 **pypdf 的逐页文本** 这一中间格式,而不是 PDF 本身。
官方更新 PDF 后要能一键重跑,避免每次手工敲抽取命令(历史上这步是 ad-hoc 的)。
PyMuPDF(fitz) 抽出的行结构不同(每个单元格一行),不能直接喂给 parser,只适合交叉核对。

输入: .tmp/2028-motivational-standards-age-group.pdf
输出: .tmp/standards-raw.txt

用法: python execution/extract_standards_text.py [--pdf <path>] [--out <path>]
"""
import argparse
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_PDF = ROOT / ".tmp" / "2028-motivational-standards-age-group.pdf"
DEFAULT_OUT = ROOT / ".tmp" / "standards-raw.txt"


def extract(pdf: Path) -> str:
    reader = PdfReader(str(pdf))
    chunks = []
    for i, page in enumerate(reader.pages):
        chunks.append("\n=== PAGE %d ===\n" % (i + 1) + (page.extract_text() or ""))
    return "".join(chunks)


def main() -> None:
    ap = argparse.ArgumentParser(description="抽取 standards PDF 为 parser 输入文本")
    ap.add_argument("--pdf", default=str(DEFAULT_PDF))
    ap.add_argument("--out", default=str(DEFAULT_OUT))
    args = ap.parse_args()

    pdf, out = Path(args.pdf), Path(args.out)
    if not pdf.exists():
        raise SystemExit(f"PDF 不存在: {pdf}")

    txt = extract(pdf)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(txt, encoding="utf-8")
    print(f"pages={len(PdfReader(str(pdf)).pages)} chars={len(txt)} lines={txt.count(chr(10))}")
    print(f"已写入 {out}")


if __name__ == "__main__":
    main()
