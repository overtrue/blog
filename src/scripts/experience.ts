import { createLetterJourney } from './letter-journey';

export function createExperience() {
  const root = document.querySelector<HTMLElement>('[data-experience]');
  if (!root) return;
  const chapters = [...root.querySelectorAll<HTMLElement>('[data-chapter]')];
  const links = [...root.querySelectorAll<HTMLAnchorElement>('[data-scene-link]')];
  let offsets = chapters.map((chapter) => chapter.offsetTop);
  let frame = 0;
  let currentScene = '';
  const letterJourney = createLetterJourney(root);

  const update = () => {
    frame = 0;
    const y = window.scrollY;
    let index = 0;
    while (index < offsets.length - 1 && y >= offsets[index + 1]) index++;
    const distance = offsets[index + 1]
      ? offsets[index + 1] - offsets[index]
      : chapters[index].offsetHeight;
    const progress = Math.min(
      chapters.length - 1,
      index + Math.max(0, (y - offsets[index]) / distance),
    );
    const active = chapters[Math.round(progress)].id;
    root.dataset.progress = String(progress);
    root.style.setProperty('--scene-progress', String(progress));
    if (active !== currentScene) {
      currentScene = active;
      root.dataset.scene = active;
      links.forEach((link) => {
        if (link.dataset.sceneLink === active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
    document.dispatchEvent(new CustomEvent('experienceprogress', { detail: progress }));
    letterJourney?.update(y);
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  const resize = new ResizeObserver(() => {
    offsets = chapters.map((chapter) => chapter.offsetTop);
    letterJourney?.resize();
    schedule();
  });
  chapters.forEach((chapter) => resize.observe(chapter));
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('pageshow', schedule);
  window.addEventListener('pagehide', (event) => {
    if (event.persisted) return;
    cancelAnimationFrame(frame);
    resize.disconnect();
    letterJourney?.dispose();
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('pageshow', schedule);
  });
  update();
}
