const decache = require('decache');
const knex = require('../../db/knex');
const request = require('supertest');

describe('Request routing for /senate-divisions', () => {
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

  it('GET returns 200 when a records exist', done => {
    request(app)
      .get('/senate-divisions')
      .expect(200, done);
  });

  it('GET returns 404 when no records exists', async () => {
    await knex.migrate.rollback();
    await knex.migrate.latest();

    await request(app)
      .get('/senate-divisions')
      .expect(404);
  });
});
