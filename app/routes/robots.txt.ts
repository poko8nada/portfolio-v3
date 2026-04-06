import { createRoute } from 'honox/factory';

export default createRoute((c) => {
  const origin = new URL(c.req.url).origin;
  const body = `User-agent: *
Disallow: /resume
Disallow: /api/resume-assets/
Sitemap: ${origin}/sitemap.xml
`;

  return c.body(body, 200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'public, max-age=3600',
  });
});
