const queries = require('./queries');

module.exports = {
  addFaculty: queries.addFaculty,
  getCommittees: queries.getCommittees,
  getDepartment: queries.getDepartment,
  getDepartments: queries.getDepartments,
  getFaculty: queries.getFaculty,
  UNIQUENESS_VIOLATION: '23505',
};
