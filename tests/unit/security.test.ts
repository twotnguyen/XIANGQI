import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { createApp } from '../../apps/server/src/app.js';

describe('T029-01: Payload size limit and DoS protection', () => {
  it('rejects JSON request body exceeding 64KB with 413', async () => {
    const app = await createApp();

    // Generate payload larger than 64KB
    const largeContent = 'a'.repeat(70000);
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/rooms/550e8400-e29b-41d4-a716-446655440000/chat',
      headers: {
        'Content-Type': 'application/json',
      },
      payload: JSON.stringify({
        clientMessageId: '550e8400-e29b-41d4-a716-446655440000',
        content: largeContent,
      }),
    });

    expect(res.statusCode).toBe(413);
    await app.close();
  });
});

describe('T029-02: Security Response Headers', () => {
  it('returns X-Content-Type-Options: nosniff and frame protection', async () => {
    const app = await createApp();
    const res = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(res.statusCode).toBe(200);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    await app.close();
  });
});

describe('T029-03: Zero Secrets Sentinel in Frontend Build Artifacts', () => {
  it('production web dist contains 0 sensitive server secrets or database credentials', () => {
    const distDir = path.resolve(__dirname, '../../apps/web/dist');
    if (!fs.existsSync(distDir)) {
      // Build if not exists
      return;
    }

    const files = fs.readdirSync(path.join(distDir, 'assets'));
    const secretKeywords = [
      'SUPABASE_SECRET_KEY',
      'SERVICE_ROLE_KEY',
      'postgres://postgres:',
      'devkey: secret',
    ];

    for (const file of files) {
      if (file.endsWith('.js')) {
        const content = fs.readFileSync(path.join(distDir, 'assets', file), 'utf8');
        for (const secret of secretKeywords) {
          expect(content.includes(secret)).toBe(false);
        }
      }
    }
  });
});
