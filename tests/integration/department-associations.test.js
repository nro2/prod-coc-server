const decache = require('decache');
const knex = require('../../db/knex');
const request = require('supertest');

describe('Request routing for /department-associations', () => {
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

  describe('/department/:id', () => {
    it('GET returns 200 when record exists', done => {
      request(app)
        .get('/department-associations/department/1')
        .expect(200, done);
    });

    it('GET returns 404 when record does not exist', done => {
      request(app)
        .get('/department-associations/department/10000')
        .expect(404, done);
    });
  });

  describe('/faculty/:email', () => {
    it('GET returns 200 when record exists', done => {
      request(app)
        .get('/department-associations/faculty/wolsborn@pdx.edu')
        .expect(200, done);
    });

    it('GET returns 404 when record does not exist', done => {
      request(app)
        .get('/department-associations/faculty/does-not-exist@mail.com')
        .expect(404, done);
    });
  });
});
