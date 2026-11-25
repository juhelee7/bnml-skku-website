#!/usr/bin/env python3
"""Build preview-1/2/3.html from index.html with only these changes:
   title, canonical/og:url, noindex, two extra stylesheets, body class, top switcher.
Everything else in the page is left byte-identical."""
import re, pathlib, sys

root = pathlib.Path(__file__).resolve().parent
src = (root / "index.html").read_text(encoding="utf-8")

VARIANTS = [
    (1, "차분한 테라코타 (절제형)"),
    (2, "웜 코랄·그라데이션 (생기형)"),
    (3, "깊은 포레스트 + 버건디 (중후형)"),
]
VER = "20261125a"
BASE = "https://juhelee7.github.io/bnml-skku-website/"

def build(n, desc):
    html = src
    changes = 0

    # 1. title
    old = "<title>BNML: Biological & Nanoscale Materials Lab, SKKU</title>"
    assert old in html, "title not found"
    html = html.replace(old, f"<title>BNML 목생화 시안 {n}안 미리보기: Biological &amp; Nanoscale Materials Lab, SKKU</title>", 1)
    changes += 1

    # 2. noindex + canonical/og:url to the preview itself
    old = '<link rel="canonical" href="https://juhelee7.github.io/bnml-skku-website/">'
    assert old in html, "canonical not found"
    html = html.replace(old, f'<meta name="robots" content="noindex,nofollow">\n<link rel="canonical" href="{BASE}preview-{n}.html">', 1)
    old = '<meta property="og:url" content="https://juhelee7.github.io/bnml-skku-website/">'
    assert old in html, "og:url not found"
    html = html.replace(old, f'<meta property="og:url" content="{BASE}preview-{n}.html">', 1)
    changes += 1

    # 3. stylesheets after the site stylesheet
    old = '<link rel="stylesheet" href="assets/style.css?v=9c4b2e7a">'
    assert old in html, "style.css link not found"
    html = html.replace(
        old,
        old
        + f'\n<link rel="stylesheet" href="assets/preview-kit.css?v={VER}">'
        + f'\n<link rel="stylesheet" href="assets/preview-{n}.css?v={VER}">',
        1,
    )
    changes += 1

    # 4. body class
    assert "<body>" in html, "body tag not found"
    html = html.replace("<body>", f'<body class="pv pv-{n}">', 1)
    changes += 1

    # 5. switcher bar right after the skip link
    skip = '<a class="skip-link" href="#content">Skip to content</a>'
    assert skip in html, "skip link not found"
    links = []
    links.append('<a href="./">원본</a>')
    for m, d in VARIANTS:
        cur = ' aria-current="true"' if m == n else ""
        links.append(f'<a href="preview-{m}.html"{cur}>{m}안</a>')
    bar = (
        skip
        + '<div class="pv-bar">\n'
        + '  <div class="pv-bar-in">\n'
        + '    <span class="pv-tag"><b>BNML</b><span class="dot" aria-hidden="true"></span>'
        + f'목생화 木生火 시안 <em>{n}안 · {desc}</em></span>\n'
        + '    <nav class="pv-switch" aria-label="색상 시안 전환">' + "".join(links) + "</nav>\n"
        + '  </div>\n'
        + '</div>'
    )
    html = html.replace(skip, bar, 1)
    changes += 1

    return html, changes

for n, desc in VARIANTS:
    html, c = build(n, desc)
    assert c == 5
    (root / f"preview-{n}.html").write_text(html, encoding="utf-8")
    print(f"preview-{n}.html written ({len(html)} bytes)")
