const pgp = require('pg-promise')({ noLocking: true });

const config = {
  host: 'localhost',
  port: 54320,
  database: 'coc',
  user: 'coc',
  password: 'pwd123',
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
