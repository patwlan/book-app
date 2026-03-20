"""Generate a repository overview snapshot and HTML report."""

from __future__ import annotations

import json
import re
import xml.etree.ElementTree as element_tree
from datetime import datetime, timezone
from html import escape
from pathlib import Path
from typing import Any

KOTLIN_CLASS_PATTERN = re.compile(r"(?m)^\s*(?:data\s+|sealed\s+|enum\s+|annotation\s+|value\s+)?class\s+[A-Z_a-z][A-Z_a-z0-9]*")
TYPESCRIPT_CLASS_PATTERN = re.compile(r"(?m)^\s*(?:export\s+)?(?:default\s+)?(?:abstract\s+)?class\s+[A-Z_a-z][A-Z_a-z0-9]*")
KOTLIN_TEST_PATTERN = re.compile(r"(?m)^\s*@Test\b")
TYPESCRIPT_TEST_PATTERN = re.compile(r"(?m)\b(?:it|test)(?:\.(?:only|skip|todo|concurrent|fails|fixme))?\s*\(")

def count_kotlin_class_declarations(source: str) -> int:
    """Count Kotlin class declarations in a source file."""

    return len(KOTLIN_CLASS_PATTERN.findall(source))


def count_typescript_class_declarations(source: str) -> int:
    """Count TypeScript class declarations in a source file."""

    return len(TYPESCRIPT_CLASS_PATTERN.findall(source))


def count_kotlin_tests(source: str) -> int:
    """Count Kotlin JUnit test declarations in a test file."""

    return len(KOTLIN_TEST_PATTERN.findall(source))


def count_typescript_tests(source: str) -> int:
    """Count Vitest and Playwright test declarations in a test file."""

    return len(TYPESCRIPT_TEST_PATTERN.findall(source))


def _read_text(file_path: Path) -> str:
    return file_path.read_text(encoding="utf-8")


def parse_jacoco_line_coverage(report_path: Path) -> dict[str, float | int | None]:
    """Parse line coverage from a JaCoCo XML report."""

    if not report_path.exists():
        return {"covered": 0, "total": 0, "pct": None}

    report = element_tree.parse(report_path).getroot()
    counters = report.findall("counter")
    line_counter = next((counter for counter in counters if counter.attrib.get("type") == "LINE"), None)
    if line_counter is None:
        return {"covered": 0, "total": 0, "pct": None}

    covered = int(line_counter.attrib["covered"])
    missed = int(line_counter.attrib["missed"])
    total = covered + missed
    pct = round((covered / total) * 100, 1) if total else None
    return {"covered": covered, "total": total, "pct": pct}


def parse_vitest_line_coverage(summary_path: Path) -> dict[str, float | int | None]:
    """Parse line coverage from Vitest's json-summary output."""

    if not summary_path.exists():
        return {"covered": 0, "total": 0, "pct": None}

    payload = json.loads(summary_path.read_text(encoding="utf-8"))
    lines = payload.get("total", {}).get("lines", {})
    total = int(lines.get("total", 0))
    covered = int(lines.get("covered", 0))
    pct_value = lines.get("pct")
    pct = round(float(pct_value), 1) if pct_value is not None else (round((covered / total) * 100, 1) if total else None)
    return {"covered": covered, "total": total, "pct": pct}


def _collect_source_stats(
    root: Path,
    patterns: tuple[str, ...],
    class_counter: Any,
    excluded_suffixes: tuple[str, ...] = (),
    excluded_fragments: tuple[str, ...] = (),
) -> dict[str, int]:
    files = sorted(
        {
            file_path
            for pattern in patterns
            for file_path in root.glob(pattern)
            if file_path.is_file()
            and not any(str(file_path).endswith(suffix) for suffix in excluded_suffixes)
            and not any(fragment in str(file_path) for fragment in excluded_fragments)
        }
    )
    class_count = sum(class_counter(_read_text(file_path)) for file_path in files)
    return {"files": len(files), "classes": class_count}


def _combine_coverage(*summaries: dict[str, float | int | None]) -> dict[str, float | int | None]:
    total = sum(int(summary["total"]) for summary in summaries)
    covered = sum(int(summary["covered"]) for summary in summaries)
    pct = round((covered / total) * 100, 1) if total else None
    return {"covered": covered, "total": total, "pct": pct}


def collect_overview(repo_root: Path) -> dict[str, Any]:
    """Collect source, test, and coverage metrics for the repository."""

    source = {
        "kotlin": _collect_source_stats(
            repo_root,
            ("backend/src/main/kotlin/**/*.kt",),
            count_kotlin_class_declarations,
        ),
        "typescript": _collect_source_stats(
            repo_root,
            ("frontend/src/**/*.ts", "frontend/src/**/*.tsx"),
            count_typescript_class_declarations,
            excluded_suffixes=(".spec.ts", ".spec.tsx", ".e2e.ts"),
            excluded_fragments=("/src/test/",),
        ),
    }

    backend_test_files = sorted(file_path for file_path in repo_root.glob("backend/src/test/kotlin/**/*.kt") if file_path.is_file())
    backend_test_counts = [count_kotlin_tests(_read_text(file_path)) for file_path in backend_test_files]
    tests = {
        "backend": {
            "files": sum(1 for declared in backend_test_counts if declared > 0),
            "declared": sum(backend_test_counts),
        },
    }

    frontend_test_files = sorted(
        {
            *repo_root.glob("frontend/src/**/*.spec.ts"),
            *repo_root.glob("frontend/src/**/*.spec.tsx"),
            *repo_root.glob("frontend/src/**/*.e2e.ts"),
        }
    )
    tests["frontend"] = {
        "files": len(frontend_test_files),
        "declared": sum(count_typescript_tests(_read_text(file_path)) for file_path in frontend_test_files),
    }
    tests["total"] = {
        "files": tests["backend"]["files"] + tests["frontend"]["files"],
        "declared": tests["backend"]["declared"] + tests["frontend"]["declared"],
    }

    coverage = {
        "backend": parse_jacoco_line_coverage(repo_root / "backend/build/reports/jacoco/test/jacocoTestReport.xml"),
        "frontend": parse_vitest_line_coverage(repo_root / "frontend/coverage/coverage-summary.json"),
    }
    coverage["combined"] = _combine_coverage(coverage["backend"], coverage["frontend"])

    generated_at = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")

    return {
        "generatedAt": generated_at,
        "source": source,
        "tests": tests,
        "coverage": coverage,
    }


def _format_pct(value: float | None) -> str:
    return "Not available" if value is None else f"{value:.1f}%"


def _format_ratio(covered: int, total: int) -> str:
    return "Not available" if total == 0 else f"{covered}/{total} lines"


def render_overview_html(overview: dict[str, Any]) -> str:
    """Render a polished standalone HTML overview page."""

    kotlin = overview["source"]["kotlin"]
    typescript = overview["source"]["typescript"]
    tests = overview["tests"]
    coverage = overview["coverage"]
    combined_pct = coverage["combined"]["pct"] or 0.0
    generated_at = escape(overview["generatedAt"])

    def progress_width(pct: float | None) -> str:
        return f"{max(0.0, min(pct or 0.0, 100.0)):.1f}%"

    return f"""<!DOCTYPE html>
<html lang=\"en\">
<head>
  <meta charset=\"utf-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
  <title>Book App Project Overview</title>
  <style>
    :root {{
      color-scheme: light;
      --bg: #07111f;
      --panel: rgba(15, 23, 42, 0.82);
      --panel-border: rgba(148, 163, 184, 0.18);
      --text: #e2e8f0;
      --muted: #cbd5e1;
      --accent: #38bdf8;
      --accent-strong: #6366f1;
      --good: #34d399;
      --warn: #fbbf24;
      --shadow: 0 20px 45px rgba(15, 23, 42, 0.32);
    }}

    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif;
      background:
        radial-gradient(circle at top left, rgba(56, 189, 248, 0.18), transparent 28%),
        radial-gradient(circle at top right, rgba(99, 102, 241, 0.2), transparent 24%),
        linear-gradient(180deg, #0f172a 0%, var(--bg) 100%);
      color: var(--text);
      min-height: 100vh;
    }}

    main {{
      width: min(1120px, calc(100% - 32px));
      margin: 0 auto;
      padding: 48px 0 72px;
    }}

    .hero {{
      padding: 32px;
      border: 1px solid var(--panel-border);
      border-radius: 28px;
      background: linear-gradient(135deg, rgba(14, 116, 144, 0.72), rgba(79, 70, 229, 0.76));
      box-shadow: var(--shadow);
    }}

    .hero h1 {{
      margin: 0 0 12px;
      font-size: clamp(2rem, 5vw, 3.5rem);
      line-height: 1.05;
    }}

    .hero p {{
      margin: 0;
      max-width: 58rem;
      color: rgba(226, 232, 240, 0.92);
      font-size: 1rem;
      line-height: 1.65;
    }}

    .meta {{
      margin-top: 18px;
      display: inline-flex;
      gap: 10px;
      align-items: center;
      padding: 10px 14px;
      border-radius: 999px;
      background: rgba(15, 23, 42, 0.24);
      font-size: 0.95rem;
    }}

    .grid {{
      margin-top: 28px;
      display: grid;
      gap: 18px;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    }}

    .card, .section {{
      border: 1px solid var(--panel-border);
      border-radius: 24px;
      background: var(--panel);
      box-shadow: var(--shadow);
      backdrop-filter: blur(14px);
    }}

    .card {{
      padding: 22px;
    }}

    .eyebrow {{
      display: inline-block;
      margin-bottom: 12px;
      color: var(--accent);
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      font-weight: 700;
    }}

    .metric {{
      display: flex;
      align-items: baseline;
      gap: 10px;
      font-weight: 800;
      font-size: 2.2rem;
    }}

    .metric small {{
      color: var(--muted);
      font-weight: 600;
      font-size: 0.95rem;
    }}

    .card p {{
      margin: 12px 0 0;
      color: var(--muted);
      line-height: 1.6;
    }}

    .sections {{
      margin-top: 28px;
      display: grid;
      gap: 18px;
    }}

    .section {{
      padding: 24px;
    }}

    .section h2 {{
      margin: 0 0 8px;
      font-size: 1.35rem;
    }}

    .section p {{
      margin: 0 0 18px;
      color: var(--muted);
      line-height: 1.6;
    }}

    table {{
      width: 100%;
      border-collapse: collapse;
    }}

    th, td {{
      padding: 12px 14px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.12);
      text-align: left;
    }}

    th {{
      color: #f8fafc;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }}

    td {{
      color: var(--muted);
    }}

    .coverage-row {{
      display: grid;
      gap: 14px;
    }}

    .coverage-card {{
      padding: 18px;
      border-radius: 18px;
      background: rgba(15, 23, 42, 0.68);
      border: 1px solid rgba(148, 163, 184, 0.14);
    }}

    .coverage-head {{
      display: flex;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 10px;
    }}

    .bar {{
      width: 100%;
      height: 12px;
      border-radius: 999px;
      background: rgba(148, 163, 184, 0.18);
      overflow: hidden;
    }}

    .bar > span {{
      display: block;
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, var(--good), var(--accent));
    }}

    .footnote {{
      margin-top: 14px;
      font-size: 0.95rem;
      color: var(--muted);
    }}

    code {{
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace;
      color: #f8fafc;
      background: rgba(15, 23, 42, 0.65);
      padding: 0.16rem 0.42rem;
      border-radius: 8px;
    }}

    @media (max-width: 720px) {{
      main {{ padding-top: 28px; }}
      .hero, .section, .card {{ padding: 20px; }}
      th, td {{ padding-left: 10px; padding-right: 10px; }}
    }}
  </style>
</head>
<body>
  <main>
    <section class=\"hero\">
      <span class=\"eyebrow\">Repository telemetry</span>
      <h1>Book App overview at a glance</h1>
      <p>
        This generated page summarizes the current codebase shape across Kotlin and TypeScript,
        declared automated tests, and the latest available line coverage reports from the backend
        and frontend test suites.
      </p>
      <div class=\"meta\">Generated at <strong>{generated_at}</strong></div>
    </section>

    <section class=\"grid\">
      <article class=\"card\">
        <span class=\"eyebrow\">Kotlin production code</span>
        <div class=\"metric\">{kotlin['classes']} <small>classes</small></div>
        <p>{kotlin['files']} source files under <code>backend/src/main/kotlin</code>.</p>
      </article>
      <article class=\"card\">
        <span class=\"eyebrow\">TypeScript source code</span>
        <div class=\"metric\">{typescript['classes']} <small>classes</small></div>
        <p>{typescript['files']} source files under <code>frontend/src</code>.</p>
      </article>
      <article class=\"card\">
        <span class=\"eyebrow\">Automated tests</span>
        <div class=\"metric\">{tests['total']['declared']} <small>declared tests</small></div>
        <p>{tests['total']['files']} test files across backend and frontend suites.</p>
      </article>
      <article class=\"card\">
        <span class=\"eyebrow\">Combined line coverage</span>
        <div class=\"metric\">{_format_pct(coverage['combined']['pct'])} <small>latest report</small></div>
        <p>{_format_ratio(int(coverage['combined']['covered']), int(coverage['combined']['total']))} across measured code.</p>
      </article>
    </section>

    <section class=\"sections\">
      <article class=\"section\">
        <h2>Source inventory</h2>
        <p>Production code metrics are scanned directly from the repository to keep the overview current.</p>
        <table>
          <thead>
            <tr>
              <th>Language</th>
              <th>Source files</th>
              <th>Class declarations</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Kotlin</td>
              <td>{kotlin['files']}</td>
              <td>{kotlin['classes']}</td>
            </tr>
            <tr>
              <td>TypeScript / TSX</td>
              <td>{typescript['files']}</td>
              <td>{typescript['classes']}</td>
            </tr>
          </tbody>
        </table>
      </article>

      <article class=\"section\">
        <h2>Test inventory</h2>
        <p>Test counts are based on declared test cases found in source files, so the page stays informative even before reports are inspected.</p>
        <table>
          <thead>
            <tr>
              <th>Suite</th>
              <th>Test files</th>
              <th>Declared tests</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Backend Kotlin tests</td>
              <td>{tests['backend']['files']}</td>
              <td>{tests['backend']['declared']}</td>
            </tr>
            <tr>
              <td>Frontend TypeScript tests</td>
              <td>{tests['frontend']['files']}</td>
              <td>{tests['frontend']['declared']}</td>
            </tr>
            <tr>
              <td><strong>Total</strong></td>
              <td><strong>{tests['total']['files']}</strong></td>
              <td><strong>{tests['total']['declared']}</strong></td>
            </tr>
          </tbody>
        </table>
      </article>

      <article class=\"section\">
        <h2>Coverage snapshot</h2>
        <p>The update workflow refreshes backend JaCoCo reports and frontend Vitest coverage before regenerating this page.</p>
        <div class=\"coverage-row\">
          <div class=\"coverage-card\">
            <div class=\"coverage-head\">
              <strong>Backend line coverage</strong>
              <span>{_format_pct(coverage['backend']['pct'])} · {_format_ratio(int(coverage['backend']['covered']), int(coverage['backend']['total']))}</span>
            </div>
            <div class=\"bar\"><span style=\"width: {progress_width(coverage['backend']['pct'])};\"></span></div>
          </div>
          <div class=\"coverage-card\">
            <div class=\"coverage-head\">
              <strong>Frontend line coverage</strong>
              <span>{_format_pct(coverage['frontend']['pct'])} · {_format_ratio(int(coverage['frontend']['covered']), int(coverage['frontend']['total']))}</span>
            </div>
            <div class=\"bar\"><span style=\"width: {progress_width(coverage['frontend']['pct'])};\"></span></div>
          </div>
          <div class=\"coverage-card\">
            <div class=\"coverage-head\">
              <strong>Combined measured line coverage</strong>
              <span>{_format_pct(coverage['combined']['pct'])} · {_format_ratio(int(coverage['combined']['covered']), int(coverage['combined']['total']))}</span>
            </div>
            <div class=\"bar\"><span style=\"width: {combined_pct:.1f}%;\"></span></div>
          </div>
        </div>
        <p class=\"footnote\">Refresh the overview with <code>bash update-overview.sh</code>.</p>
      </article>
    </section>
  </main>
</body>
</html>
"""


def write_overview_files(repo_root: Path) -> tuple[Path, Path]:
    """Generate and write the JSON snapshot and HTML overview page."""

    overview = collect_overview(repo_root)
    docs_dir = repo_root / "docs"
    docs_dir.mkdir(parents=True, exist_ok=True)

    json_path = docs_dir / "project-overview.json"
    html_path = docs_dir / "project-overview.html"

    json_path.write_text(json.dumps(overview, indent=2) + "\n", encoding="utf-8")
    html_path.write_text(render_overview_html(overview), encoding="utf-8")

    return json_path, html_path


