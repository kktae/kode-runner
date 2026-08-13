import confetti from 'canvas-confetti';
import gsap from 'gsap';

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

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];
  private canvasElement: HTMLCanvasElement;

  constructor(canvasElement: HTMLCanvasElement) {
    this.canvasElement = canvasElement;
  }

  public addLineExplosion(
    yRow: number,
    rowCellWidth: number,
    cellHeight: number,
    colors: string[],
  ) {
    const numParticles = 35;
    const yCenter = yRow * cellHeight + cellHeight / 2;

    for (let i = 0; i < numParticles; i++) {
      const x = Math.random() * (rowCellWidth * 10);
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 7;
      const color =
        colors[Math.floor(Math.random() * colors.length)] || '#FEE500';

      this.particles.push({
        x,
        y: yCenter,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        color,
        size: 3 + Math.random() * 6,
        alpha: 1,
        life: 0,
        maxLife: 35 + Math.random() * 20,
      });
    }
  }

  public addScoreText(score: number) {
    const x = this.canvasElement.width - 15;
    const y = 30;

    this.floatingTexts.push({
      x,
      y,
      text: `+${score.toLocaleString()}`,
      color: '#FEE500',
      alpha: 1,
      life: 0,
      maxLife: 45,
    });
  }

  public triggerScreenShake(intensity = 10) {
    gsap.to(this.canvasElement, {
      x: `+=${(Math.random() - 0.5) * intensity}`,
      y: `+=${(Math.random() - 0.5) * intensity}`,
      duration: 0.04,
      repeat: 6,
      yoyo: true,
      ease: 'sine.inOut',
      onComplete: () => {
        gsap.set(this.canvasElement, { x: 0, y: 0 });
      },
    });
  }

  public triggerConfetti() {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: [
        '#FEE500',
        '#FF69B4',
        '#FFA500',
        '#FFD700',
        '#1E90FF',
        '#00FA9A',
      ],
    });
  }

  public addFeverSparkles() {
    const width = this.canvasElement.width;
    const height = this.canvasElement.height;

    // Create particles strictly along the outer borders so playfield blocks are 100% clear
    for (let i = 0; i < 2; i++) {
      const edge = Math.floor(Math.random() * 4); // 0: Top, 1: Bottom, 2: Left, 3: Right
      let x = 0;
      let y = 0;
      let vx = 0;
      let vy = 0;

      if (edge === 0) {
        x = Math.random() * width;
        y = 2;
        vx = (Math.random() - 0.5) * 2;
        vy = -1 - Math.random() * 3;
      } else if (edge === 1) {
        x = Math.random() * width;
        y = height - 2;
        vx = (Math.random() - 0.5) * 2;
        vy = 1 + Math.random() * 3;
      } else if (edge === 2) {
        x = 2;
        y = Math.random() * height;
        vx = -1 - Math.random() * 3;
        vy = (Math.random() - 0.5) * 2;
      } else {
        x = width - 2;
        y = Math.random() * height;
        vx = 1 + Math.random() * 3;
        vy = (Math.random() - 0.5) * 2;
      }

      this.particles.push({
        x,
        y,
        vx,
        vy,
        color: Math.random() > 0.5 ? '#FF4500' : '#FEE500',
        size: 2 + Math.random() * 3,
        alpha: 0.9,
        life: 0,
        maxLife: 20 + Math.random() * 10,
      });
    }
  }

  public update() {
    // Update Particles
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

    // Update Floating Score Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life++;
      ft.y -= 1.2; // Float upwards
      ft.alpha = 1 - ft.life / ft.maxLife;

      if (ft.life >= ft.maxLife) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();

    // Draw Particles
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Floating Score Texts - Top Right HUD
    ctx.font = '800 16px "Outfit", "Pretendard", sans-serif';
    ctx.textAlign = 'right';

    for (const ft of this.floatingTexts) {
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.fillStyle = ft.color;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 8;
      ctx.fillText(ft.text, ft.x, ft.y);
    }

    ctx.restore();
  }

  public clear() {
    this.particles = [];
    this.floatingTexts = [];
  }
}
