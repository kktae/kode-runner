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

      // Ears (Round lion ears on top left/right)
      ctx.fillStyle = '#FFB800';
      ctx.beginPath();
      ctx.arc(cx - r * 0.72, cy - r * 0.68, r * 0.3, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.72, cy - r * 0.68, r * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // White Muzzle (Two touching white ovals in center lower face)
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cx - r * 0.22, cy + r * 0.16, r * 0.26, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.22, cy + r * 0.16, r * 0.26, 0, Math.PI * 2);
      ctx.fill();

      // Black Nose (center between muzzles)
      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.04, r * 0.11, 0, Math.PI * 2);
      ctx.fill();

      // Black Dot Eyes
      ctx.beginPath();
      ctx.arc(cx - r * 0.45, cy - r * 0.06, r * 0.11, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.45, cy - r * 0.06, r * 0.11, 0, Math.PI * 2);
      ctx.fill();

      // Straight Horizontal Eyebrows (Signature Ryan!)
      ctx.strokeStyle = '#222222';
      ctx.lineWidth = Math.max(2, size * 0.08);
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(cx - r * 0.72, cy - r * 0.36);
      ctx.lineTo(cx - r * 0.2, cy - r * 0.36);
      ctx.moveTo(cx + r * 0.2, cy - r * 0.36);
      ctx.lineTo(cx + r * 0.72, cy - r * 0.36);
      ctx.stroke();
    }
  },

  // J Mino - Apeach (어피치)
  J: {
    name: 'Apeach',
    koreanName: '어피치',
    primaryColor: '#FFB6C1',
    secondaryColor: '#FF69B4',
    accentColor: '#FF1493',
    description: '장난기 가득한 아기 복숭아 어피치',
    drawFace: (ctx, x, y, size) => {
      const cx = x + size / 2;
      const cy = y + size / 2;
      const r = size * 0.38;

      // Peach Head Contour (Soft pink background with peach cheeks)
      // Bright Pink Blush Cheeks
      ctx.fillStyle = '#FF1493';
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.arc(cx - r * 0.52, cy + r * 0.18, r * 0.24, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.52, cy + r * 0.18, r * 0.24, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // Winking Eye (Left) & Open Big Round Eye (Right)
      ctx.strokeStyle = '#222222';
      ctx.lineWidth = Math.max(2, size * 0.08);
      ctx.lineCap = 'round';

      // Left Eye: Cute Winking Arc >v<
      ctx.beginPath();
      ctx.arc(cx - r * 0.36, cy - r * 0.08, r * 0.18, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();

      // Right Eye: Black Oval Eye with White Sparkle
      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.arc(cx + r * 0.36, cy - r * 0.08, r * 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Eye Glare Dot
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cx + r * 0.3, cy - r * 0.12, r * 0.05, 0, Math.PI * 2);
      ctx.fill();

      // Signature Open Cute Apeach Tooth Smile!
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.18, r * 0.28, 0, Math.PI);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#222222';
      ctx.lineWidth = Math.max(1.5, size * 0.06);
      ctx.stroke();

      // Single Bucktooth line in the middle
      ctx.beginPath();
      ctx.moveTo(cx, cy + r * 0.18);
      ctx.lineTo(cx, cy + r * 0.32);
      ctx.stroke();
    }
  },

  // L Mino - Choonsik (춘식이)
  L: {
    name: 'Choonsik',
    koreanName: '춘식이',
    primaryColor: '#FFA500',
    secondaryColor: '#D2691E',
    accentColor: '#8B4513',
    description: '고구마를 좋아하는 라이언의 카와이 고양이 춘식이',
    drawFace: (ctx, x, y, size) => {
      const cx = x + size / 2;
      const cy = y + size / 2;
      const r = size * 0.38;

      // Pointy Triangular Cat Ears
      ctx.fillStyle = '#FFA500';
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.82, cy - r * 0.15);
      ctx.lineTo(cx - r * 0.5, cy - r * 0.85);
      ctx.lineTo(cx - r * 0.18, cy - r * 0.25);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx + r * 0.18, cy - r * 0.25);
      ctx.lineTo(cx + r * 0.5, cy - r * 0.85);
      ctx.lineTo(cx + r * 0.82, cy - r * 0.15);
      ctx.fill();

      // Inner Ear Pink
      ctx.fillStyle = '#FFB6C1';
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.72, cy - r * 0.2);
      ctx.lineTo(cx - r * 0.5, cy - r * 0.7);
      ctx.lineTo(cx - r * 0.28, cy - r * 0.28);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx + r * 0.28, cy - r * 0.28);
      ctx.lineTo(cx + r * 0.5, cy - r * 0.7);
      ctx.lineTo(cx + r * 0.72, cy - r * 0.2);
      ctx.fill();

      // White/Cream Snout Oval
      ctx.fillStyle = '#FFFDD0';
      ctx.beginPath();
      ctx.ellipse(cx, cy + r * 0.18, r * 0.38, r * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();

      // Small Black Dot Eyes
      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.arc(cx - r * 0.36, cy - r * 0.08, r * 0.11, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.36, cy - r * 0.08, r * 0.11, 0, Math.PI * 2);
      ctx.fill();

      // Brown Nose
      ctx.fillStyle = '#8B4513';
      ctx.beginPath();
      ctx.ellipse(cx, cy + r * 0.06, r * 0.09, r * 0.07, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cat 'w' Mouth
      ctx.strokeStyle = '#8B4513';
      ctx.lineWidth = Math.max(1.8, size * 0.06);
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.arc(cx - r * 0.12, cy + r * 0.18, r * 0.11, 0, Math.PI);
      ctx.arc(cx + r * 0.12, cy + r * 0.18, r * 0.11, 0, Math.PI);
      ctx.stroke();

      // Cat Whiskers (2 on each cheek!)
      ctx.strokeStyle = '#8B4513';
      ctx.lineWidth = Math.max(1.2, size * 0.05);

      ctx.beginPath();
      // Left whiskers
      ctx.moveTo(cx - r * 0.45, cy + r * 0.12);
      ctx.lineTo(cx - r * 0.78, cy + r * 0.06);
      ctx.moveTo(cx - r * 0.45, cy + r * 0.22);
      ctx.lineTo(cx - r * 0.75, cy + r * 0.28);

      // Right whiskers
      ctx.moveTo(cx + r * 0.45, cy + r * 0.12);
      ctx.lineTo(cx + r * 0.78, cy + r * 0.06);
      ctx.moveTo(cx + r * 0.45, cy + r * 0.22);
      ctx.lineTo(cx + r * 0.75, cy + r * 0.28);
      ctx.stroke();
    }
  },

  // O Mino - Muzi (무지)
  O: {
    name: 'Muzi',
    koreanName: '무지',
    primaryColor: '#FFD700',
    secondaryColor: '#DAA520',
    accentColor: '#FFFFFF',
    description: '토끼 옷을 입은 단무지 무지',
    drawFace: (ctx, x, y, size) => {
      const cx = x + size / 2;
      const cy = y + size / 2;
      const r = size * 0.38;

      // Long Rabbit Ears on top
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(cx - r * 0.36, cy - r * 0.72, r * 0.18, r * 0.42, -0.15, 0, Math.PI * 2);
      ctx.ellipse(cx + r * 0.36, cy - r * 0.72, r * 0.18, r * 0.42, 0.15, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#E0E0E0';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Pink Inner Ears
      ctx.fillStyle = '#FFB6C1';
      ctx.beginPath();
      ctx.ellipse(cx - r * 0.36, cy - r * 0.72, r * 0.08, r * 0.28, -0.15, 0, Math.PI * 2);
      ctx.ellipse(cx + r * 0.36, cy - r * 0.72, r * 0.08, r * 0.28, 0.15, 0, Math.PI * 2);
      ctx.fill();

      // White Rabbit Hood Frame around Muzi's Yellow Face!
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.05, r * 0.82, 0, Math.PI * 2);
      ctx.fill();

      // Yellow Oval Face inside the hood
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.08, r * 0.64, 0, Math.PI * 2);
      ctx.fill();

      // Coral/Red Cheeks
      ctx.fillStyle = '#FF6347';
      ctx.beginPath();
      ctx.arc(cx - r * 0.38, cy + r * 0.25, r * 0.14, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.38, cy + r * 0.25, r * 0.14, 0, Math.PI * 2);
      ctx.fill();

      // Big Round Black Eyes
      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.arc(cx - r * 0.26, cy, r * 0.13, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.26, cy, r * 0.13, 0, Math.PI * 2);
      ctx.fill();

      // White Eye Glare Dots
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cx - r * 0.22, cy - r * 0.04, r * 0.05, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.30, cy - r * 0.04, r * 0.05, 0, Math.PI * 2);
      ctx.fill();

      // Tiny Nose & Smile
      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.12, r * 0.05, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#222222';
      ctx.lineWidth = Math.max(1.5, size * 0.05);
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.18, r * 0.12, 0, Math.PI);
      ctx.stroke();
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

      // Dark Brown Floppy Dog Ears hanging down on left/right
      ctx.fillStyle = '#5C2E0B';
      ctx.beginPath();
      ctx.ellipse(cx - r * 0.72, cy, r * 0.24, r * 0.45, -0.2, 0, Math.PI * 2);
      ctx.ellipse(cx + r * 0.72, cy, r * 0.24, r * 0.45, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Cream/Tan Snout
      ctx.fillStyle = '#F5DEB3';
      ctx.beginPath();
      ctx.ellipse(cx, cy + r * 0.18, r * 0.4, r * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();

      // Black Dog Nose on top of Snout
      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.ellipse(cx, cy + r * 0.06, r * 0.12, r * 0.09, 0, 0, Math.PI * 2);
      ctx.fill();

      // Black Oval Eyes with White Highlights
      ctx.beginPath();
      ctx.arc(cx - r * 0.32, cy - r * 0.12, r * 0.12, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.32, cy - r * 0.12, r * 0.12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cx - r * 0.28, cy - r * 0.15, r * 0.04, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.36, cy - r * 0.15, r * 0.04, 0, Math.PI * 2);
      ctx.fill();

      // Dog Mouth
      ctx.strokeStyle = '#222222';
      ctx.lineWidth = Math.max(1.8, size * 0.06);
      ctx.beginPath();
      ctx.arc(cx - r * 0.1, cy + r * 0.22, r * 0.1, 0, Math.PI);
      ctx.arc(cx + r * 0.1, cy + r * 0.22, r * 0.1, 0, Math.PI);
      ctx.stroke();

      // Red Collar at bottom
      ctx.fillStyle = '#FF0000';
      ctx.beginPath();
      roundRect(ctx, cx - r * 0.55, cy + r * 0.62, r * 1.1, r * 0.2, r * 0.08);
      ctx.fill();

      // Gold Tag
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.72, r * 0.1, 0, Math.PI * 2);
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
    description: '단발머리 패셔니스타 고양이 네오',
    drawFace: (ctx, x, y, size) => {
      const cx = x + size / 2;
      const cy = y + size / 2;
      const r = size * 0.38;

      // Blue Cat Ears at top
      ctx.fillStyle = '#1E90FF';
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.7, cy - r * 0.2);
      ctx.lineTo(cx - r * 0.45, cy - r * 0.82);
      ctx.lineTo(cx - r * 0.2, cy - r * 0.4);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx + r * 0.2, cy - r * 0.4);
      ctx.lineTo(cx + r * 0.45, cy - r * 0.82);
      ctx.lineTo(cx + r * 0.7, cy - r * 0.2);
      ctx.fill();

      // Signature Glossy Black Bob Wig (Hair framing face)
      ctx.fillStyle = '#111111';
      // Main Hair Helmet
      ctx.beginPath();
      ctx.arc(cx, cy - r * 0.05, r * 0.82, Math.PI * 0.82, Math.PI * 2.18);
      ctx.lineTo(cx + r * 0.82, cy + r * 0.45);
      ctx.lineTo(cx + r * 0.48, cy + r * 0.45);
      ctx.lineTo(cx + r * 0.35, cy + r * 0.15); // Hair bangs cutout
      ctx.lineTo(cx - r * 0.35, cy + r * 0.15);
      ctx.lineTo(cx - r * 0.48, cy + r * 0.45);
      ctx.lineTo(cx - r * 0.82, cy + r * 0.45);
      ctx.closePath();
      ctx.fill();

      // Cat Eyes with Lashes
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(cx - r * 0.28, cy + r * 0.05, r * 0.16, r * 0.13, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + r * 0.28, cy + r * 0.05, r * 0.16, r * 0.13, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#111111';
      ctx.beginPath();
      ctx.arc(cx - r * 0.28, cy + r * 0.05, r * 0.08, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.28, cy + r * 0.05, r * 0.08, 0, Math.PI * 2);
      ctx.fill();

      // Eyeliner / Eyelashes
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = Math.max(1.8, size * 0.06);
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.46, cy - r * 0.04);
      ctx.lineTo(cx - r * 0.12, cy - r * 0.02);
      ctx.moveTo(cx + r * 0.12, cy - r * 0.02);
      ctx.lineTo(cx + r * 0.46, cy - r * 0.04);
      ctx.stroke();

      // Small nose & mouth
      ctx.fillStyle = '#FF1493';
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.24, r * 0.06, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  // Z Mino - Tube (튜브)
  Z: {
    name: 'Tube',
    koreanName: '튜브',
    primaryColor: '#00FA9A',
    secondaryColor: '#00C78C',
    accentColor: '#FF9900',
    description: '겁많은 미카엘 오리 튜브',
    drawFace: (ctx, x, y, size) => {
      const cx = x + size / 2;
      const cy = y + size / 2;
      const r = size * 0.38;

      // Tube is a WHITE DUCK!
      // White Round Duck Head
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#E0E0E0';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Large Flat Yellow/Orange Duck Beak (Signature Tube Beak!)
      ctx.fillStyle = '#FF9900';
      ctx.beginPath();
      ctx.ellipse(cx, cy + r * 0.22, r * 0.52, r * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#D2691E';
      ctx.lineWidth = Math.max(1.5, size * 0.05);
      ctx.stroke();

      // Beak Nostrils & Smile Line
      ctx.fillStyle = '#D2691E';
      ctx.beginPath();
      ctx.arc(cx - r * 0.12, cy + r * 0.12, r * 0.04, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.12, cy + r * 0.12, r * 0.04, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx - r * 0.3, cy + r * 0.22);
      ctx.lineTo(cx + r * 0.3, cy + r * 0.22);
      ctx.stroke();

      // Small Round Black Eyes
      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.arc(cx - r * 0.3, cy - r * 0.16, r * 0.1, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.3, cy - r * 0.16, r * 0.1, 0, Math.PI * 2);
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
