import type { ErrorHandler } from 'hono'

const handler: ErrorHandler = (e, c) => {
  if ('getResponse' in e) {
    return e.getResponse()
  }
  console.error(e.message)
  c.status(500)
  return c.render(
    <div>
      <title>500 Internal Server Error</title>
      <h1 class='text-2xl font-bold mb-4'>500 Internal Server Error</h1>
      <p>申し訳ありません。サーバーでエラーが発生しました。</p>
    </div>,
  )
}

export default handler
