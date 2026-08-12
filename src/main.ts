import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { drawMinoCell } from './assets/characters';
import { SoundManager } from './audio/SoundManager';
import { GameLoop } from './engine/GameLoop';
import { SHAPES } from './engine/MinoFactory';
import type { GameMode, GameStats, MinoType } from './types/tetris';
import { ComboBanner } from './ui/ComboBanner';
import { LeaderboardManager } from './ui/Leaderboard';
import { RemotionModal } from './ui/RemotionModal';
import { TouchController } from './ui/TouchController';
import confetti from 'canvas-confetti';
import { useMultiplayerStore } from './stores/useMultiplayerStore';
import { OpponentBoardRenderer } from './ui/OpponentBoard';
import { generateKoreanNickname, generate4DigitRoomCode } from './utils/nicknameGenerator';
import { sanitizeMessage, checkChatCooldown } from './utils/profanityFilter';

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

const remotionDemoBtn = document.getElementById('remotion-demo-btn');
const homeRemotionDemoBtn = document.getElementById('home-remotion-demo-btn');
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

// Remotion Player React Root Instance
let remotionRoot: Root | null = null;

function openRemotionModal() {
  const container = document.getElementById('remotion-modal-root');
  if (!container) return;
  if (!remotionRoot) {
    remotionRoot = createRoot(container);
  }
  remotionRoot.render(
    React.createElement(RemotionModal, {
      onClose: () => {
        if (remotionRoot) {
          remotionRoot.render(null);
        }
      },
    }),
  );
}

if (remotionDemoBtn) {
  remotionDemoBtn.addEventListener('click', openRemotionModal);
}
if (homeRemotionDemoBtn) {
  homeRemotionDemoBtn.addEventListener('click', openRemotionModal);
}

// View Navigation Manager
function showHomeView() {
  soundManager.stopBGM();
  pauseModal.classList.add('hidden');
  leaderboardModal.classList.add('hidden');
  gameoverModal.classList.add('hidden');
  gameLoop.reset();

  homeView.classList.remove('hidden');
  gameView.classList.add('hidden');

  // Reset tab selection to Single Player by default
  const homeTabSingle = document.getElementById('home-tab-single');
  const homeTabMulti = document.getElementById('home-tab-multi');
  const singlePlayerSection = document.getElementById('single-player-section');
  const multiPlayerSection = document.getElementById('multi-player-section');

  if (homeTabSingle && homeTabMulti && singlePlayerSection && multiPlayerSection) {
    homeTabSingle.classList.add('active');
    homeTabMulti.classList.remove('active');
    singlePlayerSection.classList.remove('hidden');
    multiPlayerSection.classList.add('hidden');
  }

  if (pauseBtn) pauseBtn.style.display = 'none';
  if (modeChangeBtn) modeChangeBtn.style.display = 'none';
}

function showGameView(isMultiplayer = false, autoStartGame = true) {
  homeView.classList.add('hidden');
  gameView.classList.remove('hidden');

  if (pauseBtn) pauseBtn.style.display = 'inline-flex';
  if (modeChangeBtn) modeChangeBtn.style.display = 'inline-flex';

  if (isMultiplayer) {
    if (singleLeaderboardPanel) singleLeaderboardPanel.classList.add('hidden');
    if (opponentPanel) opponentPanel.classList.remove('hidden');

    modeDisplayTag.innerHTML = `<svg class="inline-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> <span>1v1 클래식 대전</span>`;
    gameLoop.setMode('classic');
    if (timerVal) timerVal.innerText = '00:00';
    if (timerFill) timerFill.style.width = '100%';

    const mpStatus = useMultiplayerStore.getState().status;
    if (mpStatus === 'PLAYING') {
      gameLoop.start();
      soundManager.startBGM();
    } else {
      gameLoop.reset(); // Lobby waiting mode: board is reset, but game is NOT started automatically!
    }
  } else {
    if (singleLeaderboardPanel) singleLeaderboardPanel.classList.remove('hidden');
    if (opponentPanel) opponentPanel.classList.add('hidden');

    if (selectedMode === 'timeattack') {
      modeDisplayTag.innerHTML = `<svg class="inline-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> <span>90초 타임어택</span>`;
    } else {
      modeDisplayTag.innerHTML = `<svg class="inline-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> <span>클래식 서바이벌</span>`;
    }
    gameLoop.setMode(selectedMode);
    if (autoStartGame) {
      gameLoop.start();
      soundManager.startBGM();
    }
  }

  if (!isMultiplayer) {
    renderLeaderboard(selectedMode);
  }
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

    const currentMode = gameLoop.getMode();
    if (currentMode === 'timeattack') {
      const minutes = Math.floor(stats.timeRemaining / 60);
      const seconds = stats.timeRemaining % 60;
      timerVal.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      const pct = (stats.timeRemaining / 90) * 100;
      timerFill.style.width = `${Math.max(0, pct)}%`;
    } else {
      const minutes = Math.floor(stats.elapsedTime / 60);
      const seconds = stats.elapsedTime % 60;
      timerVal.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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

    const isMulti = useMultiplayerStore.getState().roomId !== null;
    const multiActions = document.getElementById('multi-gameover-actions');
    const singleForm = document.getElementById('leaderboard-form');
    const singleRestartBtn = document.getElementById('restart-btn');

    if (isMulti) {
      useMultiplayerStore.getState().sendGameOver(finalStats.score, finalStats.elapsedTime);
      gameoverTitle.innerText = '멀티 플레이 대전 종료!';
      if (celebrationBadge) celebrationBadge.innerText = '1v1 MATCH';
      if (multiActions) multiActions.classList.remove('hidden');
      if (singleForm) singleForm.classList.add('hidden');
      if (singleRestartBtn) singleRestartBtn.classList.add('hidden');
    } else {
      gameoverTitle.innerText =
        selectedMode === 'timeattack' ? '제한 시간 종료!' : '게임 종료!';
      if (celebrationBadge) {
        celebrationBadge.innerText = LeaderboardManager.getPercentileBadge(
          finalStats.score,
          selectedMode,
        );
      }
      if (multiActions) multiActions.classList.add('hidden');
      if (singleForm) singleForm.classList.remove('hidden');
      if (singleRestartBtn) singleRestartBtn.classList.remove('hidden');
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
  if (opponentPanel) opponentPanel.classList.add('hidden');
  if (singleLeaderboardPanel) singleLeaderboardPanel.classList.remove('hidden');
  showGameView(false);
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

// Home Main Tabs (Single Player vs Realtime Multiplayer)
const homeTabSingle = document.getElementById('home-tab-single');
const homeTabMulti = document.getElementById('home-tab-multi');
const singlePlayerSection = document.getElementById('single-player-section');
const multiPlayerSection = document.getElementById('multi-player-section');

if (homeTabSingle && homeTabMulti && singlePlayerSection && multiPlayerSection) {
  homeTabSingle.addEventListener('click', () => {
    homeTabSingle.classList.add('active');
    homeTabMulti.classList.remove('active');
    singlePlayerSection.classList.remove('hidden');
    multiPlayerSection.classList.add('hidden');
  });

  homeTabMulti.addEventListener('click', () => {
    homeTabMulti.classList.add('active');
    homeTabSingle.classList.remove('active');
    multiPlayerSection.classList.remove('hidden');
    singlePlayerSection.classList.add('hidden');
  });
}

// Realtime Multiplayer Room Join Logic
const multiNicknameInput = document.getElementById('multi-nickname') as HTMLInputElement;
const multiRoomIdInput = document.getElementById('multi-room-id') as HTMLInputElement;
const randomNicknameBtn = document.getElementById('random-nickname-btn');
const quickMatchBtn = document.getElementById('quick-match-btn');
const createRoomBtn = document.getElementById('create-room-btn');

// Initial Korean Random Nickname Assignment
if (multiNicknameInput) {
  multiNicknameInput.value = generateKoreanNickname();
}

if (randomNicknameBtn && multiNicknameInput) {
  randomNicknameBtn.addEventListener('click', () => {
    multiNicknameInput.value = generateKoreanNickname();
  });
}

const opponentPanel = document.getElementById('opponent-panel');
const singleLeaderboardPanel = document.getElementById('single-leaderboard-panel');
const opponentCanvas = document.getElementById('opponent-canvas') as HTMLCanvasElement;
const opponentNameTag = document.getElementById('opponent-name-tag');
const garbageCountTag = document.getElementById('garbage-count');

let opponentRenderer: OpponentBoardRenderer | null = null;
if (opponentCanvas) {
  opponentRenderer = new OpponentBoardRenderer(opponentCanvas);
}

function startMultiplayerGame(roomId: string) {
  const nickname = multiNicknameInput?.value.trim() || generateKoreanNickname();
  useMultiplayerStore.getState().joinRoom(roomId, nickname);

  // Switch Right Panel Layout for 1v1 PvP
  if (opponentPanel) opponentPanel.classList.remove('hidden');
  if (singleLeaderboardPanel) singleLeaderboardPanel.classList.add('hidden');

  showGameView(true, false); // Enter lobby view without starting game loop
}

if (quickMatchBtn) {
  quickMatchBtn.addEventListener('click', () => {
    const customRoom = multiRoomIdInput?.value.trim();
    const nickname = multiNicknameInput?.value.trim() || generateKoreanNickname();

    if (customRoom && customRoom.length === 4) {
      // 4자리 지정 방 코드가 있는 경우 직통 입장
      startMultiplayerGame(customRoom);
    } else {
      // 빠른 무작위 매칭: 서버 매치메이킹 큐에 대기 요청!
      if (opponentPanel) opponentPanel.classList.remove('hidden');
      if (singleLeaderboardPanel) singleLeaderboardPanel.classList.add('hidden');
      useMultiplayerStore.getState().requestQuickMatch(nickname);
      showGameView(true, false); // Enter lobby view without starting game loop
    }
  });
}

if (createRoomBtn) {
  createRoomBtn.addEventListener('click', () => {
    const roomId = generate4DigitRoomCode();
    if (multiRoomIdInput) multiRoomIdInput.value = roomId;
    startMultiplayerGame(roomId);
  });
}

const toggleReadyBtn = document.getElementById('toggle-ready-btn');
const multiRematchBtn = document.getElementById('multi-rematch-btn');
const multiLeaveBtn = document.getElementById('multi-leave-btn');

if (toggleReadyBtn) {
  toggleReadyBtn.addEventListener('click', () => {
    useMultiplayerStore.getState().toggleReady();
  });
}

if (multiRematchBtn) {
  multiRematchBtn.addEventListener('click', () => {
    gameoverModal.classList.add('hidden');
    useMultiplayerStore.getState().toggleReady();
  });
}

if (multiLeaveBtn) {
  multiLeaveBtn.addEventListener('click', () => {
    useMultiplayerStore.getState().leaveRoom();
    showHomeView();
  });
}

let lastMultiStatus = 'IDLE';

// Subscribe to Multiplayer Store Updates
useMultiplayerStore.subscribe((state) => {
  if (state.roomId && multiRoomIdInput) {
    multiRoomIdInput.value = state.roomId;
  }

  // Transition to Game View on BOTH PLAYERS READY -> PLAYING
  if (state.status === 'PLAYING' && lastMultiStatus !== 'PLAYING') {
    gameoverModal.classList.add('hidden');
    showGameView(true);
  }

  // Victory / Defeat Modal Trigger for Multiplayer
  if (state.status === 'GAME_OVER' && lastMultiStatus === 'PLAYING') {
    gameLoop.stop(); // Completely stop background game loop, lock animation, and timers!
    soundManager.stopBGM();

    const multiActions = document.getElementById('multi-gameover-actions');
    const singleForm = document.getElementById('leaderboard-form');
    const singleRestartBtn = document.getElementById('restart-btn');

    if (multiActions) multiActions.classList.remove('hidden');
    if (singleForm) singleForm.classList.add('hidden');
    if (singleRestartBtn) singleRestartBtn.classList.add('hidden');

    if (state.gameWinner === 'ME') {
      gameoverTitle.innerText = 'VICTORY! 1v1 대전 승리!';
      if (celebrationBadge) celebrationBadge.innerText = 'WINNER!';
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } else {
      gameoverTitle.innerText = 'DEFEAT... 1v1 대전 패배!';
      if (celebrationBadge) celebrationBadge.innerText = '1v1 MATCH';
    }
    gameoverModal.classList.remove('hidden');
  }

  lastMultiStatus = state.status;

  if (toggleReadyBtn) {
    if (state.status === 'PLAYING') {
      toggleReadyBtn.style.display = 'none';
    } else {
      toggleReadyBtn.style.display = 'inline-flex';
      toggleReadyBtn.innerText = state.isReady ? '준비 완료! (취소)' : '게임 준비 (READY)';
      toggleReadyBtn.style.background = state.isReady ? '#00c73c' : '';
    }
  }

  if (opponentNameTag) {
    if (state.opponentNickname) {
      if (state.status === 'PLAYING') {
        opponentNameTag.innerHTML = `${state.opponentNickname} <span class="ingame-status-badge">대전 중 🔥</span>`;
        opponentPanel?.classList.remove('opponent-is-ready');
      } else if (state.opponentReady) {
        opponentNameTag.innerHTML = `${state.opponentNickname} <span class="ready-status-badge">READY!</span>`;
        opponentPanel?.classList.add('opponent-is-ready');
      } else {
        opponentNameTag.innerHTML = `${state.opponentNickname} <span class="waiting-status-badge">대기중</span>`;
        opponentPanel?.classList.remove('opponent-is-ready');
      }
    } else {
      opponentNameTag.innerHTML = state.status === 'WAITING' ? `방 코드 [${state.roomId}] 대기 중...` : '상대방 연결 대기';
      opponentPanel?.classList.remove('opponent-is-ready');
    }
  }

  if (chatPanel) {
    if (state.roomId !== null) {
      chatPanel.classList.remove('hidden');
    } else {
      chatPanel.classList.add('hidden');
    }
  }

  // Render Realtime Chat Messages
  if (chatMessagesBox && state.chatMessages) {
    const curSocket = state.socket;
    const mySocketId = curSocket ? curSocket.id : '';
    chatMessagesBox.innerHTML = state.chatMessages.length === 0
      ? '<div class="chat-system-msg">채팅방에 연결되었습니다.</div>'
      : state.chatMessages
          .map((msg) => {
            if (msg.socketId === 'system') {
              return `<div class="chat-system-msg warn">${msg.message}</div>`;
            }
            const isMe = msg.socketId === mySocketId;
            return `
              <div class="chat-msg-row ${isMe ? 'me' : 'opponent'}">
                <span class="chat-msg-sender">${isMe ? '나' : msg.sender}</span>
                <div class="chat-msg-bubble">${msg.message}</div>
              </div>
            `;
          })
          .join('');
    chatMessagesBox.scrollTop = chatMessagesBox.scrollHeight;
  }

  if (garbageCountTag) {
    garbageCountTag.innerText = state.pendingGarbageLines.toString();
  }

  if (opponentRenderer) {
    opponentRenderer.render(state.opponentState, state.opponentNickname);
  }
});

// Chat UI Controls
const chatPanel = document.getElementById('chat-panel');
const chatMessagesBox = document.getElementById('chat-messages-box');
const chatForm = document.getElementById('chat-form') as HTMLFormElement | null;
const chatInput = document.getElementById('chat-input') as HTMLInputElement | null;
const chatShortcutBtns = document.querySelectorAll('.chat-shortcut-btn');

function sendUserChat(text: string) {
  if (!text || text.trim().length === 0) return;
  const cooldown = checkChatCooldown();
  if (!cooldown.allowed) {
    useMultiplayerStore.setState((s) => ({
      chatMessages: [
        ...s.chatMessages,
        {
          sender: '시스템',
          socketId: 'system',
          message: '메시지는 1초에 한 번만 전송할 수 있습니다.',
          timestamp: Date.now(),
        },
      ],
    }));
    return;
  }

  const cleanText = sanitizeMessage(text.trim());
  useMultiplayerStore.getState().sendChatMessage(cleanText);
}

if (chatForm) {
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (chatInput && chatInput.value.trim().length > 0) {
      sendUserChat(chatInput.value.trim());
      chatInput.value = '';
    }
  });
}

chatShortcutBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const emoji = btn.getAttribute('data-emoji');
    if (emoji) {
      sendUserChat(emoji);
    }
  });
});
