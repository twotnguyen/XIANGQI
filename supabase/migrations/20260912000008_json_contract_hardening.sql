-- Migration 8: json-contract-hardening
-- Addresses review findings on PR #7:
-- 1. [P2] match_moves.move coordinates must be JSON numbers (reject string "1")
-- 2. [P2] matches.proposal must validate required keys & types (reject proposal = '{}')
-- 3. [P2] command_receipts.result must have explicit errorCode key (null for APPLIED, MATCH_ENDED for DEADLINE_FINALIZED)
-- 4. [P2] matches.outcome draw & interrupted must have explicit winner: null key (reject missing winner key)

-- 1. Harden match_moves.move coordinates to require JSON numbers
ALTER TABLE public.match_moves
  DROP CONSTRAINT IF EXISTS match_moves_move_json_check;

ALTER TABLE public.match_moves
  ADD CONSTRAINT match_moves_move_json_check CHECK (
    COALESCE(
      jsonb_typeof(move) = 'object'
      AND move ? 'from'
      AND move ? 'to'
      AND jsonb_typeof(move->'from') = 'object'
      AND jsonb_typeof(move->'to') = 'object'
      AND (move->'from' ? 'x') AND (move->'from' ? 'y')
      AND (move->'to' ? 'x') AND (move->'to' ? 'y')
      AND jsonb_typeof(move->'from'->'x') = 'number'
      AND (move->'from'->>'x') ~ '^[0-8]$'
      AND jsonb_typeof(move->'from'->'y') = 'number'
      AND (move->'from'->>'y') ~ '^[0-9]$'
      AND jsonb_typeof(move->'to'->'x') = 'number'
      AND (move->'to'->>'x') ~ '^[0-8]$'
      AND jsonb_typeof(move->'to'->'y') = 'number'
      AND (move->'to'->>'y') ~ '^[0-9]$'
      AND NOT (move->'from'->>'x' = move->'to'->>'x' AND move->'from'->>'y' = move->'to'->>'y'),
      false
    )
  );

-- 2. Harden matches.proposal to reject empty object or missing required keys
ALTER TABLE public.matches
  DROP CONSTRAINT IF EXISTS matches_proposal_check;

ALTER TABLE public.matches
  ADD CONSTRAINT matches_proposal_check CHECK (
    proposal IS NULL OR (
      mode = 'ONLINE' AND COALESCE(
        jsonb_typeof(proposal) = 'object'
        AND proposal ? 'id'
        AND (proposal->>'id') ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        AND proposal ? 'kind'
        AND (proposal->>'kind') IN ('DRAW', 'UNDO')
        AND proposal ? 'requester'
        AND (proposal->>'requester') IN ('RED', 'BLACK')
        AND proposal ? 'basePly'
        AND jsonb_typeof(proposal->'basePly') = 'number'
        AND (proposal->>'basePly')::int >= 0
        AND proposal ? 'createdVersion'
        AND jsonb_typeof(proposal->'createdVersion') = 'number'
        AND (proposal->>'createdVersion')::bigint >= 0
        AND proposal ? 'expiresAtMs'
        AND jsonb_typeof(proposal->'expiresAtMs') = 'number'
        AND (proposal->>'expiresAtMs')::bigint >= 0,
        false
      )
    )
  );

-- 3. Harden command_receipts.result to require explicit errorCode key
ALTER TABLE public.command_receipts
  DROP CONSTRAINT IF EXISTS command_receipts_result_json_check;

ALTER TABLE public.command_receipts
  ADD CONSTRAINT command_receipts_result_json_check CHECK (
    COALESCE(
      jsonb_typeof(result) = 'object'
      AND result ? 'kind'
      AND result ? 'errorCode'
      AND (
        (
          (result->>'kind') = 'APPLIED'
          AND jsonb_typeof(result->'errorCode') = 'null'
        )
        OR
        (
          (result->>'kind') = 'DEADLINE_FINALIZED'
          AND (result->>'errorCode') = 'MATCH_ENDED'
        )
      ),
      false
    )
  );

-- 4. Harden matches.outcome to require explicit winner key on draw and interrupted
ALTER TABLE public.matches
  DROP CONSTRAINT IF EXISTS matches_status_and_outcome_invariants;

ALTER TABLE public.matches
  ADD CONSTRAINT matches_status_and_outcome_invariants CHECK (
    (
      status = 'ACTIVE'
      AND outcome IS NULL
      AND ended_at IS NULL
    )
    OR
    (
      status = 'INTERRUPTED'
      AND ended_at IS NOT NULL
      AND ended_at >= created_at
      AND proposal IS NULL
      AND outcome IS NOT NULL
      AND COALESCE(
        jsonb_typeof(outcome) = 'object'
        AND outcome ? 'reason'
        AND outcome ? 'winner'
        AND (outcome->>'reason') IN ('BOTH_OFFLINE', 'SERVER_RESTART', 'AI_UNAVAILABLE')
        AND jsonb_typeof(outcome->'winner') = 'null',
        false
      )
    )
    OR
    (
      status = 'FINISHED'
      AND ended_at IS NOT NULL
      AND ended_at >= created_at
      AND proposal IS NULL
      AND outcome IS NOT NULL
      AND COALESCE(
        jsonb_typeof(outcome) = 'object'
        AND outcome ? 'reason'
        AND outcome ? 'winner'
        AND (
          (
            (outcome->>'reason') IN ('AGREED_DRAW', 'REPETITION')
            AND jsonb_typeof(outcome->'winner') = 'null'
          )
          OR
          (
            (outcome->>'reason') IN ('CHECKMATE', 'STALEMATE', 'TIMEOUT', 'RESIGN', 'DISCONNECT')
            AND (outcome->>'winner') IN ('RED', 'BLACK')
          )
        ),
        false
      )
    )
  );
