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
    .any('SELECT name, committee_id FROM committee')
    .then(data => {
      return data;
    })
    .catch(err => {
      console.log(err.message);
    });
}

/**
 * Adds a faculty member to the database.
 *
 * @param fullName            Name of the faculty member
 * @param email               Email of the faculty member
 * @param jobTitle            Job title of the faculty member
 * @param phoneNum            Phone number of faculty member
 * @param senateDivision      Senate division the faculty member belongs to
 * @returns {Promise}         Query response on success, error on failure
 */
function addFaculty(fullName, email, jobTitle, phoneNum, senateDivision) {
  db = loadDatabaseConnection();

  return db.none(
    'INSERT INTO faculty(full_name, email, job_title, phone_num, senate_division_short_name) values($1, $2, $3, $4, $5)',
    [fullName, email, jobTitle, phoneNum, senateDivision]
  );
}

module.exports = {
  addFaculty,
  getCommittees,
  getFaculty,
  UNIQUENESS_VIOLATION: '23505',
};
