/**
 * ISSUE-024 / ISSUE-025 — real-service evidence (integration lane).
 *
 * Requires the LOCAL stack from .env.test (loopback-guarded by
 * tests/integration/setup.ts): Postgres + Auth at 127.0.0.1, and a LiveKit SFU at
 * LIVEKIT_URL with LIVEKIT_API_KEY/LIVEKIT_API_SECRET. Missing services fail
 * loudly; nothing here is skipped.
 *
 * What is proven:
 *  - policy authority: DB persistence, optimistic `policyVersion` concurrency,
 *    APPLIED only after the SFU ack, generation rotation, restart recovery;
 *  - real media: two real WebRTC clients (Chromium + livekit-client) publish and
 *    subscribe through the SFU, a positive control reads inbound RTP bytes/frames
 *    BEFORE zero incoming is used as deny evidence, and the denied stale
 *    generation receives nothing inside a bounded window;
 *  - source isolation: a viewer token cannot publish, a camera grant cannot
 *    publish the microphone, and a WATCH token cannot enter a PRIVATE room.
 *
 * What is NOT proven here (device/provider gates, reported as manual): real
 * camera/mic hardware capture, two physical networks/relay, Safari/Android.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { spawn, type ChildProcess } from 'node:child_process';
import crypto from 'node:crypto';
import dgram from 'node:dgram';
import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { chromium, type Browser, type Page } from '@playwright/test';
import { RoomServiceClient } from 'livekit-server-sdk';
import { createInitialPosition } from '@xiangqi/game-rules';
import {
  createTestContext,
  resetTestData,
  type TestContext,
  type TestUserKey,
} from '../fixtures/integration.js';
import {
  loadActiveTransports,
  recoverMediaOnBoot,
  rotateTransports,
  setSfuRoomAdmin,
  withMatchMediaLock,
} from '../../apps/server/src/modules/media/reconciler.js';
import {
  endMatchMedia,
  retryPendingMediaJobs,
} from '../../apps/server/src/modules/media/service.js';

const LIVEKIT_SPIKE_KEY = 'media-spike-devkey';
const LIVEKIT_SPIKE_SECRET = 'media-spike-local-secret-0123456789';

/**
 * The SFU used by this file.
 *
 * A browser on the SAME host as the SFU only pairs when the server keeps the
 * client's loopback/local host candidates (`rtc.enable_loopback_candidate: true`);
 * with them filtered, ICE ends in "could not establish pc connection"
 * (reproduced against a stock `livekit-server --dev --bind 127.0.0.1`).
 *
 * So by default the spike provisions its own local `livekit-server` with that flag
 * and the loopback key below. Point it at an already-configured SFU instead with
 * `MEDIA_SPIKE_LIVEKIT_URL` (+ `_API_KEY`/`_API_SECRET`); the target must allow
 * loopback candidates for same-host media.
 */
let livekitUrl = '';
let livekitApiKey = '';
let livekitApiSecret = '';
let ownedSfu: { process: ChildProcess; configPath: string; log: string[] } | null = null;

function freeTcpPort(): Promise<number> {
  const probe = net.createServer();
  const done = Promise.withResolvers<number>();
  probe.listen(0, '127.0.0.1', () => {
    const address = probe.address();
    const port = typeof address === 'object' && address ? address.port : 0;
    probe.close(() => done.resolve(port));
  });
  probe.on('error', done.reject);
  return done.promise;
}

function freeUdpPort(): Promise<number> {
  const probe = dgram.createSocket('udp4');
  const done = Promise.withResolvers<number>();
  probe.bind(0, '127.0.0.1', () => {
    const address = probe.address();
    probe.close(() => done.resolve(address.port));
  });
  probe.on('error', done.reject);
  return done.promise;
}

async function waitForHttp(url: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // still starting
    }
    const pause = Promise.withResolvers<void>();
    setTimeout(pause.resolve, 200);
    await pause.promise;
  }
  throw new Error(`[media spike] SFU did not become ready at ${url}`);
}

/** Spawn a local SFU configured for same-host (loopback) WebRTC. */
async function startOwnedSfu(): Promise<void> {
  const binary = process.env['LIVEKIT_BINARY'] ?? 'livekit-server';
  const [httpPort, tcpPort, udpPort] = await Promise.all([freeTcpPort(), freeTcpPort(), freeUdpPort()]);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'xiangqi-media-spike-'));
  const configPath = path.join(dir, 'livekit.yaml');
  fs.writeFileSync(
    configPath,
    [
      `port: ${httpPort}`,
      'bind_addresses:',
      '  - 127.0.0.1',
      'rtc:',
      `  tcp_port: ${tcpPort}`,
      `  udp_port: ${udpPort}`,
      '  use_external_ip: false',
      '  enable_loopback_candidate: true',
      'keys:',
      `  ${LIVEKIT_SPIKE_KEY}: ${LIVEKIT_SPIKE_SECRET}`,
      'logging:',
      '  level: info',
      '',
    ].join('\n'),
  );

  const log: string[] = [];
  const child = spawn(binary, ['--config', configPath], { stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout?.on('data', (chunk: Buffer) => log.push(chunk.toString('utf8')));
  child.stderr?.on('data', (chunk: Buffer) => log.push(chunk.toString('utf8')));
  const exited = Promise.withResolvers<void>();
  child.on('exit', () => exited.resolve());

  const url = `http://127.0.0.1:${httpPort}`;
  try {
    await Promise.race([
      waitForHttp(url, 20_000),
      exited.promise.then(() => {
        throw new Error(
          `[media spike] ${binary} exited before becoming ready. Is livekit-server on PATH ` +
            `(set LIVEKIT_BINARY)? Log:\n${log.join('').slice(-2000)}`,
        );
      }),
    ]);
  } catch (error) {
    child.kill('SIGKILL');
    throw error;
  }

  ownedSfu = { process: child, configPath, log };
  livekitUrl = url;
  livekitApiKey = LIVEKIT_SPIKE_KEY;
  livekitApiSecret = LIVEKIT_SPIKE_SECRET;
}

async function stopOwnedSfu(): Promise<void> {
  if (!ownedSfu) return;
  const exited = Promise.withResolvers<void>();
  ownedSfu.process.once('exit', () => exited.resolve());
  ownedSfu.process.kill('SIGTERM');
  const timeout = Promise.withResolvers<void>();
  setTimeout(timeout.resolve, 5000);
  await Promise.race([exited.promise, timeout.promise]);
  if (ownedSfu.process.exitCode === null) ownedSfu.process.kill('SIGKILL');
  fs.rmSync(path.dirname(ownedSfu.configPath), { recursive: true, force: true });
  ownedSfu = null;
}

/** Use MEDIA_SPIKE_LIVEKIT_URL if given, otherwise provision a local SFU. */
async function resolveSfu(): Promise<void> {
  const external = process.env['MEDIA_SPIKE_LIVEKIT_URL'];
  if (external) {
    livekitUrl = external;
    livekitApiKey = process.env['MEDIA_SPIKE_LIVEKIT_API_KEY'] ?? process.env['LIVEKIT_API_KEY'] ?? 'devkey';
    livekitApiSecret = process.env['MEDIA_SPIKE_LIVEKIT_API_SECRET'] ?? process.env['LIVEKIT_API_SECRET'] ?? 'secret';
  } else {
    await startOwnedSfu();
  }
  // The product server mints grants from LIVEKIT_*; point it at the SFU under test.
  process.env['LIVEKIT_URL'] = livekitUrl;
  process.env['LIVEKIT_API_KEY'] = livekitApiKey;
  process.env['LIVEKIT_API_SECRET'] = livekitApiSecret;
  await assertSfuReachable();
}

function roomService(): RoomServiceClient {
  return new RoomServiceClient(livekitUrl, livekitApiKey, livekitApiSecret);
}

async function assertSfuReachable(): Promise<void> {
  try {
    await roomService().listRooms();
  } catch (error) {
    throw new Error(
      `[media spike] LiveKit SFU not reachable at ${livekitUrl}: ` +
        `${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    );
  }
}

interface Lease {
  controllerId: string;
  controlEpoch: number;
}

interface Fixture {
  roomId: string;
  matchId: string;
  leases: Record<'A' | 'B' | 'S1', Lease>;
}

interface ApiError {
  ok: false;
  error: { code: string; message: string };
}

/**
 * Numbers the reports quote. Printed at the end of the run so the evidence is
 * reproducible from the command output instead of transcribed by hand.
 */
const evidence: Record<string, number | string | boolean> = {};

const SFU_HARNESS_HTML = `<!doctype html>
<html><body style="margin:0">
<video id="remote" autoplay playsinline muted style="width:160px;height:120px;background:#000"></video>
<audio id="remoteAudio" autoplay></audio>
<script type="module">
import * as LK from '/livekit-client.esm.mjs';
window.LK = LK;
const state = { rooms: [], remote: new Map(), lastRoom: null, lastTrack: null, disconnected: false };
window.__state = state;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

window.__api = {
  async connect(url, token, autoSubscribe = true) {
    const room = new LK.Room({ adaptiveStream: false, dynacast: false });
    room.on(LK.RoomEvent.TrackSubscribed, (track, _pub, participant) => {
      const kind = track.kind === 'video' ? 'video' : 'audio';
      state.remote.set(participant.identity + ':' + kind, track);
      const element = document.getElementById(kind === 'video' ? 'remote' : 'remoteAudio');
      track.attach(element);
      element.play().catch(() => {});
    });
    room.on(LK.RoomEvent.TrackUnsubscribed, (track, _pub, participant) => {
      state.remote.delete(participant.identity + ':' + (track.kind === 'video' ? 'video' : 'audio'));
    });
    room.on(LK.RoomEvent.Disconnected, () => { state.disconnected = true; });
    await room.connect(url, token, { autoSubscribe });
    state.rooms.push(room);
    state.lastRoom = room;
    state.disconnected = false;
    return { identity: room.localParticipant.identity, roomName: room.name };
  },
  async publish(kind) {
    const room = state.lastRoom;
    if (!room) throw new Error('no connected room');
    const track = kind === 'video' ? await LK.createLocalVideoTrack() : await LK.createLocalAudioTrack();
    const source = kind === 'video' ? LK.Track.Source.Camera : LK.Track.Source.Microphone;
    const publication = await room.localParticipant.publishTrack(track, { source, simulcast: false });
    state.lastTrack = track;
    return { trackSid: publication.trackSid ?? null };
  },
  async tryPublish(kind) {
    try { await this.publish(kind); return { rejected: false, error: null }; }
    catch (error) { return { rejected: true, error: String((error && error.message) || error) }; }
  },
  remoteKeys() { return [...state.remote.keys()]; },
  async waitRemote(kind, timeoutMs) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (this.remoteKeys().some((key) => key.endsWith(':' + kind))) return true;
      await wait(100);
    }
    return this.remoteKeys().some((key) => key.endsWith(':' + kind));
  },
  async inbound(kind) {
    let bytes = 0, frames = 0, tracks = 0;
    for (const [key, track] of state.remote) {
      if (!key.endsWith(':' + kind)) continue;
      tracks += 1;
      const report = await track.getRTCStatsReport();
      if (!report) continue;
      report.forEach((entry) => {
        if (entry.type === 'inbound-rtp') {
          bytes += entry.bytesReceived || 0;
          frames += entry.framesDecoded || 0;
        }
      });
    }
    return { bytes, frames, tracks };
  },
  async waitInbound(kind, minBytes, timeoutMs) {
    const deadline = Date.now() + timeoutMs;
    let last = { bytes: 0, frames: 0, tracks: 0 };
    while (Date.now() < deadline) {
      last = await this.inbound(kind);
      if (last.bytes >= minBytes) return last;
      await wait(200);
    }
    return last;
  },
  async disconnectAll() {
    for (const room of state.rooms) { try { await room.disconnect(); } catch {} }
    state.rooms = [];
    state.remote.clear();
    state.lastRoom = null;
  },
  isDisconnected() { return state.disconnected === true; },
};
window.__ready = true;
</script></body></html>`;



async function startHarnessServer(): Promise<{ baseUrl: string; close: () => Promise<void> }> {
  // The browser needs the real SDK bundle; pnpm links it into apps/web/node_modules.
  const esmPath = path.resolve('apps/web/node_modules/livekit-client/dist/livekit-client.esm.mjs');
  if (!fs.existsSync(esmPath)) {
    throw new Error(`[media spike] livekit-client bundle missing at ${esmPath}; run pnpm install`);
  }

  const server = http.createServer((request, response) => {
    if (request.url === '/livekit-client.esm.mjs') {
      response.writeHead(200, { 'Content-Type': 'text/javascript' });
      response.end(fs.readFileSync(esmPath));
      return;
    }
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(SFU_HARNESS_HTML);
  });

  const listening = Promise.withResolvers<void>();
  server.listen(0, '127.0.0.1', () => listening.resolve());
  await listening.promise;
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('[media spike] harness server did not bind');
  return {
    baseUrl: `http://127.0.0.1:${address.port}/`,
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}

function controlHeaders(lease: Lease): Record<string, string> {
  return { 'x-control-id': lease.controllerId, 'x-control-epoch': String(lease.controlEpoch) };
}

function body<T>(response: { json(): unknown }): T {
  return response.json() as T;
}

describe('ISSUE-024/025 — DB-backed policy authority and real SFU media', () => {
  let ctx: TestContext;
  let fixture: Fixture;
  let browser: Browser;
  let harness: { baseUrl: string; close: () => Promise<void> };

  async function takeover(key: TestUserKey): Promise<Lease> {
    const res = await ctx.app.inject({
      method: 'POST',
      url: '/api/v1/control/takeover',
      headers: { ...ctx.authAs(key), 'content-type': 'application/json' },
      payload: { tabId: crypto.randomUUID() },
    });
    expect(res.statusCode).toBe(200);
    return body<{ ok: true; data: Lease }>(res).data;
  }

  async function createOnlineMatchFixture(): Promise<Fixture> {
    const roomId = crypto.randomUUID();
    const matchId = crypto.randomUUID();
    const client = await ctx.adminPool.connect();
    try {
      await client.query('BEGIN');
      await client.query('SET CONSTRAINTS ALL DEFERRED');
      await client.query(
        `INSERT INTO public.rooms (id, owner_id, name, visibility, status, room_version, time_control)
         VALUES ($1, $2, $3, 'PUBLIC', 'WAITING', 1, 0)`,
        [roomId, ctx.users.A.id, `spike-${ctx.runId}`],
      );
      await client.query(
        `INSERT INTO public.room_members (room_id, user_id, role, side)
         VALUES ($1, $2, 'PLAYER', 'RED'), ($1, $3, 'PLAYER', 'BLACK'), ($1, $4, 'SPECTATOR', NULL)`,
        [roomId, ctx.users.A.id, ctx.users.B.id, ctx.users.S1.id],
      );
      await client.query(
        `INSERT INTO public.matches
           (id, room_id, mode, status, red_user_id, black_user_id, position, version, ply, time_control, clock, rule_set_version)
         VALUES ($1, $2, 'ONLINE', 'ACTIVE', $3, $4, $5::jsonb, 0, 0, 0, NULL, 'xiangqi-simple-v1')`,
        [matchId, roomId, ctx.users.A.id, ctx.users.B.id, JSON.stringify(createInitialPosition())],
      );
      await client.query(`UPDATE public.rooms SET status = 'PLAYING', current_match_id = $2 WHERE id = $1`, [
        roomId,
        matchId,
      ]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    return {
      roomId,
      matchId,
      leases: { A: await takeover('A'), B: await takeover('B'), S1: await takeover('S1') },
    };
  }

  /**
   * The local DB is shared with any other integration run in flight. That lane's
   * restart-recovery probe (`recoverActiveMatchesOnBoot`) marks EVERY ACTIVE match
   * INTERRUPTED, so a long media test can lose its fixture through no fault of the
   * code under test. Rebuild the fixture instead of asserting against a terminal
   * match; the product behaviour (MATCH_ENDED) is covered by T025-07.
   */
  async function ensureActiveFixture(): Promise<void> {
    const res = await ctx.adminPool.query(`SELECT status FROM public.matches WHERE id = $1`, [
      fixture.matchId,
    ]);
    if (res.rows[0]?.status === 'ACTIVE') return;
    fixture = await createOnlineMatchFixture();
  }

  async function patchPolicy(
    key: TestUserKey,
    lease: Lease,
    payload: { matchId: string; kind: 'CAMERA' | 'MICROPHONE'; audience: string; policyVersion: number },
  ) {
    return ctx.app.inject({
      method: 'PATCH',
      url: '/api/v1/media/policy',
      headers: { ...ctx.authAs(key), ...controlHeaders(lease) },
      payload,
    });
  }

  async function readPolicy(key: TestUserKey, matchId: string) {
    const res = await ctx.app.inject({
      method: 'GET',
      url: `/api/v1/media/policy?matchId=${matchId}`,
      headers: ctx.authAs(key),
    });
    expect(res.statusCode).toBe(200);
    return body<{ ok: true; data: { policies: { userId: string; policyVersion: number; status: string }[] } }>(res)
      .data.policies;
  }

  async function ownVersion(key: TestUserKey, userId: string): Promise<number> {
    const policies = await readPolicy(key, fixture.matchId);
    return policies.find((policy) => policy.userId === userId)?.policyVersion ?? 0;
  }

  async function mediaSession(
    key: TestUserKey,
    lease: Lease,
    overrides: { controllerId?: string; headers?: Record<string, string> } = {},
  ) {
    return ctx.app.inject({
      method: 'POST',
      url: '/api/v1/media/session',
      headers: { ...ctx.authAs(key), ...controlHeaders(lease), ...(overrides.headers ?? {}) },
      payload: {
        roomId: fixture.roomId,
        matchId: fixture.matchId,
        controllerId: overrides.controllerId ?? lease.controllerId,
      },
    });
  }

  async function openClientPage(): Promise<Page> {
    const page = await browser.newPage();
    await page.goto(harness.baseUrl);
    await page.waitForFunction(() => (window as unknown as { __ready?: boolean }).__ready === true);
    return page;
  }

  beforeAll(async () => {
    await resolveSfu();
    harness = await startHarnessServer();
    browser = await chromium.launch({
      headless: true,
      args: [
        '--use-fake-device-for-media-stream',
        '--use-fake-ui-for-media-stream',
        '--autoplay-policy=no-user-gesture-required',
      ],
    });
    ctx = await createTestContext();
    fixture = await createOnlineMatchFixture();
  }, 180_000);

  afterAll(async () => {
    await browser?.close().catch(() => undefined);
    await harness?.close().catch(() => undefined);
    if (ctx) {
      await resetTestData(ctx.runId, ctx.adminPool).catch(() => undefined);
      await ctx.dispose().catch(() => undefined);
    }
    await stopOwnedSfu();
  }, 120_000);

  it('T025-05: policy lives in Postgres and boot recovery returns it to OFF with retired generations', { retry: 1 }, async () => {
    await ensureActiveFixture();
    const version = await ownVersion('A', ctx.users.A.id);
    const res = await patchPolicy('A', fixture.leases.A, {
      matchId: fixture.matchId,
      kind: 'CAMERA',
      audience: 'OPPONENT_ONLY',
      policyVersion: version,
    });
    expect(res.statusCode).toBe(200);
    const policy = body<{ ok: true; data: { policyVersion: number; status: string; applied: { camera: string } } }>(res).data;
    expect(policy.status).toBe('APPLIED');
    expect(policy.applied.camera).toBe('OPPONENT_ONLY');

    // A different connection (not the app pool) must see the committed row.
    const row = await ctx.adminPool.query(
      `SELECT camera_audience, applied_camera_audience, policy_version, applied_version, status
         FROM public.media_policies WHERE match_id = $1 AND user_id = $2`,
      [fixture.matchId, ctx.users.A.id],
    );
    expect(row.rows[0]).toMatchObject({
      camera_audience: 'OPPONENT_ONLY',
      applied_camera_audience: 'OPPONENT_ONLY',
      status: 'APPLIED',
    });
    expect(Number(row.rows[0].policy_version)).toBe(policy.policyVersion);
    expect(Number(row.rows[0].applied_version)).toBe(policy.policyVersion);

    // A session materializes the four generation-1 rooms.
    const before = await mediaSession('A', fixture.leases.A);
    expect(before.statusCode).toBe(200);
    const beforeGrants = body<{
      ok: true;
      data: { transports: { kind: string; audience: string; roomName: string; generation: number }[] };
    }>(before).data.transports;

    // Restart path: the media module exposes boot recovery for main.ts. Desired
    // returns to OFF and the old generations are retired before any new session.
    const recovered = await recoverMediaOnBoot(ctx.pool);
    expect(recovered.policiesReset).toBeGreaterThanOrEqual(1);
    expect(recovered.transportsRetired).toBeGreaterThanOrEqual(4);
    expect(recovered.failed).toBe(0);
    evidence['restart'] =
      `policiesReset=${recovered.policiesReset} transportsRetired=${recovered.transportsRetired} failed=${recovered.failed}`;

    const afterRestart = await readPolicy('A', fixture.matchId);
    const mine = afterRestart.find((item) => item.userId === ctx.users.A.id);
    expect(mine?.status).toBe('APPLIED');

    const transportsAfter = await ctx.adminPool.query(
      `SELECT status FROM public.media_transports WHERE match_id = $1`,
      [fixture.matchId],
    );
    expect(transportsAfter.rows.every((entry) => entry.status === 'RETIRED')).toBe(true);

    // The next session issues NEW generations and never reuses a retired room name.
    const session = await mediaSession('A', fixture.leases.A);
    expect(session.statusCode).toBe(200);
    const fresh = body<{
      ok: true;
      data: { ownPolicy: { desired: { camera: string } } | null; transports: { roomName: string; generation: number }[] };
    }>(session).data;
    expect(fresh.ownPolicy?.desired.camera).toBe('OFF');
    evidence['restart_generations'] = fresh.transports.map((grant) => grant.generation).join(',');
    expect(fresh.transports.length).toBe(beforeGrants.length);
    for (const grant of fresh.transports) {
      expect(grant.generation).toBeGreaterThan(1);
      expect(beforeGrants.some((old) => old.roomName === grant.roomName)).toBe(false);
    }
  }, 60_000);

  it('T025-06: two concurrent updates on one policyVersion — exactly one commits', { retry: 1 }, async () => {
    await ensureActiveFixture();
    const version = await ownVersion('A', ctx.users.A.id);
    const [first, second] = await Promise.all([
      patchPolicy('A', fixture.leases.A, {
        matchId: fixture.matchId,
        kind: 'CAMERA',
        audience: 'OPPONENT_AND_SPECTATORS',
        policyVersion: version,
      }),
      patchPolicy('A', fixture.leases.A, {
        matchId: fixture.matchId,
        kind: 'MICROPHONE',
        audience: 'OPPONENT_ONLY',
        policyVersion: version,
      }),
    ]);

    const statuses = [first.statusCode, second.statusCode].sort();
    expect(statuses).toEqual([200, 409]);
    const conflict = first.statusCode === 409 ? first : second;
    expect(body<ApiError>(conflict).error.code).toBe('CONFLICT');

    const row = await ctx.adminPool.query(
      `SELECT policy_version, camera_audience, microphone_audience, status
         FROM public.media_policies WHERE match_id = $1 AND user_id = $2`,
      [fixture.matchId, ctx.users.A.id],
    );
    expect(Number(row.rows[0].policy_version)).toBe(version + 1);
    // Exactly one selector moved; the loser's write is absent.
    const cameraMoved = row.rows[0].camera_audience === 'OPPONENT_AND_SPECTATORS';
    const micMoved = row.rows[0].microphone_audience === 'OPPONENT_ONLY';
    expect(Number(cameraMoved) + Number(micMoved)).toBe(1);
    evidence['concurrent_policy'] =
      `baseVersion=${version} committed=${row.rows[0].policy_version} statuses=${statuses.join('/')}`;
  }, 60_000);

  it('T025-07: forged policy, wrong kind/fields, missing lease, viewer write and forged controllerId are rejected', { retry: 1 }, async () => {
    await ensureActiveFixture();
    const version = await ownVersion('A', ctx.users.A.id);

    // Body may not name the opponent (or carry role/identity at all).
    const forged = await ctx.app.inject({
      method: 'PATCH',
      url: '/api/v1/media/policy',
      headers: { ...ctx.authAs('A'), ...controlHeaders(fixture.leases.A) },
      payload: {
        matchId: fixture.matchId,
        kind: 'CAMERA',
        audience: 'OFF',
        policyVersion: version,
        userId: ctx.users.B.id,
      },
    });
    expect(forged.statusCode).toBe(400);
    expect(body<ApiError>(forged).error.code).toBe('VALIDATION_ERROR');

    // A viewer has no own policy.
    const viewerWrite = await patchPolicy('S1', fixture.leases.S1, {
      matchId: fixture.matchId,
      kind: 'CAMERA',
      audience: 'OPPONENT_ONLY',
      policyVersion: 0,
    });
    expect(viewerWrite.statusCode).toBe(403);
    expect(body<ApiError>(viewerWrite).error.code).toBe('FORBIDDEN');

    // Missing / stale controller lease.
    const noLease = await ctx.app.inject({
      method: 'POST',
      url: '/api/v1/media/session',
      headers: { ...ctx.authAs('A'), 'content-type': 'application/json' },
      payload: { roomId: fixture.roomId, matchId: fixture.matchId, controllerId: fixture.leases.A.controllerId },
    });
    expect(noLease.statusCode).toBe(403);
    expect(body<ApiError>(noLease).error.code).toBe('CONTROL_REQUIRED');

    const staleEpoch = await mediaSession('A', fixture.leases.A, {
      headers: { 'x-control-epoch': String(fixture.leases.A.controlEpoch + 99) },
    });
    expect(staleEpoch.statusCode).toBe(403);
    expect(body<ApiError>(staleEpoch).error.code).toBe('CONTROL_REQUIRED');

    // Body controllerId must match the header.
    const mismatched = await mediaSession('A', fixture.leases.A, {
      controllerId: crypto.randomUUID(),
    });
    expect(mismatched.statusCode).toBe(403);

    // A's write never touches B's row.
    const rows = await ctx.adminPool.query(
      `SELECT user_id, policy_version FROM public.media_policies WHERE match_id = $1`,
      [fixture.matchId],
    );
    const bRow = rows.rows.find((entry) => entry.user_id === ctx.users.B.id);
    expect(bRow === undefined || Number(bRow.policy_version) === 0).toBe(true);
  }, 60_000);

  it('T025-08: a failed deleteRoom keeps APPLYING, never bumps the generation and surfaces MEDIA_UNAVAILABLE', { retry: 1 }, async () => {
    await ensureActiveFixture();
    // Narrowing A from public to OFF rotates PRIVATE+WATCH for the camera.
    const before = await ownVersion('A', ctx.users.A.id);
    const widen = await patchPolicy('A', fixture.leases.A, {
      matchId: fixture.matchId,
      kind: 'CAMERA',
      audience: 'OPPONENT_AND_SPECTATORS',
      policyVersion: before,
    });
    expect(widen.statusCode).toBe(200);

    const transportsBefore = await ctx.adminPool.query(
      `SELECT kind, audience, generation, room_name, status FROM public.media_transports
        WHERE match_id = $1 ORDER BY kind, audience, generation`,
      [fixture.matchId],
    );
    const readyBefore = transportsBefore.rows.filter((row) => row.status === 'READY');
    expect(readyBefore.length).toBeGreaterThan(0);
    const failedPhase = { rotating: 0, retainedApplied: '' };

    setSfuRoomAdmin({
      deleteRoom: async () => {
        throw new Error('simulated SFU outage');
      },
    });
    try {
      const version = await ownVersion('A', ctx.users.A.id);
      const res = await patchPolicy('A', fixture.leases.A, {
        matchId: fixture.matchId,
        kind: 'CAMERA',
        audience: 'OFF',
        policyVersion: version,
      });
      expect(res.statusCode).toBe(503);
      expect(body<ApiError>(res).error.code).toBe('MEDIA_UNAVAILABLE');

      // Desired is committed and restrictive; the applied side is untouched, so
      // no false APPLIED and no generation bump.
      const row = await ctx.adminPool.query(
        `SELECT camera_audience, applied_camera_audience, policy_version, applied_version, status
           FROM public.media_policies WHERE match_id = $1 AND user_id = $2`,
        [fixture.matchId, ctx.users.A.id],
      );
      expect(row.rows[0].camera_audience).toBe('OFF');
      expect(row.rows[0].applied_camera_audience).toBe('OPPONENT_AND_SPECTATORS');
      expect(row.rows[0].status).toBe('APPLYING');
      expect(Number(row.rows[0].applied_version)).toBeLessThan(Number(row.rows[0].policy_version));

      const transportsDuring = await ctx.adminPool.query(
        `SELECT kind, audience, generation, room_name, status FROM public.media_transports
          WHERE match_id = $1 ORDER BY kind, audience, generation`,
        [fixture.matchId],
      );
      expect(transportsDuring.rows.some((entry) => entry.status === 'ROTATING')).toBe(true);
      failedPhase.rotating = transportsDuring.rows.filter((entry) => entry.status === 'ROTATING').length;
      failedPhase.retainedApplied = row.rows[0].applied_camera_audience as string;
      const readyDuring = transportsDuring.rows.filter((entry) => entry.status === 'READY');
      expect(readyDuring.length).toBeLessThan(readyBefore.length);

      // The session cannot hand out grants to a half-rotated match.
      const blocked = await mediaSession('A', fixture.leases.A);
      expect(blocked.statusCode).toBe(503);
      expect(body<ApiError>(blocked).error.code).toBe('MEDIA_UNAVAILABLE');
    } finally {
      setSfuRoomAdmin(null);
    }

    // Retry path (the missing scheduler/operator hook) completes the rotation.
    const retried = await retryPendingMediaJobs(ctx.pool);
    expect(retried.failed).toBe(0);
    expect(retried.applied).toBeGreaterThanOrEqual(1);

    const transportsAfter = await ctx.adminPool.query(
      `SELECT kind, audience, generation, room_name, status FROM public.media_transports
        WHERE match_id = $1 AND kind = 'CAMERA' ORDER BY audience, generation`,
      [fixture.matchId],
    );
    const retired = transportsAfter.rows.filter((entry) => entry.status === 'RETIRED');
    const ready = transportsAfter.rows.filter((entry) => entry.status === 'READY');
    expect(retired.length).toBeGreaterThan(0);
    expect(ready.length).toBe(2);
    // Never reuse a retired room name.
    const names = new Set(transportsAfter.rows.map((entry) => entry.room_name));
    expect(names.size).toBe(transportsAfter.rows.length);

    const rowAfter = await ctx.adminPool.query(
      `SELECT status, policy_version, applied_version, applied_camera_audience
         FROM public.media_policies WHERE match_id = $1 AND user_id = $2`,
      [fixture.matchId, ctx.users.A.id],
    );
    expect(rowAfter.rows[0].status).toBe('APPLIED');
    expect(Number(rowAfter.rows[0].applied_version)).toBe(Number(rowAfter.rows[0].policy_version));
    expect(rowAfter.rows[0].applied_camera_audience).toBe('OFF');
    evidence['failed_delete_room'] =
      `rotating=${failedPhase.rotating} ` +
      `retainedApplied=${failedPhase.retainedApplied} retried=${retried.applied} ` +
      `ready=${ready.length} retiredCameraGens=${retired.map((entry) => entry.generation).join(',')} ` +
      `readyCameraGens=${ready.map((entry) => entry.generation).join(',')}`;
  }, 120_000);

  it('T024-06: authorized subscriber receives RTP bytes/frames, the denied stale generation receives none', { retry: 1 }, async () => {
    await ensureActiveFixture();
    // Make A's camera public so a WATCH camera room carries real media.
    for (const [kind, audience] of [
      ['CAMERA', 'OPPONENT_AND_SPECTATORS'],
      ['MICROPHONE', 'OFF'],
    ] as const) {
      const version = await ownVersion('A', ctx.users.A.id);
      const res = await patchPolicy('A', fixture.leases.A, {
        matchId: fixture.matchId,
        kind,
        audience,
        policyVersion: version,
      });
      expect(res.statusCode).toBe(200);
    }

    const aSession = await mediaSession('A', fixture.leases.A);
    expect(aSession.statusCode).toBe(200);
    const aGrants = body<{
      ok: true;
      data: { transports: { kind: string; audience: string; roomName: string; token: string; url: string; canPublish: boolean }[] };
    }>(aSession).data.transports;
    const aWatchCamera = aGrants.find((grant) => grant.kind === 'CAMERA' && grant.audience === 'WATCH');
    expect(aWatchCamera?.canPublish).toBe(true);

    const s1Session = await mediaSession('S1', fixture.leases.S1);
    expect(s1Session.statusCode).toBe(200);
    const s1Grants = body<{
      ok: true;
      data: { ownPolicy: unknown; transports: { kind: string; audience: string; roomName: string; token: string; url: string; canPublish: boolean; canSubscribe: boolean; publishSource: string | null }[] };
    }>(s1Session).data;
    expect(s1Grants.ownPolicy).toBeNull();
    const s1WatchCamera = s1Grants.transports.find((grant) => grant.kind === 'CAMERA' && grant.audience === 'WATCH');
    expect(s1WatchCamera?.canPublish).toBe(false);
    expect(s1WatchCamera?.canSubscribe).toBe(true);
    expect(s1WatchCamera?.publishSource).toBeNull();
    const staleToken = s1WatchCamera!.token;
    const staleRoomName = s1WatchCamera!.roomName;

    const publisher = await openClientPage();
    const viewer = await openClientPage();

    await publisher.evaluate(
      async ([url, token]) => {
        await (window as unknown as { __api: { connect: (u: string, t: string, s: boolean) => Promise<unknown> } }).__api.connect(url as string, token as string, false);
        await (window as unknown as { __api: { publish: (k: string) => Promise<unknown> } }).__api.publish('video');
      },
      [aWatchCamera!.url, aWatchCamera!.token] as const,
    );

    await viewer.evaluate(
      async ([url, token]) => {
        await (window as unknown as { __api: { connect: (u: string, t: string) => Promise<unknown> } }).__api.connect(url as string, token as string);
      },
      [s1WatchCamera!.url, s1WatchCamera!.token] as const,
    );

    const viewerReady = await viewer.evaluate(
      async (timeout: number) =>
        (window as unknown as { __api: { waitRemote: (k: string, t: number) => Promise<boolean> } }).__api.waitRemote('video', timeout),
      15_000,
    );
    expect(viewerReady).toBe(true);

    const positive = await viewer.evaluate(
      async (timeout: number) =>
        (window as unknown as { __api: { waitInbound: (k: string, m: number, t: number) => Promise<{ bytes: number; frames: number; tracks: number }> } }).__api.waitInbound('video', 10_000, timeout),
      20_000,
    );
    expect(positive.bytes).toBeGreaterThanOrEqual(10_000);
    expect(positive.frames).toBeGreaterThan(0);
    evidence['authorized_viewer_gen1'] = `bytes=${positive.bytes} frames=${positive.frames} tracks=${positive.tracks}`;

    // Viewer cannot publish, and a camera-only grant cannot publish a microphone.
    const viewerPublish = await viewer.evaluate(
      async () => (window as unknown as { __api: { tryPublish: (k: string) => Promise<{ rejected: boolean; error: string | null }> } }).__api.tryPublish('video'),
    );
    expect(viewerPublish.rejected).toBe(true);

    const publisherMic = await publisher.evaluate(
      async () => (window as unknown as { __api: { tryPublish: (k: string) => Promise<{ rejected: boolean; error: string | null }> } }).__api.tryPublish('audio'),
    );
    expect(publisherMic.rejected).toBe(true);

    // The viewer's plan never contains a PRIVATE transport: private rooms are
    // player-only and the room name lives in the server-signed token, so there is
    // nothing for a viewer to point at.
    expect(s1Grants.transports.some((grant) => grant.audience === 'PRIVATE')).toBe(false);
    expect(s1Grants.transports.every((grant) => grant.publishSource === null)).toBe(true);

    // SFU-side publication audit: the player holds exactly one published track in
    // the watch room while the viewer holds none (the client rejection above is
    // corroborated by the SFU's own participant view).
    const watchParticipants = await roomService().listParticipants(s1WatchCamera!.roomName);
    const publisherInfo = watchParticipants.find(
      (participant) => participant.identity === `${ctx.users.A.id}-${fixture.leases.A.controlEpoch}`,
    );
    const viewerInfo = watchParticipants.find(
      (participant) => participant.identity === `${ctx.users.S1.id}-${fixture.leases.S1.controlEpoch}`,
    );
    expect(publisherInfo?.tracks?.length ?? 0).toBe(1);
    expect(viewerInfo?.tracks?.length ?? 0).toBe(0);

    // Rotate the WATCH camera room by narrowing A's camera to OPPONENT_ONLY.
    const version = await ownVersion('A', ctx.users.A.id);
    const narrow = await patchPolicy('A', fixture.leases.A, {
      matchId: fixture.matchId,
      kind: 'CAMERA',
      audience: 'OPPONENT_ONLY',
      policyVersion: version,
    });
    expect(narrow.statusCode).toBe(200);
    expect(staleRoomName).not.toBe('');

    const rows = await ctx.adminPool.query(
      `SELECT kind, audience, generation, room_name, status, retired_at
         FROM public.media_transports
        WHERE match_id = $1 AND kind = 'CAMERA' AND audience = 'WATCH'
        ORDER BY generation`,
      [fixture.matchId],
    );
    expect(rows.rows.filter((row) => row.status === 'RETIRED').length).toBeGreaterThan(0);
    const readyWatch = rows.rows.find((row) => row.status === 'READY');
    expect(readyWatch).toBeDefined();
    expect(readyWatch!.room_name).not.toBe(staleRoomName);

    // The old room must be gone from the SFU after the acknowledged delete.
    const liveRooms = await roomService().listRooms();
    expect(liveRooms.some((room) => room.name === staleRoomName)).toBe(false);

    // Authorized positive control at the new generation: A publishes into the new
    // PRIVATE camera room and player B receives bytes/frames there.
    const aSession2 = await mediaSession('A', fixture.leases.A);
    const aGrants2 = body<{
      ok: true;
      data: { transports: { kind: string; audience: string; roomName: string; token: string; url: string; canPublish: boolean }[] };
    }>(aSession2).data.transports;
    const privatePublish = aGrants2.find((grant) => grant.kind === 'CAMERA' && grant.audience === 'PRIVATE');
    expect(privatePublish?.canPublish).toBe(true);

    const bSession = await mediaSession('B', fixture.leases.B);
    const bGrants = body<{
      ok: true;
      data: { transports: { kind: string; audience: string; roomName: string; token: string; url: string; canSubscribe: boolean }[] };
    }>(bSession).data.transports;
    const bPrivateSubscribe = bGrants.find((grant) => grant.kind === 'CAMERA' && grant.audience === 'PRIVATE');
    expect(bPrivateSubscribe?.canSubscribe).toBe(true);

    await publisher.evaluate(
      async () => (window as unknown as { __api: { disconnectAll: () => Promise<void> } }).__api.disconnectAll(),
    );
    const opponent = await openClientPage();
    await publisher.evaluate(
      async ([url, token]) => {
        await (window as unknown as { __api: { connect: (u: string, t: string, s: boolean) => Promise<unknown> } }).__api.connect(url as string, token as string, false);
        await (window as unknown as { __api: { publish: (k: string) => Promise<unknown> } }).__api.publish('video');
      },
      [privatePublish!.url, privatePublish!.token] as const,
    );
    await opponent.evaluate(
      async ([url, token]) => {
        await (window as unknown as { __api: { connect: (u: string, t: string) => Promise<unknown> } }).__api.connect(url as string, token as string);
      },
      [bPrivateSubscribe!.url, bPrivateSubscribe!.token] as const,
    );
    const opponentReady = await opponent.evaluate(
      async (timeout: number) =>
        (window as unknown as { __api: { waitRemote: (k: string, t: number) => Promise<boolean> } }).__api.waitRemote('video', timeout),
      15_000,
    );
    expect(opponentReady).toBe(true);
    const authorized = await opponent.evaluate(
      async (timeout: number) =>
        (window as unknown as { __api: { waitInbound: (k: string, m: number, t: number) => Promise<{ bytes: number; frames: number; tracks: number }> } }).__api.waitInbound('video', 10_000, timeout),
      20_000,
    );
    expect(authorized.bytes).toBeGreaterThanOrEqual(10_000);
    expect(authorized.frames).toBeGreaterThan(0);
    evidence['authorized_opponent_gen2'] =
      `bytes=${authorized.bytes} frames=${authorized.frames} tracks=${authorized.tracks}`;
    evidence['rotation'] =
      `retiredGen=${rows.rows.filter((row) => row.status === 'RETIRED').map((row) => row.generation).join(',')} ` +
      `readyGen=${readyWatch?.generation} readyRoom=${readyWatch?.room_name?.slice(-12)} ` +
      `retiredRoom=${staleRoomName.slice(-12)} distinct=${readyWatch?.room_name !== staleRoomName}`;

    // Denied peer: the saved pre-rotation viewer token joins the retired room in
    // the same run, inside a bounded observation window, and receives nothing.
    const stale = await openClientPage();
    await stale.evaluate(
      async ([url, token]) => {
        await (window as unknown as { __api: { connect: (u: string, t: string, s: boolean) => Promise<unknown> } }).__api.connect(url as string, token as string);
      },
      [s1WatchCamera!.url, staleToken] as const,
    );
    const staleWindowMs = 6_000;
    await stale.evaluate(async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)), staleWindowMs);
    const denied = await stale.evaluate(
      async () =>
        (window as unknown as { __api: { inbound: (k: string) => Promise<{ bytes: number; frames: number; tracks: number }> } }).__api.inbound('video'),
    );
    expect(denied.bytes).toBe(0);
    expect(denied.frames).toBe(0);
    expect(denied.tracks).toBe(0);
    evidence['denied_stale_viewer'] =
      `bytes=${denied.bytes} frames=${denied.frames} tracks=${denied.tracks} windowMs=${staleWindowMs} ` +
      `viewerPublishRejected=${viewerPublish.rejected} cameraTokenMicRejected=${publisherMic.rejected} ` +
      `sfuPublisherTracks=${publisherInfo?.tracks?.length ?? 0} sfuViewerTracks=${viewerInfo?.tracks?.length ?? 0}`;

    await Promise.all([
      publisher.evaluate(async () => (window as unknown as { __api: { disconnectAll: () => Promise<void> } }).__api.disconnectAll()),
      viewer.evaluate(async () => (window as unknown as { __api: { disconnectAll: () => Promise<void> } }).__api.disconnectAll()),
      opponent.evaluate(async () => (window as unknown as { __api: { disconnectAll: () => Promise<void> } }).__api.disconnectAll()),
      stale.evaluate(async () => (window as unknown as { __api: { disconnectAll: () => Promise<void> } }).__api.disconnectAll()),
    ]);
    await Promise.all([publisher.close(), viewer.close(), opponent.close(), stale.close()]);
  }, 180_000);

  it('T024-07: camera and microphone stay independent through the SFU (viewer gets mic bytes, zero video)', { retry: 1 }, async () => {
    await ensureActiveFixture();
    for (const [kind, audience] of [
      ['CAMERA', 'OFF'],
      ['MICROPHONE', 'OPPONENT_AND_SPECTATORS'],
    ] as const) {
      const version = await ownVersion('A', ctx.users.A.id);
      const res = await patchPolicy('A', fixture.leases.A, {
        matchId: fixture.matchId,
        kind,
        audience,
        policyVersion: version,
      });
      expect(res.statusCode).toBe(200);
    }

    const aSession = await mediaSession('A', fixture.leases.A);
    const publisher = await openClientPage();
    const viewer = await openClientPage();
    try {
      const grants = body<{
        ok: true;
        data: { transports: { kind: string; audience: string; roomName: string; token: string; url: string; canPublish: boolean }[] };
      }>(aSession).data.transports;
      const micPublish = grants.find((grant) => grant.kind === 'MICROPHONE' && grant.audience === 'WATCH');
      expect(micPublish?.canPublish).toBe(true);
      expect(grants.some((grant) => grant.kind === 'CAMERA' && grant.audience === 'WATCH' && grant.canPublish)).toBe(false);

      await publisher.evaluate(
        async ([url, token]) => {
          await (window as unknown as { __api: { connect: (u: string, t: string, s: boolean) => Promise<unknown> } }).__api.connect(url as string, token as string, false);
          await (window as unknown as { __api: { publish: (k: string) => Promise<unknown> } }).__api.publish('audio');
        },
        [micPublish!.url, micPublish!.token] as const,
      );

      const s1Session = await mediaSession('S1', fixture.leases.S1);
      const s1Grants = body<{
        ok: true;
        data: { transports: { kind: string; audience: string; roomName: string; token: string; url: string }[] };
      }>(s1Session).data.transports;
      const micSubscribe = s1Grants.find((grant) => grant.kind === 'MICROPHONE' && grant.audience === 'WATCH');

      await viewer.evaluate(
        async ([url, token]) => {
          await (window as unknown as { __api: { connect: (u: string, t: string) => Promise<unknown> } }).__api.connect(url as string, token as string);
        },
        [micSubscribe!.url, micSubscribe!.token] as const,
      );

      const audio = await viewer.evaluate(
        async (timeout: number) =>
          (window as unknown as { __api: { waitInbound: (k: string, m: number, t: number) => Promise<{ bytes: number; frames: number; tracks: number }> } }).__api.waitInbound('audio', 500, timeout),
        20_000,
      );
      expect(audio.bytes).toBeGreaterThanOrEqual(500);
      expect(audio.tracks).toBeGreaterThan(0);
      // Same viewer, same window: no camera source was shared, so no video track.
      const video = await viewer.evaluate(
        async () =>
          (window as unknown as { __api: { inbound: (k: string) => Promise<{ bytes: number; frames: number; tracks: number }> } }).__api.inbound('video'),
      );
      expect(video.tracks).toBe(0);
      expect(video.bytes).toBe(0);
      evidence['independent_sources'] =
        `micBytes=${audio.bytes} micTracks=${audio.tracks} cameraTracks=${video.tracks} cameraBytes=${video.bytes}`;
    } finally {
      await Promise.all([
        publisher.evaluate(async () => (window as unknown as { __api: { disconnectAll: () => Promise<void> } }).__api.disconnectAll()),
        viewer.evaluate(async () => (window as unknown as { __api: { disconnectAll: () => Promise<void> } }).__api.disconnectAll()),
      ]);
      await Promise.all([publisher.close(), viewer.close()]);
    }
  }, 180_000);

  it('T024-08: endMatchMedia retires every transport and never creates a new generation', { retry: 1 }, async () => {
    await ensureActiveFixture();
    await endMatchMedia(fixture.matchId, ctx.pool);

    const rows = await ctx.adminPool.query(
      `SELECT status, generation FROM public.media_transports WHERE match_id = $1`,
      [fixture.matchId],
    );
    expect(rows.rows.length).toBeGreaterThan(0);
    expect(rows.rows.every((row) => row.status === 'RETIRED')).toBe(true);

    const active = await loadActiveTransports(fixture.matchId, ctx.pool);
    expect(active).toHaveLength(0);
  }, 60_000);

  it('T025-09: rotation under the match lock serializes two writers and never reuses a room name', { retry: 1 }, async () => {
    await ensureActiveFixture();
    await withMatchMediaLock(
      fixture.matchId,
      async () => {
        const [first, second] = await Promise.all([
          rotateTransports(fixture.matchId, [{ kind: 'CAMERA', audience: 'PRIVATE' }], ctx.pool),
          rotateTransports(fixture.matchId, [{ kind: 'CAMERA', audience: 'PRIVATE' }], ctx.pool),
        ]);
        // Both calls observe the ACK and retire at most one generation each; the
        // partial unique index guarantees one active generation per tuple.
        expect(first.ok && second.ok).toBe(true);
      },
      ctx.pool,
    );

    const rows = await ctx.adminPool.query(
      `SELECT status, room_name, generation FROM public.media_transports
        WHERE match_id = $1 AND kind = 'CAMERA' AND audience = 'PRIVATE' ORDER BY generation`,
      [fixture.matchId],
    );
    const ready = rows.rows.filter((row) => row.status === 'READY');
    expect(ready.length).toBeLessThanOrEqual(1);
    const names = rows.rows.map((row) => row.room_name);
    expect(new Set(names).size).toBe(names.length);
  }, 60_000);

  afterAll(() => {
    console.log(`[media-spike-evidence] ${JSON.stringify(evidence, null, 2)}`);
  });
});
