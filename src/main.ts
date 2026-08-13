import { drawMinoCell } from './assets/characters';
import { SoundManager } from './audio/SoundManager';
import { GameLoop } from './engine/GameLoop';
import { SHAPES } from './engine/MinoFactory';
import type { GameMode, GameStats, MinoType } from './types/tetris';
import { ComboBanner } from './ui/ComboBanner';
import { LeaderboardManager } from './ui/Leaderboard';
import { TouchController } from './ui/TouchController';
import { GestureController } from './ui/GestureController';
import confetti from 'canvas-confetti';
import { useMultiplayerStore, type ChatMessage } from './stores/useMultiplayerStore';
import { OpponentBoardRenderer } from './ui/OpponentBoard';
import { generateKoreanNickname, generate4DigitRoomCode } from './utils/nicknameGenerator';
import { sanitizeMessage, checkChatCooldown } from './utils/profanityFilter';
import { escapeHtml } from './utils/escapeHtml';

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
// React + @remotion/player + 데모 컴포넌트는 전체 번들의 절반이 넘는다(약 370KB).
// 테트리스만 하러 온 방문객이 이를 내려받지 않도록 클릭 시점에 동적으로 불러온다.
type ReactRoot = import('react-dom/client').Root;
let remotionRoot: ReactRoot | null = null;
let remotionLoading = false;

async function openRemotionModal(trigger?: HTMLElement | null) {
  const container = document.getElementById('remotion-modal-root');
  if (!container || remotionLoading) return;

  // 게임 진행 중에는 열지 않는다. 전체화면 모달이 떠도 게임 루프는 계속 돌고,
  // window keydown 핸들러가 Space/방향키를 보드로 계속 전달하기 때문이다.
  if (gameLoop.getIsRunning()) return;

  // 라벨은 SVG 아이콘 옆 <span>에만 들어있다. textContent를 건드리면 아이콘이 지워진다.
  const labelEl = trigger?.querySelector('span') ?? null;
  const originalLabel = labelEl?.textContent ?? '';

  remotionLoading = true;
  if (trigger) trigger.setAttribute('disabled', 'true');
  if (labelEl) labelEl.textContent = '로딩 중…';

  try {
    const [React, { createRoot }, { RemotionModal }] = await Promise.all([
      import('react'),
      import('react-dom/client'),
      import('./ui/RemotionModal'),
    ]);

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
  } catch (e) {
    console.error('AI 생성 시연 모듈을 불러오지 못했습니다', e);
    alert('시연 영상을 불러오지 못했습니다. 네트워크를 확인해주세요.');
  } finally {
    remotionLoading = false;
    if (trigger) trigger.removeAttribute('disabled');
    if (labelEl) labelEl.textContent = originalLabel;
  }
}

if (remotionDemoBtn) {
  remotionDemoBtn.addEventListener('click', () => openRemotionModal(remotionDemoBtn));
}
if (homeRemotionDemoBtn) {
  homeRemotionDemoBtn.addEventListener('click', () => openRemotionModal(homeRemotionDemoBtn));
}

// View Navigation Manager
function showHomeView() {
  soundManager.stopBGM();
  pauseModal.classList.add('hidden');
  leaderboardModal.classList.add('hidden');
  gameoverModal.classList.add('hidden');

  // 대전방을 떠나지 않고 홈으로 나가면 스토어 status가 PLAYING으로 남아, 이후 싱글 게임의
  // 보드가 방으로 계속 방송되고 상대의 가비지가 싱글 보드에 주입된다.
  if (useMultiplayerStore.getState().roomId !== null) {
    useMultiplayerStore.getState().leaveRoom();
  }

  gameLoop.stop();
  gameLoop.reset();

  if (opponentRenderer) {
    opponentRenderer.clear();
  }

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
  // 홈에서는 시연 버튼을 다시 노출한다
  if (remotionDemoBtn) remotionDemoBtn.style.display = '';
}

function showGameView(isMultiplayer = false, autoStartGame = true) {
  homeView.classList.add('hidden');
  gameView.classList.remove('hidden');

  if (pauseBtn) pauseBtn.style.display = 'inline-flex';
  if (modeChangeBtn) modeChangeBtn.style.display = 'inline-flex';

  // 게임 화면에서는 시연 버튼을 감춘다. 전체화면 자동재생 모달이 떠도 게임은 계속 돌고
  // 키 입력이 보드로 그대로 전달되어, 특히 일시정지가 불가능한 1v1에서는 판을 망친다.
  // 홈 화면의 시연 버튼(home-remotion-demo-btn)은 그대로 두어 스태프 시연은 가능하다.
  if (remotionDemoBtn) remotionDemoBtn.style.display = 'none';

  const chatPanel = document.getElementById('chat-panel');

  if (isMultiplayer) {
    if (singleLeaderboardPanel) singleLeaderboardPanel.classList.add('hidden');
    if (opponentPanel) opponentPanel.classList.remove('hidden');
    if (chatPanel) chatPanel.classList.remove('hidden');

    // 1v1에서는 일시정지가 무적 악용이 되므로 버튼 자체를 노출하지 않는다 (handleTogglePause도 가드됨)
    if (pauseBtn) pauseBtn.style.display = 'none';

    modeDisplayTag.innerHTML = `<svg class="inline-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> <span>1v1 클래식 대전</span>`;
    gameLoop.setMode('classic');
    if (timerVal) timerVal.innerText = '00:00';
    if (timerFill) timerFill.style.width = '100%';

    const mpState = useMultiplayerStore.getState();
    if (mpState.status === 'PLAYING') {
      // 서버가 배포한 공용 시드로 시작해야 두 플레이어의 7-Bag 순서가 일치한다.
      gameLoop.start(mpState.gameSeed ?? undefined);
      soundManager.startBGM();
    } else {
      gameLoop.reset(); // Lobby waiting mode: board is reset, but game is NOT started automatically!
    }
  } else {
    if (singleLeaderboardPanel) singleLeaderboardPanel.classList.remove('hidden');
    if (opponentPanel) opponentPanel.classList.add('hidden');
    if (chatPanel) chatPanel.classList.add('hidden');

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

// Initialize Touch D-Pad & Gesture Controllers for Mobile
const touchControlsRoot = document.getElementById('touch-controls-root');
const modeBtnDpad = document.getElementById('mode-btn-dpad');
const modeBtnGesture = document.getElementById('mode-btn-gesture');

let touchController: TouchController | null = null;
let gestureController: GestureController | null = null;

const callbacks = {
  onLeft: () => gameLoop.handleInput('left'),
  onRight: () => gameLoop.handleInput('right'),
  onSoftDrop: () => gameLoop.handleInput('down'),
  onHardDrop: () => gameLoop.handleInput('hardDrop'),
  onRotateCW: () => gameLoop.handleInput('rotate'),
  onHold: () => gameLoop.handleInput('hold'),
};

if (touchControlsRoot) {
  touchController = new TouchController(touchControlsRoot, callbacks);
}

if (tetrisCanvas) {
  gestureController = new GestureController(tetrisCanvas, callbacks);
}

// Control Mode Switching Logic (Button Pad vs Canvas Gesture)
let activeControlMode: 'dpad' | 'gesture' =
  (localStorage.getItem('kode_runner_control_mode') as 'dpad' | 'gesture') || 'dpad';

function updateControlModeUI(mode: 'dpad' | 'gesture') {
  activeControlMode = mode;
  localStorage.setItem('kode_runner_control_mode', mode);

  if (modeBtnDpad && modeBtnGesture) {
    if (mode === 'dpad') {
      modeBtnDpad.classList.add('active');
      modeBtnGesture.classList.remove('active');
      if (touchController) touchController.setVisible(true);
      if (gestureController) gestureController.setEnabled(false);
    } else {
      modeBtnGesture.classList.add('active');
      modeBtnDpad.classList.remove('active');
      if (touchController) touchController.setVisible(false);
      if (gestureController) gestureController.setEnabled(true);
    }
  }
}

if (modeBtnDpad && modeBtnGesture) {
  modeBtnDpad.addEventListener('click', () => updateControlModeUI('dpad'));
  modeBtnGesture.addEventListener('click', () => updateControlModeUI('gesture'));
  updateControlModeUI(activeControlMode);
}

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
      const mpState = useMultiplayerStore.getState();
      // 멀티 결과 화면(제목·뱃지·모달 노출)은 전적으로 스토어 구독이 담당한다.
      // sendGameOver가 status를 GAME_OVER로 바꾸는 순간 구독이 동기적으로 실행되어
      // VICTORY/DEFEAT를 그리므로, 여기서 제목을 덮어쓰면 패자에게 DEFEAT 대신
      // 중립 문구가 남는다(실제로 그랬음).
      if (mpState.status === 'PLAYING') {
        mpState.sendGameOver(finalStats.score, finalStats.elapsedTime);
      }
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

// Helper for Preview Canvas Drawing (Perfect Tight-Bounding-Box Centering)
function drawMinoPreview(canvas: HTMLCanvasElement, type: MinoType | null) {
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!type) return;

  const shape = SHAPES[type];

  // Compute tight bounding box of filled cells
  let minRow = shape.length, maxRow = -1;
  let minCol = shape[0].length, maxCol = -1;

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        if (r < minRow) minRow = r;
        if (r > maxRow) maxRow = r;
        if (c < minCol) minCol = c;
        if (c > maxCol) maxCol = c;
      }
    }
  }

  if (maxRow === -1 || maxCol === -1) return;

  const realRows = maxRow - minRow + 1;
  const realCols = maxCol - minCol + 1;

  // Calculate optimum cell size fitting tightly inside canvas with padding
  const padding = 6;
  const availW = canvas.width - padding * 2;
  const availH = canvas.height - padding * 2;
  const maxCell = canvas.width > 80 ? 22 : 12; // Cap cell size for large vs mini canvases
  const cellSize = Math.min(availW / realCols, availH / realRows, maxCell);

  // Exact center offsets
  const startX = (canvas.width - realCols * cellSize) / 2;
  const startY = (canvas.height - realRows * cellSize) / 2;

  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      if (shape[r][c]) {
        const drawX = startX + (c - minCol) * cellSize;
        const drawY = startY + (r - minRow) * cellSize;
        drawMinoCell(
          ctx,
          drawX,
          drawY,
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
      <span class="leader-name">${escapeHtml(entry.name)}</span>
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
      <span class="leader-name">${escapeHtml(entry.name)}</span>
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

  // 1v1 대전에서는 일시정지를 허용하지 않는다.
  // 가비지 라인은 블록이 고정될 때(lockAndNext)만 주입되는데, 일시정지하면 updatePhysics가
  // 즉시 반환되어 블록이 영원히 고정되지 않는다. 즉 상대가 아무리 공격해도 내 보드는
  // 무한히 안전한 반면, 상대에게는 멈춘 보드만 계속 방송된다.
  if (useMultiplayerStore.getState().roomId !== null) return;

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

// 탭 복귀 시 백그라운드 스로틀링으로 밀린 게임 시계를 즉시 따라잡는다.
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    gameLoop.syncClock();
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
tabTimeattack.addEventListener('click', () => {
  renderLeaderboard('timeattack');
  useMultiplayerStore.getState().fetchLeaderboard('timeattack');
});
tabClassic.addEventListener('click', () => {
  renderLeaderboard('classic');
  useMultiplayerStore.getState().fetchLeaderboard('classic');
});

// Listen for Global Leaderboard Updates from Redis Server
window.addEventListener('leaderboard_updated', (e: any) => {
  const detail = e.detail;
  if (detail && detail.mode && Array.isArray(detail.entries)) {
    LeaderboardManager.setRemoteEntries(detail.mode, detail.entries);
    // 갱신된 모드가 현재 화면에 떠 있는 모드일 때만 다시 그린다.
    if (detail.mode === selectedMode) {
      renderLeaderboard(selectedMode);
    }
    if (!leaderboardModal.classList.contains('hidden') && detail.mode === currentModalMode) {
      renderModalLeaderboard(currentModalMode, leaderboardSearch?.value || '');
    }
  }
});

// Leaderboard Name Submission Form
leaderboardForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentStats) return;

  const name = playerNameInput.value.trim() || '관람객';
  LeaderboardManager.addEntry(
    name,
    currentStats.score,
    currentStats.lines,
    selectedMode,
  );

  // Submit score to Cloud Redis Leaderboard
  useMultiplayerStore.getState().submitScore(
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

// Initial View Render & Cloud Leaderboard Sync
renderLeaderboard('timeattack');
showHomeView();
useMultiplayerStore.getState().fetchLeaderboard('timeattack');
useMultiplayerStore.getState().fetchLeaderboard('classic');

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
const boardReadyOverlay = document.getElementById('board-ready-overlay');
const boardVsDivider = document.getElementById('board-vs-divider');
const garbageIndicator = document.getElementById('garbage-indicator');
const singleLeaderboardPanel = document.getElementById('single-leaderboard-panel');
const opponentCanvas = document.getElementById('opponent-canvas') as HTMLCanvasElement;
const opponentNameTag = document.getElementById('opponent-name-tag');
const garbageCountTag = document.getElementById('garbage-count');

let opponentRenderer: OpponentBoardRenderer | null = null;
if (opponentCanvas) {
  opponentRenderer = new OpponentBoardRenderer(opponentCanvas);
  (window as any).opponentRenderer = opponentRenderer;
}

function startMultiplayerGame(roomId: string) {
  gameLoop.stop();
  gameLoop.reset();
  if (opponentRenderer) {
    opponentRenderer.clear();
  }

  const nickname = multiNicknameInput?.value.trim() || generateKoreanNickname();
  useMultiplayerStore.getState().joinRoom(roomId, nickname);

  // Switch Layout for 1v1 Dual-Board Arena
  if (opponentPanel) opponentPanel.classList.remove('hidden');
  if (boardReadyOverlay) boardReadyOverlay.classList.remove('hidden');
  if (boardVsDivider) boardVsDivider.classList.remove('hidden');
  if (singleLeaderboardPanel) singleLeaderboardPanel.classList.add('hidden');

  showGameView(true, false); // Enter lobby view without starting game loop
}

const joinRoomBtn = document.getElementById('join-room-btn');

if (joinRoomBtn) {
  joinRoomBtn.addEventListener('click', () => {
    const customRoom = multiRoomIdInput?.value.trim();
    // 숫자 4자리만 허용. 길이만 검사하면 `<b>x` 같은 값이 방 코드로 통과해
    // 방 코드를 표시하는 innerHTML 경로로 흘러든다.
    if (!customRoom || !/^\d{4}$/.test(customRoom)) {
      alert('입장할 4자리 방 코드를 올바르게 입력해주세요 (예: 4829)');
      multiRoomIdInput?.focus();
      return;
    }
    startMultiplayerGame(customRoom);
  });
}

if (quickMatchBtn) {
  quickMatchBtn.addEventListener('click', () => {
    gameLoop.stop();
    gameLoop.reset();
    if (opponentRenderer) {
      opponentRenderer.clear();
    }

    const nickname = multiNicknameInput?.value.trim() || generateKoreanNickname();

    if (opponentPanel) opponentPanel.classList.remove('hidden');
    if (boardReadyOverlay) boardReadyOverlay.classList.remove('hidden');
    if (boardVsDivider) boardVsDivider.classList.remove('hidden');
    if (singleLeaderboardPanel) singleLeaderboardPanel.classList.add('hidden');
    useMultiplayerStore.getState().requestQuickMatch(nickname);
    showGameView(true, false); // Enter lobby view without starting game loop
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

/**
 * 채팅 행을 DOM API로 조립한다.
 *
 * innerHTML 템플릿에 상대가 보낸 message/sender를 그대로 끼워 넣으면 임의 스크립트가
 * 내 브라우저에서 실행된다. textContent는 구조적으로 그 경로를 차단한다.
 */
function buildChatRow(msg: ChatMessage, mySocketId: string): HTMLElement {
  if (msg.socketId === 'system') {
    const systemRow = document.createElement('div');
    systemRow.className = 'chat-system-msg warn';
    systemRow.textContent = msg.message;
    return systemRow;
  }

  const isMe = msg.socketId === mySocketId;

  const row = document.createElement('div');
  row.className = `chat-msg-row ${isMe ? 'me' : 'opponent'}`;

  const sender = document.createElement('span');
  sender.className = 'chat-msg-sender';
  sender.textContent = isMe ? '나' : msg.sender;

  const bubble = document.createElement('div');
  bubble.className = 'chat-msg-bubble';
  bubble.textContent = msg.message;

  row.appendChild(sender);
  row.appendChild(bubble);
  return row;
}

/**
 * 직전에 DOM에 반영한 값들.
 *
 * 이 구독 콜백은 모든 상태 변화에 발화하는데, 대전 중에는 opponentState가 초당 15회
 * 갱신된다. 매번 채팅 박스를 통째로 다시 만들고 상대 보드를 재렌더하면(이미 GameLoop가
 * 프레임마다 그리고 있다) 그대로 프레임 드랍으로 이어진다. 바뀐 블록만 건드린다.
 */
const rendered = {
  roomId: null as string | null,
  isReady: null as boolean | null,
  garbageLines: -1,
  status: '' as string,
  opponentNickname: null as string | null,
  opponentReady: null as boolean | null,
  chatCount: -1,
  joinError: null as string | null,
};

// Subscribe to Multiplayer Store Updates
useMultiplayerStore.subscribe((state) => {
  if (state.roomId && multiRoomIdInput && state.roomId !== rendered.roomId) {
    multiRoomIdInput.value = state.roomId;
  }

  if (state.joinError && state.joinError !== rendered.joinError) {
    alert(state.joinError);
    showHomeView();
  }
  rendered.joinError = state.joinError;

  // Interactive Board Ready Overlay Toggle & Button Text Update
  if (toggleReadyBtn && state.isReady !== rendered.isReady) {
    const readySpan = toggleReadyBtn.querySelector('span');
    if (state.isReady) {
      toggleReadyBtn.classList.add('is-ready');
      if (readySpan) readySpan.innerText = '✓ READY 완료 (상대 대기중)';
    } else {
      toggleReadyBtn.classList.remove('is-ready');
      if (readySpan) readySpan.innerText = '⚡ 게임 준비 (READY)';
    }
  }

  // Interactive Garbage Attack Indicator Badge Update
  if (garbageIndicator && garbageCountTag && state.pendingGarbageLines !== rendered.garbageLines) {
    garbageCountTag.innerText = state.pendingGarbageLines.toString();
    if (state.pendingGarbageLines > 0) {
      garbageIndicator.classList.remove('hidden');
    } else {
      garbageIndicator.classList.add('hidden');
    }
  }

  if (state.status === 'PLAYING') {
    if (boardReadyOverlay) boardReadyOverlay.classList.add('hidden');
  } else if (state.status === 'WAITING' || state.status === 'CONNECTING') {
    if (boardReadyOverlay && opponentPanel && !opponentPanel.classList.contains('hidden')) {
      boardReadyOverlay.classList.remove('hidden');
    }
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

    const stats = gameLoop.getStats();
    if (resScore) resScore.innerText = stats.score.toLocaleString();
    if (resLines) resLines.innerText = stats.lines.toString();
    if (resCombo) resCombo.innerText = stats.maxCombo.toString();

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

  const statusChanged = state.status !== rendered.status;

  if (toggleReadyBtn && (statusChanged || state.isReady !== rendered.isReady)) {
    if (state.status === 'PLAYING') {
      toggleReadyBtn.style.display = 'none';
    } else {
      toggleReadyBtn.style.display = 'inline-flex';
      toggleReadyBtn.innerText = state.isReady ? '준비 완료! (취소)' : '게임 준비 (READY)';
      toggleReadyBtn.style.background = state.isReady ? '#00c73c' : '';
    }
  }

  if (
    opponentNameTag &&
    (statusChanged ||
      state.opponentNickname !== rendered.opponentNickname ||
      state.opponentReady !== rendered.opponentReady ||
      state.roomId !== rendered.roomId)
  ) {
    // 닉네임과 방 코드는 상대 클라이언트가 보낸 값이므로 반드시 이스케이프한다.
    const safeNickname = escapeHtml(state.opponentNickname);
    if (state.opponentNickname) {
      if (state.status === 'PLAYING') {
        opponentNameTag.innerHTML = `${safeNickname} <span class="ingame-status-badge">대전 중 🔥</span>`;
        opponentPanel?.classList.remove('opponent-is-ready');
      } else if (state.opponentReady) {
        opponentNameTag.innerHTML = `${safeNickname} <span class="ready-status-badge">READY!</span>`;
        opponentPanel?.classList.add('opponent-is-ready');
      } else {
        opponentNameTag.innerHTML = `${safeNickname} <span class="waiting-status-badge">대기중</span>`;
        opponentPanel?.classList.remove('opponent-is-ready');
      }
    } else {
      opponentNameTag.innerHTML =
        state.status === 'WAITING'
          ? `방 코드 [${escapeHtml(state.roomId)}] 대기 중...`
          : '상대방 연결 대기';
      opponentPanel?.classList.remove('opponent-is-ready');
    }
  }

  if (chatPanel) {
    // Strictly restrict chat panel visibility to ACTIVE MULTIPLAYER game sessions
    const isMultiMode = !gameView.classList.contains('hidden') && opponentPanel && !opponentPanel.classList.contains('hidden');
    if (isMultiMode && state.roomId !== null) {
      chatPanel.classList.remove('hidden');
    } else {
      chatPanel.classList.add('hidden');
    }
  }

  // Render Realtime Chat Messages — 신규 메시지만 append (전체 재구성 금지)
  if (chatMessagesBox && state.chatMessages.length !== rendered.chatCount) {
    const mySocketId = state.socket?.id ?? '';
    const isReset = state.chatMessages.length < rendered.chatCount || rendered.chatCount < 0;

    if (isReset) {
      chatMessagesBox.replaceChildren();
      if (state.chatMessages.length === 0) {
        const placeholder = document.createElement('div');
        placeholder.className = 'chat-system-msg';
        placeholder.innerText = '채팅방에 연결되었습니다.';
        chatMessagesBox.appendChild(placeholder);
      }
    }

    const startIndex = isReset ? 0 : rendered.chatCount;
    for (const msg of state.chatMessages.slice(startIndex)) {
      chatMessagesBox.appendChild(buildChatRow(msg, mySocketId));
    }

    chatMessagesBox.scrollTop = chatMessagesBox.scrollHeight;
  }

  // 대전 중에는 GameLoop.render()가 매 프레임 상대 보드를 그린다. 여기서 또 그리면 중복이다.
  if (opponentRenderer && state.status !== 'PLAYING') {
    opponentRenderer.render(state.opponentState, state.opponentNickname);
  }

  rendered.roomId = state.roomId;
  rendered.isReady = state.isReady;
  rendered.garbageLines = state.pendingGarbageLines;
  rendered.status = state.status;
  rendered.opponentNickname = state.opponentNickname;
  rendered.opponentReady = state.opponentReady;
  rendered.chatCount = state.chatMessages.length;
  lastMultiStatus = state.status;
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
