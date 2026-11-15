import { getCollection, type CollectionEntry } from 'astro:content';

export type Game = CollectionEntry<'games'>;
export type Author = CollectionEntry<'authors'>;

/** 公開する作品（draft は `npm run dev` のときだけ含める）。新しい順。 */
export async function getVisibleGames(): Promise<Game[]> {
  const games = await getCollection('games', ({ data }) => import.meta.env.DEV || !data.draft);
  return games.sort((a, b) => b.data.releasedAt.getTime() - a.data.releasedAt.getTime());
}

/** 公開作品に 1 つ以上使われているタグ（作品数の多い順）。 */
export function usedTags(games: Game[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const g of games) for (const t of g.data.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'ja'));
}

export const tagUrl = (tag: string) => `/tags/${encodeURIComponent(tag)}/`;
export const authorUrl = (id: string) => `/authors/${id}/`;
export const gameUrl = (id: string) => `/games/${id}/`;

export const formatDate = (d: Date) =>
  `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;

export const PLATFORM_LABEL: Record<string, string> = {
  web: 'ブラウザ',
  windows: 'Windows',
  mac: 'Mac',
  linux: 'Linux',
  android: 'Android',
};
