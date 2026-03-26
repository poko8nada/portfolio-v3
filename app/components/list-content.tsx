import React, { type Child, type FC } from 'hono/jsx';
import { TextLink } from './text-link';

type Props = {
  children: Child;
  class?: string;
  href: string;
  title: string;
  target?: string;
};

export const ListContent: FC<Props> = ({
  children,
  class: className,
  href,
  title,
  target = '_self',
}) => {
  return (
    <li class={`mb-2 not-last:mb-10 ${className || ''}`}>
      <TextLink href={href} variant='underline' size='lg' target={target}>
        {title}
      </TextLink>
      {children}
    </li>
  );
};
