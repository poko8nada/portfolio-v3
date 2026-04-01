import { err, ok, type Result } from '../utils/types';

export const ABOUT_SORT_MODES = ['genre', 'frequency'] as const;

export type AboutSortMode = (typeof ABOUT_SORT_MODES)[number];

export type AboutStackItem = {
  label: string;
  genre: string;
  frequency: string;
};

export type AboutStackGroup = {
  label: string;
  items: AboutStackItem[];
};

const ABOUT_PROFICIENCY_ORDER = ['★★★ | Daily', '☆★★ | Often', '☆☆★ | Sometimes'];

export function resolveAboutSortMode(value: string | null | undefined): AboutSortMode {
  return value === 'frequency' ? 'frequency' : 'genre';
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isAboutStackItem(value: unknown): value is AboutStackItem {
  return (
    isObjectRecord(value) &&
    typeof value.label === 'string' &&
    typeof value.genre === 'string' &&
    typeof value.frequency === 'string'
  );
}

export function parseAboutStackDocument(content: string): Result<AboutStackItem[], string> {
  try {
    const parsed: unknown = JSON.parse(content);
    if (!isObjectRecord(parsed)) {
      return err('Invalid about stack document');
    }

    const stacks = parsed.stacks;
    if (!Array.isArray(stacks)) {
      return err('Invalid about stack document');
    }

    const validatedItems: AboutStackItem[] = [];
    for (const [index, item] of stacks.entries()) {
      if (!isAboutStackItem(item)) {
        return err(`Invalid about stack item at index ${index}`);
      }

      validatedItems.push(item);
    }

    return ok(validatedItems);
  } catch (error) {
    return err(error instanceof Error ? error.message : 'Unknown error');
  }
}

export function groupAboutStacks(items: AboutStackItem[], sort: AboutSortMode): AboutStackGroup[] {
  if (sort === 'frequency') {
    return ABOUT_PROFICIENCY_ORDER.map((label) => ({
      label,
      items: items.filter((item) => item.frequency === label),
    })).filter((group) => group.items.length > 0);
  }

  const genreOrder = Array.from(new Set(items.map((item) => item.genre)));

  return genreOrder
    .map((label) => ({
      label,
      items: items.filter((item) => item.genre === label),
    }))
    .filter((group) => group.items.length > 0);
}
