const { loadDatabaseConnection } = require('./connection');

/**
 * Adds a committee to the database.
 *
 * @param name                Name of the committee (Required)
 * @param description         Description of the committee
 * @param slots               Number of total available slots
 * @returns {Promise}         Query response on success, error on failure
 */
async function addCommittee(name, description, slots) {
  const connection = loadDatabaseConnection();

  return connection.none(
    'INSERT INTO committee(name, description, total_slots) values($1, $2, $3)',
    [name, description, slots]
  );
}

/**
 * Adds committee slots to the database.
 *
 * @param committeeId         Committee id to add slots to
 * @param senateDivision      The senate division
 * @param slotRequirements    The number of slots this committee has
 * @returns {Promise}         Query response on success, error on failure
 */
async function addCommitteeSlots(committeeId, senateDivision, slotRequirements) {
  const connection = loadDatabaseConnection();

  return connection.none(
    'INSERT INTO committee_slots(committee_id, senate_division_short_name, slot_requirements) values($1, $2, $3)',
    [committeeId, senateDivision, slotRequirements]
  );
}

/**
 * Adds a committee assignment to the database.
 *
 * @param email               Email of committee member
 * @param committeeId         Id of the committee
 * @param startDate           Start date for the committee member
 * @param endDate             End date for the committee member
 * @returns {Promise}         Query response on success, error on failure
 */
async function addCommitteeAssignment(email, committeeId, startDate, endDate) {
  const connection = loadDatabaseConnection();

  return connection.none(
    'INSERT INTO committee_assignment(email, committee_id, start_date, end_date) values($1, $2, $3, $4)',
    [email, committeeId, startDate, endDate]
  );
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
async function addFaculty(fullName, email, jobTitle, phoneNum, senateDivision) {
  const connection = loadDatabaseConnection();

  return connection.none(
    'INSERT INTO faculty(full_name, email, job_title, phone_num, senate_division_short_name) values($1, $2, $3, $4, $5)',
    [fullName, email, jobTitle, phoneNum, senateDivision]
  );
}

/**
 * Adds a survey choice to the database.
 *
 * @param choiceId      Choice id
 * @param surveyDate    Date of the survey
 * @param email         Email of the faculty member
 * @param committeeId   Committee id
 * @returns {Promise}   Query response on success, error on failure
 */
async function addSurveyChoice(choiceId, surveyDate, email, committeeId) {
  const connection = loadDatabaseConnection();

  return connection.none(
    'INSERT INTO survey_choice(choice_id, survey_date, email, committee_id) values($1, $2, $3, $4)',
    [choiceId, surveyDate, email, committeeId]
  );
}

/**
 * Adds a survey choice to the database.
 *
 * @param surveyDate    Date of the survey
 * @param email         Email of the faculty member
 * @param interested    Bool if the are interested in serving
 * @param expertise     Description of expertise
 * @returns {Promise}   Query response on success, error on failure
 */

async function addSurveyData(surveyDate, email, interested, expertise) {
  const connection = loadDatabaseConnection();

  return connection.none(
    'INSERT INTO survey_data(survey_date, email, is_interested, expertise) values($1, $2, $3, $4)',
    [surveyDate, email, interested, expertise]
  );
}

/**
 * Gets department records.
 *
 * @returns {Promise} Query response object on success, error on failure
 */
async function getDepartments() {
  const connection = loadDatabaseConnection();

  return connection.any('SELECT department_id, name, description FROM department');
}

/**
 * Gets committee assignment records by their committee id.
 *
 * @param id          Committee id
 * @returns {Promise} Query response object on success, error on failure
 */
async function getCommitteeAssignmentByCommittee(id) {
  const connection = loadDatabaseConnection();

  return connection.any(
    'SELECT email, committee_id, start_date, end_date FROM committee_assignment WHERE committee_id=$1',
    [id]
  );
}

/**
 * Gets committee assignment records by their faculty email.
 *
 * @param email       Faculty email
 * @returns {Promise} Query response object on success, error on failure
 */
async function getCommitteeAssignmentByFaculty(email) {
  const connection = loadDatabaseConnection();

  return connection.any(
    'SELECT email, committee_id, start_date, end_date FROM committee_assignment WHERE email=$1',
    [email]
  );
}

/**
 * Gets committee slot records by their id.
 *
 * @param id          Committee id
 * @returns {Promise} Query response object on success, error on failure
 */
async function getCommitteeSlotsByCommittee(id) {
  const connection = loadDatabaseConnection();

  return connection.any(
    'SELECT senate_division_short_name, slot_requirements FROM committee_slots where committee_id=$1',
    [id]
  );
}

/**
 * Gets committee slot records by their senate division.
 *
 * @param senateDivision  Committee senate division
 * @returns {Promise}     Query response object on success, error on failure
 */
async function getCommitteeSlotsBySenate(senateDivision) {
  const connection = loadDatabaseConnection();

  return connection.any(
    'SELECT committee_id, slot_requirements FROM committee_slots where senate_division_short_name=$1',
    [senateDivision]
  );
}

/**
 * Gets committee records.
 *
 * @returns {Promise} Query response object on success, error on failure
 */
async function getCommittees() {
  const connection = loadDatabaseConnection();

  return connection.any('SELECT name, committee_id FROM committee');
}

/**
 * Gets department record by its id.
 *
 * @param id          Department id
 * @returns {Promise} Query response object on success, error on failure
 */
async function getDepartment(id) {
  const connection = loadDatabaseConnection();

  return connection.one(
    'SELECT department_id, name, description FROM department WHERE department_id=$1',
    [id]
  );
}

/**
 * Gets department association records by department id.
 *
 * @param id            Department id
 * @returns {Promise}   Query response object on success, error on failure
 */
async function getDepartmentAssociationsByDepartment(id) {
  const connection = loadDatabaseConnection();

  const result = await connection.any(
    'SELECT email, department_id FROM department_associations WHERE department_id=$1',
    [id]
  );

  return groupDepartmentFacultyById(result);
}

/**
 * Group array of department associations results by id, creating a key-value
 * pair where the value is a list of faculty emails.
 *
 * @param arr     The array to group
 * @returns {*}   The object with the department id and list of user emails
 */
function groupDepartmentFacultyById(arr) {
  return arr.reduce((acc, cur) => {
    const exists = acc.department_id === cur.department_id;

    if (!exists) {
      return { department_id: cur.department_id, emails: [cur.email] };
    }

    acc.emails.push(cur.email);
    return acc;
  }, []);
}

/**
 *
 * @param email         Email of the faculty member
 * @returns {Promise}   Query response object on success, error on failure
 */
async function getDepartmentAssociationsByFaculty(email) {
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

/**
 * Gets faculty record by its first name.
 *
 * @param firstName   Faculty first name
 * @returns {Promise} Query response on success, error on failure
 */
async function getFaculty(firstName) {
  const connection = loadDatabaseConnection();

  return connection.one('SELECT * FROM users WHERE first_name=$1', [firstName]);
}

/**
 * Gets all the senate divisions.
 *
 * @returns {Promise}   Query response object on success, error on failure
 */
async function getSenateDivisions() {
  const connection = loadDatabaseConnection();

  return connection.any(
    'SELECT senate_division_short_name, name FROM senate_division'
  );
}

/**
 * Gets a senate division record by its short name.
 *
 * @param shortName   Short name of the senate division
 * @returns {Promise} Query response on success, error on failure
 */
async function getSenateDivision(shortName) {
  const connection = loadDatabaseConnection();

  return connection.one(
    'SELECT senate_division_short_name, name FROM senate_division WHERE senate_division_short_name=$1',
    [shortName]
  );
}

/**
 * Gets a list of survey choices by their date and email.
 *
 * @param date        Date of the survey choice
 * @param email       Email of the faculty member
 * @returns {Promise} Query response on success, error on failure
 */
async function getSurveyChoice(date, email) {
  const connection = loadDatabaseConnection();

  return connection.many(
    'SELECT choice_id, survey_date, email, committee_id FROM survey_choice WHERE EXTRACT(year FROM survey_date) = $1 and email = $2',
    [date, email]
  );
}

/**
 * Updates a committee in the database.
 *
 * Allows for a committee's properties to be changed, except a committee's name.
 *
 * @param id                  Id of the committee (Required)
 * @param name                Name of the committee (Required)
 * @param description         Description of the committee
 * @param slots               Number of total available slots
 * @returns {Promise}         Response object with rowCount on success
 * @throws {Error}            Connection problem or exception
 */
async function updateCommittee(id, name, description, slots) {
  const connection = loadDatabaseConnection();

  return connection.tx(() => {
    return connection.result(
      'UPDATE committee SET name = $1, description = $2, total_slots = $3 WHERE committee_id = $4',
      [name, description, slots, id]
    );
  });
}

/**
 * Updates a committee assignment in the database.
 *
 * @param email               Email of committee member
 * @param committeeId         Id of the committee
 * @param startDate           Start date for the committee member
 * @param endDate             End date for the committee member
 * @returns {Promise}         Response object with rowCount on success
 * @throws {Error}            Connection problem or exception
 */
async function updateCommitteeAssignment(email, committeeId, startDate, endDate) {
  const connection = loadDatabaseConnection();

  return connection.tx(() => {
    return connection.result(
      'UPDATE committee_assignment SET start_date = $1, end_date = $2 WHERE email = $3 and committee_id = $4',
      [startDate, endDate, email, committeeId]
    );
  });
}

/**
 * Updates survey data in the database
 *
 * @param surveyDate    Date of Survey
 * @param email         Email of faculty member
 * @param interested    Interested in serving
 * @param expertise     Expertise for serving
 * @returns {Promise}   Response object with rowCount on success
 * @throws  {Error}     Connection problem or exception
 */
async function updateSurveyData(surveyDate, email, interested, expertise) {
  const connection = loadDatabaseConnection();

  return connection.tx(() => {
    return connection.result(
      'UPDATE survey_data SET is_interested = $3, expertise = $4 WHERE survey_date = $1 AND email = $2',
      [surveyDate, email, interested, expertise]
    );
  });
}

/**
 * Updates committee slots in the database.
 *
 * @param committeeId         Committee id to add slots to
 * @param senateDivision      The senate division
 * @param slotRequirements    The number of slots this committee has
 * @returns {Promise}         Response object with rowCount on success
 * @throws {Error}            Connection problem or exception
 */
async function updateCommitteeSlots(committeeId, senateDivision, slotRequirements) {
  const connection = loadDatabaseConnection();

  return connection.tx(() => {
    return connection.result(
      'UPDATE committee_slots SET slot_requirements = $1 WHERE committee_id = $2 and senate_division_short_name = $3',
      [slotRequirements, committeeId, senateDivision]
    );
  });
}

/**
 * Updates a faculty member in the database.
 *
 * @param fullName            Name of the faculty member
 * @param email               Email of the faculty member
 * @param jobTitle            Job title of the faculty member
 * @param phoneNum            Phone number of faculty member
 * @param senateDivision      Senate division the faculty member belongs to
 * @returns {Promise}         Resolves object with rowCount or rejects
 */
async function updateFaculty(fullName, email, jobTitle, phoneNum, senateDivision) {
  const connection = loadDatabaseConnection();

  return connection.tx(() => {
    return connection.result(
      'UPDATE faculty SET full_name = $1, job_title = $2, phone_num = $3, senate_division_short_name = $4 WHERE email = $5',
      [fullName, jobTitle, phoneNum, senateDivision, email]
    );
  });
}

module.exports = {
  addCommittee,
  addCommitteeAssignment,
  addCommitteeSlots,
  addFaculty,
  addSurveyChoice,
  addSurveyData,
  getCommitteeAssignmentByCommittee,
  getCommitteeAssignmentByFaculty,
  getCommitteeSlotsBySenate,
  getCommitteeSlotsByCommittee,
  getCommittees,
  getDepartment,
  getDepartments,
  getDepartmentAssociationsByDepartment,
  getDepartmentAssociationsByFaculty,
  getFaculty,
  getSenateDivisions,
  getSenateDivision,
  getSurveyChoice,
  updateCommittee,
  updateCommitteeAssignment,
  updateCommitteeSlots,
  updateFaculty,
  updateSurveyData,
};
