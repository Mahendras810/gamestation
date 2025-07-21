module.exports = (sequelize, DataTypes) => {
  const AviatorGame = sequelize.define('AviatorGame', {
    multiplier: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    crashAt: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });

  AviatorGame.associate = function (models) {
    AviatorGame.hasMany(models.AviatorBet, { foreignKey: 'gameId', as: 'bets' });
  };

  return AviatorGame;
};
