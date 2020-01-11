const decache = require('decache');
const knex = require('../../db/knex');
const request = require('supertest');

describe('Request routing for /survey-choice', () => {
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
      .get('/survey-choice/2019/wolsborn@pdx.edu')
      .expect(200, done);
  });

  it('GET returns 404 when date does not exist', done => {
    request(app)
      .get('/survey-choice/3010/wolsborn@pdx.edu')
      .expect(404, done);
  });

  it('GET returns 404 when email does not exist', done => {
    request(app)
      .get('/survey-choice/2019/does-not-exist')
      .expect(404, done);
  });

  it('POST returns 201 when insertion succeeds', done => {
    const payload = {
      choiceId: 1,
      surveyDate: '2019-01-01',
      email: 'betty@oregon.gov',
      committeeId: 1,
    };

    request(app)
      .post('/survey-choice')
      .send(payload)
      .expect(
        'Location',
        'http://localhost:8080/survey-choice/2019/betty@oregon.gov'
      )
      .expect(201, done);
  });

  it('POST returns 409 when the payload email violates foreign key constraint', done => {
    const payload = {
      choiceId: 1,
      surveyDate: '2019-01-01',
      email: 'test-email',
      committeeId: 1,
    };

    request(app)
      .post('/survey-choice')
      .send(payload)
      .expect(409, done);
  });

  it('POST returns 409 when the record already exists', done => {
    const payload = {
      choiceId: 1,
      surveyDate: '2050-01-01',
      email: 'wolsborn@pdx.edu',
      committeeId: 1,
    };

    request(app)
      .post('/survey-choice')
      .send(payload)
      .expect(201)
      .then(() => {
        request(app)
          .post('/survey-choice')
          .send(payload)
          .expect(409, done);
      });
  });
});
