import { createRoute } from 'honox/factory'
import { Section } from '../../components/section'
import { PostList } from '../../features/post-list'
import TagFilter from '../../islands/tag-filter'

export default createRoute(async c => {
  const tag = c.req.query('tag') || null
  const title = tag ? `Posts: ${tag} | Poko Hanada` : 'Posts | Poko Hanada'
  const description = tag
    ? `Poko Hanadaによる「${tag}」タグの記事一覧です。`
    : 'Poko Hanadaによる記事一覧です。'

  return c.render(
    <div>
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />

      <Section heading='Posts'>
        <TagFilter tag={tag} />
        <PostList
          bucket={c.env.POSTS_BUCKET}
          tag={tag}
          cacheOptions={{ ctx: c.executionCtx, request: c.req.raw }}
        />
      </Section>
    </div>,
  )
})
