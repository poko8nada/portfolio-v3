import React from 'hono/jsx';
import { Hono } from 'hono';
import { jsxRenderer } from 'hono/jsx-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PostData } from '../../lib/markdown';

const { mockGetPost, mockParseMarkdown } = vi.hoisted(() => ({
  mockGetPost: vi.fn(),
  mockParseMarkdown: vi.fn(),
}));

vi.mock('../../lib/r2', () => ({
  getPost: mockGetPost,
}));

vi.mock('../../lib/markdown', () => ({
  parseMarkdown: mockParseMarkdown,
}));

vi.mock('../../features/post-list', () => ({
  PostList: () => null,
}));

import route from './[slug]';

const createMockCtx = (): ExecutionContext => ({
  waitUntil: vi.fn(),
  passThroughOnException: vi.fn(),
  props: {},
});

const createMockBucket = (): R2Bucket => ({}) as R2Bucket;

const createTestApp = () => {
  const app = new Hono<{ Bindings: { POSTS_BUCKET: R2Bucket } }>();

  app.use(
    '*',
    jsxRenderer(({ children }) => (
      <html lang='ja'>
        <body>{children}</body>
      </html>
    )),
  );
  app.get('/posts/:slug', ...route);

  return app;
};

const createPostData = (isPublished: boolean): PostData => ({
  title: isPublished ? 'Published Post' : 'Draft Post',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
  isPublished,
  tags: ['test'],
  version: 1,
  content: '<p>post content</p>',
});

describe('/posts/:slug route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 404 when the post does not exist', async () => {
    const app = createTestApp();
    const bucket = createMockBucket();
    mockGetPost.mockResolvedValue({
      ok: false,
      error: 'Post not found: not-found',
    });
    const response = await app.fetch(
      new Request('http://localhost/posts/not-found'),
      { POSTS_BUCKET: bucket },
      createMockCtx(),
    );

    expect(response.status).toBe(404);
  });

  it('returns 404 for unpublished posts', async () => {
    const app = createTestApp();
    const bucket = createMockBucket();
    mockGetPost.mockResolvedValue({
      ok: true,
      value: {
        content: 'raw markdown',
        fromCache: false,
      },
    });
    mockParseMarkdown.mockResolvedValue({
      ok: true,
      value: createPostData(false),
    });
    const response = await app.fetch(
      new Request('http://localhost/posts/draft-post'),
      { POSTS_BUCKET: bucket },
      createMockCtx(),
    );

    expect(response.status).toBe(404);
  });

  it('returns 200 for published posts', async () => {
    const app = createTestApp();
    const bucket = createMockBucket();
    mockGetPost.mockResolvedValue({
      ok: true,
      value: {
        content: 'raw markdown',
        fromCache: false,
      },
    });
    mockParseMarkdown.mockResolvedValue({
      ok: true,
      value: createPostData(true),
    });
    const response = await app.fetch(
      new Request('http://localhost/posts/published-post'),
      { POSTS_BUCKET: bucket },
      createMockCtx(),
    );

    expect(response.status).toBe(200);
  });
});
