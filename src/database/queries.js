const { loadDatabaseConnection } = require('./connection');

function getFaculty(firstName) {
  const connection = loadDatabaseConnection();

  return connection
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

function getDepartments() {
  const connection = loadDatabaseConnection();

  return connection
    .any('SELECT department_id, name, description FROM department')
    .then(data => {
      return data;
    })
    .catch(err => {
      console.log(err.message);
    });
}

function getCommittees() {
  const connection = loadDatabaseConnection();

  return connection
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
  const connection = loadDatabaseConnection();

  return connection.none(
    'INSERT INTO faculty(full_name, email, job_title, phone_num, senate_division_short_name) values($1, $2, $3, $4, $5)',
    [fullName, email, jobTitle, phoneNum, senateDivision]
  );
}

function getDepartment(id) {
  const db = loadDatabaseConnection();

  return db.one(
    'SELECT department_id, name, description FROM department WHERE department_id=$1',
    [id]
  );
}

module.exports = {
  addFaculty,
  getCommittees,
  getFaculty,
  getDepartment,
  getDepartments,
};
