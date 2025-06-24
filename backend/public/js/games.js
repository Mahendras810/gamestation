document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    window.location.href = '/';
    return;
  }

  try {
    const response = await fetch('/api/games', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const { success, games } = await response.json();
    
    if (success) {
      renderGames(games);
    } else {
      alert('Failed to load games');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred');
  }
});

function renderGames(games) {
  const container = document.getElementById('gamesContainer');
  
  games.forEach(game => {
    const gameCard = document.createElement('div');
    gameCard.className = 'col-md-4 mb-4';
    gameCard.innerHTML = `
      <div class="card game-card h-100">
        <img src="${game.thumbnail || '/images/default-game.jpg'}" class="card-img-top" alt="${game.name}">
        <div class="card-body">
          <h5 class="card-title">${game.name}</h5>
          <p class="card-text">${game.description || 'Test your skills in this exciting game'}</p>
          <a href="/games/${game.category}/index.html?gameId=${game._id}" class="btn btn-primary">Play Now</a>
        </div>
      </div>
    `;
    container.appendChild(gameCard);
  });
}