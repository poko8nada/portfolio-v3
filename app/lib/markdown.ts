import { matter } from 'gray-matter-es';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { err, ok, type Result } from '../utils/types';

type FrontmatterData = Record<string, unknown>;

export type PostMetadata = {
  title: string;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  tags: string[];
  version: number;
  [key: string]: unknown;
};

export type PostData = PostMetadata & {
  content: string;
};

const isRecord = (value: unknown): value is FrontmatterData =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const getFrontmatterData = (rawContent: string) => {
  const file = matter(rawContent);

  return {
    content: file.content,
    data: isRecord(file.data) ? file.data : {},
  };
};

const getString = (value: unknown) => (typeof value === 'string' ? value : undefined);

const getBoolean = (value: unknown) => (typeof value === 'boolean' ? value : undefined);

const getNumber = (value: unknown) => (typeof value === 'number' ? value : undefined);

const getStringArray = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

const getDateString = (value: unknown) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  return getString(value);
};

const normalizeMetadata = (data: FrontmatterData): PostMetadata => {
  const now = new Date().toISOString();

  return {
    ...data,
    title: getString(data.title) ?? 'Untitled',
    createdAt: getDateString(data.createdAt) ?? now,
    updatedAt: getDateString(data.updatedAt) ?? now,
    isPublished: getBoolean(data.isPublished) ?? false,
    tags: getStringArray(data.tags),
    version: getNumber(data.version) ?? 1,
  };
};

export async function parseMarkdown(rawContent: string): Promise<Result<PostData, string>> {
  try {
    if (!rawContent || rawContent.trim() === '') {
      return err('Empty markdown content');
    }

    const file = getFrontmatterData(rawContent);
    const content = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeStringify)
      .process(file.content);

    if (!content) {
      return err('Failed to process markdown content');
    }

    return ok({
      ...normalizeMetadata(file.data),
      content: content.toString(),
    });
  } catch (error) {
    return err(error instanceof Error ? error.message : 'Unknown error');
  }
}

export async function parseMetadata(rawContent: string): Promise<Result<PostMetadata, string>> {
  try {
    if (!rawContent || rawContent.trim() === '') {
      return err('Empty markdown content');
    }

    const file = getFrontmatterData(rawContent);

    return ok(normalizeMetadata(file.data));
  } catch (error) {
    return err(error instanceof Error ? error.message : 'Unknown error');
  }
}
