// Small 2D particle engine for the seasonal weather and the cursor trail.

const rand = (a, b) => a + Math.random() * (b - a);

const PETAL_COLORS = ['#f7c5cf', '#fbe2e7', '#ea93a7', '#f4b2c0'];
const LEAF_COLORS = ['#e2531c', '#f2a541', '#c63b16', '#f07f2a'];

export const KINDS = {
  petal: {
    spawn: (w, h, p) => ({
      x: p ? p.x : rand(-50, w),
      y: p ? p.y : rand(-h * 0.2, -10),
      vx: p ? rand(-0.6, 0.6) : rand(0.3, 1.1),
      vy: p ? rand(0.2, 0.9) : rand(0.6, 1.4),
      size: p ? rand(4, 7) : rand(6, 11),
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.04, 0.04),
      sway: rand(0, Math.PI * 2),
      color: PETAL_COLORS[(Math.random() * PETAL_COLORS.length) | 0],
    }),
    draw(ctx, q) {
      ctx.save();
      ctx.translate(q.x, q.y);
      ctx.rotate(q.rot);
      ctx.scale(1, 0.55 + 0.45 * Math.sin(q.sway * 2));
      ctx.fillStyle = q.color;
      ctx.beginPath();
      ctx.moveTo(0, -q.size);
      ctx.quadraticCurveTo(q.size, -q.size * 0.2, 0, q.size);
      ctx.quadraticCurveTo(-q.size, -q.size * 0.2, 0, -q.size);
      ctx.fill();
      ctx.restore();
    },
  },
  leaf: {
    spawn: (w, h, p) => ({
      x: p ? p.x : rand(0, w),
      y: p ? p.y : rand(-h * 0.2, -10),
      vx: p ? rand(-0.8, 0.8) : rand(-0.4, 0.8),
      vy: p ? rand(0.3, 1) : rand(0.9, 1.8),
      size: p ? rand(5, 8) : rand(8, 14),
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.06, 0.06),
      sway: rand(0, Math.PI * 2),
      color: LEAF_COLORS[(Math.random() * LEAF_COLORS.length) | 0],
    }),
    draw(ctx, q) {
      ctx.save();
      ctx.translate(q.x, q.y);
      ctx.rotate(q.rot);
      ctx.fillStyle = q.color;
      ctx.beginPath();
      // a five-lobed leaf
      for (let i = 0; i < 5; i += 1) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const b = a + Math.PI / 5;
        ctx.lineTo(Math.cos(a) * q.size, Math.sin(a) * q.size);
        ctx.lineTo(Math.cos(b) * q.size * 0.45, Math.sin(b) * q.size * 0.45);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    },
  },
  snow: {
    spawn: (w, h, p) => ({
      x: p ? p.x : rand(0, w),
      y: p ? p.y : rand(-h * 0.2, -10),
      vx: rand(-0.3, 0.3),
      vy: p ? rand(0.2, 0.7) : rand(0.4, 1.2),
      size: p ? rand(1.5, 3) : rand(1.5, 4),
      rot: 0,
      vr: 0,
      sway: rand(0, Math.PI * 2),
      color: '#ffffff',
    }),
    draw(ctx, q) {
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = q.color;
      ctx.beginPath();
      ctx.arc(q.x, q.y, q.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    },
  },
  rain: {
    spawn: (w, h, p) => ({
      x: p ? p.x : rand(-100, w),
      y: p ? p.y : rand(-h * 0.3, -10),
      vx: 2.2,
      vy: p ? rand(4, 7) : rand(13, 19),
      size: p ? rand(6, 10) : rand(12, 22),
      rot: 0,
      vr: 0,
      sway: 0,
      color: 'rgba(190, 205, 230, 0.55)',
    }),
    draw(ctx, q) {
      ctx.strokeStyle = q.color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(q.x, q.y);
      ctx.lineTo(q.x - q.vx * (q.size / q.vy), q.y - q.size);
      ctx.stroke();
    },
  },
  spark: {
    spawn: (w, h, p) => ({
      x: p.x,
      y: p.y,
      vx: rand(-1, 1),
      vy: rand(-1, 1),
      size: rand(2, 4),
      rot: rand(0, Math.PI),
      vr: 0.05,
      sway: 0,
      color: Math.random() < 0.5 ? '#ff2b3f' : '#ffffff',
    }),
    draw(ctx, q) {
      ctx.save();
      ctx.translate(q.x, q.y);
      ctx.rotate(q.rot);
      ctx.fillStyle = q.color;
      ctx.fillRect(-q.size / 2, -q.size / 2, q.size, q.size);
      ctx.restore();
    },
  },
};

// Ambient density per season (particles alive at once on a 1440px-wide screen).
export const AMBIENT = {
  spring: { kind: 'petal', count: 34 },
  summer: null,
  autumn: { kind: 'leaf', count: 26 },
  winter: { kind: 'snow', count: 90 },
  rain: { kind: 'rain', count: 120 },
  finale: { kind: 'petal', count: 24 },
};

// What the cursor sheds in each season.
export const TRAIL = {
  spring: 'petal',
  summer: 'spark',
  autumn: 'leaf',
  winter: 'snow',
  rain: 'rain',
  finale: 'petal',
};

export class ParticleField {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.items = [];
    this.ambient = null;
    this.resize();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = this.w * dpr;
    this.canvas.height = this.h * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  setAmbient(config) {
    this.ambient = config;
  }

  emit(kindName, x, y) {
    const kind = KINDS[kindName];
    if (!kind || this.items.length > 400) return;
    this.items.push({ ...kind.spawn(this.w, this.h, { x, y }), kind, life: 1, decay: rand(0.012, 0.022) });
  }

  step() {
    const { ctx, w, h } = this;
    if (this.ambient) {
      const kind = KINDS[this.ambient.kind];
      const target = Math.round(this.ambient.count * Math.min(1.2, w / 1440));
      const alive = this.items.filter((q) => q.ambient && q.kind === kind).length;
      if (alive < target && Math.random() < 0.5) {
        this.items.push({ ...kind.spawn(w, h), kind, ambient: true, life: 1, decay: 0 });
      }
    }
    ctx.clearRect(0, 0, w, h);
    const next = [];
    for (const q of this.items) {
      q.sway += 0.02;
      q.x += q.vx + Math.sin(q.sway) * (q.kind === KINDS.rain ? 0 : 0.6);
      q.y += q.vy;
      q.rot += q.vr;
      q.life -= q.decay;
      const stillAmbient = q.ambient && this.ambient && KINDS[this.ambient.kind] === q.kind;
      // ambient particles from a season we've left fall out naturally but aren't replaced
      if (q.life <= 0 || q.y > h + 30 || q.x > w + 60 || q.x < -120) continue;
      if (q.ambient && !stillAmbient) q.decay = 0.01;
      ctx.globalAlpha = Math.max(0, Math.min(1, q.life));
      q.kind.draw(ctx, q);
      ctx.globalAlpha = 1;
      next.push(q);
    }
    this.items = next;
  }
}
