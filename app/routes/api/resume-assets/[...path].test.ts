import { Hono } from 'hono';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import route from './[...path]';

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
  const app = new Hono<{ Bindings: { RESUME_ASSETS_BUCKET: R2Bucket } }>();
  app.all('/api/resume-assets/*', ...route);
  return app;
};

describe('API /api/resume-assets/* route', () => {
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

  it('returns asset with correct headers and X-Cache: MISS when not in cache', async () => {
    const mockCtx = createMockCtx();
    const mockBucket = createMockBucket({
      get: vi.fn().mockResolvedValue({
        body: new ReadableStream(),
        httpMetadata: { contentType: 'image/png' },
        httpEtag: '"resume-photo"',
      }),
    });
    mockCache.match.mockResolvedValue(null);

    const app = createTestApp();
    const req = new Request('http://localhost/api/resume-assets/resume/profile/main.png');
    const res = await app.fetch(req, { RESUME_ASSETS_BUCKET: mockBucket }, mockCtx);

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/png');
    expect(res.headers.get('ETag')).toBe('"resume-photo"');
    expect(res.headers.get('X-Cache')).toBe('MISS');
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=604800');
    expect(mockBucket.get).toHaveBeenCalledWith('resume/profile/main.png');
  });

  it('returns asset from cache with X-Cache: HIT', async () => {
    const mockCtx = createMockCtx();
    const mockBucket = createMockBucket();
    mockCache.match.mockResolvedValue(
      new Response(new ReadableStream(), {
        headers: { 'Content-Type': 'image/jpeg', ETag: '"hit789"' },
      }),
    );

    const app = createTestApp();
    const req = new Request('http://localhost/api/resume-assets/resume/profile/photo.jpg');
    const res = await app.fetch(req, { RESUME_ASSETS_BUCKET: mockBucket }, mockCtx);

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/jpeg');
    expect(res.headers.get('X-Cache')).toBe('HIT');
    expect(mockBucket.get).not.toHaveBeenCalled();
  });

  it('decodes encoded path segments', async () => {
    const mockCtx = createMockCtx();
    const mockBucket = createMockBucket({
      get: vi.fn().mockResolvedValue({
        body: new ReadableStream(),
      }),
    });
    mockCache.match.mockResolvedValue(null);

    const app = createTestApp();
    const req = new Request(
      'http://localhost/api/resume-assets/resume/profile/profile%20image.png',
    );
    await app.fetch(req, { RESUME_ASSETS_BUCKET: mockBucket }, mockCtx);

    expect(mockBucket.get).toHaveBeenCalledWith('resume/profile/profile image.png');
  });

  it('infers image content type from extension when metadata is missing', async () => {
    const mockCtx = createMockCtx();
    const mockBucket = createMockBucket({
      get: vi.fn().mockResolvedValue({
        body: new ReadableStream(),
      }),
    });
    mockCache.match.mockResolvedValue(null);

    const app = createTestApp();
    const req = new Request('http://localhost/api/resume-assets/resume/images/profile.jpg');
    const res = await app.fetch(req, { RESUME_ASSETS_BUCKET: mockBucket }, mockCtx);

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/jpeg');
  });

  it('returns 404 when asset is missing', async () => {
    const mockCtx = createMockCtx();
    const mockBucket = createMockBucket({
      get: vi.fn().mockResolvedValue(null),
    });
    mockCache.match.mockResolvedValue(null);

    const app = createTestApp();
    const req = new Request('http://localhost/api/resume-assets/resume/profile/missing.png');
    const res = await app.fetch(req, { RESUME_ASSETS_BUCKET: mockBucket }, mockCtx);

    expect(res.status).toBe(404);
  });
});
