import confetti from 'canvas-confetti';
import gsap from 'gsap';

export class ComboBanner {
  private bannerEl: HTMLElement;
  private cutInEl: HTMLElement;

  constructor(containerEl: HTMLElement) {
    this.bannerEl = document.createElement('div');
    this.bannerEl.className = 'combo-banner';
    containerEl.appendChild(this.bannerEl);

    this.cutInEl = document.createElement('div');
    this.cutInEl.className = 'cutin-banner-overlay hidden';
    containerEl.appendChild(this.cutInEl);
  }

  public showCombo(combo: number, isTetris: boolean) {
    if (combo <= 1 && !isTetris) return;

    let text = '';
    let textColor = '#FEE500';
    let textGlow =
      '0 4px 16px rgba(0,0,0,0.9), 0 0 20px rgba(254, 229, 0, 0.8)';

    if (isTetris) {
      text = '4줄 퍼펙트 TETRIS!';
      textColor = '#FFD700';
      textGlow = '0 4px 20px rgba(0,0,0,0.9), 0 0 25px rgba(255, 215, 0, 0.9)';
      this.showCutIn('RYAN SPECIAL', '4줄 퍼펙트 클리어!', '#FEE500');
    } else if (combo >= 5) {
      text = `바이브 마스터 ${combo}연속 콤보!`;
      textColor = '#FF4500';
      textGlow = '0 4px 20px rgba(0,0,0,0.9), 0 0 25px rgba(255, 69, 0, 0.9)';
      this.showCutIn('ULTRA COMBO', `${combo} COMBO STREAK!`, '#FF4500');
    } else if (combo >= 3) {
      text = `바이브 콤보 ${combo}연속!`;
      textColor = '#FF69B4';
      textGlow =
        '0 4px 20px rgba(0,0,0,0.9), 0 0 25px rgba(255, 105, 180, 0.9)';
    } else {
      text = `${combo}연속 콤보!`;
      textColor = '#FEE500';
      textGlow = '0 4px 16px rgba(0,0,0,0.9), 0 0 20px rgba(254, 229, 0, 0.8)';
    }

    this.bannerEl.innerText = text;
    this.bannerEl.style.color = textColor;
    this.bannerEl.style.textShadow = textGlow;

    gsap.killTweensOf(this.bannerEl);
    gsap.fromTo(
      this.bannerEl,
      { scale: 0.7, opacity: 0, y: -10 },
      {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: 'back.out(1.5)',
        onComplete: () => {
          gsap.to(this.bannerEl, {
            opacity: 0,
            y: -15,
            scale: 0.9,
            delay: 0.8,
            duration: 0.25,
            ease: 'power2.in',
          });
        },
      },
    );
  }

  public showFeverStart() {
    this.showCutIn('VIBE FEVER MODE', '점수 2배 폭주 발동!', '#FEE500', true);
  }

  public showCutIn(
    title: string,
    subtitle: string,
    accentColor = '#FEE500',
    isFever = false,
  ) {
    this.cutInEl.innerHTML = `
      <div class="cutin-strip" style="--cutin-accent: ${accentColor}">
        <div class="cutin-content">
          <span class="cutin-badge">SPECIAL CUT-IN</span>
          <h2 class="cutin-title">${title}</h2>
          <p class="cutin-sub">${subtitle}</p>
        </div>
      </div>
    `;

    this.cutInEl.classList.remove('hidden');

    // Confetti burst for Cut-In
    confetti({
      particleCount: isFever ? 100 : 60,
      spread: 70,
      origin: { y: 0.5 },
      colors: [accentColor, '#FFFFFF', '#FFD700', '#FF69B4'],
    });

    const strip = this.cutInEl.querySelector('.cutin-strip');
    gsap.killTweensOf(strip);

    gsap.fromTo(
      strip,
      { x: '-100%', opacity: 0, skewX: -20 },
      {
        x: '0%',
        opacity: 1,
        skewX: 0,
        duration: 0.3,
        ease: 'power3.out',
        onComplete: () => {
          gsap.to(strip, {
            x: '100%',
            opacity: 0,
            skewX: 20,
            delay: 0.7,
            duration: 0.3,
            ease: 'power3.in',
            onComplete: () => {
              this.cutInEl.classList.add('hidden');
            },
          });
        },
      },
    );
  }
}
