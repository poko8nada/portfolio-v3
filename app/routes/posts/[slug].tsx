import type { Context } from 'hono'
import { createRoute } from 'honox/factory'
import { parseMarkdown } from '../../lib/markdown'
import { getPost } from '../../lib/r2'
import { isErr } from '../../utils/types'

const PostComponent = async ({
  bucket,
  slug,
  c,
}: {
  bucket: R2Bucket
  slug: string
  c: Context
}) => {
  const getResult = await getPost(bucket, slug, {
    ctx: c.executionCtx,
    request: c.req.raw,
  })

  if (isErr(getResult)) {
    return <div>Error: {getResult.error}</div>
  }

  const { content, fromCache } = getResult.value
  // Set X-Cache header to indicate if the R2 content was served from cache
  c.header('X-Cache', fromCache ? 'HIT' : 'MISS')

  const parseResult = await parseMarkdown(content)
  if (isErr(parseResult)) {
    return <div>Error: {parseResult.error}</div>
  }

  const postData = parseResult.value

  return (
    <article>
      <h1>{postData.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: postData.content }} />
    </article>
  )
}

export default createRoute(c => {
  const slug = c.req.param('slug')
  if (!slug) {
    return c.render(<div>Error: Missing slug parameter</div>)
  }
  return c.render(
    <div class='prose'>
      <PostComponent bucket={c.env.POSTS_BUCKET} slug={slug} c={c} />
    </div>,
  )
})
