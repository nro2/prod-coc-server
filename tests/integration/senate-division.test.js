const decache = require('decache');
const knex = require('../../db/knex');
const request = require('supertest');

describe('Request routing for /senate-division/:name', () => {
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

  it('GET returns 200 when a record exists', done => {
    request(app)
      .get('/senate-division/AO')
      .expect(200, done);
  });

  it('GET returns 404 when a record does not exist', done => {
    request(app)
      .get('/senate-division/FOOBAR')
      .expect(404, done);
  });
});
