import { drawMinoCell } from '../assets/characters';
import { SoundManager } from '../audio/SoundManager';
import type { GameMode, GameStats, MinoType } from '../types/tetris';
import { MinoFactory } from './MinoFactory';
import { ParticleSystem } from './ParticleSystem';
import { BOARD_HEIGHT, BOARD_WIDTH, TetrisBoard } from './TetrisBoard';
import { useMultiplayerStore } from '../stores/useMultiplayerStore';

export interface GameLoopCallbacks {
  onStatsUpdate: (stats: GameStats) => void;
  onCombo: (combo: number, isTetris: boolean) => void;
  onGameOver: (finalStats: GameStats) => void;
  onNextQueueUpdate: (nextTypes: (MinoType | null)[]) => void;
  onHoldUpdate: (holdType: MinoType | null) => void;
  onFeverStart?: () => void;
}

export class GameLoop {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private board: TetrisBoard;
  private factory: MinoFactory;
  private particles: ParticleSystem;
  private soundManager: SoundManager;

  private mode: GameMode = 'timeattack';
  private stats: GameStats;
  private callbacks: GameLoopCallbacks;

  private isRunning = false;
  private isPaused = false;

  private lastTime = 0;
  private dropCounter = 0;
  private dropInterval = 800; // ms
  private lockDelayCounter = 0;
  private readonly lockDelay = 300; // 300ms lock delay when resting on ground

  private animationFrameId: number | null = null;
  private timerIntervalId: number | null = null;
  private tickerWorker: Worker | null = null;

  constructor(canvas: HTMLCanvasElement, callbacks: GameLoopCallbacks) {
    this.canvas = canvas;
    this.canvas.width = 300;
    this.canvas.height = 600;
    this.ctx = canvas.getContext('2d')!;
    this.factory = new MinoFactory();
    this.board = new TetrisBoard(this.factory);
    this.particles = new ParticleSystem(canvas);
    this.soundManager = SoundManager.getInstance();
    this.callbacks = callbacks;

    this.stats = this.createInitialStats();
    this.initWorkerTicker();
  }

  private initWorkerTicker() {
    if (this.tickerWorker) return;
    try {
      const workerCode = `
        let timer = null;
        self.onmessage = function(e) {
          if (e.data === 'start') {
            if (!timer) {
              timer = setInterval(function() { postMessage('tick'); }, 16);
            }
          } else if (e.data === 'stop') {
            if (timer) {
              clearInterval(timer);
              timer = null;
            }
          }
        };
      `;
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      this.tickerWorker = new Worker(URL.createObjectURL(blob));

      this.tickerWorker.onmessage = () => {
        if (!this.isRunning || this.isPaused) return;
        const now = performance.now();
        const deltaTime = now - this.lastTime;
        const safeDelta = Math.min(deltaTime, 100);
        this.lastTime = now;

        this.updatePhysics(safeDelta);

        // If tab is inactive (document.hidden), requestAnimationFrame stops, so render & sync directly
        if (document.hidden) {
          this.render();
        }
      };
    } catch (e) {
      console.warn('Web Worker ticker fallback initialized', e);
    }
  }

  private createInitialStats(): GameStats {
    return {
      score: 0,
      lines: 0,
      level: 1,
      combo: 0,
      maxCombo: 0,
      tetrisCount: 0,
      timeRemaining: 90,
      elapsedTime: 0,
      feverGauge: 0,
      isFever: false,
      feverTimeRemaining: 0,
    };
  }

  public setMode(mode: GameMode) {
    this.mode = mode;
  }

  public getMode(): GameMode {
    return this.mode;
  }

  public start() {
    this.reset();
    this.isRunning = true;
    this.isPaused = false;

    this.board.spawnPiece();
    this.updateQueueAndHold();
    this.callbacks.onStatsUpdate(this.stats);

    const wrapper = document.getElementById('canvas-wrapper');
    if (wrapper) wrapper.classList.add('is-playing');

    this.lastTime = performance.now();
    this.tickerWorker?.postMessage('start');
    this.loop(this.lastTime);

    // Timer Interval for 1 second ticks
    if (this.timerIntervalId) clearInterval(this.timerIntervalId);
    this.timerIntervalId = window.setInterval(() => {
      if (!this.isRunning || this.isPaused) return;

      this.stats.elapsedTime++;

      // Fever Mode Countdown
      if (this.stats.isFever) {
        this.stats.feverTimeRemaining--;
        this.stats.feverGauge = (this.stats.feverTimeRemaining / 10) * 100;
        if (this.stats.feverTimeRemaining <= 0) {
          this.stats.isFever = false;
          this.stats.feverGauge = 0;
          const wrapper = document.getElementById('canvas-wrapper');
          if (wrapper) wrapper.classList.remove('is-fever');
        }
      }

      if (this.mode === 'timeattack') {
        this.stats.timeRemaining--;
        if (this.stats.timeRemaining <= 10 && this.stats.timeRemaining > 0) {
          this.soundManager.playTick();
        }
        if (this.stats.timeRemaining <= 0) {
          this.gameOver();
          return;
        }
      }
      this.callbacks.onStatsUpdate(this.stats);
    }, 1000);
  }

  public reset() {
    this.isRunning = false;
    this.isPaused = false;
    this.tickerWorker?.postMessage('stop');
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.timerIntervalId) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }

    this.factory = new MinoFactory();
    this.board = new TetrisBoard(this.factory);
    this.stats = this.createInitialStats();
    this.dropInterval = 800;
    this.dropCounter = 0;
    this.lockDelayCounter = 0;

    // Clear main board canvas & particle system
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles.clear();

    // Clear HOLD & NEXT preview canvases
    this.callbacks.onHoldUpdate(null);
    this.callbacks.onNextQueueUpdate([null, null, null]);

    // Reset UI Stats (0 Score, 0 Lines, 1 Level, 0 Combo)
    this.callbacks.onStatsUpdate(this.stats);

    const wrapper = document.getElementById('canvas-wrapper');
    if (wrapper) wrapper.classList.remove('is-playing', 'is-fever');
  }

  public stop() {
    this.isRunning = false;
    this.isPaused = false;
    this.tickerWorker?.postMessage('stop');
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.timerIntervalId) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }

    const wrapper = document.getElementById('canvas-wrapper');
    if (wrapper) wrapper.classList.remove('is-playing', 'is-fever');
  }

  public togglePause() {
    if (!this.isRunning) return;
    this.isPaused = !this.isPaused;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }

  private gameOver() {
    this.isRunning = false;
    this.tickerWorker?.postMessage('stop');
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.timerIntervalId) clearInterval(this.timerIntervalId);

    const wrapper = document.getElementById('canvas-wrapper');
    if (wrapper) wrapper.classList.remove('is-playing');

    this.soundManager.playGameOver();
    this.callbacks.onGameOver(this.stats);
  }

  private updateQueueAndHold() {
    const nextQueue = this.factory.peekTypes(3);
    this.callbacks.onNextQueueUpdate(nextQueue);
    this.callbacks.onHoldUpdate(this.board.holdType);
  }

  private updateDropInterval() {
    if (this.mode === 'classic') {
      // Exponential speed up per level
      this.dropInterval = Math.max(50, 800 * 0.85 ** (this.stats.level - 1));
    } else {
      this.dropInterval = 600; // Fixed snappy speed for timeattack
    }
  }

  public handleInput(
    action: 'left' | 'right' | 'down' | 'rotate' | 'hardDrop' | 'hold',
  ) {
    if (!this.isRunning || this.isPaused || !this.board.activePiece) return;

    switch (action) {
      case 'left':
        if (this.board.moveLeft()) {
          this.soundManager.playMove();
          this.resetLockDelayIfGrounded();
          this.syncMultiplayerState(true);
        }
        break;
      case 'right':
        if (this.board.moveRight()) {
          this.soundManager.playMove();
          this.resetLockDelayIfGrounded();
          this.syncMultiplayerState(true);
        }
        break;
      case 'down':
        if (this.board.moveDown()) {
          this.stats.score += 1;
          this.soundManager.playMove();
          this.dropCounter = 0;
          this.syncMultiplayerState(true);
        } else {
          // When soft drop reaches bottom, allow 500ms lock delay for sliding/rotating
          this.resetLockDelayIfGrounded();
        }
        break;
      case 'rotate':
        if (this.board.rotate(true)) {
          this.soundManager.playRotate();
          this.resetLockDelayIfGrounded();
          this.syncMultiplayerState(true);
        }
        break;
      case 'hardDrop': {
        const dropped = this.board.hardDrop();
        this.stats.score += dropped * 2;
        this.soundManager.playHardDrop();
        this.particles.triggerScreenShake(6);
        this.lockAndNext();
        this.syncMultiplayerState(true);
        break;
      }
      case 'hold':
        if (this.board.holdPiece()) {
          this.soundManager.playRotate();
          this.updateQueueAndHold();
          this.syncMultiplayerState(true);
        }
        break;
    }
    this.callbacks.onStatsUpdate(this.stats);
  }

  private resetLockDelayIfGrounded() {
    if (this.isGrounded()) {
      this.lockDelayCounter = 0;
    }
  }

  private isGrounded(): boolean {
    if (!this.board.activePiece) return false;
    return this.board.checkCollision(
      this.board.activePiece.shape,
      this.board.activePiece.x,
      this.board.activePiece.y + 1,
    );
  }

  private activateFeverMode() {
    this.stats.isFever = true;
    this.stats.feverGauge = 100;
    this.stats.feverTimeRemaining = 10;

    const wrapper = document.getElementById('canvas-wrapper');
    if (wrapper) wrapper.classList.add('is-fever');

    this.soundManager.playFeverStart();
    this.particles.triggerConfetti();

    if (this.callbacks.onFeverStart) {
      this.callbacks.onFeverStart();
    }
  }

  private lockAndNext() {
    this.lockDelayCounter = 0;
    this.dropCounter = 0;

    // 1. Lock active piece into board grid
    this.board.lockPiece();

    // 2. Check and clear completed lines immediately
    const clearEvent = this.board.clearLines();
    if (clearEvent.count > 0) {
      this.stats.combo++;
      this.stats.maxCombo = Math.max(this.stats.maxCombo, this.stats.combo);

      if (clearEvent.isTetris) {
        this.stats.tetrisCount++;
        this.particles.triggerScreenShake(12);
      }

      // Fever Gauge increase
      const gaugeIncrements = [0, 25, 50, 75, 100];
      const feverAdd =
        (gaugeIncrements[clearEvent.count] || 0) +
        (this.stats.combo > 1 ? this.stats.combo * 5 : 0);

      if (!this.stats.isFever) {
        this.stats.feverGauge = Math.min(100, this.stats.feverGauge + feverAdd);
        if (this.stats.feverGauge >= 100) {
          this.activateFeverMode();
        }
      }

      // Add Score (2x Multiplier in Fever Mode!)
      const baseScores = [0, 100, 300, 500, 1200];
      let earned =
        baseScores[clearEvent.count] * this.stats.level +
        (this.stats.combo - 1) * 100;

      if (this.stats.isFever) {
        earned *= 2; // FEVER 2X MULTIPLIER
      }

      this.stats.score += earned;
      this.stats.lines += clearEvent.count;

      // Multiplayer Attack Dispatch (2줄 이상 클리어 또는 콤보 발생 시 상대방 가비지 공격)
      const mpState = useMultiplayerStore.getState();
      if (mpState.status === 'PLAYING') {
        const attackLines = Math.max(0, (clearEvent.count - 1) + Math.floor(this.stats.combo / 2));
        if (attackLines > 0) {
          const holePos = Math.floor(Math.random() * BOARD_WIDTH);
          mpState.sendGarbageAttack(attackLines, holePos);
        }
      }

      // Level Increase in Classic Mode every 10 lines
      const newLevel = Math.floor(this.stats.lines / 10) + 1;
      if (newLevel !== this.stats.level) {
        this.stats.level = newLevel;
        this.updateDropInterval();
      }

      // Trigger in-game board wrapper flash animation
      const wrapper = document.getElementById('canvas-wrapper');
      if (wrapper) {
        wrapper.classList.remove('flash');
        void wrapper.offsetWidth; // Force reflow
        wrapper.classList.add('flash');
      }

      // Particle explosions, floating score text & Audio
      const colors = [
        '#FEE500',
        '#FF69B4',
        '#FFA500',
        '#FFD700',
        '#1E90FF',
        '#00FA9A',
      ];
      const cellWidth = this.canvas.width / BOARD_WIDTH;
      const cellHeight = this.canvas.height / BOARD_HEIGHT;

      for (const row of clearEvent.clearedRows) {
        this.particles.addLineExplosion(row, cellWidth, cellHeight, colors);
      }

      if (clearEvent.clearedRows.length > 0) {
        this.particles.addScoreText(earned);
      }

      this.soundManager.playLineClear(clearEvent.count, this.stats.combo);
      this.callbacks.onCombo(this.stats.combo, clearEvent.isTetris);
    } else {
      this.stats.combo = 0;
    }

    // 3. Spawn next piece
    if (!this.board.spawnPiece()) {
      this.gameOver();
      return;
    }

    this.updateQueueAndHold();
    this.callbacks.onStatsUpdate(this.stats);
  }

  private updatePhysics(deltaTime: number) {
    if (!this.isRunning || this.isPaused) return;

    this.dropCounter += deltaTime;

    if (this.stats.isFever) {
      this.particles.addFeverSparkles();
    }

    if (this.isGrounded()) {
      // Increment lock delay counter while sitting on ground
      this.lockDelayCounter += deltaTime;
      if (this.lockDelayCounter >= this.lockDelay) {
        this.lockAndNext();
      }
    } else {
      this.lockDelayCounter = 0;
      if (this.dropCounter >= this.dropInterval) {
        this.dropCounter = 0;
        if (this.board.moveDown()) {
          this.syncMultiplayerState(true);
        }
      }
    }

    this.particles.update();
  }

  private loop(timestamp: number) {
    if (!this.isRunning) return;

    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.updatePhysics(deltaTime);
    this.render();
    this.animationFrameId = requestAnimationFrame((ts) => this.loop(ts));
  }

  private render() {
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);

    const cellWidth = width / BOARD_WIDTH;
    const cellHeight = height / BOARD_HEIGHT;

    // Grid lines - High Contrast Dark Canvas
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    this.ctx.lineWidth = 1;

    for (let r = 0; r <= BOARD_HEIGHT; r++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, r * cellHeight);
      this.ctx.lineTo(width, r * cellHeight);
      this.ctx.stroke();
    }
    for (let c = 0; c <= BOARD_WIDTH; c++) {
      this.ctx.beginPath();
      this.ctx.moveTo(c * cellWidth, 0);
      this.ctx.lineTo(c * cellWidth, height);
      this.ctx.stroke();
    }

    // Locked Grid Cells
    for (let r = 0; r < BOARD_HEIGHT; r++) {
      for (let c = 0; c < BOARD_WIDTH; c++) {
        const cell = this.board.grid[r][c];
        if (cell.filled && cell.characterType) {
          drawMinoCell(
            this.ctx,
            c * cellWidth,
            r * cellHeight,
            cellWidth,
            cell.characterType,
            false,
          );
        }
      }
    }

    // Ghost Block
    if (this.board.activePiece) {
      const piece = this.board.activePiece;
      const ghostY = this.board.getGhostY();

      for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
          if (piece.shape[r][c]) {
            const drawX = (piece.x + c) * cellWidth;
            const drawY = (ghostY + r) * cellHeight;
            if (ghostY + r >= 0) {
              drawMinoCell(this.ctx, drawX, drawY, cellWidth, piece.type, true);
            }
          }
        }
      }

      // Active Piece
      for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
          if (piece.shape[r][c]) {
            const drawX = (piece.x + c) * cellWidth;
            const drawY = (piece.y + r) * cellHeight;
            if (piece.y + r >= 0) {
              drawMinoCell(
                this.ctx,
                drawX,
                drawY,
                cellWidth,
                piece.type,
                false,
              );
            }
          }
        }
      }
    }

    // Particles Overlay
    this.particles.draw(this.ctx);

    // Sync & Render Opponent Realtime Frame State
    this.syncMultiplayerState();

    if (useMultiplayerStore.getState().status === 'PLAYING') {
      const oppRenderer = (window as any).opponentRenderer;
      if (oppRenderer) {
        oppRenderer.render(
          useMultiplayerStore.getState().opponentState,
          useMultiplayerStore.getState().opponentNickname,
        );
      }
    }
  }

  private lastSyncTime = 0;

  public getStats(): GameStats {
    return { ...this.stats };
  }

  private syncMultiplayerState(force = false) {
    const mpState = useMultiplayerStore.getState();
    if (mpState.status !== 'PLAYING') return;

    const now = performance.now();
    // 33ms 스로틀링 (초당 30회 실시간 동기화)으로 딜레이 없는 실시간 피스 낙하 표현
    if (!force && now - this.lastSyncTime < 33) {
      return;
    }
    this.lastSyncTime = now;

    const typeMap: Record<string, number> = { I: 1, J: 2, L: 3, O: 4, S: 5, T: 6, Z: 7 };
    const piece = this.board.activePiece;

    mpState.sendStateSync({
      board: this.board.getGridMatrix(),
      score: this.stats.score,
      lines: this.stats.lines,
      combo: this.stats.combo,
      currentPiece: piece
        ? {
            type: typeMap[piece.type] || 1,
            x: piece.x,
            y: piece.y,
            rotation: piece.rotation,
            shape: piece.shape,
          }
        : null,
      isGameOver: !this.isRunning,
    });
  }
}
