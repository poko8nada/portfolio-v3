import { createRoute } from 'honox/factory'
import { Button } from '../components/button'
import { ListContent } from '../components/list-content'
import { Section } from '../components/section'
import { TextLink } from '../components/text-link'
import { parseMetadata } from '../lib/markdown'
import { getAllPosts } from '../lib/r2'
import { isErr } from '../utils/types'

const PostListComponent = async ({ bucket }: { bucket: R2Bucket }) => {
  const postsResult = await getAllPosts(bucket, 3)
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

  return (
    <ul class='list-none px-0'>
      {metadataList.map(meta => (
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

const PROJECTS = [
  {
    href: 'https://slide-generator.you-88451-h.workers.dev',
    title: 'Slide Generator',
    description:
      'Markdownをリアルタイムでスライドに変換。エディタ・スライドビューア・PDF出力を備えたサービス。',
  },
  {
    href: 'https://link-card-generator-v2.vercel.app',
    title: 'Blog Card Maker',
    description:
      '指定したURLからOGPを取得、ブログにリンクカードを簡単に追加できるサービス。',
  },
  {
    href: 'https://time-call-web-v1.vercel.app',
    title: 'Time Call Web',
    description:
      'シンプルで軽量の時報通知アプリ。時報は音声でお知らせ。1分〜60分間隔で設定が可能。',
  },
  {
    href: 'https://tiny-calc-894742994238.asia-northeast1.run.app',
    title: 'Tiny Calc',
    description:
      'ミニマルなターミナルスタイルの電卓。計算履歴の保存と再利用ができます。',
  },
]

export default createRoute(c => {
  return c.render(
    <div class='pt-36'>
      <title>Poko Hanada</title>
      <Section heading='About' id='about' class='prose'>
        <div class='mb-10'>
          <p>こんにちは。PokoHanadaです。</p>
          <p>
            Webディレクター兼、デベロッパー。
            <br />
            企画・設計から実装・運用まで一貫して担当いたします。
          </p>
        </div>
        <div class='mb-3'>
          <Button
            href='https://github.com/poko8nada'
            variant='primary'
            target='_blank'
          >
            Github
          </Button>
        </div>
        <div>
          <Button
            href='https://x.com/you88451h'
            variant='primary'
            target='_blank'
          >
            X/Twitter
          </Button>
        </div>
      </Section>
      <Section heading='Posts' id='posts'>
        <PostListComponent bucket={c.env.POSTS_BUCKET} />
        <div class='mt-10'>
          <TextLink href='/posts'>すべての記事 →</TextLink>
        </div>
      </Section>
      <Section heading='Tools' id='tools'>
        <ul class='list-none px-0'>
          {PROJECTS.map(project => (
            <ListContent
              key={project.href}
              href={project.href}
              title={project.title}
              target='_blank'
            >
              <p class='prose mt-2'>{project.description}</p>
            </ListContent>
          ))}
        </ul>
      </Section>
    </div>,
  )
})
