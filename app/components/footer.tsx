import type { FC } from 'hono/jsx'

export const Footer: FC = () => {
  const year = new Date().getFullYear()

  return (
    <footer class='py-12 flex justify-center'>
      <p class='text-text-secondary text-sm'>&copy; {year} Poko Hanada</p>
    </footer>
  )
}
