import { createRoute } from 'honox/factory'
import { PostContent } from '../../components/post-content'
import { Section } from '../../components/section'
import { PostList } from '../../features/post-list'
import { parseMarkdown } from '../../lib/markdown'
import { getPost } from '../../lib/r2'
import { isErr } from '../../utils/types'

export default createRoute(async c => {
  const slug = c.req.param('slug')
  if (!slug) {
    return c.render(<div>Error: Missing slug parameter</div>)
  }

  const bucket = c.env.POSTS_BUCKET
  const getResult = await getPost(bucket, slug, {
    ctx: c.executionCtx,
    request: c.req.raw,
  })

  if (isErr(getResult)) {
    return c.render(<div>Error: {getResult.error}</div>)
  }

  const { content, fromCache } = getResult.value
  // Set X-Cache header to indicate if the R2 content was served from cache
  c.header('X-Cache', fromCache ? 'HIT' : 'MISS')

  const parseResult = await parseMarkdown(content)
  if (isErr(parseResult)) {
    return c.render(<div>Error: {parseResult.error}</div>)
  }

  const postData = parseResult.value

  if (!postData.isPublished) {
    return c.render(<div>This post is not published.</div>)
  }
  return c.render(
    <>
      <section class='prose'>
        <PostContent postData={postData} />
      </section>
      <hr class='text-text-secondary mt-20 mb-8' />
      <Section heading='Recent Posts'>
        <PostList bucket={bucket} displayCount={3} title={postData.title} />
      </Section>
    </>,
  )
})
