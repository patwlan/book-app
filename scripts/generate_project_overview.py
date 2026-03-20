#!/usr/bin/env python3
"""CLI entry point for regenerating the repository overview artifacts."""

from __future__ import annotations

import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from scripts.project_overview import write_overview_files


def main() -> int:
    json_path, html_path = write_overview_files(REPO_ROOT)
    print(f"Updated {json_path.relative_to(REPO_ROOT)}")
    print(f"Updated {html_path.relative_to(REPO_ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

