import React from 'hono/jsx';

export const TimelineSeparator = ({ value }: { value: string }) => {
  return (
    <div class={'grid grid-cols-12 border border-t-0 h-10'}>
      <div class={'text-sm text-center col-span-1 border-r border-dashed'}></div>
      <div class={'text-sm text-center col-span-1 border-r'}></div>
      <div class={'text-sm col-span-10 flex justify-center content-center flex-wrap'}>
        <span class={'leading-none h-4'}>{value}</span>
      </div>
    </div>
  );
};
