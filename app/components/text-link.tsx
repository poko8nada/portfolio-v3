import type { Child, FC } from 'hono/jsx'

type Props = {
  href: string
  children: Child
  variant?: 'primary' | 'secondary' | 'underline'
  class?: string
}

export const TextLink: FC<Props> = ({
  href,
  children,
  variant = 'primary',
  class: className,
}) => {
  const baseStyle = 'transition-colors duration-200'

  const variants = {
    primary: 'text-text-primary hover:text-text-secondary',
    secondary: 'text-text-secondary hover:text-text-primary',
    underline:
      'text-text-primary underline underline-offset-8 decoration-text-primary/30 hover:decoration-text-primary',
  }

  const combinedClass = `${baseStyle} ${variants[variant]} ${className || ''}`

  return (
    <a href={href} class={combinedClass}>
      {children}
    </a>
  )
}
