const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Sequelize instance बनाएं
const sequelize = new Sequelize(
  process.env.DB_NAME || 'gamestation',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Connection test
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('MySQL connection established successfully');
  } catch (error) {
    console.error('Unable to connect to MySQL:', error);
    process.exit(1);
  }
}

module.exports = {
  sequelize,
  testConnection
};