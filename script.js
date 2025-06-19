const board = Chessboard('board2', {
  draggable: false,
  position: 'start',
});

const chess = new Chess();

const variants = {
  'Giuoco Piano': ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5'],
  'Evans Gambit': ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'b4'],
  'Two Knights Defense': ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6'],
};

let currentMoves = [];
let currentIndex = 0;
let interval = null;

function updateBoard() {
  chess.reset();
  for (let i = 0; i <= currentIndex; i++) {
    chess.move(currentMoves[i]);
  }
  board.position(chess.fen());
}

document.querySelectorAll('.variant').forEach((btn) => {
  btn.addEventListener('click', () => {
    const name = btn.getAttribute('data-variant');
    currentMoves = variants[name];
    currentIndex = 0;
    updateBoard();
  });
});

document.getElementById('nextBtn').addEventListener('click', () => {
  if (currentIndex < currentMoves.length - 1) {
    currentIndex++;
    updateBoard();
  }
});

document.getElementById('prevBtn').addEventListener('click', () => {
  if (currentIndex > 0) {
    currentIndex--;
    updateBoard();
  }
});

document.getElementById('autoBtn').addEventListener('click', () => {
  const btn = document.getElementById('autoBtn');
  if (interval) {
    clearInterval(interval);
    interval = null;
    btn.textContent = 'Modo Automático';
  } else {
    interval = setInterval(() => {
      if (currentIndex < currentMoves.length - 1) {
        currentIndex++;
        updateBoard();
      } else {
        clearInterval(interval);
        interval = null;
        btn.textContent = 'Modo Automático';
      }
    }, 800);
    btn.textContent = 'Detener';
  }
});
