#!/usr/bin/env python3
"""Reproduce the UTF-8 SUBTLEX-CH character table using only Python's stdlib."""

import argparse
import csv
import hashlib
import io
import json
from pathlib import Path
import urllib.request
import zipfile

URL = "https://ndownloader.figshare.com/files/421463"
SHA256 = "cced9cb382914b93956a24fd06c10de709d351ff4501ac94c9ab136004421f07"
OUTPUT = Path(__file__).resolve().parents[1] / "data/subtlex-ch-characters.json"
HEADER = ["Character", "CHRCount", "CHR/million", "logCHR", "CHR-CD", "CHR-CD%", "logCHR-CD"]


def convert(archive: bytes) -> str:
    if hashlib.sha256(archive).hexdigest() != SHA256:
        raise ValueError("Source checksum changed; review the source before updating the importer")
    with zipfile.ZipFile(io.BytesIO(archive)) as source:
        text = source.read("SUBTLEX-CH-CHR").decode("gb18030", errors="strict")
    lines = text.splitlines()
    if list(csv.reader([lines[2]], delimiter="\t"))[0] != HEADER:
        raise ValueError("Unexpected character table header")
    rows = []
    for rank, fields in enumerate(csv.reader(lines[3:], delimiter="\t"), start=1):
        if len(fields) != 7 or len(fields[0]) != 1:
            raise ValueError(f"Invalid character row at rank {rank}")
        hanzi, count, per_million, log_count, contexts, context_percent, log_contexts = fields
        rows.append({
            "rank": rank, "hanzi": hanzi, "count": int(count),
            "perMillion": float(per_million), "logCount": float(log_count),
            "contextCount": int(contexts), "contextPercent": float(context_percent),
            "logContextCount": float(log_contexts),
        })
    if len(rows) != 5936 or sum(row["count"] for row in rows) != 46841097:
        raise ValueError("Unexpected corpus size or total")
    if len({row["hanzi"] for row in rows}) != len(rows):
        raise ValueError("Duplicate characters")
    if any(a["count"] < b["count"] for a, b in zip(rows, rows[1:])):
        raise ValueError("Source is not in descending count order")
    # Preserve source order (including ties), characters, and all numeric columns.
    # One object per line keeps diffs and command-line inspection manageable.
    return "[\n" + ",\n".join(
        "  " + json.dumps(row, ensure_ascii=False, separators=(",", ":")) for row in rows
    ) + "\n]\n"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--archive", type=Path, help="Use an already downloaded Files_S1.zip")
    parser.add_argument("--check", action="store_true", help="Compare with the committed JSON without writing")
    args = parser.parse_args()
    if args.archive:
        archive = args.archive.read_bytes()
    else:
        with urllib.request.urlopen(URL, timeout=60) as response:
            archive = response.read()
    result = convert(archive)
    if args.check:
        if OUTPUT.read_bytes() != result.encode("utf-8"):
            raise SystemExit("Generated UTF-8 JSON differs from the committed dataset")
        print("Verified: source checksum, conversion, and committed UTF-8 JSON")
    else:
        OUTPUT.parent.mkdir(parents=True, exist_ok=True)
        OUTPUT.write_bytes(result.encode("utf-8"))
        print(f"Wrote 5,936 characters to {OUTPUT}")


if __name__ == "__main__":
    main()
