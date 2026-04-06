const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  avif: 'image/avif',
  css: 'text/css; charset=utf-8',
  gif: 'image/gif',
  html: 'text/html; charset=utf-8',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  js: 'text/javascript; charset=utf-8',
  json: 'application/json; charset=utf-8',
  mjs: 'text/javascript; charset=utf-8',
  png: 'image/png',
  svg: 'image/svg+xml',
  txt: 'text/plain; charset=utf-8',
  webp: 'image/webp',
  xml: 'application/xml; charset=utf-8',
};

export function resolveContentType(path: string, contentType?: string): string | undefined {
  if (contentType) {
    return contentType;
  }

  const filePath = path.split('?')[0];
  const dotIndex = filePath.lastIndexOf('.');
  if (dotIndex === -1 || dotIndex === filePath.length - 1) {
    return undefined;
  }

  const extension = filePath.slice(dotIndex + 1).toLowerCase();
  return CONTENT_TYPE_BY_EXTENSION[extension];
}
