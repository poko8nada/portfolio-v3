import { createRoute } from 'honox/factory'
import { Button } from '../components/button'
import { ListContent } from '../components/list-content'
import { Section } from '../components/section'
import { TextLink } from '../components/text-link'
import { PostList } from '../features/post-list'

const PROJECTS = [
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
      'シンプルな時報通知アプリ。時報は音声でお知らせ。1分〜60分間隔で設定が可能。',
  },
  {
    href: 'https://tiny-calc-894742994238.asia-northeast1.run.app',
    title: 'Tiny Calc',
    description:
      'ミニマルなターミナルスタイルの電卓。計算履歴の保存と再利用ができます。',
  },
]

export default createRoute(c => {
  const title = 'Poko Hanada'
  const description =
    'Webディレクター兼デベロッパー、Poko Hanadaのポートフォリオサイトです。'

  return c.render(
    <div>
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />

      <Section heading='About' id='about' class='prose'>
        <div class='mb-10'>
          <p>こんにちは。PokoHanadaです。</p>
          <p>
            Webディレクター・デベロッパー・エンジニア。
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
        <PostList
          bucket={c.env.POSTS_BUCKET}
          displayCount={3}
          cacheOptions={{ ctx: c.executionCtx, request: c.req.raw }}
        />
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
