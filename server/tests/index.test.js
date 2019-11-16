const request = require('supertest');

describe('Requests to /', () => {
  let app;

  beforeEach(() => {
    app = require('../');
  });

  afterEach(done => {
    app.close(done);
  });

  it('GET returns 200 and OK', done => {
    request(app)
      .get('/')
      .expect(200, "OK", done);
  });
});