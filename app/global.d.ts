import type {} from 'hono'

declare module 'hono' {
  interface Env {
    Variables: {}
    Bindings: {
      POSTS_BUCKET: R2Bucket
    }
  }
}
