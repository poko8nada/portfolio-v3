import type { FC } from 'hono/jsx'

export const Footer: FC = () => {
  const year = new Date().getFullYear()

  return (
    <footer class='pt-12 pb-2 flex justify-center'>
      <p class='text-text-secondary text-sm'>&copy; {year} Poko Hanada</p>
    </footer>
  )
}
