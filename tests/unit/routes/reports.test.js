const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const mock = require('./mock');

const underTestFilename = '../../../src/routes/reports.js';

const routerGet = sinon.stub();
const routerActions = {};

const stubs = {
  express: {
    Router: () => ({
      get: routerGet,
    }),
  },
  '../database': {
    getSenateDivisionStats: sinon.stub(),
  },
};

describe('Request routing for /reports', () => {
  let underTest; // eslint-disable-line
  let req;
  let res;

  before(() => {
    underTest = proxyquire(underTestFilename, stubs);
    routerActions.getSenateDivisionStats = routerGet.firstCall.args[1];
  });

  beforeEach(() => {
    req = mock.request();
    res = mock.response();
  });

  afterEach(() => {
    routerGet.resetHistory();

    stubs['../database'].getSenateDivisionStats.resetHistory();
  });

  it('GET returns 200 when reports are retrieved from database', () => {
    const expected = {
      something: 'thing',
    };
    stubs['../database'].getSenateDivisionStats.resolves(expected);

    return routerActions.getSenateDivisionStats(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 200);
    });
  });

  it('GET returns 500 when there is a database error', () => {
    stubs['../database'].getSenateDivisionStats.rejects(new Error('test-error'));

    return routerActions.getSenateDivisionStats(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 500);
      assert.deepEqual(res.send.firstCall.args[0], {
        message: 'Internal Server Error',
        error: 'test-error',
      });
    });
  });
});
