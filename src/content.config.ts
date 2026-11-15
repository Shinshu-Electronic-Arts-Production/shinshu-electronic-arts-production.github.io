import { readFileSync } from 'node:fs';
import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { parse } from 'yaml';

// 使えるタグの許可リスト（表記揺れ防止）。新しいタグは作品の PR と一緒にここへ足す。
const tagList = parse(readFileSync('src/data/tags.yaml', 'utf8'));
if (!Array.isArray(tagList) || tagList.length === 0 || !tagList.every((t) => typeof t === 'string')) {
  throw new Error('src/data/tags.yaml は文字列のリストにしてください');
}
const tag = z.enum(tagList as [string, ...string[]]);

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const games = defineCollection({
  // 1 作品 = 1 ディレクトリ（src/content/games/<slug>/index.md）
  loader: glob({
    pattern: '*/index.md',
    base: './src/content/games',
    generateId: ({ entry }) => {
      const slug = entry.split('/')[0];
      if (!SLUG.test(slug)) {
        throw new Error(`作品ディレクトリ名 "${slug}" は英小文字・数字・ハイフンのみにしてください（URL になります）`);
      }
      return slug;
    },
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      summary: z.string().min(1).max(80),
      authors: z.array(reference('authors')).min(1),
      tags: z.array(tag).default([]),
      releasedAt: z.coerce.date(),
      event: z.string().optional(),
      platforms: z.array(z.enum(['web', 'windows', 'mac', 'linux', 'android'])).min(1),
      cover: image(),
      screenshots: z.array(image()).default([]),
      links: z
        .object({
          play: z.url().optional(),
          unityroom: z.url().optional(),
          download: z.url().optional(),
          source: z.url().optional(),
        })
        .refine((l) => Object.values(l).some(Boolean), {
          message: 'links には play / unityroom / download / source のどれか 1 つ以上が必要です',
        }),
      embed: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

const authors = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/authors' }),
  schema: z.object({
    name: z.string().min(1),
    kind: z.enum(['person', 'team']).default('person'),
    github: z.string().optional(),
    x: z.string().optional(),
    members: z.array(reference('authors')).optional(),
  }),
});

export const collections = { games, authors };
