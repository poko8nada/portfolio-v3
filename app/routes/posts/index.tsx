import { createRoute } from 'honox/factory'

export default createRoute(async c => {
  return c.render(
    <div class='pt-36'>
      <title>Poko Hanada | Posts</title>
    </div>,
  )
})
