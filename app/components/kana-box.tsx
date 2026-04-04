import React, { type Child } from 'hono/jsx';

type KanaBoxProps = {
  kana?: string;
  text: string;
  typeText: string;
  additionalClass?: string;
  children?: Child;
};

export const KanaBox = ({ additionalClass, kana, typeText, text, children }: KanaBoxProps) => {
  return (
    <div class={`border grid grid-cols-16 ${additionalClass}`}>
      <div class={'col-span-2 text-xs flex content-center flex-wrap border-b border-dashed py-1'}>
        <span class={'leading-none h-3 pl-1'}>フリガナ</span>
      </div>
      <div class={'col-span-[14] text-sm border-b border-dashed'}>{kana}</div>
      <div class={'col-span-2 text-xs flex content-center flex-wrap'}>
        <span class={'leading-none h-3 pl-1'}>{typeText}</span>
      </div>
      <div class={'col-span-[14]'}>
        {children}
        <p class={'text-lg leading-10'}>{text}</p>
      </div>
    </div>
  );
};
