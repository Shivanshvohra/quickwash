// my credentials
require('dotenv').config();

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE, process.env.USER, process.env.PASSWORD, {
  host: process.env.HOST,
  dialect: 'mysql',
});

module.exports = sequelize;

//server credentials
// const path = require('path');
// require('dotenv').config({
//   path: path.resolve(__dirname, '../../.env')
// });
// const { Sequelize } = require('sequelize');

// const sequelize = new Sequelize(
//   process.env.DB_NAME,
//   process.env.DB_USER,
//   process.env.DB_PASSWORD,
//   {
//     host: '127.0.0.1', // IMPORTANT
//     dialect: 'mysql',
//     port: 3307,
//     logging: false
//   }
// );

// module.exports = sequelize;