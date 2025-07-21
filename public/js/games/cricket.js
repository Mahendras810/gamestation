const socket = io();
const token = localStorage.getItem('token'); // or sessionStorage
const userId = CURRENT_USER_ID || null;

// Join game
socket.emit('JOIN_GAME', {
  gameId: currentGameId,
  token: localStorage.getItem('token')
});

socket.on('BALL_BOWLED', (ballData) => {
  console.log('Bowler:', ballData.bowler);
  console.log('Delivery Type:', ballData.deliveryType);
  console.log('Speed:', ballData.speed);
  console.log('Outcome:', ballData.outcome);
  console.log('Timestamp:', ballData.timestamp);
});