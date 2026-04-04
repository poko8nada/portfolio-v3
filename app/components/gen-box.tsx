import React, { Child } from 'hono/jsx';

type GenBoxProps = {
  typeText: string;
  additionalClass?: string;
  children?: Child;
};

export const GenBox = ({ additionalClass, typeText, children }: GenBoxProps) => {
  return (
    <div class={`border ${additionalClass}`}>
      <div class={'text-xs'}>
        <span class={'leading-none h-3 pl-1'}>{typeText}</span>
      </div>
      <div>{children}</div>
    </div>
  );
};
