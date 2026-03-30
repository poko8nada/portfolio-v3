export const ABOUT_SORT_MODES = ['genre', 'proficiency'] as const;

export type AboutSortMode = (typeof ABOUT_SORT_MODES)[number];
export type AboutProficiency = 'Primary' | 'Applied' | 'Aware';

export type AboutStackItem = {
  label: string;
  genre: string;
  proficiency: AboutProficiency;
};

export type AboutStackGroup = {
  label: string;
  items: AboutStackItem[];
};

export const ABOUT_STACK_ITEMS: AboutStackItem[] = [
  { label: 'TypeScript / JavaScript', genre: '言語・マークアップ', proficiency: 'Primary' },
  { label: 'HTML5 / CSS3', genre: '言語・マークアップ', proficiency: 'Primary' },
  { label: 'React', genre: 'フロントエンド', proficiency: 'Primary' },
  { label: 'Next.js', genre: 'フロントエンド', proficiency: 'Applied' },
  { label: 'Tailwind CSS', genre: 'フロントエンド', proficiency: 'Primary' },
  { label: 'shadcn/ui', genre: 'フロントエンド', proficiency: 'Applied' },
  { label: 'HeroUI', genre: 'フロントエンド', proficiency: 'Aware' },
  { label: 'Node.js', genre: 'バックエンド・データ', proficiency: 'Applied' },
  { label: 'Drizzle ORM', genre: 'バックエンド・データ', proficiency: 'Applied' },
  { label: 'Turso', genre: 'バックエンド・データ', proficiency: 'Aware' },
  { label: 'Supabase', genre: 'バックエンド・データ', proficiency: 'Applied' },
  { label: 'MongoDB / Firestore', genre: 'バックエンド・データ', proficiency: 'Aware' },
  { label: 'Vite', genre: 'ビルド・品質・リポジトリ', proficiency: 'Primary' },
  { label: 'Git / GitHub', genre: 'ビルド・品質・リポジトリ', proficiency: 'Primary' },
  { label: 'Biome', genre: 'ビルド・品質・リポジトリ', proficiency: 'Applied' },
  { label: 'Oxlint / Oxfmt', genre: 'ビルド・品質・リポジトリ', proficiency: 'Applied' },
  { label: 'Notion / Notion API', genre: '連携・ドキュメント', proficiency: 'Applied' },
  { label: 'Resend', genre: '連携・ドキュメント', proficiency: 'Aware' },
  { label: 'Cloudflare Workers', genre: 'インフラ・クラウド', proficiency: 'Primary' },
  { label: 'Cloudflare Pages', genre: 'インフラ・クラウド', proficiency: 'Applied' },
  { label: 'Cloudflare R2', genre: 'インフラ・クラウド', proficiency: 'Applied' },
  { label: 'Cloudflare Turnstile', genre: 'インフラ・クラウド', proficiency: 'Applied' },
  { label: 'Vercel / Netlify', genre: 'インフラ・クラウド', proficiency: 'Applied' },
  { label: 'Google Cloud', genre: 'インフラ・クラウド', proficiency: 'Aware' },
  { label: 'Docker', genre: 'インフラ・クラウド', proficiency: 'Aware' },
  { label: 'Google Analytics 4', genre: '分析・マーケティング（ツール）', proficiency: 'Applied' },
  { label: 'Google Tag Manager', genre: '分析・マーケティング（ツール）', proficiency: 'Applied' },
  { label: 'MAツール', genre: '分析・マーケティング（ツール）', proficiency: 'Primary' },
  { label: 'プロジェクト', genre: 'プロフェッショナルスキル', proficiency: 'Primary' },
  { label: '提案・営業寄り', genre: 'プロフェッショナルスキル', proficiency: 'Applied' },
  { label: '関係者との調整', genre: 'プロフェッショナルスキル', proficiency: 'Applied' },
  { label: 'チーム周り', genre: 'プロフェッショナルスキル', proficiency: 'Applied' },
  { label: '建設・土木', genre: '領域知識・キャリア', proficiency: 'Applied' },
  { label: '環境・リサイクル', genre: '領域知識・キャリア', proficiency: 'Applied' },
  { label: '教育・人材育成', genre: '領域知識・キャリア', proficiency: 'Applied' },
  { label: 'Webマーケティング', genre: '領域知識・キャリア', proficiency: 'Applied' },
  { label: '独学でのスキル獲得', genre: '学習・キャリアの傾向', proficiency: 'Primary' },
  { label: 'キャリアチェンジ', genre: '学習・キャリアの傾向', proficiency: 'Applied' },
  { label: '継続的改善', genre: '学習・キャリアの傾向', proficiency: 'Primary' },
];

const ABOUT_PROFICIENCY_ORDER: AboutProficiency[] = ['Primary', 'Applied', 'Aware'];
const ABOUT_GENRE_ORDER = Array.from(new Set(ABOUT_STACK_ITEMS.map((item) => item.genre)));

export function resolveAboutSortMode(value: string | null | undefined): AboutSortMode {
  return value === 'proficiency' ? 'proficiency' : 'genre';
}

export function groupAboutStacks(items: AboutStackItem[], sort: AboutSortMode): AboutStackGroup[] {
  if (sort === 'proficiency') {
    return ABOUT_PROFICIENCY_ORDER.map((label) => ({
      label,
      items: items.filter((item) => item.proficiency === label),
    })).filter((group) => group.items.length > 0);
  }

  return ABOUT_GENRE_ORDER.map((label) => ({
    label,
    items: items.filter((item) => item.genre === label),
  })).filter((group) => group.items.length > 0);
}
