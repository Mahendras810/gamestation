document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  // Load wallet balance
  await loadWalletBalance();
  
  // Load games list
  await loadGamesList();
  
  // Logout button
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
  });
});

async function loadWalletBalance() {
  try {
    const response = await fetch('/api/wallet', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      document.getElementById('walletBalance').textContent = `₹${data.balance.toFixed(2)}`;
    }
  } catch (error) {
    console.error('Failed to load wallet:', error);
  }
}

async function loadGamesList() {
  try {
    const response = await fetch('/api/games', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const { success, games } = await response.json();
    
    if (success) {
      const gamesList = document.getElementById('gamesList');
      gamesList.innerHTML = games.map(game => `
        <div class="col-md-4 mb-4">
          <div class="card game-card h-100">
            <img src="${game.thumbnail || '/images/default-game.jpg'}" class="card-img-top" alt="${game.name}">
            <div class="card-body">
              <h5 class="card-title">${game.name}</h5>
              <a href="/games/${game.category}/index.html?gameId=${game._id}" class="btn btn-primary">Play Now</a>
            </div>
          </div>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Failed to load games:', error);
  }
}