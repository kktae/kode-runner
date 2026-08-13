import { drawMinoCell } from '../assets/characters';
import { MinoFactory, SHAPES } from '../engine/MinoFactory';
import { PlayerGameState } from '../types/network';
import { MinoType } from '../types/tetris';

const ID_TO_MINO: Record<number, MinoType> = {
  1: 'I',
  2: 'J',
  3: 'L',
  4: 'O',
  5: 'S',
  6: 'T',
  7: 'Z',
};

export class OpponentBoardRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cols = 10;
  private rows = 20;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  /**
   * 상대방 보드 및 실시간 콤보 이펙트 렌더링
   */
  public render(gameState: PlayerGameState | null, opponentNickname: string | null) {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const cellSize = width / this.cols;

    // Clear Canvas & Background Grid
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, width, height);

    // Draw Grid Lines
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    this.ctx.lineWidth = 1;
    for (let r = 0; r <= this.rows; r++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, r * cellSize);
      this.ctx.lineTo(width, r * cellSize);
      this.ctx.stroke();
    }
    for (let c = 0; c <= this.cols; c++) {
      this.ctx.beginPath();
      this.ctx.moveTo(c * cellSize, 0);
      this.ctx.lineTo(c * cellSize, height);
      this.ctx.stroke();
    }

    if (!gameState) {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      this.ctx.font = '11px Pretendard, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        opponentNickname ? `${opponentNickname} 대기 중...` : '상대 접속 대기 중...',
        width / 2,
        height / 2,
      );
      return;
    }

    // 1. Draw Fixed Board Matrix
    const board = gameState.board;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const typeId = board[r]?.[c] || 0;
        if (typeId > 0) {
          const charType = ID_TO_MINO[typeId] || 'I';
          drawMinoCell(this.ctx, c * cellSize, r * cellSize, cellSize, charType, false);
        }
      }
    }

    // 2. Draw Falling Active Piece (Full 4-Cell Matrix with Rotation)
    if (gameState.currentPiece) {
      const { type: typeId, x, y, rotation, shape: customShape } = gameState.currentPiece as any;
      const charType = ID_TO_MINO[typeId] || 'I';
      let shape = customShape;

      if (!shape) {
        shape = SHAPES[charType];
        for (let i = 0; i < (rotation % 4); i++) {
          shape = MinoFactory.rotateMatrix(shape, true);
        }
      }

      if (shape && Array.isArray(shape)) {
        for (let r = 0; r < shape.length; r++) {
          for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c]) {
              const drawX = (x + c) * cellSize;
              const drawY = (y + r) * cellSize;
              if (y + r >= 0 && y + r < this.rows && x + c >= 0 && x + c < this.cols) {
                drawMinoCell(this.ctx, drawX, drawY, cellSize, charType, false);
              }
            }
          }
        }
      }
    }

    // 3. Draw Opponent Dynamic Combo Text Overlay Effect
    if (gameState.combo > 1) {
      this.ctx.save();
      this.ctx.fillStyle = '#fee500';
      this.ctx.shadowColor = '#fee500';
      this.ctx.shadowBlur = 18;
      this.ctx.font = '900 22px Outfit, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`${gameState.combo} COMBO! 🔥`, width / 2, height / 2 - 10);
      this.ctx.restore();
    }

    // 4. Draw Game Over Overlay
    if (gameState.isGameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      this.ctx.fillRect(0, 0, width, height);
      this.ctx.fillStyle = '#ef4444';
      this.ctx.font = 'bold 15px Outfit, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('KNOCK OUT!', width / 2, height / 2);
    }
  }

  /**
   * Opponent Canvas 완전히 초기화
   */
  public clear() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, width, height);
  }
}
