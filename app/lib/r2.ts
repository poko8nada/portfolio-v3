import { err, isOk, ok, type Result } from '../utils/types'

export async function getPost(
  bucket: R2Bucket,
  slug: string,
): Promise<Result<string, string>> {
  try {
    const object = await bucket.get(`posts/${slug}.md`)
    if (!object) return err(`Post not found: ${slug}`)
    const text = await object.text()
    return ok(text)
  } catch (e) {
    return err(e instanceof Error ? e.message : 'Unknown error')
  }
}

export async function listPosts(
  bucket: R2Bucket,
): Promise<Result<string[], string>> {
  try {
    const list = await bucket.list({ prefix: 'posts/' })
    const slugs = list.objects
      .filter(obj => obj.key?.endsWith('.md'))
      .map(obj => {
        const key = obj.key as string
        // Strip the "posts/" prefix and the ".md" suffix to produce the slug.
        // e.g. "posts/my-post.md" -> "my-post"
        return key.slice('posts/'.length, -'.md'.length)
      })

    return ok(slugs)
  } catch (e) {
    return err(e instanceof Error ? e.message : 'Unknown error')
  }
}

export async function getAllPosts(
  bucket: R2Bucket,
  limit = 100,
): Promise<Result<{ slug: string; content: string }[], string>> {
  try {
    const listResult = await listPosts(bucket)
    if (isOk(listResult)) {
      const slugs = listResult.value.slice(0, limit)
      const posts: { slug: string; content: string }[] = []

      for (const slug of slugs) {
        const postResult = await getPost(bucket, slug)
        if (isOk(postResult)) {
          posts.push({ slug, content: postResult.value })
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
): Promise<Result<R2ObjectBody, string>> {
  try {
    const object = await bucket.get(path)
    if (!object) return err(`Asset not found: ${path}`)
    return ok(object)
  } catch (e) {
    return err(e instanceof Error ? e.message : 'Unknown error')
  }
}
