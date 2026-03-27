import React from 'hono/jsx';
import { createRoute } from 'honox/factory';
import { AboutDetail } from '../../features/about-detail';
import { parseMarkdown } from '../../lib/markdown';
import { getAboutResume } from '../../lib/r2';
import { isErr } from '../../utils/types';

export default createRoute(async (c) => {
  const aboutResult = await getAboutResume(c.env.RESUME_ASSETS_BUCKET, {
    ctx: c.executionCtx,
    request: c.req.raw,
  });

  if (isErr(aboutResult)) {
    c.status(500);
    return c.render(
      <div>
        <title>Error | Poko Hanada</title>
        Error: {aboutResult.error}
      </div>,
    );
  }

  c.header('X-Cache', aboutResult.value.fromCache ? 'HIT' : 'MISS');

  const parseResult = await parseMarkdown(aboutResult.value.content);
  if (isErr(parseResult)) {
    c.status(500);
    return c.render(
      <div>
        <title>Error | Poko Hanada</title>
        Error: {parseResult.error}
      </div>,
    );
  }

  const title = 'About | Poko Hanada';
  const description = 'Poko Hanadaのスキルや経歴をまとめた詳細ページです。';

  return c.render(
    <div>
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      <AboutDetail resumeTitle={parseResult.value.title} html={parseResult.value.content} />
    </div>,
  );
});
