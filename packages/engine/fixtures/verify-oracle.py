import json, importlib.metadata, hashlib, argparse, re
from pathlib import Path
import pyffish as sf
VARIANT = "xiangqi"
BASE = Path(__file__).resolve().parent
fixtures = json.loads((BASE / "mates.json").read_text())
assert importlib.metadata.version("pyffish") == "0.0.90", "Use the documented pinned oracle"
FEN = fixtures["cases"][0]["fen"]
calls = 0
def legal(fen, path):
 global calls
 calls += 1
 if calls > 100000: raise RuntimeError("bounded proof exceeded")
 return sf.legal_moves(VARIANT, fen, path)
def mated(fen, path, moves):
 return not moves and sf.gives_check(VARIANT, fen, path) and sf.game_result(VARIANT, fen, path) == -sf.VALUE_MATE
def prove(fen, depth=3):
 assert sf.validate_fen(fen,VARIANT) == sf.FEN_OK
 root = legal(fen,[]); keys=[]; inspected=[]
 for first in root:
  replies = legal(fen,[first]); branches=[]
  if mated(fen,[first],replies):
   keys.append({"move":first,"plies":1,"replies":[]}); inspected.append({"move":first,"defenderReplies":[],"forcedMate":True});continue
  # No-reply stalemate is not a checkmate, and variant termination is separate.
  if depth == 1:
   inspected.append({"move":first,"forcedMate":False});continue
  good = bool(replies) and not sf.is_immediate_game_end(VARIANT,fen,[first])[0]
  for reply in replies:
   finals = legal(fen,[first,reply]); mates=[]
   for final in finals:
    path=[first,reply,final]
    if not sf.gives_check(VARIANT,fen,path): continue
    remaining=legal(fen,path)
    if mated(fen,path,remaining): mates.append(final)
   branches.append({"reply":reply,"matingMoves":mates,"attackerLegalMoveCount":len(finals)})
   good = good and bool(mates)
  inspected.append({"move":first,"defenderReplies":branches,"forcedMate":good})
  if good: keys.append({"move":first,"plies":3,"replies":branches})
 return {"fen":fen,"rootLegalMoveCount":len(root),"winningKeys":keys,"allRootBranches":inspected}
mate2=prove(FEN)
# Derived from published source key plus every legal reply (only one).
assert legal(FEN,["g6g10"]) == ["f10f9"]
derived=sf.get_fen(VARIANT,FEN,["g6g10","f10f9"])
mate1=prove(derived,1)
# The derived mate-in-one gate uses immediate mates, not all mate-in-two keys.
mate1["mateInOneKeys"]=[k["move"] for k in mate1["winningKeys"] if k["plies"]==1]
result={"oracle":"pyffish","version":importlib.metadata.version("pyffish"),"wheelSha256":"cf0351ae5e85507acf39ee7290d40be70f76c0632e8c77f36eaad9acb2c4b918","coordinateRanks":"1..10","sourceCase":"xq_jianghu_endgames_084","sourceCommit":"59ae55ae103273f57d7f6c460a769a1add8c4cf7","legalGenerationCalls":calls,"mate2":mate2,"derivedMate1":mate1}

def normalized(move):
 m = re.fullmatch(r"([a-i])(\d+)([a-i])(\d+)", move)
 assert m
 f, fr, t, tr = m.groups()
 return {"from": (10-int(fr))*9+ord(f)-97, "to": (10-int(tr))*9+ord(t)-97}
expected = fixtures["cases"][0]
assert {k["move"] for k in mate2["winningKeys"]} == {k["pyffishCoordinate"] for k in expected["winningKeys"]}
assert all(k["plies"] == 3 for k in mate2["winningKeys"])
for key in expected["winningKeys"]:
 assert normalized(key["pyffishCoordinate"]) == key["move"]
 actual = next(k for k in mate2["winningKeys"] if k["move"] == key["pyffishCoordinate"])
 assert {b["reply"] for b in actual["replies"]} == {b["reply"]["pyffishCoordinate"] for b in key["defenderReplies"]}
 for b in key["defenderReplies"]:
  assert normalized(b["reply"]["pyffishCoordinate"]) == b["reply"]["move"]
  actual_branch = next(x for x in actual["replies"] if x["reply"] == b["reply"]["pyffishCoordinate"])
  assert set(actual_branch["matingMoves"]) == {x["pyffishCoordinate"] for x in b["matingReplies"]}
  assert all(normalized(x["pyffishCoordinate"]) == x["move"] for x in b["matingReplies"])
assert derived == fixtures["cases"][1]["fen"]
assert set(mate1["mateInOneKeys"]) == {x["pyffishCoordinate"] for x in fixtures["cases"][1]["winningKeys"]}
assert all(normalized(x["pyffishCoordinate"]) == x["move"] for x in fixtures["cases"][1]["winningKeys"])
midgames = json.loads((BASE / "midgames-50.json").read_text())["positions"]
assert len(midgames) == 50
assert len({tuple(x["fen"].split()[:2]) for x in midgames}) == 50
validation = []
for position in midgames:
 fen = position["fen"]
 assert sf.validate_fen(fen,VARIANT) == sf.FEN_OK, position["id"]
 moves = sf.legal_moves(VARIANT,fen,[])
 assert moves and not sf.is_immediate_game_end(VARIANT,fen,[])[0], position["id"]
 validation.append({"id":position["id"], "fenValidation":sf.FEN_OK, "legalMoveCount":len(moves), "sideToMoveInCheck":sf.gives_check(VARIANT,fen,[]), "immediateEnd":False})
result["midgames"] = validation
yc8 = json.loads((BASE / "yc8-mates.json").read_text())["cases"]
result["yc8Mates"] = []
for case in yc8:
 proof = prove(case["fen"],case["mateInPlies"])
 actual = [key for key in proof["winningKeys"] if key["plies"] == case["mateInPlies"]]
 assert {key["move"] for key in actual} == {key["oracleMove"] for key in case["winningKeys"]}, case["id"]
 for key in case["winningKeys"]:
  assert normalized(key["oracleMove"]) == key["move"], case["id"]
  branch = next(k for k in actual if k["move"] == key["oracleMove"])
  assert [{"reply":b["reply"],"matingMoves":b["matingMoves"]} for b in branch["replies"]] == key["defenderReplies"], case["id"]
 result["yc8Mates"].append({"id":case["id"],"proof":proof})
result["limitations"] = ["No timing or strength acceptance", "Eight bounded mate cases across six composed material families and one published source, not exhaustive tactical coverage", "Source repetition history not supplied"]
parser = argparse.ArgumentParser(description="Independent pinned pyffish verification; never calls project core/engine")
parser.add_argument("--output", type=Path, help="Optional explicit path for full machine-readable proof")
args = parser.parse_args()
text = json.dumps(result,ensure_ascii=False,indent=2)+"\n"
if args.output:
 args.output.write_text(text)
else:
 print(text,end="")
