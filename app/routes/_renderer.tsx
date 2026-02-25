import { jsxRenderer } from 'hono/jsx-renderer'
import { Link, Script } from 'honox/server'
import { Footer } from '../components/footer'
import { Header } from '../components/header'

const gtmScript = (containerId: string) =>
  `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','${containerId}');`

export default jsxRenderer(({ children }, c) => {
  const gtmContainerId = c.env.GTM_CONTAINER_ID
  const canonicalUrl = c.req.url.replace(/\/$/, '') // Remove trailing slash for canonical URL
  const path = c.req.path
  const isPostPage = path.startsWith('/posts/') && path !== '/posts'
  console.log(`Rendering page: ${path}, isPostPage: ${isPostPage}`)

  return (
    <html lang='ja' class='scroll-smooth scroll-pt-36'>
      <head>
        <meta charset='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        {/* favicon.ico does not work well with some browsers */}
        <link rel='icon' href='/favicon.png' type='image/png' />
        <link rel='canonical' href={canonicalUrl} />
        {/* OGP Meta Tags */}
        {!isPostPage && <meta property='og:image' content='/ogp.png' />}
        <meta property='og:image:width' content='1200' />
        <meta property='og:image:height' content='630' />
        {!isPostPage && <meta property='og:type' content='website' />}
        <meta property='og:url' content={canonicalUrl} />
        <meta name='twitter:card' content='summary_large_image' />
        {!isPostPage && <meta name='twitter:image' content='/ogp.png' />}
        <meta name='twitter:url' content={canonicalUrl} />
        {gtmContainerId ? (
          <script
            dangerouslySetInnerHTML={{
              __html: gtmScript(gtmContainerId),
            }}
          />
        ) : null}
        <Link href='/app/style.css' rel='stylesheet' />
        <Script src='/app/client.ts' async />
      </head>
      <body>
        {gtmContainerId ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmContainerId}`}
              height='0'
              width='0'
              style='display:none;visibility:hidden'
              title='gtm'
            />
          </noscript>
        ) : null}
        <div class='max-w-2xl mx-auto px-4 min-h-screen flex flex-col'>
          <Header path={path} />
          <main class='grow mt-36'>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
})
