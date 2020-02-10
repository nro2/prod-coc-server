const decache = require('decache');
const knex = require('../../db/knex');
const request = require('supertest');
const sinon = require('sinon');

/**
 * Suppresses any console logging, so that there is no noise in the console
 * when the integration tests are ran.
 *
 * It is only set on this file because it is the first file to be loaded by
 * the tests, and this setting persists throughout.
 */
function suppressLogging() {
  sinon.stub(console, 'error');
  sinon.stub(console, 'info');
  sinon.stub(console, 'log');
}

describe('Request routing for /api/reports', () => {
  let app;
  suppressLogging();

  beforeEach(async () => {
    decache('../../src');
    app = require('../../src');

    await knex.migrate.rollback();
    await knex.migrate.latest();
    await knex.seed.run();
  });

  afterEach(done => {
    knex.migrate.rollback().then(() => {
      app.close(done);
    });
  });

  it('GET returns 200 when record exists', done => {
    request(app)
      .get('/api/reports')
      .expect(200, done);
  });
});
