module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM(
        'deposit', 
        'withdrawal', 
        'bet', 
        'win', 
        'bonus', 
        'refund'
      ),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'completed',
        'failed',
        'cancelled'
      ),
      defaultValue: 'pending'
    },
    reference: {
      type: DataTypes.STRING,
      unique: true
    },
    metadata: {
      type: DataTypes.JSON
    }
  }, {
    timestamps: true,
    indexes: [
      {
        fields: ['reference']
      },
      {
        fields: ['walletId']
      }
    ]
  });

  Transaction.associate = (models) => {
    Transaction.belongsTo(models.Wallet, {
      foreignKey: 'walletId',
      as: 'wallet'
    });
    
    Transaction.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    
    Transaction.belongsTo(models.Game, {
      foreignKey: 'gameId',
      as: 'game',
      optional: true
    });
  };

  return Transaction;
};