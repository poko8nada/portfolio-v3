import type { Child, FC } from 'hono/jsx'

type Props = {
  id?: string
  children: Child
  class?: string
  heading?: string
}

export const Section: FC<Props> = ({
  id,
  children,
  class: className,
  heading,
}) => {
  return (
    <section id={id} class={`mb-20 px-2 ${className || ''}`}>
      {heading && <h2 class='mb-12 text-4xl font-semibold'>{heading}</h2>}
      {children}
    </section>
  )
}
