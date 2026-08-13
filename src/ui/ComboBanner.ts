import confetti from 'canvas-confetti';
import gsap from 'gsap';

export class ComboBanner {
  private bannerEl: HTMLElement;

  constructor(containerEl: HTMLElement) {
    this.bannerEl = document.createElement('div');
    this.bannerEl.className = 'combo-text-overlay';
    containerEl.appendChild(this.bannerEl);
  }

  public showCombo(combo: number, isTetris: boolean) {
    if (combo <= 1 && !isTetris) return;

    let text = '';
    let textColor = '#FEE500';
    let textGlow = '0 0 20px rgba(254, 229, 0, 0.9), 0 4px 14px rgba(0,0,0,0.95)';

    if (isTetris) {
      text = '4줄 클리어 TETRIS!';
      textColor = '#FFDE00';
      textGlow = '0 0 25px rgba(254, 229, 0, 0.95), 0 4px 16px rgba(0,0,0,0.95)';
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.5 },
        colors: ['#FFDE00', '#FFFFFF', '#00C73C'],
      });
    } else if (combo >= 5) {
      text = `MAX STREAK\n${combo}연속 콤보!`;
      textColor = '#FF4500';
      textGlow = '0 0 25px rgba(255, 69, 0, 0.95), 0 4px 16px rgba(0,0,0,0.95)';
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#FF4500', '#FFDE00', '#FFFFFF'],
      });
    } else if (combo >= 3) {
      text = `${combo}연속 콤보!`;
      textColor = '#FF69B4';
      textGlow = '0 0 25px rgba(255, 105, 180, 0.95), 0 4px 16px rgba(0,0,0,0.95)';
    } else {
      text = `${combo}연속 콤보!`;
      textColor = '#FEE500';
      textGlow = '0 0 20px rgba(254, 229, 0, 0.9), 0 4px 14px rgba(0,0,0,0.95)';
    }

    this.bannerEl.innerText = text;
    this.bannerEl.style.color = textColor;
    this.bannerEl.style.borderColor = textColor;
    this.bannerEl.style.textShadow = textGlow;

    gsap.killTweensOf(this.bannerEl);
    gsap.fromTo(
      this.bannerEl,
      { scale: 0.6, opacity: 0, y: -15, xPercent: -50 },
      {
        scale: 1,
        opacity: 1,
        y: 0,
        xPercent: -50,
        duration: 0.3,
        ease: 'back.out(1.6)',
        onComplete: () => {
          gsap.to(this.bannerEl, {
            opacity: 0,
            y: -15,
            scale: 0.85,
            delay: 0.65,
            duration: 0.25,
            ease: 'power2.in',
          });
        },
      },
    );
  }

  public showFeverStart() {
    this.showFloatingText('VIBE FEVER START!', '점수 2배 가속!', '#00C73C');
  }

  public showFloatingText(
    title: string,
    subtitle: string,
    accentColor = '#FEE500',
  ) {
    this.bannerEl.innerText = `${title}\n${subtitle}`;
    this.bannerEl.style.color = accentColor;
    this.bannerEl.style.textShadow = `0 0 25px ${accentColor}, 0 4px 16px rgba(0,0,0,0.95)`;

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
      colors: [accentColor, '#FFFFFF', '#FFDE00'],
    });

    gsap.killTweensOf(this.bannerEl);
    gsap.fromTo(
      this.bannerEl,
      { scale: 0.5, opacity: 0, y: 20 },
      {
        scale: 1.1,
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: 'back.out(2)',
        onComplete: () => {
          gsap.to(this.bannerEl, {
            opacity: 0,
            y: -20,
            scale: 0.95,
            delay: 0.8,
            duration: 0.3,
            ease: 'power2.in',
          });
        },
      },
    );
  }
}
