import type { CharacterInfo, MinoType } from '../types/tetris';

// Helper for drawing rounded rect path
function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Clean, High-Contrast 3D Arcade Gem Block Renderers
 * ZERO image asset dependencies, 100% crisp performance at any DPI!
 */
export const CHARACTERS: Record<MinoType, CharacterInfo> = {
  I: {
    name: 'Ryan',
    koreanName: '라이언',
    primaryColor: '#FFB800',
    secondaryColor: '#E6A100',
    accentColor: '#333333',
    description: '믿음직스러운 카카오프렌즈 조언자 라이언',
    drawFace: () => {},
  },
  J: {
    name: 'Apeach',
    koreanName: '어피치',
    primaryColor: '#FF6B81',
    secondaryColor: '#E04867',
    accentColor: '#FFFFFF',
    description: '장난기 가득한 아기 복숭아 어피치',
    drawFace: () => {},
  },
  L: {
    name: 'Choonsik',
    koreanName: '춘식이',
    primaryColor: '#FF9500',
    secondaryColor: '#D67B00',
    accentColor: '#8B4513',
    description: '고구마를 좋아하는 카와이 고양이 춘식이',
    drawFace: () => {},
  },
  O: {
    name: 'Muzi',
    koreanName: '무지',
    primaryColor: '#FFD700',
    secondaryColor: '#DAA520',
    accentColor: '#FFFFFF',
    description: '토끼 옷을 입은 단무지 무지',
    drawFace: () => {},
  },
  S: {
    name: 'Frodo',
    koreanName: '프로도',
    primaryColor: '#C88E3E',
    secondaryColor: '#A06B22',
    accentColor: '#FF0000',
    description: '부잣집 도시 개 프로도',
    drawFace: () => {},
  },
  T: {
    name: 'Neo',
    koreanName: '네오',
    primaryColor: '#1E90FF',
    secondaryColor: '#104E8B',
    accentColor: '#FFFFFF',
    description: '단발머리 패셔니스타 고양이 네오',
    drawFace: () => {},
  },
  Z: {
    name: 'Tube',
    koreanName: '튜브',
    primaryColor: '#00FA9A',
    secondaryColor: '#00C78C',
    accentColor: '#FF9900',
    description: '겁많은 미카엘 오리 튜브',
    drawFace: () => {},
  },
  GARBAGE: {
    name: 'Garbage',
    koreanName: '방해 블록',
    primaryColor: '#64748b',
    secondaryColor: '#475569',
    accentColor: '#94a3b8',
    description: '상대방의 공격으로 생성된 회색 방해 블록',
    drawFace: () => {},
  },
};

/**
 * Render a single high-contrast 3D Arcade Gem cell
 */
export function drawMinoCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  type: MinoType,
  isGhost = false,
) {
  const char = CHARACTERS[type];
  const radius = Math.max(4, size * 0.18);

  ctx.save();

  // Ghost Block rendering
  if (isGhost) {
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = char.primaryColor;
    roundRectPath(ctx, x + 1, y + 1, size - 2, size - 2, radius);
    ctx.fill();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
    return;
  }

  // 1. Base Tile Fill with Character Primary Color
  roundRectPath(ctx, x, y, size, size, radius);
  ctx.fillStyle = char.primaryColor;
  ctx.fill();

  // 2. Inner Gem Bevel Highlight (Top/Left)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x + size - size * 0.15, y + size * 0.15);
  ctx.lineTo(x + size * 0.15, y + size * 0.15);
  ctx.closePath();
  ctx.fill();

  // 3. Inner Gem Bevel Shadow (Bottom/Right)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.moveTo(x + size, y);
  ctx.lineTo(x + size, y + size);
  ctx.lineTo(x + size * 0.85, y + size - size * 0.15);
  ctx.lineTo(x + size * 0.85, y + size * 0.15);
  ctx.closePath();
  ctx.fill();

  // 4. Center Glossy Gem Inset Tile
  const inset = size * 0.18;
  const inw = size - inset * 2;
  const inr = Math.max(3, inw * 0.15);

  roundRectPath(ctx, x + inset, y + inset, inw, inw, inr);
  ctx.fillStyle = char.secondaryColor;
  ctx.fill();

  // Center Shine Accent Spot
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.arc(
    x + inset + inw * 0.28,
    y + inset + inw * 0.28,
    inw * 0.15,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // 5. Crisp White Outer Border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.2;
  roundRectPath(ctx, x, y, size, size, radius);
  ctx.stroke();

  ctx.restore();
}
