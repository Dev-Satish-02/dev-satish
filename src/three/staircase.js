import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

/* The hero: the golden spiral stairwell from Bakemonogatari's first episode.

   Looking straight down a glass tower. Solid steps climb a curtain wall of tall
   panes, four to a bay, each bay held by a bronze fin with bolted fittings. A glass
   balustrade with a bronze handrail runs along the open edge. The sun comes from one
   side only, high up, so every flight throws its shadow across the next and a few
   soft shafts cross the well in parallel. There is no floor: the well sinks into a
   warm haze. Scroll progress (0..1) drops the camera down it, spinning and
   accelerating, until the haze washes into the summer blue that the Experience
   section begins with. */

const PALETTE = {
  step: '#d4a23a', // honey gold
  nosing: '#6e5214', // the bronze line along each step's edge
  rail: '#5a4513', // bronze
  post: '#4a3910',
  glassRail: '#e6c25e', // tinted balustrade glass
  glassEdge: '#fff1c2',
  fin: '#b4882c',
  pane: '#fff6dc',
  haze: '#dcbd72',
  sun: '#fff0c8',
};
const SKY = new THREE.Color('#0f47c2');

const STEPS_PER_TURN = 56;
const RISE = 0.1;
const TURNS = 11;
const TURN_H = STEPS_PER_TURN * RISE;
const STEP_COUNT = STEPS_PER_TURN * TURNS;
const HEIGHT = TURN_H * TURNS;
const D_ANGLE = (Math.PI * 2) / STEPS_PER_TURN;
const R_WALL = 3.3;
const R_OUT = 3.24;
const R_IN = 2.05;
const BLOCK = 0.16; // each step is a solid block this deep
const BAYS = 11; // fins around the wall
const RAIL_H = 0.95;
// the camera only ever travels the middle of the tower: the stair runs on for two full
// turns above where it starts and below where it stops, so neither end is ever in view
const MARGIN = 2 * TURN_H;
const CAM_TOP = HEIGHT - MARGIN;
const CAM_BOTTOM = MARGIN;

// one sun, high on one side; light travels down and across the well
const SUN_DIR = new THREE.Vector3(0.62, -1, 0.18).normalize();

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/* One bay of the curtain wall: four tall panes between thin mullions, a thin transom
   across the middle, and the bronze fin on the left edge with its bolted fittings. */
function bayTexture() {
  const tex = canvasTexture(1024, 1024, (g, w, h) => {
    const fin = 70;
    g.fillStyle = '#d7b46a';
    g.fillRect(0, 0, w, h);
    const paneW = (w - fin) / 4;
    for (let r = 0; r < 2; r += 1) {
      for (let c = 0; c < 4; c += 1) {
        const x = fin + c * paneW + 4;
        const y = r * (h / 2) + 6;
        const ph = h / 2 - 12;
        const grad = g.createLinearGradient(x, y, x + paneW, y + ph);
        grad.addColorStop(0, '#fffdf6');
        grad.addColorStop(0.6, PALETTE.pane);
        grad.addColorStop(1, '#fbecc2');
        g.fillStyle = grad;
        g.fillRect(x, y, paneW - 8, ph);
      }
    }
    // the fin and its point fixings, two per pane height
    const finGrad = g.createLinearGradient(0, 0, fin, 0);
    finGrad.addColorStop(0, '#8d6a1f');
    finGrad.addColorStop(0.5, PALETTE.fin);
    finGrad.addColorStop(1, '#9a7524');
    g.fillStyle = finGrad;
    g.fillRect(0, 0, fin, h);
    for (let i = 0; i < 4; i += 1) {
      const y = (i + 0.5) * (h / 4);
      g.fillStyle = '#e4c67c';
      g.beginPath();
      g.arc(fin + 6, y, 12, 0, Math.PI * 2);
      g.fill();
      g.lineWidth = 4;
      g.strokeStyle = PALETTE.nosing;
      g.stroke();
    }
    // the transom
    g.fillStyle = '#b8913c';
    g.fillRect(fin, h / 2 - 6, w - fin, 12);
  });
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function softDot() {
  return canvasTexture(64, 64, (g) => {
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,0.9)');
    grad.addColorStop(1, 'rgba(255,240,200,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
  });
}

/* a shaft of light: soft across its width, fading at both ends */
function shaftTexture() {
  return canvasTexture(128, 512, (g, w, h) => {
    const across = g.createLinearGradient(0, 0, w, 0);
    across.addColorStop(0, 'rgba(255,255,255,0)');
    across.addColorStop(0.5, 'rgba(255,255,255,1)');
    across.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = across;
    g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'destination-in';
    const along = g.createLinearGradient(0, 0, 0, h);
    along.addColorStop(0, 'rgba(0,0,0,0)');
    along.addColorStop(0.2, 'rgba(0,0,0,1)');
    along.addColorStop(0.65, 'rgba(0,0,0,0.6)');
    along.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = along;
    g.fillRect(0, 0, w, h);
  });
}

/* a solid wedge-shaped step, its top at y = 0, spanning angle 0..span */
function stepGeometry(span) {
  const shape = new THREE.Shape();
  const n = 4;
  for (let i = 0; i <= n; i += 1) {
    const a = (i / n) * span;
    const p = [Math.cos(a) * R_OUT, -Math.sin(a) * R_OUT];
    if (i === 0) shape.moveTo(...p);
    else shape.lineTo(...p);
  }
  for (let i = n; i >= 0; i -= 1) {
    const a = (i / n) * span;
    shape.lineTo(Math.cos(a) * R_IN, -Math.sin(a) * R_IN);
  }
  const geo = new THREE.ExtrudeGeometry(shape, { depth: BLOCK, bevelEnabled: false });
  geo.rotateX(-Math.PI / 2); // extrude upward; shape y becomes -z, so angles run the right way
  geo.translate(0, -BLOCK, 0);
  return geo;
}

/* a vertical helical band along the open edge, from `low` to `high` above the treads */
function balustradeGeometry(radius, low, high, segments) {
  const pos = [];
  const idx = [];
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const a = t * TURNS * Math.PI * 2;
    const y = HEIGHT - t * HEIGHT;
    pos.push(Math.cos(a) * radius, y + low, Math.sin(a) * radius, Math.cos(a) * radius, y + high, Math.sin(a) * radius);
    if (i < segments) {
      const k = i * 2;
      idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

class Helix extends THREE.Curve {
  constructor(radius, lift) {
    super();
    this.radius = radius;
    this.lift = lift;
  }

  getPoint(t, target = new THREE.Vector3()) {
    const a = t * TURNS * Math.PI * 2;
    return target.set(Math.cos(a) * this.radius, HEIGHT - t * HEIGHT + this.lift, Math.sin(a) * this.radius);
  }
}

export function createStaircase(container, { onReady, onFrame } = {}) {
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const haze = new THREE.Color(PALETTE.haze);
  scene.background = haze.clone();
  scene.fog = new THREE.FogExp2(haze.clone(), 0.04);
  const camera = new THREE.PerspectiveCamera(76, 1, 0.05, 120);

  const disposables = [];
  const keep = (x) => {
    disposables.push(x);
    return x;
  };
  const instanced = [];

  /* light: a soft warm fill, and one sun from one side */
  scene.add(new THREE.HemisphereLight('#fff4d8', '#b08a3a', 0.95));
  const sun = new THREE.DirectionalLight(PALETTE.sun, 2.3);
  sun.target.position.set(0, HEIGHT / 2, 0);
  sun.position.copy(sun.target.position).addScaledVector(SUN_DIR, -70);
  sun.castShadow = true;
  sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 36, bottom: -36, near: 1, far: 150 });
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.03;
  sun.shadow.radius = 4;
  scene.add(sun, sun.target);

  /* the steps: solid blocks, each with a bronze line along its edge */
  const dummy = new THREE.Object3D();
  const steps = new THREE.InstancedMesh(
    keep(stepGeometry(D_ANGLE * 1.01)),
    keep(new THREE.MeshStandardMaterial({ color: PALETTE.step, roughness: 0.72, metalness: 0.05 })),
    STEP_COUNT
  );
  const nosing = new THREE.InstancedMesh(
    keep(new THREE.BoxGeometry(R_OUT - R_IN, 0.012, 0.022)),
    keep(new THREE.MeshStandardMaterial({ color: PALETTE.nosing, roughness: 0.5 })),
    STEP_COUNT
  );
  const mid = (R_IN + R_OUT) / 2;
  for (let i = 0; i < STEP_COUNT; i += 1) {
    const a = i * D_ANGLE;
    const y = HEIGHT - i * RISE;
    dummy.position.set(0, y, 0);
    dummy.rotation.set(0, -a, 0);
    dummy.updateMatrix();
    steps.setMatrixAt(i, dummy.matrix);
    const na = a + D_ANGLE * 0.98; // the leading edge, where the next step drops away
    dummy.position.set(Math.cos(na) * mid, y + 0.006, Math.sin(na) * mid);
    dummy.rotation.set(0, -na, 0);
    dummy.updateMatrix();
    nosing.setMatrixAt(i, dummy.matrix);
  }
  steps.castShadow = true;
  steps.receiveShadow = true;
  nosing.receiveShadow = true;
  scene.add(steps, nosing);
  instanced.push(steps, nosing);

  /* the balustrade: tinted glass, a bright top edge, a bronze handrail, a few posts */
  const railR = R_IN + 0.04;
  const balSegs = TURNS * 160;
  const glass = new THREE.Mesh(
    keep(balustradeGeometry(railR, 0.05, RAIL_H - 0.08, balSegs)),
    keep(
      new THREE.MeshStandardMaterial({
        color: PALETTE.glassRail,
        transparent: true,
        opacity: 0.26,
        roughness: 0.15,
        metalness: 0.1,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    )
  );
  scene.add(glass);
  const edge = new THREE.Mesh(
    keep(new THREE.TubeGeometry(new Helix(railR, RAIL_H - 0.08), TURNS * 96, 0.008, 4, false)),
    keep(new THREE.MeshBasicMaterial({ color: PALETTE.glassEdge }))
  );
  const rail = new THREE.Mesh(
    keep(new THREE.TubeGeometry(new Helix(railR, RAIL_H), TURNS * 96, 0.034, 8, false)),
    keep(new THREE.MeshStandardMaterial({ color: PALETTE.rail, roughness: 0.35, metalness: 0.55 }))
  );
  rail.castShadow = true;
  scene.add(edge, rail);
  const POSTS_PER_TURN = 7;
  const postCount = TURNS * POSTS_PER_TURN;
  const posts = new THREE.InstancedMesh(
    keep(new THREE.BoxGeometry(0.03, RAIL_H, 0.03)),
    keep(new THREE.MeshStandardMaterial({ color: PALETTE.post, roughness: 0.4, metalness: 0.5 })),
    postCount
  );
  for (let i = 0; i < postCount; i += 1) {
    const t = i / postCount;
    const a = t * TURNS * Math.PI * 2;
    dummy.position.set(Math.cos(a) * (railR - 0.02), HEIGHT - t * HEIGHT + RAIL_H / 2, Math.sin(a) * (railR - 0.02));
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    posts.setMatrixAt(i, dummy.matrix);
  }
  posts.castShadow = true;
  scene.add(posts);
  instanced.push(posts);

  /* the curtain wall: bays of four tall panes, glowing with daylight */
  const wallH = HEIGHT + 16;
  const bayTex = keep(bayTexture());
  bayTex.repeat.set(BAYS, wallH / 3.2);
  const wall = new THREE.Mesh(
    keep(new THREE.CylinderGeometry(R_WALL, R_WALL, wallH, 176, 1, true)),
    keep(
      new THREE.MeshStandardMaterial({
        map: bayTex,
        emissive: '#fff0c8',
        emissiveMap: bayTex,
        emissiveIntensity: 0.62,
        roughness: 0.9,
        side: THREE.BackSide,
      })
    )
  );
  wall.position.y = HEIGHT / 2;
  wall.receiveShadow = true;
  scene.add(wall);

  // the fins stand proud of the glass, so they catch the light and read from the side
  const fins = new THREE.InstancedMesh(
    keep(new THREE.BoxGeometry(0.1, wallH, 0.045)),
    // lit a little from within, so the side facing away from the sun reads as bronze, not black
    keep(new THREE.MeshStandardMaterial({ color: '#d1a94f', emissive: '#7a5a18', emissiveIntensity: 0.55, roughness: 0.5, metalness: 0.3 })),
    BAYS
  );
  for (let i = 0; i < BAYS; i += 1) {
    // CylinderGeometry places u along θ at (sin θ, cos θ); centre each fin on its painted stripe
    const theta = ((i + 35 / 1024) / BAYS) * Math.PI * 2;
    const r = R_WALL - 0.06;
    dummy.position.set(Math.sin(theta) * r, wall.position.y, Math.cos(theta) * r);
    dummy.rotation.set(0, theta, 0);
    dummy.updateMatrix();
    fins.setMatrixAt(i, dummy.matrix);
  }
  fins.castShadow = true;
  scene.add(fins);
  instanced.push(fins);

  /* a few soft shafts of sun, all parallel, entering from the sunny side */
  const shaftTex = keep(shaftTexture());
  const shaftGeo = keep(new THREE.PlaneGeometry(1, 1));
  const shaftQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), SUN_DIR.clone().negate());
  const across = new THREE.Vector3(-SUN_DIR.z, 0, SUN_DIR.x).normalize();
  const shafts = [];
  for (let i = 0; i < 5; i += 1) {
    const mat = keep(
      new THREE.MeshBasicMaterial({
        map: shaftTex,
        color: PALETTE.sun,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        fog: false,
      })
    );
    const shaft = new THREE.Mesh(shaftGeo, mat);
    shaft.quaternion.copy(shaftQuat);
    shaft.scale.set(0.9 + (i % 2) * 0.7, 10, 1);
    // start at the sunlit wall, run across and down the well
    const entry = new THREE.Vector3(-SUN_DIR.x, 0, -SUN_DIR.z).normalize().multiplyScalar(R_WALL - 0.3);
    entry.addScaledVector(across, (i - 2) * 0.55);
    entry.y = CAM_TOP - 3 - i * 5.5;
    shaft.position.copy(entry).addScaledVector(SUN_DIR, 5);
    shafts.push(shaft);
    scene.add(shaft);
  }

  /* a little dust in the light, which streams upward as you fall */
  const DUST = small ? 160 : 260;
  const dustPos = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i += 1) {
    const r = Math.sqrt(Math.random()) * (R_IN - 0.3);
    const a = Math.random() * Math.PI * 2;
    dustPos.set([Math.cos(a) * r, -4 + Math.random() * (HEIGHT + 6), Math.sin(a) * r], i * 3);
  }
  const dustGeo = keep(new THREE.BufferGeometry());
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(
    dustGeo,
    keep(
      new THREE.PointsMaterial({
        map: keep(softDot()),
        color: '#fff2cc',
        size: 0.035,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    )
  );
  scene.add(dust);

  /* a gentle bloom on the glass only */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.28, 0.5, 0.88);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const target = new THREE.Vector3();
  const tint = new THREE.Color();
  let progress = 0;
  let goal = 0;
  let dirty = true;
  let ready = false;

  function place(p, t) {
    const fall = 0.28 * p + 0.72 * p * p; // gravity: slow at first, then faster
    const top = CAM_TOP;
    const bottom = CAM_BOTTOM;
    const y = top - (top - bottom) * fall;
    const yaw = 0.6 + p * Math.PI * 2 * 2;
    const lean = 0.5 + 0.7 * smoothstep(0, 0.35, p); // swings outward so the walls and rail read from the side
    const roll = Math.sin(p * Math.PI * 5) * 0.1 * p;
    const drift = 0.18 * p;
    camera.position.set(Math.sin(p * 9) * drift, y, Math.cos(p * 7) * drift);
    target.set(Math.cos(yaw) * lean, y - 5, Math.sin(yaw) * lean);
    camera.up.set(Math.cos(yaw + Math.PI / 2 + roll), 0, Math.sin(yaw + Math.PI / 2 + roll));
    camera.lookAt(target);
    camera.fov = 74 + 14 * smoothstep(0.08, 0.7, p);
    camera.updateProjectionMatrix();
    // the haze thickens and cools toward the summer blue on the way down
    const k = smoothstep(0.55, 1, p);
    tint.copy(haze).lerp(SKY, k * 0.85);
    scene.background.copy(tint);
    scene.fog.color.copy(tint);
    scene.fog.density = 0.04 + 0.05 * k;
    // the light breathes a little, so the still frame is never quite frozen
    shafts.forEach((s, i) => {
      s.material.opacity = 0.07 + Math.sin(t * 0.0005 + i * 1.7) * 0.02;
    });
  }

  function resize() {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    renderer.setSize(w, h, false);
    composer.setPixelRatio(renderer.getPixelRatio());
    composer.setSize(w, h);
    bloom.resolution.set(w / 2, h / 2);
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
  let lastAmbient = 0;
  function frame(now) {
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
    // at rest, re-render slowly (~10 fps) so the light keeps breathing
    if (!dirty && now - lastAmbient < 100) return;
    lastAmbient = now;
    dirty = false;
    place(progress, now);
    composer.render();
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
      instanced.forEach((m) => m.dispose());
      disposables.forEach((d) => d.dispose());
      composer.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
