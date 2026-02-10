import type { Child, FC } from 'hono/jsx'

type Props = {
  href: string
  children: Child
  variant?: 'primary' | 'secondary' | 'underline'
  size?: 'sm' | 'md' | 'lg'
  class?: string
  target?: string
}

export const Button: FC<Props> = ({
  href,
  children,
  class: className,
  size = 'md',
  target = '_self',
}) => {
  const sizeClasses: Record<string, string> = {
    sm: 'px-2 py-[.2em] text-xs min-w-12 ',
    md: 'px-3 py-3 text-sm min-w-25 ',
    lg: 'px-4 py-4 text-base min-w-30 ',
  }

  return (
    <a
      href={href}
      rel='noopener noreferrer'
      target={target}
      class={`inline-block mx-1 ${sizeClasses[size]} text-center no-underline rounded-full border-text-primary border text-text-primary hover:text-text-secondary ${className || ''}`}
    >
      {children}
    </a>
  )
}
