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
const variantElements = {};
const listContainer = document.getElementById('openingList');
let variantScores = {};
let lastOrder = [];

// Cargar aperturas
fetch('aperturas.json')
  .then(res => res.json())
  .then(data => {
    openings = data;
    renderOpenings();
  })
  .catch(err => console.error('Error al cargar aperturas:', err));

// Generar lista oculta por defecto
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
      subEl.style.display = 'none';
      listContainer.appendChild(subEl);

      const varEl = document.createElement('div');
      varEl.className = 'variation';
      varEl.textContent = `Movimientos: ${moves.join(', ')}`;
      varEl.dataset.relatedTo = subName;
      varEl.style.display = 'none';
      listContainer.appendChild(varEl);

      variants[subName] = moves;
      variantElements[subName] = { subEl, varEl };
    });
  });
}

// Navegación manual
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

// Modo automático
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

// Selección de subvariante
listContainer.addEventListener('click', (e) => {
  if (e.target.classList.contains('subvariant')) {
    const name = e.target.dataset.variant;
    currentMoves = variants[name];
    currentIndex = 0;
    updateBoard();
  }
});

function updateBoard() {
  chess.reset();
  for (let i = 0; i <= currentIndex; i++) {
    chess.move(currentMoves[i]);
  }
  board.position(chess.fen());
}

// Reinicio total
document.getElementById('resetBtn').addEventListener('click', () => {
  chess.reset();
  board.position('start');
  currentMoves = [];
  currentIndex = 0;
  variantScores = {};
  lastOrder = [];
  renderOpenings();
});

function onSnapEnd() {
  board.position(chess.fen());
}

// 🎯 Lógica de coincidencia + puntuación + visualización
function onDrop(source, target) {
  const move = chess.move({ from: source, to: target, promotion: 'q' });
  if (!move) return;

  const userMoves = chess.history();

  for (const [name, moves] of Object.entries(variants)) {
    const { subEl, varEl } = variantElements[name];

    const match = userMoves.every((m, i) => m === moves[i]);

    // Mostrar si hay coincidencia parcial
    if (match && userMoves.length <= moves.length) {
      subEl.style.display = 'block';
      varEl.style.display = 'block';
    } else {
      subEl.style.display = 'none';
      varEl.style.display = 'none';
    }

    // Si la coincidencia es total, puntuar y reordenar
    if (match && userMoves.length === moves.length) {
      variantScores[name] = (variantScores[name] || 0) + 1;
      sortOpeningsByScore();
      break;
    }
  }
}

// 🧩 Ordenar con animación
function sortOpeningsByScore() {
  const sorted = Object.entries(variants).sort((a, b) => {
    const scoreA = variantScores[a[0]] || 0;
    const scoreB = variantScores[b[0]] || 0;
    return scoreB - scoreA;
  });

  listContainer.innerHTML = '';

  sorted.forEach(([name, moves], index) => {
    const { subEl, varEl } = variantElements[name];

    // Detectar si subió de posición
    const lastIndex = lastOrder.indexOf(name);
    if (lastIndex !== -1 && lastIndex > index) {
      subEl.classList.add('subida');
      setTimeout(() => subEl.classList.remove('subida'), 600);
    }

    // Agregar al DOM
    listContainer.appendChild(subEl);
    listContainer.appendChild(varEl);
  });

  lastOrder = sorted.map(([name]) => name);
}
