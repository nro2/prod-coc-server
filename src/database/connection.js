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

const QueryFile = pgp.QueryFile;
const path = require('path');

function sql(file) {
  const fullPath = path.join(__dirname, file);
  return new QueryFile(fullPath, { minify: true });
}

module.exports = {
  loadDatabaseConnection,
  committee: {
    info: sql('sql/committee/getCommitteeInfo.sql'),
  },
  allCommittee: {
    info: sql('sql/committee/getAllCommitteeInfo.sql'),
  },
  faculty: {
    info: sql('sql/faculty/getFacultyInfo.sql'),
  },
  reports: {
    divisionStats: sql('sql/reports/senateDivisionStats.sql'),
  },
};
