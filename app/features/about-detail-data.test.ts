import { describe, expect, it } from 'vitest';
import { ABOUT_STACK_ITEMS, groupAboutStacks, resolveAboutSortMode } from './about-detail-data';

describe('about detail data', () => {
  it('falls back to genre sort when the query is missing or invalid', () => {
    expect(resolveAboutSortMode(undefined)).toBe('genre');
    expect(resolveAboutSortMode('')).toBe('genre');
    expect(resolveAboutSortMode('invalid')).toBe('genre');
  });

  it('returns frequency sort only for the supported query value', () => {
    expect(resolveAboutSortMode('frequency')).toBe('frequency');
  });

  it('groups stack items by genre in source order', () => {
    const groups = groupAboutStacks(ABOUT_STACK_ITEMS, 'genre');

    expect(groups[0]?.label).toBe('AI');
    expect(groups[1]?.label).toBe('Markup');
    expect(groups[0]?.items.map((item) => item.label)).toEqual([
      'Cursor / CLI',
      'Github Copilot / CLI',
    ]);
    expect(groups[1]?.items.map((item) => item.label)).toEqual([
      'TypeScript / JavaScript',
      'HTML5 / CSS3',
    ]);
  });

  it('groups stack items by frequency in configured order', () => {
    const groups = groupAboutStacks(ABOUT_STACK_ITEMS, 'frequency');

    expect(groups.map((group) => group.label)).toEqual([
      '★★★ | Daily',
      '☆★★ | Often',
      '☆☆★ | Sometimes',
    ]);
    expect(groups[1]?.items.some((item) => item.label === 'React')).toBe(true);
    expect(groups[2]?.items.some((item) => item.label === 'HeroUI')).toBe(true);
  });
});
