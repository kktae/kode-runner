import gsap from 'gsap';

export class ComboBanner {
  private bannerEl: HTMLElement;

  constructor(containerEl: HTMLElement) {
    this.bannerEl = document.createElement('div');
    this.bannerEl.className = 'combo-banner';
    containerEl.appendChild(this.bannerEl);
  }

  public showCombo(combo: number, isTetris: boolean) {
    if (combo <= 1 && !isTetris) return;

    let text = '';
    let textColor = '#FEE500';
    let textGlow = '0 0 20px rgba(254, 229, 0, 0.8)';

    if (isTetris) {
      text = '코드 러너 4줄 퍼펙트 클리어!';
      textColor = '#FFD700';
      textGlow = '0 0 30px rgba(255, 215, 0, 0.9), 0 0 60px rgba(255, 215, 0, 0.5)';
    } else if (combo >= 5) {
      text = `바이브 마스터 ${combo}연속 콤보!`;
      textColor = '#FF4500';
      textGlow = '0 0 30px rgba(255, 69, 0, 0.9), 0 0 60px rgba(255, 69, 0, 0.5)';
    } else if (combo >= 3) {
      text = `바이브 콤보 ${combo}연속!`;
      textColor = '#FF69B4';
      textGlow = '0 0 25px rgba(255, 105, 180, 0.9), 0 0 50px rgba(255, 105, 180, 0.5)';
    } else {
      text = `${combo}연속 콤보!`;
      textColor = '#FEE500';
      textGlow = '0 0 20px rgba(254, 229, 0, 0.8)';
    }

    this.bannerEl.innerText = text;
    this.bannerEl.style.color = textColor;
    this.bannerEl.style.textShadow = textGlow;

    gsap.killTweensOf(this.bannerEl);
    gsap.fromTo(
      this.bannerEl,
      { scale: 0.1, opacity: 0, y: -30, rotation: -6 },
      {
        scale: 1.3,
        opacity: 1,
        y: 0,
        rotation: 0,
        duration: 0.45,
        ease: 'elastic.out(1.2, 0.4)',
        onComplete: () => {
          gsap.to(this.bannerEl, {
            opacity: 0,
            scale: 0.85,
            y: 30,
            delay: 0.9,
            duration: 0.35,
            ease: 'power2.in'
          });
        }
      }
    );
  }
}
