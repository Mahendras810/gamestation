module.exports = (sequelize, DataTypes) => {
  const Game = sequelize.define('Game', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    minPlayers: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    maxPlayers: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    minBet: {
      type: DataTypes.FLOAT,
      defaultValue: 10
    },
    maxBet: {
      type: DataTypes.FLOAT,
      defaultValue: 1000
    },
    thumbnail: {
      type: DataTypes.STRING
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    timestamps: true
  });

  return Game;
};