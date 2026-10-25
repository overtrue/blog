import { currentLanguage, translate } from '../lib/i18n';

export function enhanceReading() {
  const prose = document.querySelector<HTMLElement>('.prose');
  if (!prose) return;
  const controller = new AbortController();
  const { signal } = controller;
  const timers = new Set<ReturnType<typeof setTimeout>>();
  document.querySelectorAll<HTMLButtonElement>('.copy-code').forEach((button) => {
    button.hidden = false;
    button.addEventListener(
      'click',
      async () => {
        const code = button.closest('.code-block')?.querySelector('code')?.textContent;
        if (code === undefined || code === null) return;
        const label = button.querySelector('span')!;
        try {
          await navigator.clipboard.writeText(code);
          label.dataset.i18n = 'copied';
        } catch {
          label.dataset.i18n = 'copyFailed';
        }
        label.textContent = translate(
          label.dataset.i18n as 'copied' | 'copyFailed',
          currentLanguage(),
        );
        button.disabled = true;
        const timer = setTimeout(() => {
          label.dataset.i18n = 'copy';
          label.textContent = translate('copy', currentLanguage());
          button.disabled = false;
          timers.delete(timer);
        }, 1800);
        timers.add(timer);
      },
      { signal },
    );
  });

  const toc = document.querySelector<HTMLDetailsElement>('.article-toc');
  const wide = matchMedia('(min-width: 1100px)');
  const arrangeToc = () => {
    if (toc) toc.open = wide.matches;
  };
  wide.addEventListener('change', arrangeToc, { signal });
  arrangeToc();
  const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-toc-link]')];
  const headings = links.map((link) =>
    document.getElementById(decodeURIComponent(link.hash.slice(1))),
  );
  const progress = document.querySelector<HTMLElement>('[data-reading-progress]');
  let frame = 0;
  const update = () => {
    frame = 0;
    const bounds = prose.getBoundingClientRect();
    const distance = Math.max(1, bounds.height - innerHeight + 140);
    const amount = Math.max(0, Math.min(1, (140 - bounds.top) / distance));
    if (progress) progress.style.transform = `scaleX(${amount})`;
    let active = -1;
    headings.forEach((heading, index) => {
      if (heading && heading.getBoundingClientRect().top <= 160) active = index;
    });
    links.forEach((link, index) => {
      if (index === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  addEventListener('scroll', schedule, { passive: true, signal });
  addEventListener('resize', schedule, { signal });
  addEventListener(
    'pagehide',
    (event) => {
      if (event.persisted) return;
      controller.abort();
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
    },
    { signal },
  );
  update();
}
