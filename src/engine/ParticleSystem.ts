import gsap from 'gsap';
import confetti from 'canvas-confetti';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private canvasElement: HTMLCanvasElement;

  constructor(canvasElement: HTMLCanvasElement) {
    this.canvasElement = canvasElement;
  }

  public addLineExplosion(yRow: number, rowCellWidth: number, cellHeight: number, colors: string[]) {
    const numParticles = 30;
    const yCenter = yRow * cellHeight + cellHeight / 2;

    for (let i = 0; i < numParticles; i++) {
      const x = Math.random() * (rowCellWidth * 10);
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      const color = colors[Math.floor(Math.random() * colors.length)] || '#FFB800';

      this.particles.push({
        x,
        y: yCenter,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1, // Slight upward bias
        color,
        size: 3 + Math.random() * 5,
        alpha: 1,
        life: 0,
        maxLife: 30 + Math.random() * 20
      });
    }
  }

  public triggerScreenShake(intensity = 8) {
    gsap.to(this.canvasElement, {
      x: `+=${(Math.random() - 0.5) * intensity}`,
      y: `+=${(Math.random() - 0.5) * intensity}`,
      duration: 0.04,
      repeat: 5,
      yoyo: true,
      ease: 'sine.inOut',
      onComplete: () => {
        gsap.set(this.canvasElement, { x: 0, y: 0 });
      }
    });
  }

  public triggerConfetti() {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFB800', '#FF69B4', '#FFA500', '#FFD700', '#1E90FF', '#00FA9A']
    });
  }

  public update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15; // Gravity
      p.alpha = 1 - p.life / p.maxLife;

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
