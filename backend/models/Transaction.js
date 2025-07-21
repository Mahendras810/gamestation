module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('deposit', 'withdraw', 'bet', 'win', 'refund'),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    walletId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING, // 👈 Add this field
      allowNull: true,
      defaultValue: 'completed' // optional default
    }
  }, {
    timestamps: true
  });

  Transaction.associate = (models) => {
    Transaction.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Transaction.belongsTo(models.Wallet, { foreignKey: 'walletId', as: 'wallet' });
  };

  return Transaction;
};
