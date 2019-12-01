const decache = require('decache');

describe('Requests to /', () => {
  let app;

  beforeEach(() => {
    decache('../');
    app = require('../');
  });

  afterEach(done => {
    app.close(done);
  });
});
