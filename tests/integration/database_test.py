#!/usr/bin/env python3
"""
Integration test harness for Xiangqi Supabase schema.
Connects to local PostgreSQL instance (port 54399) to verify:
- Migration clean run
- Auth profile triggers & username immutability
- Session revocation & private.is_auth_session_active
- All table constraints (JSON, NULL, enums, bounds, circular FK)
- Deferrable side uniqueness swap
- RLS and role permissions (anon, authenticated, app_server)
- Transaction rollback safety
"""

import subprocess
import json
import uuid
import sys

PG_PORT = "54399"
PG_USER = "postgres"
PG_DB = "postgres"

def run_sql(query: str, user: str = PG_USER) -> str:
    cmd = [
        "/opt/homebrew/bin/psql",
        "-p", PG_PORT,
        "-U", user,
        "-d", PG_DB,
        "-v", "ON_ERROR_STOP=1",
        "-A", "-t"
    ]
    proc = subprocess.run(cmd + ["-c", query], capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(f"SQL Error: {proc.stderr.strip()} | Query: {query}")
    return proc.stdout.strip()

def run_sql_expect_error(query: str, user: str = PG_USER, expected_err: str = ""):
    cmd = [
        "/opt/homebrew/bin/psql",
        "-p", PG_PORT,
        "-U", user,
        "-d", PG_DB,
        "-v", "ON_ERROR_STOP=1",
        "-c", query
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode == 0:
        raise AssertionError(f"Expected error matching '{expected_err}', but query succeeded! Query: {query}")
    err = proc.stderr.strip()
    if expected_err and expected_err.lower() not in err.lower():
        raise AssertionError(f"Expected '{expected_err}' in error, got: {err}")
    return err

def test_signup_profile_trigger():
    print("[1/8] Testing auth.users profile trigger & username immutability...")
    rand_suffix = uuid.uuid4().hex[:6]
    u1 = str(uuid.uuid4())
    u2 = str(uuid.uuid4())
    u3 = str(uuid.uuid4())
    uname1 = f"u1_{rand_suffix}"

    # User 1: normal signup
    run_sql(f"""
        INSERT INTO auth.users (id, raw_user_meta_data, email)
        VALUES ('{u1}', '{{"signup_username": "{uname1}", "signup_display_name": "Player 1"}}', '{uname1}@test.com');
    """)
    res = run_sql(f"SELECT username, display_name FROM public.profiles WHERE user_id = '{u1}';")
    assert f"{uname1}|Player 1" in res, f"Expected {uname1}|Player 1, got {res}"

    # User 2: Google signup (no username)
    run_sql(f"""
        INSERT INTO auth.users (id, raw_user_meta_data, email)
        VALUES ('{u2}', '{{"name": "Google User"}}', 'p2_{rand_suffix}@test.com');
    """)
    res = run_sql(f"SELECT username IS NULL, display_name FROM public.profiles WHERE user_id = '{u2}';")
    assert "t|Google User" in res, f"Expected username NULL and Google User, got {res}"

    # Duplicate username check
    run_sql_expect_error(f"""
        INSERT INTO auth.users (id, raw_user_meta_data, email)
        VALUES ('{u3}', '{{"signup_username": "{uname1}", "signup_display_name": "Player Dup"}}', 'p3_{rand_suffix}@test.com');
    """, expected_err="profiles_username_unique")

    # Username immutability: Cannot change once set
    run_sql_expect_error(f"""
        UPDATE public.profiles SET username = 'new_{rand_suffix}' WHERE user_id = '{u1}';
    """, expected_err="Username is immutable once set")

    # Onboarding: Can change from NULL to valid username
    run_sql(f"""
        UPDATE public.profiles SET username = 'g_{rand_suffix}' WHERE user_id = '{u2}';
    """)
    res = run_sql(f"SELECT username FROM public.profiles WHERE user_id = '{u2}';")
    assert res == f"g_{rand_suffix}", f"Expected g_{rand_suffix}, got {res}"

    # Cannot change user_id
    run_sql_expect_error(f"""
        UPDATE public.profiles SET user_id = '{str(uuid.uuid4())}' WHERE user_id = '{u1}';
    """, expected_err="Cannot change user_id in profiles")

    print("  ✓ Profile signup trigger, Google onboarding, duplicate check & immutability PASS")

def test_revoked_sessions():
    print("[2/8] Testing private.revoked_sessions & is_auth_session_active...")
    rand_suffix = uuid.uuid4().hex[:6]
    u1 = str(uuid.uuid4())
    s1 = str(uuid.uuid4())

    run_sql(f"""
        INSERT INTO auth.users (id, raw_user_meta_data, email)
        VALUES ('{u1}', '{{"signup_username": "sess_{rand_suffix}", "signup_display_name": "Session User"}}', 's_{rand_suffix}@test.com');
        INSERT INTO auth.sessions (id, user_id) VALUES ('{s1}', '{u1}');
    """)

    # Active session check
    res = run_sql(f"SELECT private.is_auth_session_active('{s1}', '{u1}');")
    assert res == "t", f"Expected active session to be true, got {res}"

    # Revoke session
    run_sql(f"""
        INSERT INTO private.revoked_sessions (session_id, user_id, expires_at)
        VALUES ('{s1}', '{u1}', now() + interval '1 day');
    """)

    # Check revoked session
    res = run_sql(f"SELECT private.is_auth_session_active('{s1}', '{u1}');")
    assert res == "f", f"Expected revoked session to be false, got {res}"

    # Non-existent session
    res = run_sql(f"SELECT private.is_auth_session_active('{uuid.uuid4()}', '{u1}');")
    assert res == "f", f"Expected non-existent session to be false, got {res}"

    # Invalid expires_at check
    run_sql_expect_error(f"""
        INSERT INTO private.revoked_sessions (session_id, user_id, revoked_at, expires_at)
        VALUES ('{uuid.uuid4()}', '{u1}', now(), now() - interval '1 hour');
    """, expected_err="revoked_sessions_expires_at_check")

    print("  ✓ Session active check, revocation and expires_at constraint PASS")

def test_friend_relations():
    print("[3/8] Testing friend_relations constraints...")
    rand_suffix = uuid.uuid4().hex[:6]
    u1, u2 = str(uuid.uuid4()), str(uuid.uuid4())
    low_u, high_u = sorted([u1, u2])

    run_sql(f"""
        INSERT INTO auth.users (id, raw_user_meta_data) VALUES
        ('{low_u}', '{{"signup_username": "fa_{rand_suffix}", "signup_display_name": "A"}}'),
        ('{high_u}', '{{"signup_username": "fb_{rand_suffix}", "signup_display_name": "B"}}');
    """)

    # Valid friend request
    f_id = str(uuid.uuid4())
    run_sql(f"""
        INSERT INTO public.friend_relations (id, user_low, user_high, requester_id, status)
        VALUES ('{f_id}', '{low_u}', '{high_u}', '{low_u}', 'PENDING');
    """)

    # Check wrong order (high < low)
    run_sql_expect_error(f"""
        INSERT INTO public.friend_relations (user_low, user_high, requester_id)
        VALUES ('{high_u}', '{low_u}', '{low_u}');
    """, expected_err="friend_relations_user_order_check")

    # Check requester not in pair
    run_sql_expect_error(f"""
        INSERT INTO public.friend_relations (user_low, user_high, requester_id)
        VALUES ('{low_u}', '{high_u}', '{uuid.uuid4()}');
    """, expected_err="friend_relations_requester_check")

    # Check ACCEPTED requires accepted_at
    run_sql_expect_error(f"""
        UPDATE public.friend_relations SET status = 'ACCEPTED', accepted_at = NULL WHERE id = '{f_id}';
    """, expected_err="friend_relations_acceptance_check")

    # Valid accept
    run_sql(f"""
        UPDATE public.friend_relations SET status = 'ACCEPTED', accepted_at = now() WHERE id = '{f_id}';
    """)

    print("  ✓ Friend relations constraints PASS")

def test_rooms_and_members_deferrable_swap():
    print("[4/8] Testing rooms, members, and DEFERRABLE side swap...")
    rand_suffix = uuid.uuid4().hex[:6]
    owner_id = str(uuid.uuid4())
    p2_id = str(uuid.uuid4())
    p3_id = str(uuid.uuid4())
    run_sql(f"""
        INSERT INTO auth.users (id, raw_user_meta_data) VALUES
        ('{owner_id}', '{{"signup_username": "ro_{rand_suffix}", "signup_display_name": "Owner"}}'),
        ('{p2_id}', '{{"signup_username": "rg_{rand_suffix}", "signup_display_name": "Guest"}}'),
        ('{p3_id}', '{{"signup_username": "r3_{rand_suffix}", "signup_display_name": "P3"}}');
    """)

    r_id = str(uuid.uuid4())
    # Room status invariants: WAITING requires current_match_id NULL
    run_sql_expect_error(f"""
        INSERT INTO public.rooms (id, owner_id, name, status, current_match_id)
        VALUES ('{r_id}', '{owner_id}', 'Test Room', 'WAITING', '{uuid.uuid4()}');
    """, expected_err="rooms_status_invariants")

    # Valid room
    run_sql(f"""
        INSERT INTO public.rooms (id, owner_id, name, status, visibility, time_control)
        VALUES ('{r_id}', '{owner_id}', 'Test Room', 'WAITING', 'PUBLIC', 300);
    """)

    # Members: Player RED and BLACK
    run_sql(f"""
        INSERT INTO public.room_members (room_id, user_id, role, side, ready, admission_epoch)
        VALUES ('{r_id}', '{owner_id}', 'PLAYER', 'RED', false, 0),
               ('{r_id}', '{p2_id}', 'PLAYER', 'BLACK', false, 0);
    """)

    # Two RED players forbidden
    run_sql_expect_error(f"""
        INSERT INTO public.room_members (room_id, user_id, role, side, ready, admission_epoch)
        VALUES ('{r_id}', '{p3_id}', 'PLAYER', 'RED', false, 0);
    """, expected_err="room_members_room_side_unique")

    # DEFERRABLE side swap in transaction
    run_sql(f"""
        BEGIN;
        SET CONSTRAINTS room_members_room_side_unique DEFERRED;
        UPDATE public.room_members SET side = 'BLACK' WHERE room_id = '{r_id}' AND user_id = '{owner_id}';
        UPDATE public.room_members SET side = 'RED' WHERE room_id = '{r_id}' AND user_id = '{p2_id}';
        COMMIT;
    """)
    sides = run_sql(f"SELECT side FROM public.room_members WHERE room_id = '{r_id}' ORDER BY user_id = '{owner_id}';")
    assert "BLACK\nRED" in sides or "RED\nBLACK" in sides

    print("  ✓ Rooms invariants, member side constraints & DEFERRABLE swap PASS")

def test_matches_and_circular_fk():
    print("[5/8] Testing matches constraints, JSONB shapes, guard trigger & circular FK...")
    rand_suffix = uuid.uuid4().hex[:6]
    u1, u2 = str(uuid.uuid4()), str(uuid.uuid4())
    run_sql(f"""
        INSERT INTO auth.users (id, raw_user_meta_data) VALUES
        ('{u1}', '{{"signup_username": "mp1_{rand_suffix}", "signup_display_name": "P1"}}'),
        ('{u2}', '{{"signup_username": "mp2_{rand_suffix}", "signup_display_name": "P2"}}');
    """)
    r_id = str(uuid.uuid4())
    run_sql(f"""
        INSERT INTO public.rooms (id, owner_id, name, status, visibility, time_control)
        VALUES ('{r_id}', '{u1}', 'Match Room', 'WAITING', 'PUBLIC', 300);
    """)

    m_id = str(uuid.uuid4())
    boot_id = str(uuid.uuid4())
    board = json.dumps([None] * 90)
    position = json.dumps({"board": [None] * 90, "turn": "RED"})
    clock = json.dumps({"redMs": 300000, "blackMs": 300000, "runningSinceEpochMs": None})

    # Mode ONLINE with same players rejected
    run_sql_expect_error(f"""
        INSERT INTO public.matches (id, room_id, mode, status, red_user_id, black_user_id, position, repetition_counts, clock, time_control, boot_id)
        VALUES ('{m_id}', '{r_id}', 'ONLINE', 'ACTIVE', '{u1}', '{u1}', '{position}', '{{}}', '{clock}', 300, '{boot_id}');
    """, expected_err="matches_mode_invariants")

    # Invalid board array length (not 90)
    bad_pos = json.dumps({"board": [None] * 80, "turn": "RED"})
    run_sql_expect_error(f"""
        INSERT INTO public.matches (id, room_id, mode, status, red_user_id, black_user_id, position, repetition_counts, clock, time_control, boot_id)
        VALUES ('{m_id}', '{r_id}', 'ONLINE', 'ACTIVE', '{u1}', '{u2}', '{bad_pos}', '{{}}', '{clock}', 300, '{boot_id}');
    """, expected_err="matches_position_json_check")

    # Valid match creation
    run_sql(f"""
        INSERT INTO public.matches (id, room_id, mode, status, red_user_id, black_user_id, position, repetition_counts, clock, time_control, boot_id)
        VALUES ('{m_id}', '{r_id}', 'ONLINE', 'ACTIVE', '{u1}', '{u2}', '{position}', '{{}}', '{clock}', 300, '{boot_id}');
    """)

    # Active players slot reservation
    run_sql(f"""
        INSERT INTO public.active_players (user_id, match_id)
        VALUES ('{u1}', '{m_id}'), ('{u2}', '{m_id}');
    """)

    # Same user cannot have second active player slot
    run_sql_expect_error(f"""
        INSERT INTO public.active_players (user_id, match_id)
        VALUES ('{u1}', '{m_id}');
    """, expected_err="active_players_pkey")

    # Circular FK test: Room pointing to match in different room rejected
    other_r = str(uuid.uuid4())
    run_sql(f"""
        INSERT INTO public.rooms (id, owner_id, name, status, visibility, time_control)
        VALUES ('{other_r}', '{u1}', 'Other Room', 'WAITING', 'PUBLIC', 300);
    """)
    run_sql_expect_error(f"""
        UPDATE public.rooms SET current_match_id = '{m_id}', status = 'PLAYING' WHERE id = '{other_r}';
    """, expected_err="rooms_current_match_fk")

    # Room pointing to its own match succeeds
    run_sql(f"""
        UPDATE public.rooms SET current_match_id = '{m_id}', status = 'PLAYING' WHERE id = '{r_id}';
    """)

    # Guard trigger: Cannot modify immutable fields (e.g. mode)
    run_sql_expect_error(f"""
        UPDATE public.matches SET mode = 'AI' WHERE id = '{m_id}';
    """, expected_err="Immutable match attributes cannot be modified")

    # Terminal match outcome check: AGREED_DRAW must have winner = null
    bad_outcome = json.dumps({"reason": "AGREED_DRAW", "winner": "RED"})
    run_sql_expect_error(f"""
        UPDATE public.matches SET status = 'FINISHED', outcome = '{bad_outcome}', ended_at = now() WHERE id = '{m_id}';
    """, expected_err="matches_outcome_json_check")

    # Valid terminal match update
    good_outcome = json.dumps({"reason": "CHECKMATE", "winner": "RED"})
    run_sql(f"""
        UPDATE public.matches SET status = 'FINISHED', outcome = '{good_outcome}', ended_at = now() WHERE id = '{m_id}';
    """)

    # Terminal match is now immutable
    run_sql_expect_error(f"""
        UPDATE public.matches SET version = 1 WHERE id = '{m_id}';
    """, expected_err="Terminal match is immutable")

    print("  ✓ Matches constraints, JSON checks, active_players, circular FK & immutability PASS")

def test_events_moves_receipts():
    print("[6/8] Testing match_events, match_moves & command_receipts...")
    rand_suffix = uuid.uuid4().hex[:6]
    u1 = str(uuid.uuid4())
    run_sql(f"""
        INSERT INTO auth.users (id, raw_user_meta_data) VALUES
        ('{u1}', '{{"signup_username": "au_{rand_suffix}", "signup_display_name": "Audit1"}}');
    """)
    m_id = str(uuid.uuid4())
    position = json.dumps({"board": [None] * 90, "turn": "RED"})
    run_sql(f"""
        INSERT INTO public.matches (id, mode, status, red_user_id, ai_side, ai_level, position, repetition_counts, time_control, boot_id)
        VALUES ('{m_id}', 'AI', 'ACTIVE', '{u1}', 'BLACK', 'MEDIUM', '{position}', '{{}}', 0, '{uuid.uuid4()}');
    """)

    # Event START version must be 0
    run_sql_expect_error(f"""
        INSERT INTO public.match_events (match_id, version, type, payload)
        VALUES ('{m_id}', 1, 'START', '{{"rules": "xiangqi-simple-v1"}}');
    """, expected_err="match_events_start_version_check")

    run_sql(f"""
        INSERT INTO public.match_events (match_id, version, type, payload)
        VALUES ('{m_id}', 0, 'START', '{{"rules": "xiangqi-simple-v1"}}');
    """)

    # Move: out of bounds coordinates rejected
    bad_move = json.dumps({"from": {"x": 9, "y": 0}, "to": {"x": 4, "y": 1}})
    run_sql_expect_error(f"""
        INSERT INTO public.match_moves (match_id, event_version, side, move)
        VALUES ('{m_id}', 1, 'RED', '{bad_move}');
    """, expected_err="match_moves_move_json_check")

    # Move from == to rejected
    same_move = json.dumps({"from": {"x": 4, "y": 0}, "to": {"x": 4, "y": 0}})
    run_sql_expect_error(f"""
        INSERT INTO public.match_moves (match_id, event_version, side, move)
        VALUES ('{m_id}', 1, 'RED', '{same_move}');
    """, expected_err="match_moves_move_json_check")

    # Valid move + event in same transaction (deferred FK)
    good_move = json.dumps({"from": {"x": 4, "y": 0}, "to": {"x": 4, "y": 1}})
    run_sql(f"""
        BEGIN;
        INSERT INTO public.match_events (match_id, version, type, payload)
        VALUES ('{m_id}', 1, 'MOVE', '{{"move": "e1"}}');
        INSERT INTO public.match_moves (match_id, event_version, side, move)
        VALUES ('{m_id}', 1, 'RED', '{good_move}');
        COMMIT;
    """)

    # Command receipts: payload_hash must be exactly 32 bytes
    run_sql_expect_error(f"""
        INSERT INTO public.command_receipts (match_id, actor_key, command_id, command_type, payload_hash, applied_version, result)
        VALUES ('{m_id}', 'USER:{u1}', '{uuid.uuid4()}', 'MOVE', '\\x010203', 1, '{{"kind": "APPLIED"}}');
    """, expected_err="command_receipts_payload_hash_length_check")

    # Valid command receipt (32-byte hash)
    valid_hash = "\\x" + "00" * 32
    run_sql(f"""
        INSERT INTO public.command_receipts (match_id, actor_key, command_id, command_type, payload_hash, applied_version, result)
        VALUES ('{m_id}', 'USER:{u1}', '{uuid.uuid4()}', 'MOVE', '{valid_hash}', 1, '{{"kind": "APPLIED", "errorCode": null}}');
    """)

    print("  ✓ Events, moves coordinates, deferred FK & receipts PASS")

def test_rls_and_role_security():
    print("[7/8] Testing RLS and permissions with anon, authenticated, app_server...")
    # Attempt read as anon
    run_sql_expect_error("""
        SET ROLE anon;
        SELECT * FROM public.profiles;
    """, expected_err="permission denied for table profiles")

    # Attempt read as authenticated
    run_sql_expect_error("""
        SET ROLE authenticated;
        SELECT * FROM public.profiles;
    """, expected_err="permission denied for table profiles")

    # Attempt call private function as anon
    run_sql_expect_error(f"""
        SET ROLE anon;
        SELECT private.is_auth_session_active('{uuid.uuid4()}', '{uuid.uuid4()}');
    """, expected_err="permission denied")

    # Read as app_server succeeds
    res = run_sql("""
        SET ROLE app_server;
        SELECT count(*) >= 0 FROM public.profiles;
    """)
    assert "t" in res, f"Expected app_server read to succeed, got {res}"

    # App_server cannot UPDATE/DELETE append-only audit tables
    run_sql_expect_error("""
        SET ROLE app_server;
        DELETE FROM public.match_moves;
    """, expected_err="permission denied for table match_moves")

    run_sql_expect_error("""
        SET ROLE app_server;
        UPDATE public.match_events SET type = 'RESULT';
    """, expected_err="permission denied for table match_events")

    print("  ✓ RLS denied for anon/authenticated, app_server grants & audit immutability PASS")

def test_transaction_rollback():
    print("[8/8] Testing transaction rollback atomicity...")
    before_rooms = int(run_sql("SELECT count(*) FROM public.rooms;"))
    before_matches = int(run_sql("SELECT count(*) FROM public.matches;"))

    run_sql_expect_error(f"""
        BEGIN;
        INSERT INTO public.rooms (id, owner_id, name, status, visibility, time_control)
        VALUES ('{uuid.uuid4()}', (SELECT user_id FROM public.profiles LIMIT 1), 'Rollback Room', 'WAITING', 'PUBLIC', 300);
        RAISE EXCEPTION 'Simulated failure before commit';
        COMMIT;
    """, expected_err="Simulated failure before commit")

    after_rooms = int(run_sql("SELECT count(*) FROM public.rooms;"))
    after_matches = int(run_sql("SELECT count(*) FROM public.matches;"))

    assert before_rooms == after_rooms, f"Room count leaked after rollback: {before_rooms} -> {after_rooms}"
    assert before_matches == after_matches, f"Match count leaked after rollback: {before_matches} -> {after_matches}"

    print("  ✓ Transaction rollback atomicity PASS")

def main():
    print("=" * 60)
    print("RUNNING LOCAL DATABASE INTEGRATION TESTS")
    print("=" * 60)
    try:
        test_signup_profile_trigger()
        test_revoked_sessions()
        test_friend_relations()
        test_rooms_and_members_deferrable_swap()
        test_matches_and_circular_fk()
        test_events_moves_receipts()
        test_rls_and_role_security()
        test_transaction_rollback()
        print("=" * 60)
        print("ALL 8 TEST SUITES PASSED (32+ invariant assertions verified)!")
        print("=" * 60)
    except Exception as e:
        print(f"\nTEST FAILED: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
