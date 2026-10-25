import type { APIContext } from 'astro';
import { getPosts, escapeXml } from '../lib/posts';

export function getStaticPaths() {
  return getPosts().flatMap((post) => {
    const oldFilename = post.legacyPath.split('/').pop()!;
    const paths = [
      `articles/${post.legacyPath}`,
      `${post.date.replaceAll('-', '/')}/${oldFilename}`,
    ];
    if (post.slug === 'using-eloquent-outsite-laravel-2') {
      paths.push('2014/11/25/using-eloquent-outside-laravel-2.html');
    }
    return paths.map((legacy) => ({
      params: { legacy },
      props: { slug: post.slug, title: post.title },
    }));
  });
}

export function GET({ props }: APIContext) {
  const url = `https://overtrue.me/${props.slug}/`;
  return new Response(
    `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="refresh" content="0;url=/${props.slug}/"><link rel="canonical" href="${url}"><title>${escapeXml(props.title)} · overtrue</title></head><body><p>文章已搬到新地址。<a href="/${props.slug}/">继续阅读：${escapeXml(props.title)}</a></p></body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );
}
