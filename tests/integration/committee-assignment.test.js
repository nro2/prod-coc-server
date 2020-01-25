const decache = require('decache');
const knex = require('../../db/knex');
const request = require('supertest');

describe('Request routing for /api/committee-assignment', () => {
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

  describe('/api/committee-assignment', () => {
    it('POST returns 201 when insertion succeeds', done => {
      const payload = {
        email: 'wolsborn@pdx.edu',
        committeeId: 1,
        startDate: '2030-01-01',
        endDate: '2050-01-01',
      };

      request(app)
        .post('/api/committee-assignment')
        .send(payload)
        .expect(
          'Location',
          'http://localhost:8080/api/committee-assignment/faculty/wolsborn@pdx.edu'
        )
        .expect(201, done);
    });

    it('POST returns 409 when the payload email violates foreign key constraint', done => {
      const payload = {
        email: 'test-email-does-not-exist',
        committeeId: 1,
        startDate: '2030-01-01',
        endDate: '2050-01-01',
      };

      request(app)
        .post('/api/committee-assignment')
        .send(payload)
        .expect(409, done);
    });

    it('POST returns 409 when the record already exists', done => {
      const payload = {
        email: 'wolsborn@pdx.edu',
        committeeId: 1,
        startDate: '2030-01-01',
        endDate: '2050-01-01',
      };

      request(app)
        .post('/api/committee-assignment')
        .send(payload)
        .expect(201)
        .then(() => {
          request(app)
            .post('/api/committee-assignment')
            .send(payload)
            .expect(409, done);
        });
    });

    describe('Database trigger tests', () => {
      it('POST returns 201 when insertion succeeds, slots available, current faculty senate slots available', done => {
        const payload = {
          email: 'wolsborn@pdx.edu',
          committeeId: 11,
          startDate: '2020-01-01',
          endDate: '2030-01-01',
        };

        request(app)
          .post('/api/committee-assignment')
          .send(payload)
          .expect(
            'Location',
            'http://localhost:8080/api/committee-assignment/faculty/wolsborn@pdx.edu'
          )
          .expect(201, done);
      });

      it('POST returns 201 slots available, current faculty senate slots NOT available, senate reqs met', done => {
        const payload = {
          email: 'wolsborn@pdx.edu',
          committeeId: 12,
          startDate: '2020-01-01',
          endDate: '2030-01-01',
        };

        const payload2 = {
          email: 'ghopper@gmail.com',
          committeeId: 12,
          startDate: '2020-01-01',
          endDate: '2030-01-01',
        };

        request(app)
          .post('/api/committee-assignment')
          .send(payload)
          .expect(
            'Location',
            'http://localhost:8080/api/committee-assignment/faculty/wolsborn@pdx.edu'
          )
          .expect(201)
          .then(() => {
            request(app)
              .post('/api/committee-assignment')
              .send(payload2)
              .expect(
                'Location',
                'http://localhost:8080/api/committee-assignment/faculty/ghopper@gmail.com'
              )
              .expect(201, done);
          });
      });

      it('POST returns 201 slots available, current faculty senate slots NOT available, senate reqs not met, but slots left over', done => {
        const payload = {
          email: 'wolsborn@pdx.edu',
          committeeId: 13,
          startDate: '2020-01-01',
          endDate: '2030-01-01',
        };

        const payload2 = {
          email: 'newtons@gmail.com',
          committeeId: 13,
          startDate: '2020-01-01',
          endDate: '2030-01-01',
        };

        request(app)
          .post('/api/committee-assignment')
          .send(payload)
          .expect(
            'Location',
            'http://localhost:8080/api/committee-assignment/faculty/wolsborn@pdx.edu'
          )
          .expect(201)
          .then(() => {
            request(app)
              .post('/api/committee-assignment')
              .send(payload2)
              .expect(
                'Location',
                'http://localhost:8080/api/committee-assignment/faculty/newtons@gmail.com'
              )
              .expect(201, done);
          });
      });

      it('POST returns 409 when slots are available but senate requirements are unmet', done => {
        const payload = {
          email: 'wolsborn@pdx.edu',
          committeeId: 14,
          startDate: '2020-01-01',
          endDate: '2030-01-01',
        };

        const payload2 = {
          email: 'newtons@gmail.com',
          committeeId: 14,
          startDate: '2020-01-01',
          endDate: '2030-01-01',
        };

        request(app)
          .post('/api/committee-assignment')
          .send(payload)
          .expect(
            'Location',
            'http://localhost:8080/api/committee-assignment/faculty/wolsborn@pdx.edu'
          )
          .expect(201)
          .then(() => {
            request(app)
              .post('/api/committee-assignment')
              .send(payload2)
              .expect(409, done);
          });
      });

      it('POST returns 409 when slots are not available', done => {
        const payload = {
          email: 'wolsborn@pdx.edu',
          committeeId: 11,
          startDate: '2020-01-01',
          endDate: '2030-01-01',
        };

        const payload2 = {
          email: 'ghopper@gmail.com',
          committeeId: 11,
          startDate: '2020-01-01',
          endDate: '2030-01-01',
        };

        request(app)
          .post('/api/committee-assignment')
          .send(payload)
          .expect(
            'Location',
            'http://localhost:8080/api/committee-assignment/faculty/wolsborn@pdx.edu'
          )
          .expect(201)
          .then(() => {
            request(app)
              .post('/api/committee-assignment')
              .send(payload2)
              .expect(409, done);
          });
      });
    });

    describe('/committee/:id', () => {
      it('GET returns 200 when record exists', done => {
        request(app)
          .get('/api/committee-assignment/committee/1')
          .expect(200, done);
      });

      it('GET returns 404 when record does not exist', done => {
        request(app)
          .get('/api/committee-assignment/committee/10000')
          .expect(404, done);
      });
    });

    describe('/faculty/:email', () => {
      it('GET returns 200 when record exists', done => {
        request(app)
          .get('/api/committee-assignment/faculty/wolsborn@pdx.edu')
          .expect(200, done);
      });

      it('GET returns 404 when record does not exist', done => {
        request(app)
          .get('/api/committee-assignment/faculty/fake@mail.com')
          .expect(404, done);
      });
    });
  });
});
