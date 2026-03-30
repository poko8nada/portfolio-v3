import React from 'hono/jsx';
import { Section } from '../components/section';
import { ABOUT_STACK_ITEMS, type AboutSortMode, groupAboutStacks } from './about-detail-data';

type AboutDetailProps = {
  sort: AboutSortMode;
};

const sortLinks: Array<{ mode: AboutSortMode; label: string; href: string }> = [
  { mode: 'genre', label: 'ジャンル順', href: '/about?sort=genre' },
  { mode: 'proficiency', label: '習熟度順', href: '/about?sort=proficiency' },
];

export const AboutDetail = ({ sort }: AboutDetailProps) => {
  const groups = groupAboutStacks(ABOUT_STACK_ITEMS, sort);

  return (
    <Section>
      <h2 class='mb-4 text-2xl text-text-primary'>Stacks</h2>
      <p class='mb-8 text-sm text-text-secondary'>
        ジャンルと習熟度の 2 つの軸で並び替えできます。
      </p>

      <div class='mb-10 flex flex-wrap items-center gap-3'>
        {sortLinks.map((option) => {
          const isActive = option.mode === sort;
          return (
            <a
              key={option.mode}
              href={option.href}
              aria-current={isActive ? 'page' : undefined}
              class={`inline-flex rounded-full border px-3 py-1 text-sm transition-colors ${
                isActive
                  ? 'border-text-primary text-text-primary'
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
            <div class='flex flex-wrap gap-2'>
              {group.items.map((item) => (
                <span
                  key={item.label}
                  class='inline-flex rounded-full border border-border-primary px-3 py-1 text-sm text-text-secondary'
                >
                  {item.label}
                </span>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Section>
  );
};
