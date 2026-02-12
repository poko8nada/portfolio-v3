import type { NotFoundHandler } from 'hono'

const handler: NotFoundHandler = c => {
  return c.render(
    <div>
      <title>404 Not Found</title>
      <h1 class='text-2xl font-bold mb-4'>404 Not Found</h1>
      <p>お探しのページは見つかりませんでした。</p>
    </div>,
  )
}

export default handler
