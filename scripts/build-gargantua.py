"""Regenerates `public/gargantua.svg` from Diego Inácio's upstream notebook.

Usage:  python scripts/build-gargantua.py [revolution-scale]

The asset is generated rather than hand-drawn, and this script is kept in the
repository so it can be reproduced and re-tuned instead of being a large blob
someone has to take on trust.

Two things are changed on the way through, both deliberate:

  * Revolutions per strand are scaled down. Upstream renders a still at whatever
    size it likes; this has to travel over a network, and the path data is
    almost all of the weight.

  * The SMIL animations become CSS ones. SMIL cannot be stopped by a media
    query, and this file is decoration — it has to hold still for a visitor who
    asked for less motion.

Source: https://github.com/diegoinacio/creative-coding-notebooks (MIT)
"""

from __future__ import annotations

import io
import json
import re
import sys
import urllib.request
from pathlib import Path

NOTEBOOK_URL = (
    'https://raw.githubusercontent.com/diegoinacio/creative-coding-notebooks/'
    'master/Generative/svg-gargantua.ipynb'
)
NOTEBOOK = Path(__file__).parent / 'svg-gargantua.ipynb'
OUTPUT = Path(__file__).parent.parent / 'public' / 'gargantua.svg'

# Cells that define the constants, the SVG header, the defs, the photon ring and
# the accretion-disk generator. The background, planet and debris are not used.
CELLS = [1, 6, 7, 8, 10, 19, 20]


def fetch_notebook() -> None:
    """Downloads the upstream notebook once, and keeps it out of the repository.

    It is an input rather than a dependency: the build never runs this script,
    so a network hiccup can never break `npm run build`.
    """
    if NOTEBOOK.exists():
        return

    print(f'downloading {NOTEBOOK_URL}')
    urllib.request.urlretrieve(NOTEBOOK_URL, NOTEBOOK)


def build(revolution_scale: float) -> str:
    fetch_notebook()
    notebook = json.load(io.open(NOTEBOOK, encoding='utf-8'))
    cells = {
        index: ''.join(cell.get('source', []))
        for index, cell in enumerate(notebook['cells'])
        if cell['cell_type'] == 'code'
    }

    parts = []
    for index in CELLS:
        body = cells[index].replace('%matplotlib inline', '')
        body = re.sub(r'^\s*import matplotlib.*$', '', body, flags=re.M)
        body = re.sub(r'^\s*(fig, ax = plt\..*|ax\..*|plt\..*)$', '', body, flags=re.M)
        parts.append(body)

    source = '\n'.join(parts)
    source = re.sub(
        r'(accretion_disk\(SVG, cx, cy, [^)]*?)2\*(\d+), kind',
        lambda m: f'{m.group(1)}max(6, round(2*{m.group(2)}*REVOLUTION_SCALE)), kind',
        source,
    )
    source = source.replace(':.02f}', ':.01f}')
    source = f'REVOLUTION_SCALE = {revolution_scale}\n' + source

    namespace: dict = {}
    exec(compile(source, NOTEBOOK, 'exec'), namespace)

    return namespace['SVG']


def extract(svg: str) -> tuple[list[str], str, str]:
    defs = re.search(r'<defs>.*?</defs>', svg, re.S).group(0)
    blocks = re.findall(
        r'<(?:radialGradient|linearGradient|filter)\b[^>]*id="BH-[^"]+".*?'
        r'</(?:radialGradient|linearGradient|filter)>',
        defs,
        re.S,
    )
    ring = re.search(r'<g id="bh-photon-ring">.*?</g>', svg, re.S).group(0)
    disk = re.search(r'<g id="bh-accretion-disk".*?</g>\n', svg, re.S).group(0)

    return blocks, ring, disk


SMIL_DASH = re.compile(
    r'\s*<animate attributeName="stroke-dashoffset" values="0;(?P<to>-?[\d.]+)" '
    r'dur="(?P<dur>[\d.]+)s" begin="(?P<begin>-?[\d.]+)s" repeatCount="indefinite" />\s*'
)

# Only nudges the noise inside a filter. Imperceptible, and with no CSS
# equivalent, so it is dropped rather than left as motion nothing can disable.
SMIL_TURBULENCE = re.compile(r'\s*<animate attributeName="dy"[^/]*/>')


def to_css_animations(markup: str, rules: list[str]) -> str:
    """Replaces each SMIL dash animation with a class plus a CSS rule."""

    def replace(match: re.Match[str]) -> str:
        index = len(rules)
        rules.append(
            f'.s{index}{{animation:d{index} {match.group("dur")}s linear '
            f'{match.group("begin")}s infinite}}'
            f'@keyframes d{index}{{to{{stroke-dashoffset:{match.group("to")}}}}}'
        )

        return f'<!--s{index}-->'

    markup = SMIL_DASH.sub(replace, markup)

    # Move each marker onto its own path as a class attribute.
    for index in range(len(rules)):
        marker = f'<!--s{index}-->'

        if marker not in markup:
            continue

        head, _, tail = markup.partition(marker)
        opening = head.rfind('<path ')

        if opening == -1:
            markup = head + tail
            continue

        cut = opening + len('<path ')
        markup = head[:cut] + f'class="s{index}" ' + head[cut:] + tail

    return markup


def main() -> None:
    scale = float(sys.argv[1]) if len(sys.argv) > 1 else 0.35

    blocks, ring, disk = extract(build(scale))

    rules: list[str] = []
    ring = to_css_animations(ring, rules)
    disk = to_css_animations(disk, rules)
    blocks = [SMIL_TURBULENCE.sub('', block) for block in blocks]

    style = (
        '<style>'
        + ''.join(rules)
        + '@media(prefers-reduced-motion:reduce){*{animation:none!important}}'
        + '</style>'
    )

    out = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-42 -24 480 480" '
        'width="480" height="480" role="presentation">\n'
        + style
        + '<defs>'
        + ''.join(blocks)
        + '</defs>\n'
        # Black ground: the strands composite in `screen`, which needs something
        # to screen against. The page blends the whole image in screen too, so
        # this black contributes nothing once it is placed.
        '  <rect x="-42" y="-24" width="480" height="480" fill="#000" />\n'
        + ring
        + '\n'
        + disk
        + '</svg>\n'
    )

    io.open(OUTPUT, 'w', encoding='utf-8').write(out)
    print(f'scale={scale} rules={len(rules)} bytes={len(out)}')


if __name__ == '__main__':
    main()
