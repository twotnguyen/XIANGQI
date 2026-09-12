import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {
  MoveCommandSchema,
  ResignCommandSchema,
  ProposeCommandSchema,
  RespondCommandSchema,
  UndoAiCommandSchema,
  MatchCommandBaseSchema,
} from '@xiangqi/contracts';
import { makePosition } from '../fixtures/positions.js';

describe('Fix 1: Package exports dist smoke test', () => {
  it('built dist is importable by Node 24 outside Vitest', () => {
    const root = path.resolve(import.meta.dirname, '../..');
    // Build first
    execSync('pnpm build', { cwd: root, stdio: 'pipe' });
    // Verify dist files exist and are valid JS modules
    const distIndex = path.join(root, 'packages/contracts/dist/index.js');
    expect(fs.existsSync(distIndex)).toBe(true);
    const distDts = path.join(root, 'packages/contracts/dist/index.d.ts');
    expect(fs.existsSync(distDts)).toBe(true);

    // Run script from within apps/server which has @xiangqi/contracts as dependency
    const script = path.join(root, 'apps/server/_smoke.mjs');
    fs.writeFileSync(script, `
      import { BOARD_SIZE, squareToIndex } from '@xiangqi/contracts';
      console.log(JSON.stringify({ BOARD_SIZE, idx: squareToIndex({x:4,y:5}) }));
    `);
    try {
      const result = execSync(`node ${script}`, {
        cwd: path.join(root, 'apps/server'),
        stdio: 'pipe', encoding: 'utf-8',
      });
      const data = JSON.parse(result.trim());
      expect(data.BOARD_SIZE).toBe(90);
      expect(data.idx).toBe(49);
    } finally {
      fs.unlinkSync(script);
    }
  });

  it('game-rules dist importable', () => {
    const root = path.resolve(import.meta.dirname, '../..');
    // Verify dist files exist
    const distIndex = path.join(root, 'packages/game-rules/dist/index.js');
    expect(fs.existsSync(distIndex)).toBe(true);

    // Import directly using file path to verify exports resolve
    const result = execSync(
      `node -e "const m = await import('file://${distIndex}'); console.log(m.createInitialPosition().board.filter(Boolean).length)"`,
      { cwd: root, stdio: 'pipe', encoding: 'utf-8' },
    );
    expect(result.trim()).toBe('32');
  });
});

describe('Fix 2: MatchCommand schemas with payload', () => {
  it('MoveCommandSchema accepts valid move command', () => {
    const cmd = {
      commandId: '550e8400-e29b-41d4-a716-446655440000',
      expectedVersion: 5,
      payload: { from: { x: 4, y: 0 }, to: { x: 4, y: 1 } },
    };
    expect(MoveCommandSchema.safeParse(cmd).success).toBe(true);
  });

  it('MoveCommandSchema rejects command without payload', () => {
    const cmd = {
      commandId: '550e8400-e29b-41d4-a716-446655440000',
      expectedVersion: 5,
    };
    expect(MoveCommandSchema.safeParse(cmd).success).toBe(false);
  });

  it('ResignCommandSchema accepts empty payload', () => {
    const cmd = {
      commandId: '550e8400-e29b-41d4-a716-446655440000',
      expectedVersion: 5,
      payload: {},
    };
    expect(ResignCommandSchema.safeParse(cmd).success).toBe(true);
  });

  it('ProposeCommandSchema requires kind', () => {
    const good = {
      commandId: '550e8400-e29b-41d4-a716-446655440000',
      expectedVersion: 5,
      payload: { kind: 'DRAW' },
    };
    const bad = {
      commandId: '550e8400-e29b-41d4-a716-446655440000',
      expectedVersion: 5,
      payload: {},
    };
    expect(ProposeCommandSchema.safeParse(good).success).toBe(true);
    expect(ProposeCommandSchema.safeParse(bad).success).toBe(false);
  });

  it('RespondCommandSchema requires proposalId and accept', () => {
    const good = {
      commandId: '550e8400-e29b-41d4-a716-446655440000',
      expectedVersion: 5,
      payload: {
        proposalId: '550e8400-e29b-41d4-a716-446655440001',
        accept: true,
      },
    };
    expect(RespondCommandSchema.safeParse(good).success).toBe(true);
  });

  it('UndoAiCommandSchema accepts empty payload', () => {
    const cmd = {
      commandId: '550e8400-e29b-41d4-a716-446655440000',
      expectedVersion: 5,
      payload: {},
    };
    expect(UndoAiCommandSchema.safeParse(cmd).success).toBe(true);
  });

  it('MatchCommandBaseSchema rejects unknown fields', () => {
    const cmd = {
      commandId: '550e8400-e29b-41d4-a716-446655440000',
      expectedVersion: 5,
      secret: 'hacked',
    };
    expect(MatchCommandBaseSchema.safeParse(cmd).success).toBe(false);
  });
});

describe('Fix 3: makePosition validates coordinate bounds', () => {
  it('rejects x=9 (out of board)', () => {
    expect(() =>
      makePosition(
        [
          { id: 'rg', type: 'GENERAL', side: 'RED', x: 4, y: 0 },
          { id: 'bg', type: 'GENERAL', side: 'BLACK', x: 9, y: 9 },
        ],
        'RED',
      ),
    ).toThrow('x out of bounds');
  });

  it('rejects y=-1', () => {
    expect(() =>
      makePosition(
        [
          { id: 'rg', type: 'GENERAL', side: 'RED', x: 4, y: -1 },
          { id: 'bg', type: 'GENERAL', side: 'BLACK', x: 4, y: 9 },
        ],
        'RED',
      ),
    ).toThrow('y out of bounds');
  });

  it('rejects non-integer x=1.5', () => {
    expect(() =>
      makePosition(
        [
          { id: 'rg', type: 'GENERAL', side: 'RED', x: 1.5, y: 0 },
          { id: 'bg', type: 'GENERAL', side: 'BLACK', x: 4, y: 9 },
        ],
        'RED',
      ),
    ).toThrow('x out of bounds');
  });
});
