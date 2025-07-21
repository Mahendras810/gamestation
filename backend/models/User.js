module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      // unique: true,
      validate: {
        len: [3, 30],
        notContains: ' ',
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 100],
        notEmpty: true
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'suspended', 'banned'),
      defaultValue: 'active'
    }
  }, {
    timestamps: true,
    paranoid: true, // Enable soft deletion
    defaultScope: {
      attributes: { exclude: ['password'] }
    }
  });

  // Associations
  User.associate = (models) => {
    // ✅ Check if models.Wallet is passed correctly
    if (models.Wallet) {
      User.hasOne(models.Wallet, {
        foreignKey: 'userId',
        as: 'wallet'
      });
    }

    if (models.Transaction) {
      User.hasMany(models.Transaction, {
        foreignKey: 'userId',
        as: 'transactions'
      });
    }
  };


  // Password hashing
  User.beforeSave(async (user) => {
    if (user.changed('password')) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  });

  // Instance method for password verification
  User.prototype.verifyPassword = function(password) {
    const bcrypt = require('bcryptjs');
    return bcrypt.compare(password, this.password);
  };

  return User;
};