import React from 'hono/jsx';

type TimelineBoxProps = {
  year?: string;
  month?: string;
  text?: string;
};

export const TimelineBox = ({ year, month, text }: TimelineBoxProps) => {
  return (
    <div class={'grid grid-cols-12 border border-t-0 h-10'}>
      <div class={'text-sm text-center col-span-1 border-r border-dashed pt-3'}>{year}</div>
      <div class={'text-sm text-center col-span-1 border-r pt-3'}>{month}</div>
      <div class={'text-sm col-span-10 pl-2 flex content-center flex-wrap'}>
        <span class={'leading-none h-4'}>{text}</span>
      </div>
    </div>
  );
};
