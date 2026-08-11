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
    let textColor = '#FFB800';

    if (isTetris) {
      text = 'KODE RUNNER 4-LINE CLEAR!';
      textColor = '#FFD700';
    } else if (combo >= 5) {
      text = `VIBE MASTER x${combo}!`;
      textColor = '#FF4500';
    } else if (combo >= 3) {
      text = `VIBE COMBO x${combo}!`;
      textColor = '#FF69B4';
    } else {
      text = `COMBO x${combo}!`;
      textColor = '#FFB800';
    }

    this.bannerEl.innerText = text;
    this.bannerEl.style.color = textColor;

    gsap.killTweensOf(this.bannerEl);
    gsap.fromTo(
      this.bannerEl,
      { scale: 0.2, opacity: 0, y: -20 },
      {
        scale: 1.2,
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: 'back.out(2)',
        onComplete: () => {
          gsap.to(this.bannerEl, {
            opacity: 0,
            scale: 0.9,
            y: 20,
            delay: 0.8,
            duration: 0.3
          });
        }
      }
    );
  }
}
