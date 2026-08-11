import { drawMinoCell } from './assets/characters';
import { SoundManager } from './audio/SoundManager';
import { GameLoop } from './engine/GameLoop';
import { SHAPES } from './engine/MinoFactory';
import { GameMode, GameStats, MinoType } from './types/tetris';
import { ComboBanner } from './ui/ComboBanner';
import { LeaderboardManager } from './ui/Leaderboard';

// DOM Elements
const tetrisCanvas = document.getElementById('tetris-canvas') as HTMLCanvasElement;
const holdCanvas = document.getElementById('hold-canvas') as HTMLCanvasElement;
const next1Canvas = document.getElementById('next1-canvas') as HTMLCanvasElement;
const next2Canvas = document.getElementById('next2-canvas') as HTMLCanvasElement;
const next3Canvas = document.getElementById('next3-canvas') as HTMLCanvasElement;

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

const modeModal = document.getElementById('mode-modal')!;
const selectTimeattack = document.getElementById('select-timeattack')!;
const selectClassic = document.getElementById('select-classic')!;
const startGameBtn = document.getElementById('start-game-btn')!;
const modalViewLeaderboardBtn = document.getElementById('modal-view-leaderboard-btn')!;

const leaderboardModal = document.getElementById('leaderboard-modal')!;
const modalTabTimeattack = document.getElementById('modal-tab-timeattack')!;
const modalTabClassic = document.getElementById('modal-tab-classic')!;
const modalLeaderboardList = document.getElementById('modal-leaderboard-list')!;
const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn')!;

const gameoverModal = document.getElementById('gameover-modal')!;
const gameoverTitle = document.getElementById('gameover-title')!;
const resScore = document.getElementById('res-score')!;
const resLines = document.getElementById('res-lines')!;
const resCombo = document.getElementById('res-combo')!;
const leaderboardForm = document.getElementById('leaderboard-form') as HTMLFormElement;
const playerNameInput = document.getElementById('player-name') as HTMLInputElement;
const restartBtn = document.getElementById('restart-btn')!;

// App State
let selectedMode: GameMode = 'timeattack';
let currentStats: GameStats | null = null;

// Initialize Banner Overlay
const canvasWrapper = document.getElementById('canvas-wrapper')!;
const comboBanner = new ComboBanner(canvasWrapper);
const soundManager = SoundManager.getInstance();

// Game Loop Setup
const gameLoop = new GameLoop(tetrisCanvas, {
  onStatsUpdate: (stats) => {
    currentStats = stats;
    scoreVal.innerText = stats.score.toLocaleString();
    linesVal.innerText = stats.lines.toString();
    levelVal.innerText = stats.level.toString();
    comboVal.innerText = stats.maxCombo.toString();

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
    gameoverTitle.innerText = selectedMode === 'timeattack' ? 'TIME OVER!' : 'GAME OVER!';
    resScore.innerText = finalStats.score.toLocaleString();
    resLines.innerText = finalStats.lines.toString();
    resCombo.innerText = finalStats.maxCombo.toString();

    gameoverModal.classList.remove('hidden');
  }
});

// Helper for Preview Canvas Drawing
function drawMinoPreview(canvas: HTMLCanvasElement, type: MinoType | null) {
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!type) return;

  const shape = SHAPES[type];
  const rows = shape.length;
  const cols = shape[0].length;
  const cellSize = Math.min(canvas.width / (cols + 1), canvas.height / (rows + 1));

  const startX = (canvas.width - cols * cellSize) / 2;
  const startY = (canvas.height - rows * cellSize) / 2;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (shape[r][c]) {
        drawMinoCell(ctx, startX + c * cellSize, startY + r * cellSize, cellSize, type, false);
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

function renderModalLeaderboard(mode: GameMode) {
  modalTabTimeattack.classList.toggle('active', mode === 'timeattack');
  modalTabClassic.classList.toggle('active', mode === 'classic');

  const entries = LeaderboardManager.getEntries(mode);
  modalLeaderboardList.innerHTML = '';

  entries.forEach((entry, index) => {
    const li = document.createElement('li');
    li.className = 'leader-item';
    li.innerHTML = `
      <span class="leader-rank">${index + 1}</span>
      <span class="leader-name">${entry.name}</span>
      <span class="leader-score">${entry.score.toLocaleString()}점 (${entry.lines}줄)</span>
    `;
    modalLeaderboardList.appendChild(li);
  });
}

// Open / Close Leaderboard Modal
function openLeaderboardModal() {
  renderModalLeaderboard(selectedMode);
  modeModal.classList.add('hidden');
  leaderboardModal.classList.remove('hidden');
}

function closeLeaderboardModal() {
  leaderboardModal.classList.add('hidden');
  modeModal.classList.remove('hidden');
}

viewLeaderboardBtn.addEventListener('click', openLeaderboardModal);
modalViewLeaderboardBtn.addEventListener('click', openLeaderboardModal);
closeLeaderboardBtn.addEventListener('click', closeLeaderboardModal);

modalTabTimeattack.addEventListener('click', () => renderModalLeaderboard('timeattack'));
modalTabClassic.addEventListener('click', () => renderModalLeaderboard('classic'));

// Keyboard Listeners
window.addEventListener('keydown', (e) => {
  // Prevent scrolling
  if (['ArrowUp', 'ArrowDown', 'Space', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
    e.preventDefault();
  }

  switch (e.code) {
    case 'ArrowLeft':
      gameLoop.handleInput('left');
      break;
    case 'ArrowRight':
      gameLoop.handleInput('right');
      break;
    case 'ArrowDown':
      gameLoop.handleInput('down');
      break;
    case 'ArrowUp':
    case 'KeyX':
      gameLoop.handleInput('rotate');
      break;
    case 'Space':
      gameLoop.handleInput('hardDrop');
      break;
    case 'ShiftLeft':
    case 'ShiftRight':
    case 'KeyC':
      gameLoop.handleInput('hold');
      break;
  }
});

// Sound Toggle Event
soundToggleBtn.addEventListener('click', () => {
  const isMuted = soundManager.toggleMute();
  soundToggleBtn.innerHTML = isMuted
    ? `<svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`
    : `<svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
});

// Pause Event
pauseBtn.addEventListener('click', () => {
  gameLoop.togglePause();
});

// Mode Change / Open Modal Event
modeChangeBtn.addEventListener('click', () => {
  gameLoop.reset();
  modeModal.classList.remove('hidden');
});

// Mode Selection Modal Buttons
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
  modeModal.classList.add('hidden');
  leaderboardModal.classList.add('hidden');
  gameoverModal.classList.add('hidden');

  modeDisplayTag.innerHTML = selectedMode === 'timeattack'
    ? `<svg class="inline-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/></svg> <span>90s TIME ATTACK</span>`
    : `<svg class="inline-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> <span>CLASSIC MODE</span>`;
  gameLoop.setMode(selectedMode);
  gameLoop.start();

  renderLeaderboard(selectedMode);
});

// Leaderboard Tabs
tabTimeattack.addEventListener('click', () => renderLeaderboard('timeattack'));
tabClassic.addEventListener('click', () => renderLeaderboard('classic'));

// Leaderboard Name Submission Form
leaderboardForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentStats) return;

  const name = playerNameInput.value.trim();
  LeaderboardManager.addEntry(name, currentStats.score, currentStats.lines, selectedMode);

  playerNameInput.value = '';
  renderLeaderboard(selectedMode);

  gameoverModal.classList.add('hidden');
  openLeaderboardModal();
});

restartBtn.addEventListener('click', () => {
  gameoverModal.classList.add('hidden');
  modeModal.classList.remove('hidden');
});

// Initial Render
renderLeaderboard('timeattack');

