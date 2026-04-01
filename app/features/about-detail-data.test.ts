import { describe, expect, it } from 'vitest';
import { isErr, isOk } from '../utils/types';
import {
  groupAboutStacks,
  parseAboutStackDocument,
  resolveAboutSortMode,
  type AboutStackItem,
} from './about-detail-data';

const ABOUT_STACK_ITEMS: AboutStackItem[] = [
  { label: 'Cursor / CLI', genre: 'AI', frequency: '★★★ | Daily' },
  { label: 'Github Copilot / CLI', genre: 'AI', frequency: '★★★ | Daily' },
  { label: 'TypeScript / JavaScript', genre: 'Markup', frequency: '★★★ | Daily' },
  { label: 'HTML5 / CSS3', genre: 'Markup', frequency: '★★★ | Daily' },
  { label: 'React', genre: 'Frontend', frequency: '☆★★ | Often' },
  { label: 'HeroUI', genre: 'Frontend', frequency: '☆☆★ | Sometimes' },
];

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

  it('parses a valid stack document', () => {
    const result = parseAboutStackDocument(
      JSON.stringify({
        'last-updated': '2026-04-01',
        stacks: ABOUT_STACK_ITEMS,
      }),
    );

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value).toEqual(ABOUT_STACK_ITEMS);
    }
  });

  it('returns an error for an invalid stack document shape', () => {
    const result = parseAboutStackDocument(
      JSON.stringify({
        stacks: [{ label: 'Cursor / CLI', genre: 'AI' }],
      }),
    );

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error).toBe('Invalid about stack item at index 0');
    }
  });

  it('returns an error when the document is not valid json', () => {
    const result = parseAboutStackDocument('{');

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error).toBeDefined();
    }
  });
});
