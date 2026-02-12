import { beforeEach, describe, expect, it, vi } from 'vitest'
import { isErr, isOk } from '../utils/types'
import { getAllPosts, getAsset, getPost, listPosts } from './r2'

// R2Bucket のシンプルなモックを作成
const createMockBucket = (overrides: Partial<R2Bucket> = {}): R2Bucket => {
  return {
    get: vi.fn(),
    list: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    head: vi.fn(),
    ...overrides,
  } as unknown as R2Bucket
}

// ExecutionContext のモック
const createMockCtx = (): ExecutionContext => ({
  waitUntil: vi.fn(),
  passThroughOnException: vi.fn(),
  props: {},
})

describe('r2 client utility with cache', () => {
  const mockRequest = new Request('https://example.com/posts/hello')
  const mockCache = {
    match: vi.fn(),
    put: vi.fn(),
  }
  const mockCacheStorage = {
    open: vi.fn().mockResolvedValue(mockCache),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Global caches mock
    vi.stubGlobal('caches', mockCacheStorage)
  })

  describe('getPost', () => {
    it('should return post content from cache if available', async () => {
      const mockCachedText = '# Cached Content'
      mockCache.match.mockResolvedValue(new Response(mockCachedText))
      const mockBucket = createMockBucket()

      const result = await getPost(mockBucket, 'hello', {
        request: mockRequest,
      })

      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value.content).toBe(mockCachedText)
        expect(result.value.fromCache).toBe(true)
      }
      // Should not call bucket if cache hits
      expect(mockBucket.get).not.toHaveBeenCalled()
    })

    it('should fetch from R2 and save to cache on miss', async () => {
      const mockText = '# R2 Content'
      const mockCtx = createMockCtx()
      mockCache.match.mockResolvedValue(null)
      const mockBucket = createMockBucket({
        get: vi.fn().mockResolvedValue({
          text: () => Promise.resolve(mockText),
        }),
      })

      const result = await getPost(mockBucket, 'hello', {
        request: mockRequest,
        ctx: mockCtx,
      })

      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value.content).toBe(mockText)
        expect(result.value.fromCache).toBe(false)
      }
      expect(mockBucket.get).toHaveBeenCalledWith('posts/hello.md')
      // Should save to cache via waitUntil
      expect(mockCtx.waitUntil).toHaveBeenCalled()
      expect(mockCache.put).toHaveBeenCalled()
    })

    it('should fallback to R2 if cache match fails', async () => {
      const mockText = '# Fallback Content'
      mockCache.match.mockRejectedValue(new Error('Cache error'))
      const mockBucket = createMockBucket({
        get: vi.fn().mockResolvedValue({
          text: () => Promise.resolve(mockText),
        }),
      })

      const result = await getPost(mockBucket, 'hello', {
        request: mockRequest,
      })

      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value.content).toBe(mockText)
        expect(result.value.fromCache).toBe(false)
      }
    })

    it('should return error when post is not found in R2', async () => {
      mockCache.match.mockResolvedValue(null)
      const mockBucket = createMockBucket({
        get: vi.fn().mockResolvedValue(null),
      })

      const result = await getPost(mockBucket, 'missing', {
        request: mockRequest,
      })

      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error).toBe('Post not found: missing')
      }
    })
  })

  describe('getAsset', () => {
    it('should return asset from cache if available', async () => {
      const mockBody = new ReadableStream()
      mockCache.match.mockResolvedValue(
        new Response(mockBody, {
          headers: { 'Content-Type': 'image/png', ETag: 'etag123' },
        }),
      )
      const mockBucket = createMockBucket()

      const result = await getAsset(mockBucket, 'images/test.png', {
        request: mockRequest,
      })

      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value.fromCache).toBe(true)
        expect(result.value.httpMetadata?.contentType).toBe('image/png')
        expect(result.value.httpEtag).toBe('etag123')
      }
      expect(mockBucket.get).not.toHaveBeenCalled()
    })

    it('should fetch from R2 and save to cache on miss', async () => {
      const mockCtx = createMockCtx()
      const mockBody = new ReadableStream()
      mockCache.match.mockResolvedValue(null)
      const mockBucket = createMockBucket({
        get: vi.fn().mockResolvedValue({
          body: mockBody,
          writeHttpMetadata: (h: Headers) =>
            h.set('Content-Type', 'image/jpeg'),
          httpEtag: 'etag456',
        }),
      })

      const result = await getAsset(mockBucket, 'images/test.jpg', {
        request: mockRequest,
        ctx: mockCtx,
      })

      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value.fromCache).toBe(false)
        expect(result.value.httpEtag).toBe('etag456')
      }
      expect(mockBucket.get).toHaveBeenCalledWith('images/test.jpg')
      expect(mockCtx.waitUntil).toHaveBeenCalled()
    })

    it('should return error when asset is not found in R2', async () => {
      mockCache.match.mockResolvedValue(null)
      const mockBucket = createMockBucket({
        get: vi.fn().mockResolvedValue(null),
      })

      const result = await getAsset(mockBucket, 'images/missing.png', {
        request: mockRequest,
      })

      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error).toBe('Asset not found: images/missing.png')
      }
    })
  })

  describe('listPosts', () => {
    it('should return list of slugs from posts/ prefix', async () => {
      const mockBucket = createMockBucket({
        list: vi.fn().mockResolvedValue({
          objects: [
            { key: 'posts/post-1.md' },
            { key: 'posts/post-2.md' },
            { key: 'posts/' }, // Empty key filter check
          ],
        }),
      })

      const result = await listPosts(mockBucket)

      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toEqual(['post-1', 'post-2'])
      }
    })

    it('should return error when bucket.list throws', async () => {
      const mockBucket = createMockBucket({
        list: vi.fn().mockRejectedValue(new Error('list failed')),
      })

      const result = await listPosts(mockBucket)

      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error).toBe('list failed')
      }
    })
  })

  describe('getAllPosts', () => {
    it('should return only successfully fetched posts', async () => {
      mockCache.match.mockResolvedValue(null)
      const mockBucket = createMockBucket({
        list: vi.fn().mockResolvedValue({
          objects: [{ key: 'posts/post-1.md' }, { key: 'posts/post-2.md' }],
        }),
        get: vi
          .fn()
          .mockResolvedValueOnce({
            text: () => Promise.resolve('# Post 1'),
          })
          .mockResolvedValueOnce(null),
      })

      const result = await getAllPosts(mockBucket, 100, { request: mockRequest })

      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toEqual([{ slug: 'post-1', content: '# Post 1' }])
      }
    })
  })
})
