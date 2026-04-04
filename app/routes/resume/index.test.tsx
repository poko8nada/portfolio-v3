import React from 'hono/jsx';
import { Hono } from 'hono';
import { jsxRenderer } from 'hono/jsx-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import route from '.';

const RESUME_DOCUMENT = JSON.stringify({
  profile: {
    date: '2026-04-01',
    nameKana: 'テスト タロウ',
    name: 'テスト 太郎',
    birthDay: '1990-01-01',
    gender: '男',
    cellPhone: '000',
    email: 't@example.com',
  },
  address: {
    zip: '',
    kana: '',
    value: '',
    tel: '',
    fax: '',
  },
  education: [],
  experience: [],
  licenses: [],
  motivation: '',
  request: '',
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
  app.get('/resume', ...route);

  return app;
};

describe('/resume route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('caches', mockCacheStorage);
    mockCache.match.mockResolvedValue(null);
  });

  it('renders an error page when the resume document cannot be fetched', async () => {
    const app = createTestApp();
    const bucket = createMockBucket({
      get: vi.fn().mockRejectedValue(new Error('R2 error')),
    });
    const response = await app.fetch(
      new Request('http://localhost/resume'),
      { RESUME_ASSETS_BUCKET: bucket },
      createMockCtx(),
    );

    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain('Error | Poko Hanada');
    expect(body).toContain('Error: R2 error');
  });

  it('requests resume/resume.json from the resume assets bucket', async () => {
    const app = createTestApp();
    const get = vi.fn().mockResolvedValue({
      text: () => Promise.resolve(RESUME_DOCUMENT),
    });
    const bucket = createMockBucket({ get });
    await app.fetch(
      new Request('http://localhost/resume'),
      { RESUME_ASSETS_BUCKET: bucket },
      createMockCtx(),
    );

    expect(get).toHaveBeenCalledWith('resume/resume.json');
  });

  it('renders an error page when JSON validation fails', async () => {
    const app = createTestApp();
    const bucket = createMockBucket({
      get: vi.fn().mockResolvedValue({
        text: () => Promise.resolve('{}'),
      }),
    });
    const response = await app.fetch(
      new Request('http://localhost/resume'),
      { RESUME_ASSETS_BUCKET: bucket },
      createMockCtx(),
    );

    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain('Error | Poko Hanada');
  });

  it('renders the resume page when the document is valid', async () => {
    const app = createTestApp();
    const bucket = createMockBucket({
      get: vi.fn().mockResolvedValue({
        text: () => Promise.resolve(RESUME_DOCUMENT),
      }),
    });
    const response = await app.fetch(
      new Request('http://localhost/resume'),
      { RESUME_ASSETS_BUCKET: bucket },
      createMockCtx(),
    );

    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain('Resume | Poko Hanada');
    expect(body).toContain('data-resume-page-root');
  });
});
