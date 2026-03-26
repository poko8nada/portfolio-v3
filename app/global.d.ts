import type { Env as HonoEnv } from 'hono';

declare module 'hono' {
  interface Env extends HonoEnv {
    Variables: {};
    Bindings: {
      POSTS_BUCKET: R2Bucket;
      RESUME_ASSETS_BUCKET: R2Bucket;
      GTM_CONTAINER_ID?: string;
    };
  }
}
