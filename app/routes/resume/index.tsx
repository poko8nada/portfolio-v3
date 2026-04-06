import React from 'hono/jsx';
import { createRoute } from 'honox/factory';
import { Resume, parseResumeDocument, RESUME_JSON_OBJECT_KEY } from '../../features/resume';
import { getDocument } from '../../lib/r2';
import { isErr } from '../../utils/types';
import ResumeOvarlay from '../../islands/resume-overlay';

export default createRoute(async (c) => {
  const title = 'Resume | Poko Hanada';
  const description = '履歴書（閲覧制限あり・Cloudflare Access）';
  const getResult = await getDocument(
    c.env.RESUME_ASSETS_BUCKET,
    RESUME_JSON_OBJECT_KEY,
    'Resume document not found',
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

  const parseResult = parseResumeDocument(getResult.value.content);
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
    <div class={'min-h-screen relative'}>
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      <ResumeOvarlay />
      <Resume data={parseResult.value} />
    </div>,
  );
});
