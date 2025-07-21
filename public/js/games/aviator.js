const socket = io({ reconnection: true });
const token = localStorage.getItem('token');

// DOM refs
const multiplierEl = document.getElementById('multiplier');
const countdownEl = document.getElementById('countdown');
const walletEl = document.querySelector('.wallet');
const planeEl = document.getElementById('plane'); // ensure you have an element with id="plane"
const bg = document.getElementById('game-container'); // assuming bg is the #game-container div

// Alerts
function showAlert(message, isSuccess = true) {
  const div = document.createElement('div');
  div.textContent = message;
  div.style.position = 'fixed';
  div.style.top = '10px';
  div.style.right = '10px';
  div.style.zIndex = 9999;
  div.style.padding = '10px 20px';
  div.style.borderRadius = '5px';
  div.style.color = '#fff';
  div.style.backgroundColor = isSuccess ? 'green' : 'red';
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

// Rejoin round on reconnect
socket.on('connect', () => {
  console.log('🔌 Connected to server');
  if (CURRENT_USER_ID && token) {
    socket.emit('joinAviatorGame', {
      userId: CURRENT_USER_ID,
      gameId: CURRENT_GAME_ID,
      token
    });
  }
});

// BET button handler
function placeBet() {
  const amount = parseFloat(betAmountInput.value);
  if (isNaN(amount) || amount < 10 || amount > 10000) {
    showAlert('Bet must be between ₹10 and ₹10000', false);
    return;
  }

  if (IS_LOGGED_IN === "false" || !CURRENT_USER_ID) {
    showAlert('Please log in to place a bet.', false);
    return;
  }

  socket.emit('placeAviatorBet', {
    userId: CURRENT_USER_ID,
    amount,
    gameId: CURRENT_GAME_ID,
    token
  });
}

// Cashout button
function cashout(multiplier = 1.5) {
  if (!token || !CURRENT_USER_ID) {
    showAlert('Login required to cashout', false);
    return;
  }
  socket.emit('cashoutAviator', { userId: CURRENT_USER_ID, gameId: CURRENT_GAME_ID, multiplier, token });
}

// Event: Error
socket.on('aviator:error', (data) => {
  showAlert(data.message, false);
});

// Event: Cashout
socket.on('aviator:cashoutSuccess', (data) => {
  showAlert(`Cashout success! ₹${data.amount.toFixed(2)}`);
  updateWallet(data.newBalance);
});

// Event: Countdown
socket.on('aviator:countdown', (data) => {
  document.getElementById('roundId').innerText = data.id;
  document.getElementById('roundSeed').innerText = data.seed;
  document.getElementById('roundCipher').innerText = data.cipher;

  let count = data.countdown;
  countdownEl.style.display = 'block';
  countdownEl.textContent = count;

  const interval = setInterval(() => {
    count--;
    countdownEl.textContent = count;
    if (count <= 0) {
      clearInterval(interval);
      countdownEl.style.display = 'none';
    }
  }, 1000);
});

// Event: Start Game
socket.on('aviator:startGame', (data) => {
  const crashPoint = data.crashPoint;

  if (window.phaserGame && window.phaserGame.scene.keys['GameScene']) {
    const scene = window.phaserGame.scene.keys['GameScene'];
    scene.isCrashed = false;
    scene.isFlying = false;
    scene.crashPoint = crashPoint;
    scene.multiplier = 1.00;
    scene.plane.setAlpha(1);
    scene.plane.setVisible(true);
    scene.plane.x = 100;
    scene.plane.y = scene.sys.canvas.height - 150;
    scene.multiplierText.setText('1.00x');

    // Restart countdown + logo
    scene.count = 10;
    scene.logo.setVisible(true);
  }
});



// Update wallet UI
function updateWallet(balance) {
  const walletEl = document.getElementById('walletDisplay');
  if (walletEl) {
    walletEl.textContent = `₹${parseFloat(balance).toFixed(2)} INR`;
  }
}

// Phaser Game Scene (no change in logic, only scaled down)
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    this.load.image('plane', '/images/plane.png');
    this.load.image('bg', '/images/bg.png'); // background image
    this.load.image('logo', '/images/logo.png'); // logo before start
    this.load.image('sky', '/images/sky.png');
    this.load.image('clouds', '/images/clouds.png');

  }

  create() {

    this.sky = this.add.image(0, 0, 'sky').setOrigin(0, 0).setDisplaySize(this.sys.canvas.width, this.sys.canvas.height);

    this.clouds = this.add.tileSprite(0, 0, this.sys.canvas.width, this.sys.canvas.height, 'clouds')
      .setOrigin(0, 0)
      .setScrollFactor(0);

    // Background scrolling
    this.bg = this.add.tileSprite(0, 0, this.sys.canvas.width * 2, this.sys.canvas.height, 'bg')
      .setOrigin(0, 0);

    // Plane setup
    this.plane = this.add.image(100, this.sys.canvas.height - 150, 'plane')
      .setScale(0.1)
      .setOrigin(0.5);

    // Multiplier text
    this.multiplier = 1.00;
    this.multiplierText = this.add.text(this.sys.canvas.width / 2, 100, '1.00x', {
      fontSize: '64px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Logo
    this.logo = this.add.image(this.sys.canvas.width / 2, this.sys.canvas.height / 2, 'logo')
      .setOrigin(0.5)
      .setScale(0.5);
    this.logo.setVisible(false);

    this.isCrashed = false;
    this.isFlying = false;

    this.time.addEvent({
      delay: 1000,
      repeat: 10,
      callback: this.showCountdown,
      callbackScope: this
    });

    this.count = 10;
    this.countdownText = this.add.text(this.sys.canvas.width / 2, this.sys.canvas.height / 2 + 100, '', {
      fontSize: '48px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  showCountdown() {
    if (this.count > 0) {
      this.logo.setVisible(true);
      this.countdownText.setText(`Starting in ${this.count--}...`);
    } else {
      this.logo.setVisible(false);
      this.countdownText.setText('');
      this.isFlying = true;
      this.tweens.add({
      targets: this.plane,
      x: this.sys.canvas.width / 2,
      y: this.sys.canvas.height / 2,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => {
        this.isFlying = true;
        this.hasReachedCenter = true;
      }
    });

    }
  }

  update() {
    if (!this.isFlying || this.isCrashed) return;

    if (this.hasReachedCenter) {
      this.bg.tilePositionX += 2;       // ✅ Background scrolls
      this.clouds.tilePositionX += 0.5; // ✅ Clouds move too
    }

    // Multiplier updates always
    this.multiplier += 0.01;
    this.multiplierText.setText(`${this.multiplier.toFixed(2)}x`);

    if (this.crashPoint && this.multiplier >= this.crashPoint) {
      this.crashPlane(this.crashPoint);
    }


    // Move clouds for parallax effect
    this.clouds.tilePositionX += 0.5;


    // CRASH CHECK
    if (this.crashPoint && this.multiplier >= this.crashPoint) {
      this.crashPlane(this.crashPoint);
    }
  }

  crashPlane(crashPoint) {
    this.isCrashed = true;
    this.multiplierText.setText(`💥 ${crashPoint.toFixed(2)}x CRASHED!`);

    const explosion = this.add.image(this.plane.x, this.plane.y, 'explosion')
      .setScale(0.5)
      .setOrigin(0.5);

    this.tweens.add({
      targets: this.plane,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        this.plane.setVisible(false);
      }
    });

    this.time.delayedCall(1000, () => {
      explosion.destroy(); // remove explosion after 1s
    });
  }
}

window.GameScene = GameScene;
