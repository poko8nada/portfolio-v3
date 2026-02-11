import { createRoute } from 'honox/factory'
import { Section } from '../../components/section'
import { PostList } from '../../features/post-list'
import TagFilter from '../../islands/tag-filter'

export default createRoute(async c => {
  const tag = c.req.query('tag') || null

  console.log('Selected tag:', tag)
  return c.render(
    <div>
      <title>Poko Hanada | Posts</title>
      <Section heading='Posts'>
        <TagFilter tag={tag} />
        <PostList bucket={c.env.POSTS_BUCKET} tag={tag} />
      </Section>
    </div>,
  )
})
