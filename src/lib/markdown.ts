import { Marked, Renderer } from 'marked';
import { createHighlighter } from 'shiki';

export interface ArticleHeading {
  id: string;
  text: string;
  depth: number;
}

const highlighter = await createHighlighter({
  themes: ['github-dark-default'],
  langs: [
    'php',
    'shellscript',
    'json',
    'sql',
    'c',
    'css',
    'less',
    'jsx',
    'diff',
    'javascript',
    'html',
  ],
});
const languages = new Set(highlighter.getLoadedLanguages());
const aliases: Record<string, string> = {
  shell: 'shellscript',
  sh: 'shellscript',
  bash: 'shellscript',
  js: 'javascript',
};
const labels: Record<string, string> = {
  shellscript: 'Shell',
  javascript: 'JavaScript',
  text: '代码',
};
const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!,
  );

function languageFor(info: string | undefined, code: string) {
  // The old site used Pygments query parameters, for example php?start_inline=1.
  const name = (info ?? '').split(/[\s?]/)[0].toLowerCase();
  if (name) return languages.has(aliases[name] ?? name) ? (aliases[name] ?? name) : 'text';
  if (/^\s*<\?php\b/.test(code)) return 'php';
  if (
    /^\s*(?:\$\s+)?(?:composer|npm|yarn|php|git|sudo|brew|curl|wget|cd|mkdir|chmod|yum|pear)\s/.test(
      code,
    )
  )
    return 'shellscript';
  return 'text';
}

export function renderMarkdown(source: string) {
  const headings: ArticleHeading[] = [];
  const ids = new Set<string>();
  const renderer = new Renderer();
  renderer.table = function (token) {
    return `<div class="table-scroll" role="region" aria-label="数据表格" data-i18n-aria="table" tabindex="0">${Renderer.prototype.table.call(this, token)}</div>`;
  };
  renderer.image = function (token) {
    return Renderer.prototype.image
      .call(this, token)
      .replace('<img ', '<img loading="lazy" decoding="async" ');
  };
  renderer.code = ({ text, lang }) => {
    const language = languageFor(lang, text);
    const label = labels[language] ?? language.toUpperCase();
    const lines = text.split('\n').length;
    const html = highlighter.codeToHtml(text, { lang: language, theme: 'github-dark-default' });
    return `<figure class="code-block" data-language="${escape(language)}"><figcaption class="code-bar"><span><span${language === 'text' ? ' data-i18n="code"' : ''}>${escape(label)}</span><span class="code-lines" data-i18n="codeLines" data-i18n-params="${escape(JSON.stringify({ count: lines }))}">${lines} 行</span></span><button class="copy-code" type="button" aria-label="复制代码" data-i18n-aria="copyCode" hidden><svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" aria-hidden="true"><rect x="5" y="5" width="8" height="9" rx="1.5"/><path d="M3 11H2V2h8v1"/></svg><span aria-live="polite" data-i18n="copy">复制</span></button></figcaption>${html}</figure>\n`;
  };
  renderer.heading = function ({ tokens, depth }) {
    const text = this.parser.parseInline(tokens, this.parser.textRenderer);
    const base =
      'section-' +
      (text
        .toLowerCase()
        .replace(/<[^>]*>/g, '')
        .replace(/[^\p{L}\p{N}\s-]/gu, '')
        .trim()
        .replace(/\s+/g, '-') || 'heading');
    let id = base;
    let suffix = 1;
    while (ids.has(id)) id = `${base}-${suffix++}`;
    ids.add(id);
    const level = Math.max(2, depth);
    if (level <= 3) headings.push({ id, text, depth: level });
    return `<h${level} id="${escape(id)}">${this.parser.parseInline(tokens)}<a class="heading-anchor" href="#${escape(id)}" aria-label="链接到：${escape(text)}" data-i18n-aria="headingLink" data-i18n-params="${escape(JSON.stringify({ name: text }))}">#</a></h${level}>\n`;
  };
  const parser = new Marked({ renderer });
  return { html: parser.parse(source, { async: false }) as string, headings };
}
