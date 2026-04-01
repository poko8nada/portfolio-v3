import { err, isOk, ok, type Result } from '../utils/types';

export interface CacheOptions {
  ctx?: ExecutionContext;
  request?: Request;
}

export interface DocumentOptions extends CacheOptions {
  contentType?: string;
  cacheControl?: string;
}

export type DocumentResult = {
  content: string;
  fromCache: boolean;
};

export type PostResult = DocumentResult;

export type AssetResult = {
  body: ReadableStream;
  httpMetadata?: R2HTTPMetadata;
  httpEtag?: string;
  fromCache: boolean;
};

const R2_CACHE_NAME = 'r2-cache';
const DOCUMENT_CACHE_CONTROL = 'public, s-maxage=3600';
const ASSET_CACHE_CONTROL = 'public, s-maxage=604800';

/**
 * Generate a consistent cache key for R2 objects.
 * Uses the request hostname and a dedicated path prefix to avoid collisions.
 */
function getCacheKey(request: Request, path: string): Request {
  const url = new URL(request.url);
  const cacheUrl = new URL(`/__r2_cache__/${path}`, `https://${url.hostname}`);
  return new Request(cacheUrl.toString());
}

async function matchCache(cache: Cache, cacheKey: Request | null): Promise<Response | null> {
  if (!cacheKey) return null;
  try {
    return (await cache.match(cacheKey)) ?? null;
  } catch {
    return null;
  }
}

function persistCache(
  cache: Cache,
  cacheKey: Request | null,
  ctx: ExecutionContext | undefined,
  response: Response,
) {
  if (!cacheKey || !ctx) return;
  ctx.waitUntil(cache.put(cacheKey, response.clone()));
}

export async function getPost(
  bucket: R2Bucket,
  slug: string,
  options?: CacheOptions,
): Promise<Result<PostResult, string>> {
  const key = `posts/${slug}.md`;
  return getDocument(bucket, key, `Post not found: ${slug}`, {
    ...options,
    contentType: 'text/markdown; charset=utf-8',
    cacheControl: DOCUMENT_CACHE_CONTROL,
  });
}

export async function getDocument(
  bucket: R2Bucket,
  key: string,
  notFoundMessage: string,
  options?: DocumentOptions,
): Promise<Result<DocumentResult, string>> {
  const cache = await caches.open(R2_CACHE_NAME);
  const cacheKey = options?.request ? getCacheKey(options.request, key) : null;

  const cachedResponse = await matchCache(cache, cacheKey);
  if (cachedResponse) {
    const content = await cachedResponse.text();
    return ok({ content, fromCache: true });
  }

  try {
    const object = await bucket.get(key);
    if (!object) return err(notFoundMessage);
    const content = await object.text();

    if (cacheKey && options?.ctx) {
      const response = new Response(content, {
        headers: {
          'Content-Type': options.contentType ?? 'text/plain; charset=utf-8',
          'Cache-Control': options.cacheControl ?? DOCUMENT_CACHE_CONTROL,
        },
      });
      persistCache(cache, cacheKey, options.ctx, response);
    }

    return ok({ content, fromCache: false });
  } catch (error) {
    return err(error instanceof Error ? error.message : 'Unknown error');
  }
}

export async function listPosts(bucket: R2Bucket, limit = 100): Promise<Result<string[], string>> {
  try {
    const list = await bucket.list({ prefix: 'posts/', limit });
    const slugs = list.objects
      .map((obj) => obj.key.replace('posts/', '').replace('.md', ''))
      .filter((slug) => slug !== '');
    return ok(slugs);
  } catch (error) {
    return err(error instanceof Error ? error.message : 'Unknown error');
  }
}

export async function getAllPosts(
  bucket: R2Bucket,
  limit = 100,
  options?: CacheOptions,
): Promise<Result<{ slug: string; content: string }[], string>> {
  try {
    const listResult = await listPosts(bucket, limit);
    if (isOk(listResult)) {
      const posts: { slug: string; content: string }[] = [];
      for (const slug of listResult.value) {
        const postResult = await getPost(bucket, slug, options);
        if (isOk(postResult)) {
          posts.push({ slug, content: postResult.value.content });
        }
      }
      return ok(posts);
    }
    return err(listResult.error);
  } catch (error) {
    return err(error instanceof Error ? error.message : 'Unknown error');
  }
}

export async function getAsset(
  bucket: R2Bucket,
  path: string,
  options?: CacheOptions,
): Promise<Result<AssetResult, string>> {
  const cache = await caches.open(R2_CACHE_NAME);
  const cacheKey = options?.request ? getCacheKey(options.request, path) : null;

  const cachedResponse = await matchCache(cache, cacheKey);
  if (cachedResponse?.body) {
    return ok({
      body: cachedResponse.body,
      httpMetadata: {
        contentType: cachedResponse.headers.get('Content-Type') || undefined,
      },
      httpEtag: cachedResponse.headers.get('ETag') || undefined,
      fromCache: true,
    });
  }

  try {
    const object = await bucket.get(path);
    if (!object) {
      return err(`Asset not found: ${path}`);
    }

    let body = object.body;
    if (cacheKey && options?.ctx) {
      const headers = new Headers();
      // Note: Manual header setting to avoid Miniflare's writeHttpMetadata bug
      if (object.httpMetadata?.contentType) {
        headers.set('Content-Type', object.httpMetadata.contentType);
      }
      if (object.httpEtag) headers.set('ETag', object.httpEtag);
      // Cache for 7 days in edge cache
      headers.set('Cache-Control', ASSET_CACHE_CONTROL);

      const response = new Response(body, { headers });
      persistCache(cache, cacheKey, options.ctx, response);
      if (response.body) {
        body = response.body;
      }
    }

    return ok({
      body,
      httpMetadata: object.httpMetadata,
      httpEtag: object.httpEtag,
      fromCache: false,
    });
  } catch (error) {
    return err(error instanceof Error ? error.message : 'Unknown error');
  }
}
