const decache = require('decache');
const knex = require('../../db/knex');
const request = require('supertest');

describe('Request routing for /committee-slots', () => {
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
      committeeId: 1,
      senateDivision: 'CQ',
      slotRequirements: 3,
    };

    request(app)
      .post('/committee-slots')
      .send(payload)
      .expect(201, done);
  });

  it('POST returns 409 when the payload committee id violates foreign key constraint', done => {
    const payload = {
      committeeId: 1000,
      senateDivision: 'CQ',
      slotRequirements: 3,
    };

    request(app)
      .post('/committee-slots')
      .send(payload)
      .expect(409, done);
  });

  it('POST returns 409 when the payload senate division short name violates foreign key constraint', done => {
    const payload = {
      committeeId: 1,
      senateDivision: 'does-not-exist',
      slotRequirements: 3,
    };

    request(app)
      .post('/committee-slots')
      .send(payload)
      .expect(409, done);
  });

  it('POST returns 409 when the record already exists', done => {
    const payload = {
      committeeId: 1,
      senateDivision: 'CQ',
      slotRequirements: 3,
    };

    request(app)
      .post('/committee-slots')
      .send(payload)
      .expect(201)
      .end(() => {
        request(app)
          .post('/committee-slots')
          .send(payload)
          .expect(409, done);
      });
  });
});
