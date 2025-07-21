const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'gamestation',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Models
db.User = require('../models/User')(sequelize, DataTypes);
db.Wallet = require('../models/Wallet')(sequelize, DataTypes);
db.Transaction = require('../models/Transaction')(sequelize, DataTypes);
db.AviatorGame = require('../games/aviator/AviatorGame')(sequelize, DataTypes);
db.AviatorBet = require('../games/aviator/AviatorBet')(sequelize, DataTypes);


// Setup associations
Object.keys(db).forEach(model => {
  if (db[model].associate) db[model].associate(db);
});

module.exports = db;
