import React, { Child } from 'hono/jsx';

export const Photo = ({ children }: { children: Child }) => {
  return <div class={'w-32 h-42 mx-auto my-5 bg-gray-500 col-span-3 row-span-4'}>{children}</div>;
};
