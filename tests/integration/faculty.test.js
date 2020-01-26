const decache = require('decache');
const knex = require('../../db/knex');
const request = require('supertest');
const assert = require('assert');
const data = require('../../db/seeds/development/data');

describe('Request routing for /api/faculty', () => {
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

  describe('POST Integration Tests', () => {
    it('POST returns 201 when insertion without department succeeds', done => {
      const payload = {
        fullName: 'test-full-name',
        email: 'test-email',
        jobTitle: 'test-job-title',
        phoneNum: '555-55-5555',
        senateDivision: 'AO',
      };

      request(app)
        .post('/api/faculty')
        .send(payload)
        .expect('Location', 'http://localhost:8080/api/faculty/test-email')
        .expect(201, done);
    });

    it('POST returns 201 when insertion with department succeeds', done => {
      const payload = {
        fullName: 'test-full-name',
        email: 'test-email',
        jobTitle: 'test-job-title',
        phoneNum: '555-55-5555',
        senateDivision: 'AO',
        departmentAssociations: [
          {
            department_id: 1,
          },
        ],
      };

      request(app)
        .post('/api/faculty')
        .send(payload)
        .expect('Location', 'http://localhost:8080/api/faculty/test-email')
        .expect(201, done);
    });

    it('POST returns 400 when body empty', done => {
      const payload = {};

      request(app)
        .post('/api/faculty')
        .send(payload)
        .expect(400, done);
    });

    it('POST returns 400 when fullName empty', done => {
      const payload = {
        email: 'test-email',
        jobTitle: 'test-job-title',
        phoneNum: '555-55-5555',
        senateDivision: 'AO',
      };

      request(app)
        .post('/api/faculty')
        .send(payload)
        .expect(400, done);
    });

    it('POST returns 400 when email empty', done => {
      const payload = {
        fullName: 'test-full-name',
        jobTitle: 'test-job-title',
        phoneNum: '555-55-5555',
        senateDivision: 'AO',
      };

      request(app)
        .post('/api/faculty')
        .send(payload)
        .expect(400, done);
    });

    it('POST returns 400 when jobTitle empty', done => {
      const payload = {
        fullName: 'test-full-name',
        email: 'test-email',
        phoneNum: '555-55-5555',
        senateDivision: 'AO',
      };

      request(app)
        .post('/api/faculty')
        .send(payload)
        .expect(400, done);
    });

    it('POST returns 400 when phoneNum empty', done => {
      const payload = {
        fullName: 'test-full-name',
        email: 'test-email',
        jobTitle: 'test-job-title',
        senateDivision: 'AO',
      };

      request(app)
        .post('/api/faculty')
        .send(payload)
        .expect(400, done);
    });

    it('POST returns 400 when senateDivision empty', done => {
      const payload = {
        fullName: 'test-full-name',
        email: 'test-email',
        jobTitle: 'test-job-title',
        phoneNum: '555-55-5555',
      };

      request(app)
        .post('/api/faculty')
        .send(payload)
        .expect(400, done);
    });

    it('POST returns 400 when the department associations array contains missing keys', done => {
      const payload = {
        fullName: 'test-full-name',
        email: 'test-email',
        jobTitle: 'test-job-title',
        phoneNum: '555-55-5555',
        senateDivision: 'AO',
        departmentAssociations: [{}],
      };

      request(app)
        .post('/api/faculty')
        .send(payload)
        .expect(400, done);
    });

    it('POST returns 409 when the payload senateDivision violates foreign key constraint', done => {
      const payload = {
        fullName: 'test-full-name',
        email: 'test-email',
        jobTitle: 'test-job-title',
        phoneNum: '555-55-5555',
        senateDivision: 'zzzzzzzzz',
      };

      request(app)
        .post('/api/faculty')
        .send(payload)
        .expect(409, done);
    });

    it('POST returns 409 when the faculty (email) record already exists', done => {
      const payload = {
        fullName: 'test-full-name',
        email: 'test-email',
        jobTitle: 'test-job-title',
        phoneNum: '555-55-5555',
        senateDivision: 'AO',
      };

      request(app)
        .post('/api/faculty')
        .send(payload)
        .expect(201)
        .then(() => {
          request(app)
            .post('/api/faculty')
            .send(payload)
            .expect(409, done);
        });
    });

    it('POST returns 409 when the department associations (department_id) violates foreign key constraint', done => {
      const payload = {
        fullName: 'test-full-name',
        email: 'test-email',
        jobTitle: 'test-job-title',
        phoneNum: '555-55-5555',
        senateDivision: 'AO',
        departmentAssociations: [
          {
            department_id: 0,
          },
        ],
      };

      request(app)
        .post('/api/faculty')
        .send(payload)
        .expect(409, done);
    });
  });

  describe('PUT Integration Tests', () => {
    it('PUT returns 200 when update succeeds', done => {
      const payload = {
        fullName: 'test-full-name',
        email: 'wolsborn@pdx.edu',
        jobTitle: 'test-job-title',
        phoneNum: '555-55-5555',
        senateDivision: 'AO',
      };

      request(app)
        .put('/api/faculty')
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
        .put('/api/faculty')
        .send(payload)
        .expect(404, done);
    });
  });

  describe('GET Integration Tests', () => {
    describe('getAllFaculty', () => {
      it('GET returns 200 when records exist in the database', done => {
        request(app)
          .get('/api/faculty')
          .expect(200)
          .then(response => {
            assert.equal(response.body.length, data.faculty.length);
            done();
          });
      });

      it('GET returns 404 when no records exist in the database', async () => {
        await knex.migrate.rollback();
        await knex.migrate.latest().then(() => {
          request(app)
            .get('/api/faculty')
            .expect(404);
        });
      });
    });

    describe('getFaculty', () => {
      it('GET returns 200 and faculty record by email', done => {
        request(app)
          .get('/api/faculty/wolsborn@pdx.edu')
          .expect(200, done);
      });

      it('GET returns 404 when record does not exist for specified email', done => {
        request(app)
          .get('/api/faculty/bobross@happytrees.com')
          .expect(404, done);
      });
    });

    describe('getFacultyInfo', () => {
      it('GET returns 200 and faculty info record by email', done => {
        request(app)
          .get('/api/faculty/info/wolsborn@pdx.edu')
          .expect(200, done);
      });

      it('GET returns 404 when record does not exist for specified email', done => {
        request(app)
          .get('/api/faculty/info/bobross@happytrees.com')
          .expect(404, done);
      });
    });
  });
});
