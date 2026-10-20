import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

/* The hero: the golden spiral stairwell from Bakemonogatari's first episode.

   Looking straight down a glass tower. A continuous spiral of fine, tightly packed
   treads hugs a curtain wall of small sunlit panes; a bronze handrail on dense
   balusters runs along the open inner edge. Sun pours in at an angle, so every flight
   throws a diagonal shadow on the flights below, and shafts of light cross the well.
   At the bottom, an ornate medallion glows. Scroll progress (0..1) drops the camera
   down the well, spinning and accelerating, until it washes into the summer blue
   that the Experience section begins with. */

const PALETTE = {
  tread: '#e3b23c', // honey gold
  nosing: '#7a5a16', // bronze line at each step edge
  highlight: '#ffe8a3',
  fascia: '#a87a1d', // deep ochre
  soffit: '#8c6514',
  rail: '#4f3f12', // bronze
  baluster: '#5e4c17',
  mullion: '#b8902e',
  glassHi: '#fffdf3',
  glassLo: '#ffe9a6',
  haze: '#b98a24',
  medallion: '#f6e2bd',
  medallionLine: '#9c6f22',
  sun: '#fff1c8',
};

const TURNS = 9;
const TURN_H = 3.4;
const STEPS_PER_TURN = 64;
const HEIGHT = TURNS * TURN_H;
const R_WALL = 3.3;
const R_OUT = 3.27;
const R_IN = 2.05;
const TREAD_DEPTH = 0.22; // thickness of each flight, tread to soffit
const SUN_DIR = new THREE.Vector3(0.48, -1, 0.3).normalize();

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function canvasTexture(w, h, draw, { repeat = false, srgb = true } = {}) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(c);
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  if (repeat) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
  }
  return tex;
}

/* one tread, repeated along the spiral: gold, lit edge, bronze nosing line */
function treadTexture() {
  return canvasTexture(
    64,
    128,
    (g, w, h) => {
      const grad = g.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, '#d9a535');
      grad.addColorStop(0.7, PALETTE.tread);
      grad.addColorStop(0.86, PALETTE.highlight);
      grad.addColorStop(0.9, PALETTE.nosing);
      grad.addColorStop(1, PALETTE.nosing);
      g.fillStyle = grad;
      g.fillRect(0, 0, w, h);
      // worn darker band along the wall side and a lighter walking line
      g.fillStyle = 'rgba(122, 90, 22, 0.25)';
      g.fillRect(0, h - 14, w, 14);
      g.fillStyle = 'rgba(255, 240, 190, 0.18)';
      g.fillRect(0, h * 0.35, w, h * 0.2);
    },
    { repeat: true }
  );
}

/* the glass curtain wall: small panes in a fine bronze grid, no gaps */
function glassTexture() {
  const cols = 8;
  const rows = 10;
  return canvasTexture(
    512,
    512,
    (g, w, h) => {
      g.fillStyle = PALETTE.mullion;
      g.fillRect(0, 0, w, h);
      const pw = w / cols;
      const ph = h / rows;
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          const x = c * pw + 3;
          const y = r * ph + 3;
          const grad = g.createLinearGradient(0, y, 0, y + ph - 6);
          const dim = (r * 7 + c * 3) % 11 === 0 ? 0.88 : 1;
          grad.addColorStop(0, PALETTE.glassHi);
          grad.addColorStop(1, PALETTE.glassLo);
          g.globalAlpha = dim;
          g.fillStyle = grad;
          g.fillRect(x, y, pw - 6, ph - 6);
          g.globalAlpha = 1;
        }
      }
      // heavier transoms every few rows, as in a real curtain wall
      g.fillStyle = '#9d7a22';
      for (let r = 0; r <= rows; r += 5) g.fillRect(0, r * ph - 3, w, 6);
    },
    { repeat: true }
  );
}

/* the ornate floor at the bottom of the well: octagon, star, wheel */
function medallionTexture() {
  return canvasTexture(1024, 1024, (g, w) => {
    const c = w / 2;
    const ring = (r, width, color) => {
      g.beginPath();
      g.arc(c, c, r, 0, Math.PI * 2);
      g.lineWidth = width;
      g.strokeStyle = color;
      g.stroke();
    };
    const poly = (n, r, rot, width, color, fill) => {
      g.beginPath();
      for (let i = 0; i <= n; i += 1) {
        const a = rot + (i / n) * Math.PI * 2;
        g.lineTo(c + Math.cos(a) * r, c + Math.sin(a) * r);
      }
      if (fill) {
        g.fillStyle = fill;
        g.fill();
      }
      g.lineWidth = width;
      g.strokeStyle = color;
      g.stroke();
    };
    const grad = g.createRadialGradient(c, c, 40, c, c, c);
    grad.addColorStop(0, '#fff6e2');
    grad.addColorStop(0.7, PALETTE.medallion);
    grad.addColorStop(1, '#e3c48a');
    g.fillStyle = grad;
    g.fillRect(0, 0, w, w);
    const L = PALETTE.medallionLine;
    ring(500, 16, L);
    ring(470, 4, L);
    poly(8, 440, Math.PI / 8, 8, L, '#f3d9a8');
    poly(4, 420, 0, 6, L);
    poly(4, 420, Math.PI / 4, 6, L);
    ring(300, 6, L);
    // the wheel: spokes and a hub
    for (let i = 0; i < 24; i += 1) {
      const a = (i / 24) * Math.PI * 2;
      g.beginPath();
      g.moveTo(c + Math.cos(a) * 120, c + Math.sin(a) * 120);
      g.lineTo(c + Math.cos(a) * 290, c + Math.sin(a) * 290);
      g.lineWidth = i % 3 === 0 ? 6 : 2.5;
      g.strokeStyle = L;
      g.stroke();
    }
    ring(210, 3, L);
    ring(120, 8, L);
    ring(60, 14, L);
    // small squares at the octagon's corners
    for (let i = 0; i < 8; i += 1) {
      const a = Math.PI / 8 + (i / 8) * Math.PI * 2;
      const x = c + Math.cos(a) * 440;
      const y = c + Math.sin(a) * 440;
      g.save();
      g.translate(x, y);
      g.rotate(a);
      g.fillStyle = '#e8c27a';
      g.fillRect(-22, -22, 44, 44);
      g.lineWidth = 4;
      g.strokeStyle = L;
      g.strokeRect(-22, -22, 44, 44);
      g.restore();
    }
  });
}

function softDot() {
  return canvasTexture(64, 64, (g) => {
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.35, 'rgba(255,245,215,0.6)');
    grad.addColorStop(1, 'rgba(255,240,200,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
  });
}

/* a shaft of light: bright core, soft edges, fading at both ends */
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
    along.addColorStop(0.25, 'rgba(0,0,0,1)');
    along.addColorStop(0.75, 'rgba(0,0,0,1)');
    along.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = along;
    g.fillRect(0, 0, w, h);
  });
}

/* a helical strip between two radii; `drop` lowers it below the tread surface */
function helixStrip(rA, rB, drop, segments, vertical = false) {
  const pos = [];
  const uv = [];
  const idx = [];
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const a = t * TURNS * Math.PI * 2;
    const y = HEIGHT - t * HEIGHT;
    const u = t * TURNS * STEPS_PER_TURN;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    if (vertical) {
      pos.push(cos * rA, y, sin * rA, cos * rA, y - drop, sin * rA);
    } else {
      pos.push(cos * rA, y - drop, sin * rA, cos * rB, y - drop, sin * rB);
    }
    uv.push(u, 0, u, 1);
    if (i < segments) {
      const k = i * 2;
      idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
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
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const haze = new THREE.Color(PALETTE.haze);
  scene.background = haze.clone();
  scene.fog = new THREE.FogExp2(haze.clone(), 0.034);
  const camera = new THREE.PerspectiveCamera(78, 1, 0.05, 120);

  const disposables = [];
  const keep = (x) => {
    disposables.push(x);
    return x;
  };

  /* light: warm fill, and one low sun that throws diagonal shadows down the well */
  scene.add(new THREE.HemisphereLight('#fff3d0', '#7a5a16', 0.75));
  scene.add(new THREE.AmbientLight('#ffe2a0', 0.25));
  const sun = new THREE.DirectionalLight(PALETTE.sun, 3.2);
  sun.target.position.set(0, HEIGHT / 2, 0);
  sun.position.copy(sun.target.position).addScaledVector(SUN_DIR, -45);
  sun.castShadow = true;
  sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15, near: 1, far: 95 });
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.02;
  sun.shadow.radius = 3;
  scene.add(sun, sun.target);

  /* the stair: treads, the inner fascia, the underside */
  const segments = TURNS * 160;
  const treadTex = keep(treadTexture());
  const treads = new THREE.Mesh(
    keep(helixStrip(R_IN, R_OUT, 0, segments)),
    keep(new THREE.MeshStandardMaterial({ map: treadTex, roughness: 0.72, metalness: 0.05, side: THREE.DoubleSide }))
  );
  const fascia = new THREE.Mesh(
    keep(helixStrip(R_IN, R_IN, TREAD_DEPTH, segments, true)),
    keep(new THREE.MeshStandardMaterial({ color: PALETTE.fascia, roughness: 0.6, side: THREE.DoubleSide }))
  );
  const soffit = new THREE.Mesh(
    keep(helixStrip(R_IN, R_OUT, TREAD_DEPTH, segments)),
    keep(new THREE.MeshStandardMaterial({ color: PALETTE.soffit, roughness: 0.8, side: THREE.DoubleSide }))
  );
  [treads, fascia, soffit].forEach((m) => {
    m.castShadow = true;
    m.receiveShadow = true;
    scene.add(m);
  });

  /* the railing: a bronze rail on dense balusters along the open edge */
  const railR = R_IN + 0.04;
  const rail = new THREE.Mesh(
    keep(new THREE.TubeGeometry(new Helix(railR, 0.9), TURNS * 96, 0.032, 8, false)),
    keep(new THREE.MeshStandardMaterial({ color: PALETTE.rail, roughness: 0.35, metalness: 0.6 }))
  );
  rail.castShadow = true;
  scene.add(rail);
  const balusterCount = TURNS * STEPS_PER_TURN;
  const balusters = new THREE.InstancedMesh(
    keep(new THREE.BoxGeometry(0.014, 0.9, 0.014)),
    keep(new THREE.MeshStandardMaterial({ color: PALETTE.baluster, roughness: 0.5, metalness: 0.4 })),
    balusterCount
  );
  const dummy = new THREE.Object3D();
  for (let i = 0; i < balusterCount; i += 1) {
    const t = i / balusterCount;
    const a = t * TURNS * Math.PI * 2;
    dummy.position.set(Math.cos(a) * railR, HEIGHT - t * HEIGHT + 0.45, Math.sin(a) * railR);
    dummy.updateMatrix();
    balusters.setMatrixAt(i, dummy.matrix);
  }
  balusters.castShadow = true;
  scene.add(balusters);

  /* the glass curtain wall, glowing with daylight but still taking shadow */
  const glassTex = keep(glassTexture());
  const wallH = HEIGHT + 12;
  glassTex.repeat.set(16, wallH / 2.4);
  const wall = new THREE.Mesh(
    keep(new THREE.CylinderGeometry(R_WALL, R_WALL, wallH, 128, 1, true)),
    keep(
      new THREE.MeshStandardMaterial({
        map: glassTex,
        emissive: '#fff0c4',
        emissiveMap: glassTex,
        emissiveIntensity: 0.5,
        roughness: 0.9,
        side: THREE.BackSide,
      })
    )
  );
  wall.position.y = HEIGHT / 2 - 3;
  wall.receiveShadow = true;
  scene.add(wall);

  /* the medallion floor at the bottom */
  const floor = new THREE.Mesh(
    keep(new THREE.CircleGeometry(R_WALL, 96)),
    // tinted down so the ornament reads instead of blooming out
    keep(new THREE.MeshBasicMaterial({ map: keep(medallionTexture()), color: '#c9a160', fog: false }))
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.2;
  scene.add(floor);

  /* shafts of sun crossing the well, along the sun's direction */
  const shaftTex = keep(shaftTexture());
  const shaftGeo = keep(new THREE.PlaneGeometry(1, 1));
  const up = new THREE.Vector3(0, 1, 0);
  const shafts = [];
  for (let i = 0; i < 9; i += 1) {
    const mat = keep(
      new THREE.MeshBasicMaterial({
        map: shaftTex,
        color: PALETTE.sun,
        transparent: true,
        opacity: 0.16 + (i % 3) * 0.05,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        fog: false,
      })
    );
    const shaft = new THREE.Mesh(shaftGeo, mat);
    shaft.scale.set(0.5 + (i % 4) * 0.35, 9 + (i % 3) * 3, 1);
    shaft.quaternion.setFromUnitVectors(up, SUN_DIR.clone().negate());
    shaft.rotateY((i * Math.PI) / 4.5);
    const a = i * 2.1;
    shaft.position.set(Math.cos(a) * 0.9, HEIGHT - 6 - i * ((HEIGHT - 4) / 9), Math.sin(a) * 0.9);
    shafts.push(shaft);
    scene.add(shaft);
  }

  /* dust hanging in the light; it streams upward as you fall */
  const DUST = small ? 380 : 700;
  const dustPos = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i += 1) {
    const r = Math.sqrt(Math.random()) * (R_IN - 0.15);
    const a = Math.random() * Math.PI * 2;
    dustPos.set([Math.cos(a) * r, -1 + Math.random() * (HEIGHT + 3), Math.sin(a) * r], i * 3);
  }
  const dustGeo = keep(new THREE.BufferGeometry());
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(
    dustGeo,
    keep(
      new THREE.PointsMaterial({
        map: keep(softDot()),
        color: '#fff0c0',
        size: 0.06,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        fog: false,
      })
    )
  );
  scene.add(dust);

  /* bloom: the sunlit glass should glow */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.55, 0.65, 0.8);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const target = new THREE.Vector3();
  let progress = 0;
  let goal = 0;
  let dirty = true;
  let ready = false;

  function place(p, t) {
    const fall = 0.28 * p + 0.72 * p * p; // gravity: slow at first, then faster
    const top = HEIGHT + 2.4;
    const bottom = 0.4;
    const y = top - (top - bottom) * fall;
    const yaw = 0.6 + p * Math.PI * 2 * 2.2;
    // at rest the view leans a little off-axis, like the reference frame; the fall swings it round
    const lean = 0.55 + 0.5 * smoothstep(0, 0.3, p);
    const roll = Math.sin(p * Math.PI * 5) * 0.12 * p;
    const drift = 0.18 * p;
    camera.position.set(Math.sin(p * 9) * drift, y, Math.cos(p * 7) * drift);
    target.set(Math.cos(yaw) * lean, y - 5, Math.sin(yaw) * lean);
    camera.up.set(Math.cos(yaw + Math.PI / 2 + roll), 0, Math.sin(yaw + Math.PI / 2 + roll));
    camera.lookAt(target);
    camera.fov = 76 + 16 * smoothstep(0.08, 0.7, p);
    camera.updateProjectionMatrix();
    // the light breathes a touch, so the still frame is never quite frozen
    shafts.forEach((s, i) => {
      s.material.opacity = 0.14 + (i % 3) * 0.05 + Math.sin(t * 0.0006 + i) * 0.03;
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
    // a slow re-render (~12 fps) keeps the light shafts breathing while at rest
    if (!dirty && now - lastAmbient < 80) return;
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
      balusters.dispose();
      disposables.forEach((d) => d.dispose());
      composer.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
