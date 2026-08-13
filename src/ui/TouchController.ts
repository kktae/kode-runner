/**
 * On-Screen Virtual Touch Controller D-Pad for Mobile & Tablet Booth Guests
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

    // Bind Touch Events with Passive False
    this.bindBtn('touch-left', callbacks.onLeft);
    this.bindBtn('touch-right', callbacks.onRight);
    this.bindBtn('touch-down', callbacks.onSoftDrop);
    this.bindBtn('touch-drop', callbacks.onHardDrop);
    this.bindBtn('touch-rotate', callbacks.onRotateCW);
    this.bindBtn('touch-hold', callbacks.onHold);
  }

  private bindBtn(id: string, action: () => void) {
    const btn = document.getElementById(id);
    if (!btn) return;

    btn.addEventListener(
      'touchstart',
      (e) => {
        e.preventDefault();
        action();
      },
      { passive: false },
    );

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      action();
    });
  }
}
