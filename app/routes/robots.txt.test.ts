import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import route from './robots.txt';

const createTestApp = () => {
  const app = new Hono();
  app.get('/robots.txt', ...route);
  return app;
};

describe('/robots.txt route', () => {
  it('returns crawler directives for resume paths', async () => {
    const app = createTestApp();
    const response = await app.fetch(new Request('https://staging.pokohanada.com/robots.txt'));
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
    expect(body).toContain('User-agent: *');
    expect(body).toContain('Disallow: /resume');
    expect(body).toContain('Disallow: /api/resume-assets/');
    expect(body).toContain('Sitemap: https://staging.pokohanada.com/sitemap.xml');
  });

  it('sets cache-control header', async () => {
    const app = createTestApp();
    const response = await app.fetch(new Request('https://pokohanada.com/robots.txt'));

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=3600');
  });
});
