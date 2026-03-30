import { describe, expect, it } from 'vitest';
import { ABOUT_STACK_ITEMS, groupAboutStacks, resolveAboutSortMode } from './about-detail-data';

describe('about detail data', () => {
  it('falls back to genre sort when the query is missing or invalid', () => {
    expect(resolveAboutSortMode(undefined)).toBe('genre');
    expect(resolveAboutSortMode('')).toBe('genre');
    expect(resolveAboutSortMode('invalid')).toBe('genre');
  });

  it('returns proficiency sort only for the supported query value', () => {
    expect(resolveAboutSortMode('proficiency')).toBe('proficiency');
  });

  it('groups stack items by genre in source order', () => {
    const groups = groupAboutStacks(ABOUT_STACK_ITEMS, 'genre');

    expect(groups[0]?.label).toBe('言語・マークアップ');
    expect(groups[1]?.label).toBe('フロントエンド');
    expect(groups[0]?.items.map((item) => item.label)).toEqual([
      'TypeScript / JavaScript',
      'HTML5 / CSS3',
    ]);
  });

  it('groups stack items by proficiency in configured order', () => {
    const groups = groupAboutStacks(ABOUT_STACK_ITEMS, 'proficiency');

    expect(groups.map((group) => group.label)).toEqual(['Primary', 'Applied', 'Aware']);
    expect(groups[0]?.items.some((item) => item.label === 'React')).toBe(true);
    expect(groups[2]?.items.some((item) => item.label === 'HeroUI')).toBe(true);
  });
});
