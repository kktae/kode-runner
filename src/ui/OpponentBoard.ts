import { drawMinoCell } from '../assets/characters';
import { PlayerGameState } from '../types/network';
import { MinoType } from '../types/tetris';

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
   * 상대방 보드 실시간 렌더링
   */
  public render(gameState: PlayerGameState | null, opponentNickname: string | null) {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const cellSize = width / this.cols;

    // Clear Canvas & Draw Background Grid
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, width, height);

    // Draw Subtle Grid Lines
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
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
      // Waiting for opponent data
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      this.ctx.font = '12px Pretendard, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        opponentNickname ? '상대방 화면 연결 중...' : '상대방 접속 대기 중...',
        width / 2,
        height / 2,
      );
      return;
    }

    // 1. Draw Fixed Board Matrix
    const board = gameState.board;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const minoType = board[r]?.[c] || 0;
        if (minoType > 0) {
          drawMinoCell(this.ctx, c * cellSize, r * cellSize, cellSize, minoType as unknown as MinoType);
        }
      }
    }

    // 2. Draw Active Falling Piece
    if (gameState.currentPiece) {
      const { type, x, y } = gameState.currentPiece;
      // Draw simple block representation for active piece
      drawMinoCell(this.ctx, x * cellSize, y * cellSize, cellSize, type as unknown as MinoType);
    }

    // 3. Draw Game Over Overlay
    if (gameState.isGameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      this.ctx.fillRect(0, 0, width, height);
      this.ctx.fillStyle = '#ef4444';
      this.ctx.font = 'bold 16px Outfit, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('KNOCK OUT!', width / 2, height / 2);
    }
  }
}
