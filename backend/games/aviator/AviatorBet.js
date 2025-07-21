module.exports = (sequelize, DataTypes) => {
  const AviatorBet = sequelize.define('AviatorBet', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    gameId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    cashoutMultiplier: {
      type: DataTypes.FLOAT,
      allowNull: true
    }
  });

  AviatorBet.associate = function (models) {
    AviatorBet.belongsTo(models.AviatorGame, { foreignKey: 'gameId', as: 'game' });
    AviatorBet.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return AviatorBet;
};
