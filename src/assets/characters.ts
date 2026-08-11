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

// Preload Character Tile Assets
export const imageCache: Record<MinoType, HTMLImageElement> = {
  I: new Image(),
  J: new Image(),
  L: new Image(),
  O: new Image(),
  S: new Image(),
  T: new Image(),
  Z: new Image()
};

const assetPaths: Record<MinoType, string> = {
  I: '/assets/ryan.png',
  J: '/assets/apeach.png',
  L: '/assets/choonsik.png',
  O: '/assets/muzi.png',
  S: '/assets/frodo.png',
  T: '/assets/neo.png',
  Z: '/assets/tube.png'
};

(Object.keys(assetPaths) as MinoType[]).forEach((type) => {
  imageCache[type].src = assetPaths[type];
});

export const CHARACTERS: Record<MinoType, CharacterInfo> = {
  I: {
    name: 'Ryan',
    koreanName: '라이언',
    primaryColor: '#FFB800',
    secondaryColor: '#E6A100',
    accentColor: '#333333',
    description: '믿음직스러운 카카오프렌즈 조언자 라이언',
    drawFace: (ctx, x, y, size) => {
      const img = imageCache['I'];
      if (img.complete && img.naturalWidth !== 0) {
        ctx.drawImage(img, x, y, size, size);
      }
    }
  },
  J: {
    name: 'Apeach',
    koreanName: '어피치',
    primaryColor: '#FFB6C1',
    secondaryColor: '#FF69B4',
    accentColor: '#FF1493',
    description: '장난기 가득한 아기 복숭아 어피치',
    drawFace: (ctx, x, y, size) => {
      const img = imageCache['J'];
      if (img.complete && img.naturalWidth !== 0) {
        ctx.drawImage(img, x, y, size, size);
      }
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
      const img = imageCache['L'];
      if (img.complete && img.naturalWidth !== 0) {
        ctx.drawImage(img, x, y, size, size);
      }
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
      const img = imageCache['O'];
      if (img.complete && img.naturalWidth !== 0) {
        ctx.drawImage(img, x, y, size, size);
      }
    }
  },
  S: {
    name: 'Frodo',
    koreanName: '프로도',
    primaryColor: '#8B4513',
    secondaryColor: '#5C2E0B',
    accentColor: '#FF0000',
    description: '부잣집 도시 개 프로도',
    drawFace: (ctx, x, y, size) => {
      const img = imageCache['S'];
      if (img.complete && img.naturalWidth !== 0) {
        ctx.drawImage(img, x, y, size, size);
      }
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
      const img = imageCache['T'];
      if (img.complete && img.naturalWidth !== 0) {
        ctx.drawImage(img, x, y, size, size);
      }
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
      const img = imageCache['Z'];
      if (img.complete && img.naturalWidth !== 0) {
        ctx.drawImage(img, x, y, size, size);
      }
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

  // Create rounded clipping region so image conforms to Tetris tile
  roundRectPath(ctx, x, y, size, size, radius);
  ctx.clip();

  // Draw Character PNG Tile
  const img = imageCache[type];
  if (img.complete && img.naturalWidth !== 0) {
    ctx.drawImage(img, x, y, size, size);
  } else {
    // Fallback solid color while loading
    ctx.fillStyle = char.primaryColor;
    ctx.fillRect(x, y, size, size);
  }

  // Top/Left Highlight for 3D Bevel
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x + size - size * 0.12, y + size * 0.12);
  ctx.lineTo(x + size * 0.12, y + size * 0.12);
  ctx.closePath();
  ctx.fill();

  // Bottom/Right Shadow for 3D Depth
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.beginPath();
  ctx.moveTo(x + size, y);
  ctx.lineTo(x + size, y + size);
  ctx.lineTo(x + size * 0.88, y + size - size * 0.12);
  ctx.lineTo(x + size * 0.88, y + size * 0.12);
  ctx.closePath();
  ctx.fill();

  // Outer Border Line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;
  roundRectPath(ctx, x, y, size, size, radius);
  ctx.stroke();

  ctx.restore();
}
