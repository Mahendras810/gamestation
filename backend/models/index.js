const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const db = {};

// Automatically import all models
const modelFiles = ['User', 'Game', 'Wallet', 'Transaction'];

modelFiles.forEach(modelFile => {
  const model = require(path.join(__dirname, modelFile))(sequelize, DataTypes);
  db[model.name] = model;
});

// Set up associations if any
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;