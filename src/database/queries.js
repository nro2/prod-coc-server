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
  const connection = loadDatabaseConnection();

  return connection.one(
    'SELECT department_id, name, description FROM department WHERE department_id=$1',
    [id]
  );
}

/**
 *
 * @param email         Email of the faculty member
 * @returns {Promise}   Query response object on success, error on failure
 */
async function getDepartmentAssociationsFaculty(email) {
  const connection = loadDatabaseConnection();

  const result = await connection.any(
    'SELECT email, department_id FROM department_associations WHERE email=$1',
    [email]
  );

  return groupDepartmentIdByFaculty(result);
}

/**
 * Group array of department associations results by email, creating a key-value
 * pair where the value is a list of department IDs.
 *
 * @param arr     The array to group
 * @returns {*}   The object with the user email and list of department IDs
 */
function groupDepartmentIdByFaculty(arr) {
  return arr.reduce((acc, cur) => {
    const exists = acc.email === cur.email;

    if (!exists) {
      return { email: cur.email, department_ids: [cur.department_id] };
    }

    acc['department_ids'].push(cur.department_id);
    return acc;
  }, []);
}

module.exports = {
  addFaculty,
  getCommittees,
  getFaculty,
  getDepartment,
  getDepartments,
  getDepartmentAssociationsFaculty,
};
