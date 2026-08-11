import type { Howl } from 'howler';

export class SoundManager {
  private static instance: SoundManager;
  private isMuted = false;
  private audioCtx: AudioContext | null = null;
  private bgmHowl: Howl | null = null;

  private constructor() {
    try {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    } catch {
      // AudioContext unavailable or blocked until user interaction
    }
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.bgmHowl) {
      this.bgmHowl.mute(this.isMuted);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  private ensureAudioContext() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Synthesize Arcade Effects via Web Audio API for zero external file dependency
  public playMove() {
    if (this.isMuted) return;
    this.ensureAudioContext();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      880,
      this.audioCtx.currentTime + 0.05,
    );

    gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      this.audioCtx.currentTime + 0.05,
    );

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.05);
  }

  public playRotate() {
    if (this.isMuted) return;
    this.ensureAudioContext();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      1200,
      this.audioCtx.currentTime + 0.08,
    );

    gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      this.audioCtx.currentTime + 0.08,
    );

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.08);
  }

  public playHardDrop() {
    if (this.isMuted) return;
    this.ensureAudioContext();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      40,
      this.audioCtx.currentTime + 0.15,
    );

    gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      this.audioCtx.currentTime + 0.15,
    );

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.15);
  }

  public playLineClear(lines: number, combo = 0) {
    if (this.isMuted) return;
    this.ensureAudioContext();
    if (!this.audioCtx) return;

    const baseFreq = 523.25; // C5
    const freqs = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2];

    freqs.slice(0, lines).forEach((freq, idx) => {
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = lines >= 4 ? 'square' : 'triangle';
      const pitchedFreq = freq * 1.05 ** combo;
      osc.frequency.setValueAtTime(
        pitchedFreq,
        this.audioCtx.currentTime + idx * 0.06,
      );

      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioCtx.currentTime + idx * 0.06 + 0.15,
      );

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(this.audioCtx.currentTime + idx * 0.06);
      osc.stop(this.audioCtx.currentTime + idx * 0.06 + 0.15);
    });
  }

  public playGameOver() {
    if (this.isMuted) return;
    this.ensureAudioContext();
    if (!this.audioCtx) return;

    const notes = [400, 350, 300, 250];
    notes.forEach((freq, idx) => {
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(
        freq,
        this.audioCtx.currentTime + idx * 0.12,
      );

      gain.gain.setValueAtTime(0.25, this.audioCtx.currentTime + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioCtx.currentTime + idx * 0.12 + 0.2,
      );

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(this.audioCtx.currentTime + idx * 0.12);
      osc.stop(this.audioCtx.currentTime + idx * 0.12 + 0.2);
    });
  }

  public playTick() {
    if (this.isMuted) return;
    this.ensureAudioContext();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);

    gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      this.audioCtx.currentTime + 0.04,
    );

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.04);
  }
}
