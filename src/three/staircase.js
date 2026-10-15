import * as THREE from 'three';

// The hero: looking straight down a white spiral stairwell, the one Senjougahara falls
// down in the first episode. Scroll progress (0..1) drops the camera down the well,
// spinning and accelerating, past loose sheets of paper, until it whites out into the
// summer sky blue that the Experience section starts with.

const PAPER = new THREE.Color('#e2d9c9');
const SKY = new THREE.Color('#0f47c2');
const INK = '#1b1115';
const RED = '#d21f3c';

const STEPS_PER_TURN = 22;
const TURNS = 11;
const RISE = 0.17;
const R_IN = 0.95;
const R_OUT = 2.7;
const HEIGHT = STEPS_PER_TURN * TURNS * RISE;
const STEP_COUNT = STEPS_PER_TURN * TURNS;
const D_ANGLE = (Math.PI * 2) / STEPS_PER_TURN;

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function toonGradient() {
  const data = new Uint8Array([95, 95, 95, 255, 185, 185, 185, 255, 255, 255, 255, 255]);
  const tex = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// the stairwell wall: plaster with tall narrow windows letting in daylight
function wallTexture() {
  const tex = canvasTexture(512, 512, (g, w, h) => {
    g.fillStyle = '#ebe4d8';
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 4; i += 1) {
      const x = 40 + i * 128;
      g.fillStyle = '#d9d0c1';
      g.fillRect(x - 6, 70, 52, 372);
      g.fillStyle = '#cfe3f6';
      g.fillRect(x, 76, 40, 360);
      g.fillStyle = '#d9d0c1';
      g.fillRect(x + 18, 76, 4, 360);
      g.fillRect(x, 250, 40, 4);
    }
  });
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(5, (HEIGHT + 14) / 4.2);
  return tex;
}

// the clock the series keeps cutting to
function clockTexture() {
  return canvasTexture(256, 256, (g) => {
    g.fillStyle = '#f7efe0';
    g.beginPath();
    g.arc(128, 128, 120, 0, Math.PI * 2);
    g.fill();
    g.lineWidth = 12;
    g.strokeStyle = INK;
    g.stroke();
    g.fillStyle = INK;
    for (let i = 0; i < 12; i += 1) {
      g.save();
      g.translate(128, 128);
      g.rotate((i / 12) * Math.PI * 2);
      g.fillRect(-3, -104, 6, i % 3 === 0 ? 22 : 12);
      g.restore();
    }
    const hand = (turns, len, width, color) => {
      g.save();
      g.translate(128, 128);
      g.rotate(turns * Math.PI * 2);
      g.fillStyle = color;
      g.fillRect(-width / 2, -len, width, len + 10);
      g.restore();
    };
    hand(4.73 / 12, 58, 10, INK);
    hand(44 / 60, 88, 6, INK);
    hand(0.12, 96, 3, RED);
  });
}

class Helix extends THREE.Curve {
  constructor(radius, lift) {
    super();
    this.radius = radius;
    this.lift = lift;
  }

  getPoint(t, target = new THREE.Vector3()) {
    const a = t * TURNS * Math.PI * 2;
    const y = HEIGHT - t * STEP_COUNT * RISE + this.lift;
    return target.set(Math.cos(a) * this.radius, y, Math.sin(a) * this.radius);
  }
}

export function createStaircase(container, { onReady, onFrame } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = PAPER.clone();
  scene.fog = new THREE.Fog(PAPER.clone(), 4, 24);
  const camera = new THREE.PerspectiveCamera(70, 1, 0.05, 90);

  scene.add(new THREE.HemisphereLight('#ffffff', '#8f8574', 1.1));
  const sun = new THREE.DirectionalLight('#ffffff', 1.9);
  sun.position.set(3, 10, 4);
  scene.add(sun);

  const disposables = [];
  const keep = (x) => {
    disposables.push(x);
    return x;
  };
  const gradientMap = keep(toonGradient());

  // steps and their dark risers
  const stepGeo = keep(new THREE.BoxGeometry(R_OUT - R_IN, 0.08, 0.58));
  const stepMat = keep(new THREE.MeshToonMaterial({ color: '#ffffff', gradientMap }));
  const riserGeo = keep(new THREE.BoxGeometry(R_OUT - R_IN, RISE, 0.035));
  const riserMat = keep(new THREE.MeshBasicMaterial({ color: INK }));
  const balusterGeo = keep(new THREE.CylinderGeometry(0.012, 0.012, 0.85, 5));
  const steps = new THREE.InstancedMesh(stepGeo, stepMat, STEP_COUNT);
  const risers = new THREE.InstancedMesh(riserGeo, riserMat, STEP_COUNT);
  const balusters = new THREE.InstancedMesh(balusterGeo, riserMat, STEP_COUNT);
  const mid = (R_IN + R_OUT) / 2;
  const dummy = new THREE.Object3D();
  for (let i = 0; i < STEP_COUNT; i += 1) {
    const a = i * D_ANGLE;
    const y = HEIGHT - i * RISE;
    dummy.position.set(Math.cos(a) * mid, y, Math.sin(a) * mid);
    dummy.rotation.set(0, -a, 0);
    dummy.updateMatrix();
    steps.setMatrixAt(i, dummy.matrix);

    const ra = a + D_ANGLE / 2;
    dummy.position.set(Math.cos(ra) * mid, y - RISE / 2, Math.sin(ra) * mid);
    dummy.rotation.set(0, -ra, 0);
    dummy.updateMatrix();
    risers.setMatrixAt(i, dummy.matrix);

    const br = R_IN + 0.05;
    dummy.position.set(Math.cos(a) * br, y + 0.45, Math.sin(a) * br);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    balusters.setMatrixAt(i, dummy.matrix);
  }
  scene.add(steps, risers, balusters);

  // the red handrail spiralling down the well
  const railGeo = keep(new THREE.TubeGeometry(new Helix(R_IN + 0.05, 0.88), TURNS * 64, 0.04, 6, false));
  const railMat = keep(new THREE.MeshBasicMaterial({ color: RED }));
  scene.add(new THREE.Mesh(railGeo, railMat));

  // the wall of the well
  const wallTex = keep(wallTexture());
  const wallGeo = keep(new THREE.CylinderGeometry(R_OUT + 0.02, R_OUT + 0.02, HEIGHT + 14, 72, 1, true));
  const wallMat = keep(new THREE.MeshBasicMaterial({ map: wallTex, side: THREE.BackSide }));
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wall.position.y = HEIGHT / 2 - 4;
  scene.add(wall);

  // clocks on the wall, between flights
  const clockTex = keep(clockTexture());
  const clockGeo = keep(new THREE.CircleGeometry(0.62, 48));
  const clockMat = keep(new THREE.MeshBasicMaterial({ map: clockTex }));
  [
    { turn: 1.5, a: 1.2 },
    { turn: 4.4, a: 3.9 },
    { turn: 7.2, a: 0.4 },
    { turn: 9.6, a: 2.6 },
  ].forEach(({ turn, a }) => {
    const clock = new THREE.Mesh(clockGeo, clockMat);
    const stepIndex = Math.round(turn * STEPS_PER_TURN);
    const r = R_OUT - 0.02;
    clock.position.set(Math.cos(a) * r, HEIGHT - stepIndex * RISE + 1.9, Math.sin(a) * r);
    clock.lookAt(0, clock.position.y, 0);
    scene.add(clock);
  });

  // loose sheets of paper hanging in the well: they rush up past you as you fall
  const PAPERS = 110;
  const paperGeo = keep(new THREE.PlaneGeometry(0.12, 0.16));
  const paperMat = keep(new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
  const papers = new THREE.InstancedMesh(paperGeo, paperMat, PAPERS);
  const tint = new THREE.Color();
  for (let i = 0; i < PAPERS; i += 1) {
    const r = 0.38 + Math.random() * (R_IN - 0.5); // kept off the camera's path down the middle
    const a = Math.random() * Math.PI * 2;
    dummy.position.set(Math.cos(a) * r, -2 + Math.random() * (HEIGHT - 3), Math.sin(a) * r);
    dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    dummy.updateMatrix();
    papers.setMatrixAt(i, dummy.matrix);
    const n = Math.random();
    papers.setColorAt(i, tint.set(n < 0.72 ? '#ffffff' : n < 0.9 ? RED : INK));
  }
  scene.add(papers);

  // the floor at the bottom is the summer sky
  const floorGeo = keep(new THREE.CircleGeometry(R_OUT, 48));
  const floorMat = keep(new THREE.MeshBasicMaterial({ color: SKY }));
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -3;
  scene.add(floor);

  const target = new THREE.Vector3();
  const fogColor = new THREE.Color();
  let progress = 0;
  let goal = 0;
  let dirty = true;
  let ready = false;

  function place(p) {
    const fall = 0.3 * p + 0.7 * p * p; // gravity: slow at first, then faster
    const top = HEIGHT + 2.4;
    const bottom = -1.2;
    const y = top - (top - bottom) * fall;
    const yaw = p * Math.PI * 2 * 2.4;
    const lean = 0.2 + 0.6 * smoothstep(0, 0.3, p);
    const roll = Math.sin(p * Math.PI * 5) * 0.14 * p;
    camera.position.set(Math.sin(p * 9) * 0.12 * p, y, Math.cos(p * 7) * 0.12 * p);
    target.set(Math.cos(yaw) * lean, y - 4, Math.sin(yaw) * lean);
    camera.up.set(Math.cos(yaw + Math.PI / 2 + roll), 0, Math.sin(yaw + Math.PI / 2 + roll));
    camera.lookAt(target);
    camera.fov = 68 + 14 * smoothstep(0.1, 0.7, p);
    camera.updateProjectionMatrix();
    const k = smoothstep(0.5, 0.96, p);
    fogColor.copy(PAPER).lerp(SKY, k);
    scene.background.copy(fogColor);
    scene.fog.color.copy(fogColor);
    scene.fog.far = 24 - 12 * k;
  }

  function resize() {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    dirty = true;
  }
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  let visible = true;
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) dirty = true;
  });
  io.observe(container);

  let raf;
  function frame() {
    raf = requestAnimationFrame(frame);
    if (!visible || document.hidden) return;
    const delta = goal - progress;
    if (Math.abs(delta) > 0.0002) {
      progress += delta * 0.12;
      dirty = true;
    } else if (progress !== goal) {
      progress = goal;
      dirty = true;
    }
    if (!dirty) return;
    dirty = false;
    place(progress);
    renderer.render(scene, camera);
    onFrame?.(progress);
    if (!ready) {
      ready = true;
      onReady?.();
    }
  }
  raf = requestAnimationFrame(frame);

  return {
    setProgress(p) {
      goal = Math.min(1, Math.max(0, p));
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      steps.dispose();
      risers.dispose();
      balusters.dispose();
      papers.dispose();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
