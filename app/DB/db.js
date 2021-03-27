const mysql = require('promise-mysql');
const users = require('./users');
const funds = require('./funds');
const trading_pool = require('./trading_pool');

// Connect to the DB and get the Pool of it to perform querys
function connection(database) {
  const db_config = {
    host: database.Host,
    user: database.User,
    password: database.Password,
    database: database.DatabaseName,
    connectionLimit: 100,
  };

  return mysql.createPool(db_config);
}

module.exports = {
  connection,
  users,
  funds,
  trading_pool,
};
