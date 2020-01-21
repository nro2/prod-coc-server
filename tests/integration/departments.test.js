const assert = require('assert');
const decache = require('decache');
const knex = require('../../db/knex');
const request = require('supertest');

const data = require('../../db/seeds/development/data');

describe('Request routing for /api/departments', () => {
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

  it('GET returns 200 and department records', done => {
    request(app)
      .get('/api/departments')
      .expect(200)
      .then(response => {
        assert.equal(response.body.length, data.department.length);
        done();
      });
  });

  it('GET returns 404 when no records exist in the database', async () => {
    await knex.migrate.rollback();
    await knex.migrate.latest().then(() => {
      request(app)
        .get('/api/departments')
        .expect(404);
    });
  });
});
