# Dataset attribution

The 50 source FEN positions and game metadata in `midgames-50.json` are adapted from **Chinese Chess Practical Dataset (CCPD)** by **Yu-Han Tseng (2026)**.

- Source: https://github.com/Yvonne761/Chinese-Chess-Practical-Dataset
- Pinned revision: `368a47a947773dd8692c026e286dd19b6277b993`
- Upstream license: https://github.com/Yvonne761/Chinese-Chess-Practical-Dataset/blob/368a47a947773dd8692c026e286dd19b6277b993/LICENSE
- License: **Creative Commons Attribution 4.0 International (CC BY 4.0)** — https://creativecommons.org/licenses/by/4.0/

Changes: selected 50 distinct source midgame records; extracted FEN without modification; decoded Big5 game metadata; added provenance, raw PGN SHA-256, structural selection information and verification status. No game continuation was generated and no best-move answer is asserted. This attribution does not imply endorsement by the dataset author.

## Short-mate source

`mates.json` adapts case `xq_jianghu_endgames_084` from **XiangqiBench**, **FloatAI (2026)**, pinned revision `59ae55ae103273f57d7f6c460a769a1add8c4cf7`. Source: https://github.com/floatai/xiangqibench/blob/59ae55ae103273f57d7f6c460a769a1add8c4cf7/src/xiangqibench/data/cases.jsonl .

Changes: enumerated alternative forced-mate keys with external pyffish; translated source ranks0–9 and oracle ranks1–10 to board indices; derived a mate-in-one position after the published key and forced defender reply. The published first move is not presented as unique. The original dataset's admission was search-supported; independent verification and the derived position are additions in this fixture.

Upstream MIT license, reproduced in full:

```text
MIT License

Copyright (c) 2026 FloatAI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Independent oracle tooling

The optional `verify-oracle.py` uses **pyffish 0.0.90**, the official Fairy-Stockfish Python binding, licensed GPLv3. This separately installed validation tool is not a product dependency or bundled engine. Official source: https://github.com/Fairy-Stockfish/Fairy-Stockfish ; PyPI: https://pypi.org/project/pyffish/0.0.90/ .
