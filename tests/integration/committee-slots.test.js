const decache = require('decache');
const knex = require('../../db/knex');
const request = require('supertest');
const assert = require('assert');

describe('Request routing for /api/committee-slots', () => {
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

  it('PUT returns 200 when update succeeds', async () => {
    const payload = {
      slotRequirements: 3,
    };

    const initialTotalSlots = await request(app)
      .get('/api/committee/1')
      .expect(200);

    await request(app)
      .put('/api/committee-slots/1/AO')
      .send(payload)
      .expect(200);

    const expectedTotalSlots = await request(app)
      .get('/api/committee/1')
      .expect(200);

    assert.deepEqual(
      initialTotalSlots.body.total_slots + 2,
      expectedTotalSlots.body.total_slots
    );
  });

  it('PUT returns 404 when target record to update does not exist', done => {
    const payload = {
      slotRequirements: 3,
    };

    request(app)
      .put('/api/committee-slots/1000/FF')
      .send(payload)
      .expect(404, done);
  });

  it('POST returns 201 when insertion succeeds', done => {
    const payload = {
      committeeId: 2,
      senateDivision: 'SB',
      slotRequirements: 3,
    };

    request(app)
      .post('/api/committee-slots')
      .send(payload)
      .expect('Location', 'http://localhost:8080/api/committee-slots/committee/2')
      .expect(201, done);
  });

  it('POST returns 409 when the payload committee id violates foreign key constraint', done => {
    const payload = {
      committeeId: 1000,
      senateDivision: 'SB',
      slotRequirements: 3,
    };

    request(app)
      .post('/api/committee-slots')
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
      .post('/api/committee-slots')
      .send(payload)
      .expect(409, done);
  });

  it('POST returns 409 when the record already exists', done => {
    const payload = {
      committeeId: 2,
      senateDivision: 'SB',
      slotRequirements: 3,
    };

    request(app)
      .post('/api/committee-slots')
      .send(payload)
      .expect(201)
      .then(() => {
        request(app)
          .post('/api/committee-slots')
          .send(payload)
          .expect(409, done);
      });
  });

  describe('/committee/:id', () => {
    it('GET returns 200 when record exists', done => {
      request(app)
        .get('/api/committee-slots/committee/1')
        .expect(200, done);
    });

    it('GET returns 404 when record does not exist', done => {
      request(app)
        .get('/api/committee-slots/committee/1000')
        .expect(404, done);
    });
  });

  describe('/senate-division/:shortname', () => {
    it('GET returns 200 when record exists', done => {
      request(app)
        .get('/api/committee-slots/senate-division/AO')
        .expect(200, done);
    });

    it('GET returns 404 when record does not exist', done => {
      request(app)
        .get('/api/committee-slots/senate-division/XX')
        .expect(404, done);
    });
  });
});
