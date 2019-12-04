const pgp = require('pg-promise')({ noLocking: true });

const config = {
  host: 'localhost',
  port: 54320,
  database: 'coc',
  user: 'coc',
  password: 'pwd123',
};

let db;

function loadDatabaseConnection() {
  if (!db) {
    db = pgp(config);
  }

  return db;
}

function getFaculty(firstName) {
  db = loadDatabaseConnection();

  return db
    .one('SELECT * FROM users WHERE first_name=$1', [firstName])
    .then(data => {
      return {
        firstName: data.first_name,
        lastName: data.last_name,
        phoneNum: data.phone_number,
      };
    })
    .catch(err => {
      console.log(err.message);
    });
}

function getCommittees() {
  db = loadDatabaseConnection();

  return db
    .any('SELECT * FROM all_committees')
    .then(data => {
      return data;
    })
    .catch(err => {
      console.log(err.message);
    });
}

function addFaculty(firstName, lastName, phoneNumber) {
  db = loadDatabaseConnection();

  return db
    .none(
      'INSERT INTO users(first_name, last_name, phone_number) values($1, $2, $3)',
      [firstName, lastName, phoneNumber]
    )
    .then(() => {
      return true;
    })
    .catch(err => {
      console.log(err.message);
      return false;
    });
}
module.exports = {
  addFaculty,
  getCommittees,
  getFaculty,
};
