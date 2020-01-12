const {
  DATABASE_HOST,
  DATABASE_PORT,
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD,
} = require('../../src/config');
const pgp = require('pg-promise')({ noLocking: true });

const config = {
  host: DATABASE_HOST,
  port: DATABASE_PORT,
  database: DATABASE_NAME,
  user: DATABASE_USER,
  password: DATABASE_PASSWORD,
};

let connection;

function loadDatabaseConnection() {
  if (!connection) {
    connection = pgp(config);
  }

  return connection;
}

module.exports = {
  loadDatabaseConnection,
};
