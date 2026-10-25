import { getPosts, escapeXml } from '../lib/posts';

export function GET() {
  const posts = getPosts();
  const items = posts
    .map(
      (post) =>
        `<item><title>${escapeXml(post.title)}</title><link>https://overtrue.me/${post.slug}/</link><guid isPermaLink="true">https://overtrue.me/${post.slug}/</guid><pubDate>${new Date(`${post.date}T00:00:00+08:00`).toUTCString()}</pubDate><description>${escapeXml(post.excerpt || post.title)}</description></item>`,
    )
    .join('');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>overtrue 的文字</title><link>https://overtrue.me</link><description>Keep calm and coding.</description><language>zh-CN</language><atom:link href="https://overtrue.me/rss.xml" rel="self" type="application/rss+xml"/>${items}</channel></rss>`,
    { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } },
  );
}
