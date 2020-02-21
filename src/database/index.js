const queries = require('./queries');

module.exports = {
  ...queries,
  FOREIGN_KEY_VIOLATION: '23503',
  UNIQUENESS_VIOLATION: '23505',
  COMMITTEE_SLOT_VIOLATION_UNMET_REQUIREMENTS: 'CSV01',
  COMMITTEE_SLOT_VIOLATION_NO_SLOTS_REMAINING: 'CSV02',
  TOTAL_COMMITTEE_SLOT_VIOLATION: 'CSV03',
  CHECK_VIOLATION: '23514',
  messageResponses: {
    400: 'Bad Request',
    200: 'Success',
    201: 'Success',
    500: 'Internal Server Error',
    404: 'Resource Not Found',
    409: 'Conflict',
  },
};
