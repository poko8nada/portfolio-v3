import type { Child, FC } from 'hono/jsx'

type Props = {
  href: string
  children: Child
  variant?: 'primary' | 'secondary' | 'underline'
  size?: 'sm' | 'md' | 'lg'
  class?: string
  target?: string
}

export const TextLink: FC<Props> = ({
  href,
  children,
  variant = 'primary',
  size = 'md',
  class: className,
  target = '_self',
}) => {
  const baseStyle = 'transition-colors duration-200 align-middle'

  const variants = {
    primary: 'text-text-primary hover:text-text-secondary',
    secondary: 'text-text-secondary hover:text-text-primary',
    underline:
      'text-text-primary underline underline-offset-4 decoration-text-primary decoration-1 hover:text-text-secondary',
  }

  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  }

  const combinedClass = `${baseStyle} ${sizes[size]} ${variants[variant]} ${className || ''}`

  return (
    <a href={href} class={combinedClass} target={target}>
      {children}
    </a>
  )
}
