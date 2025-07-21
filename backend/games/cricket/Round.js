const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Round = sequelize.define('Round', {
  roundId: { type: DataTypes.INTEGER, unique: true },
  seed: DataTypes.STRING,
  cipher: DataTypes.STRING,
  result: DataTypes.FLOAT,
  crashPoint: DataTypes.FLOAT,
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

module.exports = Round;
