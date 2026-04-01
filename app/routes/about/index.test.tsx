import React from 'hono/jsx';
import { Hono } from 'hono';
import { jsxRenderer } from 'hono/jsx-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import route from '.';

const STACK_DOCUMENT = JSON.stringify({
  stacks: [
    { label: 'Cursor / CLI', genre: 'AI', frequency: '★★★ | Daily' },
    { label: 'TypeScript / JavaScript', genre: 'Markup', frequency: '★★★ | Daily' },
    { label: 'React', genre: 'Frontend', frequency: '☆★★ | Often' },
    { label: 'HeroUI', genre: 'Frontend', frequency: '☆☆★ | Sometimes' },
  ],
});

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

const mockCache = {
  match: vi.fn(),
  put: vi.fn(),
};

const mockCacheStorage = {
  open: vi.fn().mockResolvedValue(mockCache),
};

const createTestApp = () => {
  const app = new Hono<{ Bindings: { RESUME_ASSETS_BUCKET: R2Bucket } }>();

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
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('caches', mockCacheStorage);
    mockCache.match.mockResolvedValue(null);
  });

  it('renders genre groups by default', async () => {
    const app = createTestApp();
    const bucket = createMockBucket({
      get: vi.fn().mockResolvedValue({
        text: () => Promise.resolve(STACK_DOCUMENT),
      }),
    });
    const response = await app.fetch(
      new Request('http://localhost/about'),
      { RESUME_ASSETS_BUCKET: bucket },
      createMockCtx(),
    );

    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain('About | Poko Hanada');
    expect(body).toContain('ジャンル');
    expect(body).toContain('使用頻度');
    expect(body).toContain('AI');
    expect(body).toContain('Markup');
    expect(body).toContain('TypeScript / JavaScript');
  });

  it('renders frequency groups when requested', async () => {
    const app = createTestApp();
    const bucket = createMockBucket({
      get: vi.fn().mockResolvedValue({
        text: () => Promise.resolve(STACK_DOCUMENT),
      }),
    });
    const response = await app.fetch(
      new Request('http://localhost/about?sort=frequency'),
      { RESUME_ASSETS_BUCKET: bucket },
      createMockCtx(),
    );

    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain('使用頻度');
    expect(body).toContain('★★★ | Daily');
    expect(body).toContain('☆★★ | Often');
    expect(body).toContain('☆☆★ | Sometimes');
    expect(body).toContain('HeroUI');
  });

  it('falls back to genre groups for an invalid sort value', async () => {
    const app = createTestApp();
    const bucket = createMockBucket({
      get: vi.fn().mockResolvedValue({
        text: () => Promise.resolve(STACK_DOCUMENT),
      }),
    });
    const response = await app.fetch(
      new Request('http://localhost/about?sort=invalid'),
      { RESUME_ASSETS_BUCKET: bucket },
      createMockCtx(),
    );

    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain('AI');
    expect(body).toContain('Markup');
    expect(body).not.toContain(
      '<h3 class="mb-4 text-lg font-medium text-text-primary">★★★ | Daily</h3>',
    );
  });

  it('renders an error page when the stack document cannot be fetched', async () => {
    const app = createTestApp();
    const bucket = createMockBucket({
      get: vi.fn().mockRejectedValue(new Error('R2 error')),
    });
    const response = await app.fetch(
      new Request('http://localhost/about'),
      { RESUME_ASSETS_BUCKET: bucket },
      createMockCtx(),
    );

    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain('Error | Poko Hanada');
    expect(body).toContain('Error: R2 error');
  });

  it('renders an error page when the stack document is invalid', async () => {
    const app = createTestApp();
    const bucket = createMockBucket({
      get: vi.fn().mockResolvedValue({
        text: () => Promise.resolve(JSON.stringify({ stacks: [{ label: 'Cursor / CLI' }] })),
      }),
    });
    const response = await app.fetch(
      new Request('http://localhost/about'),
      { RESUME_ASSETS_BUCKET: bucket },
      createMockCtx(),
    );

    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain('Error | Poko Hanada');
    expect(body).toContain('Error: Invalid about stack item at index 0');
  });
});
