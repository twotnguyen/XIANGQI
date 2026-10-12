import { serializePosition } from "@xiangqi/xiangqi-core";
import { randomUUID } from "node:crypto";
import type { AiSnapshot } from "./ai-games.js";
import type { AiReservations } from "./ai-reservations.js";
import { prepareAiHistory } from "./ai-history.js";
import { encodeMove, encodePosition, record } from "../match/position-codec.js";
import { replayHistory, type HistoryMove } from "../match/history.js";
import type { RoomScope } from "../room/contracts.js";
function fail(): never {
  throw new Error("AI_HISTORY_CONFLICT");
}
/** Caller owns the actor-bound transaction and commits history and seat release together. */
export class AiHistoryStore {
  constructor(
    private readonly reservations: Pick<AiReservations, "check" | "release">,
  ) {}
  async finish(scope: RoomScope, snapshot: AiSnapshot, bootId: string) {
    if (
      scope.actor.kind !== "member" ||
      scope.actor.userId !== snapshot.ownerId ||
      !scope.lockedActorIds.has(snapshot.ownerId)
    )
      fail();
    const prepared = prepareAiHistory(snapshot);
    const client = scope.client;
    const existing = (
      await client.query<{
        mode: string;
        status: string;
        red_user_id: string | null;
        black_user_id: string | null;
        ai_side: string;
        ai_level: string;
        rule_set_version: string;
        version: string;
        position: unknown;
        ply: number;
        active_move_ids: unknown;
        outcome: unknown;
        ended_at: Date;
      }>(
        "SELECT mode,status,red_user_id,black_user_id,ai_side,ai_level,rule_set_version,version,position,ply,active_move_ids,outcome,ended_at FROM public.matches WHERE id=$1 FOR UPDATE",
        [snapshot.id],
      )
    ).rows[0];
    if (existing) {
      const events = (
        await client.query<{ type: string; version: string; payload: unknown }>(
          "SELECT type,version,payload FROM public.match_events WHERE match_id=$1 AND type IN('START','RESULT')",
          [snapshot.id],
        )
      ).rows;
      const start = events.find((event) => event.type === "START"),
        result = events.find((event) => event.type === "RESULT");
      if (
        scope.actor.kind !== "member" ||
        existing.mode !== "AI" ||
        existing.status !== prepared.status ||
        existing.red_user_id !==
          (snapshot.actualSide === "red" ? snapshot.ownerId : null) ||
        existing.black_user_id !==
          (snapshot.actualSide === "black" ? snapshot.ownerId : null) ||
        existing.ai_side !==
          (snapshot.actualSide === "red" ? "BLACK" : "RED") ||
        existing.ai_level !== snapshot.level.toUpperCase() ||
        existing.rule_set_version !== "xiangqi-simple-v1" ||
        Number(existing.version) !== snapshot.version ||
        events.length !== 2 ||
        !start ||
        Number(start.version) !== 0 ||
        !result ||
        Number(result.version) !== snapshot.version ||
        !record(result.payload) ||
        !record(start.payload) ||
        start.payload.startToken !== snapshot.id ||
        start.payload.ruleSetVersion !== existing.rule_set_version ||
        start.payload.mode !== "AI" ||
        start.payload.ownerId !== snapshot.ownerId ||
        start.payload.requestedSide !== snapshot.requestedSide ||
        start.payload.aiSide !== existing.ai_side ||
        start.payload.level !== snapshot.level ||
        result.payload.endedAt !== existing.ended_at.toISOString() ||
        !record(result.payload.outcome) ||
        result.payload.outcome.reason !== prepared.outcome.reason ||
        result.payload.outcome.winner !== prepared.outcome.winner ||
        result.payload.historyFingerprint !== prepared.fingerprint ||
        !record(existing.outcome) ||
        existing.outcome.reason !== prepared.outcome.reason ||
        existing.outcome.winner !== prepared.outcome.winner
      )
        fail();
      const moves = (
        await client.query<HistoryMove>(
          "SELECT m.id,m.parent_move_id,m.event_version,m.side,m.move,e.type event_type,e.payload FROM public.match_moves m JOIN public.match_events e ON e.match_id=m.match_id AND e.version=m.event_version WHERE m.match_id=$1",
          [snapshot.id],
        )
      ).rows;
      const history = replayHistory({
        ...existing,
        start: start.payload,
        moves,
      });
      if (
        history.length !== snapshot.history.length ||
        history.some(
          (position, i) => serializePosition(position) !== snapshot.history[i],
        )
      )
        fail();
      return {
        persisted: true,
        created: false,
        endedAt: existing.ended_at.toISOString(),
      };
    }
    const slot = await this.reservations.check(scope, {
      gameId: snapshot.id,
      bootId,
    });
    const at = (
      await client.query<{ at: Date }>("SELECT clock_timestamp() AS at")
    ).rows[0]!.at;
    const moveIds = prepared.moves.map(() => randomUUID());
    await client.query(
      `INSERT INTO public.matches(id,mode,status,red_user_id,black_user_id,ai_side,ai_level,position,version,ply,time_control,clock,outcome,active_move_ids,boot_id,created_at,ended_at)
      VALUES($1,'AI',$2,$3,$4,$5,$6,$7,$8,$9,0,NULL,$10,$11,$12,$13,$14)`,
      [
        snapshot.id,
        prepared.status,
        snapshot.actualSide === "red" ? snapshot.ownerId : null,
        snapshot.actualSide === "black" ? snapshot.ownerId : null,
        snapshot.actualSide === "red" ? "BLACK" : "RED",
        snapshot.level.toUpperCase(),
        encodePosition(prepared.positions.at(-1)!),
        snapshot.version,
        prepared.moves.length,
        prepared.outcome,
        JSON.stringify(moveIds),
        bootId,
        slot.acquiredAt,
        at,
      ],
    );
    await client.query(
      "INSERT INTO public.match_events(match_id,version,type,payload,created_at) VALUES($1,0,'START',$2,$3)",
      [
        snapshot.id,
        {
          encoding: "xiangqi-core-v1",
          startToken: snapshot.id,
          mode: "AI",
          ownerId: snapshot.ownerId,
          requestedSide: snapshot.requestedSide,
          aiSide: snapshot.actualSide === "red" ? "BLACK" : "RED",
          level: snapshot.level,
          initialPosition: encodePosition(prepared.positions[0]!),
          ruleSetVersion: "xiangqi-simple-v1",
        },
        slot.acquiredAt,
      ],
    );
    for (const [i, move] of prepared.moves.entries()) {
      const side = prepared.positions[i]!.turn === "red" ? "RED" : "BLACK",
        encoded = encodeMove(move),
        moveId = moveIds[i]!;
      await client.query(
        "INSERT INTO public.match_events(match_id,version,type,payload,created_at) VALUES($1,$2,'MOVE',$3,$4)",
        [snapshot.id, i + 1, { moveId, side, move: encoded }, at],
      );
      await client.query(
        "INSERT INTO public.match_moves(id,match_id,parent_move_id,event_version,side,move,created_at) VALUES($1,$2,$3,$4,$5,$6,$7)",
        [moveId, snapshot.id, moveIds[i - 1] ?? null, i + 1, side, encoded, at],
      );
    }
    await client.query(
      "INSERT INTO public.match_events(match_id,version,type,payload,created_at) VALUES($1,$2,'RESULT',$3,$4)",
      [
        snapshot.id,
        snapshot.version,
        {
          outcome: prepared.outcome,
          endedAt: at.toISOString(),
          historyFingerprint: prepared.fingerprint,
        },
        at,
      ],
    );
    await this.reservations.release(scope, { gameId: snapshot.id, bootId });
    return { persisted: true, created: true, endedAt: at.toISOString() };
  }
}
