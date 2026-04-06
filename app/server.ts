import { showRoutes } from 'hono/dev';
import { createApp } from 'honox/server';
import { normalizeTrailingSlash, redirectToHttps } from './middleware/url-normalization';

const app = createApp();
app.use('*', redirectToHttps);
app.use('*', normalizeTrailingSlash);

showRoutes(app);

export default app;
