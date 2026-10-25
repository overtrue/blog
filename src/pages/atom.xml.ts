import { getPosts, escapeXml } from '../lib/posts';
export function GET() {
  const posts = getPosts();
  const updated = `${posts[0].date}T00:00:00+08:00`;
  const entries = posts
    .map(
      (post) =>
        `<entry><title>${escapeXml(post.title)}</title><link href="https://overtrue.me/${post.slug}/"/><id>https://overtrue.me/${post.slug}/</id><updated>${post.date}T00:00:00+08:00</updated><summary>${escapeXml(post.excerpt || post.title)}</summary></entry>`,
    )
    .join('');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>overtrue</title><id>https://overtrue.me/</id><link href="https://overtrue.me/"/><link href="https://overtrue.me/atom.xml" rel="self"/><updated>${updated}</updated><author><name>overtrue</name></author>${entries}</feed>`,
    { headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' } },
  );
}
