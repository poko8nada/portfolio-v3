import { createRoute } from 'honox/factory'
import { getAsset } from '../../../lib/r2'
import { isErr } from '../../../utils/types'

export default createRoute(async c => {
  let path = c.req.path
  // console.log(`[Image API] Requested path: ${path}`)
  const prefix = '/api/'
  if (path.startsWith(prefix)) {
    path = path.slice(prefix.length)
  }

  if (!path) return c.notFound()

  const bucket = c.env.POSTS_BUCKET

  // console.log(`[Image API] Calling getAsset with path: ${path}`)
  // Fetch asset using the enhanced getAsset with Cache API support
  const result = await getAsset(bucket, path, {
    ctx: c.executionCtx,
    request: c.req.raw,
  })

  if (isErr(result)) {
    console.warn(`[Image API] Asset not found or error: ${path}`, result.error)
    return c.notFound()
  }

  const { body, httpMetadata, httpEtag, fromCache } = result.value

  // Set X-Cache header to indicate cache status
  c.header('X-Cache', fromCache ? 'HIT' : 'MISS')

  // Set appropriate headers for the response
  if (httpMetadata?.contentType) {
    c.header('Content-Type', httpMetadata.contentType)
  }
  if (httpEtag) {
    c.header('ETag', httpEtag)
  }

  // Browser/CDN cache control (stays in browser for 7 days)
  c.header('Cache-Control', 'public, max-age=604800')

  return c.body(body)
})
