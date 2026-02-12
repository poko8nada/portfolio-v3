import { Button } from '../components/button'
import { ListContent } from '../components/list-content'
import { parseMetadata } from '../lib/markdown'
import { type CacheOptions, getAllPosts } from '../lib/r2'
import { isErr } from '../utils/types'

export const PostList = async ({
  bucket,
  displayCount,
  tag,
  cacheOptions,
}: {
  bucket: R2Bucket
  displayCount?: number
  tag?: string | null
  cacheOptions?: CacheOptions
}) => {
  const postsResult = await getAllPosts(bucket, 100, cacheOptions)
  if (isErr(postsResult)) {
    return <div>Error loading posts: {postsResult.error}</div>
  }

  const posts = postsResult.value
  const metadataList = []
  for (const post of posts) {
    const metaResult = await parseMetadata(post.content)
    if (isErr(metaResult)) {
      console.warn(
        `Failed to parse metadata for post ${post.slug}: ${metaResult.error}`,
      )
      continue
    }
    metadataList.push({ slug: post.slug, ...metaResult.value })
  }

  const sortedMetadataList = metadataList
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime(),
    )
    .slice(0, displayCount || metadataList.length)

  return (
    <ul class='list-none px-0'>
      {sortedMetadataList
        .filter(meta => (tag ? meta.tags?.includes(tag) : true))
        .map(meta => (
          <ListContent
            key={meta.slug}
            href={`/posts/${meta.slug}`}
            title={meta.title}
          >
            <div class='mt-2 text-sm text-text-secondary'>
              {new Date(meta.createdAt).toLocaleDateString('ja-JP', {})}
            </div>
            <div class='mt-1'>
              {meta.tags?.map(tag => (
                <Button size='sm' href={`/posts?tag=${tag}`}>
                  {tag}
                </Button>
              ))}
            </div>
          </ListContent>
        ))}
    </ul>
  )
}
