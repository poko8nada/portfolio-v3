import React from 'hono/jsx';
import { Hono } from 'hono';

import { jsxRenderer } from 'hono/jsx-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import route from '.';

const createMockCtx = (): ExecutionContext => ({
  waitUntil: vi.fn(),
  passThroughOnException: vi.fn(),
  props: {},
});

const createMockBucket = (overrides: Partial<R2Bucket> = {}): R2Bucket => {
  return {
    get: vi.fn(),
    list: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    head: vi.fn(),
    createMultipartUpload: vi.fn(),
    resumeMultipartUpload: vi.fn(),
    ...overrides,
  } as unknown as R2Bucket;
};

const createTestApp = () => {
  const app = new Hono<{
    Bindings: {
      POSTS_BUCKET: R2Bucket;
      RESUME_ASSETS_BUCKET: R2Bucket;
    };
  }>();

  app.use(
    '*',
    jsxRenderer(({ children }) => (
      <html lang='ja'>
        <body>{children}</body>
      </html>
    )),
  );
  app.get('/about', ...route);

  return app;
};

describe('/about route', () => {
  const mockCache = {
    match: vi.fn(),
    put: vi.fn(),
  };
  const mockCacheStorage = {
    open: vi.fn().mockResolvedValue(mockCache),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('caches', mockCacheStorage);
  });

  it('renders markdown from RESUME_ASSETS_BUCKET and does not touch POSTS_BUCKET', async () => {
    const mockCtx = createMockCtx();
    const postsBucket = createMockBucket();
    const resumeBucket = createMockBucket({
      get: vi.fn().mockResolvedValue({
        text: () =>
          Promise.resolve(`---
title: スキル
---

## フレームワーク

- React`),
      }),
    });

    mockCache.match.mockResolvedValue(null);

    const app = createTestApp();
    const response = await app.fetch(
      new Request('http://localhost/about'),
      {
        POSTS_BUCKET: postsBucket,
        RESUME_ASSETS_BUCKET: resumeBucket,
      },
      mockCtx,
    );

    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('X-Cache')).toBe('MISS');
    expect(body).toContain('About | Poko Hanada');
    expect(body).toContain('スキル');
    expect(body).toContain('<h2>フレームワーク</h2>');
    expect(resumeBucket.get).toHaveBeenCalledWith('resume/stack.md');
    expect(postsBucket.get).not.toHaveBeenCalled();
  });

  it('returns an error screen when the fixed markdown cannot be fetched', async () => {
    const mockCtx = createMockCtx();
    const app = createTestApp();
    const response = await app.fetch(
      new Request('http://localhost/about'),
      {
        POSTS_BUCKET: createMockBucket(),
        RESUME_ASSETS_BUCKET: createMockBucket({
          get: vi.fn().mockResolvedValue(null),
        }),
      },
      mockCtx,
    );

    const body = await response.text();

    expect(response.status).toBe(500);
    expect(body).toContain('Error | Poko Hanada');
    expect(body).toContain('Resume markdown not found: resume/stack.md');
  });

  it('returns an error screen when markdown transformation fails', async () => {
    const mockCtx = createMockCtx();
    mockCache.match.mockResolvedValue(null);

    const app = createTestApp();
    const response = await app.fetch(
      new Request('http://localhost/about'),
      {
        POSTS_BUCKET: createMockBucket(),
        RESUME_ASSETS_BUCKET: createMockBucket({
          get: vi.fn().mockResolvedValue({
            text: () => Promise.resolve('   '),
          }),
        }),
      },
      mockCtx,
    );

    const body = await response.text();

    expect(response.status).toBe(500);
    expect(body).toContain('Error | Poko Hanada');
    expect(body).toContain('Empty markdown content');
  });
});
