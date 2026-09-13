/**
 * ISSUE-030: Concurrency and Load Testing on real Socket.IO + DB stack.
 *
 * Simulates 10 rooms with 70 concurrent socket clients:
 *   - 20 players (2 per room)
 *   - 50 spectators (5 per room)
 * plus 2 concurrent AI games calculating moves.
 *
 * Connects real Socket.IO clients over WebSocket to the live server,
 * issues room/match subscriptions and concurrent moves with acks,
 * and measures round-trip latency percentiles (p50, p95, p99).
 */
import { io as createSocketClient, type Socket } from 'socket.io-client';
import crypto from 'node:crypto';
import type { AddressInfo } from 'node:net';
import {
  createTestContext,
  createAuthUser,
  type TestContext,
} from '../fixtures/integration.js';
import { createInitialPosition, applyMove } from '@xiangqi/game-rules';
import { searchBestMove } from '@xiangqi/ai';
import type { Position, Move, MatchSnapshot, CommandResult, ApiResult } from '@xiangqi/contracts';

export interface LoadMetrics {
  totalRooms: number;
  totalClients: number;
  totalAiMatches: number;
  totalRequests: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  maxMs: number;
  passed: boolean;
}

export async function runLoadTest(): Promise<LoadMetrics> {
  console.log('=== RUNNING CONCURRENCY & LOAD TEST (REAL SOCKET.IO + DB) ===');
  console.log('Target: 10 rooms, 70 concurrent socket clients (20 players + 50 spectators) + 2 AI matches');

  const ctx: TestContext = await createTestContext({ seed: true });
  const latencies: number[] = [];
  const activeSockets: Socket[] = [];

  try {
    // 1. Start the Fastify + Socket.IO server on an ephemeral loopback port
    await ctx.app.listen({ port: 0, host: '127.0.0.1' });
    const address = ctx.app.server.address() as AddressInfo;
    const serverUrl = `http://127.0.0.1:${address.port}`;
    console.log(`Server listening on ${serverUrl}`);

    // Helper to create an authenticated socket client
    async function connectSocket(token: string, tabId: string = crypto.randomUUID()): Promise<Socket> {
      const socket = createSocketClient(serverUrl, {
        transports: ['websocket'],
        auth: { accessToken: token, tabId },
        reconnection: false,
        timeout: 10_000,
      });
      activeSockets.push(socket);

      const start = performance.now();
      await new Promise<void>((resolve, reject) => {
        socket.on('connect', () => {
          latencies.push(performance.now() - start);
          resolve();
        });
        socket.on('connect_error', (err) => reject(err));
      });
      return socket;
    }

    // Helper for socket emitWithAck with latency measurement
    async function emitWithAck<T>(socket: Socket, event: string, payload: unknown): Promise<T> {
      const start = performance.now();
      const result = await new Promise<T>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`Timeout waiting for ack on ${event}`)), 10_000);
        socket.emit(event, payload, (res: ApiResult<T>) => {
          clearTimeout(timer);
          latencies.push(performance.now() - start);
          if (!res.ok) {
            reject(new Error(`Server error on ${event}: ${res.error.code} - ${res.error.message}`));
          } else {
            resolve(res.data);
          }
        });
      });
      return result;
    }

    // 2. Setup 10 rooms with 2 players each, start matches, and add 5 spectators each
    console.log('Creating 10 rooms and matches...');
    interface RoomFixture {
      roomId: string;
      matchId: string;
      redToken: string;
      blackToken: string;
      redUserId: string;
      blackUserId: string;
      redSocket: Socket;
      blackSocket: Socket;
      spectatorSockets: Socket[];
    }

    const fixtures: RoomFixture[] = [];

    for (let r = 0; r < 10; r++) {
      // Create user A (Red) and user B (Black)
      const uRed = await createAuthUser({
        email: `p_red_${r}_${ctx.runId}@local.test`,
        username: `load_r_${r}_${ctx.runId}`,
        displayName: `Player Red ${r}`,
      });
      const uBlack = await createAuthUser({
        email: `p_blk_${r}_${ctx.runId}@local.test`,
        username: `load_b_${r}_${ctx.runId}`,
        displayName: `Player Black ${r}`,
      });

      // Create room via HTTP
      const roomRes = await ctx.app.inject({
        method: 'POST',
        url: '/api/v1/rooms',
        headers: { authorization: `Bearer ${uRed.accessToken}` },
        payload: { name: `Load Room ${r}`, visibility: 'PUBLIC', timeControl: 300 },
      });
      const roomId = (roomRes.json() as { data: { id: string } }).data.id;

      // Join room as Black
      await ctx.app.inject({
        method: 'POST',
        url: '/api/v1/rooms/join',
        headers: { authorization: `Bearer ${uBlack.accessToken}` },
        payload: { roomId, role: 'PLAYER' },
      });

      // Both players set ready
      await ctx.app.inject({
        method: 'POST',
        url: `/api/v1/rooms/${roomId}/ready`,
        headers: { authorization: `Bearer ${uRed.accessToken}` },
        payload: { ready: true },
      });
      const readyBlackRes = await ctx.app.inject({
        method: 'POST',
        url: `/api/v1/rooms/${roomId}/ready`,
        headers: { authorization: `Bearer ${uBlack.accessToken}` },
        payload: { ready: true },
      });

      const matchId = (readyBlackRes.json() as { data: { matchSnapshot: MatchSnapshot } }).data.matchSnapshot.id;

      // Connect real WebSocket clients for Red and Black
      const redSocket = await connectSocket(uRed.accessToken!);
      const blackSocket = await connectSocket(uBlack.accessToken!);

      // Create 5 spectators for this room
      const spectatorSockets: Socket[] = [];
      for (let s = 0; s < 5; s++) {
        const uSpec = await createAuthUser({
          email: `s_${r}_${s}_${ctx.runId}@local.test`,
          username: `load_s_${r}_${s}_${ctx.runId}`,
          displayName: `Spectator ${r}-${s}`,
        });
        await ctx.app.inject({
          method: 'POST',
          url: '/api/v1/rooms/join',
          headers: { authorization: `Bearer ${uSpec.accessToken}` },
          payload: { roomId, role: 'SPECTATOR' },
        });
        const specSocket = await connectSocket(uSpec.accessToken!);
        spectatorSockets.push(specSocket);
      }

      fixtures.push({
        roomId,
        matchId,
        redToken: uRed.accessToken!,
        blackToken: uBlack.accessToken!,
        redUserId: uRed.id,
        blackUserId: uBlack.id,
        redSocket,
        blackSocket,
        spectatorSockets,
      });
    }

    console.log(`Connected 70 live socket clients across 10 rooms.`);

    // 3. Concurrent subscriptions across all 70 clients
    console.log('Executing concurrent subscriptions across all 70 clients...');
    const subPromises: Promise<unknown>[] = [];

    for (const f of fixtures) {
      // Red subscribes and claims control
      subPromises.push(emitWithAck(f.redSocket, 'match:subscribe', { matchId: f.matchId }));
      // Black subscribes to match
      subPromises.push(emitWithAck(f.blackSocket, 'match:subscribe', { matchId: f.matchId }));
      // 5 Spectators subscribe to match
      for (const s of f.spectatorSockets) {
        subPromises.push(emitWithAck(s, 'match:subscribe', { matchId: f.matchId }));
      }
    }

    const subResults = await Promise.all(subPromises);
    console.log(`Completed ${subResults.length} concurrent subscriptions.`);

    // 4. Concurrent gameplay: All 10 Red players submit their opening move concurrently via WebSocket
    console.log('Submitting concurrent opening moves across all 10 matches...');
    const movePromises: Promise<unknown>[] = [];

    // Red pawn move: (0,3) -> (0,4)
    const redMove: Move = { from: { x: 0, y: 3 }, to: { x: 0, y: 4 } };

    for (const f of fixtures) {
      // Claim control lease for Red player
      const takeoverRes = await ctx.app.inject({
        method: 'POST',
        url: '/api/v1/control/takeover',
        headers: { authorization: `Bearer ${f.redToken}` },
        payload: { tabId: crypto.randomUUID() },
      });
      const lease = (takeoverRes.json() as { data: { controllerId: string; controlEpoch: number } }).data;

      movePromises.push(
        emitWithAck<CommandResult>(f.redSocket, 'match:move', {
          matchId: f.matchId,
          controllerId: lease.controllerId,
          controlEpoch: lease.controlEpoch,
          commandId: crypto.randomUUID(),
          expectedVersion: 0,
          payload: redMove,
        }),
      );
    }

    const moveResults = await Promise.all(movePromises);
    console.log(`Completed ${moveResults.length} concurrent WebSocket moves.`);

    // 5. Concurrently run 2 AI games calculating moves
    console.log('Simulating 2 concurrent AI games...');
    let pos1: Position = createInitialPosition();
    let pos2: Position = createInitialPosition();

    for (let ply = 0; ply < 4; ply++) {
      const start1 = performance.now();
      const r1 = searchBestMove(
        {
          position: pos1,
          repetitionCounts: {},
          maxDepth: 2,
          deadlineMonoMs: performance.now() + 500,
          algorithm: 'ALPHA_BETA',
          seed: 100 + ply,
        },
        () => performance.now(),
        () => false,
      );
      latencies.push(performance.now() - start1);
      if (r1.move) pos1 = applyMove(pos1, r1.move);

      const start2 = performance.now();
      const r2 = searchBestMove(
        {
          position: pos2,
          repetitionCounts: {},
          maxDepth: 2,
          deadlineMonoMs: performance.now() + 500,
          algorithm: 'ALPHA_BETA',
          seed: 200 + ply,
        },
        () => performance.now(),
        () => false,
      );
      latencies.push(performance.now() - start2);
      if (r2.move) pos2 = applyMove(pos2, r2.move);
    }

    // 6. Calculate latency percentiles
    latencies.sort((a, b) => a - b);
    const p50 = latencies[Math.floor(latencies.length * 0.50)] ?? 0;
    const p95 = latencies[Math.floor(latencies.length * 0.95)] ?? 0;
    const p99 = latencies[Math.floor(latencies.length * 0.99)] ?? 0;
    const max = latencies[latencies.length - 1] ?? 0;

    const passed = p95 < 100; // Acceptance criteria: p95 latency < 100ms

    console.log(`\n=== LOAD TEST RESULTS ===`);
    console.log(`  Total operations measured: ${latencies.length}`);
    console.log(`  p50 Latency: ${p50.toFixed(2)} ms`);
    console.log(`  p95 Latency: ${p95.toFixed(2)} ms (Threshold: < 100 ms)`);
    console.log(`  p99 Latency: ${p99.toFixed(2)} ms`);
    console.log(`  Max Latency: ${max.toFixed(2)} ms`);
    console.log(`  Status: ${passed ? 'PASS' : 'FAIL'}\n`);

    return {
      totalRooms: 10,
      totalClients: 70,
      totalAiMatches: 2,
      totalRequests: latencies.length,
      p50Ms: p50,
      p95Ms: p95,
      p99Ms: p99,
      maxMs: max,
      passed,
    };
  } finally {
    // Cleanly disconnect all active sockets
    for (const s of activeSockets) {
      try {
        s.disconnect();
      } catch {
        // ignore
      }
    }
    await ctx.dispose();
  }
}

// Standalone execution
if (import.meta.url === `file://${process.argv[1]}`) {
  runLoadTest()
    .then((m) => process.exit(m.passed ? 0 : 1))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
