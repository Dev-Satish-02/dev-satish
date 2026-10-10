import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { fullMotion, introDone, stageProgress } from '../lib/store';

// The hero's 3D stage. Loads the first model in `config.candidates` that exists
// (.vrm through three-vrm, .glb/.gltf through GLTFLoader) or builds a stand-in bust.
// Every rig exposes the same hooks: look at the cursor, breathe, and the head tilt.

const TILT = -0.72; // ~41°, the head tilt

function toonGradient() {
  const data = new Uint8Array([70, 70, 70, 255, 160, 160, 160, 255, 255, 255, 255, 255]);
  const tex = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

async function exists(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    // dev servers answer unknown paths with index.html, so an HTML reply means "missing"
    return res.ok && !(res.headers.get('content-type') || '').includes('text/html');
  } catch {
    return false;
  }
}

/* ── stand-in: a cel-shaded bust, glasses and blazer, until the real model arrives ── */
function buildStandIn(gradientMap) {
  const mat = (color) => new THREE.MeshToonMaterial({ color, gradientMap });
  const root = new THREE.Group();

  const blazer = mat('#1d2442');
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.38, 6, 24), blazer);
  torso.scale.set(1.3, 1, 0.72);
  torso.position.y = 0.52;
  root.add(torso);

  const shirt = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.42, 3), mat('#dfe6fb'));
  shirt.rotation.x = Math.PI;
  shirt.position.set(0, 0.88, 0.25);
  shirt.scale.z = 0.4;
  root.add(shirt);

  const skin = mat('#e9b48e');
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.115, 0.26, 20), skin);
  neck.position.y = 1.06;
  root.add(neck);

  const head = new THREE.Group();
  head.position.y = 1.16; // pivot at the top of the neck, so the tilt swings the whole head
  root.add(head);

  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.27, 32, 24), skin);
  skull.scale.set(0.95, 1.12, 1);
  skull.position.y = 0.27;
  head.add(skull);

  const hairMat = mat('#141018');
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.29, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.52), hairMat);
  hair.scale.set(1, 1.05, 1.04);
  hair.position.set(0, 0.32, -0.015);
  hair.rotation.x = -0.18;
  head.add(hair);
  const fringe = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.09, 0.12), hairMat);
  fringe.position.set(0.02, 0.5, 0.2);
  fringe.rotation.set(0.5, 0, -0.12);
  head.add(fringe);

  [-1, 1].forEach((s) => {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 12), skin);
    ear.position.set(0.26 * s, 0.27, 0);
    ear.scale.z = 0.6;
    head.add(ear);
  });

  const eyes = [];
  const frameMat = mat('#d9dde6');
  [-1, 1].forEach((s) => {
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.068, 0.008, 8, 32), frameMat);
    rim.position.set(0.098 * s, 0.29, 0.262);
    head.add(rim);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 12), mat('#120c10'));
    eye.position.set(0.098 * s, 0.285, 0.25);
    eye.userData.base = eye.position.clone();
    head.add(eye);
    eyes.push(eye);
  });
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.012, 0.012), frameMat);
  bridge.position.set(0, 0.3, 0.262);
  head.add(bridge);

  return {
    root,
    outline: true,
    frame: { center: new THREE.Vector3(0, 0.95, 0), height: 2.05 },
    update(dt, t, look, tilt, breathe) {
      torso.scale.y = 1 + (breathe ? Math.sin(t * 1.7) * 0.012 : 0);
      head.rotation.set(-look.y * 0.22, look.x * 0.45, tilt);
      eyes.forEach((e) => {
        e.position.x = e.userData.base.x + look.x * 0.02;
        e.position.y = e.userData.base.y + look.y * 0.015;
      });
    },
  };
}

/* ── VRM (e.g. exported from VRoid Studio) ── */
function rigVRM(vrm, config) {
  VRMUtils.removeUnnecessaryVertices(vrm.scene);
  VRMUtils.rotateVRM0(vrm);
  const bone = (name) => vrm.humanoid?.getNormalizedBoneNode(name);
  const lArm = bone('leftUpperArm');
  const rArm = bone('rightUpperArm');
  if (lArm) lArm.rotation.z = -1.2; // out of the T-pose
  if (rArm) rArm.rotation.z = 1.2;
  const neck = bone('neck');
  const headBone = bone('head');
  const spine = bone('spine');

  const target = new THREE.Object3D();
  vrm.scene.add(target);
  if (vrm.lookAt) vrm.lookAt.target = target;

  vrm.scene.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(vrm.scene);
  const size = box.getSize(new THREE.Vector3());
  const headY = headBone ? headBone.getWorldPosition(new THREE.Vector3()).y : box.max.y * 0.9;

  let nextBlink = 2;
  return {
    root: vrm.scene,
    outline: false, // MToon draws its own outlines
    frame: framing(box, size, config, headY),
    update(dt, t, look, tilt, breathe) {
      if (spine) spine.rotation.x = breathe ? Math.sin(t * 1.7) * 0.02 : 0;
      if (neck) neck.rotation.z = tilt * 0.55;
      if (headBone) headBone.rotation.z = tilt * 0.45;
      target.position.set(look.x * 0.8, headY + look.y * 0.4, 2);
      if (vrm.expressionManager) {
        const phase = t - nextBlink;
        let blink = 0;
        if (phase > 0) blink = phase < 0.08 ? phase / 0.08 : phase < 0.16 ? 1 - (phase - 0.08) / 0.08 : 0;
        if (phase > 0.16) nextBlink = t + 2.5 + Math.random() * 3;
        vrm.expressionManager.setValue('blink', breathe ? blink : 0);
      }
      vrm.update(dt);
    },
  };
}

/* ── plain glTF / GLB ── */
function rigGLTF(gltf, config, gradientMap) {
  const root = gltf.scene;
  if (config.toon) {
    root.traverse((o) => {
      if (!o.isMesh) return;
      const swap = (m) =>
        m.isMeshStandardMaterial || m.isMeshPhysicalMaterial || m.isMeshPhongMaterial || m.isMeshLambertMaterial
          ? new THREE.MeshToonMaterial({
              name: m.name,
              color: m.color,
              map: m.map,
              emissive: m.emissive,
              emissiveMap: m.emissiveMap,
              emissiveIntensity: m.emissiveIntensity ?? 1,
              alphaMap: m.alphaMap,
              transparent: m.transparent,
              opacity: m.opacity,
              side: m.side,
              gradientMap,
            })
          : m;
      o.material = Array.isArray(o.material) ? o.material.map(swap) : swap(o.material);
    });
  }

  // scale to the configured height, centred, feet on the floor
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const k = config.height / (size.y || 1);
  root.scale.setScalar(k);
  root.updateMatrixWorld(true);
  box.setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  root.position.x -= center.x;
  root.position.z -= center.z;
  root.position.y -= box.min.y;
  root.updateMatrixWorld(true);
  box.setFromObject(root);

  const mixer = gltf.animations.length ? new THREE.AnimationMixer(root) : null;
  if (mixer) {
    const clip = THREE.AnimationClip.findByName(gltf.animations, config.idleClip) || gltf.animations[0];
    mixer.clipAction(clip).play();
  }

  const head = root.getObjectByName(config.headNode);
  const base = head ? head.quaternion.clone() : null;
  const extra = new THREE.Quaternion();
  const euler = new THREE.Euler();
  const headY = head ? head.getWorldPosition(new THREE.Vector3()).y : box.max.y * 0.88;

  // optional hooks by node name: Blink* alternate on/off (crossing lights), Float* bob gently
  const blinkers = [];
  const floaters = [];
  root.traverse((o) => {
    if (/^Blink/i.test(o.name)) blinkers.push(o);
    if (/^Float/i.test(o.name)) floaters.push({ o, y: o.position.y, phase: Math.random() * 6 });
  });

  return {
    root,
    outline: config.toon,
    frame: framing(box, size.multiplyScalar(k), config, headY),
    update(dt, t, look, tilt, breathe) {
      mixer?.update(breathe ? dt : 0);
      if (head) {
        euler.set(-look.y * 0.2, look.x * 0.4, tilt);
        extra.setFromEuler(euler);
        head.quaternion.copy(base).multiply(extra);
      } else {
        root.rotation.z = tilt * 0.25; // no head node: the whole thing leans
        root.rotation.y = look.x * 0.25;
      }
      const on = Math.floor(t * 1.6) % 2;
      blinkers.forEach((o, i) => {
        o.visible = breathe ? (i % 2) === on : true;
      });
      floaters.forEach((f) => {
        f.o.position.y = f.y + (breathe ? Math.sin(t * 1.2 + f.phase) * 0.03 : 0);
      });
    },
  };
}

function framing(box, size, config, headY) {
  if (config.frame === 'upper') {
    const bottom = box.max.y - size.y * 0.55;
    return { center: new THREE.Vector3(0, (bottom + box.max.y) / 2, 0), height: size.y * 0.6, headY };
  }
  return { center: box.getCenter(new THREE.Vector3()), height: size.y * 1.08, headY };
}

export function createStage(container, config) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, 0.05, 60);
  scene.add(new THREE.HemisphereLight('#fff1f4', '#3a1520', 1.6));
  const key = new THREE.DirectionalLight('#ffffff', 2.4);
  key.position.set(2.5, 4, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight('#ff3355', 2.2);
  rim.position.set(-3, 2.5, -2.5);
  scene.add(rim);

  const outline = new OutlineEffect(renderer, { defaultThickness: 0.0045, defaultColor: [0.1, 0.05, 0.07] });
  const gradientMap = toonGradient();

  let rig = null;
  let disposed = false;
  const stage = new THREE.Group();
  scene.add(stage);

  const look = { x: 0, y: 0 };
  const lookTarget = { x: 0, y: 0 };
  let hover = false;
  let tilt = 0;
  let rise = 0; // 0 → 1 entrance after the intro
  let nextIdleTilt = 6;

  function fitCamera() {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    if (rig) {
      const { center, height } = rig.frame;
      const fov = THREE.MathUtils.degToRad(camera.fov);
      let dist = height / 2 / Math.tan(fov / 2);
      if (camera.aspect < 0.75) dist /= camera.aspect / 0.75; // keep it inside narrow frames
      camera.position.set(center.x, center.y + height * 0.04, center.z + dist);
      camera.lookAt(center);
    }
    camera.updateProjectionMatrix();
  }

  function setRig(next) {
    rig = next;
    stage.add(rig.root);
    fitCamera();
    stageProgress.set(1);
  }

  async function load() {
    stageProgress.set(0.25);
    for (const url of config.candidates) {
      const full = `${import.meta.env.BASE_URL}${url}`;
      // eslint-disable-next-line no-await-in-loop
      if (!(await exists(full))) continue;
      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);
      const isVRM = /\.vrm$/i.test(url);
      if (isVRM) loader.register((parser) => new VRMLoaderPlugin(parser));
      try {
        // eslint-disable-next-line no-await-in-loop
        const gltf = await loader.loadAsync(full, (e) => {
          if (e.total) stageProgress.set(0.25 + (e.loaded / e.total) * 0.7);
        });
        if (disposed) return;
        const vrm = gltf.userData.vrm;
        setRig(isVRM && vrm ? rigVRM(vrm, config) : rigGLTF(gltf, config, gradientMap));
        return;
      } catch (err) {
        console.warn(`[stage] could not load ${url}, using the stand-in`, err);
      }
    }
    if (!disposed) setRig(buildStandIn(gradientMap));
  }

  const onPointer = (e) => {
    const r = container.getBoundingClientRect();
    lookTarget.x = THREE.MathUtils.clamp(((e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)) * 1.4, -1, 1);
    lookTarget.y = THREE.MathUtils.clamp((-(e.clientY - (r.top + r.height * 0.35)) / (window.innerHeight / 2)) * 1.4, -1, 1);
  };
  const onEnter = () => {
    hover = true;
  };
  const onLeave = () => {
    hover = false;
  };
  window.addEventListener('pointermove', onPointer);
  container.addEventListener('pointerenter', onEnter);
  container.addEventListener('pointerleave', onLeave);
  container.addEventListener('focus', onEnter);
  container.addEventListener('blur', onLeave);

  const resize = new ResizeObserver(fitCamera);
  resize.observe(container);

  let visible = true;
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  });
  io.observe(container);

  const timer = new THREE.Timer();
  let raf;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    timer.update(now);
    const dt = Math.min(timer.getDelta(), 0.05);
    if (!visible || document.hidden || !rig) return;
    const t = timer.getElapsed();
    const motion = fullMotion();

    // the occasional unprompted head tilt
    let idle = false;
    if (motion && introDone.get()) {
      if (t > nextIdleTilt + 1.6) nextIdleTilt = t + 7 + Math.random() * 5;
      idle = t > nextIdleTilt;
    }
    const want = hover || idle ? TILT : 0;
    const k = 1 - Math.exp(-dt * 6); // frame-rate independent easing
    tilt += (want - tilt) * (motion ? k : 1);
    look.x += ((motion ? lookTarget.x : 0) - look.x) * k;
    look.y += ((motion ? lookTarget.y : 0) - look.y) * k;

    if (introDone.get()) rise = motion ? Math.min(1, rise + dt * 1.1) : 1;
    const ease = 1 - Math.pow(1 - rise, 3);
    stage.position.y = (1 - ease) * -0.35;
    stage.rotation.y = (1 - ease) * 0.6;

    rig.update(dt, t, look, tilt, motion);
    if (rig.outline) outline.render(scene, camera);
    else renderer.render(scene, camera);
  }

  load().catch((err) => {
    console.warn('[stage] failed', err);
    stageProgress.set(1);
  });
  raf = requestAnimationFrame(frame);

  return {
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      resize.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onPointer);
      container.removeEventListener('pointerenter', onEnter);
      container.removeEventListener('pointerleave', onLeave);
      container.removeEventListener('focus', onEnter);
      container.removeEventListener('blur', onLeave);
      if (rig) VRMUtils.deepDispose(rig.root);
      gradientMap.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
