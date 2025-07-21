module.exports = (sequelize, DataTypes) => {
  const Wallet = sequelize.define('Wallet', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0
    }
  }, {
    timestamps: true
  });

  Wallet.associate = (models) => {
    Wallet.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });

    // ✅ Add this line
    Wallet.hasMany(models.Transaction, { foreignKey: 'walletId', as: 'transactions' });
  };

  return Wallet;
};
