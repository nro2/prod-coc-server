const pgp = require('pg-promise')({ noLocking: true });

const config = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: process.env.DATABASE_PORT || 54320,
  database: process.env.DATABASE_NAME || 'coc',
  user: process.env.DATABASE_USER || 'coc',
  password: process.env.DATABASE_PASSWORD || 'pwd123',
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
