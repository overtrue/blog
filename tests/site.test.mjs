import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const dist = new URL('dist/', root);
const read = (path) => readFileSync(new URL(path, dist), 'utf8');
const sourcePosts = readdirSync(new URL('legacy/_app/_posts/', root)).filter((name) =>
  name.endsWith('.md'),
);
const canonicalSlug = (file) =>
  file
    .slice(11, -3)
    .replace('use-tailwindcss-in-and-design-pro', 'use-tailwindcss-in-ant-design-pro');

test('every original article remains available at its public URL', () => {
  assert.ok(sourcePosts.length >= 29);
  for (const file of sourcePosts) {
    const slug = canonicalSlug(file);
    const html = read(`${slug}/index.html`);
    assert.match(html, /class="prose"/);
    assert.ok(html.includes(file.slice(0, 4)));
    assert.ok(html.includes(`https://overtrue.me/${slug}/`));
    assert.ok(!html.includes('gist.github.com/overtrue/0bf1cd704bf804de2e2c.js'));
    assert.ok(!html.includes('{{ site.url }}'));
  }
});

test('old Jekyll URLs redirect to the corresponding article', () => {
  for (const file of sourcePosts) {
    const path = `articles/${file.slice(0, 4)}/${file.slice(5, 7)}/${file.slice(11, -3)}.html`;
    assert.ok(statSync(new URL(path, dist)).isFile());
    assert.ok(read(path).includes(`/${canonicalSlug(file)}/`));
  }
});

test('local page links and assets resolve in the production output', () => {
  const files = [];
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.name.endsWith('.html')) files.push(path);
    }
  };
  walk(fileURLToPath(dist));
  for (const file of files) {
    const html = readFileSync(file, 'utf8');
    // Article bodies deliberately retain historic external URLs. All root-relative paths must work.
    for (const [, path] of html.matchAll(/(?:href|src)="(\/(?!\/)[^"?#]*)(?:[?#][^"]*)?"/g)) {
      const target = new URL(path.slice(1), dist);
      assert.ok(
        existsSync(target) ||
          existsSync(new URL(`${path.slice(1).replace(/\/$/, '')}/index.html`, dist)),
        `${file}: ${path}`,
      );
    }
  }
});

test('feeds and sitemap retain all archived articles', () => {
  const rss = read('rss.xml');
  const atom = read('atom.xml');
  const sitemap = read('sitemap.xml');
  assert.equal((rss.match(/<item>/g) || []).length, sourcePosts.length);
  assert.equal((atom.match(/<entry>/g) || []).length, sourcePosts.length);
  for (const file of sourcePosts) {
    const url = `https://overtrue.me/${canonicalSlug(file)}/`;
    assert.ok(rss.includes(url));
    assert.ok(atom.includes(url));
    assert.ok(sitemap.includes(url));
  }
});

test('primary navigation and progressive enhancement are present without JavaScript', () => {
  const html = read('index.html');
  for (const id of ['main', 'work', 'writing', 'about']) assert.ok(html.includes(`id="${id}"`));
  for (const text of ['EasyWeChat', 'RustFS', 'Easy SMS', 'Pinyin', 'orbit-fallback'])
    assert.ok(html.includes(text));
  assert.ok(read('writing/index.html').includes(`共 ${sourcePosts.length} 篇`));
  assert.ok(existsSync(new URL('404.html', dist)) || existsSync(new URL('404/index.html', dist)));
});

test('browser sources and output contain no embedded OAuth client secret', () => {
  const embeddedSecret = /\bclient[_-]?secret\s*["']?\s*[:=]\s*["'](?!\s*["'])[^"'\r\n]+["']/i;
  const inspect = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) inspect(path);
      else {
        assert.ok(
          !embeddedSecret.test(readFileSync(path, 'utf8')),
          `${path}: embedded OAuth client secret`,
        );
      }
    }
  };
  for (const directory of ['legacy/', 'src/', 'public/', 'dist/']) {
    inspect(fileURLToPath(new URL(directory, root)));
  }
});
