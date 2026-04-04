import React, { useState } from 'hono/jsx';

const CONFIRM_MESSAGE =
  '個人情報を含む履歴書を表示します。周囲に人がいないことを確認してください。';

export default function ResumeOvarlay() {
  const [isDisplay, setIsDisplay] = useState(false);
  const [fading, setFading] = useState(false);

  const handleConfirm = () => {
    if (!window.confirm(CONFIRM_MESSAGE)) {
      return;
    }
    setFading(true);
    setTimeout(() => {
      setIsDisplay(true);
      document.getElementById('resume-content')?.removeAttribute('hidden');
    }, 400);
  };

  if (isDisplay) {
    return null;
  }

  return (
    <div
      class='min-h-screen bg-white px-6 py-12 text-black flex items-center justify-center'
      style={{
        transition: 'opacity 0.4s ease',
        opacity: fading ? 0 : 1,
      }}
    >
      <div class='serif-only w-full max-w-xl border border-black/20 bg-white px-8 py-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)]'>
        <p class='text-sm tracking-[0.2em]'>PRIVATE</p>
        <h1 class='mt-4 text-2xl font-semibold tracking-[0.3em]'>閲覧確認</h1>
        <p class='mt-6 text-sm leading-7'>
          このページには個人情報が含まれます。
          <br />
          表示前に周囲の状況を確認してください。
        </p>
        <button
          class='mt-8 inline-flex cursor-pointer items-center justify-center border border-black px-6 py-3 text-sm tracking-[0.18em] transition-colors hover:bg-black hover:text-white'
          type='button'
          onClick={handleConfirm}
        >
          履歴書を表示する
        </button>
      </div>
    </div>
  );
}
