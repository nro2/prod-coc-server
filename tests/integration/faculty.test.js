const decache = require('decache');
const knex = require('../../db/knex');
const request = require('supertest');

describe('Request routing for /faculty', () => {
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

  it('POST returns 201 when insertion succeeds', done => {
    const payload = {
      fullName: 'test-full-name',
      email: 'test-email',
      jobTitle: 'test-job-title',
      phoneNum: '555-55-5555',
      senateDivision: 'AO',
    };

    request(app)
      .post('/faculty')
      .send(payload)
      .expect(201, done);
  });

  it('POST returns 409 when the payload email violates foreign key constraint', done => {
    const payload = {
      fullName: 'test-full-name',
      email: 'test-email',
      jobTitle: 'test-job-title',
      phoneNum: '555-55-5555',
      senateDivision: 'test-senate-division-does-not-exist',
    };

    request(app)
      .post('/faculty')
      .send(payload)
      .expect(409, done);
  });

  it('POST returns 409 when the record already exists', done => {
    const payload = {
      fullName: 'test-full-name',
      email: 'test-email',
      jobTitle: 'test-job-title',
      phoneNum: '555-55-5555',
      senateDivision: 'AO',
    };

    request(app)
      .post('/faculty')
      .send(payload)
      .expect(201)
      .then(() => {
        request(app)
          .post('/faculty')
          .send(payload)
          .expect(409, done);
      });
  });

  it('PUT returns 200 when update succeeds', done => {
    const payload = {
      fullName: 'test-full-name',
      email: 'wolsborn@pdx.edu',
      jobTitle: 'test-job-title',
      phoneNum: '555-55-5555',
      senateDivision: 'AO',
    };

    request(app)
      .put('/faculty')
      .send(payload)
      .expect(200, done);
  });

  it('PUT returns 404 when target record to update does not exist', done => {
    const payload = {
      fullName: 'test-full-name',
      email: 'test-email-does-not-exist',
      jobTitle: 'test-job-title',
      phoneNum: '555-55-5555',
      senateDivision: 'AO',
    };

    request(app)
      .put('/faculty')
      .send(payload)
      .expect(404, done);
  });
});
