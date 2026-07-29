// Client-side rendering and interaction for the Flask-backed Sudoku
const SIZE = 9;
const LEADERBOARD_KEY = 'sudokuLeaderboard';
const THEME_KEY = 'sudokuTheme';
let puzzle = [];
let timerInterval = null;
let timerStart = null;
let hintsUsed = 0;

function formatTime(seconds) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

function updateTimer() {
  const elapsed = Math.floor((Date.now() - timerStart) / 1000);
  document.getElementById('timer').innerText = formatTime(elapsed);
}

function resetTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  timerStart = null;
  document.getElementById('timer').innerText = '00:00';
}

function getLeaderboard() {
  const stored = localStorage.getItem(LEADERBOARD_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (err) {
    return [];
  }
}

function saveLeaderboard(records) {
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(records));
}

function getTheme() {
  return localStorage.getItem(THEME_KEY) || 'light';
}

function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark');
    document.getElementById('theme-toggle').innerText = 'Light Mode';
  } else {
    document.body.classList.remove('dark');
    document.getElementById('theme-toggle').innerText = 'Dark Mode';
  }
}

function loadTheme() {
  applyTheme(getTheme());
}

function toggleTheme() {
  const nextTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
  applyTheme(nextTheme);
  saveTheme(nextTheme);
}

function renderLeaderboard() {
  const records = getLeaderboard();
  const container = document.getElementById('leaderboard');
  if (!container) return;
  if (records.length === 0) {
    container.innerHTML = '<p>No leaderboard records yet.</p>';
    return;
  }
  const rows = records.map((record, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${record.name}</td>
      <td>${formatTime(record.timeSeconds)}</td>
      <td>${record.difficulty}</td>
      <td>${record.hintsUsed}</td>
    </tr>
  `).join('');
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Time</th>
          <th>Difficulty</th>
          <th>Hints</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

function addLeaderboardRecord(name, timeSeconds, difficulty, hints) {
  const records = getLeaderboard();
  records.push({name, timeSeconds, difficulty, hintsUsed: hints});
  records.sort((a, b) => a.timeSeconds - b.timeSeconds);
  const top10 = records.slice(0, 10);
  saveLeaderboard(top10);
  renderLeaderboard();
}

function startTimer() {
  resetTimer();
  timerStart = Date.now();
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function createBoardElement() {
  const boardDiv = document.getElementById('sudoku-board');
  boardDiv.innerHTML = '';
  for (let i = 0; i < SIZE; i++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'sudoku-row';
    for (let j = 0; j < SIZE; j++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.className = 'sudoku-cell';
      input.dataset.row = i;
      input.dataset.col = j;
      input.addEventListener('input', (e) => {
        const val = e.target.value.replace(/[^1-9]/g, '');
        e.target.value = val;
      });
      rowDiv.appendChild(input);
    }
    boardDiv.appendChild(rowDiv);
  }
}

function renderPuzzle(puz) {
  puzzle = puz;
  createBoardElement();
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = puzzle[i][j];
      const inp = inputs[idx];
      const blockAlt = ((Math.floor(i / 3) + Math.floor(j / 3)) % 2 === 0);
      inp.className = 'sudoku-cell' + (blockAlt ? ' block-alt' : '');
      if (val !== 0) {
        inp.value = val;
        inp.disabled = true;
        inp.className += ' prefilled';
      } else {
        inp.value = '';
        inp.disabled = false;
      }
    }
  }
}

async function newGame() {
  const difficulty = document.getElementById('difficulty').value;
  hintsUsed = 0;
  const res = await fetch(`/new?difficulty=${difficulty}`);
  const data = await res.json();
  renderPuzzle(data.puzzle);
  document.getElementById('message').innerText = '';
  startTimer();
}

async function checkSolution() {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const board = [];
  for (let i = 0; i < SIZE; i++) {
    board[i] = [];
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = inputs[idx].value;
      board[i][j] = val ? parseInt(val, 10) : 0;
    }
  }
  const res = await fetch('/check', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({board})
  });
  const data = await res.json();
  const msg = document.getElementById('message');
  if (data.error) {
    msg.style.color = '#d32f2f';
    msg.innerText = data.error;
    return;
  }
  const incorrect = new Set(data.incorrect.map(x => x[0]*SIZE + x[1]));
  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    if (inp.disabled) continue;
    inp.classList.remove('incorrect');
    if (incorrect.has(idx)) {
      inp.classList.add('incorrect');
    }
  }
  if (incorrect.size === 0) {
    stopTimer();
    const timeSeconds = Math.floor((Date.now() - timerStart) / 1000);
    const difficulty = document.getElementById('difficulty').value;
    msg.style.color = '#388e3c';
    msg.innerHTML = `Congratulations! You solved it!\nTime: ${formatTime(timeSeconds)}\nDifficulty: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}\nClick New Game to play again.`;
    msg.style.whiteSpace = 'pre-line';
    const playerName = prompt('Puzzle complete! Enter your name for the leaderboard:');
    if (playerName !== null && playerName.trim() !== '') {
      addLeaderboardRecord(playerName.trim(), timeSeconds, difficulty, hintsUsed);
    }
  } else {
    msg.style.color = '#d32f2f';
    msg.innerText = 'Some cells are incorrect.';
  }
}

async function hintPuzzle() {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const board = [];
  for (let i = 0; i < SIZE; i++) {
    board[i] = [];
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = inputs[idx].value;
      board[i][j] = val ? parseInt(val, 10) : 0;
    }
  }
  const res = await fetch('/hint', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({board})
  });
  const data = await res.json();
  const msg = document.getElementById('message');
  if (data.error) {
    msg.style.color = '#d32f2f';
    msg.innerText = data.error;
    return;
  }
  const idx = data.row * SIZE + data.col;
  const input = document.getElementById('sudoku-board').getElementsByTagName('input')[idx];
  input.value = data.value;
  input.disabled = true;
  input.className = 'sudoku-cell prefilled';
  hintsUsed += 1;
  msg.style.color = '#333';
  msg.innerText = 'Hint revealed one cell.';
}

// Wire buttons
window.addEventListener('load', () => {
  loadTheme();
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('check-solution').addEventListener('click', checkSolution);
  document.getElementById('check-puzzle').addEventListener('click', checkSolution);
  document.getElementById('hint').addEventListener('click', hintPuzzle);
  document.getElementById('difficulty').addEventListener('change', () => {
    newGame();
  });
  renderLeaderboard();
  // initialize
  newGame();
});