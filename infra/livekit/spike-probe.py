#!/usr/bin/env python3
"""Probe LiveKit local cho spike T06/XIAN-42 và GATE-MEDIA.

Doc: liveness (khong can khoa) + service API (can khoa local).
Chi doc khoa tu .local/livekit/local.json (Git bo qua); khong in khoa.
Tra 0 khi tat ca dat, 1 khi co muc that bai.
"""
import base64
import hashlib
import hmac
import json
import os
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BASE = "http://127.0.0.1:7880"
# Cho phep chi thu muc .local khac (worktree moi chua co .local riêng).
LOCAL_DIR = Path(os.environ.get("XIANGQI_LOCAL_DIR", ROOT / ".local"))


def check_liveness() -> bool:
    t0 = time.time()
    with urllib.request.urlopen(BASE + "/", timeout=10) as r:
        body = r.read()
    ms = (time.time() - t0) * 1000
    ok = r.status == 200 and body == b"OK"
    print(f"liveness: HTTP {r.status} in {ms:.1f}ms ok={ok}")
    return ok


def service_token() -> str:
    keys = json.loads((LOCAL_DIR / "livekit/local.json").read_text())
    api_key = keys["LIVEKIT_API_KEY"]
    secret = keys["LIVEKIT_API_SECRET"]

    def b64(data: bytes) -> str:
        return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

    now = int(time.time())
    header = b64(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
    payload = b64(
        json.dumps(
            {
                "iss": api_key,
                "exp": now + 60,
                "nbf": now - 5,
                "video": {
                    "roomAdmin": True,
                    "roomList": True,
                    "roomCreate": True,
                },
            }
        ).encode()
    )
    sig = b64(
        hmac.new(
            secret.encode(), f"{header}.{payload}".encode(), hashlib.sha256
        ).digest()
    )
    return f"{header}.{payload}.{sig}"


def twirp(path: str, body: bytes, token: str) -> tuple[int, bytes, float]:
    req = urllib.request.Request(
        BASE + path,
        data=body,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
    )
    t0 = time.time()
    with urllib.request.urlopen(req, timeout=10) as r:
        return r.status, r.read(), (time.time() - t0) * 1000


def main() -> int:
    ok = check_liveness()
    token = service_token()
    status, rooms, ms = twirp(
        "/twirp/livekit.RoomService/ListRooms", b"{}", token
    )
    empty = rooms == b'{"rooms":[]}' or rooms.startswith(b'{"rooms":')
    print(f"list-rooms: HTTP {status} in {ms:.1f}ms ok={status == 200}")
    ok = ok and status == 200 and empty
    status, created, ms = twirp(
        "/twirp/livekit.RoomService/CreateRoom",
        b'{"name": "spike-probe-room", "empty_timeout": 30}',
        token,
    )
    print(f"create-room: HTTP {status} in {ms:.1f}ms ok={status == 200}")
    ok = ok and status == 200
    status, _, ms = twirp(
        "/twirp/livekit.RoomService/DeleteRoom",
        b'{"room": "spike-probe-room"}',
        token,
    )
    print(f"delete-room: HTTP {status} in {ms:.1f}ms ok={status == 200}")
    ok = ok and status == 200
    print("RESULT:", "PASS" if ok else "FAIL")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
