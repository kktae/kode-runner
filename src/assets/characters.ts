import { CharacterInfo, MinoType } from '../types/tetris';

// Helper for drawing rounded rect
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export const CHARACTERS: Record<MinoType, CharacterInfo> = {
  // I Mino - Ryan (라이언)
  I: {
    name: 'Ryan',
    koreanName: '라이언',
    primaryColor: '#FFB800',
    secondaryColor: '#E6A100',
    accentColor: '#333333',
    description: '믿음직스러운 카카오프렌즈 조언자',
    drawFace: (ctx, x, y, size) => {
      const cx = x + size / 2;
      const cy = y + size / 2;
      const r = size * 0.38;

      // Ears
      ctx.fillStyle = '#FFB800';
      ctx.beginPath();
      ctx.arc(cx - r * 0.7, cy - r * 0.7, r * 0.3, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.7, cy - r * 0.7, r * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Muzzle (white)
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cx - r * 0.22, cy + r * 0.15, r * 0.25, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.22, cy + r * 0.15, r * 0.25, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.arc(cx - r * 0.45, cy - r * 0.05, r * 0.12, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.45, cy - r * 0.05, r * 0.12, 0, Math.PI * 2);
      ctx.fill();

      // Nose
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.05, r * 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Straight Eyebrows (Signature Ryan!)
      ctx.strokeStyle = '#222222';
      ctx.lineWidth = Math.max(2, size * 0.08);
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(cx - r * 0.7, cy - r * 0.35);
      ctx.lineTo(cx - r * 0.2, cy - r * 0.35);
      ctx.moveTo(cx + r * 0.2, cy - r * 0.35);
      ctx.lineTo(cx + r * 0.7, cy - r * 0.35);
      ctx.stroke();
    }
  },

  // J Mino - Apeach (어피치)
  J: {
    name: 'Apeach',
    koreanName: '어피치',
    primaryColor: '#FF69B4',
    secondaryColor: '#E0529C',
    accentColor: '#FF1493',
    description: '애교 만점 아기 복숭아',
    drawFace: (ctx, x, y, size) => {
      const cx = x + size / 2;
      const cy = y + size / 2;
      const r = size * 0.38;

      // Blush cheeks
      ctx.fillStyle = 'rgba(255, 105, 180, 0.6)';
      ctx.beginPath();
      ctx.arc(cx - r * 0.5, cy + r * 0.2, r * 0.2, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.5, cy + r * 0.2, r * 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Winking Left Eye & Open Right Eye
      ctx.strokeStyle = '#222222';
      ctx.lineWidth = Math.max(2, size * 0.08);
      ctx.lineCap = 'round';

      // Left Eye (Wink arc)
      ctx.beginPath();
      ctx.arc(cx - r * 0.35, cy - r * 0.05, r * 0.15, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();

      // Right Eye (Dot)
      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.arc(cx + r * 0.35, cy - r * 0.05, r * 0.12, 0, Math.PI * 2);
      ctx.fill();

      // Cute Smile
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.2, r * 0.25, 0, Math.PI);
      ctx.stroke();
    }
  },

  // L Mino - Choonsik (춘식이)
  L: {
    name: 'Choonsik',
    koreanName: '춘식이',
    primaryColor: '#FFA500',
    secondaryColor: '#CC8400',
    accentColor: '#8B4513',
    description: '고구마를 사랑하는 라이언의 반려묘',
    drawFace: (ctx, x, y, size) => {
      const cx = x + size / 2;
      const cy = y + size / 2;
      const r = size * 0.38;

      // Cat Ears
      ctx.fillStyle = '#FFA500';
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.8, cy - r * 0.2);
      ctx.lineTo(cx - r * 0.5, cy - r * 0.8);
      ctx.lineTo(cx - r * 0.2, cy - r * 0.3);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx + r * 0.2, cy - r * 0.3);
      ctx.lineTo(cx + r * 0.5, cy - r * 0.8);
      ctx.lineTo(cx + r * 0.8, cy - r * 0.2);
      ctx.fill();

      // Muzzle (white oval)
      ctx.fillStyle = '#FFF8DC';
      ctx.beginPath();
      ctx.ellipse(cx, cy + r * 0.15, r * 0.35, r * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.arc(cx - r * 0.35, cy - r * 0.1, r * 0.1, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.35, cy - r * 0.1, r * 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Nose & Mouth
      ctx.fillStyle = '#8B4513';
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.05, r * 0.08, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#8B4513';
      ctx.lineWidth = Math.max(1.5, size * 0.06);
      ctx.beginPath();
      ctx.arc(cx - r * 0.1, cy + r * 0.15, r * 0.1, 0, Math.PI);
      ctx.arc(cx + r * 0.1, cy + r * 0.15, r * 0.1, 0, Math.PI);
      ctx.stroke();
    }
  },

  // O Mino - Muzi (무지 & 콘)
  O: {
    name: 'Muzi',
    koreanName: '무지&콘',
    primaryColor: '#FFD700',
    secondaryColor: '#D4AF37',
    accentColor: '#008000',
    description: '토끼 옷을 입은 단무지 무지와 꼬마공룡 콘',
    drawFace: (ctx, x, y, size) => {
      const cx = x + size / 2;
      const cy = y + size / 2;
      const r = size * 0.38;

      // Long Rabbit Ears (Hood)
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(cx - r * 0.4, cy - r * 0.7, r * 0.18, r * 0.4, -0.2, 0, Math.PI * 2);
      ctx.ellipse(cx + r * 0.4, cy - r * 0.7, r * 0.18, r * 0.4, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Pink Inner Ears
      ctx.fillStyle = '#FFB6C1';
      ctx.beginPath();
      ctx.ellipse(cx - r * 0.4, cy - r * 0.7, r * 0.09, r * 0.25, -0.2, 0, Math.PI * 2);
      ctx.ellipse(cx + r * 0.4, cy - r * 0.7, r * 0.09, r * 0.25, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Rosy Cheeks
      ctx.fillStyle = '#FF7F50';
      ctx.beginPath();
      ctx.arc(cx - r * 0.45, cy + r * 0.15, r * 0.15, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.45, cy + r * 0.15, r * 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Big Round Eyes
      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.arc(cx - r * 0.3, cy - r * 0.05, r * 0.12, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.3, cy - r * 0.05, r * 0.12, 0, Math.PI * 2);
      ctx.fill();

      // Eye Sparkle
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cx - r * 0.26, cy - r * 0.09, r * 0.04, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.34, cy - r * 0.09, r * 0.04, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  // S Mino - Frodo (프로도)
  S: {
    name: 'Frodo',
    koreanName: '프로도',
    primaryColor: '#8B4513',
    secondaryColor: '#5C2E0B',
    accentColor: '#FF0000',
    description: '부잣집 도시 개 프로도',
    drawFace: (ctx, x, y, size) => {
      const cx = x + size / 2;
      const cy = y + size / 2;
      const r = size * 0.38;

      // Floppy Dog Ears
      ctx.fillStyle = '#5C2E0B';
      ctx.beginPath();
      ctx.ellipse(cx - r * 0.7, cy - r * 0.2, r * 0.22, r * 0.35, -0.4, 0, Math.PI * 2);
      ctx.ellipse(cx + r * 0.7, cy - r * 0.2, r * 0.22, r * 0.35, 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Red Bow/Collar Accent
      ctx.fillStyle = '#FF0000';
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.65, r * 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.arc(cx - r * 0.3, cy - r * 0.1, r * 0.11, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.3, cy - r * 0.1, r * 0.11, 0, Math.PI * 2);
      ctx.fill();

      // Snout & Mouth
      ctx.fillStyle = '#D2B48C';
      ctx.beginPath();
      ctx.ellipse(cx, cy + r * 0.18, r * 0.32, r * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.08, r * 0.09, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  // T Mino - Neo (네오)
  T: {
    name: 'Neo',
    koreanName: '네오',
    primaryColor: '#1E90FF',
    secondaryColor: '#104E8B',
    accentColor: '#111111',
    description: '패셔니스타 고양이 네오',
    drawFace: (ctx, x, y, size) => {
      const cx = x + size / 2;
      const cy = y + size / 2;
      const r = size * 0.38;

      // Chic Black Bob Wig/Hair
      ctx.fillStyle = '#111111';
      ctx.beginPath();
      ctx.arc(cx, cy - r * 0.1, r * 0.85, Math.PI * 0.8, Math.PI * 2.2);
      ctx.lineTo(cx + r * 0.85, cy + r * 0.4);
      ctx.lineTo(cx - r * 0.85, cy + r * 0.4);
      ctx.closePath();
      ctx.fill();

      // Face cutout
      ctx.fillStyle = '#1E90FF';
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.1, r * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Eyelashes & Eyes
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(cx - r * 0.28, cy, r * 0.16, r * 0.12, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + r * 0.28, cy, r * 0.16, r * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#111111';
      ctx.beginPath();
      ctx.arc(cx - r * 0.28, cy, r * 0.08, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.28, cy, r * 0.08, 0, Math.PI * 2);
      ctx.fill();

      // Eyeliner flourish
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = Math.max(1.5, size * 0.06);
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.44, cy - r * 0.08);
      ctx.lineTo(cx - r * 0.12, cy - r * 0.12);
      ctx.moveTo(cx + r * 0.12, cy - r * 0.12);
      ctx.lineTo(cx + r * 0.44, cy - r * 0.08);
      ctx.stroke();
    }
  },

  // Z Mino - Tube (튜브)
  Z: {
    name: 'Tube',
    koreanName: '튜브',
    primaryColor: '#00FA9A',
    secondaryColor: '#00C78C',
    accentColor: '#FFD700',
    description: '겁많은 미카엘 오리 튜브',
    drawFace: (ctx, x, y, size) => {
      const cx = x + size / 2;
      const cy = y + size / 2;
      const r = size * 0.38;

      // Small White Duck Head Base
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.75, 0, Math.PI * 2);
      ctx.fill();

      // Yellow Duck Beak (Signature Tube Beak!)
      ctx.fillStyle = '#FF8C00';
      ctx.beginPath();
      ctx.ellipse(cx, cy + r * 0.22, r * 0.45, r * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#D2691E';
      ctx.lineWidth = Math.max(1.5, size * 0.05);
      ctx.stroke();

      // Beak Nostrils
      ctx.fillStyle = '#D2691E';
      ctx.beginPath();
      ctx.arc(cx - r * 0.1, cy + r * 0.15, r * 0.04, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.1, cy + r * 0.15, r * 0.04, 0, Math.PI * 2);
      ctx.fill();

      // Expressive Eyes
      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.arc(cx - r * 0.3, cy - r * 0.12, r * 0.1, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.3, cy - r * 0.12, r * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
};

// Render a single cell with character face, rounded bevels, and border
export function drawMinoCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  type: MinoType,
  isGhost = false
) {
  const char = CHARACTERS[type];
  const radius = Math.max(3, size * 0.18);

  ctx.save();

  if (isGhost) {
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = char.primaryColor;
    roundRect(ctx, x + 1, y + 1, size - 2, size - 2, radius);
    ctx.fill();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
    return;
  }

  // Base Tile
  ctx.fillStyle = char.primaryColor;
  roundRect(ctx, x, y, size, size, radius);
  ctx.fill();

  // Top/Left Highlight for 3D Bevel
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + size - radius, y);
  ctx.lineTo(x + size - radius - size * 0.15, y + size * 0.15);
  ctx.lineTo(x + radius + size * 0.15, y + size * 0.15);
  ctx.closePath();
  ctx.fill();

  // Bottom/Right Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.moveTo(x + size, y + radius);
  ctx.lineTo(x + size, y + size - radius);
  ctx.lineTo(x + size - size * 0.15, y + size - radius - size * 0.15);
  ctx.lineTo(x + size - size * 0.15, y + radius + size * 0.15);
  ctx.closePath();
  ctx.fill();

  // Subtle Border Outline
  ctx.strokeStyle = char.secondaryColor;
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, size, size, radius);
  ctx.stroke();

  // Draw Character Face
  char.drawFace(ctx, x, y, size);

  ctx.restore();
}
