/**
 * Live probe: REALTIME_LOAD_URL=http://127.0.0.1:3000 REALTIME_LOAD_ORIGIN=https://allowed-origin \
 * REALTIME_LOAD_PROOFS=.local/realtime-load/<runId>/proofs.json \
 * REALTIME_LOAD_OUTPUT=.local/realtime-load/<runId>/result.json \
 * pnpm exec tsx tests/load/realtime.ts
 * Provision valid identities first; retain the manifest for explicit resource cleanup.
 */
import { cpus, freemem, platform, release, totalmem } from "node:os";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import type { CommandAcknowledgement, RoomSnapshot } from "@xiangqi/shared";
import {
  legalMoves,
  parsePosition,
  playMove,
  serializePosition,
} from "@xiangqi/xiangqi-core";

type Proof = { userId: string; accessToken: string; appSession: string };
type ProofFile = { runId: string; users: Proof[] };
type RoomEntry = { roomId: string; matchId?: string };
type Peer = {
  proof: Proof;
  roomId: string;
  socket: Socket;
  latest: RoomSnapshot;
};
const baseUrl = process.env.REALTIME_LOAD_URL;
const webOrigin = process.env.REALTIME_LOAD_ORIGIN;
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const fromRepo = (path: string) => resolve(repoRoot, path);
const proofPath = process.env.REALTIME_LOAD_PROOFS;
const outputPath = fromRepo(
  process.env.REALTIME_LOAD_OUTPUT ?? "./realtime-load-results.json",
);
const manifestPath = fromRepo(
  process.env.REALTIME_LOAD_MANIFEST ??
    outputPath.replace(/\.json$/i, "-resources.json"),
);
const deadlineMs = Number(process.env.REALTIME_LOAD_DEADLINE_MS ?? 30_000);
if (
  !baseUrl ||
  !webOrigin ||
  !proofPath ||
  !Number.isFinite(deadlineMs) ||
  deadlineMs < 1000
)
  throw new Error(
    "Set REALTIME_LOAD_URL, REALTIME_LOAD_ORIGIN, REALTIME_LOAD_PROOFS and a deadline >= 1000ms",
  );
const proofs = JSON.parse(
  await readFile(fromRepo(proofPath), "utf8"),
) as ProofFile;
if (
  !/^[0-9a-f-]{36}$/i.test(proofs.runId) ||
  proofs.users.length !== 50 ||
  new Set(proofs.users.map((u) => u.userId)).size !== 50
)
  throw new Error(
    "Proof file must contain one runId and exactly 50 distinct users",
  );
const transportFailure = Promise.withResolvers<never>();
void transportFailure.promise.catch(() => {});
let closing = false;
const timeout = <T>(promise: Promise<T>, what: string): Promise<T> => {
  const { promise: bounded, resolve, reject } = Promise.withResolvers<T>();
  const timer = setTimeout(
    () => reject(new Error(`Timed out waiting for ${what}`)),
    deadlineMs,
  );
  Promise.race([promise, transportFailure.promise]).then(
    (value) => {
      clearTimeout(timer);
      resolve(value);
    },
    (error) => {
      clearTimeout(timer);
      reject(error);
    },
  );
  return bounded;
};
const percentile = (values: number[], p: number) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.ceil(p * sorted.length) - 1]!;
};
const rooms: RoomEntry[] = [];
const peers: Peer[] = [];
const sockets: Socket[] = [];
const samples: {
  deliveryMs: number;
  role: string;
  room: string;
  version: number;
}[] = [];
const ackSamples: number[] = [];
const positionsByRoom = new Map<string, Set<string>>();
const persistManifest = async (extra: Record<string, unknown> = {}) => {
  await mkdir(dirname(resolve(manifestPath)), { recursive: true });
  await writeFile(
    manifestPath,
    JSON.stringify(
      { runId: proofs.runId, resources: rooms, ...extra },
      null,
      2,
    ) + "\n",
    { mode: 0o600 },
  );
};
const api = async (path: string, proof: Proof, body: unknown) => {
  const response = await fetch(new URL(path, baseUrl), {
    method: "POST",
    headers: {
      authorization: `Bearer ${proof.accessToken}`,
      "x-xiangqi-session": proof.appSession,
      origin: webOrigin,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(deadlineMs),
  });
  if (!response.ok)
    throw new Error(`API ${path} returned HTTP ${response.status}`);
  return (await response.json()) as Record<string, unknown>;
};
const waitSnapshot = (peer: Peer, matchVersion: number, status = "ACTIVE") => {
  const { promise, resolve } = Promise.withResolvers<RoomSnapshot>();
  const listener = (snapshot: RoomSnapshot) => {
    if (
      snapshot.match?.version === matchVersion &&
      snapshot.match.status === status
    ) {
      peer.socket.off("room.snapshot", listener);
      resolve(snapshot);
    }
  };
  if (
    peer.latest.match?.version === matchVersion &&
    peer.latest.match.status === status
  )
    resolve(peer.latest);
  else peer.socket.on("room.snapshot", listener);
  return timeout(
    promise,
    `room ${peer.roomId} ${status} snapshot v${matchVersion}`,
  );
};
const connectPeer = (proof: Proof, roomId: string) => {
  const { promise, resolve, reject } = Promise.withResolvers<Peer>();
  const socket = io(baseUrl!, {
    transports: ["websocket"],
    forceNew: true,
    reconnection: false,
    extraHeaders: { Origin: webOrigin! },
    auth: {
      accessToken: proof.accessToken,
      appSession: proof.appSession,
      roomId,
      tabId: randomUUID(),
    },
  });
  sockets.push(socket);
  let peer: Peer | undefined;
  socket.on("room.snapshot", (snapshot: RoomSnapshot) => {
    if (peer) {
      if (snapshot.version >= peer.latest.version) peer.latest = snapshot;
    } else {
      peer = { proof, roomId, socket, latest: snapshot };
      peers.push(peer);
      resolve(peer);
    }
  });
  socket.on("disconnect", (reason) => {
    if (!closing)
      transportFailure.reject(
        new Error(`Socket disconnected in room ${roomId}: ${reason}`),
      );
  });
  socket.once("connect_error", reject);
  return timeout(promise, `socket connection for ${roomId}`);
};
const waitRoomVersion = (peer: Peer, version: number) => {
  const { promise, resolve } = Promise.withResolvers<RoomSnapshot>();
  const listener = (snapshot: RoomSnapshot) => {
    if (snapshot.version >= version) {
      peer.socket.off("room.snapshot", listener);
      resolve(snapshot);
    }
  };
  if (peer.latest.version >= version) resolve(peer.latest);
  else peer.socket.on("room.snapshot", listener);
  return timeout(promise, `room ${peer.roomId} room-version ${version}`);
};
const emit = (peer: Peer, command: unknown) => {
  const { promise, resolve } = Promise.withResolvers<CommandAcknowledgement>();
  peer.socket.emit("room.command", command, resolve);
  return timeout(promise, "command acknowledgement");
};
let error: unknown;
const workloadStartedAt = performance.now();
try {
  for (let room = 0; room < 10; room++) {
    const members = proofs.users.slice(room * 5, room * 5 + 5);
    const created = await api("/rooms", members[0]!, {
      commandId: randomUUID(),
      timeMinutes: 15,
      viewerLimit: 3,
    });
    const roomId = String(created.roomId);
    rooms.push({ roomId });
    await persistManifest();
    for (const [index, proof] of members.slice(1).entries()) {
      await api("/rooms/join", proof, {
        commandId: randomUUID(),
        code: created.inviteCode,
        preference: index === 0 ? "play" : "watch",
      });
    }
    await Promise.all(members.map((proof) => connectPeer(proof, roomId)));
  }
  if (peers.length !== 50 || peers.some((peer) => !peer.socket.connected))
    throw new Error("Workload requires 50 simultaneously connected sockets");
  for (let room = 0; room < 10; room++) {
    const group = peers.filter((p) => p.roomId === rooms[room]!.roomId);
    if (
      group.filter((p) => p.latest.role === "red").length !== 1 ||
      group.filter((p) => p.latest.role === "black").length !== 1 ||
      group.filter((p) => p.latest.role === "spectator").length !== 3
    )
      throw new Error(
        `Room ${rooms[room]!.roomId} did not have 2 seats and 3 spectators`,
      );
  }
  for (let room = 0; room < 10; room++) {
    const group = peers.filter((p) => p.roomId === rooms[room]!.roomId);
    for (const player of group.filter(
      (p) => p.latest.role === "red" || p.latest.role === "black",
    )) {
      let ack: CommandAcknowledgement | undefined;
      for (let attempt = 0; attempt < 5; attempt++) {
        ack = await emit(player, {
          commandId: randomUUID(),
          roomId: player.roomId,
          expectedVersion: player.latest.version,
          action: { type: "room.ready", payload: { ready: true } },
        });
        if (ack.snapshot && ack.snapshot.version >= player.latest.version)
          player.latest = ack.snapshot;
        if (ack.status === "ok" || ack.error.code !== "VERSION_STALE") break;
      }
      if (ack?.status !== "ok")
        throw new Error(
          `Ready failed: ${ack?.status === "error" ? ack.error.code : "no acknowledgement"}`,
        );
      const readyVersion = ack.snapshot.version;
      await Promise.all(
        group.map((peer) => waitRoomVersion(peer, readyVersion)),
      );
    }
  }
  for (const room of rooms) {
    const group = peers.filter((p) => p.roomId === room.roomId);
    await timeout(
      (async () => {
        while (
          !group.every(
            (peer) =>
              peer.latest.room.status === "PLAYING" &&
              peer.latest.match?.status === "ACTIVE",
          )
        ) {
          const { promise, resolve } = Promise.withResolvers<void>();
          const onSnapshot = () => {
            for (const peer of group)
              peer.socket.off("room.snapshot", onSnapshot);
            resolve();
          };
          for (const peer of group)
            peer.socket.once("room.snapshot", onSnapshot);
          await promise;
        }
      })(),
      `game start ${room.roomId}`,
    );
    room.matchId = group[0]!.latest.match!.id;
    positionsByRoom.set(
      room.roomId,
      new Set([group[0]!.latest.match!.position]),
    );
    await persistManifest();
  }
  const rounds = Number(process.env.REALTIME_LOAD_ROUNDS ?? 4);
  const moveWorkloadStartedAt = performance.now();
  if (!Number.isInteger(rounds) || rounds < 2 || rounds > 20)
    throw new Error("REALTIME_LOAD_ROUNDS must be 2..20");
  for (let round = 0; round < rounds; round++) {
    const moves = rooms.map((room) => {
      const group = peers.filter((p) => p.roomId === room.roomId);
      const red = group.find((p) => p.latest.role === "red")!;
      const current = red.latest.match!;
      const position = parsePosition(current.position);
      const seen = positionsByRoom.get(room.roomId)!;
      const choice = legalMoves(position)
        .map((move) => ({ move, next: playMove(position, move) }))
        .find(({ next }) => {
          const fen = serializePosition(next);
          return !seen.has(fen) && legalMoves(next).length > 0;
        });
      if (!choice)
        throw new Error(
          `No nonrepeating legal continuation remains in ${room.roomId}; aborting rather than shortening rounds`,
        );
      return {
        group,
        mover: group.find((p) => p.latest.role === position.turn)!,
        match: current,
        ...choice,
      };
    });
    const deliveries = moves.flatMap(({ group, mover, match, move, next }) => {
      const action = {
        type: "match.move",
        payload: {
          matchId: match.id,
          matchVersion: match.version,
          from: move.from,
          to: move.to,
        },
      };
      const targetVersion = match.version + 1;
      const recipients = group.filter((p) => p !== mover);
      const deliveryWaits = recipients.map(async (recipient) => {
        const snapshot = await waitSnapshot(recipient, targetVersion);
        const finish = performance.now();
        if (snapshot.match!.position !== serializePosition(next))
          throw new Error(
            `Authoritative state mismatch from recipient ${recipient.latest.role}`,
          );
        return {
          deliveryMs: finish - sendAt,
          role: recipient.latest.role,
          room: recipient.roomId,
          version: targetVersion,
        };
      });
      const sendAt = performance.now();
      const moverSnapshot = waitSnapshot(mover, targetVersion);
      const ackWait = emit(mover, {
        commandId: randomUUID(),
        roomId: mover.roomId,
        expectedVersion: mover.latest.version,
        action,
      }).then((ack) => {
        const ackMs = performance.now() - sendAt;
        if (
          ack.status !== "ok" ||
          ack.snapshot?.match?.version !== targetVersion
        )
          throw new Error(`Move command failed in ${mover.roomId}`);
        ackSamples.push(ackMs);
      });
      return Promise.all([
        Promise.all(deliveryWaits),
        ackWait,
        moverSnapshot,
      ]).then(([delivered, , authoritative]) => {
        if (authoritative.match?.position !== serializePosition(next))
          throw new Error(`Mover snapshot mismatch in ${mover.roomId}`);
        for (const sample of delivered) samples.push(sample);
        return {
          group,
          expected: serializePosition(next),
          version: targetVersion,
        };
      });
    });
    const updated = await Promise.all(deliveries);
    for (const state of updated) {
      positionsByRoom.get(state.group[0]!.roomId)!.add(state.expected);
      const snapshots = state.group.map((p) => p.latest);
      if (
        snapshots.some(
          (s) =>
            s.match?.version !== state.version ||
            s.match.position !== state.expected,
        )
      )
        throw new Error(
          `Room peers disagree after match version ${state.version}`,
        );
    }
  }
  const delivery = samples.map((s) => s.deliveryMs);
  const spectator = samples
    .filter((s) => s.role === "spectator")
    .map((s) => s.deliveryMs);
  const opponent = samples
    .filter((s) => s.role === "red" || s.role === "black")
    .map((s) => s.deliveryMs);
  const metrics = (values: number[]) => ({
    p50: percentile(values, 0.5),
    p95: percentile(values, 0.95),
    p99: percentile(values, 0.99),
  });
  const result = {
    runId: proofs.runId,
    endpoint: new URL(baseUrl).origin,
    webOrigin,
    provisioningExcluded: true,
    durationMs: Math.round(performance.now() - workloadStartedAt),
    moveWorkloadDurationMs: Math.round(
      performance.now() - moveWorkloadStartedAt,
    ),
    topology: {
      app: "existing NestJS + Socket.IO",
      database: "live Supabase Postgres",
      transport: "WebSocket",
      serverHost: new URL(baseUrl).host,
      client: {
        platform,
        release,
        arch: process.arch,
        node: process.version,
        cpus: cpus().length,
        totalRamBytes: totalmem(),
        freeRamBytes: freemem(),
      },
      serverCpuRam: "not exposed by public runtime; obtain from host telemetry",
    },
    counts: {
      users: proofs.users.length,
      rooms: rooms.length,
      matchesStarted: rooms.filter((r) => r.matchId).length,
      connectedPeers: peers.length,
      rounds,
      moves: rooms.length * rounds,
      recipientDeliverySamples: delivery.length,
      spectatorDeliverySamples: spectator.length,
      opponentDeliverySamples: opponent.length,
      acknowledgementSamples: ackSamples.length,
      errors: 0,
    },
    deliveryMs: {
      allRecipients: metrics(delivery),
      opponents: metrics(opponent),
      spectators: metrics(spectator),
      p95Under100ms: percentile(delivery, 0.95)! < 100,
    },
    acknowledgementMs: metrics(ackSamples),
    resources: rooms,
  };
  await mkdir(dirname(resolve(outputPath)), { recursive: true });
  await writeFile(outputPath, JSON.stringify(result, null, 2) + "\n", {
    mode: 0o600,
  });
  process.stdout.write(
    JSON.stringify({ ...result, resources: undefined }) + "\n",
  );
} catch (cause) {
  error = cause;
  const failure = {
    runId: proofs.runId,
    counts: {
      roomsCreated: rooms.length,
      matchesStarted: rooms.filter((r) => r.matchId).length,
      connectedPeers: peers.length,
      deliveredSamples: samples.length,
      acknowledgementSamples: ackSamples.length,
      errors: 1,
    },
    error: cause instanceof Error ? cause.message : "unknown",
  };
  await mkdir(dirname(resolve(outputPath)), { recursive: true });
  await writeFile(outputPath, JSON.stringify(failure, null, 2) + "\n", {
    mode: 0o600,
  });
  await persistManifest({ counts: failure.counts, error: failure.error });
} finally {
  closing = true;
  for (const socket of sockets) socket.disconnect();
}
if (error) throw error;
