import matter from 'gray-matter';
import { renderMarkdown, type ArticleHeading } from './markdown';

export interface Post {
  slug: string;
  date: string;
  year: string;
  title: string;
  excerpt: string;
  category: string;
  minutes: number;
  html: string;
  headings: ArticleHeading[];
  legacyPath: string;
}

const sources = import.meta.glob<string>('../../legacy/_app/_posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

let cachedPosts: Post[];

export function getPosts(): Post[] {
  if (cachedPosts) return cachedPosts;
  cachedPosts = Object.entries(sources)
    .map(([path, source]) => {
      const name = path.split('/').pop()!;
      const { data, content } = matter(source);
      const date = name.slice(0, 10);
      const originalSlug = name.slice(11, -3);
      const slug = originalSlug.replace(
        'use-tailwindcss-in-and-design-pro',
        'use-tailwindcss-in-ant-design-pro',
      );
      const normalized = content
        .replace(/\{\{\s*site\.url\s*\}\}/g, '')
        .replace(
          /<script\s+src="(https:\/\/gist\.github\.com\/[^\"]+)\.js"[^>]*><\/script>/g,
          '<p><a href="$1">在 GitHub Gist 查看原始代码</a></p>',
        );
      const title = String(
        data.title || (slug === 'config-zsh-on-osx' ? 'Mac 下配置 zsh 与 oh-my-zsh' : slug),
      ).replace('And Design', 'Ant Design');
      const category = /laravel|eloquent|passport/i.test(name)
        ? 'Laravel'
        : /php|composer|pinyin|exception/i.test(name)
          ? 'PHP'
          : /mysql|mongodb/.test(name)
            ? '数据库'
            : '开发手记';
      return {
        slug,
        date,
        year: date.slice(0, 4),
        title,
        category,
        excerpt: String(data.excerpt || ''),
        minutes: Math.max(1, Math.ceil(content.length / 900)),
        ...renderMarkdown(normalized),
        legacyPath: `${date.slice(0, 4)}/${date.slice(5, 7)}/${originalSlug}.html`,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
  return cachedPosts;
}

export function escapeXml(value: string): string {
  return value.replace(
    /[<>&"']/g,
    (character) =>
      ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[character]!,
  );
}
