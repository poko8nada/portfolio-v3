export const ABOUT_SORT_MODES = ['genre', 'frequency'] as const;

export type AboutSortMode = (typeof ABOUT_SORT_MODES)[number];
export type AboutFrequency = '★★★ | Daily' | '☆★★ | Often' | '☆☆★ | Sometimes';

export type AboutStackItem = {
  label: string;
  genre: string;
  frequency: AboutFrequency;
};

export type AboutStackGroup = {
  label: string;
  items: AboutStackItem[];
};

export const ABOUT_STACK_ITEMS: AboutStackItem[] = [
  { label: 'Cursor / CLI', genre: 'AI', frequency: '★★★ | Daily' },
  { label: 'Github Copilot / CLI', genre: 'AI', frequency: '★★★ | Daily' },
  { label: 'TypeScript / JavaScript', genre: 'Markup', frequency: '★★★ | Daily' },
  { label: 'HTML5 / CSS3', genre: 'Markup', frequency: '★★★ | Daily' },
  { label: 'Affinity', genre: 'Design/UI', frequency: '☆★★ | Often' },
  { label: 'Figma', genre: 'Design/UI', frequency: '☆☆★ | Sometimes' },
  { label: 'Pencil', genre: 'Design/UI', frequency: '☆☆★ | Sometimes' },
  { label: 'React', genre: 'Frontend', frequency: '☆★★ | Often' },
  { label: 'Next.js', genre: 'Frontend', frequency: '☆★★ | Often' },
  { label: 'Honox', genre: 'Frontend', frequency: '☆★★ | Often' },
  { label: 'Tailwind CSS', genre: 'Frontend', frequency: '★★★ | Daily' },
  { label: 'shadcn/ui', genre: 'Frontend', frequency: '☆★★ | Often' },
  { label: 'HeroUI', genre: 'Frontend', frequency: '☆☆★ | Sometimes' },
  { label: 'Hono', genre: 'Backend/DB', frequency: '☆★★ | Often' },
  { label: 'Node.js', genre: 'Backend/DB', frequency: '★★★ | Daily' },
  { label: 'Drizzle ORM', genre: 'Backend/DB', frequency: '☆★★ | Often' },
  { label: 'Turso', genre: 'Backend/DB', frequency: '☆☆★ | Sometimes' },
  { label: 'Supabase', genre: 'Backend/DB', frequency: '☆☆★ | Sometimes' },
  { label: 'Firestore / Mongo DB', genre: 'Backend/DB', frequency: '☆☆★ | Sometimes' },
  { label: 'Cloudflare R2', genre: 'Backend/DB', frequency: '☆☆★ | Sometimes' },
  { label: 'Cloudflare D1', genre: 'Backend/DB', frequency: '☆☆★ | Sometimes' },
  { label: 'Vite', genre: 'Build/Quality', frequency: '★★★ | Daily' },
  { label: 'Git / GitHub', genre: 'Build/Quality', frequency: '★★★ | Daily' },
  { label: 'Biome', genre: 'Build/Quality', frequency: '☆★★ | Often' },
  { label: 'Oxlint / Oxfmt', genre: 'Build/Quality', frequency: '☆★★ | Often' },
  { label: 'Notion / Notion API', genre: 'Collabo/Docs', frequency: '☆★★ | Often' },
  { label: 'Resend', genre: 'Collabo/Docs', frequency: '☆☆★ | Sometimes' },
  { label: 'Cloudflare Workers', genre: 'Infra/Cloud', frequency: '★★★ | Daily' },
  { label: 'Cloudflare Pages', genre: 'Infra/Cloud', frequency: '☆★★ | Often' },
  { label: 'Cloudflare Turnstile', genre: 'Infra/Cloud', frequency: '☆☆★ | Sometimes' },
  { label: 'Vercel / Netlify', genre: 'Infra/Cloud', frequency: '☆☆★ | Sometimes' },
  { label: 'Google Cloud', genre: 'Infra/Cloud', frequency: '☆☆★ | Sometimes' },
  { label: 'Docker', genre: 'Infra/Cloud', frequency: '☆☆★ | Sometimes' },
  { label: 'Google Analytics 4', genre: 'Analysis', frequency: '☆★★ | Often' },
  { label: 'Google Tag Manager', genre: 'Analysis', frequency: '☆★★ | Often' },
  { label: 'MAツール', genre: 'Analysis', frequency: '☆★★ | Often' },
];

const ABOUT_PROFICIENCY_ORDER: AboutFrequency[] = ['★★★ | Daily', '☆★★ | Often', '☆☆★ | Sometimes'];
const ABOUT_GENRE_ORDER = Array.from(new Set(ABOUT_STACK_ITEMS.map((item) => item.genre)));

export function resolveAboutSortMode(value: string | null | undefined): AboutSortMode {
  return value === 'frequency' ? 'frequency' : 'genre';
}

export function groupAboutStacks(items: AboutStackItem[], sort: AboutSortMode): AboutStackGroup[] {
  if (sort === 'frequency') {
    return ABOUT_PROFICIENCY_ORDER.map((label) => ({
      label,
      items: items.filter((item) => item.frequency === label),
    })).filter((group) => group.items.length > 0);
  }

  return ABOUT_GENRE_ORDER.map((label) => ({
    label,
    items: items.filter((item) => item.genre === label),
  })).filter((group) => group.items.length > 0);
}
