import { Hono } from 'hono';
import { describe, expect, it, vi } from 'vitest';
import route from './sitemap.xml';

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
  const app = new Hono<{ Bindings: { POSTS_BUCKET: R2Bucket } }>();
  app.get('/sitemap.xml', ...route);
  return app;
};

describe('/sitemap.xml route', () => {
  it('excludes resume and robots routes from sitemap', async () => {
    const app = createTestApp();
    const bucket = createMockBucket({
      list: vi.fn().mockResolvedValue({
        objects: [],
      }),
    });
    const response = await app.fetch(new Request('https://pokohanada.com/sitemap.xml'), {
      POSTS_BUCKET: bucket,
    });
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/xml; charset=utf-8');
    expect(body).not.toContain('<loc>https://pokohanada.com/resume</loc>');
    expect(body).not.toContain('<loc>https://pokohanada.com/robots.txt</loc>');
  });

  it('includes post routes returned from the bucket', async () => {
    const app = createTestApp();
    const bucket = createMockBucket({
      list: vi.fn().mockResolvedValue({
        objects: [{ key: 'posts/hello-world.md' }, { key: 'posts/debug-notes.md' }],
      }),
    });
    const response = await app.fetch(new Request('https://pokohanada.com/sitemap.xml'), {
      POSTS_BUCKET: bucket,
    });
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain('<loc>https://pokohanada.com/posts/hello-world</loc>');
    expect(body).toContain('<loc>https://pokohanada.com/posts/debug-notes</loc>');
  });
});
