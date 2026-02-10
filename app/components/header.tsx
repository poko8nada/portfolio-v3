import type { FC } from 'hono/jsx'
import { TextLink } from './text-link'

export const Header: FC = () => {
  return (
    <header class='mt-8 mb-20'>
      <div class='flex items-center justify-between pl-3 pr-10 py-3 border border-text-primary rounded-full bg-background shadow-sm'>
        <div class='flex items-center gap-5'>
          <div class='w-16 h-16 rounded-full overflow-hidden shrink-0 border border-text-primary/10'>
            <img
              src='/face.jpeg'
              alt='Poko Hanada'
              class='w-full h-full object-cover'
            />
          </div>
          <a
            href='/'
            class='text-text-primary font-bold text-2xl tracking-tighter'
          >
            Poko Hanada
          </a>
        </div>
        <nav>
          <ul class='flex gap-10'>
            <li>
              <TextLink href='/#about' class='text-lg font-medium'>
                About
              </TextLink>
            </li>
            <li>
              <TextLink href='/posts' class='text-lg font-medium'>
                Blog
              </TextLink>
            </li>
            <li>
              <TextLink href='/#tools' class='text-lg font-medium'>
                Tools
              </TextLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
