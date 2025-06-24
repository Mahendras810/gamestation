// backend/seeders/initial-games.js
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('Games', [{
      name: 'Cricket Premier',
      description: 'Real-time multiplayer cricket game',
      category: 'cricket',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  }
};