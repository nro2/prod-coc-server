const decache = require('decache');
const knex = require('../../db/knex');
const request = require('supertest');

describe('Request routing for /api/reports', () => {
  let app;

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
