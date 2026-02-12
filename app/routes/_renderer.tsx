import { jsxRenderer } from 'hono/jsx-renderer'
import { Link, Script } from 'honox/server'
import { Footer } from '../components/footer'
import { Header } from '../components/header'

export default jsxRenderer(({ children }) => {
  return (
    <html lang='ja' class='scroll-smooth scroll-pt-36'>
      <head>
        <meta charset='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        {/* favicon.ico does not work well with some browsers */}
        <link rel='icon' href='/favicon.png' type='image/png' />
        <Link href='/app/style.css' rel='stylesheet' />
        <Script src='/app/client.ts' async />
      </head>
      <body>
        <div class='max-w-2xl mx-auto px-4 min-h-screen flex flex-col'>
          <Header />
          <main class='grow mt-36'>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
})
