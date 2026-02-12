import type { FC } from 'hono/jsx'
import { TextLink } from './text-link'

export const Header: FC = () => {
  return (
    <header class='mt-2 px-1 fixed max-w-2xl w-full left-1/2 -translate-x-1/2 z-50'>
      <div class='flex items-center justify-between pl-3 pr-6 xs:pr-10 py-3 border border-text-primary rounded-full bg-background shadow-sm'>
        <div class='flex items-center gap-2 xs:gap-5'>
          <div class='w-12 xs:w-16 h-12 xs:h-16 rounded-full overflow-hidden shrink-0 border border-text-primary/10'>
            <img
              src='/face.png'
              alt='Poko Hanada'
              class='w-full h-full object-cover'
            />
          </div>
          <a
            href='/'
            class='text-text-primary text-lg xs:text-2xl tracking-tighter mr-2'
          >
            Poko <br class='xs:hidden' />
            Hanada
          </a>
        </div>
        <nav>
          <ul class='flex gap-2 xs:gap-6 space-x-1'>
            <li>
              <TextLink href='/#about' class='text-md xs:text-lg font-medium'>
                About
              </TextLink>
            </li>
            <li>
              <TextLink href='/#posts' class='text-md xs:text-lg font-medium'>
                Posts
              </TextLink>
            </li>
            <li>
              <TextLink href='/#tools' class='text-md xs:text-lg font-medium'>
                Tools
              </TextLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
