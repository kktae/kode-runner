import { drawMinoCell } from '../assets/characters';
import { SoundManager } from '../audio/SoundManager';
import { GameMode, GameStats, MinoType } from '../types/tetris';
import { MinoFactory } from './MinoFactory';
import { ParticleSystem } from './ParticleSystem';
import { BOARD_HEIGHT, BOARD_WIDTH, TetrisBoard } from './TetrisBoard';

export interface GameLoopCallbacks {
  onStatsUpdate: (stats: GameStats) => void;
  onCombo: (combo: number, isTetris: boolean) => void;
  onGameOver: (finalStats: GameStats) => void;
  onNextQueueUpdate: (nextTypes: MinoType[]) => void;
  onHoldUpdate: (holdType: MinoType | null) => void;
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

  constructor(
    canvas: HTMLCanvasElement,
    callbacks: GameLoopCallbacks
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.factory = new MinoFactory();
    this.board = new TetrisBoard(this.factory);
    this.particles = new ParticleSystem(canvas);
    this.soundManager = SoundManager.getInstance();
    this.callbacks = callbacks;

    this.stats = this.createInitialStats();
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
      elapsedTime: 0
    };
  }

  public setMode(mode: GameMode) {
    this.mode = mode;
  }

  public start() {
    this.reset();
    this.isRunning = true;
    this.isPaused = false;

    this.board.spawnPiece();
    this.updateQueueAndHold();

    this.lastTime = performance.now();
    this.loop(this.lastTime);

    // Timer Interval for 1 second ticks
    if (this.timerIntervalId) clearInterval(this.timerIntervalId);
    this.timerIntervalId = window.setInterval(() => {
      if (!this.isRunning || this.isPaused) return;

      this.stats.elapsedTime++;

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
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.timerIntervalId) clearInterval(this.timerIntervalId);

    this.factory = new MinoFactory();
    this.board = new TetrisBoard(this.factory);
    this.stats = this.createInitialStats();
    this.dropInterval = 800;
    this.dropCounter = 0;
    this.lockDelayCounter = 0;
    this.isRunning = false;
    this.isPaused = false;
  }

  public togglePause() {
    if (!this.isRunning) return;
    this.isPaused = !this.isPaused;
  }

  private gameOver() {
    this.isRunning = false;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.timerIntervalId) clearInterval(this.timerIntervalId);

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
      this.dropInterval = Math.max(50, 800 * Math.pow(0.85, this.stats.level - 1));
    } else {
      this.dropInterval = 600; // Fixed snappy speed for timeattack
    }
  }

  public handleInput(action: 'left' | 'right' | 'down' | 'rotate' | 'hardDrop' | 'hold') {
    if (!this.isRunning || this.isPaused || !this.board.activePiece) return;

    switch (action) {
      case 'left':
        if (this.board.moveLeft()) {
          this.soundManager.playMove();
          this.resetLockDelayIfGrounded();
        }
        break;
      case 'right':
        if (this.board.moveRight()) {
          this.soundManager.playMove();
          this.resetLockDelayIfGrounded();
        }
        break;
      case 'down':
        if (this.board.moveDown()) {
          this.stats.score += 1;
          this.soundManager.playMove();
          this.dropCounter = 0;
        } else {
          // Soft drop touching ground -> immediate lock & clear
          this.lockAndNext();
        }
        break;
      case 'rotate':
        if (this.board.rotate(true)) {
          this.soundManager.playRotate();
          this.resetLockDelayIfGrounded();
        }
        break;
      case 'hardDrop': {
        const dropped = this.board.hardDrop();
        this.stats.score += dropped * 2;
        this.soundManager.playHardDrop();
        this.particles.triggerScreenShake(6);
        this.lockAndNext();
        break;
      }
      case 'hold':
        if (this.board.holdPiece()) {
          this.soundManager.playRotate();
          this.updateQueueAndHold();
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
      this.board.activePiece.y + 1
    );
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

      // Add Score
      const baseScores = [0, 100, 300, 500, 1200];
      const earned = baseScores[clearEvent.count] * this.stats.level + (this.stats.combo - 1) * 100;
      this.stats.score += earned;
      this.stats.lines += clearEvent.count;

      // Level Increase in Classic Mode every 10 lines
      const newLevel = Math.floor(this.stats.lines / 10) + 1;
      if (newLevel !== this.stats.level) {
        this.stats.level = newLevel;
        this.updateDropInterval();
      }

      // Particle explosions & Audio
      const colors = ['#FFB800', '#FF69B4', '#FFA500', '#FFD700', '#1E90FF', '#00FA9A'];
      for (const row of clearEvent.clearedRows) {
        const cellWidth = this.canvas.width / BOARD_WIDTH;
        const cellHeight = this.canvas.height / BOARD_HEIGHT;
        this.particles.addLineExplosion(row, cellWidth, cellHeight, colors);
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

  private loop(timestamp: number) {
    if (!this.isRunning) return;

    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    if (!this.isPaused) {
      this.dropCounter += deltaTime;

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
          this.board.moveDown();
        }
      }

      this.particles.update();
    }

    this.render();
    this.animationFrameId = requestAnimationFrame((ts) => this.loop(ts));
  }

  private render() {
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);

    const cellWidth = width / BOARD_WIDTH;
    const cellHeight = height / BOARD_HEIGHT;

    // Grid lines
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
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
            false
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
              drawMinoCell(this.ctx, drawX, drawY, cellWidth, piece.type, false);
            }
          }
        }
      }
    }

    // Particles Overlay
    this.particles.draw(this.ctx);
  }
}
