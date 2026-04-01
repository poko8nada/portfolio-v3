import React from 'hono/jsx';
import { Section } from '../components/section';
import { ABOUT_STACK_ITEMS, type AboutSortMode, groupAboutStacks } from './about-detail-data';

type AboutDetailProps = {
  sort: AboutSortMode;
};

const sortLinks: Array<{ mode: AboutSortMode; label: string; href: string }> = [
  { mode: 'genre', label: 'ジャンル', href: '/about?sort=genre' },
  { mode: 'frequency', label: '使用頻度', href: '/about?sort=frequency' },
];

export const AboutDetail = ({ sort }: AboutDetailProps) => {
  const groups = groupAboutStacks(ABOUT_STACK_ITEMS, sort);

  return (
    <Section heading='About'>
      <div class='mb-5 prose'>
        <p>こんにちは。PokoHanadaです。</p>
        <p>
          Webディレクター・デベロッパー・エンジニア。
          <br />
          企画・設計から実装・運用まで一貫して担当いたします。
        </p>
        <p>技術スタックは「ジャンル」「使用頻度」で並べ替えできます</p>
      </div>
      <div class='mb-12 flex flex-wrap items-center gap-3'>
        {sortLinks.map((option) => {
          const isActive = option.mode === sort;
          return (
            <a
              key={option.mode}
              href={option.href}
              aria-current={isActive ? 'page' : undefined}
              class={`inline-flex rounded-full border px-3 py-1 text-sm transition-colors ${
                isActive
                  ? 'border-text-primary text-text-primary pointer-events-none'
                  : 'border-border-primary text-text-secondary hover:text-text-primary'
              }`}
            >
              {option.label}
            </a>
          );
        })}
      </div>

      <div class='space-y-10'>
        {groups.map((group) => (
          <section key={group.label}>
            <h3 class='mb-4 text-lg font-medium text-text-primary'>{group.label}</h3>
            <div class='grid gap-3 grid-cols-1'>
              {group.items.map((item) => (
                <div
                  key={item.label}
                  class='flex justify-between align-middle w-full max-w-96 gap-1'
                >
                  <span
                    style={{ width: 'fit-content' }}
                    class='rounded-full border border-border-primary px-3 py-1 text-sm text-text-secondary line-clamp-1'
                  >
                    {item.label}
                  </span>
                  <span class='w-36 p-1 text-sm text-text-secondary text-nowrap'>
                    {sort === 'genre' ? item.frequency : item.genre}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Section>
  );
};
