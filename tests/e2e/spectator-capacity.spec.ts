/**
 * ISSUE-016 / R04 acceptance: 2 players + 5 viewers, and the 6th viewer is refused.
 *
 * Eight independent browser contexts against the real stack: the player's room
 * screen must report the live spectator count from the server, the five admitted
 * viewers must each be able to read the match, and the sixth join must be refused
 * with ROOM_FULL — proven both through the API and by the UI count staying at 5/5.
 */
import { test, expect } from '@playwright/test';
import crypto from 'node:crypto';
import {
  API_URL,
  assertStackUp,
  authHeader,
  deleteUser,
  loginViaUi,
  seedUser,
  signIn,
  type SeededUser,
} from './helpers/local-stack.js';

test.describe('Spectator capacity on the live stack', () => {
  test('T016-E2E-02: two players plus five viewers join, the sixth is refused', async ({
    browser,
    request,
  }) => {
    test.setTimeout(120_000);
    await assertStackUp(request);

    const runId = crypto.randomUUID().replace(/-/g, '').slice(0, 10);
    const users: SeededUser[] = [];
    const contexts = [];

    try {
      // 2 players + 6 viewers, each seeded as a real Supabase user.
      const players = [await seedUser(runId, 'pa'), await seedUser(runId, 'pb')];
      const viewers: SeededUser[] = [];
      for (let i = 0; i < 6; i += 1) viewers.push(await seedUser(runId, `v${i}`));
      users.push(...players, ...viewers);

      const playerToken = await signIn(players[0].email, players[0].password);
      const blackToken = await signIn(players[1].email, players[1].password);

      const created = await request.post(`${API_URL}/api/v1/rooms`, {
        headers: authHeader(playerToken),
        data: { name: `capacity-${runId}`, visibility: 'PUBLIC', timeControl: 300 },
      });
      expect(created.status(), 'POST /rooms').toBe(200);
      const roomId = ((await created.json()) as { data: { id: string } }).data.id;

      const joinBlack = await request.post(`${API_URL}/api/v1/rooms/join`, {
        headers: authHeader(blackToken),
        data: { roomId, role: 'PLAYER' },
      });
      expect(joinBlack.status(), 'player B joins').toBe(200);

      // The owner's screen is opened first so the count it shows is a live server value.
      const ctx = await browser.newContext();
      contexts.push(ctx);
      const page = await ctx.newPage();
      await loginViaUi(page, players[0].username, players[0].password);
      await page.goto(`/rooms/${roomId}`);
      await expect(page.getByTestId('seat-black')).toContainText(players[1].id.slice(0, 8), {
        timeout: 20_000,
      });

      // Five viewers are admitted by the server, each in its own context.
      for (let i = 0; i < 5; i += 1) {
        const viewerToken = await signIn(viewers[i].email, viewers[i].password);
        const join = await request.post(`${API_URL}/api/v1/rooms/join`, {
          headers: authHeader(viewerToken),
          data: { roomId, role: 'SPECTATOR' },
        });
        expect(join.status(), `viewer ${i + 1} joins`).toBe(200);

        const viewerCtx = await browser.newContext();
        contexts.push(viewerCtx);
        const viewerPage = await viewerCtx.newPage();
        await loginViaUi(viewerPage, viewers[i].username, viewers[i].password);
        await viewerPage.goto(`/rooms/${roomId}`);
        // The viewer really reads this room (not a redirect/error) and sees the panel.
        await expect(viewerPage.getByRole('heading', { name: `capacity-${runId}` })).toBeVisible({
          timeout: 20_000,
        });
        await expect(viewerPage.getByTestId('spectator-panel')).toBeVisible();
      }

      // The owner's panel reports the server-side count.
      await expect(page.getByTestId('spectator-count')).toHaveText(/5\s*\/\s*5/, {
        timeout: 20_000,
      });

      // The sixth viewer is refused, and no membership row is created for them.
      const overflowToken = await signIn(viewers[5].email, viewers[5].password);
      const overflow = await request.post(`${API_URL}/api/v1/rooms/join`, {
        headers: authHeader(overflowToken),
        data: { roomId, role: 'SPECTATOR' },
      });
      expect(overflow.status(), 'sixth viewer is refused').toBe(409);
      expect(((await overflow.json()) as { error: { code: string } }).error.code).toBe('ROOM_FULL');

      const overflowRead = await request.get(`${API_URL}/api/v1/rooms/${roomId}`, {
        headers: authHeader(overflowToken),
      });
      expect(overflowRead.status(), 'refused viewer cannot read the room').toBeGreaterThanOrEqual(
        400,
      );

      // The count is unchanged after the refusal.
      await expect(page.getByTestId('spectator-count')).toHaveText(/5\s*\/\s*5/);
    } finally {
      for (const ctx of contexts) await ctx.close().catch(() => undefined);
      for (const user of users) await deleteUser(user);
    }
  });
});
