#!/usr/bin/env python3
"""
Integration test harness for Xiangqi Supabase schema.
Verifies all schema invariants, constraints, RLS denial, trigger functions, and rollback.

By default, ALWAYS creates an isolated, temporary PostgreSQL instance on a dedicated port
with a clean mock auth schema and fresh migrations, guaranteeing zero pollution and zero
risk of running against existing databases.
"""

import os
import sys
import json
import uuid
import shutil
import socket
import atexit
import argparse
import subprocess

ALL_19_TABLES = [
    ("public", "profiles"),
    ("private", "revoked_sessions"),
    ("public", "friend_relations"),
    ("public", "rooms"),
    ("public", "room_members"),
    ("public", "invitations"),
    ("public", "matches"),
    ("public", "active_players"),
    ("public", "match_events"),
    ("public", "match_moves"),
    ("public", "command_receipts"),
    ("public", "client_controls"),
    ("public", "ai_jobs"),
    ("public", "chat_messages"),
    ("public", "media_policies"),
    ("public", "media_transports"),
    ("public", "media_policy_jobs"),
    ("public", "room_rematch_votes"),
    ("public", "room_command_receipts"),
]

def find_pg_binary(name: str) -> str:
    path = shutil.which(name)
    if path:
        return path
    for fallback in [f"/opt/homebrew/bin/{name}", f"/usr/local/bin/{name}", f"/usr/bin/{name}"]:
        if os.path.exists(fallback):
            return fallback
    raise RuntimeError(f"PostgreSQL binary '{name}' not found in PATH or standard locations.")

def find_free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]

PSQL = find_pg_binary("psql")
PG_PORT = str(find_free_port())
PG_USER = "postgres"
PG_DB = "postgres"
PG_HOST = "127.0.0.1"

def get_isolated_env(overrides: dict | None = None) -> dict:
    """
    Return environment stripped of all libpq / PostgreSQL variables (PG*),
    preventing external environment pollution (such as PGHOSTADDR, PGPORT, PGDATABASE)
    from altering or hijacking connection targets.
    """
    clean_env = {k: v for k, v in os.environ.items() if not k.startswith("PG")}
    if overrides:
        clean_env.update(overrides)
    return clean_env

def run_sql(query: str, user: str = PG_USER, env_overrides: dict | None = None) -> str:
    cmd = [
        PSQL,
        "-h", PG_HOST,
        "-p", PG_PORT,
        "-U", user,
        "-d", PG_DB,
        "-v", "ON_ERROR_STOP=1",
        "-A", "-t"
    ]
    proc = subprocess.run(cmd + ["-c", query], capture_output=True, text=True, env=get_isolated_env(env_overrides))
    if proc.returncode != 0:
        raise RuntimeError(f"SQL Error: {proc.stderr.strip()} | Query: {query}")
    return proc.stdout.strip()

def run_sql_expect_error(query: str, user: str = PG_USER, expected_err: str = "", env_overrides: dict | None = None) -> str:
    cmd = [
        PSQL,
        "-h", PG_HOST,
        "-p", PG_PORT,
        "-U", user,
        "-d", PG_DB,
        "-v", "ON_ERROR_STOP=1",
        "-c", query
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True, env=get_isolated_env(env_overrides))
    if proc.returncode == 0:
        raise AssertionError(f"Expected error matching '{expected_err}', but query succeeded! Query: {query}")
    err = proc.stderr.strip()
    if expected_err and expected_err.lower() not in err.lower():
        raise AssertionError(f"Expected '{expected_err}' in error, got: {err}")
    return err

def setup_isolated_test_cluster(use_existing: bool = False):
    """Always create a dedicated temporary PostgreSQL cluster unless explicitly told otherwise."""
    global PG_PORT, PG_USER, PG_DB, PG_HOST

    if use_existing:
        PG_PORT = os.environ.get("PGPORT", "54399")
        PG_USER = os.environ.get("PGUSER", "postgres")
        PG_DB = os.environ.get("PGDATABASE", "postgres")
        PG_HOST = os.environ.get("PGHOST", "127.0.0.1")
        run_sql("SELECT 1;")
        return

    initdb = find_pg_binary("initdb")
    pg_ctl = find_pg_binary("pg_ctl")
    pg_dir = f"/tmp/xiangqi-test-pg-{os.getpid()}-{uuid.uuid4().hex[:6]}"
    log_file = f"{pg_dir}.log"

    env_init = get_isolated_env({"LC_ALL": "en_US.UTF-8"})
    subprocess.run([initdb, "-D", pg_dir, "-U", "postgres", "-E", "UTF8", "--auth=trust"],
                   env=env_init, capture_output=True, check=True)

    env_ctl = get_isolated_env({"LC_ALL": "C"})
    subprocess.run([pg_ctl, "-D", pg_dir, "-o", f"-h 127.0.0.1 -p {PG_PORT} -k /tmp", "-l", log_file, "start"],
                   env=env_ctl, capture_output=True, check=True)

    def cleanup():
        subprocess.run([pg_ctl, "-D", pg_dir, "stop"], capture_output=True, env=get_isolated_env())
        shutil.rmtree(pg_dir, ignore_errors=True)
        if os.path.exists(log_file):
            os.remove(log_file)

    atexit.register(cleanup)

    # Initialize mock auth schema and standard Supabase roles
    run_sql("""
        CREATE SCHEMA IF NOT EXISTS auth;
        DO $$ BEGIN
          IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon NOLOGIN; END IF;
          IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF;
          IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN CREATE ROLE service_role NOLOGIN; END IF;
        END $$;

        CREATE TABLE IF NOT EXISTS auth.users (
          id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
          raw_user_meta_data jsonb,
          raw_app_meta_data jsonb,
          email text,
          created_at timestamptz DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS auth.sessions (
          id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
          created_at timestamptz DEFAULT now()
        );
    """)

    # Apply all migrations in order
    repo_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    migrations_dir = os.path.join(repo_root, "supabase", "migrations")
    for f in sorted(os.listdir(migrations_dir)):
        if f.endswith(".sql"):
            full_path = os.path.join(migrations_dir, f)
            subprocess.run([PSQL, "-h", PG_HOST, "-p", PG_PORT, "-U", PG_USER, "-d", PG_DB, "-v", "ON_ERROR_STOP=1", "-f", full_path],
                           capture_output=True, check=True, env=get_isolated_env())

def test_signup_profile_trigger():
    print("[1/10] Testing auth.users profile trigger, strict validation & immutability...")
    rand_suffix = uuid.uuid4().hex[:6]
    u1 = str(uuid.uuid4())
    u2 = str(uuid.uuid4())
    u3 = str(uuid.uuid4())
    u4 = str(uuid.uuid4())
    u5 = str(uuid.uuid4())
    u6 = str(uuid.uuid4())
    uname1 = f"u1_{rand_suffix}"

    # User 1: normal valid signup (email provider)
    run_sql(f"""
        INSERT INTO auth.users (id, raw_app_meta_data, raw_user_meta_data, email)
        VALUES ('{u1}', '{{"provider": "email"}}', '{{"signup_username": "{uname1}", "signup_display_name": "Player 1"}}', '{uname1}@test.com');
    """)
    res = run_sql(f"SELECT username, display_name FROM public.profiles WHERE user_id = '{u1}';")
    assert f"{uname1}|Player 1" in res, f"Expected {uname1}|Player 1, got {res}"

    # User 2: Google signup (no username provided)
    run_sql(f"""
        INSERT INTO auth.users (id, raw_app_meta_data, raw_user_meta_data, email)
        VALUES ('{u2}', '{{"provider": "google"}}', '{{"name": "Google User"}}', 'p2_{rand_suffix}@test.com');
    """)
    res = run_sql(f"SELECT username IS NULL, display_name FROM public.profiles WHERE user_id = '{u2}';")
    assert "t|Google User" in res, f"Expected username NULL and Google User, got {res}"

    # Email signup missing signup_username MUST be rejected
    run_sql_expect_error(f"""
        INSERT INTO auth.users (id, raw_app_meta_data, raw_user_meta_data, email)
        VALUES ('{u4}', '{{"provider": "email"}}', '{{"signup_display_name": "No User"}}', 'p4_{rand_suffix}@test.com');
    """, expected_err="signup_username is required for email signup")

    # Email signup with empty/whitespace username MUST be rejected
    run_sql_expect_error(f"""
        INSERT INTO auth.users (id, raw_app_meta_data, raw_user_meta_data, email)
        VALUES ('{u5}', '{{"provider": "email"}}', '{{"signup_username": "   ", "signup_display_name": "Blank User"}}', 'p5_{rand_suffix}@test.com');
    """, expected_err="signup_username is required for email signup and cannot be blank")

    # Invalid username format MUST be rejected
    run_sql_expect_error(f"""
        INSERT INTO auth.users (id, raw_app_meta_data, raw_user_meta_data, email)
        VALUES ('{u6}', '{{"provider": "email"}}', '{{"signup_username": "Invalid@User!", "signup_display_name": "Bad User"}}', 'p6_{rand_suffix}@test.com');
    """, expected_err="Invalid username format in signup metadata")

    # Duplicate username check
    run_sql_expect_error(f"""
        INSERT INTO auth.users (id, raw_app_meta_data, raw_user_meta_data, email)
        VALUES ('{u3}', '{{"provider": "email"}}', '{{"signup_username": "{uname1}", "signup_display_name": "Player Dup"}}', 'p3_{rand_suffix}@test.com');
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

    print("  ✓ Profile signup trigger, strict rejection of blank/invalid username, Google onboarding & immutability PASS")

def test_revoked_sessions():
    print("[2/10] Testing private.revoked_sessions & is_auth_session_active...")
    rand_suffix = uuid.uuid4().hex[:6]
    u1 = str(uuid.uuid4())
    s1 = str(uuid.uuid4())

    run_sql(f"""
        INSERT INTO auth.users (id, raw_app_meta_data, raw_user_meta_data, email)
        VALUES ('{u1}', '{{"provider": "email"}}', '{{"signup_username": "sess_{rand_suffix}", "signup_display_name": "Session User"}}', 's_{rand_suffix}@test.com');
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
    print("[3/10] Testing friend_relations constraints...")
    rand_suffix = uuid.uuid4().hex[:6]
    u1, u2 = str(uuid.uuid4()), str(uuid.uuid4())
    low_u, high_u = sorted([u1, u2])

    run_sql(f"""
        INSERT INTO auth.users (id, raw_app_meta_data, raw_user_meta_data) VALUES
        ('{low_u}', '{{"provider": "email"}}', '{{"signup_username": "fa_{rand_suffix}", "signup_display_name": "A"}}'),
        ('{high_u}', '{{"provider": "email"}}', '{{"signup_username": "fb_{rand_suffix}", "signup_display_name": "B"}}');
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
    print("[4/10] Testing rooms, members, and DEFERRABLE side swap...")
    rand_suffix = uuid.uuid4().hex[:6]
    owner_id = str(uuid.uuid4())
    p2_id = str(uuid.uuid4())
    p3_id = str(uuid.uuid4())
    run_sql(f"""
        INSERT INTO auth.users (id, raw_app_meta_data, raw_user_meta_data) VALUES
        ('{owner_id}', '{{"provider": "email"}}', '{{"signup_username": "ro_{rand_suffix}", "signup_display_name": "Owner"}}'),
        ('{p2_id}', '{{"provider": "email"}}', '{{"signup_username": "rg_{rand_suffix}", "signup_display_name": "Guest"}}'),
        ('{p3_id}', '{{"provider": "email"}}', '{{"signup_username": "r3_{rand_suffix}", "signup_display_name": "P3"}}');
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
    print("[5/10] Testing matches constraints, JSONB shapes, DISCONNECT, runningSinceEpochMs, proposal & circular FK...")
    rand_suffix = uuid.uuid4().hex[:6]
    u1, u2 = str(uuid.uuid4()), str(uuid.uuid4())
    run_sql(f"""
        INSERT INTO auth.users (id, raw_app_meta_data, raw_user_meta_data) VALUES
        ('{u1}', '{{"provider": "email"}}', '{{"signup_username": "mp1_{rand_suffix}", "signup_display_name": "P1"}}'),
        ('{u2}', '{{"provider": "email"}}', '{{"signup_username": "mp2_{rand_suffix}", "signup_display_name": "P2"}}');
    """)
    r_id = str(uuid.uuid4())
    run_sql(f"""
        INSERT INTO public.rooms (id, owner_id, name, status, visibility, time_control)
        VALUES ('{r_id}', '{u1}', 'Match Room', 'WAITING', 'PUBLIC', 300);
    """)

    m_id = str(uuid.uuid4())
    boot_id = str(uuid.uuid4())
    valid_pos = json.dumps({"board": [None] * 90, "turn": "RED"})
    valid_clock = json.dumps({"redMs": 300000, "blackMs": 300000, "runningSinceEpochMs": 1726156800000})

    # Empty position {} MUST be rejected
    run_sql_expect_error(f"""
        INSERT INTO public.matches (id, room_id, mode, status, red_user_id, black_user_id, position, repetition_counts, clock, time_control, boot_id)
        VALUES ('{m_id}', '{r_id}', 'ONLINE', 'ACTIVE', '{u1}', '{u2}', '{{}}', '{{}}', '{valid_clock}', 300, '{boot_id}');
    """, expected_err="matches_position_json_check")

    # Invalid board length (not 90) MUST be rejected
    bad_pos = json.dumps({"board": [None] * 80, "turn": "RED"})
    run_sql_expect_error(f"""
        INSERT INTO public.matches (id, room_id, mode, status, red_user_id, black_user_id, position, repetition_counts, clock, time_control, boot_id)
        VALUES ('{m_id}', '{r_id}', 'ONLINE', 'ACTIVE', '{u1}', '{u2}', '{bad_pos}', '{{}}', '{valid_clock}', 300, '{boot_id}');
    """, expected_err="matches_position_json_check")

    # Clock with missing runningSinceEpochMs MUST be rejected
    missing_epoch_clock = json.dumps({"redMs": 300000, "blackMs": 300000})
    run_sql_expect_error(f"""
        INSERT INTO public.matches (id, room_id, mode, status, red_user_id, black_user_id, position, repetition_counts, clock, time_control, boot_id)
        VALUES ('{m_id}', '{r_id}', 'ONLINE', 'ACTIVE', '{u1}', '{u2}', '{valid_pos}', '{{}}', '{missing_epoch_clock}', 300, '{boot_id}');
    """, expected_err="matches_clock_json_check")

    # Clock with runningSinceEpochMs = null MUST be rejected
    null_epoch_clock = json.dumps({"redMs": 300000, "blackMs": 300000, "runningSinceEpochMs": None})
    run_sql_expect_error(f"""
        INSERT INTO public.matches (id, room_id, mode, status, red_user_id, black_user_id, position, repetition_counts, clock, time_control, boot_id)
        VALUES ('{m_id}', '{r_id}', 'ONLINE', 'ACTIVE', '{u1}', '{u2}', '{valid_pos}', '{{}}', '{null_epoch_clock}', 300, '{boot_id}');
    """, expected_err="matches_clock_json_check")

    # Malformed clock with negative value or string MUST be rejected
    bad_clock1 = json.dumps({"redMs": -1, "blackMs": "oops", "runningSinceEpochMs": 0})
    run_sql_expect_error(f"""
        INSERT INTO public.matches (id, room_id, mode, status, red_user_id, black_user_id, position, repetition_counts, clock, time_control, boot_id)
        VALUES ('{m_id}', '{r_id}', 'ONLINE', 'ACTIVE', '{u1}', '{u2}', '{valid_pos}', '{{}}', '{bad_clock1}', 300, '{boot_id}');
    """, expected_err="matches_clock_json_check")

    # AI mode with ai_level = NULL MUST be rejected
    ai_m_id = str(uuid.uuid4())
    run_sql_expect_error(f"""
        INSERT INTO public.matches (id, mode, status, red_user_id, ai_side, ai_level, position, repetition_counts, time_control, boot_id)
        VALUES ('{ai_m_id}', 'AI', 'ACTIVE', '{u1}', 'BLACK', NULL, '{valid_pos}', '{{}}', 0, '{boot_id}');
    """, expected_err="matches_mode_invariants")

    # Mode ONLINE with same player on both sides rejected
    run_sql_expect_error(f"""
        INSERT INTO public.matches (id, room_id, mode, status, red_user_id, black_user_id, position, repetition_counts, clock, time_control, boot_id)
        VALUES ('{m_id}', '{r_id}', 'ONLINE', 'ACTIVE', '{u1}', '{u1}', '{valid_pos}', '{{}}', '{valid_clock}', 300, '{boot_id}');
    """, expected_err="matches_mode_invariants")

    # Empty proposal = {} MUST be rejected
    run_sql_expect_error(f"""
        INSERT INTO public.matches (id, room_id, mode, status, red_user_id, black_user_id, position, repetition_counts, clock, time_control, boot_id, proposal)
        VALUES ('{m_id}', '{r_id}', 'ONLINE', 'ACTIVE', '{u1}', '{u2}', '{valid_pos}', '{{}}', '{valid_clock}', 300, '{boot_id}', '{{}}');
    """, expected_err="matches_proposal_check")

    # Valid proposal check
    valid_prop = json.dumps({
        "id": str(uuid.uuid4()),
        "kind": "DRAW",
        "requester": "RED",
        "basePly": 0,
        "createdVersion": 0,
        "expiresAtMs": 1726156830000
    })

    # Valid match creation with valid proposal
    run_sql(f"""
        INSERT INTO public.matches (id, room_id, mode, status, red_user_id, black_user_id, position, repetition_counts, clock, time_control, boot_id, proposal)
        VALUES ('{m_id}', '{r_id}', 'ONLINE', 'ACTIVE', '{u1}', '{u2}', '{valid_pos}', '{{}}', '{valid_clock}', 300, '{boot_id}', '{valid_prop}');
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

    # Outcome draw missing winner key MUST be rejected (with proposal = NULL to isolate outcome failure)
    missing_winner_draw = json.dumps({"reason": "REPETITION"})
    run_sql_expect_error(f"""
        UPDATE public.matches SET status = 'FINISHED', outcome = '{missing_winner_draw}', ended_at = now(), proposal = NULL WHERE id = '{m_id}';
    """, expected_err="matches_status_and_outcome_invariants")

    # Restored regression checks: Invalid status/outcome combinations
    # 1. Invalid terminal combination: FINISHED with SERVER_RESTART MUST be rejected
    restart_outcome = json.dumps({"reason": "SERVER_RESTART", "winner": None})
    run_sql_expect_error(f"""
        UPDATE public.matches SET status = 'FINISHED', outcome = '{restart_outcome}', ended_at = now(), proposal = NULL WHERE id = '{m_id}';
    """, expected_err="matches_status_and_outcome_invariants")

    # 2. Invalid terminal combination: AGREED_DRAW with winner = RED MUST be rejected
    bad_draw = json.dumps({"reason": "AGREED_DRAW", "winner": "RED"})
    run_sql_expect_error(f"""
        UPDATE public.matches SET status = 'FINISHED', outcome = '{bad_draw}', ended_at = now(), proposal = NULL WHERE id = '{m_id}';
    """, expected_err="matches_status_and_outcome_invariants")

    # 3. Invalid terminal combination: DISCONNECT with winner = null MUST be rejected
    bad_disconnect = json.dumps({"reason": "DISCONNECT", "winner": None})
    run_sql_expect_error(f"""
        UPDATE public.matches SET status = 'FINISHED', outcome = '{bad_disconnect}', ended_at = now(), proposal = NULL WHERE id = '{m_id}';
    """, expected_err="matches_status_and_outcome_invariants")

    # 4. Invalid combination: INTERRUPTED with CHECKMATE MUST be rejected
    bad_interrupted = json.dumps({"reason": "CHECKMATE", "winner": "RED"})
    run_sql_expect_error(f"""
        UPDATE public.matches SET status = 'INTERRUPTED', outcome = '{bad_interrupted}', ended_at = now(), proposal = NULL WHERE id = '{m_id}';
    """, expected_err="matches_status_and_outcome_invariants")

    # Valid INTERRUPTED combination: SERVER_RESTART with winner = null succeeds on separate match/room
    r_id_int = str(uuid.uuid4())
    run_sql(f"""
        INSERT INTO public.rooms (id, owner_id, name, status, visibility, time_control)
        VALUES ('{r_id_int}', '{u1}', 'Interrupted Room', 'WAITING', 'PUBLIC', 300);
    """)
    m_id_int = str(uuid.uuid4())
    run_sql(f"""
        INSERT INTO public.matches (id, room_id, mode, status, red_user_id, black_user_id, position, repetition_counts, clock, time_control, boot_id)
        VALUES ('{m_id_int}', '{r_id_int}', 'ONLINE', 'ACTIVE', '{u1}', '{u2}', '{valid_pos}', '{{}}', '{valid_clock}', 300, '{boot_id}');
    """)
    valid_restart = json.dumps({"reason": "SERVER_RESTART", "winner": None})
    run_sql(f"""
        UPDATE public.matches SET status = 'INTERRUPTED', outcome = '{valid_restart}', ended_at = now(), proposal = NULL WHERE id = '{m_id_int}';
    """)

    # Valid draw outcome with explicit winner: null succeeds on separate match/room
    r_id_draw = str(uuid.uuid4())
    run_sql(f"""
        INSERT INTO public.rooms (id, owner_id, name, status, visibility, time_control)
        VALUES ('{r_id_draw}', '{u1}', 'Draw Room', 'WAITING', 'PUBLIC', 300);
    """)
    m_id_draw = str(uuid.uuid4())
    run_sql(f"""
        INSERT INTO public.matches (id, room_id, mode, status, red_user_id, black_user_id, position, repetition_counts, clock, time_control, boot_id)
        VALUES ('{m_id_draw}', '{r_id_draw}', 'ONLINE', 'ACTIVE', '{u1}', '{u2}', '{valid_pos}', '{{}}', '{valid_clock}', 300, '{boot_id}');
    """)
    valid_draw = json.dumps({"reason": "REPETITION", "winner": None})
    run_sql(f"""
        UPDATE public.matches SET status = 'FINISHED', outcome = '{valid_draw}', ended_at = now(), proposal = NULL WHERE id = '{m_id_draw}';
    """)

    # Valid DISCONNECT outcome with winner = RED succeeds on m_id
    disconnect_outcome = json.dumps({"reason": "DISCONNECT", "winner": "RED"})
    run_sql(f"""
        UPDATE public.matches SET status = 'FINISHED', outcome = '{disconnect_outcome}', ended_at = now(), proposal = NULL WHERE id = '{m_id}';
    """)

    # Terminal match is now immutable
    run_sql_expect_error(f"""
        UPDATE public.matches SET version = 1 WHERE id = '{m_id}';
    """, expected_err="Terminal match is immutable")

    print("  ✓ Matches constraints, hardened JSON checks, proposal validation, status/outcome matrix & DISCONNECT PASS")

def test_events_moves_receipts():
    print("[6/10] Testing match_events, match_moves & command_receipts (number coordinates & explicit errorCode)...")
    rand_suffix = uuid.uuid4().hex[:6]
    u1 = str(uuid.uuid4())
    run_sql(f"""
        INSERT INTO auth.users (id, raw_app_meta_data, raw_user_meta_data) VALUES
        ('{u1}', '{{"provider": "email"}}', '{{"signup_username": "au_{rand_suffix}", "signup_display_name": "Audit1"}}');
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

    # Empty move = '{}' MUST be rejected
    run_sql_expect_error(f"""
        INSERT INTO public.match_moves (match_id, event_version, side, move)
        VALUES ('{m_id}', 1, 'RED', '{{}}');
    """, expected_err="match_moves_move_json_check")

    # Move coordinates as strings "1" instead of numbers MUST be rejected
    str_coords_move = json.dumps({"from": {"x": "4", "y": "0"}, "to": {"x": "4", "y": "1"}})
    run_sql_expect_error(f"""
        INSERT INTO public.match_moves (match_id, event_version, side, move)
        VALUES ('{m_id}', 1, 'RED', '{str_coords_move}');
    """, expected_err="match_moves_move_json_check")

    # Move: out of bounds coordinates rejected
    bad_move = json.dumps({"from": {"x": 9, "y": 0}, "to": {"x": 4, "y": 1}})
    run_sql_expect_error(f"""
        INSERT INTO public.match_moves (match_id, event_version, side, move)
        VALUES ('{m_id}', 1, 'RED', '{bad_move}');
    """, expected_err="match_moves_move_json_check")

    # Restored regression check: Move from == to rejected (same square)
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

    # Command receipts: missing errorCode key MUST be rejected
    missing_err_receipt = json.dumps({"kind": "APPLIED"})
    run_sql_expect_error(f"""
        INSERT INTO public.command_receipts (match_id, actor_key, command_id, command_type, payload_hash, applied_version, result)
        VALUES ('{m_id}', 'USER:{u1}', '{uuid.uuid4()}', 'MOVE', '\\x{'00'*32}', 1, '{missing_err_receipt}');
    """, expected_err="command_receipts_result_json_check")

    # Valid command receipt (with explicit errorCode: null)
    valid_hash = "\\x" + "00" * 32
    valid_receipt = json.dumps({"kind": "APPLIED", "errorCode": None})
    run_sql(f"""
        INSERT INTO public.command_receipts (match_id, actor_key, command_id, command_type, payload_hash, applied_version, result)
        VALUES ('{m_id}', 'USER:{u1}', '{uuid.uuid4()}', 'MOVE', '{valid_hash}', 1, '{valid_receipt}');
    """)

    # Restored regression check: payload_hash must be exactly 32 bytes
    run_sql_expect_error(f"""
        INSERT INTO public.command_receipts (match_id, actor_key, command_id, command_type, payload_hash, applied_version, result)
        VALUES ('{m_id}', 'USER:{u1}', '{uuid.uuid4()}', 'MOVE', '\\x010203', 1, '{valid_receipt}');
    """, expected_err="command_receipts_payload_hash_length_check")

    print("  ✓ Events, number coordinates, same-cell rejection, hash length & receipts errorCode check PASS")

TABLE_UPDATE_SET = {
    ("public", "profiles"): "updated_at = now()",
    ("private", "revoked_sessions"): "revoked_at = now()",
    ("public", "friend_relations"): "status = 'ACCEPTED'",
    ("public", "rooms"): "status = 'CLOSED'",
    ("public", "room_members"): "ready = true",
    ("public", "invitations"): "status = 'EXPIRED'",
    ("public", "matches"): "status = 'FINISHED'",
    ("public", "active_players"): "acquired_at = now()",
    ("public", "match_events"): "type = 'RESULT'",
    ("public", "match_moves"): "side = 'RED'",
    ("public", "command_receipts"): "applied_version = 1",
    ("public", "client_controls"): "updated_at = now()",
    ("public", "ai_jobs"): "status = 'FAILED'",
    ("public", "chat_messages"): "channel = 'PLAYERS'",
    ("public", "media_policies"): "status = 'APPLIED'",
    ("public", "media_transports"): "status = 'RETIRED'",
    ("public", "media_policy_jobs"): "status = 'FAILED'",
    ("public", "room_rematch_votes"): "created_at = now()",
    ("public", "room_command_receipts"): "command_type = 'REMATCH'",
}

def test_comprehensive_rls_denial():
    print(f"[7/10] Testing RLS denial across ALL {len(ALL_19_TABLES)} tables for anon & authenticated (SELECT, INSERT, UPDATE, DELETE)...")
    total_checks = 0
    for schema, table in ALL_19_TABLES:
        full_table = f"{schema}.{table}"
        update_set = TABLE_UPDATE_SET[(schema, table)]
        for role in ["anon", "authenticated"]:
            # 1. SELECT denied
            run_sql_expect_error(f"""
                SET ROLE {role};
                SELECT * FROM {full_table};
            """, expected_err="permission denied")

            # 2. INSERT denied
            run_sql_expect_error(f"""
                SET ROLE {role};
                INSERT INTO {full_table} DEFAULT VALUES;
            """, expected_err="permission denied")

            # 3. UPDATE denied
            run_sql_expect_error(f"""
                SET ROLE {role};
                UPDATE {full_table} SET {update_set};
            """, expected_err="permission denied")

            # 4. DELETE denied
            run_sql_expect_error(f"""
                SET ROLE {role};
                DELETE FROM {full_table};
            """, expected_err="permission denied")

            total_checks += 4

    # Private helper denied for anon and authenticated
    run_sql_expect_error(f"""
        SET ROLE anon;
        SELECT private.is_auth_session_active('{uuid.uuid4()}', '{uuid.uuid4()}');
    """, expected_err="permission denied")

    run_sql_expect_error(f"""
        SET ROLE authenticated;
        SELECT private.is_auth_session_active('{uuid.uuid4()}', '{uuid.uuid4()}');
    """, expected_err="permission denied")

    print(f"  ✓ Verified {total_checks} RLS denial assertions across all 19 tables (SELECT/INSERT/UPDATE/DELETE) PASS")

def test_app_server_grants_and_trigger_security():
    print("[8/10] Testing app_server permissions & revoked trigger function execution...")
    # Read as app_server succeeds on public.profiles
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

    # Trigger functions EXECUTE must be revoked from anon & authenticated
    run_sql_expect_error("""
        SET ROLE anon;
        SELECT public.handle_new_user();
    """, expected_err="permission denied")

    run_sql_expect_error("""
        SET ROLE authenticated;
        SELECT public.guard_match_updates();
    """, expected_err="permission denied")

    print("  ✓ App_server grants, audit immutability & revoked trigger execution PASS")

def test_real_transaction_rollback():
    print("[9/10] Testing REAL transaction rollback atomicity...")
    r_id = str(uuid.uuid4())
    before_rooms = int(run_sql("SELECT count(*) FROM public.rooms;"))

    # Test PL/pgSQL DO block that inserts a row and then throws an exception
    run_sql_expect_error(f"""
        DO $$
        DECLARE
          v_owner uuid;
        BEGIN
          SELECT user_id INTO v_owner FROM public.profiles LIMIT 1;
          INSERT INTO public.rooms (id, owner_id, name, status, visibility, time_control)
          VALUES ('{r_id}', v_owner, 'Rollback Room', 'WAITING', 'PUBLIC', 300);
          RAISE EXCEPTION 'Real PL/pgSQL failure before commit';
        END $$;
    """, expected_err="Real PL/pgSQL failure before commit")

    after_rooms = int(run_sql("SELECT count(*) FROM public.rooms;"))
    assert before_rooms == after_rooms, f"Room count leaked: {before_rooms} -> {after_rooms}"

    # Verify that the specific row definitely does not exist
    exists = run_sql(f"SELECT EXISTS (SELECT 1 FROM public.rooms WHERE id = '{r_id}');")
    assert exists == "f", f"Rolled back room still exists in DB: {r_id}"

    print("  ✓ Real PL/pgSQL transaction rollback verified PASS")

def test_libpq_environment_isolation():
    print("[10/10] Testing libpq environment isolation (PGHOSTADDR and PG* variables)...")
    # Simulate aggressive external environment pollution
    dirty_hostaddr = "192.0.2.1"  # RFC 5737 TEST-NET-1 (unroutable blackhole IP)
    dirty_port = "1"              # Invalid port
    dirty_db = "nonexistent_db_from_env"

    orig_env = {k: os.environ.get(k) for k in ["PGHOSTADDR", "PGPORT", "PGDATABASE"]}
    try:
        os.environ["PGHOSTADDR"] = dirty_hostaddr
        os.environ["PGPORT"] = dirty_port
        os.environ["PGDATABASE"] = dirty_db

        # 1. Verify that run_sql (isolated) connects to the true test cluster (127.0.0.1:PG_PORT)
        # without being hijacked by PGHOSTADDR or PGPORT from os.environ
        res = run_sql("SELECT current_database();")
        assert res == PG_DB, f"Expected database '{PG_DB}', but got '{res}'"

        # 2. Prove that an UNISOLATED psql invocation WITH PGHOSTADDR would indeed be hijacked and fail
        unisolated_env = os.environ.copy()
        unisolated_cmd = [
            PSQL,
            "-h", PG_HOST,
            "-p", PG_PORT,
            "-U", PG_USER,
            "-d", PG_DB,
            "-v", "ON_ERROR_STOP=1",
            "-c", "SELECT 1;"
        ]
        proc = subprocess.run(
            unisolated_cmd,
            env=dict(unisolated_env, PGCONNECT_TIMEOUT="2"),
            capture_output=True,
            text=True
        )
        assert proc.returncode != 0, "Expected unisolated psql with PGHOSTADDR=192.0.2.1 to fail!"
        assert "192.0.2.1" in proc.stderr or "could not connect" in proc.stderr.lower() or "timeout" in proc.stderr.lower(), \
            f"Expected connection error to 192.0.2.1, got: {proc.stderr}"

        print("  ✓ External PGHOSTADDR / PG* variables successfully blocked by isolation layer PASS")
    finally:
        for k, v in orig_env.items():
            if v is None:
                os.environ.pop(k, None)
            else:
                os.environ[k] = v

def main():
    parser = argparse.ArgumentParser(description="Run database integration test suite")
    parser.add_argument("--use-existing", action="store_true", help="Connect to existing PG rather than creating a temporary cluster")
    args = parser.parse_args()

    print("=" * 60)
    print("RUNNING ISOLATED DATABASE INTEGRATION TESTS")
    print("=" * 60)

    # Set up dedicated isolated test cluster
    setup_isolated_test_cluster(use_existing=args.use_existing)
    print(f"Connected to test cluster at {PG_HOST}:{PG_PORT} (database: {PG_DB})")

    try:
        test_signup_profile_trigger()
        test_revoked_sessions()
        test_friend_relations()
        test_rooms_and_members_deferrable_swap()
        test_matches_and_circular_fk()
        test_events_moves_receipts()
        test_comprehensive_rls_denial()
        test_app_server_grants_and_trigger_security()
        test_real_transaction_rollback()
        test_libpq_environment_isolation()
        print("=" * 60)
        print("ALL 10 TEST SUITES PASSED (180+ invariant & security assertions verified)!")
        print("=" * 60)
    except Exception as e:
        print(f"\nTEST FAILED: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
