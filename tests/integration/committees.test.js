const assert = require('assert');
const decache = require('decache');
const knex = require('../../db/knex');
const request = require('supertest');

const data = require('../../db/seeds/development/data');

describe('Request routing for /committees', () => {
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

  it('GET returns 200 and committee records', () => {
    request(app)
      .get('/committees')
      .expect(200)
      .end((err, response) => {
        assert.equal(response.body.length, data.committee.length);
      });
  });
});
