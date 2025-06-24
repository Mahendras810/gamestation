const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const urlParams = new URLSearchParams(window.location.search);
const gameId = urlParams.get('gameId');

// Game state
const gameState = {
  score: 0,
  wickets: 0,
  balls: 0,
  isBatting: false,
  currentBet: 0
};

// Initialize game
function init() {
  // Check authentication
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  // Connect to game room
  const urlParams = new URLSearchParams(window.location.search);
  const gameId = urlParams.get('gameId');
  socket.emit('joinGame', { gameId, token });

  // Setup event listeners
  setupEventListeners();
  
  // Start game loop
  gameLoop();
}

// Event listeners
function setupEventListeners() {
  // Bowl button
  document.getElementById('bowlBtn').addEventListener('click', () => {
    const deliveryType = document.getElementById('deliveryType').value;
    socket.emit('bowl', { deliveryType });
  });

  // Shot buttons
  document.querySelectorAll('.shot-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      if (!gameState.isBatting) return;
      const shotType = this.dataset.shot;
      socket.emit('playShot', { shotType });
      gameState.isBatting = false;
      document.getElementById('battingControls').style.display = 'none';
    });
  });
}

// Game loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw pitch
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(350, 200, 100, 200);
  
  // Update score display
  document.getElementById('scoreDisplay').textContent = 
    `Score: ${gameState.score} | Wickets: ${gameState.wickets} | Balls: ${gameState.balls}`;
  
  requestAnimationFrame(gameLoop);
}

// Socket event handlers
socket.on('gameUpdate', (data) => {
  gameState.score = data.score;
  gameState.wickets = data.wickets;
  gameState.balls = data.balls;
});

socket.on('yourTurnToBat', () => {
  gameState.isBatting = true;
  document.getElementById('battingControls').style.display = 'block';
});

socket.on('ballResult', (result) => {
  alert(`Result: ${result}`);
});

// Start the game
init();