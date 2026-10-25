import { getPosts } from '../lib/posts';
export function GET() {
  const urls = ['/', '/writing/', ...getPosts().map((post) => `/${post.slug}/`)];
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>https://overtrue.me${url}</loc></url>`).join('')}</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
}
