import React, { useState, useCallback } from 'hono/jsx';

const CONTRACT_TEXT = `本ページには、職務経歴・個人情報が含まれています。
閲覧にあたり、以下の事項に同意いただく必要があります。

【閲覧目的】
本ページは、採用・業務委託・協業の検討を目的として
特定の方にのみ公開しています。

【取り扱いについて】
・本ページの内容を第三者に共有・転送しないこと
・スクリーンショット・印刷等による複製をしないこと
・閲覧目的以外に情報を利用しないこと

【情報の正確性】
掲載内容は作成時点のものであり、
最新情報と異なる場合があります。

上記に同意の上、閲覧される場合は、
「同意して閲覧する」ボタンを押してください。

同意いただけない場合はページを閉じてください。`;

const CONFIRM_MESSAGE =
  '個人情報を含む履歴書を表示します。周囲に人がいないことを確認してください。';

const SESSION_KEY = 'contract_read';

export default function ResumeOverlay() {
  const [isDisplay, setIsDisplay] = useState(false);
  const [fading, setFading] = useState(false);

  const [hasRead, setHasRead] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  });

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

  const handleScroll = useCallback(
    (e: Event) => {
      if (hasRead) return;

      const el = e.target as HTMLTextAreaElement;
      const isBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;

      if (isBottom) {
        sessionStorage.setItem(SESSION_KEY, 'true');
        setTimeout(() => {
          setHasRead(true);
        }, 500);
      }
    },
    [hasRead],
  );

  if (isDisplay) {
    return null;
  }

  return (
    <div
      class='min-w-xl w-full min-h-screen bg-white text-black flex items-center justify-center'
      style={{
        transition: 'opacity 0.4s ease',
        opacity: fading ? 0 : 1,
      }}
    >
      <div class='serif-only w-xl border border-black/20 bg-white px-8 py-10 mx-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)]'>
        <p class='text-sm tracking-[0.2em]'>PRIVATE</p>
        <h1 class='mt-4 text-2xl font-semibold tracking-[0.3em]'>閲覧確認</h1>
        <p class='my-6 text-sm leading-7'>
          このページには個人情報が含まれます。
          <br />
          表示前に周囲の状況を確認してください。
        </p>
        <div>
          <textarea
            readOnly
            onScroll={handleScroll}
            style={{
              width: '500px',
              height: '240px',
              padding: '1em',
              fontSize: '14px',
              lineHeight: '1.6',
              resize: 'none',
              border: hasRead ? '2px solid #22c55e' : '2px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: '#f9fafb',
            }}
            value={CONTRACT_TEXT}
          />
        </div>
        <button
          class='w-52 mt-8 inline-flex cursor-pointer items-center justify-center border border-black px-6 py-3 text-sm tracking-[0.18em] transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-400'
          type='button'
          onClick={handleConfirm}
          disabled={!hasRead}
        >
          {hasRead ? '同意して閲覧する' : '上記をご確認ください'}
        </button>
      </div>
    </div>
  );
}
