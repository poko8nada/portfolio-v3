import { err, isOk, ok, type Result } from '../utils/types'

export interface CacheOptions {
  ctx?: ExecutionContext
  request?: Request
}

export type PostResult = {
  content: string
  fromCache: boolean
}

export type AssetResult = {
  body: ReadableStream
  httpMetadata?: R2HTTPMetadata
  httpEtag?: string
  fromCache: boolean
}

const R2_CACHE_NAME = 'r2-cache'
const POST_CACHE_CONTROL = 'public, s-maxage=3600'
const ASSET_CACHE_CONTROL = 'public, s-maxage=604800'

/**
 * Generate a consistent cache key for R2 objects.
 * Uses the request hostname and a dedicated path prefix to avoid collisions.
 */
function getCacheKey(request: Request, path: string): Request {
  const url = new URL(request.url)
  const cacheUrl = new URL(`/__r2_cache__/${path}`, `https://${url.hostname}`)
  return new Request(cacheUrl.toString())
}

async function matchCache(
  cache: Cache,
  cacheKey: Request | null,
): Promise<Response | null> {
  if (!cacheKey) return null
  try {
    return (await cache.match(cacheKey)) ?? null
  } catch (e) {
    console.warn('Cache match failed:', e)
    return null
  }
}

function persistCache(
  cache: Cache,
  cacheKey: Request | null,
  ctx: ExecutionContext | undefined,
  response: Response,
) {
  if (!cacheKey || !ctx) return
  ctx.waitUntil(cache.put(cacheKey, response.clone()))
}

export async function getPost(
  bucket: R2Bucket,
  slug: string,
  options?: CacheOptions,
): Promise<Result<PostResult, string>> {
  const key = `posts/${slug}.md`
  const cache = await caches.open(R2_CACHE_NAME)
  const cacheKey = options?.request ? getCacheKey(options.request, key) : null

  const cachedResponse = await matchCache(cache, cacheKey)
  if (cachedResponse) {
    // console.log(`[Cache HIT] post: ${slug}`)
    const content = await cachedResponse.text()
    return ok({ content, fromCache: true })
  }

  try {
    // console.log(`[Cache MISS] Fetching post from R2: ${slug}`)
    const object = await bucket.get(key)
    if (!object) return err(`Post not found: ${slug}`)
    const content = await object.text()

    if (cacheKey && options?.ctx) {
      const response = new Response(content, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Cache-Control': POST_CACHE_CONTROL,
        },
      })
      persistCache(cache, cacheKey, options.ctx, response)
    }

    return ok({ content, fromCache: false })
  } catch (e) {
    return err(e instanceof Error ? e.message : 'Unknown error')
  }
}

export async function listPosts(
  bucket: R2Bucket,
  limit = 100,
): Promise<Result<string[], string>> {
  try {
    const list = await bucket.list({ prefix: 'posts/', limit })
    const slugs = list.objects
      .map(obj => obj.key.replace('posts/', '').replace('.md', ''))
      .filter(slug => slug !== '')
    return ok(slugs)
  } catch (e) {
    return err(e instanceof Error ? e.message : 'Unknown error')
  }
}

export async function getAllPosts(
  bucket: R2Bucket,
  limit = 100,
  options?: CacheOptions,
): Promise<Result<{ slug: string; content: string }[], string>> {
  try {
    const listResult = await listPosts(bucket, limit)
    if (isOk(listResult)) {
      const posts: { slug: string; content: string }[] = []
      for (const slug of listResult.value) {
        const postResult = await getPost(bucket, slug, options)
        if (isOk(postResult)) {
          posts.push({ slug, content: postResult.value.content })
        } else {
          console.warn(`Failed to get post ${slug}: ${postResult.error}`)
        }
      }
      return ok(posts)
    }
    return err(listResult.error)
  } catch (e) {
    return err(e instanceof Error ? e.message : 'Unknown error')
  }
}

export async function getAsset(
  bucket: R2Bucket,
  path: string,
  options?: CacheOptions,
): Promise<Result<AssetResult, string>> {
  const cache = await caches.open(R2_CACHE_NAME)
  const cacheKey = options?.request ? getCacheKey(options.request, path) : null

  const cachedResponse = await matchCache(cache, cacheKey)
  if (cachedResponse?.body) {
    // console.log(`[Cache HIT] path: ${path}`)
    return ok({
      body: cachedResponse.body,
      httpMetadata: {
        contentType: cachedResponse.headers.get('Content-Type') || undefined,
      },
      httpEtag: cachedResponse.headers.get('ETag') || undefined,
      fromCache: true,
    })
  }

  try {
    // console.log(`[Cache MISS] Fetching from R2: ${path}`)
    const object = await bucket.get(path)
    if (!object) {
      console.warn(`[R2 NOT FOUND] path: ${path}`)
      return err(`Asset not found: ${path}`)
    }

    let body = object.body
    if (cacheKey && options?.ctx) {
      const headers = new Headers()
      // Note: Manual header setting to avoid Miniflare's writeHttpMetadata bug
      if (object.httpMetadata?.contentType) {
        headers.set('Content-Type', object.httpMetadata.contentType)
      }
      if (object.httpEtag) headers.set('ETag', object.httpEtag)
      // Cache for 7 days in edge cache
      headers.set('Cache-Control', ASSET_CACHE_CONTROL)

      const response = new Response(body, { headers })
      persistCache(cache, cacheKey, options.ctx, response)
      if (response.body) {
        body = response.body
      }
    }

    return ok({
      body,
      httpMetadata: object.httpMetadata,
      httpEtag: object.httpEtag,
      fromCache: false,
    })
  } catch (e) {
    // console.error('[R2 ERROR RAW]:', e)
    return err(e instanceof Error ? e.message : 'Unknown error')
  }
}
