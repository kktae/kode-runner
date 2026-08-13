/**
 * On-Screen Direct Canvas Touch Gesture Controller
 * Supports Tap to Rotate, Swipe Left/Right to Move, Swipe Down to Hard Drop, Drag to Soft Drop
 */
export class GestureController {
  private element: HTMLElement;
  private callbacks: {
    onLeft: () => void;
    onRight: () => void;
    onSoftDrop: () => void;
    onHardDrop: () => void;
    onRotateCW: () => void;
    onHold: () => void;
  };

  private startX = 0;
  private startY = 0;
  private startTime = 0;
  private lastTapTime = 0;
  private isEnabled = true;

  constructor(
    element: HTMLElement,
    callbacks: {
      onLeft: () => void;
      onRight: () => void;
      onSoftDrop: () => void;
      onHardDrop: () => void;
      onRotateCW: () => void;
      onHold: () => void;
    },
  ) {
    this.element = element;
    this.callbacks = callbacks;
    this.initEvents();
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  private initEvents() {
    this.element.addEventListener(
      'touchstart',
      (e) => {
        if (!this.isEnabled) return;
        if (e.touches.length > 1) {
          // Multi-touch -> Hold
          e.preventDefault();
          this.triggerHaptic(20);
          this.callbacks.onHold();
          return;
        }

        const touch = e.touches[0];
        this.startX = touch.clientX;
        this.startY = touch.clientY;
        this.startTime = Date.now();
      },
      { passive: false },
    );

    this.element.addEventListener(
      'touchend',
      (e) => {
        if (!this.isEnabled || e.changedTouches.length === 0) return;
        e.preventDefault();

        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - this.startX;
        const deltaY = touch.clientY - this.startY;
        const duration = Date.now() - this.startTime;

        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        const minSwipeDist = 25;

        if (absX < minSwipeDist && absY < minSwipeDist && duration < 250) {
          // Tap Action -> Rotate CW
          const now = Date.now();
          if (now - this.lastTapTime < 300) {
            // Double Tap -> Hold
            this.triggerHaptic(25);
            this.callbacks.onHold();
          } else {
            // Single Tap -> Rotate CW
            this.triggerHaptic(12);
            this.callbacks.onRotateCW();
          }
          this.lastTapTime = now;
          return;
        }

        // Swipe Gestures
        if (absX > absY && absX > minSwipeDist) {
          // Horizontal Swipe
          if (deltaX > 0) {
            this.triggerHaptic(10);
            this.callbacks.onRight();
          } else {
            this.triggerHaptic(10);
            this.callbacks.onLeft();
          }
        } else if (absY > absX && absY > minSwipeDist) {
          // Vertical Swipe
          if (deltaY > 0) {
            if (duration < 200) {
              // Fast Swipe Down -> Hard Drop
              this.triggerHaptic([20, 10, 30]);
              this.callbacks.onHardDrop();
            } else {
              // Slow Drag Down -> Soft Drop
              this.triggerHaptic(10);
              this.callbacks.onSoftDrop();
            }
          }
        }
      },
      { passive: false },
    );
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
}
