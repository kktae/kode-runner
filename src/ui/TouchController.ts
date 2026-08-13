/**
 * On-Screen Virtual Touch Controller D-Pad for Mobile & Tablet Booth Guests
 * Includes Web Vibration Haptic Feedback
 */
export class TouchController {
  private containerEl: HTMLElement;

  constructor(
    containerEl: HTMLElement,
    callbacks: {
      onLeft: () => void;
      onRight: () => void;
      onSoftDrop: () => void;
      onHardDrop: () => void;
      onRotateCW: () => void;
      onHold: () => void;
    },
  ) {
    this.containerEl = document.createElement('div');
    this.containerEl.className = 'touch-controller-container';

    this.containerEl.innerHTML = `
      <div class="touch-dpad-grid">
        <div class="dpad-row top">
          <button type="button" id="touch-rotate" class="touch-btn primary" title="블록 회전">↑</button>
        </div>
        <div class="dpad-row bottom">
          <button type="button" id="touch-left" class="touch-btn" title="좌로 이동">←</button>
          <button type="button" id="touch-down" class="touch-btn" title="소프트 드롭">↓</button>
          <button type="button" id="touch-right" class="touch-btn" title="우로 이동">→</button>
        </div>
      </div>
      <div class="touch-actions">
        <button type="button" id="touch-hold" class="touch-btn secondary" title="홀드">HOLD</button>
        <button type="button" id="touch-drop" class="touch-btn accent" title="하드 드롭">HARD DROP</button>
      </div>
    `;

    containerEl.appendChild(this.containerEl);

    // Bind Touch Events with Passive False & Vibration Haptic Feedback
    this.bindBtn('touch-left', callbacks.onLeft, 10);
    this.bindBtn('touch-right', callbacks.onRight, 10);
    this.bindBtn('touch-down', callbacks.onSoftDrop, 10);
    this.bindBtn('touch-drop', callbacks.onHardDrop, [20, 10, 30]);
    this.bindBtn('touch-rotate', callbacks.onRotateCW, 12);
    this.bindBtn('touch-hold', callbacks.onHold, 20);
  }

  /**
   * 인라인 style.display를 쓰면 모바일 전용 미디어쿼리를 이겨버려 데스크톱에서도 D-pad가
   * 노출된다. 클래스 토글만 하고 실제 노출 여부는 CSS(미디어쿼리)가 결정하게 둔다.
   */
  public setVisible(visible: boolean) {
    this.containerEl.classList.toggle('is-hidden', !visible);
  }

  private triggerHaptic(pattern: number | number[]) {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore if unsupported
      }
    }
  }

  private bindBtn(id: string, action: () => void, hapticPattern: number | number[]) {
    const btn = document.getElementById(id);
    if (!btn) return;

    btn.addEventListener(
      'touchstart',
      (e) => {
        e.preventDefault();
        this.triggerHaptic(hapticPattern);
        action();
      },
      { passive: false },
    );

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      this.triggerHaptic(hapticPattern);
      action();
    });
  }
}
