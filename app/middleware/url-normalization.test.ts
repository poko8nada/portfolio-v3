import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import { normalizeTrailingSlash, redirectToHttps } from './url-normalization';

const createTestApp = () => {
  const app = new Hono();
  app.use('*', redirectToHttps);
  app.use('*', normalizeTrailingSlash);
  app.get('/about', (c) => c.text('ok'));
  return app;
};

describe('url normalization middleware', () => {
  it('redirects HTTP requests to HTTPS for non-local hosts', async () => {
    const app = createTestApp();
    const response = await app.fetch(new Request('http://pokohanada.com/about'));

    expect(response.status).toBe(301);
    expect(response.headers.get('Location')).toBe('https://pokohanada.com/about');
  });

  it('does not redirect localhost requests to HTTPS', async () => {
    const app = createTestApp();
    const response = await app.fetch(new Request('http://localhost/about'));

    expect(response.status).toBe(200);
  });

  it('redirects trailing slash path to canonical path', async () => {
    const app = createTestApp();
    const response = await app.fetch(new Request('https://pokohanada.com/about/'));

    expect(response.status).toBe(301);
    expect(response.headers.get('Location')).toBe('https://pokohanada.com/about');
  });
});
