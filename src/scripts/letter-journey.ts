type GlyphPosition = { x: number; y: number; size: number; width: number };

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const ease = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};
const mix = (from: number, to: number, amount: number) => from + (to - from) * amount;

/** The visible letters travel between two static, accessible layout anchors. */
export function createLetterJourney(root: HTMLElement) {
  const starts = [...root.querySelectorAll<HTMLElement>('[data-letter-start]')];
  const ends = [...root.querySelectorAll<HTMLElement>('[data-letter-end]')];
  if (starts.length !== 9 || ends.length !== 8) return;

  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const letters = starts.map((source, index) => {
    const element = document.createElement('span');
    element.className = `journey-letter${index === 8 ? ' name-dot' : ''}`;
    element.setAttribute('aria-hidden', 'true');
    element.style.zIndex = index < 4 ? '1' : '4';
    const lower = document.createElement('span');
    const upper = document.createElement('span');
    lower.textContent = source.textContent;
    upper.textContent = source.textContent?.toUpperCase() ?? '';
    element.append(lower, upper);
    root.append(element);
    return { element, lower, upper };
  });
  const scaffold = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  scaffold.classList.add('journey-scaffold');
  scaffold.setAttribute('aria-hidden', 'true');
  const edges = Array.from({ length: 8 }, (_, corner) =>
    [1, 2, 4]
      .filter((axis) => !(corner & axis))
      .map((axis) => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        scaffold.append(line);
        return { from: corner, to: corner | axis, line };
      }),
  ).flat();
  root.append(scaffold);
  let from: GlyphPosition[] = [];
  let to: GlyphPosition[] = [];
  let width = innerWidth;
  let height = innerHeight;
  let lastScroll = 0;
  let disposed = false;

  const measure = (element: HTMLElement): GlyphPosition => {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left,
      y: rect.top + scrollY,
      size: parseFloat(getComputedStyle(element).fontSize),
      width: rect.width,
    };
  };

  const update = (y: number) => {
    if (disposed || preference.matches || !from.length) return;
    const compact = width <= 760;
    const collapse = clamp(y / (height * 0.76));
    const unfold = clamp((y - (lastScroll - height * 0.72)) / (height * 0.72));
    const turn = y / height;
    const angle = 0.55 + turn * 0.85;
    const radius = compact ? 15 : 24;
    const centerX = width - (compact ? 44 : 75);
    const centerY = (compact ? 108 : 152) + Math.sin(turn * 1.8) * (compact ? 6 : 18);
    const corners: { x: number; y: number }[] = [];

    letters.forEach(({ element, lower, upper }, index) => {
      const start = from[index];
      const end = to[Math.min(index, 7)];
      const gather = ease(collapse * 1.3 - index * 0.035);
      const spread = ease(unfold * 1.3 - (7 - Math.min(index, 7)) * 0.035);
      // Eight corners turn together into a small typographic sculpture.
      const vx = index & 1 ? 1 : -1;
      const vy = index & 2 ? 1 : -1;
      const vz = index & 4 ? 1 : -1;
      const rx = vx * Math.cos(angle) + vz * Math.sin(angle);
      const rz = -vx * Math.sin(angle) + vz * Math.cos(angle);
      const ry = vy * Math.cos(0.55) - rz * Math.sin(0.55);
      const depth = vy * Math.sin(0.55) + rz * Math.cos(0.55);
      const perspective = 1 / (1 + depth * 0.12);
      const smallSize = (compact ? 12 : 18) * perspective;
      const glyphWidth = (end.width / end.size) * smallSize;
      const smallX = centerX + rx * radius * perspective - glyphWidth / 2;
      const smallY = centerY + ry * radius * perspective - smallSize * 0.4;
      corners.push({
        x: centerX + rx * radius * perspective,
        y: centerY + ry * radius * perspective,
      });
      const x = mix(mix(start.x, smallX, gather), end.x, spread);
      const yPosition = mix(mix(start.y, smallY, gather), end.y - y, spread);
      const size = mix(mix(start.size, smallSize, gather), end.size, spread);
      const rotation = Math.sin(angle + index) * 12 * gather * (1 - spread);
      const casing = ease((collapse - 0.2) / 0.55);
      let opacity = mix(mix(1, 0.72 + depth * 0.1, gather), 0.07, spread);
      if (index === 8) opacity *= 1 - ease(collapse * 1.8);

      element.style.transform = `translate3d(${x}px, ${yPosition}px, 0) rotate(${rotation}deg) scale(${size / 100})`;
      element.style.opacity = String(opacity);
      element.style.fontWeight = String(650 + spread * 100);
      element.style.lineHeight = String(0.77 + spread * 0.13);
      lower.style.opacity = String(1 - casing);
      upper.style.opacity = String(casing);
    });
    scaffold.style.opacity = String(
      ease((collapse - 0.55) / 0.35) * (1 - ease(unfold / 0.4)) * 0.25,
    );
    edges.forEach(({ from: a, to: b, line }) => {
      const start = corners[a];
      const end = corners[b];
      const length = Math.hypot(end.x - start.x, end.y - start.y);
      const inset = Math.min(0.45, (compact ? 7 : 10) / length);
      line.setAttribute('x1', String(mix(start.x, end.x, inset)));
      line.setAttribute('y1', String(mix(start.y, end.y, inset)));
      line.setAttribute('x2', String(mix(end.x, start.x, inset)));
      line.setAttribute('y2', String(mix(end.y, start.y, inset)));
    });
  };

  const resize = () => {
    if (disposed) return;
    const enabled = !preference.matches;
    root.classList.toggle('has-letter-journey', enabled);
    letters.forEach(({ element }) => (element.hidden = !enabled));
    scaffold.style.display = enabled ? '' : 'none';
    if (!enabled) return;
    width = innerWidth;
    height = innerHeight;
    lastScroll = document.documentElement.scrollHeight - height;
    from = starts.map(measure);
    to = ends.map(measure);
    update(scrollY);
  };

  preference.addEventListener('change', resize);
  window.addEventListener('resize', resize);
  document.fonts.ready.then(resize);
  resize();
  return {
    update,
    resize,
    dispose() {
      disposed = true;
      preference.removeEventListener('change', resize);
      window.removeEventListener('resize', resize);
      letters.forEach(({ element }) => element.remove());
      scaffold.remove();
      root.classList.remove('has-letter-journey');
    },
  };
}
