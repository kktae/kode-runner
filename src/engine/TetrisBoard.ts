import { CellState, MinoType, Point } from '../types/tetris';
import { I_WALL_KICKS, JLSTZ_WALL_KICKS, MinoFactory, MinoPiece } from './MinoFactory';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export interface LineClearEvent {
  count: number;
  clearedRows: number[];
  isTetris: boolean;
}

export class TetrisBoard {
  public grid: CellState[][];
  public activePiece: MinoPiece | null = null;
  public holdType: MinoType | null = null;
  public canHold = true;
  private factory: MinoFactory;

  constructor(factory: MinoFactory) {
    this.factory = factory;
    this.grid = this.createEmptyGrid();
  }

  public reset() {
    this.grid = this.createEmptyGrid();
    this.activePiece = null;
    this.holdType = null;
    this.canHold = true;
  }

  private createEmptyGrid(): CellState[][] {
    return Array.from({ length: BOARD_HEIGHT }, () =>
      Array.from({ length: BOARD_WIDTH }, () => ({ filled: false, color: '#000000' }))
    );
  }

  public spawnPiece(): boolean {
    const nextType = this.factory.nextType();
    this.activePiece = this.factory.createPiece(nextType, BOARD_WIDTH);
    this.canHold = true;

    // Check game over on spawn
    if (this.checkCollision(this.activePiece.shape, this.activePiece.x, this.activePiece.y)) {
      return false; // Game Over
    }
    return true;
  }

  public holdPiece(): boolean {
    if (!this.canHold || !this.activePiece) return false;

    const currentType = this.activePiece.type;
    if (this.holdType === null) {
      this.holdType = currentType;
      this.spawnPiece();
    } else {
      const temp = this.holdType;
      this.holdType = currentType;
      this.activePiece = this.factory.createPiece(temp, BOARD_WIDTH);
    }
    this.canHold = false;
    return true;
  }

  public checkCollision(shape: number[][], offsetX: number, offsetY: number): boolean {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const targetX = offsetX + c;
          const targetY = offsetY + r;

          // Out of bounds horizontally or bottom
          if (targetX < 0 || targetX >= BOARD_WIDTH || targetY >= BOARD_HEIGHT) {
            return true;
          }

          // Filled grid collision
          if (targetY >= 0 && this.grid[targetY][targetX].filled) {
            return true;
          }
        }
      }
    }
    return false;
  }

  public moveLeft(): boolean {
    if (!this.activePiece) return false;
    if (!this.checkCollision(this.activePiece.shape, this.activePiece.x - 1, this.activePiece.y)) {
      this.activePiece.x--;
      return true;
    }
    return false;
  }

  public moveRight(): boolean {
    if (!this.activePiece) return false;
    if (!this.checkCollision(this.activePiece.shape, this.activePiece.x + 1, this.activePiece.y)) {
      this.activePiece.x++;
      return true;
    }
    return false;
  }

  public moveDown(): boolean {
    if (!this.activePiece) return false;
    if (!this.checkCollision(this.activePiece.shape, this.activePiece.x, this.activePiece.y + 1)) {
      this.activePiece.y++;
      return true;
    }
    return false;
  }

  public getGhostY(): number {
    if (!this.activePiece) return 0;
    let ghostY = this.activePiece.y;
    while (!this.checkCollision(this.activePiece.shape, this.activePiece.x, ghostY + 1)) {
      ghostY++;
    }
    return ghostY;
  }

  public hardDrop(): number {
    if (!this.activePiece) return 0;
    const initialY = this.activePiece.y;
    const ghostY = this.getGhostY();
    const droppedDistance = ghostY - initialY;
    this.activePiece.y = ghostY;
    return droppedDistance;
  }

  public rotate(clockwise = true): boolean {
    if (!this.activePiece || this.activePiece.type === 'O') return false;

    const newShape = MinoFactory.rotateMatrix(this.activePiece.shape, clockwise);
    const oldRotation = this.activePiece.rotation;
    const newRotation = (oldRotation + (clockwise ? 1 : 3)) % 4;

    const kickKey = `${oldRotation}->${newRotation}`;
    const kicks: Point[] =
      this.activePiece.type === 'I'
        ? I_WALL_KICKS[kickKey] || [{ x: 0, y: 0 }]
        : JLSTZ_WALL_KICKS[kickKey] || [{ x: 0, y: 0 }];

    for (const kick of kicks) {
      const targetX = this.activePiece.x + kick.x;
      const targetY = this.activePiece.y - kick.y; // Invert y for SRS

      if (!this.checkCollision(newShape, targetX, targetY)) {
        this.activePiece.shape = newShape;
        this.activePiece.x = targetX;
        this.activePiece.y = targetY;
        this.activePiece.rotation = newRotation;
        return true;
      }
    }
    return false;
  }

  public lockPiece() {
    if (!this.activePiece) return;

    for (let r = 0; r < this.activePiece.shape.length; r++) {
      for (let c = 0; c < this.activePiece.shape[r].length; c++) {
        if (this.activePiece.shape[r][c]) {
          const targetX = this.activePiece.x + c;
          const targetY = this.activePiece.y + r;

          if (targetY >= 0 && targetY < BOARD_HEIGHT && targetX >= 0 && targetX < BOARD_WIDTH) {
            this.grid[targetY][targetX] = {
              filled: true,
              color: '', // Rendered by MinoType
              characterType: this.activePiece.type
            };
          }
        }
      }
    }
    this.activePiece = null;
  }

  public clearLines(): LineClearEvent {
    const clearedRows: number[] = [];

    for (let r = BOARD_HEIGHT - 1; r >= 0; r--) {
      if (this.grid[r].every(cell => cell.filled)) {
        clearedRows.push(r);
      }
    }

    if (clearedRows.length > 0) {
      // Remove cleared rows and unshift empty ones
      for (const row of clearedRows) {
        this.grid.splice(row, 1);
        this.grid.unshift(
          Array.from({ length: BOARD_WIDTH }, () => ({ filled: false, color: '#000000' }))
        );
      }
    }

    return {
      count: clearedRows.length,
      clearedRows,
      isTetris: clearedRows.length === 4
    };
  }
}
