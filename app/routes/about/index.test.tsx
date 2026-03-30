import React from 'hono/jsx';
import { Hono } from 'hono';
import { jsxRenderer } from 'hono/jsx-renderer';
import { describe, expect, it } from 'vitest';
import route from '.';

const createTestApp = () => {
  const app = new Hono();

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
  it('renders genre groups by default', async () => {
    const app = createTestApp();
    const response = await app.fetch(new Request('http://localhost/about'));

    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain('About | Poko Hanada');
    expect(body).toContain('ジャンル順');
    expect(body).toContain('言語・マークアップ');
    expect(body).toContain('フロントエンド');
    expect(body).toContain('TypeScript / JavaScript');
  });

  it('renders proficiency groups when requested', async () => {
    const app = createTestApp();
    const response = await app.fetch(new Request('http://localhost/about?sort=proficiency'));

    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain('習熟度順');
    expect(body).toContain('Primary');
    expect(body).toContain('Applied');
    expect(body).toContain('Aware');
    expect(body).toContain('HeroUI');
  });

  it('falls back to genre groups for an invalid sort value', async () => {
    const app = createTestApp();
    const response = await app.fetch(new Request('http://localhost/about?sort=invalid'));

    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain('言語・マークアップ');
    expect(body).not.toContain('<h3>Primary</h3>');
  });
});
