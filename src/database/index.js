const queries = require('./queries');

module.exports = {
  ...queries,
  FOREIGN_KEY_VIOLATION: '23503',
  UNIQUENESS_VIOLATION: '23505',
};
