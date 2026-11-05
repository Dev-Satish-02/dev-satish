import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/* The episodes after the staircase, built the way the staircase is built.

   One renderer with the stairwell's settings (ACES filmic, PCF shadows, FogExp2 haze, the
   same bloom), and four sets, each lit by a hemisphere fill and one sun from one side, with
   soft parallel shafts and dust. The seasons change the haze and the sun, never the method.
   See design/ART_DIRECTION.md for the references behind each set.

     summer   the crossing at Iogi, Seibu Shinjuku Line: crossbuck, alternating red lamps,
              arrows, barriers, signal, wires, a yellow 2000-series train
     autumn   the cram school after Tange's Yamanashi Bunka Kaikan, given over to chairs:
              stacked, upside down, heaped
     winter   a complete Naoetsu High classroom in low winter sun
     night    the library: one aisle of floor-to-ceiling shelves; the posts are books on it

   The page drives it: setView(set, progress) places a set's camera along its path, and
   setHaze(color, amount) thickens the current set's fog toward a colour for the cuts. */

const BRONZE = '#6e5214';
const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const lerp = (a, b, t) => a + (b - a) * t;

// seeded, so every visit draws the same town, the same desks, the same books
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

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

const SERIF = '"Shippori Mincho B1", "Hiragino Mincho ProN", Georgia, serif';
const SANS = 'Inter, system-ui, sans-serif';

/* ── shared kit ─────────────────────────────────────────────── */

function makeKit() {
  const disposables = [];
  const keep = (x) => {
    disposables.push(x);
    return x;
  };
  const dummy = new THREE.Object3D();

  const dotTex = keep(
    canvasTexture(64, 64, (g) => {
      const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255,255,255,0.9)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, 64, 64);
    })
  );
  const shaftTex = keep(
    canvasTexture(64, 256, (g, w, h) => {
      const grad = g.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(0.5, 'rgba(255,255,255,1)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, w, h);
      const fade = g.createLinearGradient(0, 0, 0, h);
      fade.addColorStop(0, 'rgba(0,0,0,0)');
      fade.addColorStop(0.15, 'rgba(0,0,0,1)');
      fade.addColorStop(0.85, 'rgba(0,0,0,1)');
      fade.addColorStop(1, 'rgba(0,0,0,0)');
      g.globalCompositeOperation = 'destination-in';
      g.fillStyle = fade;
      g.fillRect(0, 0, w, h);
    })
  );

  // the staircase's light rig: a warm fill and one sun, high on one side
  function lightRig(scene, { sky, ground, fill, sun, power, dir, span, small }) {
    scene.add(new THREE.HemisphereLight(sky, ground, fill));
    const light = new THREE.DirectionalLight(sun, power);
    light.castShadow = true;
    light.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
    Object.assign(light.shadow.camera, { left: -span, right: span, top: span, bottom: -span, near: 1, far: 260 });
    light.shadow.bias = -0.0005;
    light.shadow.normalBias = 0.03;
    light.shadow.radius = 4;
    scene.add(light, light.target);
    const d = dir.clone().normalize();
    // keep the shadow frustum centred on wherever the camera is looking
    const follow = (p) => {
      light.target.position.copy(p);
      light.position.copy(p).addScaledVector(d, -120);
    };
    follow(new THREE.Vector3());
    return { light, follow, dir: d };
  }

  // soft parallel shafts of sun, additive, unaffected by fog (as in the stairwell)
  function shafts(scene, { color, dir, at, count = 5, spread = 4, length = 40, width = 2.2, opacity = 0.07 }) {
    const mat = keep(
      new THREE.MeshBasicMaterial({
        map: shaftTex,
        color,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        fog: false,
      })
    );
    const geo = keep(new THREE.PlaneGeometry(1, 1));
    const list = [];
    const d = dir.clone().normalize();
    const across = new THREE.Vector3().crossVectors(d, new THREE.Vector3(0, 1, 0)).normalize();
    for (let i = 0; i < count; i += 1) {
      const m = new THREE.Mesh(geo, mat.clone());
      keep(m.material);
      m.scale.set(width * (0.7 + (i % 2) * 0.6), length, 1);
      const p = at.clone().addScaledVector(across, (i - (count - 1) / 2) * spread);
      m.position.copy(p);
      // stand the plane along the light direction
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().negate());
      m.rotateY(Math.PI / 2);
      scene.add(m);
      list.push(m);
    }
    return list;
  }

  function dust(scene, { box, count, color = '#fff2cc', size = 0.06, opacity = 0.5 }) {
    const r = rng(9);
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      pos[i * 3] = lerp(box.min.x, box.max.x, r());
      pos[i * 3 + 1] = lerp(box.min.y, box.max.y, r());
      pos[i * 3 + 2] = lerp(box.min.z, box.max.z, r());
    }
    const geo = keep(new THREE.BufferGeometry());
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(
      geo,
      keep(
        new THREE.PointsMaterial({
          map: dotTex,
          color,
          size,
          transparent: true,
          opacity,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        })
      )
    );
    scene.add(pts);
    return pts;
  }

  // box instances from a list of {x,y,z,sx,sy,sz,ry?}
  function boxes(scene, list, material, { cast = true, receive = true } = {}) {
    const mesh = new THREE.InstancedMesh(keep(new THREE.BoxGeometry(1, 1, 1)), material, list.length);
    list.forEach((b, i) => {
      dummy.position.set(b.x, b.y, b.z);
      dummy.rotation.set(b.rx || 0, b.ry || 0, b.rz || 0);
      dummy.scale.set(b.sx, b.sy, b.sz);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      if (b.color) mesh.setColorAt(i, new THREE.Color(b.color));
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.castShadow = cast;
    mesh.receiveShadow = receive;
    scene.add(mesh);
    return mesh;
  }

  const mat = (opts) => keep(new THREE.MeshStandardMaterial({ roughness: 0.72, metalness: 0.05, ...opts }));

  return { keep, disposables, dummy, lightRig, shafts, dust, boxes, mat, dotTex };
}

/* ── furniture ────────────────────────────────────────────────
   A Japanese school chair and desk, modelled part by part (steel tube frame, wooden seat,
   back and top) and merged, so hundreds can be instanced: standing in rows in the
   classroom, or stacked and heaped in the cram school. Origins sit on the floor. */

function part(geo, x, y, z, rx = 0, ry = 0, rz = 0) {
  if (rx) geo.rotateX(rx);
  if (ry) geo.rotateY(ry);
  if (rz) geo.rotateZ(rz);
  geo.translate(x, y, z);
  return geo;
}
const tube = (len, r = 0.011) => new THREE.CylinderGeometry(r, r, len, 6);

function chairGeometry() {
  const wood = mergeGeometries([
    part(new THREE.BoxGeometry(0.38, 0.022, 0.36), 0, 0.43, 0.02),
    part(new THREE.BoxGeometry(0.37, 0.19, 0.016), 0, 0.74, -0.165, -0.1),
  ]);
  const metal = mergeGeometries([
    // four legs, back legs carrying on up as the back posts
    ...[
      [-0.17, 0.18],
      [0.17, 0.18],
    ].map(([x, z]) => part(tube(0.42), x, 0.21, z)),
    ...[-0.17, 0.17].map((x) => part(tube(0.86), x, 0.43, -0.155)),
    // rails under the seat and stretchers near the floor
    ...[-0.17, 0.17].map((x) => part(tube(0.34), x, 0.41, 0.01, Math.PI / 2)),
    part(tube(0.34), 0, 0.41, 0.18, 0, 0, Math.PI / 2),
    ...[-0.17, 0.17].map((x) => part(tube(0.34), x, 0.1, 0.01, Math.PI / 2)),
  ]);
  return { wood, metal };
}

function deskGeometry() {
  const wood = mergeGeometries([part(new THREE.BoxGeometry(0.65, 0.026, 0.45), 0, 0.705, 0)]);
  const metal = mergeGeometries([
    // the frame: four legs, side rails, foot rails
    ...[
      [-0.3, -0.2],
      [0.3, -0.2],
      [-0.3, 0.2],
      [0.3, 0.2],
    ].map(([x, z]) => part(tube(0.69, 0.012), x, 0.345, z)),
    ...[-0.3, 0.3].map((x) => part(tube(0.4), x, 0.08, 0, Math.PI / 2)),
    ...[-0.3, 0.3].map((x) => part(tube(0.4), x, 0.64, 0, Math.PI / 2)),
    // the box under the top, where the books go
    part(new THREE.BoxGeometry(0.58, 0.01, 0.36), 0, 0.585, -0.02),
    part(new THREE.BoxGeometry(0.58, 0.1, 0.01), 0, 0.635, -0.2),
    ...[-0.29, 0.29].map((x) => part(new THREE.BoxGeometry(0.01, 0.1, 0.36), x, 0.635, -0.02)),
    // the bag hook
    part(new THREE.BoxGeometry(0.012, 0.05, 0.03), 0.33, 0.66, 0.1),
  ]);
  return { wood, metal };
}

// both halves of a piece of furniture, instanced with the same transforms
function furniture(scene, kit, geos, mats, list) {
  const meshes = ['wood', 'metal'].map((k) => {
    kit.keep(geos[k]);
    const m = new THREE.InstancedMesh(geos[k], mats[k], list.length);
    list.forEach((t, i) => {
      kit.dummy.position.set(t.x, t.y || 0, t.z);
      kit.dummy.rotation.set(t.rx || 0, t.ry || 0, t.rz || 0);
      kit.dummy.scale.set(1, 1, 1);
      kit.dummy.updateMatrix();
      m.setMatrixAt(i, kit.dummy.matrix);
    });
    m.castShadow = true;
    m.receiveShadow = true;
    scene.add(m);
    return m;
  });
  return meshes;
}

// a sagging wire between two points, as a thin tube
function wire(a, b, sag) {
  const mid = a.clone().lerp(b, 0.5);
  mid.y -= sag;
  const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
  return new THREE.TubeGeometry(curve, 24, 0.014, 4, false);
}

/* ── SUMMER · the crossing ────────────────────────────────────
   The level crossing at Iogi on the Seibu Shinjuku Line, the railway the series draws its
   crossings from. Units are metres. The tracks (a double line) run along x; the road crosses
   them along z. The camera stands in the road looking up at the crossing machine, its
   crossbuck against the summer sky, its two red lamps alternating, the arrows lit and the
   barrier down while a yellow 2000-series train runs through, left to right. */

const SUMMER = {
  haze: '#d8e6f4',
  skyTop: '#0f47c2', // the staircase's last colour
  sun: '#fff3d6',
  track: [-2.1, 2.1],
  road: 7,
};

function trainSideTexture() {
  // a Seibu 2000-series car side: yellow body, four doors, dark window band
  return canvasTexture(2048, 256, (g, w, h) => {
    g.fillStyle = '#f2c01c';
    g.fillRect(0, 0, w, h);
    const doorW = 96;
    const doors = [0.1, 0.36, 0.62, 0.88].map((t) => t * w);
    g.fillStyle = '#25303a';
    for (let i = 0; i < doors.length - 1; i += 1) {
      const a = doors[i] + doorW / 2 + 24;
      const b = doors[i + 1] - doorW / 2 - 24;
      const ww = (b - a) / 2;
      for (let k = 0; k < 2; k += 1) g.fillRect(a + k * ww + 6, 46, ww - 12, 86);
    }
    g.fillRect(14, 50, doors[0] - doorW / 2 - 40, 80);
    g.fillRect(doors[3] + doorW / 2 + 26, 50, w - doors[3] - doorW / 2 - 40, 80);
    doors.forEach((x) => {
      g.strokeStyle = '#8a6a0c';
      g.lineWidth = 6;
      g.strokeRect(x - doorW / 2, 30, doorW, h - 50);
      g.beginPath();
      g.moveTo(x, 30);
      g.lineTo(x, h - 20);
      g.stroke();
      g.fillStyle = '#25303a';
      g.fillRect(x - doorW / 2 + 10, 50, doorW / 2 - 16, 74);
      g.fillRect(x + 6, 50, doorW / 2 - 16, 74);
    });
    g.fillStyle = 'rgba(190, 215, 245, 0.18)';
    for (let x = 30; x < w; x += 140) {
      g.beginPath();
      g.moveTo(x, 132);
      g.lineTo(x + 40, 46);
      g.lineTo(x + 70, 46);
      g.lineTo(x + 30, 132);
      g.fill();
    }
    g.fillStyle = '#b48b10';
    g.fillRect(0, h - 22, w, 22);
  });
}

function stripeTexture(a = '#f2c01c', b = '#16130f', n = 8) {
  return canvasTexture(256, 32, (g, w, h) => {
    const step = w / n;
    for (let i = -1; i <= n + 1; i += 1) {
      g.fillStyle = i % 2 === 0 ? a : b;
      g.beginPath();
      g.moveTo(i * step, 0);
      g.lineTo((i + 1) * step, 0);
      g.lineTo((i + 1) * step + h, h);
      g.lineTo(i * step + h, h);
      g.fill();
    }
  });
}

function arrowTexture() {
  // the direction indicator: a black face with two arrows; the lit one shows the train's way
  return canvasTexture(256, 96, (g, w, h) => {
    g.fillStyle = '#121212';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffb21e';
    const arrow = (cx, dir) => {
      g.beginPath();
      g.moveTo(cx + dir * 44, h / 2);
      g.lineTo(cx - dir * 4, h / 2 - 30);
      g.lineTo(cx - dir * 4, h / 2 - 12);
      g.lineTo(cx - dir * 40, h / 2 - 12);
      g.lineTo(cx - dir * 40, h / 2 + 12);
      g.lineTo(cx - dir * 4, h / 2 + 12);
      g.lineTo(cx - dir * 4, h / 2 + 30);
      g.fill();
    };
    arrow(w * 0.75, 1);
    g.fillStyle = '#3a2a10';
    arrow(w * 0.25, -1);
  });
}

function cloudTexture(seed) {
  const r = rng(seed);
  return canvasTexture(512, 256, (g, w, h) => {
    // flat-bottomed summer cumulus, as the series draws them: soft top, cut base
    for (let i = 0; i < 9; i += 1) {
      const x = 90 + r() * (w - 180);
      const y = 120 + r() * 50;
      const rad = 50 + r() * 70;
      const grad = g.createRadialGradient(x, y, rad * 0.2, x, y, rad);
      grad.addColorStop(0, 'rgba(255,255,255,0.95)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grad;
      g.beginPath();
      g.arc(x, y, rad, 0, Math.PI * 2);
      g.fill();
    }
    g.globalCompositeOperation = 'destination-out';
    g.fillRect(0, 196, w, h);
  });
}

function buildSummer(kit, small) {
  const { mat, boxes, keep } = kit;
  const scene = new THREE.Scene();
  const haze = new THREE.Color(SUMMER.haze);
  scene.background = haze.clone();
  scene.fog = new THREE.FogExp2(haze.clone(), 0.006);
  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 900);

  // the sky: the staircase's blue at the top, paling to haze at the horizon, and clouds
  const skyTex = keep(
    canvasTexture(4, 512, (g, w, h) => {
      const grad = g.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, SUMMER.skyTop);
      grad.addColorStop(0.3, '#2f6fd4');
      grad.addColorStop(0.47, '#9cc2ee');
      grad.addColorStop(0.53, SUMMER.haze);
      grad.addColorStop(1, SUMMER.haze);
      g.fillStyle = grad;
      g.fillRect(0, 0, w, h);
    })
  );
  scene.add(new THREE.Mesh(keep(new THREE.SphereGeometry(500, 32, 16)), keep(new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false, depthWrite: false }))));
  const cr = rng(5);
  for (let i = 0; i < 7; i += 1) {
    const ang = -0.9 + i * 0.32 + cr() * 0.1;
    const cloud = new THREE.Mesh(
      keep(new THREE.PlaneGeometry(1, 1)),
      keep(new THREE.MeshBasicMaterial({ map: keep(cloudTexture(10 + i)), transparent: true, fog: false, depthWrite: false, opacity: 0.92 }))
    );
    const d = 380;
    cloud.position.set(Math.sin(ang) * d, 70 + cr() * 90, -Math.cos(ang) * d);
    cloud.scale.set(170 + cr() * 120, 85 + cr() * 50, 1);
    cloud.lookAt(0, cloud.position.y, 0);
    scene.add(cloud);
  }

  const rig = kit.lightRig(scene, {
    sky: '#e4efff',
    ground: '#b7a27a',
    fill: 0.85,
    sun: SUMMER.sun,
    power: 2.7,
    dir: new THREE.Vector3(-0.45, -1, -0.65),
    span: 45,
    small,
  });

  const ground = new THREE.Mesh(keep(new THREE.PlaneGeometry(900, 900)), mat({ color: '#bdb39d', roughness: 0.95 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // the road, its edge lines and the stop lines either side of the crossing
  const R = SUMMER.road;
  boxes(scene, [{ x: 0, y: 0.03, z: 0, sx: R, sy: 0.06, sz: 240 }], mat({ color: '#4d4c52', roughness: 0.92 }), { cast: false });
  boxes(
    scene,
    [
      { x: -R / 2 + 0.25, y: 0.065, z: 0, sx: 0.15, sy: 0.01, sz: 240 },
      { x: R / 2 - 0.25, y: 0.065, z: 0, sx: 0.15, sy: 0.01, sz: 240 },
      { x: R / 4, y: 0.065, z: 7.2, sx: R / 2 - 0.4, sy: 0.01, sz: 0.45 },
      { x: -R / 4, y: 0.065, z: -7.2, sx: R / 2 - 0.4, sy: 0.01, sz: 0.45 },
    ],
    mat({ color: '#f4f2ea', roughness: 0.6 }),
    { cast: false }
  );

  // the double track: ballast, sleepers, rails, and the rubber crossing panels in the road
  const L = 400;
  boxes(scene, SUMMER.track.map((z) => ({ x: 0, y: 0.15, z, sx: L, sy: 0.3, sz: 3.2 })), mat({ color: '#8f877a', roughness: 1 }), { cast: false });
  const sleepers = [];
  SUMMER.track.forEach((z) => {
    for (let x = -L / 2; x < L / 2; x += 0.62) if (Math.abs(x) > R / 2) sleepers.push({ x, y: 0.34, z, sx: 0.22, sy: 0.12, sz: 2.1 });
  });
  boxes(scene, sleepers, mat({ color: '#a7a196', roughness: 0.9 }), { cast: false });
  const rails = [];
  SUMMER.track.forEach((z) => [-0.534, 0.534].forEach((o) => rails.push({ x: 0, y: 0.47, z: z + o, sx: L, sy: 0.15, sz: 0.07 })));
  boxes(scene, rails, mat({ color: '#6b655d', roughness: 0.35, metalness: 0.6 }), { cast: false });
  boxes(
    scene,
    SUMMER.track.map((z) => ({ x: 0, y: 0.45, z, sx: R + 0.6, sy: 0.08, sz: 2.6 })),
    mat({ color: '#55545a', roughness: 0.85 }),
    { cast: false }
  );

  // fences along the line either side of the road
  const fence = [];
  [-4.1, 4.1].forEach((z) => {
    for (let x = R / 2 + 1; x < 120; x += 2.2) [x, -x].forEach((xx) => fence.push({ x: xx, y: 0.6, z, sx: 0.07, sy: 1.2, sz: 0.07 }));
    [1, -1].forEach((s) => fence.push({ x: s * (R / 2 + 60), y: 1.1, z, sx: 118, sy: 0.05, sz: 0.04 }, { x: s * (R / 2 + 60), y: 0.55, z, sx: 118, sy: 0.05, sz: 0.04 }));
  });
  boxes(scene, fence, mat({ color: '#d9d4c6', roughness: 0.6 }));

  /* the crossing machines: one each side of the line, diagonally opposite */
  const stripe = keep(stripeTexture());
  stripe.wrapS = THREE.RepeatWrapping;
  const stripeMat = mat({ map: stripe, roughness: 0.55 });
  const poleStripe = keep(stripeTexture('#f2c01c', '#16130f', 6));
  poleStripe.wrapS = poleStripe.wrapT = THREE.RepeatWrapping;
  poleStripe.repeat.set(1, 3);
  const black = mat({ color: '#141414', roughness: 0.5, metalness: 0.2 });
  const grey = mat({ color: '#b9bcbf', roughness: 0.45, metalness: 0.4 });
  const arrowTex = keep(arrowTexture());
  const lamps = [];
  const arrows = [];
  const barriers = [];
  const machine = (x, z, facing) => {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = facing;
    // the pole, striped at the bottom, grey above, the bell on top
    const lower = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.075, 0.075, 1.5, 16)), mat({ map: poleStripe, roughness: 0.55 }));
    lower.position.y = 0.75;
    const upper = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.07, 0.07, 2.9, 16)), grey);
    upper.position.y = 2.95;
    const bell = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.13, 0.11, 0.18, 16)), black);
    bell.position.y = 4.5;
    g.add(lower, upper, bell);
    // the crossbuck
    [0.6, -0.6].forEach((a) => {
      const plate = new THREE.Mesh(keep(new THREE.BoxGeometry(1.55, 0.21, 0.025)), [black, black, black, black, stripeMat, stripeMat]);
      plate.position.set(0, 3.95, 0.09);
      plate.rotation.z = a;
      g.add(plate);
    });
    // the lamp bar: two red lamps on black discs, under hoods, facing both ways
    const bar = new THREE.Mesh(keep(new THREE.BoxGeometry(1.2, 0.08, 0.06)), black);
    bar.position.y = 3.15;
    g.add(bar);
    [-0.4, 0.4].forEach((o, k) => {
      [1, -1].forEach((side) => {
        const back = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.27, 0.27, 0.03, 28)), black);
        back.rotation.x = Math.PI / 2;
        back.position.set(o, 3.15, side * 0.06);
        const lens = new THREE.Mesh(
          keep(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 28)),
          keep(new THREE.MeshStandardMaterial({ color: '#4a0b0d', emissive: '#ff2b20', emissiveIntensity: 0, roughness: 0.3 }))
        );
        lens.rotation.x = Math.PI / 2;
        lens.position.set(o, 3.15, side * 0.1);
        const hood = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.18, 0.18, 0.2, 20, 1, true, -Math.PI / 2, Math.PI)), black);
        hood.rotation.x = Math.PI / 2;
        hood.position.set(o, 3.15, side * 0.2);
        g.add(back, lens, hood);
        lamps.push({ mesh: lens, phase: k });
      });
    });
    // the direction indicator under the lamps
    const ind = new THREE.Mesh(keep(new THREE.BoxGeometry(0.62, 0.24, 0.1)), [black, black, black, black, keep(new THREE.MeshStandardMaterial({ map: arrowTex, emissive: '#ffffff', emissiveMap: arrowTex, emissiveIntensity: 0, roughness: 0.5 })), black]);
    ind.position.set(0, 2.62, 0.05);
    g.add(ind);
    arrows.push(ind.material[4]);
    // the barrier machine and its arm, which drops across the road
    const box = new THREE.Mesh(keep(new THREE.BoxGeometry(0.32, 0.85, 0.36)), stripeMat);
    box.position.set(0.3, 0.43, 0);
    g.add(box);
    const pivot = new THREE.Group();
    pivot.position.set(0.3, 0.9, 0.22);
    const arm = new THREE.Mesh(keep(new THREE.BoxGeometry(3.6, 0.08, 0.08)), stripeMat);
    arm.position.x = 1.8;
    arm.castShadow = true;
    pivot.add(arm);
    g.add(pivot);
    barriers.push(pivot);
    g.traverse((m) => {
      if (m.isMesh) m.castShadow = true;
    });
    scene.add(g);
  };
  // the near machine stands on the right of the road, before the line; the far one opposite
  machine(R / 2 + 0.55, 4.5, Math.PI);
  machine(-R / 2 - 0.55, -4.5, 0);

  // a home signal down the line
  boxes(scene, [{ x: 18, y: 2.6, z: -4.4, sx: 0.16, sy: 5.2, sz: 0.16 }], grey);
  boxes(scene, [{ x: 18, y: 4.9, z: -4.25, sx: 0.36, sy: 1.15, sz: 0.24 }], black);
  [0, 1, 2].forEach((k) =>
    boxes(
      scene,
      [{ x: 18, y: 5.25 - k * 0.34, z: -4.12, sx: 0.18, sy: 0.18, sz: 0.04 }],
      mat({ color: ['#1a3a1a', '#3a2a0a', '#2a0a0a'][k], emissive: ['#38ff7a', '#ffb21e', '#ff2b20'][k], emissiveIntensity: k === 0 ? 1.6 : 0 }),
      { cast: false }
    )
  );

  // catenary: masts either side of the line, girders across, wires over each track
  const masts = [];
  const beams = [];
  for (let x = -150; x <= 150; x += 30) {
    if (Math.abs(x) < 6) continue;
    [-4.9, 4.9].forEach((z) => masts.push({ x, y: 4.4, z, sx: 0.32, sy: 8.8, sz: 0.32 }));
    beams.push({ x, y: 8.1, z: 0, sx: 0.28, sy: 0.4, sz: 10.2 });
    SUMMER.track.forEach((z) => beams.push({ x, y: 7.0, z, sx: 0.05, sy: 2.0, sz: 0.05 }));
  }
  boxes(scene, masts, mat({ color: '#a8a39a', roughness: 0.8 }));
  boxes(scene, beams, mat({ color: '#6e6b64', roughness: 0.5, metalness: 0.5 }));
  const wireGeos = [];
  SUMMER.track.forEach((z) => {
    wireGeos.push(wire(new THREE.Vector3(-260, 5.4, z), new THREE.Vector3(260, 5.4, z), 0));
    wireGeos.push(wire(new THREE.Vector3(-260, 6.6, z), new THREE.Vector3(260, 6.6, z), 0));
  });
  [-4.9, 4.9].forEach((z) => wireGeos.push(wire(new THREE.Vector3(-260, 8.6, z), new THREE.Vector3(260, 8.6, z), 0)));

  // utility poles along the road, with their transformers, and the wires the series loves
  const poleXs = [R / 2 + 1.2, -R / 2 - 1.2];
  const poleZs = [24, 46, 70, -16, -40];
  const poleList = [];
  const arms = [];
  poleZs.forEach((z, i) => {
    const x = poleXs[i % 2];
    poleList.push({ x, y: 5.5, z, sx: 0.3, sy: 11, sz: 0.3 });
    arms.push({ x, y: 10.2, z, sx: 1.8, sy: 0.12, sz: 0.12 }, { x, y: 9.4, z, sx: 1.4, sy: 0.1, sz: 0.1 });
    if (i % 2 === 0) arms.push({ x: x + 0.35, y: 8.3, z, sx: 0.45, sy: 0.75, sz: 0.45 });
  });
  boxes(scene, poleList, mat({ color: '#a39e95', roughness: 0.85 }));
  boxes(scene, arms, mat({ color: '#5d5a55', roughness: 0.6, metalness: 0.3 }));
  for (let i = 0; i < poleZs.length - 1; i += 1) {
    const a = new THREE.Vector3(poleXs[i % 2], 10.2, poleZs[i]);
    const b = new THREE.Vector3(poleXs[(i + 1) % 2], 10.2, poleZs[i + 1]);
    if (Math.sign(poleZs[i]) !== Math.sign(poleZs[i + 1])) continue;
    [-0.8, 0, 0.8].forEach((o) => wireGeos.push(wire(a.clone().add(new THREE.Vector3(o, 0, 0)), b.clone().add(new THREE.Vector3(o, -0.8 * Math.abs(o), 0)), 0.9 + Math.abs(o) * 0.4)));
  }
  // the long lines over the crossing, from the near poles out along the street and the line
  [
    [new THREE.Vector3(R / 2 + 1.2, 10.1, 24), new THREE.Vector3(-R / 2 - 1.2, 10.1, -16), 1.8],
    [new THREE.Vector3(R / 2 + 1.2, 9.4, 24), new THREE.Vector3(-R / 2 - 1.2, 9.4, -16), 2.3],
    [new THREE.Vector3(R / 2 + 1.2, 10.2, 24), new THREE.Vector3(80, 10.6, 18), 2.6],
    [new THREE.Vector3(-R / 2 - 1.2, 10.2, -16), new THREE.Vector3(-90, 10.4, -20), 2.8],
    [new THREE.Vector3(R / 2 + 1.2, 9.4, 24), new THREE.Vector3(70, 9.6, 30), 2.2],
    [new THREE.Vector3(-R / 2 - 1.2, 9.7, -16), new THREE.Vector3(R / 2 + 1.2, 9.9, 24), 1.4],
  ].forEach(([a, b, s]) => wireGeos.push(wire(a, b, s)));
  const wires = new THREE.Mesh(keep(mergeGeometries(wireGeos)), mat({ color: '#25221f', roughness: 0.6 }));
  wireGeos.forEach((g) => g.dispose());
  scene.add(wires);

  // the town: houses, flats and block walls close along the road and the line
  const r = rng(11);
  const houses = [];
  const roofsH = [];
  for (let i = 0; i < 170; i += 1) {
    const sx = r() < 0.5 ? -1 : 1;
    const sz = r() < 0.5 ? -1 : 1;
    const x = sx * (R / 2 + 6 + r() * 120);
    const z = sz * (9 + r() * 110);
    // keep the sky over the crossing open: nothing tall right beside the road near the line
    const flat = r() < 0.22 && (Math.abs(x) > 24 || Math.abs(z) > 30);
    const w = flat ? 14 + r() * 10 : 7 + r() * 4;
    const d = flat ? 9 : 7 + r() * 3;
    const h = flat ? 9 + r() * 7 : 5.5 + r() * 1.5;
    const tone = ['#efe9dc', '#e2d9c6', '#d8d2c8', '#f3eee4', '#cfc6b4'][Math.floor(r() * 5)];
    houses.push({ x, y: h / 2, z, sx: w, sy: h, sz: d, color: tone });
    if (!flat) roofsH.push({ x, y: h + 0.5, z, sx: w + 0.6, sy: 0.9, sz: d * 0.72, color: ['#5d5a57', '#7a3d2c', '#3f4652'][Math.floor(r() * 3)] });
  }
  boxes(scene, houses, mat({ color: '#ffffff', roughness: 0.9 }));
  boxes(scene, roofsH, mat({ color: '#ffffff', roughness: 0.8 }));
  boxes(
    scene,
    [
      { x: R / 2 + 2.2, y: 0.7, z: 30, sx: 0.12, sy: 1.4, sz: 40 },
      { x: -R / 2 - 2.2, y: 0.7, z: 30, sx: 0.12, sy: 1.4, sz: 40 },
    ],
    mat({ color: '#b8b2a6', roughness: 0.95 })
  );

  // the train: six yellow cars on the far track
  const train = new THREE.Group();
  const side = keep(trainSideTexture());
  const bodyMat = mat({ color: '#f2c01c', roughness: 0.5, metalness: 0.1 });
  const sideMat = mat({ map: side, roughness: 0.45, metalness: 0.1 });
  const roofMat = mat({ color: '#a6a39b', roughness: 0.6 });
  const CAR = 20;
  for (let c = 0; c < 6; c += 1) {
    const body = new THREE.Mesh(keep(new THREE.BoxGeometry(19.5, 3.0, 2.8)), [bodyMat, bodyMat, roofMat, bodyMat, sideMat, sideMat]);
    body.position.set(-c * CAR, 2.75, 0);
    body.castShadow = true;
    train.add(body);
    const skirt = new THREE.Mesh(keep(new THREE.BoxGeometry(19, 0.6, 2.4)), mat({ color: '#2b2a29' }));
    skirt.position.set(-c * CAR, 0.95, 0);
    train.add(skirt);
    if (c % 2 === 0) {
      const panto = new THREE.Mesh(keep(new THREE.BoxGeometry(1.4, 0.9, 1.6)), mat({ color: '#3a3936', wireframe: true }));
      panto.position.set(-c * CAR + 4, 4.7, 0);
      train.add(panto);
    }
  }
  const faceTex = keep(
    canvasTexture(256, 256, (g, w) => {
      g.fillStyle = '#f2c01c';
      g.fillRect(0, 0, w, w);
      g.fillStyle = '#1f2830';
      g.fillRect(24, 34, w - 48, 104);
      g.fillStyle = '#fff6d0';
      [44, w - 44].forEach((x) => {
        g.beginPath();
        g.arc(x, 186, 13, 0, Math.PI * 2);
        g.fill();
      });
    })
  );
  const face = new THREE.Mesh(keep(new THREE.PlaneGeometry(2.8, 3.0)), mat({ map: faceTex, emissive: '#fff2c0', emissiveIntensity: 0.15 }));
  face.rotation.y = Math.PI / 2;
  face.position.set(9.76, 2.75, 0);
  train.add(face);
  train.position.z = SUMMER.track[0];
  scene.add(train);

  kit.shafts(scene, { color: SUMMER.sun, dir: rig.dir, at: new THREE.Vector3(0, 7, 2), count: 5, spread: 7, length: 40, width: 3, opacity: 0.045 });
  kit.dust(scene, { box: new THREE.Box3(new THREE.Vector3(-30, 0.5, -10), new THREE.Vector3(30, 9, 22)), count: small ? 160 : 300, size: 0.09, opacity: 0.35 });

  const look = new THREE.Vector3();
  return {
    scene,
    camera,
    haze,
    density: 0.006,
    place(p, t, still) {
      // standing in the road, walking up to the crossing; the machine on the right, its
      // crossbuck against the sky, the line running across the frame behind it
      // low in the road under the machine, its crossbuck up against the sky
      const z = lerp(10.5, 7.2, p);
      camera.position.set(lerp(0.2, 1.0, p), 1.05, z);
      // on a tall phone screen, aim straight at the machine so it stays in frame
      const narrow = camera.aspect < 1;
      look.set(narrow ? R / 2 + 0.4 : R / 2 - 0.8, lerp(3.9, 4.3, p), narrow ? 3.6 : 2.6);
      camera.lookAt(look);
      camera.rotateZ(-0.04); // the slight Shaft tilt
      rig.follow(new THREE.Vector3(0, 0, 4));
      // the crossing closes for the middle of the walk; one train runs through, left to right
      const closed = p > 0.18 && p < 0.86;
      train.position.x = lerp(-130, 260, smoothstep(0.3, 0.74, p));
      barriers.forEach((pv) => {
        pv.rotation.z = closed ? 0 : Math.PI / 2.15;
      });
      const flash = closed && !still ? Math.floor(t / 520) % 2 : 0;
      lamps.forEach(({ mesh, phase }) => {
        mesh.material.emissiveIntensity = closed ? (phase === flash ? 3.4 : 0.05) : 0;
      });
      arrows.forEach((m) => {
        m.emissiveIntensity = closed ? 1.2 : 0;
      });
      return closed && !still; // keep rendering while the lamps alternate
    },
  };
}

/* ── AUTUMN · the cram school ─────────────────────────────────
   Tange's Metabolist frame (Yamanashi Bunka Kaikan, the cram school of Kizumonogatari): a
   grid of concrete cylinders carrying deep beams and slabs, some slabs gone. The floor is
   given over to chairs, the series' own image of the place: stacked into towers, upside
   down on each other, heaped and tangled. Each project stands by one pile; the camera moves
   between them when the next case is opened. */

function cylinderTexture(seed) {
  const r = rng(seed);
  return canvasTexture(512, 1024, (g, w, h) => {
    g.fillStyle = '#cdbfa6';
    g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 32) {
      g.fillStyle = `rgba(90, 70, 50, ${0.04 + r() * 0.05})`;
      g.fillRect(0, y, w, 2);
    }
    for (let i = 0; i < 26; i += 1) {
      g.fillStyle = `rgba(70, 52, 38, ${0.05 + r() * 0.08})`;
      g.fillRect(r() * w, r() * h * 0.5, 2 + r() * 6, 60 + r() * 300);
    }
    for (let x = 30; x < w; x += 128) {
      for (let y = 40; y < h; y += 256) {
        g.fillStyle = r() < 0.3 ? '#ffd9a0' : '#3a2c22';
        g.fillRect(x, y, 14, 160);
        g.fillRect(x + 26, y, 14, 160);
      }
    }
  });
}

// where the four piles stand on the walked floor (x across, z along the colonnade)
const PILES = [
  [2.6, 15],
  [2.2, 3],
  [3.0, -9],
  [2.4, -21],
];

function chairPile(r, cx, cz, floorY, { count = 90, radius = 2.5, height = 2.8 } = {}) {
  // a heap, not a tower: chairs thrown together every which way, most of them at the base
  // and fewer as it rises, filling a rough cone. Sampling evenly through the cone's volume
  // puts the weight at the bottom, as a real pile has it.
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const f = 1 - Math.cbrt(r()); // height fraction, dense near 0
    const y = f * height;
    const rad = radius * (1 - f) * Math.sqrt(r()) + 0.15;
    const a = r() * Math.PI * 2;
    out.push({
      x: cx + Math.cos(a) * rad * (0.85 + r() * 0.3),
      y: floorY + 0.1 + y,
      z: cz + Math.sin(a) * rad,
      rx: r() * Math.PI * 2,
      ry: r() * Math.PI * 2,
      rz: r() * Math.PI * 2,
    });
  }
  // and a skirt of chairs slid off the pile, lying on the floor around it
  for (let i = 0; i < Math.round(count * 0.3); i += 1) {
    const a = r() * Math.PI * 2;
    const d = radius + 0.2 + r() * 1.4;
    out.push(lying(r, cx + Math.cos(a) * d, cz + Math.sin(a) * d, floorY));
  }
  return out;
}

// a chair lying on the floor: on its side, on its back, or upside down
function lying(r, x, z, floorY) {
  const k = r();
  if (k < 0.4) return { x, y: floorY + 0.19, z, rx: 0, ry: r() * Math.PI * 2, rz: (r() < 0.5 ? 1 : -1) * Math.PI / 2 };
  if (k < 0.75) return { x, y: floorY + 0.2, z, rx: -Math.PI / 2, ry: r() * Math.PI * 2, rz: 0 };
  return { x, y: floorY + 0.86, z, rx: Math.PI, ry: r() * Math.PI * 2, rz: 0 };
}

function buildAutumn(kit, small) {
  const { mat, boxes, keep } = kit;
  const scene = new THREE.Scene();
  const haze = new THREE.Color('#d08a4e');
  scene.background = haze.clone();
  scene.fog = new THREE.FogExp2(haze.clone(), 0.0085);
  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 500);
  const rig = kit.lightRig(scene, {
    sky: '#ffd8ae',
    ground: '#4a2e1a',
    fill: 0.5,
    sun: '#ffb46a',
    power: 3.2,
    dir: new THREE.Vector3(-1, -0.32, 0.38),
    span: 40,
    small,
  });

  const S = 16;
  const R = 2.6;
  const levels = [0, 7, 14, 21];
  const ground = new THREE.Mesh(keep(new THREE.PlaneGeometry(600, 600)), mat({ color: '#6b5440', roughness: 1 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -6;
  ground.receiveShadow = true;
  scene.add(ground);

  const cylTex = keep(cylinderTexture(3));
  cylTex.wrapS = THREE.RepeatWrapping;
  cylTex.repeat.set(2, 2);
  const cylMat = mat({ map: cylTex, color: '#ffffff', roughness: 0.92, emissive: '#ffcf8a', emissiveMap: cylTex, emissiveIntensity: 0.08 });
  const cols = [];
  for (let i = 0; i < 4; i += 1) for (let j = 0; j < 4; j += 1) cols.push([(i - 1.5) * S, (j - 1.5) * S]);
  const cyl = new THREE.InstancedMesh(keep(new THREE.CylinderGeometry(R, R, 44, 40)), cylMat, cols.length);
  cols.forEach(([x, z], k) => {
    kit.dummy.position.set(x, 16, z);
    kit.dummy.rotation.set(0, k, 0);
    kit.dummy.scale.set(1, 1, 1);
    kit.dummy.updateMatrix();
    cyl.setMatrixAt(k, kit.dummy.matrix);
  });
  cyl.castShadow = true;
  cyl.receiveShadow = true;
  scene.add(cyl);

  const r = rng(21);
  const beams = [];
  const slabs = [];
  levels.forEach((y, li) => {
    for (let i = 0; i < 4; i += 1) {
      const c = (i - 1.5) * S;
      beams.push({ x: 0, y: y + 0.9, z: c, sx: S * 3 + 6, sy: 1.8, sz: 0.9 });
      beams.push({ x: c, y: y + 0.9, z: 0, sx: 0.9, sy: 1.8, sz: S * 3 + 6 });
    }
    for (let i = 0; i < 3; i += 1) {
      for (let j = 0; j < 3; j += 1) {
        const keepIt = li === 2 ? i === 1 || r() < 0.6 : r() < 0.55;
        if (!keepIt) continue;
        slabs.push({ x: (i - 1) * S, y: y + 1.85, z: (j - 1) * S, sx: S - 1, sy: 0.4, sz: S - 1 });
      }
    }
  });
  boxes(scene, beams, mat({ color: '#c4b398', roughness: 0.9 }));
  boxes(scene, slabs, mat({ color: '#b9a88e', roughness: 0.95 }));

  // the chairs: a big pile by each project, chairs lying all over the floor between them,
  // and more piles across the void on the other floors' edges
  const floorY = levels[2] + 2.05;
  const rr = rng(33);
  const chairs = [];
  const n = small ? 0.6 : 1;
  PILES.forEach(([x, z]) => chairs.push(...chairPile(rr, x, z, floorY, { count: Math.round(95 * n), radius: 2.6, height: 3.0 })));
  for (let i = 0; i < Math.round(160 * n); i += 1) {
    const x = lerp(-7.2, 7.2, rr());
    const z = lerp(-27, 27, rr());
    // leave the spots the camera stands on clear
    if (PILES.some(([px, pz]) => Math.hypot(x - (px - 4.6), z - (pz + 6.4)) < 1.4)) continue;
    chairs.push(rr() < 0.82 ? lying(rr, x, z, floorY) : { x, y: floorY, z, ry: rr() * Math.PI * 2 });
  }
  [-15, 15].forEach((x) => {
    for (let k = 0; k < 4; k += 1) chairs.push(...chairPile(rr, x + (rr() - 0.5) * 3, lerp(-18, 18, k / 3), floorY, { count: Math.round(60 * n), radius: 2.4, height: 2.6 }));
  });
  furniture(scene, kit, chairGeometry(), { wood: mat({ color: '#9a7448', roughness: 0.65 }), metal: mat({ color: '#5a5550', roughness: 0.4, metalness: 0.6 }) }, chairs);

  // Fuji, pale in the far haze, as it is seen from the cram school in Kizumonogatari
  const fuji = new THREE.Mesh(keep(new THREE.ConeGeometry(160, 70, 48, 1, true)), keep(new THREE.MeshBasicMaterial({ color: '#d79a68', fog: false, transparent: true, opacity: 0.55 })));
  fuji.position.set(-300, 20, 60);
  scene.add(fuji);
  const cap = new THREE.Mesh(keep(new THREE.ConeGeometry(48, 21, 48, 1, true)), keep(new THREE.MeshBasicMaterial({ color: '#f4dcc4', fog: false, transparent: true, opacity: 0.6 })));
  cap.position.set(-300, 44.6, 60);
  scene.add(cap);

  kit.shafts(scene, { color: '#ffc58a', dir: rig.dir, at: new THREE.Vector3(0, floorY + 4, 0), count: 6, spread: 6, length: 38, width: 2.6, opacity: 0.08 });
  kit.dust(scene, { box: new THREE.Box3(new THREE.Vector3(-9, floorY, -26), new THREE.Vector3(9, floorY + 6, 26)), count: small ? 180 : 320, size: 0.06, color: '#ffd9a8', opacity: 0.5 });

  // the camera stands a few metres from the chosen pile, the pile to the right of centre
  let aim = 0;
  const at = new THREE.Vector3();
  const goalPos = new THREE.Vector3();
  const goalLook = new THREE.Vector3();
  const look = new THREE.Vector3();
  let first = true;
  return {
    scene,
    camera,
    haze,
    density: 0.0085,
    aim(i) {
      aim = Math.max(0, Math.min(PILES.length - 1, i));
    },
    place(p, t, still) {
      const [px, pz] = PILES[aim];
      const drift = (p - 0.5) * 1.2;
      goalPos.set(px - 4.6, floorY + 1.65, pz + 6.4 + drift);
      // the pile right of centre on a wide screen, dead centre on a tall one
      goalLook.set(camera.aspect < 1 ? px + 0.2 : px - 1.5, floorY + (camera.aspect < 1 ? 1.2 : 1.7), pz - 0.5);
      const k = first || still ? 1 : 0.08;
      first = false;
      at.lerp(goalPos, k);
      look.lerp(goalLook, k);
      camera.position.copy(at);
      camera.lookAt(look);
      camera.rotateZ(0.035);
      rig.follow(look);
      return at.distanceTo(goalPos) > 0.01;
    },
  };
}

/* ── WINTER · the classroom ───────────────────────────────────
   A Naoetsu High classroom, complete: desks and chairs in rows standing on their own legs,
   the dais and lectern, a framed blackboard with its chalk tray and clock, lockers at the
   back, sliding doors and transom windows on the corridor side, a wall of aluminium sashes
   with gathered curtains on the other, fluorescent fittings in the ceiling. A low winter
   sun comes through the sashes and lays their frames across the desks. */

function blackboardTexture(groups) {
  return canvasTexture(2048, 560, (g, w, h) => {
    g.fillStyle = '#26352e';
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i += 1) {
      g.fillStyle = `rgba(255,255,255,${0.012 + (i % 3) * 0.006})`;
      g.beginPath();
      g.ellipse((i * 137) % w, (i * 71) % h, 160, 40, 0.2, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = 'rgba(238,241,234,0.92)';
    const colW = w / Math.max(1, groups.length);
    const pad = 46;
    // each heading and line is fitted to its own column, so nothing runs into the next
    const fit = (text, weight, size, family, max) => {
      let s = size;
      g.font = `${weight} ${s}px ${family}`;
      while (g.measureText(text).width > max && s > 18) {
        s -= 2;
        g.font = `${weight} ${s}px ${family}`;
      }
    };
    groups.forEach((grp, i) => {
      const x = i * colW + pad;
      const max = colW - pad * 2;
      fit(grp.title, 800, 54, SERIF, max);
      g.fillText(grp.title, x, 108);
      g.fillRect(x, 128, max, 3);
      grp.items.slice(0, 7).forEach((it, k) => {
        fit(it, 400, 32, SANS, max);
        g.fillText(it, x, 188 + k * 48);
      });
      if (i > 0) {
        g.fillStyle = 'rgba(238,241,234,0.18)';
        g.fillRect(i * colW, 70, 2, h - 120);
        g.fillStyle = 'rgba(238,241,234,0.92)';
      }
    });
  });
}

function clockTexture() {
  return canvasTexture(256, 256, (g, w) => {
    const c = w / 2;
    g.fillStyle = '#f7f5ef';
    g.beginPath();
    g.arc(c, c, c - 4, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#1c1c1c';
    g.lineWidth = 10;
    g.stroke();
    for (let i = 0; i < 12; i += 1) {
      const a = (i / 12) * Math.PI * 2;
      g.fillStyle = '#1c1c1c';
      g.save();
      g.translate(c + Math.sin(a) * (c - 26), c - Math.cos(a) * (c - 26));
      g.rotate(a);
      g.fillRect(-3, -10, 6, 20);
      g.restore();
    }
    // a little after four in the afternoon, with the winter light already low
    const hand = (a, len, wd) => {
      g.save();
      g.translate(c, c);
      g.rotate(a);
      g.fillRect(-wd / 2, -len, wd, len + 10);
      g.restore();
    };
    hand((4.2 / 12) * Math.PI * 2, 62, 10);
    hand((2 / 12) * Math.PI * 2, 92, 6);
  });
}

function buildWinter(kit, small, info) {
  const { mat, boxes, keep } = kit;
  const scene = new THREE.Scene();
  const haze = new THREE.Color('#dfe6ef');
  scene.background = new THREE.Color('#f1f5fa');
  scene.fog = new THREE.FogExp2(haze.clone(), 0.01);
  const camera = new THREE.PerspectiveCamera(54, 1, 0.05, 200);
  const rig = kit.lightRig(scene, {
    sky: '#dfe8f6',
    ground: '#7a6a54',
    fill: 0.62,
    sun: '#fff0d8',
    power: 2.9,
    dir: new THREE.Vector3(-1, -0.36, -0.42),
    span: 14,
    small,
  });

  const W = 8.4;
  const D = 14;
  const H = 3.2;
  const F = -D / 2; // the front wall, with the blackboard
  const B = D / 2; // the back wall, with the lockers
  // floor: varnished planks
  const floorTex = keep(
    canvasTexture(512, 512, (g, w, h) => {
      g.fillStyle = '#ad8a5d';
      g.fillRect(0, 0, w, h);
      const r = rng(5);
      for (let x = 0; x < w; x += 32) {
        g.fillStyle = `rgba(60,40,20,${0.08 + r() * 0.1})`;
        g.fillRect(x, 0, 2, h);
        for (let y = r() * 200; y < h; y += 180 + r() * 120) g.fillRect(x, y, 32, 2);
      }
    })
  );
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(4, 7);
  const floor = new THREE.Mesh(keep(new THREE.PlaneGeometry(W, D)), mat({ map: floorTex, roughness: 0.45 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  // ceiling: acoustic tiles in a grid
  const ceilTex = keep(
    canvasTexture(256, 256, (g, w) => {
      g.fillStyle = '#f2f0ea';
      g.fillRect(0, 0, w, w);
      g.fillStyle = '#d6d2c8';
      g.fillRect(0, 0, w, 3);
      g.fillRect(0, 0, 3, w);
      const r = rng(2);
      g.fillStyle = 'rgba(120,110,100,0.18)';
      for (let i = 0; i < 260; i += 1) g.fillRect(r() * w, r() * w, 2, 2);
    })
  );
  ceilTex.wrapS = ceilTex.wrapT = THREE.RepeatWrapping;
  ceilTex.repeat.set(W / 0.9, D / 0.9);
  const ceil = new THREE.Mesh(keep(new THREE.PlaneGeometry(W, D)), mat({ map: ceilTex, roughness: 0.95 }));
  ceil.rotation.x = Math.PI / 2;
  ceil.position.y = H;
  scene.add(ceil);

  // walls: cream plaster above a wooden wainscot
  const plaster = mat({ color: '#ece6d8', roughness: 0.92 });
  const wainscot = mat({ color: '#8c6a44', roughness: 0.7 });
  boxes(
    scene,
    [
      { x: -W / 2 - 0.1, y: H / 2, z: 0, sx: 0.2, sy: H, sz: D },
      { x: 0, y: H / 2, z: F - 0.1, sx: W, sy: H, sz: 0.2 },
      { x: 0, y: H / 2, z: B + 0.1, sx: W, sy: H, sz: 0.2 },
      { x: W / 2 + 0.1, y: 0.45, z: 0, sx: 0.2, sy: 0.9, sz: D },
      { x: W / 2 + 0.1, y: H - 0.2, z: 0, sx: 0.2, sy: 0.4, sz: D },
    ],
    plaster
  );
  boxes(
    scene,
    [
      { x: -W / 2 + 0.01, y: 0.45, z: 0, sx: 0.03, sy: 0.9, sz: D },
      { x: 0, y: 0.45, z: B - 0.01, sx: W, sy: 0.9, sz: 0.03 },
      { x: W / 2 - 0.01, y: 0.45, z: 0, sx: 0.03, sy: 0.9, sz: D },
    ],
    wainscot
  );
  // the window wall: pillars, aluminium sashes (four to a bay), transoms, sill and glass
  const alu = mat({ color: '#c9ccce', roughness: 0.35, metalness: 0.55 });
  const sash = [];
  const bays = [F, F + D / 3, F + (2 * D) / 3, B];
  bays.forEach((z) => sash.push({ x: W / 2 + 0.05, y: H / 2, z, sx: 0.3, sy: H, sz: 0.35 }));
  boxes(scene, sash, plaster);
  const frames = [];
  for (let b = 0; b < 3; b += 1) {
    const z0 = bays[b] + 0.18;
    const z1 = bays[b + 1] - 0.18;
    for (let k = 0; k <= 4; k += 1) frames.push({ x: W / 2 + 0.02, y: 1.65, z: lerp(z0, z1, k / 4), sx: 0.05, sy: 1.5, sz: 0.05 });
    frames.push({ x: W / 2 + 0.02, y: 2.42, z: (z0 + z1) / 2, sx: 0.06, sy: 0.06, sz: z1 - z0 });
    for (let k = 0; k <= 2; k += 1) frames.push({ x: W / 2 + 0.02, y: 2.68, z: lerp(z0, z1, k / 2), sx: 0.04, sy: 0.5, sz: 0.04 });
  }
  frames.push({ x: W / 2 - 0.08, y: 0.92, z: 0, sx: 0.28, sy: 0.05, sz: D });
  boxes(scene, frames, alu);
  const glass = new THREE.Mesh(keep(new THREE.PlaneGeometry(D, 2.05)), keep(new THREE.MeshStandardMaterial({ color: '#dfeaf5', transparent: true, opacity: 0.1, roughness: 0.1, depthWrite: false })));
  glass.rotation.y = -Math.PI / 2;
  glass.position.set(W / 2 + 0.03, 1.92, 0);
  scene.add(glass);
  // curtains gathered at each pillar, on a rail
  const curtainTex = keep(
    canvasTexture(64, 256, (g, w, h) => {
      for (let x = 0; x < w; x += 1) {
        const v = 200 + Math.sin(x * 0.6) * 22;
        g.fillStyle = `rgb(${v + 20}, ${v + 8}, ${v - 20})`;
        g.fillRect(x, 0, 1, h);
      }
    })
  );
  const curtainMat = mat({ map: curtainTex, roughness: 0.95 });
  const curtains = [];
  bays.forEach((z, i) => {
    if (i > 0) curtains.push({ x: W / 2 - 0.12, y: 1.75, z: z - 0.32, sx: 0.14, sy: 2.3, sz: 0.36 });
    if (i < bays.length - 1) curtains.push({ x: W / 2 - 0.12, y: 1.75, z: z + 0.32, sx: 0.14, sy: 2.3, sz: 0.36 });
  });
  boxes(scene, curtains, curtainMat);
  boxes(scene, [{ x: W / 2 - 0.12, y: 2.93, z: 0, sx: 0.04, sy: 0.04, sz: D }], alu);
  // the corridor wall: two sliding doors with their windows, transom windows above
  const doorMat = mat({ color: '#9a7a52', roughness: 0.6 });
  [F + 1.1, B - 1.1].forEach((z) => {
    boxes(scene, [{ x: -W / 2 + 0.03, y: 1.0, z, sx: 0.05, sy: 2.0, sz: 0.9 }], doorMat);
    boxes(scene, [{ x: -W / 2 + 0.06, y: 1.45, z, sx: 0.02, sy: 0.6, sz: 0.6 }], keep(new THREE.MeshStandardMaterial({ color: '#d5e0ea', emissive: '#e8f0f8', emissiveIntensity: 0.5, roughness: 0.2 })));
  });
  const transom = [];
  for (let z = F + 0.6; z < B - 0.4; z += 1.15) transom.push({ x: -W / 2 + 0.04, y: 2.6, z, sx: 0.03, sy: 0.42, sz: 0.95 });
  boxes(scene, transom, keep(new THREE.MeshStandardMaterial({ color: '#dfe8f0', emissive: '#eef4fa', emissiveIntensity: 0.45, roughness: 0.2 })), { cast: false });
  // the front: dais, lectern, framed blackboard with chalk tray, clock, speaker, notice board
  boxes(scene, [{ x: 0, y: 0.09, z: F + 0.7, sx: W, sy: 0.18, sz: 1.4 }], mat({ color: '#7d5f3e', roughness: 0.6 }));
  boxes(scene, [{ x: 0, y: 0.18 + 0.5, z: F + 1.2, sx: 0.95, sy: 1.0, sz: 0.5 }], mat({ color: '#8a6a45', roughness: 0.6 }));
  const bbTex = keep(blackboardTexture(info.skills));
  const board = new THREE.Mesh(keep(new THREE.PlaneGeometry(5.6, 1.54)), mat({ map: bbTex, emissive: '#ffffff', emissiveMap: bbTex, emissiveIntensity: 0.07, roughness: 0.85 }));
  board.position.set(0, 1.78, F + 0.03);
  scene.add(board);
  boxes(
    scene,
    [
      { x: 0, y: 2.57, z: F + 0.04, sx: 5.72, sy: 0.05, sz: 0.05 },
      { x: 0, y: 1.0, z: F + 0.09, sx: 5.72, sy: 0.04, sz: 0.14 },
      { x: -2.84, y: 1.78, z: F + 0.04, sx: 0.05, sy: 1.62, sz: 0.05 },
      { x: 2.84, y: 1.78, z: F + 0.04, sx: 0.05, sy: 1.62, sz: 0.05 },
    ],
    alu
  );
  boxes(
    scene,
    [
      { x: -1.6, y: 1.04, z: F + 0.1, sx: 0.12, sy: 0.04, sz: 0.05, color: '#3a3a3a' },
      { x: 1.9, y: 1.04, z: F + 0.1, sx: 0.12, sy: 0.04, sz: 0.05, color: '#3a3a3a' },
      { x: -0.4, y: 1.03, z: F + 0.11, sx: 0.07, sy: 0.012, sz: 0.012, color: '#ffffff' },
      { x: -0.28, y: 1.03, z: F + 0.11, sx: 0.07, sy: 0.012, sz: 0.012, color: '#f4e04a' },
      { x: -0.16, y: 1.03, z: F + 0.11, sx: 0.07, sy: 0.012, sz: 0.012, color: '#e05050' },
    ],
    mat({ color: '#ffffff', roughness: 0.8 }),
    { cast: false }
  );
  const clock = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 40)), [mat({ color: '#2a2a2a' }), mat({ map: keep(clockTexture()), roughness: 0.5 }), mat({ color: '#2a2a2a' })]);
  clock.rotation.x = Math.PI / 2;
  clock.position.set(0, 2.84, F + 0.04);
  scene.add(clock);
  boxes(scene, [{ x: -3.6, y: 2.8, z: F + 0.15, sx: 0.4, sy: 0.3, sz: 0.25 }], mat({ color: '#e6e2d8', roughness: 0.7 }));
  const notices = keep(
    canvasTexture(256, 256, (g, w) => {
      g.fillStyle = '#a87c4f';
      g.fillRect(0, 0, w, w);
      const r = rng(8);
      for (let i = 0; i < 7; i += 1) {
        g.fillStyle = ['#f7f4ec', '#f2ecd8', '#e8eef4'][i % 3];
        g.fillRect(14 + r() * 150, 14 + r() * 150, 60 + r() * 40, 70 + r() * 30);
      }
    })
  );
  const nb = new THREE.Mesh(keep(new THREE.PlaneGeometry(1.0, 1.0)), mat({ map: notices }));
  nb.position.set(-3.5, 1.7, F + 0.02);
  scene.add(nb);
  // the back: a row of lockers, two tiers of cubbies, and a smaller board above
  const cub = [];
  for (let k = 0; k < 14; k += 1) {
    const x = -W / 2 + 0.3 + k * ((W - 0.6) / 13);
    cub.push({ x, y: 0.55, z: B - 0.25, sx: 0.03, sy: 1.1, sz: 0.5 });
  }
  cub.push({ x: 0, y: 0.02, z: B - 0.25, sx: W - 0.5, sy: 0.04, sz: 0.5 }, { x: 0, y: 0.55, z: B - 0.25, sx: W - 0.5, sy: 0.03, sz: 0.5 }, { x: 0, y: 1.1, z: B - 0.25, sx: W - 0.5, sy: 0.04, sz: 0.52 });
  boxes(scene, cub, mat({ color: '#b08c60', roughness: 0.65 }));
  boxes(scene, [{ x: 0, y: 1.9, z: B - 0.03, sx: 3.4, sy: 1.0, sz: 0.04 }], mat({ color: '#2e3d36', roughness: 0.85 }));
  // ceiling fittings: two tubes under a white housing with end caps, in rows
  const housings = [];
  const tubes = [];
  for (let z = F + 2; z < B - 1; z += 2.6) {
    [-2, 2].forEach((x) => {
      housings.push({ x, y: H - 0.05, z, sx: 0.28, sy: 0.07, sz: 1.32 });
      tubes.push({ x: x - 0.06, y: H - 0.11, z, sx: 0.035, sy: 0.035, sz: 1.22 }, { x: x + 0.06, y: H - 0.11, z, sx: 0.035, sy: 0.035, sz: 1.22 });
    });
  }
  boxes(scene, housings, mat({ color: '#f4f4f0', roughness: 0.5 }), { cast: false });
  boxes(scene, tubes, mat({ color: '#ffffff', emissive: '#f2f7ff', emissiveIntensity: 0.55 }), { cast: false });

  // the desks and chairs: six by six, each chair standing behind its desk
  const deskList = [];
  const chairList = [];
  const rr = rng(14);
  for (let row = 0; row < 6; row += 1) {
    for (let col = 0; col < 6; col += 1) {
      const x = -3.0 + col * 1.2;
      const z = F + 2.6 + row * 1.5;
      const jitter = (rr() - 0.5) * 0.06;
      deskList.push({ x: x + jitter, z, ry: jitter });
      const pulled = rr() < 0.3 ? 0.15 + rr() * 0.2 : 0;
      chairList.push({ x: x + jitter + (rr() - 0.5) * 0.05, z: z + 0.42 + pulled, ry: Math.PI + (rr() - 0.5) * (pulled ? 0.5 : 0.1) });
    }
  }
  const woodLight = mat({ color: '#c8a06a', roughness: 0.55 });
  const steel = mat({ color: '#6f7277', roughness: 0.35, metalness: 0.6 });
  furniture(scene, kit, deskGeometry(), { wood: woodLight, metal: steel }, deskList);
  furniture(scene, kit, chairGeometry(), { wood: mat({ color: '#b98d58', roughness: 0.55 }), metal: steel }, chairList);

  // outside: snow-white light, and the other wing of the school across the yard
  const glow = new THREE.Mesh(keep(new THREE.PlaneGeometry(D * 3, 30)), keep(new THREE.MeshBasicMaterial({ color: '#fbfdff', fog: false })));
  glow.rotation.y = -Math.PI / 2;
  glow.position.set(W / 2 + 40, 6, 0);
  scene.add(glow);
  boxes(scene, [{ x: W / 2 + 26, y: 6, z: -4, sx: 6, sy: 12, sz: 60, color: '#e6e9ec' }], mat({ color: '#ffffff', roughness: 0.9 }), { cast: false });
  boxes(scene, [{ x: W / 2 + 12, y: -0.5, z: 0, sx: 30, sy: 1, sz: 80 }], mat({ color: '#f7f9fb', roughness: 0.9 }), { cast: false });

  kit.shafts(scene, { color: '#fff4e2', dir: rig.dir, at: new THREE.Vector3(1.2, 1.6, 0), count: 6, spread: 2.2, length: 12, width: 0.9, opacity: 0.09 });
  kit.dust(scene, { box: new THREE.Box3(new THREE.Vector3(W / 2 + 0.6, 0, -D / 2), new THREE.Vector3(W / 2 + 6, H + 3, D / 2)), count: small ? 160 : 300, size: 0.07, color: '#ffffff', opacity: 0.7 });
  kit.dust(scene, { box: new THREE.Box3(new THREE.Vector3(-W / 2, 0.5, -D / 2), new THREE.Vector3(W / 2, H, D / 2)), count: small ? 90 : 160, size: 0.03, opacity: 0.4 });

  const look = new THREE.Vector3();
  return {
    scene,
    camera,
    haze,
    density: 0.01,
    place(p) {
      // from the back of the room, up the aisle by the window, toward the board
      const z = lerp(B - 0.9, F + 6.2, p);
      camera.position.set(lerp(1.0, 0.6, p), 1.38, z);
      look.set(lerp(-0.4, 0, p), 1.55, F);
      camera.lookAt(look);
      camera.rotateZ(-0.025);
      rig.follow(new THREE.Vector3(0, 1, z - 4));
      return false;
    },
  };
}

/* ── NIGHT · the library ──────────────────────────────────────
   One aisle of floor-to-ceiling shelves toward a tall window with the last of the sun.
   Thousands of spines in oxblood, black, bronze and cream; the posts are four volumes at
   eye height on the right, their titles on the spines. Pointing at one draws it out;
   choosing it opens the post. */

function spineTexture(title, colour) {
  return canvasTexture(128, 640, (g, w, h) => {
    g.fillStyle = colour;
    g.fillRect(0, 0, w, h);
    g.fillStyle = BRONZE;
    g.fillRect(0, 40, w, 8);
    g.fillRect(0, h - 56, w, 8);
    g.fillStyle = '#e9cf8e';
    g.fillRect(0, 54, w, 3);
    g.fillRect(0, h - 70, w, 3);
    g.save();
    g.translate(w / 2 + 12, 84);
    g.rotate(Math.PI / 2);
    g.fillStyle = '#f6ecd4';
    let size = 40;
    g.font = `800 ${size}px ${SERIF}`;
    while (g.measureText(title).width > h - 190 && size > 18) {
      size -= 2;
      g.font = `800 ${size}px ${SERIF}`;
    }
    g.fillText(title, 0, 0);
    g.restore();
  });
}

function buildNight(kit, small, info) {
  const { mat, boxes, keep } = kit;
  const scene = new THREE.Scene();
  const haze = new THREE.Color('#6b2c1c');
  scene.background = new THREE.Color('#3a160e');
  scene.fog = new THREE.FogExp2(haze.clone(), 0.034);
  const camera = new THREE.PerspectiveCamera(58, 1, 0.05, 120);
  const rig = kit.lightRig(scene, {
    sky: '#ffcf9a',
    ground: '#3a1a10',
    fill: 0.95,
    sun: '#ffb26a',
    power: 2.2,
    dir: new THREE.Vector3(0.18, -0.22, 1),
    span: 22,
    small,
  });

  const AISLE = 2.6;
  const LEN = 34;
  const HT = 6.6;
  const LEVELS = 8;
  const DEPTH = 0.42;
  const boards = [];
  const uprights = [];
  [-1, 1].forEach((s) => {
    const x = s * (AISLE / 2 + DEPTH / 2);
    for (let l = 0; l <= LEVELS; l += 1) boards.push({ x, y: 0.12 + l * (HT / LEVELS), z: -LEN / 2, sx: DEPTH, sy: 0.04, sz: LEN });
    for (let z = 0; z >= -LEN; z -= 1) uprights.push({ x, y: HT / 2, z, sx: DEPTH + 0.02, sy: HT, sz: 0.04 });
    boards.push({ x: x + s * (DEPTH / 2 + 0.02), y: HT / 2, z: -LEN / 2, sx: 0.04, sy: HT, sz: LEN });
  });
  const wood = mat({ color: '#4a2a1c', roughness: 0.6 });
  boxes(scene, boards, wood);
  boxes(scene, uprights, wood);
  // the volumes: four at eye height on the right, the first a step down the aisle
  const FEATURE_LEVEL = 2;
  const featureZ = info.posts.map((_, i) => -2.6 - i * 1.9);
  const r = rng(77);
  const tones = ['#5a1a1e', '#7a2626', '#1d1517', '#2b2224', '#8a6a3a', '#b08a4a', '#e7dcc4', '#3a2a22', '#24304a', '#6b3a2a'];
  const books = [];
  [-1, 1].forEach((s) => {
    const x = s * (AISLE / 2 + DEPTH / 2);
    for (let l = 0; l < LEVELS; l += 1) {
      const y0 = 0.14 + l * (HT / LEVELS);
      let z = -0.04;
      while (z > -LEN + 0.05) {
        const w = 0.03 + r() * 0.045;
        if (r() < 0.025) {
          z -= 0.12 + r() * 0.2;
          continue;
        }
        const h = (HT / LEVELS) * (0.62 + r() * 0.28);
        if (s === 1 && l === FEATURE_LEVEL && featureZ.some((fz) => Math.abs(z - w / 2 - fz) < 0.14)) {
          z -= w + 0.003;
          continue;
        }
        books.push({ x: x + s * 0.02, y: y0 + h / 2, z: z - w / 2, sx: DEPTH * (0.75 + r() * 0.2), sy: h, sz: w, color: tones[Math.floor(r() * tones.length)] });
        z -= w + 0.003;
      }
    }
  });
  boxes(scene, books, mat({ color: '#ffffff', roughness: 0.68 }));
  const floor = new THREE.Mesh(keep(new THREE.PlaneGeometry(AISLE + 2, LEN + 4)), mat({ color: '#3a2016', roughness: 0.4, metalness: 0.1 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = -LEN / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  boxes(scene, [{ x: 0, y: HT + 0.15, z: -LEN / 2, sx: AISLE + 2, sy: 0.3, sz: LEN + 4 }], mat({ color: '#2a140e' }));
  const winTex = keep(
    canvasTexture(256, 512, (g, w, h) => {
      const grad = g.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#ffd8a0');
      grad.addColorStop(1, '#ff9a52');
      g.fillStyle = grad;
      g.fillRect(0, 0, w, h);
      g.fillStyle = '#2a140e';
      g.fillRect(w / 2 - 5, 0, 10, h);
      for (let y = 0; y < h; y += 128) g.fillRect(0, y, w, 8);
    })
  );
  const win = new THREE.Mesh(keep(new THREE.PlaneGeometry(AISLE + 0.6, HT)), mat({ map: winTex, emissive: '#ffffff', emissiveMap: winTex, emissiveIntensity: 1.1 }));
  win.position.set(0, HT / 2, -LEN - 0.4);
  scene.add(win);
  const lampList = [];
  for (let z = -2; z > -LEN; z -= 4.2) lampList.push({ x: 0, y: HT - 1.1, z, sx: 0.32, sy: 0.18, sz: 0.32 });
  boxes(scene, lampList, mat({ color: '#ffd08a', emissive: '#ffb860', emissiveIntensity: 2.2 }), { cast: false });
  lampList.slice(0, 5).forEach((l) => {
    const bulb = new THREE.PointLight('#ffc27a', 5, 9, 1.6);
    bulb.position.set(l.x, l.y - 0.3, l.z);
    scene.add(bulb);
  });

  const colours = { winter: '#2c4a8a', spring: '#a51d33', autumn: '#c8662a', summer: '#1f5fb8' };
  const featured = info.posts.map((post, i) => {
    const colour = colours[post.season] || '#a51d33';
    const tex = keep(spineTexture(post.title, colour));
    const spineMat = keep(new THREE.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.3, roughness: 0.5 }));
    const plain = keep(new THREE.MeshStandardMaterial({ color: colour, roughness: 0.55 }));
    // the face toward the aisle (-x) carries the title
    const m = new THREE.Mesh(keep(new THREE.BoxGeometry(DEPTH * 0.92, 0.76, 0.2)), [plain, spineMat, plain, plain, plain, plain]);
    m.position.set(AISLE / 2 + DEPTH / 2 - 0.02, 0.14 + FEATURE_LEVEL * (HT / LEVELS) + 0.37, featureZ[i]);
    m.castShadow = true;
    m.userData.index = i;
    scene.add(m);
    return { mesh: m, mat: spineMat, home: m.position.clone(), lift: 0 };
  });

  kit.shafts(scene, { color: '#ffbf80', dir: rig.dir, at: new THREE.Vector3(0, 3, -LEN / 2), count: 3, spread: 0.8, length: LEN + 6, width: 1.2, opacity: 0.08 });
  kit.dust(scene, { box: new THREE.Box3(new THREE.Vector3(-AISLE / 2, 0.3, -LEN), new THREE.Vector3(AISLE / 2, HT, 0)), count: small ? 140 : 260, size: 0.035, color: '#ffd9a8', opacity: 0.55 });

  let chosen = -1;
  const look = new THREE.Vector3();
  const ray = new THREE.Raycaster();
  return {
    scene,
    camera,
    haze,
    density: 0.034,
    choose(i) {
      chosen = i;
    },
    pick(ndc) {
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(featured.map((f) => f.mesh), false)[0];
      return hit ? hit.object.userData.index : -1;
    },
    place(p, t, still) {
      // a few steps into the aisle and no further, so the four volumes stay in reach
      const z = lerp(1.6, -2.2, p);
      camera.position.set(-0.55, 1.62, z);
      look.set(0.35, 1.72, z - 5);
      camera.lookAt(look);
      camera.rotateZ(0.025);
      rig.follow(new THREE.Vector3(0, 2, z - 6));
      let moving = false;
      featured.forEach((f, i) => {
        const goal = i === chosen ? 1 : 0;
        f.lift += (goal - f.lift) * (still ? 1 : 0.2);
        if (Math.abs(goal - f.lift) > 0.002) moving = true;
        f.mesh.position.x = f.home.x - f.lift * 0.2;
        f.mat.emissiveIntensity = 0.3 + f.lift * 0.6;
      });
      return moving;
    },
  };
}

/* ── the stage ─────────────────────────────────────────────── */

export function createEpisodes(container, info, start = 'summer') {
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.4 : 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  container.appendChild(renderer.domElement);

  const kit = makeKit();
  const builders = { summer: buildSummer, autumn: buildAutumn, winter: buildWinter, night: buildNight };
  const sets = {};
  const get = (name) => {
    if (!sets[name]) {
      sets[name] = builders[name](kit, small, info);
      resizeSet(sets[name]);
    }
    return sets[name];
  };

  const composer = new EffectComposer(renderer);
  const first = get(start);
  const pass = new RenderPass(first.scene, first.camera);
  composer.addPass(pass);
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.28, 0.5, 0.88);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  let current = start;
  let progress = 0;
  let hazeColor = new THREE.Color(first.haze);
  let hazeAmount = 0;
  let still = false;
  let dirty = true;
  let active = true; // false while the hero still covers the screen

  function resizeSet(set) {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    set.camera.aspect = w / h;
    set.camera.updateProjectionMatrix();
  }
  function resize() {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bloom.resolution.set(Math.max(1, w / 4), Math.max(1, h / 4));
    Object.values(sets).forEach(resizeSet);
    dirty = true;
  }
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  const fogTint = new THREE.Color();
  let raf;
  let last = 0;
  let animating = false;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (document.hidden || !active) return;
    // at rest, re-render slowly (~10 fps) so the dust and lamps keep breathing
    if (!dirty && !animating && now - last < 100) return;
    if (!dirty && still) return;
    last = now;
    dirty = false;
    const set = get(current);
    pass.scene = set.scene;
    pass.camera = set.camera;
    // the cut: the set's own fog thickens and turns toward the colour it is cutting through
    fogTint.copy(set.haze).lerp(hazeColor, hazeAmount);
    set.scene.fog.color.copy(fogTint);
    set.scene.fog.density = set.density * (1 + hazeAmount * 9);
    animating = set.place(progress, now, still);
    composer.render();
  }
  raf = requestAnimationFrame(frame);

  return {
    setView(name, p) {
      if (name !== current || Math.abs(p - progress) > 1e-5) dirty = true;
      current = name;
      progress = p;
    },
    setHaze(color, amount) {
      hazeColor = new THREE.Color(color);
      hazeAmount = amount;
      dirty = true;
    },
    setActive(v) {
      if (v !== active) dirty = true;
      active = v;
    },
    setStill(v) {
      still = v;
      dirty = true;
    },
    choose(i) {
      get('night').choose(i);
      dirty = true;
      animating = true;
    },
    // open a project: the cram-school camera moves to that project's pile of chairs
    setCase(i) {
      get('autumn').aim(i);
      dirty = true;
      animating = true;
    },
    // which of the library's four volumes is under the pointer (-1 for none)
    pick(clientX, clientY) {
      if (current !== 'night' || !active) return -1;
      const rect = container.getBoundingClientRect();
      const ndc = new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
      return get('night').pick(ndc);
    },
    prepare(name) {
      get(name);
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      kit.disposables.forEach((d) => d.dispose?.());
      composer.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
