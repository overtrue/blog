import test from 'node:test';
import assert from 'node:assert/strict';
import { renderMarkdown } from '../src/lib/markdown.ts';

function codeText(html) {
  return html
    .match(/<code>([\s\S]*?)<\/code>/)[1]
    .replace(/<[^>]*>/g, '')
    .replace(/&(#x[\da-f]+|#\d+|lt|gt|quot|amp);/gi, (_, entity) => {
      if (entity.startsWith('#x')) return String.fromCodePoint(parseInt(entity.slice(2), 16));
      if (entity.startsWith('#')) return String.fromCodePoint(Number(entity.slice(1)));
      return { lt: '<', gt: '>', quot: '"', amp: '&' }[entity];
    });
}

test('legacy PHP flags highlight snippets without altering their code', () => {
  const code = 'trait Sellable\n{\n    protected $price = 0;\n}\n';
  const { html } = renderMarkdown('```php?start_inline=1\n' + code + '```');
  assert.match(html, /data-language="php"/);
  assert.ok(new Set([...html.matchAll(/color:(#[A-Fa-f0-9]+)/g)].map((m) => m[1])).size >= 3);
  assert.equal(codeText(html), code.trimEnd());
  assert.ok(!html.includes('start_inline'));
});

test('shell aliases share the same highlighter', () => {
  for (const language of ['shell', 'sh', 'bash']) {
    const { html } = renderMarkdown(
      '```' + language + '\ngit clone https://example.com/repo.git\n```',
    );
    assert.match(html, /data-language="shellscript"/);
    assert.equal(codeText(html), 'git clone https://example.com/repo.git');
  }
});

test('unknown languages remain readable and code is escaped', () => {
  const code = '<script>alert("a & b")</script>';
  const { html } = renderMarkdown('```unknown-language\n' + code + '\n```');
  assert.match(html, /data-language="text"/);
  assert.ok(!html.includes('<script>'));
  assert.equal(codeText(html), code);
});

test('article heading links are unique and do not replace the page title', () => {
  const { html, headings } = renderMarkdown(
    '# top\n\n## 重复标题\n\n## 重复标题\n\n### 使用 `dev-` 前缀',
  );
  assert.ok(!html.includes('<h1'));
  assert.equal(headings.length, 4);
  assert.equal(new Set(headings.map((heading) => heading.id)).size, 4);
  assert.equal(headings[0].id, 'section-top');
  assert.equal(headings[3].text, '使用 dev- 前缀');
  for (const heading of headings) assert.ok(html.includes(`id="${heading.id}"`));
});

test('tables and linked images retain their inline content', () => {
  const { html } = renderMarkdown(
    '| 字段 | 描述 |\n| --- | --- |\n| `id` | **编号** |\n\n[![示意图](https://example.com/image.png)](https://example.com/)',
  );
  assert.match(html, /class="table-scroll"/);
  assert.match(html, /<code>id<\/code>/);
  assert.match(html, /<strong>编号<\/strong>/);
  assert.match(
    html,
    /<img loading="lazy" decoding="async" src="https:\/\/example.com\/image.png" alt="示意图"/,
  );
});
