import { CharacterInfo, MinoType } from '../types/tetris';

// Helper for drawing rounded rect path
function roundRectPath(
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

/**
 * High-Precision Official Kakao Friends Vector Character Renderers
 * 100% Crisp at any DPI resolution, 100% consistent design system & brand proportions!
 */
export const CHARACTERS: Record<MinoType, CharacterInfo> = {
  I: {
    name: 'Ryan',
    koreanName: '라이언',
    primaryColor: '#FFB800',
    secondaryColor: '#E6A100',
    accentColor: '#222222',
    description: '믿음직스러운 카카오프렌즈 조언자 라이언',
    drawFace: (ctx, x, y, size) => {
      const cx = x + size / 2;
      const cy = y + size / 2;

      // 1. Background Fill - Amber Yellow
      ctx.fillStyle = '#FFB800';
      ctx.fillRect(x, y, size, size);

      // 2. Round Ears
      ctx.fillStyle = '#FFB800';
      ctx.strokeStyle = '#222222';
      ctx.lineWidth = Math.max(1.5, size * 0.05);

      ctx.beginPath();
      ctx.arc(cx - size * 0.28, cy - size * 0.28, size * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx + size * 0.28, cy - size * 0.28, size * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 3. Signature Straight Eyebrows
      ctx.strokeStyle = '#222222';
      ctx.lineWidth = Math.max(2, size * 0.07);
      ctx.lineCap = 'round';

      // Left eyebrow
      ctx.beginPath();
      ctx.moveTo(cx - size * 0.32, cy - size * 0.12);
      ctx.lineTo(cx - size * 0.1, cy - size * 0.12);
      ctx.stroke();

      // Right eyebrow
      ctx.beginPath();
      ctx.moveTo(cx + size * 0.1, cy - size * 0.12);
      ctx.lineTo(cx + size * 0.32, cy - size * 0.12);
      ctx.stroke();

      // 4. Dot Eyes
      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.arc(cx - size * 0.21, cy + size * 0.02, size * 0.05, 0, Math.PI * 2);
      ctx.arc(cx + size * 0.21, cy + size * 0.02, size * 0.05, 0, Math.PI * 2);
      ctx.fill();

      // 5. White Muzzle
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cx - size * 0.07, cy + size * 0.18, size * 0.09, 0, Math.PI * 2);
      ctx.arc(cx + size * 0.07, cy + size * 0.18, size * 0.09, 0, Math.PI * 2);
      ctx.fill();

      // 6. Black Nose
      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.arc(cx, cy + size * 0.14, size * 0.05, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  J: {
    name: 'Apeach',
    koreanName: '어피치',
    primaryColor: '#FFA0B4',
    secondaryColor: '#FF69B4',
    accentColor: '#FF1493',
    description: '장난기 가득한 아기 복숭아 어피치',
    drawFace: (ctx, x, y, size) => {
      const cx = x + size / 2;
      const cy = y + size / 2;

      // 1. Background Fill - Peach Pink
      ctx.fillStyle = '#FFA0B4';
      ctx.fillRect(x, y, size, size);

      // 2. Peach Cleft Tip at Top
      ctx.fillStyle = '#FF7A95';
      ctx.beginPath();
      ctx.moveTo(cx - size * 0.12, cy - size * 0.32);
      ctx.quadraticCurveTo(cx, cy - size * 0.44, cx + size * 0.12, cy - size * 0.32);
      ctx.fill();

      // 3. Pink Blush Cheeks
      ctx.fillStyle = 'rgba(255, 105, 180, 0.65)';
      ctx.beginPath();
      ctx.arc(cx - size * 0.26, cy + size * 0.12, size * 0.1, 0, Math.PI * 2);
      ctx.arc(cx + size * 0.26, cy + size * 0.12, size * 0.1, 0, Math.PI * 2);
      ctx.fill();

      // 4. Eyes
      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.arc(cx - size * 0.18, cy - size * 0.04, size * 0.05, 0, Math.PI * 2);
      ctx.arc(cx + size * 0.18, cy - size * 0.04, size * 0.05, 0, Math.PI * 2);
      ctx.fill();

      // White Glare
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cx - size * 0.19, cy - size * 0.05, size * 0.02, 0, Math.PI * 2);
      ctx.arc(cx + size * 0.17, cy - size * 0.05, size * 0.02, 0, Math.PI * 2);
      ctx.fill();

      // 5. Playful Open Smile with Tooth
      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.arc(cx, cy + size * 0.12, size * 0.12, 0, Math.PI, false);
      ctx.fill();

      // Signature White Tooth
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(cx - size * 0.04, cy + size * 0.12, size * 0.08, size * 0.05);
    }
  },
  L: {
    name: 'Choonsik',
    koreanName: '춘식이',
    primaryColor: '#FFA500',
    secondaryColor: '#D2691E',
    accentColor: '#8B4513',
    description: '고구마를 좋아하는 카와이 고양이 춘식이',
    drawFace: (ctx, x, y, size) => {
      const cx = x + size / 2;
      const cy = y + size / 2;

      // 1. Background Fill - Sweet Potato Yellow
      ctx.fillStyle = '#FFA500';
      ctx.fillRect(x, y, size, size);

      // 2. Triangular Cat Ears with Dark Brown Tips
      ctx.fillStyle = '#8B4513';
      // Left Ear
      ctx.beginPath();
      ctx.moveTo(cx - size * 0.35, cy - size * 0.15);
      ctx.lineTo(cx - size * 0.22, cy - size * 0.38);
      ctx.lineTo(cx - size * 0.1, cy - size * 0.22);
      ctx.fill();
      // Right Ear
      ctx.beginPath();
      ctx.moveTo(cx + size * 0.1, cy - size * 0.22);
      ctx.lineTo(cx + size * 0.22, cy - size * 0.38);
      ctx.lineTo(cx + size * 0.35, cy - size * 0.15);
      ctx.fill();

      // 3. Cream Oval Snout
      ctx.fillStyle = '#FFF8DC';
      ctx.beginPath();
      ctx.ellipse(cx, cy + size * 0.12, size * 0.22, size * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();

      // 4. Dot Eyes
      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.arc(cx - size * 0.18, cy - size * 0.02, size * 0.05, 0, Math.PI * 2);
      ctx.arc(cx + size * 0.18, cy - size * 0.02, size * 0.05, 0, Math.PI * 2);
      ctx.fill();

      // 5. Black Nose & Cat Mouth
      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.arc(cx, cy + size * 0.08, size * 0.04, 0, Math.PI * 2);
      ctx.fill();

      // Cat Whiskers
      ctx.strokeStyle = '#222222';
      ctx.lineWidth = Math.max(1, size * 0.035);
      // Left Whiskers
      ctx.beginPath();
      ctx.moveTo(cx - size * 0.22, cy + size * 0.1);
      ctx.lineTo(cx - size * 0.38, cy + size * 0.08);
      ctx.moveTo(cx - size * 0.22, cy + size * 0.15);
      ctx.lineTo(cx - size * 0.38, cy + size * 0.18);
      // Right Whiskers
      ctx.moveTo(cx + size * 0.22, cy + size * 0.1);
      ctx.lineTo(cx + size * 0.38, cy + size * 0.08);
      ctx.moveTo(cx + size * 0.22, cy + size * 0.15);
      ctx.lineTo(cx + size * 0.38, cy + size * 0.18);
      ctx.stroke();
    }
  },
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

      // 1. White Rabbit Hood Frame
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x, y, size, size);

      // Rabbit Ears at Top
      ctx.beginPath();
      ctx.ellipse(cx - size * 0.18, cy - size * 0.32, size * 0.08, size * 0.18, -0.1, 0, Math.PI * 2);
      ctx.ellipse(cx + size * 0.18, cy - size * 0.32, size * 0.08, size * 0.18, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // 2. Yellow Face Center
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(cx, cy + size * 0.05, size * 0.34, 0, Math.PI * 2);
      ctx.fill();

      // 3. Dot Eyes
      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.arc(cx - size * 0.15, cy, size * 0.05, 0, Math.PI * 2);
      ctx.arc(cx + size * 0.15, cy, size * 0.05, 0, Math.PI * 2);
      ctx.fill();

      // 4. White Snout Patch
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cx, cy + size * 0.12, size * 0.08, 0, Math.PI * 2);
      ctx.fill();

      // Black Nose
      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.arc(cx, cy + size * 0.1, size * 0.035, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  S: {
    name: 'Frodo',
    koreanName: '프로도',
    primaryColor: '#C88E3E',
    secondaryColor: '#5C2E0B',
    accentColor: '#FF0000',
    description: '부잣집 도시 개 프로도',
    drawFace: (ctx, x, y, size) => {
      const cx = x + size / 2;
      const cy = y + size / 2;

      // 1. Background Fill - Golden Brown Fur
      ctx.fillStyle = '#C88E3E';
      ctx.fillRect(x, y, size, size);

      // 2. Folded Brown Ears on Top
      ctx.fillStyle = '#9A6224';
      ctx.strokeStyle = '#222222';
      ctx.lineWidth = Math.max(1.5, size * 0.04);

      ctx.beginPath();
      ctx.arc(cx - size * 0.22, cy - size * 0.26, size * 0.1, 0, Math.PI * 2);
      ctx.arc(cx + size * 0.22, cy - size * 0.26, size * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 3. White Oval Eyes with Eyelids & Pupils
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#222222';
      ctx.lineWidth = Math.max(1.5, size * 0.04);

      // Left Eye
      ctx.beginPath();
      ctx.ellipse(cx - size * 0.16, cy - size * 0.06, size * 0.1, size * 0.06, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Right Eye
      ctx.beginPath();
      ctx.ellipse(cx + size * 0.16, cy - size * 0.06, size * 0.1, size * 0.06, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pupils
      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.arc(cx - size * 0.16, cy - size * 0.05, size * 0.04, 0, Math.PI * 2);
      ctx.arc(cx + size * 0.16, cy - size * 0.05, size * 0.04, 0, Math.PI * 2);
      ctx.fill();

      // 4. Black Nose & Mouth
      ctx.beginPath();
      ctx.ellipse(cx, cy + size * 0.08, size * 0.06, size * 0.04, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#222222';
      ctx.lineWidth = Math.max(2, size * 0.05);
      ctx.beginPath();
      ctx.moveTo(cx - size * 0.08, cy + size * 0.18);
      ctx.lineTo(cx + size * 0.08, cy + size * 0.18);
      ctx.stroke();

      // 5. Red Collar
      ctx.fillStyle = '#D32F2F';
      ctx.fillRect(cx - size * 0.3, cy + size * 0.3, size * 0.6, size * 0.08);

      // Silver Round Tag
      ctx.fillStyle = '#C0C0C0';
      ctx.beginPath();
      ctx.arc(cx, cy + size * 0.38, size * 0.06, 0, Math.PI * 2);
      ctx.fill();
    }
  },
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

      // 1. Background Fill - Cyan Blue
      ctx.fillStyle = '#1E90FF';
      ctx.fillRect(x, y, size, size);

      // 2. Glossy Black Bob Cut Wig
      ctx.fillStyle = '#111111';
      ctx.beginPath();
      ctx.arc(cx, cy - size * 0.12, size * 0.38, Math.PI, 0, false);
      ctx.fillRect(cx - size * 0.38, cy - size * 0.12, size * 0.12, size * 0.35);
      ctx.fillRect(cx + size * 0.26, cy - size * 0.12, size * 0.12, size * 0.35);
      ctx.fill();

      // Hair Highlight Sheen
      ctx.fillStyle = 'rgba(255, 255, 255, 0.32)';
      ctx.beginPath();
      ctx.arc(cx - size * 0.15, cy - size * 0.28, size * 0.14, 0, Math.PI * 2);
      ctx.fill();

      // 3. Cute Cat Eyes
      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.arc(cx - size * 0.14, cy + size * 0.04, size * 0.05, 0, Math.PI * 2);
      ctx.arc(cx + size * 0.14, cy + size * 0.04, size * 0.05, 0, Math.PI * 2);
      ctx.fill();

      // Eye Glints
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cx - size * 0.15, cy + size * 0.03, size * 0.02, 0, Math.PI * 2);
      ctx.arc(cx + size * 0.13, cy + size * 0.03, size * 0.02, 0, Math.PI * 2);
      ctx.fill();

      // 4. Pink Nose
      ctx.fillStyle = '#FFA0B4';
      ctx.beginPath();
      ctx.arc(cx, cy + size * 0.12, size * 0.04, 0, Math.PI * 2);
      ctx.fill();
    }
  },
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

      // 1. Background Fill - Mint Green Tile
      ctx.fillStyle = '#00FA9A';
      ctx.fillRect(x, y, size, size);

      // 2. White Duck Head
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cx, cy - size * 0.02, size * 0.34, 0, Math.PI * 2);
      ctx.fill();

      // 3. Dot Eyes
      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.arc(cx - size * 0.14, cy - size * 0.08, size * 0.04, 0, Math.PI * 2);
      ctx.arc(cx + size * 0.14, cy - size * 0.08, size * 0.04, 0, Math.PI * 2);
      ctx.fill();

      // 4. Wide Orange Duck Beak
      ctx.fillStyle = '#FF9900';
      ctx.beginPath();
      ctx.ellipse(cx, cy + size * 0.1, size * 0.22, size * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Beak Center Line
      ctx.strokeStyle = '#E67E00';
      ctx.lineWidth = Math.max(1, size * 0.03);
      ctx.beginPath();
      ctx.moveTo(cx - size * 0.18, cy + size * 0.1);
      ctx.lineTo(cx + size * 0.18, cy + size * 0.1);
      ctx.stroke();
    }
  }
};

// Render a single cell with rounded clipping, character face, 3D bevel, and border
export function drawMinoCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  type: MinoType,
  isGhost = false
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

  // Create rounded clipping region so tile conforms to Tetris grid
  roundRectPath(ctx, x, y, size, size, radius);
  ctx.clip();

  // Render High-Precision Vector Character Face
  char.drawFace(ctx, x, y, size);

  // Top/Left Highlight for 3D Bevel Depth
  ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x + size - size * 0.12, y + size * 0.12);
  ctx.lineTo(x + size * 0.12, y + size * 0.12);
  ctx.closePath();
  ctx.fill();

  // Bottom/Right Shadow for 3D Depth
  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
  ctx.beginPath();
  ctx.moveTo(x + size, y);
  ctx.lineTo(x + size, y + size);
  ctx.lineTo(x + size * 0.88, y + size - size * 0.12);
  ctx.lineTo(x + size * 0.88, y + size * 0.12);
  ctx.closePath();
  ctx.fill();

  // Outer Border Line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
  ctx.lineWidth = 1;
  roundRectPath(ctx, x, y, size, size, radius);
  ctx.stroke();

  ctx.restore();
}
