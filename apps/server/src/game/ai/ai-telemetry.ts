import type { Move } from "@xiangqi/xiangqi-core";

export interface AiTelemetry {
  taskVersion: number;
  completedDepth: number;
  targetDepth: number;
  elapsedMs: number;
  nodes: number;
  appliedMove: Move | null;
}

/** Validate and project only completed-search metrics and the committed move. */
export function parseAiTelemetry(value: unknown): AiTelemetry | null {
  if (value === null) return null;
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw Error();
  const row = value as Record<string, unknown>;
  const integer = (v: unknown) =>
    typeof v === "number" && Number.isSafeInteger(v) && v >= 0;
  if (
    !integer(row.taskVersion) ||
    row.taskVersion === 0 ||
    !integer(row.completedDepth) ||
    !integer(row.targetDepth) ||
    !integer(row.nodes) ||
    typeof row.elapsedMs !== "number" ||
    !Number.isFinite(row.elapsedMs) ||
    row.elapsedMs < 0
  )
    throw Error();
  let appliedMove: Move | null = null;
  if (row.appliedMove !== null) {
    if (
      !row.appliedMove ||
      typeof row.appliedMove !== "object" ||
      Array.isArray(row.appliedMove)
    )
      throw Error();
    const move = row.appliedMove as Record<string, unknown>;
    if (
      !integer(move.from) ||
      !integer(move.to) ||
      (move.from as number) >= 90 ||
      (move.to as number) >= 90
    )
      throw Error();
    appliedMove = { from: move.from as number, to: move.to as number };
  }
  return {
    taskVersion: row.taskVersion as number,
    completedDepth: row.completedDepth as number,
    targetDepth: row.targetDepth as number,
    elapsedMs: row.elapsedMs,
    nodes: row.nodes as number,
    appliedMove,
  };
}
