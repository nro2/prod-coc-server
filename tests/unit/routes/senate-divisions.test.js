const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const mock = require('./mock');

const underTestFilename = '../../../src/routes/senate-divisions.js';

const routerGet = sinon.stub();
const routerActions = {};

const stubs = {
  express: {
    Router: () => ({
      get: routerGet,
    }),
  },
  '../database': {
    getSenateDivisions: sinon.stub(),
  },
};

describe('Request routing for /senate-divisions', () => {
  let underTest; // eslint-disable-line
  let req;
  let res;

  before(() => {
    underTest = proxyquire(underTestFilename, stubs);
    routerActions.getSenateDivisions = routerGet.firstCall.args[1];
  });

  beforeEach(() => {
    req = mock.request();
    res = mock.response();
  });

  afterEach(() => {
    routerGet.resetHistory();

    stubs['../database'].getSenateDivisions.resetHistory();
  });

  it('GET returns 200 when senate divisions are retrieved from database', () => {
    const senateDivisions = [
      {
        senate_division_short_name: 'test-senate-division-1',
        name: 'test-senate-division-name-1',
      },
      {
        senate_division_short_name: 'test-senate-division-2',
        name: 'test-senate-division-name-2',
      },
    ];
    stubs['../database'].getSenateDivisions.resolves(senateDivisions);

    return routerActions.getSenateDivisions(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 200);
      assert.equal(res.send.firstCall.args[0], senateDivisions);
    });
  });

  it('GET returns 404 when there are no senate divisions in the database', () => {
    stubs['../database'].getSenateDivisions.resolves([]);

    return routerActions.getSenateDivisions(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 404);
    });
  });

  it('GET returns 500 when there is an error getting senate divisions from database', () => {
    stubs['../database'].getSenateDivisions.rejects();

    return routerActions.getSenateDivisions(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 500);
      assert.deepEqual(res.send.firstCall.args[0], {
        error: 'Unable to complete database transaction',
      });
    });
  });
});
