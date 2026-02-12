import type { PostData } from '../lib/markdown'
import { Button } from './button'

export const PostContent = ({ postData }: { postData: PostData }) => {
  if (!postData.isPublished) {
    return <div>This post is not published.</div>
  }
  return (
    <article class='px-2'>
      <h1 class='mb-2'>{postData.title}</h1>
      <div class='mx-1 text-sm text-text-secondary'>
        {new Date(postData.createdAt).toLocaleDateString('ja-JP', {})}
      </div>
      <div class='mt-2 mb-16'>
        {postData.tags?.map(tag => (
          <Button size='sm' href={`/posts?tag=${tag}`}>
            {tag}
          </Button>
        ))}
      </div>

      <div dangerouslySetInnerHTML={{ __html: postData.content }} />
    </article>
  )
}
