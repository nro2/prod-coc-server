const decache = require('decache');
const request = require('supertest');

describe('Requests to /', () => {
  let app;

  beforeEach(() => {
    decache('../');
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

  it('POST returns 200 and request body', done => {
    request(app)
      .post('/')
      .expect(200, "Request received", done);
  });
});