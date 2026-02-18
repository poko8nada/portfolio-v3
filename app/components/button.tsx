import type { Child, FC } from 'hono/jsx'

type Props = {
  href: string
  children: Child
  variant?: 'primary' | 'secondary'
  class?: string
  size?: 'sm' | 'md' | 'lg'
  target?: string
}

export const Button: FC<Props> = ({
  href,
  children,
  class: className,
  variant = 'primary',
  size = 'md',
  target = '_self',
}) => {
  const sizeClasses: Record<string, string> = {
    sm: 'px-2 py-[.2em] text-xs min-w-12 ',
    md: 'px-3 py-3 text-sm min-w-25 ',
    lg: 'px-4 py-3 text-base min-w-30 ',
  }
  const variantClasses: Record<NonNullable<Props['variant']>, string> = {
    primary:
      'border-text-primary border text-text-primary hover:text-text-secondary ',
    secondary:
      'border-text-secondary border text-text-secondary hover:text-text-primary ',
  }

  return (
    <a
      href={href}
      rel='noopener noreferrer'
      target={target}
      class={`inline-block mx-1 text-center no-underline rounded-full ${sizeClasses[size]} ${variantClasses[variant]} ${className || ''}`}
    >
      {children}
    </a>
  )
}
