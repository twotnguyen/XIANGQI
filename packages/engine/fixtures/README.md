# Independent engine validation fixtures

`midgames-50.json` contains exactly 50 positions extracted from published CCPD PGN headers. Their legality and continuing play were independently checked with official pyffish 0.0.90 and independently rerun by a second reviewer. They are not a completed GATE-ENGINE acceptance result. See `NOTICE.md` for attribution and license.

## Selection and provenance

From the first 160 numbered PGNs in `Dataset/中局`, retain positions with both generals and 16–30 pieces; deduplicate board placement plus side to move, preserve ascending source file order, and take the first 50. Each entry retains its original FEN, pinned source URL, raw PGN SHA-256 and decoded game metadata. FEN is unchanged. Metadata is Big5 in upstream files; decoding as GB18030 yields incorrect names.

The source corpus labels these records as midgame. Material count is a reproducible structural filter, not a proof of game phase or legality. Source FEN counters are preserved; the dataset does not fabricate historical repetition or capture counts. Both red-to-move (`w`, 32 positions) and black-to-move (`b`, 18 positions) are represented.

## Before using as an acceptance gate

Independent pyffish validation and a second reviewer rerun confirmed all 50 FENs valid, each with legal moves and no immediate terminal condition. Keep validation separate from the engine under test. These timing positions do not assert one mandatory best move. `mates.json` supplies two related independently solved cases: one published mate-in-two and one derived mate-in-one. Every root key and defender reply was enumerated externally; both winning mate-in-two keys are accepted. Two related cases do not establish a diverse or complete mandatory mate gate.

Run the same 50 positions at each level on the demo machine and retain individual elapsed times, actual completed depth, returned moves, software revision and environment. Calculate p95 against the approved 300/1,000/3,000 ms budgets. A fixture file, structural checks or a successful local engine test alone does not establish GATE-ENGINE PASS.

## Independent oracle reproduction

`verify-oracle.py` imports only Python's standard library and optional official `pyffish`; it never imports the project core or engine. It checks all 50 positions and enumerates the complete bounded mate tree. Normal checkmate requires both check and no legal reply; `is_immediate_game_end` alone is not a checkmate detector. `game_result` is queried only when no legal moves remain.

Official API/provenance:

- https://github.com/Fairy-Stockfish/Fairy-Stockfish/blob/9f778da667f6e07dae1e85d3e2ea204fc6dee94d/README.md#python
- https://github.com/Fairy-Stockfish/Fairy-Stockfish/blob/9f778da667f6e07dae1e85d3e2ea204fc6dee94d/pyffish/__init__.pyi
- https://github.com/Fairy-Stockfish/Fairy-Stockfish/blob/9f778da667f6e07dae1e85d3e2ea204fc6dee94d/src/pyffish.cpp
- https://pypi.org/project/pyffish/0.0.90/

The following pinned wheel command targets the validated Python 3.14/macOS ARM64 environment. Other platforms require selecting and recording their own official PyPI wheel hash, not removing hash verification. Use an isolated venv; do not add this tool to product dependencies or lockfiles. No NNUE or separate executable is needed.

```sh
python3.14 -m venv .local/goal/engine-oracle/venv
.local/goal/engine-oracle/venv/bin/python -m pip install --no-deps --only-binary=:all: --require-hashes -r /dev/stdin <<'REQ'
pyffish==0.0.90 --hash=sha256:cf0351ae5e85507acf39ee7290d40be70f76c0632e8c77f36eaad9acb2c4b918
REQ
.local/goal/engine-oracle/venv/bin/python packages/engine/fixtures/verify-oracle.py --output .local/goal/engine-oracle/reproduced-proof.json
```

`validation-summary.json` records the independently reproduced legality and mate findings. Neither it nor this script claims engine depth, response-time p95, playing strength, full tactical coverage or complete Task38 acceptance.

## Coordinate conversion

Project squares are `y*9+x`, with x0 at file a and y0 on Black's home rank. pyffish uses ranks1–10; the published XiangqiBench move uses ranks0–9. For example published `g5g9` = pyffish `g6g10` = `{from:42,to:6}`. The forced reply is `{from:5,to:14}`; the final mate is `{from:43,to:7}`. Alternative mate-in-two swaps the two cannon keys. Original coordinates and normalized indices are both retained; the script checks their agreement.
