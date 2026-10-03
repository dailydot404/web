#!/usr/bin/env python3
"""Fail if HTML files reference missing local assets/pages.

Skips external URLs, mailto/tel/javascript/data, and Vite SPA source entries
under admin-portal/ (those are build inputs, not published paths).
"""
from __future__ import annotations

import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parents[1]
ATTR_RE = re.compile(r"""(?:href|src)=["']([^"']+)["']""", re.I)

# admin-portal is a separate Vite app (gitignored from Pages publish).
SKIP_HTML_PREFIXES = ("admin-portal/",)
SKIP_TARGET_PREFIXES = (
    "admin-portal/",
    "src/",  # absolute /src/... Vite entries
)


def should_skip_html(rel: str) -> bool:
    return any(rel.startswith(p) for p in SKIP_HTML_PREFIXES)


def should_skip_target(rel: str) -> bool:
    rel = rel.lstrip("/")
    return any(rel.startswith(p) for p in SKIP_TARGET_PREFIXES)


def candidates_for(path: Path) -> list[Path]:
    out = [path]
    if path.suffix == "":
        out.extend([Path(str(path) + ".html"), path / "index.html"])
    if path.is_dir():
        out.append(path / "index.html")
    return out


def main() -> int:
    html_files = sorted(
        p for p in ROOT.rglob("*.html") if "node_modules" not in p.parts
    )
    missing: list[tuple[str, str, str]] = []
    checked = 0

    for html in html_files:
        rel_html = str(html.relative_to(ROOT))
        if should_skip_html(rel_html):
            continue
        text = html.read_text(errors="ignore")
        for url in ATTR_RE.findall(text):
            url = url.strip()
            if not url or url.startswith(("#", "mailto:", "tel:", "javascript:", "data:")):
                continue
            parsed = urlparse(url)
            if parsed.scheme in ("http", "https"):
                continue
            path = unquote(parsed.path)
            if not path:
                continue
            if path.startswith("/"):
                candidate = (ROOT / path.lstrip("/")).resolve()
                rel_hint = path.lstrip("/")
            else:
                candidate = (html.parent / path).resolve()
                try:
                    rel_hint = str(candidate.relative_to(ROOT.resolve()))
                except ValueError:
                    missing.append((str(html.relative_to(ROOT)), url, "outside site root"))
                    continue

            if should_skip_target(rel_hint):
                continue

            checked += 1
            try:
                candidate.relative_to(ROOT.resolve())
            except ValueError:
                missing.append((str(html.relative_to(ROOT)), url, "outside site root"))
                continue

            if any(c.exists() for c in candidates_for(candidate)):
                continue
            missing.append((str(html.relative_to(ROOT)), url, rel_hint))

    print(f"checked {checked} local refs across {len(html_files)} HTML files")
    if not missing:
        print("OK — no broken local paths")
        return 0

    print(f"FAIL — {len(missing)} broken local path(s):")
    for src, url, expected in missing:
        print(f"  {src} -> {url}  (missing {expected})")
    return 1


if __name__ == "__main__":
    sys.exit(main())
