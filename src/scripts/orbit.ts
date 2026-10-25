import * as THREE from 'three';
import { currentLanguage, translate } from '../lib/i18n';

/** One ordered point field, with four corresponding positions per particle. */
function fieldGeometry(columns: number, rows: number) {
  const positions = Array.from({ length: 4 }, () => [] as number[]);
  const coordinates: number[] = [];
  for (let row = 0; row < rows; row++) {
    const t = (row / (rows - 1)) * 2 - 1;
    for (let column = 0; column < columns; column++) {
      const s = (column / (columns - 1)) * 2 - 1;
      const a = s * 1.2;
      const b = t * 1.2;
      positions[0].push(
        0.85 * (a - (a * a * a) / 3 + a * b * b),
        0.85 * (b - (b * b * b) / 3 + b * a * a),
        0.8 * (a * a - b * b),
      );
      positions[1].push(s * 2.1, t * 1.3 * Math.cos(s * 2.2), t * 1.3 * Math.sin(s * 2.2));
      positions[2].push(s * 2.5, t * 1.15, 0.5 * Math.sin(s * 2.5 + t));
      positions[3].push(s * 1.8, t * 1.25, 0.8 * Math.sin(s * 1.7 + t * 1.4));
      coordinates.push(s, t);
    }
  }
  const geometry = new THREE.BufferGeometry();
  positions.forEach((values, i) =>
    geometry.setAttribute(
      i === 0 ? 'position' : `form${i}`,
      new THREE.Float32BufferAttribute(values, 3),
    ),
  );
  geometry.setAttribute('fieldUV', new THREE.Float32BufferAttribute(coordinates, 2));

  // A few continuous strands make the folds legible even between the particles.
  const strands = new THREE.BufferGeometry();
  const lineIndices: number[] = [];
  for (let row = 0; row < rows; row += 7) {
    for (let column = 0; column < columns - 1; column++)
      lineIndices.push(row * columns + column, row * columns + column + 1);
  }
  for (const [name, attribute] of Object.entries(geometry.attributes)) {
    const values: number[] = [];
    for (const index of lineIndices) {
      for (let item = 0; item < attribute.itemSize; item++)
        values.push(attribute.array[index * attribute.itemSize + item]);
    }
    strands.setAttribute(name, new THREE.Float32BufferAttribute(values, attribute.itemSize));
  }
  return { geometry, strands };
}

const fieldVertex = `
  attribute vec3 form1;
  attribute vec3 form2;
  attribute vec3 form3;
  attribute vec2 fieldUV;
  uniform float uProgress;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec2 uPointer;
  uniform vec2 uResolution;
  uniform float uHover;
  varying float vLight;
  varying float vDepth;
  varying float vScatter;
  void main() {
    float segment = floor(uProgress);
    float phase = smoothstep(0.0, 1.0, fract(uProgress));
    vec3 point;
    if (segment < 1.0) point = mix(position, form1, phase);
    else if (segment < 2.0) point = mix(form1, form2, phase);
    else point = mix(form2, form3, smoothstep(0.0, 1.0, uProgress - 2.0));
    point.z += sin(fieldUV.x * 3.0 + fieldUV.y * 2.0 + uTime * 0.25) * 0.035;
    vec4 viewPosition = modelViewMatrix * vec4(point, 1.0);
    vec4 projected = projectionMatrix * viewPosition;
    vec2 distanceInPixels = (projected.xy / projected.w - uPointer) * uResolution * 0.5;
    float radius = min(140.0, uResolution.x * 0.18);
    vScatter = pow(1.0 - smoothstep(0.0, radius, length(distanceInPixels)), 1.4) * uHover;
    float seed = fract(sin(dot(fieldUV, vec2(127.1, 311.7))) * 43758.5453);
    vec2 scatter = vec2(cos(seed * 6.283185), sin(seed * 6.283185));
    vec2 outward = normalize(distanceInPixels + scatter * 0.1);
    vec2 displacement = (outward * (34.0 + seed * 28.0) + scatter * 22.0) * vScatter;
    viewPosition.xy += displacement * 2.0 / uResolution * -viewPosition.z / vec2(projectionMatrix[0][0], projectionMatrix[1][1]);
    gl_Position = projectionMatrix * viewPosition;
    vLight = 0.5 + 0.5 * sin(fieldUV.x * 2.5 - fieldUV.y * 1.5 - uTime * 0.3);
    vDepth = smoothstep(-10.0, -5.0, viewPosition.z);
    gl_PointSize = (1.55 + vLight * 0.75 + vDepth * 0.3 + vScatter * 0.65) * uPixelRatio;
  }
`;
const fieldFragment = `
  uniform float uDark;
  varying float vLight;
  varying float vDepth;
  varying float vScatter;
  void main() {
    float distanceFromCenter = length(gl_PointCoord - vec2(0.5)) * 2.0;
    if (distanceFromCenter > 1.0) discard;
    float alpha = (1.0 - smoothstep(0.5, 1.0, distanceFromCenter)) * (0.62 + vDepth * 0.32);
    vec3 ink = mix(vec3(0.05, 0.20, 0.94), vec3(0.20, 0.38, 1.0), vLight);
    vec3 light = mix(vec3(0.30, 0.48, 1.0), vec3(0.75, 0.86, 1.0), vLight);
    vec3 color = mix(ink, light, uDark);
    color = mix(color, mix(vec3(0.0, 0.47, 1.0), vec3(0.9, 0.96, 1.0), uDark), vScatter * 0.75);
    gl_FragColor = vec4(color, alpha);
  }
`;

const desktopPoses = [
  { x: 0.9, y: 0.2, scale: 0.9, rx: 0.32, ry: -0.5, rz: -0.2 },
  { x: 2.0, y: 0.95, scale: 0.8, rx: 0.25, ry: -0.8, rz: 0.6 },
  { x: -2.1, y: -0.65, scale: 0.6, rx: 0.6, ry: -0.4, rz: -0.3 },
  { x: 2.5, y: 0.1, scale: 0.65, rx: -0.4, ry: 0.6, rz: -0.4 },
];
const mobilePoses = [
  { x: 0.3, y: 0.5, scale: 0.64, rx: 0.32, ry: -0.5, rz: -0.2 },
  { x: 0.35, y: 0.5, scale: 0.59, rx: 0.25, ry: -0.8, rz: 0.6 },
  { x: -0.4, y: 0.1, scale: 0.52, rx: 0.8, ry: -0.4, rz: -0.3 },
  { x: 0.45, y: 0.45, scale: 0.54, rx: -0.4, ry: 0.6, rz: -0.4 },
];

export function createOrbit(host: HTMLElement) {
  const canvas = host.querySelector<HTMLCanvasElement>('canvas')!;
  const toggle = host.querySelector<HTMLButtonElement>('.motion-toggle')!;
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const smallScreen = window.matchMedia('(max-width: 760px)');
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'low-power',
    });
  } catch {
    host.dataset.fallback = 'true';
    return;
  }
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 50);
  const { geometry, strands } = fieldGeometry(
    smallScreen.matches ? 130 : 180,
    smallScreen.matches ? 90 : 120,
  );
  const uniforms = {
    uProgress: { value: 0 },
    uTime: { value: 0 },
    uDark: { value: 0 },
    uPixelRatio: { value: 1 },
    uPointer: { value: new THREE.Vector2() },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uHover: { value: 0 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: fieldVertex,
    fragmentShader: fieldFragment,
    transparent: true,
    depthWrite: false,
  });
  const lineMaterial = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: fieldVertex,
    fragmentShader: `uniform float uDark; varying float vLight; varying float vScatter; void main() { gl_FragColor = vec4(mix(vec3(0.12, 0.28, 0.94), vec3(0.55, 0.72, 1.0), uDark), (0.13 + vLight * 0.12) * (1.0 - vScatter * 0.95)); }`,
    transparent: true,
    depthWrite: false,
  });
  const particles = new THREE.Points(geometry, material);
  const lines = new THREE.LineSegments(strands, lineMaterial);
  particles.frustumCulled = false;
  lines.frustumCulled = false;
  const sculpture = new THREE.Group();
  sculpture.add(particles, lines);
  scene.add(sculpture);

  let paused = preference.matches;
  let disposed = false;
  let frame = 0;
  let lastFrame = 0;
  let elapsed = 0;
  let progress = Number(
    document.querySelector<HTMLElement>('[data-experience]')?.dataset.progress ?? 0,
  );
  let targetProgress = progress;
  let project = 0;
  let targetProject = 0;
  let pointerX = 0;
  let pointerY = 0;
  let targetPointerX = 0;
  let targetPointerY = 0;
  let hover = 0;
  let targetHover = 0;
  let dragX = 0;
  let dragY = 0;
  let dragging = false;
  let previousX = 0;
  let previousY = 0;
  const listeners = new AbortController();
  const { signal } = listeners;

  const paint = () => {
    if (disposed) return;
    const index = Math.min(3, Math.floor(progress));
    const blend = progress - index;
    const ease = blend * blend * (3 - 2 * blend);
    const compact = host.clientWidth / host.clientHeight < 1.1;
    const poses = compact ? mobilePoses : desktopPoses;
    const from = poses[index];
    const to = poses[Math.min(index + 1, 3)];
    const mix = (a: number, b: number) => THREE.MathUtils.lerp(a, b, ease);
    const work = Math.max(0, 1 - Math.abs(progress - 1));
    uniforms.uProgress.value = progress;
    uniforms.uTime.value = elapsed;
    uniforms.uDark.value = document.documentElement.dataset.theme === 'dark' ? 1 : work;
    uniforms.uPointer.value.set(pointerX, -pointerY);
    uniforms.uHover.value = preference.matches ? 0 : hover;
    sculpture.position.set(
      mix(from.x, to.x),
      mix(from.y, to.y) + Math.sin(elapsed * 0.5) * 0.035,
      0,
    );
    sculpture.scale.setScalar(
      mix(from.scale, to.scale) * (compact && !smallScreen.matches ? 1.45 : 1),
    );
    const parallax = smallScreen.matches || preference.matches ? 0 : 1;
    sculpture.rotation.set(
      mix(from.rx, to.rx) + dragY + pointerY * 0.1 * parallax,
      mix(from.ry, to.ry) +
        dragX +
        pointerX * 0.15 * parallax +
        Math.sin(elapsed * 0.15) * 0.1 +
        project * 0.4 * work,
      mix(from.rz, to.rz) + Math.sin(elapsed * 0.12) * 0.04 + project * 0.15 * work,
    );
    renderer.render(scene, camera);
  };
  const tick = (now: number) => {
    frame = 0;
    if (disposed || paused || document.hidden) return;
    const delta = Math.min((now - lastFrame) / 1000 || 0, 0.05);
    lastFrame = now;
    elapsed += delta;
    const damping = 1 - Math.exp(-delta * 9);
    progress += (targetProgress - progress) * damping;
    project += (targetProject - project) * damping;
    pointerX += (targetPointerX - pointerX) * damping;
    pointerY += (targetPointerY - pointerY) * damping;
    hover += (targetHover - hover) * damping;
    paint();
    frame = requestAnimationFrame(tick);
  };
  const resume = () => {
    if (!frame && !paused && !document.hidden && !disposed) {
      lastFrame = performance.now();
      frame = requestAnimationFrame(tick);
    }
  };
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
  };
  const updateToggle = () => {
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.dataset.i18nAria = paused ? 'playMotion' : 'pauseMotion';
    toggle.setAttribute(
      'aria-label',
      translate(paused ? 'playMotion' : 'pauseMotion', currentLanguage()),
    );
    toggle.querySelector('path')!.setAttribute('d', paused ? 'M3 2 9 6 3 10Z' : 'M4 2v8M8 2v8');
  };
  const resize = () => {
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (!width || !height) return;
    const pixelRatio = Math.min(Math.max(window.devicePixelRatio, 1.5), 2);
    renderer.setPixelRatio(pixelRatio);
    uniforms.uPixelRatio.value = pixelRatio;
    uniforms.uResolution.value.set(width, height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.set(0, 0, width / height < 1.1 ? 9 : 7.8);
    camera.updateProjectionMatrix();
    paint();
  };
  const resizeObserver = new ResizeObserver(resize);
  document.addEventListener('themechange', paint, { signal });
  document.addEventListener('languagechange', updateToggle, { signal });
  resizeObserver.observe(host);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : resume()), {
    signal,
  });
  preference.addEventListener(
    'change',
    () => {
      paused = preference.matches;
      if (paused) {
        stop();
        progress = targetProgress;
        paint();
      } else resume();
      updateToggle();
    },
    { signal },
  );
  toggle.hidden = false;
  toggle.addEventListener(
    'click',
    () => {
      paused = !paused;
      if (paused) stop();
      else resume();
      updateToggle();
    },
    { signal },
  );
  document.addEventListener(
    'experienceprogress',
    ((event: CustomEvent<number>) => {
      targetProgress = Math.max(0, Math.min(3, event.detail));
      if (paused) {
        progress = targetProgress;
        paint();
      }
    }) as EventListener,
    { signal },
  );
  document.addEventListener(
    'projectchange',
    ((event: CustomEvent<number>) => {
      targetProject = event.detail;
      if (paused) {
        project = targetProject;
        paint();
      }
    }) as EventListener,
    { signal },
  );
  canvas.addEventListener(
    'pointerdown',
    (event) => {
      if (event.pointerType === 'touch') return;
      dragging = true;
      previousX = event.clientX;
      previousY = event.clientY;
      canvas.setPointerCapture(event.pointerId);
    },
    { signal },
  );
  window.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType === 'touch') return;
      targetHover = 1;
      targetPointerX = (event.clientX / host.clientWidth - 0.5) * 2;
      targetPointerY = (event.clientY / host.clientHeight - 0.5) * 2;
      if (dragging) {
        dragX += (event.clientX - previousX) * 0.008;
        dragY += (event.clientY - previousY) * 0.008;
        previousX = event.clientX;
        previousY = event.clientY;
        if (paused) paint();
      }
    },
    { signal },
  );
  const release = () => {
    dragging = false;
  };
  canvas.addEventListener('pointerup', release, { signal });
  canvas.addEventListener('pointercancel', release, { signal });
  document.documentElement.addEventListener(
    'pointerleave',
    () => {
      targetPointerX = 0;
      targetPointerY = 0;
      targetHover = 0;
    },
    { signal },
  );
  const reset = () => {
    dragX = 0;
    dragY = 0;
    paint();
  };
  canvas.addEventListener('dblclick', reset, { signal });
  canvas.addEventListener(
    'keydown',
    (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'Home') return reset();
      dragX += event.key === 'ArrowLeft' ? -0.15 : event.key === 'ArrowRight' ? 0.15 : 0;
      dragY += event.key === 'ArrowUp' ? -0.15 : event.key === 'ArrowDown' ? 0.15 : 0;
      paint();
    },
    { signal },
  );
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    stop();
    listeners.abort();
    resizeObserver.disconnect();
    geometry.dispose();
    strands.dispose();
    material.dispose();
    lineMaterial.dispose();
    renderer.dispose();
  };
  canvas.addEventListener(
    'webglcontextlost',
    (event) => {
      event.preventDefault();
      host.classList.remove('is-ready');
      host.dataset.fallback = 'true';
      toggle.hidden = true;
      dispose();
    },
    { signal },
  );
  window.addEventListener(
    'pagehide',
    (event) => {
      if (!event.persisted) dispose();
    },
    { signal },
  );
  resize();
  updateToggle();
  host.classList.add('is-ready');
  resume();
}
