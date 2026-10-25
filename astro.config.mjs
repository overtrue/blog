import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://overtrue.me',
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  redirects: {
    '/use-tailwindcss-in-and-design-pro': '/use-tailwindcss-in-ant-design-pro/',
    '/archives': '/writing/',
    '/tags': '/writing/',
    '/about': '/#about',
    '/open-source': '/#work',
    '/page/2': '/writing/',
    '/page/3': '/writing/',
  },
});
