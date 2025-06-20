const chess = new Chess();

const board = Chessboard('board2', {
  draggable: true,
  position: 'start',
  onDrop: onDrop,
  onSnapEnd: onSnapEnd,
});

let openings = {};
let currentMoves = [];
let currentIndex = 0;
let interval = null;
const variants = {};
const listContainer = document.getElementById('openingList');

// 📥 Cargar aperturas desde archivo JSON
fetch('aperturas.json')
  .then(response => response.json())
  .then(data => {
    openings = data;
    renderOpenings();
  })
  .catch(error => {
    console.error('Error al cargar aperturas:', error);
  });

// 📋 Generar lista de aperturas dinámicamente
function renderOpenings() {
  listContainer.innerHTML = '';

  Object.entries(openings).forEach(([openingName, subvars]) => {
    const openingEl = document.createElement('div');
    openingEl.className = 'opening';
    openingEl.textContent = openingName;
    listContainer.appendChild(openingEl);

    Object.entries(subvars).forEach(([subName, moves]) => {
      const subEl = document.createElement('div');
      subEl.className = 'subvariant';
      subEl.textContent = subName;
      subEl.dataset.variant = subName;
      listContainer.appendChild(subEl);

      const varEl = document.createElement('div');
      varEl.className = 'variation';
      varEl.textContent = `Movimientos: ${moves.join(', ')}`;
      listContainer.appendChild(varEl);

      variants[subName] = moves;
    });
  });
}

// 🎯 Navegación manual
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

// 🔁 Modo automático
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

// 🧩 Selección de subvariante
listContainer.addEventListener('click', (e) => {
  if (e.target.classList.contains('subvariant')) {
    const name = e.target.dataset.variant;
    currentMoves = variants[name];
    currentIndex = 0;
    updateBoard();
  }
});

function onDrop(source, target) {
  chess.move({ from: source, to: target, promotion: 'q' });
}

function onSnapEnd() {
  board.position(chess.fen());
}

function updateBoard() {
  chess.reset();
  for (let i = 0; i <= currentIndex; i++) {
    chess.move(currentMoves[i]);
  }
  board.position(chess.fen());
}
