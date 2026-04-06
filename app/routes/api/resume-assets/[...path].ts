import { createRoute } from 'honox/factory';
import { getAsset } from '../../../lib/r2';
import { isErr } from '../../../utils/types';

export default createRoute(async (c) => {
  let path = c.req.path;
  const prefix = '/api/resume-assets/';
  if (path.startsWith(prefix)) {
    path = decodeURIComponent(path.slice(prefix.length));
  }

  if (!path) return c.notFound();

  const result = await getAsset(c.env.RESUME_ASSETS_BUCKET, path, {
    ctx: c.executionCtx,
    request: c.req.raw,
  });

  if (isErr(result)) {
    return c.notFound();
  }

  const { body, httpMetadata, httpEtag, fromCache } = result.value;

  c.header('X-Cache', fromCache ? 'HIT' : 'MISS');
  if (httpMetadata?.contentType) {
    c.header('Content-Type', httpMetadata.contentType);
  }
  if (httpEtag) {
    c.header('ETag', httpEtag);
  }
  c.header('Cache-Control', 'public, max-age=604800');

  return c.body(body);
});
