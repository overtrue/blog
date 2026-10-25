import { currentLanguage, translate, type Language, type MessageKey } from '../lib/i18n';

export function initializePreferences() {
  const root = document.documentElement;
  const controls = document.querySelector<HTMLElement>('[data-preferences]');
  const themeToggle = controls?.querySelector<HTMLButtonElement>('.theme-toggle');
  const themeOptions = controls?.querySelector<HTMLElement>('.theme-options');
  const languageToggle = controls?.querySelector<HTMLButtonElement>('.language-toggle');
  const system = matchMedia('(prefers-color-scheme: dark)');
  const controller = new AbortController();
  const { signal } = controller;

  const save = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* Preferences still work for this page. */
    }
  };
  const closeTheme = () => {
    if (themeOptions) themeOptions.hidden = true;
    themeToggle?.setAttribute('aria-expanded', 'false');
  };
  const applyTheme = (choice: string) => {
    const preference = ['light', 'dark'].includes(choice) ? choice : 'system';
    root.dataset.themePreference = preference;
    root.dataset.theme = preference === 'system' ? (system.matches ? 'dark' : 'light') : preference;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', root.dataset.theme === 'dark' ? '#0c111b' : '#f0f1f4');
    controls?.querySelectorAll<HTMLElement>('[data-theme-choice]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.themeChoice === preference));
    });
    controls?.querySelectorAll<SVGElement>('[data-theme-icon]').forEach((icon) => {
      icon.setAttribute('display', icon.dataset.themeIcon === preference ? 'inline' : 'none');
    });
    document.dispatchEvent(new Event('themechange'));
  };
  const applyLanguage = (language: Language) => {
    root.lang = language === 'en' ? 'en' : 'zh-CN';
    document
      .querySelectorAll<HTMLElement>(
        '[data-i18n], [data-i18n-aria], [data-i18n-placeholder], [data-i18n-alt]',
      )
      .forEach((element) => {
        element.lang = root.lang;
        const params = JSON.parse(element.dataset.i18nParams || '{}') as Record<
          string,
          string | number
        >;
        if (element.dataset.i18n)
          element.textContent = translate(element.dataset.i18n as MessageKey, language, params);
        for (const [data, attribute] of [
          ['i18nAria', 'aria-label'],
          ['i18nPlaceholder', 'placeholder'],
          ['i18nAlt', 'alt'],
        ]) {
          if (element.dataset[data])
            element.setAttribute(
              attribute,
              translate(element.dataset[data] as MessageKey, language, params),
            );
        }
      });
    if (languageToggle) {
      languageToggle.textContent = language === 'en' ? '中' : 'EN';
      languageToggle.lang = language === 'en' ? 'zh-CN' : 'en';
      languageToggle.setAttribute(
        'aria-label',
        language === 'en' ? '切换到中文' : 'Switch to English',
      );
    }
    document.dispatchEvent(new Event('languagechange'));
  };

  themeToggle?.addEventListener(
    'click',
    () => {
      if (!themeOptions) return;
      themeOptions.hidden = !themeOptions.hidden;
      themeToggle.setAttribute('aria-expanded', String(!themeOptions.hidden));
    },
    { signal },
  );
  controls?.querySelectorAll<HTMLButtonElement>('[data-theme-choice]').forEach((button) => {
    button.addEventListener(
      'click',
      () => {
        const choice = button.dataset.themeChoice!;
        applyTheme(choice);
        save('overtrue-theme', choice);
        closeTheme();
        themeToggle?.focus();
      },
      { signal },
    );
  });
  document.addEventListener(
    'click',
    (event) => {
      if (!(event.target instanceof Node) || !controls?.contains(event.target)) closeTheme();
    },
    { signal },
  );
  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape' && themeOptions && !themeOptions.hidden) {
        closeTheme();
        themeToggle?.focus();
      }
    },
    { signal },
  );
  languageToggle?.addEventListener(
    'click',
    () => {
      const language = currentLanguage() === 'en' ? 'zh' : 'en';
      applyLanguage(language);
      save('overtrue-language', language);
    },
    { signal },
  );
  system.addEventListener(
    'change',
    () => {
      if (root.dataset.themePreference === 'system') applyTheme('system');
    },
    { signal },
  );
  addEventListener(
    'pageshow',
    () => {
      try {
        applyTheme(localStorage.getItem('overtrue-theme') || 'system');
        applyLanguage(localStorage.getItem('overtrue-language') === 'en' ? 'en' : 'zh');
      } catch {
        /* Keep the current in-page choice when storage is unavailable. */
      }
    },
    { signal },
  );
  addEventListener(
    'pagehide',
    (event) => {
      if (!event.persisted) controller.abort();
    },
    { signal },
  );
  applyTheme(root.dataset.themePreference || 'system');
  applyLanguage(currentLanguage());
  if (controls) controls.hidden = false;
}
