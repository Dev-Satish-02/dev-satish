import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

/* The episodes after the staircase, built the way the staircase is built.

   One renderer with the stairwell's settings (ACES filmic, PCF shadows, FogExp2 haze, the
   same bloom), and four sets, each lit by a hemisphere fill and one sun from one side, with
   soft parallel shafts and dust. The seasons change the haze and the sun, never the method.
   See design/ART_DIRECTION.md for the references behind each set.

     summer   Iogi, Seibu Shinjuku Line: side platforms, three tracks, the crossing, a yellow
              2000-series train
     autumn   the cram school after Tange's Yamanashi Bunka Kaikan: cylinders, beams, slabs
     winter   a Naoetsu High classroom, drawn deeper than life, in low winter sun
     night    the library: one aisle of floor-to-ceiling shelves toward a sunset window

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

/* ── SUMMER · Iogi ────────────────────────────────────────────
   Units are metres. The tracks run along x. Two side platforms face the outer tracks; the
   middle track is the passing line. The camera stands on the south platform looking north,
   so the train, running toward +x, crosses the frame from left to right. */

const SUMMER = {
  haze: '#d8e6f4',
  skyTop: '#0f47c2', // the staircase's last colour
  sun: '#fff3d6',
  track: [-4, 0, 4], // north line, passing line, south line
  platformZ: 7.3,
  platformY: 1.1,
  signs: [-34, -11, 12, 35],
  crossingX: 62, // at the east end of the platforms, past the footbridge
};

function stationSignTexture(name, role, prev, next) {
  return canvasTexture(1024, 384, (g, w, h) => {
    g.fillStyle = '#fbfaf5';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#17111a';
    g.textAlign = 'center';
    let size = 120;
    g.font = `800 ${size}px ${SERIF}`;
    while (g.measureText(name).width > w - 120 && size > 48) {
      size -= 6;
      g.font = `800 ${size}px ${SERIF}`;
    }
    g.fillText(name, w / 2, 170);
    g.font = `500 34px ${SANS}`;
    g.fillStyle = '#4c4650';
    g.fillText(role, w / 2, 232);
    // the line band, with the neighbouring stations at either end
    g.fillStyle = '#21407e';
    g.fillRect(0, h - 92, w, 92);
    g.fillStyle = BRONZE;
    g.fillRect(0, h - 98, w, 6);
    g.fillStyle = '#ffffff';
    g.font = `600 32px ${SANS}`;
    g.textAlign = 'left';
    g.fillText(`◀ ${prev}`, 34, h - 34);
    g.textAlign = 'right';
    g.fillText(`${next} ▶`, w - 34, h - 34);
  });
}

function trainSideTexture() {
  // a Seibu 2000-series car side: yellow body, four doors, dark window band
  return canvasTexture(2048, 256, (g, w, h) => {
    g.fillStyle = '#f2c01c';
    g.fillRect(0, 0, w, h);
    const doorW = 96;
    const doors = [0.1, 0.36, 0.62, 0.88].map((t) => t * w);
    // windows between the doors
    g.fillStyle = '#25303a';
    for (let i = 0; i < doors.length - 1; i += 1) {
      const a = doors[i] + doorW / 2 + 24;
      const b = doors[i + 1] - doorW / 2 - 24;
      const n = 2;
      const ww = (b - a) / n;
      for (let k = 0; k < n; k += 1) g.fillRect(a + k * ww + 6, 46, ww - 12, 86);
    }
    g.fillRect(14, 50, doors[0] - doorW / 2 - 40, 80);
    g.fillRect(doors[3] + doorW / 2 + 26, 50, w - doors[3] - doorW / 2 - 40, 80);
    // the doors: outline and their own small windows
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
    // reflections on the glass, the sky caught in it
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

function crossbuckTexture() {
  return canvasTexture(256, 32, (g, w, h) => {
    for (let x = -h; x < w + h; x += 32) {
      g.fillStyle = (x / 32) % 2 === 0 ? '#f2c01c' : '#16130f';
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x + 16, 0);
      g.lineTo(x + 16 + h, h);
      g.lineTo(x + h, h);
      g.fill();
    }
  });
}

function windowBandTexture({ base, pane, lit, cols, rows, seed }) {
  const r = rng(seed);
  return canvasTexture(512, 256, (g, w, h) => {
    g.fillStyle = base;
    g.fillRect(0, 0, w, h);
    const cw = w / cols;
    const rh = h / rows;
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        g.fillStyle = r() < lit ? pane : '#3b3f46';
        g.fillRect(x * cw + cw * 0.18, y * rh + rh * 0.22, cw * 0.64, rh * 0.5);
      }
    }
  });
}

function buildSummer(kit, small, info) {
  const { mat, boxes, keep } = kit;
  const scene = new THREE.Scene();
  const haze = new THREE.Color(SUMMER.haze);
  scene.background = haze.clone();
  scene.fog = new THREE.FogExp2(haze.clone(), 0.0085);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 600);

  // the sky: the staircase's blue at the top, paling to haze at the horizon
  const skyTex = keep(
    canvasTexture(4, 512, (g, w, h) => {
      const grad = g.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, SUMMER.skyTop);
      grad.addColorStop(0.32, '#3d7fdc');
      grad.addColorStop(0.5, '#a9c9ee');
      grad.addColorStop(0.56, SUMMER.haze);
      grad.addColorStop(1, SUMMER.haze);
      g.fillStyle = grad;
      g.fillRect(0, 0, w, h);
    })
  );
  const sky = new THREE.Mesh(
    keep(new THREE.SphereGeometry(400, 32, 16)),
    keep(new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false, depthWrite: false }))
  );
  scene.add(sky);

  const rig = kit.lightRig(scene, {
    sky: '#e4efff',
    ground: '#b7a27a',
    fill: 0.85,
    sun: SUMMER.sun,
    power: 2.6,
    dir: new THREE.Vector3(0.45, -1, -0.55),
    span: 70,
    small,
  });

  // ground, track beds, sleepers and rails
  const ground = new THREE.Mesh(keep(new THREE.PlaneGeometry(800, 800)), mat({ color: '#b9b09c', roughness: 0.95 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  const L = 320;
  boxes(scene, SUMMER.track.map((z) => ({ x: 0, y: 0.15, z, sx: L, sy: 0.3, sz: 3.2 })), mat({ color: '#8f877a', roughness: 1 }), { cast: false });
  const sleepers = [];
  SUMMER.track.forEach((z) => {
    for (let x = -L / 2; x < L / 2; x += 0.62) sleepers.push({ x, y: 0.34, z, sx: 0.22, sy: 0.12, sz: 2.1 });
  });
  boxes(scene, sleepers, mat({ color: '#a7a196', roughness: 0.9 }), { cast: false });
  const rails = [];
  SUMMER.track.forEach((z) => [-0.534, 0.534].forEach((o) => rails.push({ x: 0, y: 0.47, z: z + o, sx: L, sy: 0.15, sz: 0.07 })));
  boxes(scene, rails, mat({ color: '#6b655d', roughness: 0.35, metalness: 0.6 }), { cast: false });

  // two side platforms, each with its yellow tactile line and white edge
  const platW = 4.4;
  const plats = [-SUMMER.platformZ, SUMMER.platformZ];
  boxes(
    scene,
    plats.map((z) => ({ x: -6, y: SUMMER.platformY / 2, z, sx: 130, sy: SUMMER.platformY, sz: platW })),
    mat({ color: '#d9d2c3', roughness: 0.9 })
  );
  const lines = [];
  plats.forEach((z) => {
    const edge = z - Math.sign(z) * (platW / 2 - 0.08);
    lines.push({ x: -6, y: SUMMER.platformY + 0.005, z: edge, sx: 130, sy: 0.01, sz: 0.12, color: '#ffffff' });
    lines.push({ x: -6, y: SUMMER.platformY + 0.008, z: edge + Math.sign(z) * 0.85, sx: 130, sy: 0.016, sz: 0.3, color: '#f2c01c' });
  });
  boxes(scene, lines, mat({ color: '#ffffff', roughness: 0.6 }), { cast: false });

  // canopies over part of each platform: slender columns and a flat roof
  const canopyCols = [];
  const roofs = [];
  plats.forEach((z) => {
    const x0 = -40;
    const x1 = 22;
    for (let x = x0; x <= x1; x += 7.75) canopyCols.push({ x, y: SUMMER.platformY + 1.7, z: z + Math.sign(z) * 0.9, sx: 0.22, sy: 3.4, sz: 0.22 });
    roofs.push({ x: (x0 + x1) / 2, y: SUMMER.platformY + 3.5, z: z + Math.sign(z) * 0.4, sx: x1 - x0 + 3, sy: 0.22, sz: platW + 0.6 });
  });
  boxes(scene, canopyCols, mat({ color: '#8c8a84', roughness: 0.5, metalness: 0.4 }));
  boxes(scene, roofs, mat({ color: '#efe8da', roughness: 0.8 }));
  const strips = [];
  plats.forEach((z) => {
    for (let x = -38; x <= 20; x += 4.4) strips.push({ x, y: SUMMER.platformY + 3.37, z: z + Math.sign(z) * 0.2, sx: 1.6, sy: 0.04, sz: 0.14 });
  });
  boxes(scene, strips, mat({ color: '#fffaf0', emissive: '#fff4dc', emissiveIntensity: 0.7 }), { cast: false });

  // the station-name signs on the far platform: one per internship
  const signMeshes = [];
  info.stations.forEach((s, i) => {
    const tex = keep(stationSignTexture(s.name, s.role, info.stations[i - 1]?.name ?? 'Start of the line', info.stations[i + 1]?.name ?? 'Terminus'));
    const board = new THREE.Mesh(
      keep(new THREE.BoxGeometry(3.1, 1.16, 0.08)),
      [mat({ color: '#2a2f38' }), mat({ color: '#2a2f38' }), mat({ color: '#2a2f38' }), mat({ color: '#2a2f38' }), mat({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.28, roughness: 0.6 }), mat({ color: '#2a2f38' })]
    );
    board.position.set(SUMMER.signs[i], SUMMER.platformY + 2.15, -SUMMER.platformZ - 0.6);
    board.castShadow = true;
    scene.add(board);
    signMeshes.push(board);
    boxes(
      scene,
      [-1.35, 1.35].map((o) => ({ x: SUMMER.signs[i] + o, y: SUMMER.platformY + 0.8, z: -SUMMER.platformZ - 0.64, sx: 0.08, sy: 1.6, sz: 0.08 })),
      mat({ color: '#3a3f47', roughness: 0.5, metalness: 0.4 })
    );
  });

  // the footbridge: a glazed corridor across all three tracks, with stair towers
  const fbX = 30;
  const fbTex = keep(windowBandTexture({ base: '#e8e1d2', pane: '#fff6dc', lit: 1, cols: 16, rows: 1, seed: 4 }));
  fbTex.wrapS = THREE.RepeatWrapping;
  const fb = new THREE.Mesh(
    keep(new THREE.BoxGeometry(3.4, 2.8, 22)),
    mat({ color: '#e8e1d2', map: fbTex, emissive: '#fff0c8', emissiveMap: fbTex, emissiveIntensity: 0.45 })
  );
  fb.position.set(fbX, 7.4, 0);
  fb.castShadow = true;
  scene.add(fb);
  boxes(
    scene,
    plats.map((z) => ({ x: fbX, y: 4.6, z: z + Math.sign(z) * 0.4, sx: 3.6, sy: 8.4, sz: 3.2 })),
    mat({ color: '#e2dacb', roughness: 0.85 })
  );

  // catenary: a portal every 22 m, with contact and messenger wires over each track
  const masts = [];
  const beams = [];
  for (let x = -110; x <= 120; x += 22) {
    [-10.4, 10.4].forEach((z) => masts.push({ x, y: 4.6, z, sx: 0.35, sy: 9.2, sz: 0.35 }));
    beams.push({ x, y: 8.6, z: 0, sx: 0.3, sy: 0.45, sz: 21.2 });
    SUMMER.track.forEach((z) => beams.push({ x, y: 7.2, z, sx: 0.06, sy: 2.4, sz: 0.06 }));
  }
  boxes(scene, masts, mat({ color: '#7d7a73', roughness: 0.5, metalness: 0.5 }));
  boxes(scene, beams, mat({ color: '#6e6b64', roughness: 0.5, metalness: 0.5 }));
  const wires = [];
  SUMMER.track.forEach((z) => {
    wires.push({ x: 0, y: 5.4, z, sx: 260, sy: 0.025, sz: 0.025 });
    wires.push({ x: 0, y: 6.5, z, sx: 260, sy: 0.02, sz: 0.02 });
  });
  [-10.4, 10.4].forEach((z) => wires.push({ x: 0, y: 8.9, z, sx: 260, sy: 0.03, sz: 0.03 }));
  boxes(scene, wires, mat({ color: '#2a2724', roughness: 0.5, metalness: 0.5 }), { receive: false });

  // the crossing at the west end of the platforms: road, crossbucks, lamps, barriers
  const cx = SUMMER.crossingX;
  boxes(scene, [{ x: cx, y: 0.02, z: 0, sx: 9, sy: 0.04, sz: 120 }], mat({ color: '#4d4c52', roughness: 0.9 }), { cast: false });
  boxes(
    scene,
    [-4.3, 4.3].map((o) => ({ x: cx + o, y: 0.05, z: 0, sx: 0.15, sy: 0.02, sz: 120 })),
    mat({ color: '#f4f2ea', roughness: 0.6 }),
    { cast: false }
  );
  boxes(scene, [{ x: cx, y: 0.5, z: 0, sx: 8.6, sy: 0.08, sz: 13 }], mat({ color: '#56555a', roughness: 0.8 }), { cast: false });
  const stripe = keep(crossbuckTexture());
  stripe.wrapS = THREE.RepeatWrapping;
  const stripeMat = mat({ map: stripe, roughness: 0.6 });
  const lamps = [];
  const barriers = [];
  // one post on each approach, at the road's edge: road traffic runs along z
  [
    [cx - 5.4, -9.6, 1],
    [cx + 5.4, 9.6, -1],
  ].forEach(([x, z, side]) => {
    boxes(scene, [{ x, y: 2.3, z, sx: 0.14, sy: 4.6, sz: 0.14 }], stripeMat);
    boxes(
      scene,
      [28, -28].map((deg) => ({ x, y: 4.2, z, sx: 1.5, sy: 0.2, sz: 0.06, rz: (deg * Math.PI) / 180 })),
      stripeMat
    );
    // two lamps side by side, facing the oncoming road, which flash in turn
    [-0.42, 0.42].forEach((o, k) => {
      const lamp = new THREE.Mesh(
        keep(new THREE.CylinderGeometry(0.16, 0.16, 0.08, 20)),
        keep(new THREE.MeshStandardMaterial({ color: '#3a0a0c', emissive: '#ff2a2a', emissiveIntensity: 0, roughness: 0.4 }))
      );
      lamp.rotation.x = Math.PI / 2;
      lamp.position.set(x + o, 3.35, z - Math.sign(z) * 0.12);
      scene.add(lamp);
      lamps.push({ mesh: lamp, phase: k });
    });
    // the barrier arm across the road, pivoting up on its post
    const pivot = new THREE.Group();
    pivot.position.set(x, 1.1, z - Math.sign(z) * 0.3);
    const arm = new THREE.Mesh(keep(new THREE.BoxGeometry(4.6, 0.09, 0.09)), stripeMat);
    arm.position.x = side * 2.3;
    arm.castShadow = true;
    pivot.add(arm);
    scene.add(pivot);
    barriers.push({ pivot, side });
  });

  // the town: low houses and flats either side, fading into haze
  const r = rng(11);
  const houses = [];
  const roofsH = [];
  for (let i = 0; i < 150; i += 1) {
    const side = i % 2 ? 1 : -1;
    const x = lerp(-150, 150, r());
    const z = side * (16 + r() * 60);
    if (Math.abs(x - cx) < 8) continue;
    const flat = r() < 0.25;
    const w = flat ? 14 + r() * 10 : 7 + r() * 4;
    const d = flat ? 9 : 7 + r() * 3;
    const h = flat ? 9 + r() * 7 : 5.5 + r() * 1.5;
    const tone = ['#efe9dc', '#e2d9c6', '#d8d2c8', '#f3eee4', '#cfc6b4'][Math.floor(r() * 5)];
    houses.push({ x, y: h / 2, z, sx: w, sy: h, sz: d, color: tone });
    if (!flat) roofsH.push({ x, y: h + 0.5, z, sx: w + 0.6, sy: 0.9, sz: d * 0.72, color: ['#5d5a57', '#7a3d2c', '#3f4652'][Math.floor(r() * 3)] });
  }
  boxes(scene, houses, mat({ color: '#ffffff', roughness: 0.9 }));
  boxes(scene, roofsH, mat({ color: '#ffffff', roughness: 0.8 }));
  // utility poles along the road
  const poles = [];
  for (let z = -60; z <= 60; z += 15) if (Math.abs(z) > 12) poles.push({ x: cx - 6.2, y: 5, z, sx: 0.28, sy: 10, sz: 0.28 });
  boxes(scene, poles, mat({ color: '#9a958c', roughness: 0.8 }));

  // the train: six yellow cars on the passing line
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
  // the leading cab's face, with its dark windscreen and lights
  const face = new THREE.Mesh(
    keep(new THREE.PlaneGeometry(2.8, 3.0)),
    mat({
      map: keep(
        canvasTexture(256, 256, (g, w, h) => {
          g.fillStyle = '#f2c01c';
          g.fillRect(0, 0, w, h);
          g.fillStyle = '#1f2830';
          g.fillRect(24, 34, w - 48, 104);
          g.fillStyle = '#fff6d0';
          [44, w - 44].forEach((x) => {
            g.beginPath();
            g.arc(x, 186, 13, 0, Math.PI * 2);
            g.fill();
          });
        })
      ),
      emissive: '#fff2c0',
      emissiveIntensity: 0.15,
    })
  );
  face.rotation.y = Math.PI / 2;
  face.position.set(9.76, 2.75, 0);
  train.add(face);
  train.position.z = SUMMER.track[1];
  scene.add(train);

  kit.shafts(scene, { color: SUMMER.sun, dir: rig.dir, at: new THREE.Vector3(-6, 9, -2), count: 5, spread: 9, length: 46, width: 3.4, opacity: 0.05 });
  kit.dust(scene, { box: new THREE.Box3(new THREE.Vector3(-70, 1, -12), new THREE.Vector3(60, 9, 12)), count: small ? 160 : 300, size: 0.09, opacity: 0.35 });

  const look = new THREE.Vector3();
  return {
    scene,
    camera,
    haze,
    density: 0.0085,
    place(p, t, still) {
      // the camera walks the south platform and stops opposite each station sign, framing it
      // across the three tracks; between signs it moves on, eased
      const n = SUMMER.signs.length;
      const seg = Math.min(n - 1e-6, p * n);
      const i = Math.floor(seg);
      const run = smoothstep(0.7, 1, seg - i);
      const sx = lerp(SUMMER.signs[i], SUMMER.signs[Math.min(n - 1, i + 1)], i < n - 1 ? run : 0);
      // the sign sits right of centre, clear of the card on the left
      const x = sx - 4.2;
      camera.position.set(x, SUMMER.platformY + 1.62, SUMMER.platformZ - 0.9);
      look.set(sx - 2.6, SUMMER.platformY + 2.35, -SUMMER.platformZ);
      camera.lookAt(look);
      camera.rotateZ(-0.035); // the slight Shaft tilt
      rig.follow(look);
      // one train passes, left to right, between the second and third stops
      const head = lerp(-150, 230, smoothstep(0.34, 0.66, p));
      train.position.x = head;
      // the crossing closes while any part of the train is near it
      const near = head > cx - 30 && head - 6 * CAR < cx + 20;
      barriers.forEach(({ pivot, side }) => {
        pivot.rotation.z = near ? 0 : (side * Math.PI) / 2.2;
      });
      lamps.forEach(({ mesh, phase }) => {
        const on = near && !still ? (Math.floor(t / 600) + phase) % 2 === 0 : near && phase === 0;
        mesh.material.emissiveIntensity = on ? 3.2 : 0;
      });
      return near && !still; // keep rendering while the lamps flash
    },
  };
}

/* ── AUTUMN · the cram school ─────────────────────────────────
   Tange's Metabolist frame: a grid of concrete cylinders carrying deep beams and floor slabs,
   some slabs gone. The camera walks the third floor at six in the evening. */

function cylinderTexture(seed) {
  const r = rng(seed);
  return canvasTexture(512, 1024, (g, w, h) => {
    g.fillStyle = '#cdbfa6';
    g.fillRect(0, 0, w, h);
    // board-marked concrete: faint horizontal lifts
    for (let y = 0; y < h; y += 32) {
      g.fillStyle = `rgba(90, 70, 50, ${0.04 + r() * 0.05})`;
      g.fillRect(0, y, w, 2);
    }
    // stains running down
    for (let i = 0; i < 26; i += 1) {
      g.fillStyle = `rgba(70, 52, 38, ${0.05 + r() * 0.08})`;
      g.fillRect(r() * w, r() * h * 0.5, 2 + r() * 6, 60 + r() * 300);
    }
    // the vertical slit windows, in pairs, some still lit by the low sun
    for (let x = 30; x < w; x += 128) {
      for (let y = 40; y < h; y += 256) {
        g.fillStyle = r() < 0.3 ? '#ffd9a0' : '#3a2c22';
        g.fillRect(x, y, 14, 160);
        g.fillRect(x + 26, y, 14, 160);
      }
    }
  });
}

function buildAutumn(kit, small) {
  const { mat, boxes, keep } = kit;
  const scene = new THREE.Scene();
  const haze = new THREE.Color('#d08a4e');
  scene.background = haze.clone();
  scene.fog = new THREE.FogExp2(haze.clone(), 0.0085);
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 500);
  const rig = kit.lightRig(scene, {
    sky: '#ffd8ae',
    ground: '#4a2e1a',
    fill: 0.45,
    sun: '#ffb46a',
    power: 3.2,
    dir: new THREE.Vector3(-1, -0.32, 0.38),
    span: 60,
    small,
  });

  const S = 16; // spacing of the cylinders
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
  const cylGeo = keep(new THREE.CylinderGeometry(R, R, 44, 40));
  const cols = [];
  for (let i = 0; i < 4; i += 1) for (let j = 0; j < 4; j += 1) cols.push([(i - 1.5) * S, (j - 1.5) * S]);
  const cyl = new THREE.InstancedMesh(cylGeo, cylMat, cols.length);
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

  // deep beams on every level, along both grid directions; slabs between, some missing
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
        // the floor the camera walks (level 2) stays whole along its path
        const keepIt = li === 2 ? i === 1 || r() < 0.6 : r() < 0.55;
        if (!keepIt) continue;
        slabs.push({ x: (i - 1) * S, y: y + 1.85, z: (j - 1) * S, sx: S - 1, sy: 0.4, sz: S - 1 });
      }
    }
  });
  boxes(scene, beams, mat({ color: '#c4b398', roughness: 0.9 }));
  boxes(scene, slabs, mat({ color: '#b9a88e', roughness: 0.95 }));

  // the cram school's leftovers on the walked floor: desks and chairs, scattered and piled
  const floorY = levels[2] + 2.05;
  const deskTops = [];
  const deskLegs = [];
  const rr = rng(33);
  for (let k = 0; k < 40; k += 1) {
    const pile = k % 7 === 0;
    // kept to the sides of the walk, so the colonnade reads down the middle
    const x = (rr() < 0.5 ? -1 : 1) * lerp(3.2, 7, rr());
    const z = lerp(-24, 24, rr());
    const ry = rr() * Math.PI;
    const stack = pile ? 3 : 1;
    for (let s = 0; s < stack; s += 1) {
      const y = floorY + 0.74 + s * 0.8;
      const tilt = pile ? (rr() - 0.5) * 0.3 : 0;
      deskTops.push({ x, y, z, sx: 1.2, sy: 0.05, sz: 0.45, ry: ry + s * 0.3, rz: tilt });
      deskLegs.push({ x: x + 0.5 * Math.cos(ry), y: y - 0.37, z: z - 0.5 * Math.sin(ry), sx: 0.05, sy: 0.72, sz: 0.4, ry });
      deskLegs.push({ x: x - 0.5 * Math.cos(ry), y: y - 0.37, z: z + 0.5 * Math.sin(ry), sx: 0.05, sy: 0.72, sz: 0.4, ry });
    }
  }
  boxes(scene, deskTops, mat({ color: '#8a6a45', roughness: 0.7 }));
  boxes(scene, deskLegs, mat({ color: '#4b4038', roughness: 0.5, metalness: 0.4 }));

  // Fuji, pale in the far haze, as it is seen from the cram school in Kizumonogatari
  const fuji = new THREE.Mesh(
    keep(new THREE.ConeGeometry(160, 70, 48, 1, true)),
    keep(new THREE.MeshBasicMaterial({ color: '#d79a68', fog: false, transparent: true, opacity: 0.55 }))
  );
  fuji.position.set(-300, 20, 60);
  scene.add(fuji);
  const cap = new THREE.Mesh(
    keep(new THREE.ConeGeometry(48, 21, 48, 1, true)),
    keep(new THREE.MeshBasicMaterial({ color: '#f4dcc4', fog: false, transparent: true, opacity: 0.6 }))
  );
  cap.position.set(-300, 44.6, 60);
  scene.add(cap);

  kit.shafts(scene, { color: '#ffc58a', dir: rig.dir, at: new THREE.Vector3(0, floorY + 4, 0), count: 6, spread: 6, length: 38, width: 2.6, opacity: 0.08 });
  kit.dust(scene, { box: new THREE.Box3(new THREE.Vector3(-9, floorY, -26), new THREE.Vector3(9, floorY + 6, 26)), count: small ? 180 : 320, size: 0.06, color: '#ffd9a8', opacity: 0.5 });

  const look = new THREE.Vector3();
  return {
    scene,
    camera,
    haze,
    density: 0.0085,
    place(p) {
      // walking the third floor down the colonnade; the low sun comes from the right, so each
      // cylinder is lit on one side and lays its shadow across the floor ahead
      const z = lerp(22, -14, p);
      camera.position.set(lerp(-1.2, 0.6, p), floorY + 1.75, z);
      look.set(lerp(4.5, 2.5, p), floorY + 1.2 + Math.sin(p * Math.PI) * 1.4, z - 16);
      camera.lookAt(look);
      camera.rotateZ(0.03);
      rig.follow(look);
      return false;
    },
  };
}

/* ── WINTER · the classroom ───────────────────────────────────
   A Naoetsu High classroom, drawn deeper than life: rows of desks, a wall of tall windows on
   the right whose frames throw long shadows, the blackboard ahead. Low, cold sun. */

function blackboardTexture(groups) {
  return canvasTexture(2048, 520, (g, w, h) => {
    g.fillStyle = '#25332d';
    g.fillRect(0, 0, w, h);
    // the smudge of old chalk
    for (let i = 0; i < 40; i += 1) {
      g.fillStyle = `rgba(255,255,255,${0.012 + (i % 3) * 0.006})`;
      g.beginPath();
      g.ellipse((i * 137) % w, (i * 71) % h, 160, 40, 0.2, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = 'rgba(238,241,234,0.92)';
    const colW = w / groups.length;
    groups.forEach((grp, i) => {
      const x = i * colW + 60;
      g.font = `800 58px ${SERIF}`;
      g.fillText(grp.title, x, 110);
      g.fillRect(x, 130, colW - 120, 3);
      g.font = `400 34px ${SANS}`;
      grp.items.slice(0, 7).forEach((it, k) => {
        const text = it.length > 30 ? `${it.slice(0, 29)}…` : it;
        g.fillText(text, x, 190 + k * 46);
      });
    });
  });
}

function buildWinter(kit, small, info) {
  const { mat, boxes, keep } = kit;
  const scene = new THREE.Scene();
  const haze = new THREE.Color('#dfe6ef');
  scene.background = new THREE.Color('#eef3f8');
  scene.fog = new THREE.FogExp2(haze.clone(), 0.014);
  const camera = new THREE.PerspectiveCamera(56, 1, 0.05, 200);
  const rig = kit.lightRig(scene, {
    sky: '#eaf1fb',
    ground: '#8a7a64',
    fill: 0.75,
    sun: '#eef4ff',
    power: 2.4,
    dir: new THREE.Vector3(-1, -0.42, -0.35),
    span: 26,
    small,
  });

  const W = 9; // room width (x), windows on +x
  const D = 26; // drawn deeper than life
  const Hh = 3.6;
  // floor: varnished planks
  const floorTex = keep(
    canvasTexture(512, 512, (g, w, h) => {
      g.fillStyle = '#a9875c';
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
  floorTex.repeat.set(4, 10);
  const floor = new THREE.Mesh(keep(new THREE.PlaneGeometry(W, D)), mat({ map: floorTex, roughness: 0.55 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  // walls and ceiling (the window wall is a frame, so the sun comes through)
  const wallMat = mat({ color: '#e9e4d8', roughness: 0.9 });
  boxes(
    scene,
    [
      { x: -W / 2 - 0.1, y: Hh / 2, z: 0, sx: 0.2, sy: Hh, sz: D },
      { x: 0, y: Hh + 0.1, z: 0, sx: W + 0.4, sy: 0.2, sz: D },
      { x: 0, y: Hh / 2, z: -D / 2 - 0.1, sx: W, sy: Hh, sz: 0.2 },
      { x: W / 2 + 0.1, y: 0.45, z: 0, sx: 0.2, sy: 0.9, sz: D },
      { x: W / 2 + 0.1, y: Hh - 0.15, z: 0, sx: 0.2, sy: 0.3, sz: D },
    ],
    wallMat
  );
  // the window frames: mullions every 1.8 m, a transom, a sill
  const frames = [];
  for (let z = -D / 2; z <= D / 2; z += 1.8) frames.push({ x: W / 2 + 0.05, y: Hh / 2, z, sx: 0.12, sy: Hh, sz: 0.1 });
  frames.push({ x: W / 2 + 0.05, y: 2.25, z: 0, sx: 0.1, sy: 0.08, sz: D });
  frames.push({ x: W / 2 - 0.05, y: 0.92, z: 0, sx: 0.3, sy: 0.06, sz: D });
  boxes(scene, frames, mat({ color: '#d7d3c8', roughness: 0.5, metalness: 0.3 }));
  // corridor wall: transom windows high up and the doors
  boxes(
    scene,
    [
      { x: -W / 2 + 0.02, y: 1.05, z: 0, sx: 0.06, sy: 0.14, sz: D, color: '#b9b2a2' },
      { x: -W / 2 + 0.02, y: 1.1, z: -D / 2 + 2, sx: 0.06, sy: 2.2, sz: 1.8, color: '#a58a62' },
      { x: -W / 2 + 0.02, y: 1.1, z: D / 2 - 2, sx: 0.06, sy: 2.2, sz: 1.8, color: '#a58a62' },
    ],
    mat({ color: '#ffffff', roughness: 0.7 })
  );
  // the blackboard and its chalk: the skills, as they would be written up
  const bbTex = keep(blackboardTexture(info.skills));
  const board = new THREE.Mesh(keep(new THREE.PlaneGeometry(7.4, 1.88)), mat({ map: bbTex, emissive: '#ffffff', emissiveMap: bbTex, emissiveIntensity: 0.06, roughness: 0.85 }));
  board.position.set(0, 1.85, -D / 2 + 0.02);
  scene.add(board);
  boxes(scene, [{ x: 0, y: 0.88, z: -D / 2 + 0.12, sx: 7.6, sy: 0.06, sz: 0.16 }], mat({ color: '#6b5a40' }));
  // the teacher's desk on the dais
  boxes(
    scene,
    [
      { x: 0, y: 0.1, z: -D / 2 + 1.4, sx: W, sy: 0.2, sz: 2.4 },
      { x: 0, y: 0.68, z: -D / 2 + 2.0, sx: 1.6, sy: 0.96, sz: 0.7 },
    ],
    mat({ color: '#8a6b47', roughness: 0.7 })
  );
  // rows of desks and chairs
  const tops = [];
  const frameBits = [];
  const seats = [];
  for (let row = 0; row < 12; row += 1) {
    for (let col = 0; col < 6; col += 1) {
      const x = -3.4 + col * 1.36;
      const z = -D / 2 + 4.2 + row * 1.7;
      tops.push({ x, y: 0.72, z, sx: 0.66, sy: 0.04, sz: 0.46 });
      frameBits.push({ x, y: 0.36, z: z - 0.18, sx: 0.6, sy: 0.7, sz: 0.03 });
      seats.push({ x, y: 0.44, z: z + 0.42, sx: 0.4, sy: 0.04, sz: 0.38 });
      seats.push({ x, y: 0.68, z: z + 0.62, sx: 0.4, sy: 0.36, sz: 0.03 });
    }
  }
  boxes(scene, tops, mat({ color: '#c49a64', roughness: 0.6 }));
  boxes(scene, frameBits, mat({ color: '#6e7076', roughness: 0.4, metalness: 0.5 }));
  boxes(scene, seats, mat({ color: '#b48c5a', roughness: 0.6 }));
  // fluorescent fittings, unlit in daylight
  const tubes = [];
  for (let z = -D / 2 + 3; z < D / 2; z += 3.4) [-2.2, 2.2].forEach((x) => tubes.push({ x, y: Hh - 0.04, z, sx: 0.25, sy: 0.05, sz: 1.3 }));
  boxes(scene, tubes, mat({ color: '#f4f6f8', emissive: '#eef4ff', emissiveIntensity: 0.25 }), { cast: false });
  // outside: the snow-white light the windows open on
  const glow = new THREE.Mesh(keep(new THREE.PlaneGeometry(D * 2, 30)), keep(new THREE.MeshBasicMaterial({ color: '#fbfdff', fog: false })));
  glow.rotation.y = -Math.PI / 2;
  glow.position.set(W / 2 + 12, 6, 0);
  scene.add(glow);

  kit.shafts(scene, { color: '#f4f8ff', dir: rig.dir, at: new THREE.Vector3(1.4, 1.8, 0), count: 7, spread: 2.6, length: 14, width: 1.0, opacity: 0.09 });
  // snow, just outside the glass
  kit.dust(scene, { box: new THREE.Box3(new THREE.Vector3(W / 2 + 0.6, 0, -D / 2), new THREE.Vector3(W / 2 + 6, Hh + 3, D / 2)), count: small ? 160 : 300, size: 0.07, color: '#ffffff', opacity: 0.7 });
  kit.dust(scene, { box: new THREE.Box3(new THREE.Vector3(-W / 2, 0.5, -D / 2), new THREE.Vector3(W / 2, Hh, D / 2)), count: small ? 100 : 180, size: 0.03, opacity: 0.45 });

  const look = new THREE.Vector3();
  return {
    scene,
    camera,
    haze,
    density: 0.014,
    place(p) {
      // from the back row toward the blackboard
      const z = lerp(D / 2 - 1.2, -D / 2 + 6.5, p);
      camera.position.set(lerp(-3.2, -1.2, p), 1.45, z);
      look.set(lerp(0.6, 0, p), 1.6, -D / 2);
      camera.lookAt(look);
      camera.rotateZ(-0.03);
      rig.follow(new THREE.Vector3(0, 1, z - 6));
      return false;
    },
  };
}

/* ── NIGHT · the library ──────────────────────────────────────
   One aisle of floor-to-ceiling shelves toward a tall window with the last of the sun.
   Thousands of spines in oxblood, black, bronze and cream; the posts are four of them, at
   eye height on the right, and come forward when chosen. */

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
  // the shelving: uprights every metre and a board for every level, both sides
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
  // the spines
  const r = rng(77);
  const tones = ['#5a1a1e', '#7a2626', '#1d1517', '#2b2224', '#8a6a3a', '#b08a4a', '#e7dcc4', '#3a2a22', '#24304a', '#6b3a2a'];
  const FEATURE_LEVEL = 2;
  const featureZ = info.posts.map((_, i) => -3.2 - i * 2.4);
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
        if (s === 1 && l === FEATURE_LEVEL && featureZ.some((fz) => Math.abs(z - w / 2 - fz) < 0.09)) {
          z -= w + 0.003;
          continue;
        }
        books.push({ x: x + s * 0.02, y: y0 + h / 2, z: z - w / 2, sx: DEPTH * (0.75 + r() * 0.2), sy: h, sz: w, color: tones[Math.floor(r() * tones.length)] });
        z -= w + 0.003;
      }
    }
  });
  const spineMat = mat({ color: '#ffffff', roughness: 0.68 });
  boxes(scene, books, spineMat);
  // floor and ceiling
  const floor = new THREE.Mesh(keep(new THREE.PlaneGeometry(AISLE + 2, LEN + 4)), mat({ color: '#3a2016', roughness: 0.4, metalness: 0.1 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = -LEN / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  boxes(scene, [{ x: 0, y: HT + 0.15, z: -LEN / 2, sx: AISLE + 2, sy: 0.3, sz: LEN + 4 }], mat({ color: '#2a140e' }));
  // the window at the end of the aisle, and the lamps hanging down it
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
  const win = new THREE.Mesh(
    keep(new THREE.PlaneGeometry(AISLE + 0.6, HT)),
    mat({ map: winTex, emissive: '#ffffff', emissiveMap: winTex, emissiveIntensity: 1.1 })
  );
  win.position.set(0, HT / 2, -LEN - 0.4);
  scene.add(win);
  const lampList = [];
  for (let z = -2; z > -LEN; z -= 4.2) lampList.push({ x: 0, y: HT - 1.1, z, sx: 0.32, sy: 0.18, sz: 0.32 });
  boxes(scene, lampList, mat({ color: '#ffd08a', emissive: '#ffb860', emissiveIntensity: 2.2 }), { cast: false });
  // the lamps actually light the aisle: a warm pool under each of the nearest few
  lampList.slice(0, 5).forEach((l) => {
    const bulb = new THREE.PointLight('#ffc27a', 5, 9, 1.6);
    bulb.position.set(l.x, l.y - 0.3, l.z);
    scene.add(bulb);
  });

  // the posts: four volumes at eye height on the right, a little proud of the rest
  const featured = [];
  info.posts.forEach((post, i) => {
    const colour = { winter: '#2c4a8a', spring: '#a51d33', autumn: '#c8662a', summer: '#1f5fb8' }[post.season] || '#a51d33';
    const m = new THREE.Mesh(
      keep(new THREE.BoxGeometry(DEPTH * 0.9, 0.62, 0.09)),
      keep(new THREE.MeshStandardMaterial({ color: colour, emissive: colour, emissiveIntensity: 0, roughness: 0.5 }))
    );
    const z = featureZ[i];
    m.position.set(AISLE / 2 + DEPTH / 2 - 0.02, 0.14 + FEATURE_LEVEL * (HT / LEVELS) + 0.31, z);
    m.castShadow = true;
    scene.add(m);
    // a bronze band on each, like the staircase's nosing
    const band = new THREE.Mesh(keep(new THREE.BoxGeometry(DEPTH * 0.91, 0.03, 0.092)), mat({ color: BRONZE, metalness: 0.5, roughness: 0.4 }));
    band.position.copy(m.position).add(new THREE.Vector3(0, 0.22, 0));
    scene.add(band);
    featured.push({ mesh: m, band, home: m.position.clone(), lift: 0 });
  });

  kit.shafts(scene, { color: '#ffbf80', dir: rig.dir, at: new THREE.Vector3(0, 3, -LEN / 2), count: 3, spread: 0.8, length: LEN + 6, width: 1.2, opacity: 0.08 });
  kit.dust(scene, { box: new THREE.Box3(new THREE.Vector3(-AISLE / 2, 0.3, -LEN), new THREE.Vector3(AISLE / 2, HT, 0)), count: small ? 140 : 260, size: 0.035, color: '#ffd9a8', opacity: 0.55 });

  let chosen = -1;
  const look = new THREE.Vector3();
  return {
    scene,
    camera,
    haze,
    density: 0.034,
    choose(i) {
      chosen = i;
    },
    place(p, t, still) {
      const z = lerp(1.4, -9.5, p);
      camera.position.set(-0.45, 1.6, z);
      look.set(0.25, 1.75, z - 6);
      camera.lookAt(look);
      camera.rotateZ(0.025);
      rig.follow(new THREE.Vector3(0, 2, z - 6));
      let moving = false;
      featured.forEach((f, i) => {
        const goal = i === chosen ? 1 : 0;
        f.lift += (goal - f.lift) * (still ? 1 : 0.18);
        if (Math.abs(goal - f.lift) > 0.002) moving = true;
        f.mesh.position.x = f.home.x - f.lift * 0.16;
        f.band.position.x = f.mesh.position.x;
        f.mesh.material.emissiveIntensity = f.lift * 0.9;
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
