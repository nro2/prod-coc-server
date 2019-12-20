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

describe('Request routing for /committee', () => {
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

  it('POST returns 201 when insertion succeeds', done => {
    const payload = {
      name: 'test-committee-name',
      description: 'test-committee-description',
      totalSlots: 42,
    };

    request(app)
      .post('/committee')
      .send(payload)
      .expect(201, '', done);
  });

  it('PUT returns 200 when update succeeds', done => {
    const payload = {
      committeeId: 1,
      name: 'Linux Committee',
      description: 'tux-everywhere',
      totalSlots: 3,
    };

    request(app)
      .put('/committee')
      .send(payload)
      .expect(200, done);
  });

  it('PUT returns 404 when target record to update does not exist', done => {
    const payload = {
      committeeId: 1000,
      name: 'Linux Committee',
      description: 'tux-everywhere',
      totalSlots: 3,
    };

    request(app)
      .put('/committee')
      .send(payload)
      .expect(404, done);
  });
});
