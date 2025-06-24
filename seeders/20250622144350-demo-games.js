module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('Games', [
      {
        name: 'Premier Cricket',
        description: 'Realistic multiplayer cricket game',
        category: 'cricket',
        minPlayers: 2,
        maxPlayers: 2,
        minBet: 10,
        maxBet: 1000,
        thumbnail: '/images/cricket.jpg',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Poker Championship',
        description: 'Texas Holdem poker with real players',
        category: 'poker',
        minPlayers: 2,
        maxPlayers: 6,
        minBet: 50,
        maxBet: 5000,
        thumbnail: '/images/poker.jpg',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Games', null, {});
  }
};