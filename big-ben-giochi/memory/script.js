const MASCOTS = [
  { type: 'img', value: 'assets/mascots/cards/kip.jpg', alt: 'Kip' },
  { type: 'img', value: 'assets/mascots/cards/stella.jpg', alt: 'Stella' },
  { type: 'img', value: 'assets/mascots/cards/bolt.jpg', alt: 'Bolt' },
  { type: 'img', value: 'assets/mascots/cards/bobo.jpg', alt: 'Bobo' },
];

const EMOJIS = ['🚀', '🌈', '🪐', '🌟', '🛸', '🎈', '🦄', '🍭', '🎪', '🌻', '🐬', '🍩', '🎨', '🐙', '🍉', '🎠'];

const CARD_VALUES = [
  ...MASCOTS,
  ...EMOJIS.map((e) => ({ type: 'emoji', value: e, alt: e })),
];

const board = document.getElementById('board');
const movesEl = document.getElementById('moves');
const timerEl = document.getElementById('timer');
const pairsEl = document.getElementById('pairs');
const restartBtn = document.getElementById('restart-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const difficultySelect = document.getElementById('difficulty');
const winOverlay = document.getElementById('win-overlay');
const finalMovesEl = document.getElementById('final-moves');
const finalTimeEl = document.getElementById('final-time');
const confettiLayer = document.getElementById('confetti-layer');

let flippedCards = [];
let matchedCount = 0;
let totalPairs = 8;
let moves = 0;
let timerInterval = null;
let secondsElapsed = 0;
let lockBoard = false;

let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(freq, duration = 0.15, type = 'sine', delay = 0) {
  const ctx = getAudioCtx();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.value = freq;
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  const startTime = ctx.currentTime + delay;
  gain.gain.setValueAtTime(0.15, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

function playFlipSound() {
  playTone(520, 0.08, 'triangle');
}

function playMatchSound() {
  playTone(660, 0.12, 'sine');
  playTone(880, 0.15, 'sine', 0.1);
}

function playMismatchSound() {
  playTone(180, 0.2, 'sawtooth');
}

function playWinFanfare() {
  [523, 659, 784, 1047].forEach((freq, i) => playTone(freq, 0.25, 'triangle', i * 0.15));
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function startTimer() {
  stopTimer();
  secondsElapsed = 0;
  timerEl.textContent = formatTime(0);
  timerInterval = setInterval(() => {
    secondsElapsed++;
    timerEl.textContent = formatTime(secondsElapsed);
  }, 1000);
}

function stopTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
}

function renderCardBackContent(card) {
  if (card.type === 'img') {
    return `<img src="${card.value}" alt="${card.alt}">`;
  }
  return card.value;
}

function createCard(card, index) {
  const el = document.createElement('div');
  el.className = 'card';
  el.dataset.key = card.alt + '|' + card.value;
  el.dataset.index = index;

  el.innerHTML = `
    <div class="card-inner">
      <div class="card-face card-front"></div>
      <div class="card-face card-back">${renderCardBackContent(card)}</div>
    </div>
  `;

  el.addEventListener('click', () => onCardClick(el));
  return el;
}

function onCardClick(card) {
  if (lockBoard) return;
  if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
  if (flippedCards.length === 2) return;

  card.classList.add('flipped');
  playFlipSound();
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    moves++;
    movesEl.textContent = moves;
    checkMatch();
  }
}

function checkMatch() {
  const [first, second] = flippedCards;
  const isMatch = first.dataset.key === second.dataset.key;

  if (isMatch) {
    first.classList.add('matched');
    second.classList.add('matched');
    flippedCards = [];
    matchedCount++;
    pairsEl.textContent = `${matchedCount}/${totalPairs}`;
    playMatchSound();

    if (matchedCount === totalPairs) {
      stopTimer();
      setTimeout(showWin, 500);
    }
  } else {
    lockBoard = true;
    playMismatchSound();
    first.classList.add('mismatch');
    second.classList.add('mismatch');
    setTimeout(() => {
      first.classList.remove('flipped', 'mismatch');
      second.classList.remove('flipped', 'mismatch');
      flippedCards = [];
      lockBoard = false;
    }, 800);
  }
}

function launchConfetti() {
  const colors = ['#ff8bcb', '#ffb648', '#7c6bff', '#4caf50', '#ffd66b', '#6bd4ff'];
  confettiLayer.innerHTML = '';
  for (let i = 0; i < 80; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = `${2 + Math.random() * 2}s`;
    piece.style.animationDelay = `${Math.random() * 0.5}s`;
    confettiLayer.appendChild(piece);
  }
}

function showWin() {
  finalMovesEl.textContent = moves;
  finalTimeEl.textContent = formatTime(secondsElapsed);
  winOverlay.classList.remove('hidden');
  launchConfetti();
  playWinFanfare();
}

function hideWin() {
  winOverlay.classList.add('hidden');
  confettiLayer.innerHTML = '';
}

function buildBoard() {
  hideWin();
  stopTimer();

  totalPairs = parseInt(difficultySelect.value === '18' ? 18 : 8, 10);
  moves = 0;
  matchedCount = 0;
  flippedCards = [];
  lockBoard = false;

  movesEl.textContent = '0';
  pairsEl.textContent = `0/${totalPairs}`;
  timerEl.textContent = '00:00';

  board.classList.toggle('large', totalPairs > 8);

  const chosenCards = shuffle(CARD_VALUES).slice(0, totalPairs);
  const boardCards = shuffle([...chosenCards, ...chosenCards]);

  board.innerHTML = '';
  boardCards.forEach((card, index) => {
    board.appendChild(createCard(card, index));
  });

  startTimer();
}

restartBtn.addEventListener('click', buildBoard);
playAgainBtn.addEventListener('click', buildBoard);
difficultySelect.addEventListener('change', buildBoard);

buildBoard();

// Service worker disattivato nel kiosk: evita cache stale quando aggiorniamo da remoto.
