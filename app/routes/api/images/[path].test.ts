import { Hono } from 'hono'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import route from './[path]'

// ExecutionContext のモック
const createMockCtx = (): ExecutionContext => ({
  waitUntil: vi.fn(),
  passThroughOnException: vi.fn(),
  props: {},
})

// R2Bucket のシンプルなモック
const createMockBucket = (overrides: Partial<R2Bucket> = {}): R2Bucket => {
  return {
    get: vi.fn(),
    list: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    head: vi.fn(),
    createMultipartUpload: vi.fn(),
    resumeMultipartUpload: vi.fn(),
    ...overrides,
  } as unknown as R2Bucket
}

// テスト用アプリの作成
const createTestApp = () => {
  const app = new Hono<{ Bindings: { POSTS_BUCKET: R2Bucket } }>()
  app.all('/api/*', ...route)
  return app
}

describe('API [...path] route with cache', () => {
  const mockCache = {
    match: vi.fn(),
    put: vi.fn(),
  }
  const mockCacheStorage = {
    open: vi.fn().mockResolvedValue(mockCache),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('caches', mockCacheStorage)
  })

  describe('successful asset retrieval', () => {
    it('should return asset with correct headers and X-Cache: MISS when not in cache', async () => {
      const mockCtx = createMockCtx()
      const mockBody = new ReadableStream()
      const mockObject = {
        body: mockBody,
        httpMetadata: { contentType: 'image/png' },
        httpEtag: '"abc123"',
        writeHttpMetadata: (h: Headers) => h.set('Content-Type', 'image/png'),
      }
      const mockBucket = createMockBucket({
        get: vi.fn().mockResolvedValue(mockObject),
      })

      mockCache.match.mockResolvedValue(null)

      const app = createTestApp()
      const req = new Request('http://localhost/api/images/test.png')

      // executionCtx を渡すために app.fetch を直接叩く
      const res = await app.fetch(req, { POSTS_BUCKET: mockBucket }, mockCtx)

      expect(res.status).toBe(200)
      expect(res.headers.get('Content-Type')).toBe('image/png')
      expect(res.headers.get('X-Cache')).toBe('MISS')
      expect(res.headers.get('Cache-Control')).toBe('public, max-age=604800')
      expect(mockBucket.get).toHaveBeenCalledWith('images/test.png')
      expect(mockCtx.waitUntil).toHaveBeenCalled()
    })

    it('should return asset from cache with X-Cache: HIT', async () => {
      const mockCtx = createMockCtx()
      const mockBody = new ReadableStream()
      mockCache.match.mockResolvedValue(
        new Response(mockBody, {
          headers: { 'Content-Type': 'image/jpeg', ETag: '"hit789"' },
        }),
      )
      const mockBucket = createMockBucket()

      const app = createTestApp()
      const req = new Request('http://localhost/api/images/photo.jpg')
      const res = await app.fetch(req, { POSTS_BUCKET: mockBucket }, mockCtx)

      expect(res.status).toBe(200)
      expect(res.headers.get('Content-Type')).toBe('image/jpeg')
      expect(res.headers.get('X-Cache')).toBe('HIT')
      expect(mockBucket.get).not.toHaveBeenCalled()
    })

    it('should handle nested paths correctly', async () => {
      const mockCtx = createMockCtx()
      const mockObject = {
        body: new ReadableStream(),
        writeHttpMetadata: vi.fn(),
      }
      const mockBucket = createMockBucket({
        get: vi.fn().mockResolvedValue(mockObject),
      })
      mockCache.match.mockResolvedValue(null)

      const app = createTestApp()
      const req = new Request('http://localhost/api/deep/nested/path/file.txt')
      const res = await app.fetch(req, { POSTS_BUCKET: mockBucket }, mockCtx)

      expect(res.status).toBe(200)
      expect(mockBucket.get).toHaveBeenCalledWith('deep/nested/path/file.txt')
    })
  })

  describe('error cases', () => {
    it('should return 404 when asset not found', async () => {
      const mockCtx = createMockCtx()
      const mockBucket = createMockBucket({
        get: vi.fn().mockResolvedValue(null),
      })
      mockCache.match.mockResolvedValue(null)

      const app = createTestApp()
      const req = new Request('http://localhost/api/images/missing.png')
      const res = await app.fetch(req, { POSTS_BUCKET: mockBucket }, mockCtx)

      expect(res.status).toBe(404)
    })

    it('should return 404 when bucket.get throws error', async () => {
      const mockCtx = createMockCtx()
      const mockBucket = createMockBucket({
        get: vi.fn().mockRejectedValue(new Error('R2 error')),
      })
      mockCache.match.mockResolvedValue(null)

      const app = createTestApp()
      const req = new Request('http://localhost/api/images/error.png')
      const res = await app.fetch(req, { POSTS_BUCKET: mockBucket }, mockCtx)

      expect(res.status).toBe(404)
    })
  })
})
