import React from 'hono/jsx';
import { createRoute } from 'honox/factory';
import { AboutDetail } from '../../features/about-detail';
import { parseAboutStackDocument, resolveAboutSortMode } from '../../features/about-detail-data';
import { getDocument } from '../../lib/r2';
import { isErr } from '../../utils/types';

const ABOUT_STACK_KEY = 'resume/stack.json';

export default createRoute(async (c) => {
  const sort = resolveAboutSortMode(c.req.query('sort'));
  const title = 'About | Poko Hanada';
  const description = 'Poko Hanadaのスタックや経験をまとめた詳細ページです。';
  const getResult = await getDocument(
    c.env.RESUME_ASSETS_BUCKET,
    ABOUT_STACK_KEY,
    'About stack not found',
    {
      ctx: c.executionCtx,
      request: c.req.raw,
      contentType: 'application/json; charset=utf-8',
    },
  );

  if (isErr(getResult)) {
    return c.render(
      <div>
        <title>Error | Poko Hanada</title>
        Error: {getResult.error}
      </div>,
    );
  }

  const parseResult = parseAboutStackDocument(getResult.value.content);
  if (isErr(parseResult)) {
    return c.render(
      <div>
        <title>Error | Poko Hanada</title>
        Error: {parseResult.error}
      </div>,
    );
  }

  c.header('X-Cache', getResult.value.fromCache ? 'HIT' : 'MISS');

  return c.render(
    <div>
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      <AboutDetail items={parseResult.value} sort={sort} />
    </div>,
  );
});
