import React from 'hono/jsx';
import { createRoute } from 'honox/factory';
import { AboutDetail } from '../../features/about-detail';
import { resolveAboutSortMode } from '../../features/about-detail-data';

export default createRoute((c) => {
  const sort = resolveAboutSortMode(c.req.query('sort'));
  const title = 'About | Poko Hanada';
  const description = 'Poko Hanadaのスタックや経験をまとめた詳細ページです。';

  return c.render(
    <div>
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      <AboutDetail sort={sort} />
    </div>,
  );
});
