const assert = require('assert');
const decache = require('decache');
const knex = require('../../db/knex');
const request = require('supertest');

const data = require('../../db/seeds/development/data');

describe('Request routing for /departments', () => {
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
      .get('/departments')
      .expect(200)
      .then(response => {
        assert.equal(response.body.length, data.department.length);
        done();
      });
  });

  it('GET returns 404 when record does not exist', done => {
    request(app)
      .get('/department-associations/department/10000')
      .expect(404, done);
  });
});
