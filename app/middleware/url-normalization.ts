import type { MiddlewareHandler } from 'hono';

const LOCALHOST_HOSTS = ['localhost', '127.0.0.1', '[::1]'];

const isLocalHost = (host: string) =>
  LOCALHOST_HOSTS.some((localHost) => host === localHost || host.startsWith(`${localHost}:`));

const getForwardedProto = (value: string | undefined) => value?.split(',')[0]?.trim().toLowerCase();

export const redirectToHttps: MiddlewareHandler = async (c, next) => {
  const requestUrl = new URL(c.req.url);
  const host = c.req.header('host') ?? requestUrl.host;

  if (isLocalHost(host)) {
    await next();
    return;
  }

  const forwardedProto = getForwardedProto(c.req.header('x-forwarded-proto'));
  const isHttps = requestUrl.protocol === 'https:' || forwardedProto === 'https';

  if (isHttps) {
    await next();
    return;
  }

  requestUrl.protocol = 'https:';
  const status = c.req.method === 'GET' || c.req.method === 'HEAD' ? 301 : 308;
  return c.redirect(requestUrl.toString(), status);
};

export const normalizeTrailingSlash: MiddlewareHandler = async (c, next) => {
  const requestUrl = new URL(c.req.url);
  const hasTrailingSlash = requestUrl.pathname.length > 1 && requestUrl.pathname.endsWith('/');

  if (!hasTrailingSlash) {
    await next();
    return;
  }

  requestUrl.pathname = requestUrl.pathname.replace(/\/+$/, '');
  const status = c.req.method === 'GET' || c.req.method === 'HEAD' ? 301 : 308;
  return c.redirect(requestUrl.toString(), status);
};
