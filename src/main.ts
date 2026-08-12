import { drawMinoCell } from './assets/characters';
import { SoundManager } from './audio/SoundManager';
import { GameLoop } from './engine/GameLoop';
import { SHAPES } from './engine/MinoFactory';
import type { GameMode, GameStats, MinoType } from './types/tetris';
import { ComboBanner } from './ui/ComboBanner';
import { LeaderboardManager } from './ui/Leaderboard';
import { TouchController } from './ui/TouchController';

// DOM Elements
const tetrisCanvas = document.getElementById(
  'tetris-canvas',
) as HTMLCanvasElement;
const holdCanvas = document.getElementById('hold-canvas') as HTMLCanvasElement;
const next1Canvas = document.getElementById(
  'next1-canvas',
) as HTMLCanvasElement;
const next2Canvas = document.getElementById(
  'next2-canvas',
) as HTMLCanvasElement;
const next3Canvas = document.getElementById(
  'next3-canvas',
) as HTMLCanvasElement;

const scoreVal = document.getElementById('score-val')!;
const linesVal = document.getElementById('lines-val')!;
const levelVal = document.getElementById('level-val')!;
const comboVal = document.getElementById('combo-val')!;
const timerVal = document.getElementById('timer-val')!;
const timerFill = document.getElementById('timer-progress-fill') as HTMLElement;
const modeDisplayTag = document.getElementById('mode-display-tag')!;

const viewLeaderboardBtn = document.getElementById('view-leaderboard-btn')!;
const soundToggleBtn = document.getElementById('sound-toggle-btn')!;
const pauseBtn = document.getElementById('pause-btn')!;
const modeChangeBtn = document.getElementById('mode-change-btn')!;

const tabTimeattack = document.getElementById('tab-timeattack')!;
const tabClassic = document.getElementById('tab-classic')!;
const leaderboardList = document.getElementById('leaderboard-list')!;

const homeView = document.getElementById('home-view')!;
const gameView = document.getElementById('game-view')!;

const selectTimeattack = document.getElementById('select-timeattack')!;
const selectClassic = document.getElementById('select-classic')!;
const startGameBtn = document.getElementById('start-game-btn')!;
const modalViewLeaderboardBtn = document.getElementById(
  'modal-view-leaderboard-btn',
)!;

const leaderboardModal = document.getElementById('leaderboard-modal')!;
const modalTabTimeattack = document.getElementById('modal-tab-timeattack')!;
const modalTabClassic = document.getElementById('modal-tab-classic')!;
const modalLeaderboardList = document.getElementById('modal-leaderboard-list')!;
const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn')!;
const leaderboardSearch = document.getElementById(
  'leaderboard-search',
) as HTMLInputElement;

const gameoverModal = document.getElementById('gameover-modal')!;
const gameoverTitle = document.getElementById('gameover-title')!;
const celebrationBadge = document.querySelector(
  '.celebration-badge',
) as HTMLElement;
const resScore = document.getElementById('res-score')!;
const resLines = document.getElementById('res-lines')!;
const resCombo = document.getElementById('res-combo')!;
const leaderboardForm = document.getElementById(
  'leaderboard-form',
) as HTMLFormElement;
const playerNameInput = document.getElementById(
  'player-name',
) as HTMLInputElement;
const restartBtn = document.getElementById('restart-btn')!;

// App State
let selectedMode: GameMode = 'timeattack';
let currentStats: GameStats | null = null;
let currentModalMode: GameMode = 'timeattack';

// View Navigation Manager
function showHomeView() {
  soundManager.stopBGM();
  pauseModal.classList.add('hidden');
  leaderboardModal.classList.add('hidden');
  gameoverModal.classList.add('hidden');
  gameLoop.reset();

  homeView.classList.remove('hidden');
  gameView.classList.add('hidden');

  if (pauseBtn) pauseBtn.style.display = 'none';
  if (modeChangeBtn) modeChangeBtn.style.display = 'none';
}

function showGameView() {
  homeView.classList.add('hidden');
  gameView.classList.remove('hidden');

  if (pauseBtn) pauseBtn.style.display = 'inline-flex';
  if (modeChangeBtn) modeChangeBtn.style.display = 'inline-flex';

  modeDisplayTag.innerHTML =
    selectedMode === 'timeattack'
      ? `<svg class="inline-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/></svg> <span>90s TIME ATTACK</span>`
      : `<svg class="inline-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> <span>CLASSIC MODE</span>`;
  gameLoop.setMode(selectedMode);
  gameLoop.start();
  soundManager.startBGM();

  renderLeaderboard(selectedMode);
}

// Initialize Banner Overlay & Audio
const canvasWrapper = document.getElementById('canvas-wrapper')!;
const comboBanner = new ComboBanner(canvasWrapper);
const soundManager = SoundManager.getInstance();

// Initialize Touch D-Pad Controller for Mobile/Tablet Booth Guests
new TouchController(canvasWrapper, {
  onLeft: () => gameLoop.handleInput('left'),
  onRight: () => gameLoop.handleInput('right'),
  onSoftDrop: () => gameLoop.handleInput('down'),
  onHardDrop: () => gameLoop.handleInput('hardDrop'),
  onRotateCW: () => gameLoop.handleInput('rotate'),
  onHold: () => gameLoop.handleInput('hold'),
});

// Fever UI Elements
const feverFill = document.getElementById('fever-progress-fill') as HTMLElement;
const feverStatus = document.getElementById('fever-status-text') as HTMLElement;
const feverTitle = document.querySelector('.fever-title') as HTMLElement;

// 3D Parallax Tilt Mouse Movement
const gameGrid = document.querySelector('.game-grid') as HTMLElement;
if (gameGrid) {
  window.addEventListener('mousemove', (e) => {
    const { innerWidth, innerHeight } = window;
    const rotateX = (e.clientY / innerHeight - 0.5) * -6; // -3 to +3 deg
    const rotateY = (e.clientX / innerWidth - 0.5) * 6; // -3 to +3 deg
    gameGrid.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });
}

// Game Loop Setup
const gameLoop = new GameLoop(tetrisCanvas, {
  onStatsUpdate: (stats) => {
    currentStats = stats;
    scoreVal.innerText = stats.score.toLocaleString();
    linesVal.innerText = stats.lines.toString();
    levelVal.innerText = stats.level.toString();
    comboVal.innerText = stats.maxCombo.toString();

    // Fever Gauge UI Update
    if (feverFill && feverStatus) {
      feverFill.style.width = `${Math.max(0, Math.min(100, stats.feverGauge))}%`;
      if (stats.isFever) {
        feverStatus.innerText = `FEVER! ${stats.feverTimeRemaining}s`;
        if (feverTitle) feverTitle.classList.add('active');
      } else {
        feverStatus.innerText = `${Math.round(stats.feverGauge)}%`;
        if (feverTitle) feverTitle.classList.remove('active');
      }
    }

    if (selectedMode === 'timeattack') {
      const minutes = Math.floor(stats.timeRemaining / 60);
      const seconds = stats.timeRemaining % 60;
      timerVal.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      const pct = (stats.timeRemaining / 90) * 100;
      timerFill.style.width = `${Math.max(0, pct)}%`;
    } else {
      timerVal.innerText = `${stats.elapsedTime}s`;
      timerFill.style.width = '100%';
    }
  },
  onCombo: (combo, isTetris) => {
    comboBanner.showCombo(combo, isTetris);
  },
  onFeverStart: () => {
    comboBanner.showFeverStart();
  },
  onNextQueueUpdate: (nextTypes) => {
    drawMinoPreview(next1Canvas, nextTypes[0]);
    drawMinoPreview(next2Canvas, nextTypes[1]);
    drawMinoPreview(next3Canvas, nextTypes[2]);
  },
  onHoldUpdate: (holdType) => {
    drawMinoPreview(holdCanvas, holdType);
  },
  onGameOver: (finalStats) => {
    currentStats = finalStats;
    soundManager.stopBGM();

    gameoverTitle.innerText =
      selectedMode === 'timeattack' ? '제한 시간 종료!' : '게임 종료!';
    if (celebrationBadge) {
      celebrationBadge.innerText = LeaderboardManager.getPercentileBadge(
        finalStats.score,
        selectedMode,
      );
    }
    resScore.innerText = finalStats.score.toLocaleString();
    resLines.innerText = finalStats.lines.toString();
    resCombo.innerText = finalStats.maxCombo.toString();

    gameoverModal.classList.remove('hidden');
  },
});

// Helper for Preview Canvas Drawing
function drawMinoPreview(canvas: HTMLCanvasElement, type: MinoType | null) {
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!type) return;

  const shape = SHAPES[type];
  const rows = shape.length;
  const cols = shape[0].length;
  const cellSize = Math.min(
    canvas.width / (cols + 1),
    canvas.height / (rows + 1),
  );

  const startX = (canvas.width - cols * cellSize) / 2;
  const startY = (canvas.height - rows * cellSize) / 2;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (shape[r][c]) {
        drawMinoCell(
          ctx,
          startX + c * cellSize,
          startY + r * cellSize,
          cellSize,
          type,
          false,
        );
      }
    }
  }
}

// Render Leaderboard Items
function renderLeaderboard(mode: GameMode) {
  tabTimeattack.classList.toggle('active', mode === 'timeattack');
  tabClassic.classList.toggle('active', mode === 'classic');

  const entries = LeaderboardManager.getEntries(mode);
  leaderboardList.innerHTML = '';

  if (entries.length === 0) {
    const emptyLi = document.createElement('li');
    emptyLi.className = 'leader-empty';
    emptyLi.innerText = '등록된 랭킹이 없습니다.';
    leaderboardList.appendChild(emptyLi);
    return;
  }

  entries.forEach((entry, index) => {
    const li = document.createElement('li');
    li.className = 'leader-item';
    li.innerHTML = `
      <span class="leader-rank">${index + 1}</span>
      <span class="leader-name">${entry.name}</span>
      <span class="leader-score">${entry.score.toLocaleString()}</span>
    `;
    leaderboardList.appendChild(li);
  });
}

function renderModalLeaderboard(mode: GameMode, searchQuery = '') {
  currentModalMode = mode;
  modalTabTimeattack.classList.toggle('active', mode === 'timeattack');
  modalTabClassic.classList.toggle('active', mode === 'classic');

  const entries = LeaderboardManager.searchEntries(searchQuery, mode);
  modalLeaderboardList.innerHTML = '';

  if (entries.length === 0) {
    const emptyLi = document.createElement('li');
    emptyLi.className = 'leader-empty';
    emptyLi.innerText = searchQuery
      ? '검색된 기록이 없습니다.'
      : '등록된 기록이 없습니다.';
    modalLeaderboardList.appendChild(emptyLi);
    return;
  }

  entries.forEach((entry, index) => {
    const li = document.createElement('li');
    li.className = 'leader-item';
    li.innerHTML = `
      <span class="leader-rank">${index + 1}</span>
      <span class="leader-name">${entry.name}</span>
      <span class="leader-score">${entry.score.toLocaleString()}</span>
    `;
    modalLeaderboardList.appendChild(li);
  });
}

// Leaderboard Modal Open
function openLeaderboardModal() {
  renderModalLeaderboard(selectedMode);
  leaderboardModal.classList.remove('hidden');
}

viewLeaderboardBtn.addEventListener('click', openLeaderboardModal);
modalViewLeaderboardBtn.addEventListener('click', () => {
  openLeaderboardModal();
});

closeLeaderboardBtn.addEventListener('click', () => {
  leaderboardModal.classList.add('hidden');
  showHomeView();
});

modalTabTimeattack.addEventListener('click', () =>
  renderModalLeaderboard('timeattack', leaderboardSearch.value),
);
modalTabClassic.addEventListener('click', () =>
  renderModalLeaderboard('classic', leaderboardSearch.value),
);

if (leaderboardSearch) {
  leaderboardSearch.addEventListener('input', (e) => {
    const query = (e.target as HTMLInputElement).value;
    renderModalLeaderboard(currentModalMode, query);
  });
}

// Sound Toggle
soundToggleBtn.addEventListener('click', () => {
  const isMuted = soundManager.toggleMute();
  soundToggleBtn.innerHTML = isMuted
    ? `<svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`
    : `<svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
});

const pauseModal = document.getElementById('pause-modal')!;
const resumeBtn = document.getElementById('resume-btn')!;
const pauseRestartBtn = document.getElementById('pause-restart-btn')!;

function handleTogglePause() {
  if (!gameLoop.getIsRunning()) return;
  gameLoop.togglePause();
  const isPaused = gameLoop.getIsPaused();

  if (isPaused) {
    soundManager.stopBGM();
    pauseModal.classList.remove('hidden');
    pauseBtn.classList.add('active');
    pauseBtn.setAttribute('title', '게임 재개');
    pauseBtn.innerHTML = `<svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
  } else {
    soundManager.startBGM();
    pauseModal.classList.add('hidden');
    pauseBtn.classList.remove('active');
    pauseBtn.setAttribute('title', '일시정지');
    pauseBtn.innerHTML = `<svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
  }
}

// Pause Event
pauseBtn.addEventListener('click', handleTogglePause);
resumeBtn.addEventListener('click', handleTogglePause);

pauseRestartBtn.addEventListener('click', () => {
  soundManager.stopBGM();
  pauseModal.classList.add('hidden');
  showHomeView();
});

// Unified, Single-Dispatch Keyboard Event Listener
window.addEventListener('keydown', (e) => {
  if (!gameLoop.getIsRunning()) return;

  // Ignore input elements when typing player name in modals
  const target = e.target as HTMLElement;
  if (
    target &&
    (target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT')
  ) {
    return;
  }

  // Global Pause Shortcut (P or Escape)
  if (
    e.key === 'p' ||
    e.key === 'P' ||
    e.key === 'Escape' ||
    e.code === 'KeyP'
  ) {
    e.preventDefault();
    handleTogglePause();
    return;
  }

  if (gameLoop.getIsPaused()) return;

  const key = e.key;
  const code = e.code;

  // Prevent browser window scroll/actions on game keys
  const keysToPrevent = [
    'ArrowLeft',
    'ArrowRight',
    'ArrowDown',
    'ArrowUp',
    ' ',
    'Spacebar',
    'Shift',
    'c',
    'C',
    'ㅊ',
  ];
  if (keysToPrevent.includes(key) || code === 'Space' || code === 'KeyC') {
    e.preventDefault();
  }

  // 1. Left: ArrowLeft, A, KeyA, ㅁ
  if (
    code === 'ArrowLeft' ||
    key === 'ArrowLeft' ||
    code === 'KeyA' ||
    key === 'a' ||
    key === 'A' ||
    key === 'ㅁ'
  ) {
    gameLoop.handleInput('left');
  }
  // 2. Right: ArrowRight, D, KeyD, ㅇ
  else if (
    code === 'ArrowRight' ||
    key === 'ArrowRight' ||
    code === 'KeyD' ||
    key === 'd' ||
    key === 'D' ||
    key === 'ㅇ'
  ) {
    gameLoop.handleInput('right');
  }
  // 3. Soft Drop: ArrowDown, S, KeyS, ㄴ
  else if (
    code === 'ArrowDown' ||
    key === 'ArrowDown' ||
    code === 'KeyS' ||
    key === 's' ||
    key === 'S' ||
    key === 'ㄴ'
  ) {
    gameLoop.handleInput('down');
  }
  // 4. Rotate: ArrowUp, W, Z, X, KeyW, KeyZ, KeyX, ㅈ, ㅋ, ㅌ
  else if (
    code === 'ArrowUp' ||
    key === 'ArrowUp' ||
    code === 'KeyW' ||
    key === 'w' ||
    key === 'W' ||
    key === 'ㅈ' ||
    code === 'KeyX' ||
    key === 'x' ||
    key === 'X' ||
    key === 'ㅌ' ||
    code === 'KeyZ' ||
    key === 'z' ||
    key === 'Z' ||
    key === 'ㅋ'
  ) {
    if (!e.repeat) {
      gameLoop.handleInput('rotate');
    }
  }
  // 5. Hard Drop: Space
  else if (code === 'Space' || key === ' ' || key === 'Spacebar') {
    if (!e.repeat) {
      gameLoop.handleInput('hardDrop');
    }
  }
  // 6. Hold: Shift, C, KeyC, ShiftLeft, ShiftRight, ㅊ
  else if (
    code === 'KeyC' ||
    key === 'c' ||
    key === 'C' ||
    key === 'ㅊ' ||
    code === 'ShiftLeft' ||
    code === 'ShiftRight' ||
    key === 'Shift'
  ) {
    if (!e.repeat) {
      gameLoop.handleInput('hold');
    }
  }
});

// Home Navigation Button (KakaoBank Logo Click)
const homeLogoBtn = document.getElementById('home-logo-btn')!;

if (homeLogoBtn) {
  homeLogoBtn.addEventListener('click', showHomeView);
}

// Mode Change / Open Modal Event
modeChangeBtn.addEventListener('click', showHomeView);

// Mode Selection Cards
selectTimeattack.addEventListener('click', () => {
  selectedMode = 'timeattack';
  selectTimeattack.classList.add('active');
  selectClassic.classList.remove('active');
});

selectClassic.addEventListener('click', () => {
  selectedMode = 'classic';
  selectClassic.classList.add('active');
  selectTimeattack.classList.remove('active');
});

startGameBtn.addEventListener('click', () => {
  showGameView();
});

// Leaderboard Tabs
tabTimeattack.addEventListener('click', () => renderLeaderboard('timeattack'));
tabClassic.addEventListener('click', () => renderLeaderboard('classic'));

// Leaderboard Name Submission Form
leaderboardForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentStats) return;

  const name = playerNameInput.value.trim();
  LeaderboardManager.addEntry(
    name,
    currentStats.score,
    currentStats.lines,
    selectedMode,
  );

  playerNameInput.value = '';
  renderLeaderboard(selectedMode);

  gameoverModal.classList.add('hidden');
  openLeaderboardModal();
});

restartBtn.addEventListener('click', () => {
  gameoverModal.classList.add('hidden');
  showHomeView();
});

// Initial View Render
renderLeaderboard('timeattack');
showHomeView();
