// Falling cherry-blossom petals for the hero.

const rand = (a, b) => a + Math.random() * (b - a);
const COLORS = ['#f7c5cf', '#fbe2e7', '#ea93a7', '#f4b2c0'];

function spawn(w, h, fromTop) {
  return {
    x: rand(-50, w),
    y: fromTop ? rand(-60, -10) : rand(0, h),
    vx: rand(0.2, 0.8),
    vy: rand(0.5, 1.1),
    size: rand(5, 9),
    rot: rand(0, Math.PI * 2),
    vr: rand(-0.03, 0.03),
    sway: rand(0, Math.PI * 2),
    color: COLORS[(Math.random() * COLORS.length) | 0],
  };
}

export class PetalField {
  constructor(canvas, count) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.count = count;
    this.resize();
    this.items = Array.from({ length: count }, () => spawn(this.w, this.h, false));
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = this.canvas.clientWidth;
    this.h = this.canvas.clientHeight;
    this.canvas.width = this.w * dpr;
    this.canvas.height = this.h * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  step() {
    const { ctx, w, h } = this;
    ctx.clearRect(0, 0, w, h);
    this.items.forEach((q, i) => {
      q.sway += 0.02;
      q.x += q.vx + Math.sin(q.sway) * 0.5;
      q.y += q.vy;
      q.rot += q.vr;
      if (q.y > h + 20 || q.x > w + 40) this.items[i] = spawn(w, h, true);
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
    });
  }
}
