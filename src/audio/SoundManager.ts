export class SoundManager {
  private static instance: SoundManager;
  private isMuted = false;
  private audioCtx: AudioContext | null = null;
  private bgmIntervalId: number | null = null;
  private bgmStep = 0;
  private isBgmPlaying = false;

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
      // AudioContext blocked until user interaction
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
    if (this.isMuted) {
      this.stopBGM();
    } else if (this.isBgmPlaying) {
      this.startBGM();
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

  // Web Audio BGM Synthesizer Arpeggio
  public startBGM() {
    this.isBgmPlaying = true;
    if (this.isMuted || this.bgmIntervalId) return;

    // Chiptune / Lo-Fi C major pentatonic arpeggio notes (C4, E4, G4, A4, C5, E5, G5)
    const notes = [
      261.63, 329.63, 392.0, 440.0, 523.25, 659.25, 783.99, 659.25,
    ];

    this.bgmIntervalId = window.setInterval(() => {
      if (this.isMuted || !this.audioCtx) return;
      this.ensureAudioContext();

      const freq = notes[this.bgmStep % notes.length];
      this.bgmStep++;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.025, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        this.audioCtx.currentTime + 0.18,
      );

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.18);
    }, 200);
  }

  public stopBGM() {
    if (this.bgmIntervalId) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
  }

  // Synthesize Arcade Effects via Web Audio API
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
      this.audioCtx.currentTime + 0.04,
    );

    gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      this.audioCtx.currentTime + 0.04,
    );

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.04);
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
      this.audioCtx.currentTime + 0.06,
    );

    gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      this.audioCtx.currentTime + 0.06,
    );

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.06);
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
      this.audioCtx.currentTime + 0.12,
    );

    gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      this.audioCtx.currentTime + 0.12,
    );

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.12);
  }

  // Combo Sound Pitch Escalation
  public playLineClear(lines: number, combo = 0) {
    if (this.isMuted) return;
    this.ensureAudioContext();
    if (!this.audioCtx) return;

    const baseFreq = 523.25; // C5
    const freqs = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2];

    // Pitch escalation multiplier based on combo streak (8% pitch increase per combo)
    const pitchMultiplier = 1.08 ** Math.min(combo, 15);

    freqs.slice(0, lines).forEach((freq, idx) => {
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = lines >= 4 ? 'square' : 'triangle';
      const pitchedFreq = freq * pitchMultiplier;

      osc.frequency.setValueAtTime(
        pitchedFreq,
        this.audioCtx.currentTime + idx * 0.06,
      );

      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioCtx.currentTime + idx * 0.06 + 0.16,
      );

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(this.audioCtx.currentTime + idx * 0.06);
      osc.stop(this.audioCtx.currentTime + idx * 0.06 + 0.16);
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

      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime + idx * 0.12);
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

  public playFeverStart() {
    if (this.isMuted) return;
    this.ensureAudioContext();
    if (!this.audioCtx) return;

    // Arpeggio fanfare for Fever Mode activation
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
    notes.forEach((freq, idx) => {
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(
        freq,
        this.audioCtx.currentTime + idx * 0.05,
      );

      gain.gain.setValueAtTime(0.18, this.audioCtx.currentTime + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioCtx.currentTime + idx * 0.05 + 0.15,
      );

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(this.audioCtx.currentTime + idx * 0.05);
      osc.stop(this.audioCtx.currentTime + idx * 0.05 + 0.15);
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

    gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
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
