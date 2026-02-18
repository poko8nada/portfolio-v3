import { createRoute } from 'honox/factory'
import { listPosts } from '../lib/r2'
import { isOk } from '../utils/types'

const getRoutes = () => {
  // Import all route files except API routes, test/spec files, and sitemap.xml.tsx
  const modules = import.meta.glob([
    '../routes/**/[!_]*.{ts,tsx}',
    '!../routes/api/**',
    '!../routes/**/*.test.{ts,tsx}',
    '!../routes/**/*.spec.{ts,tsx}',
    '!../routes/sitemap.xml.tsx',
  ])

  return (
    Object.keys(modules)
      .map(file => {
        let path = file
          .replace('../routes', '')
          .replace(/\.(ts|tsx)$/, '')
          .replace(/\/index$/, '')

        if (path === '') path = '/'
        return path
      })
      // Exclude dynamic routes (e.g. /posts/[slug]) and special files (e.g. /_app)
      .filter(p => !p.includes('/_') && !p.includes('/[') && p !== '/404')
      .sort()
  )
}

const getPostRoutes = async (bucket: R2Bucket) => {
  const posts = await listPosts(bucket)
  if (!isOk(posts)) return []
  return posts.value
    .filter(slug => slug !== '' && !slug.startsWith('.') && !slug.includes('/'))
    .map(slug => `/posts/${slug}`)
}

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const buildSitemapXml = (origin: string, routes: string[]) => {
  const lastmod = new Date().toISOString().slice(0, 10)
  const urls = routes
    .map(path => {
      const normalizedPath = path || '/'
      const url = new URL(normalizedPath, origin)
      const loc = escapeXml(url.toString())
      const isTop = url.pathname === '/'
      const changefreq = isTop ? 'daily' : 'weekly'
      const priority = isTop ? '1.0' : '0.8'
      return `<url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

export default createRoute(async c => {
  const routes = [
    ...getRoutes(),
    ...(await getPostRoutes(c.env.POSTS_BUCKET)),
  ].sort()
  const origin = new URL(c.req.url).origin
  const xml = buildSitemapXml(origin, routes)
  return c.body(xml, 200, {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=3600',
  })
})
