const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const mock = require('./mock');

const underTestFilename = '../../../src/routes/senate-division.js';

const routerGet = sinon.stub();
const routerActions = {};

const stubs = {
  express: {
    Router: () => ({
      get: routerGet,
    }),
  },
  '../database': {
    getSenateDivision: sinon.stub(),
  },
};

describe('Request routing for /senate-division', () => {
  let underTest; // eslint-disable-line
  let req;
  let res;

  before(() => {
    underTest = proxyquire(underTestFilename, stubs);
    routerActions.getSenateDivision = routerGet.firstCall.args[1];
  });

  beforeEach(() => {
    req = mock.request();
    res = mock.response();
  });

  afterEach(() => {
    routerGet.resetHistory();

    stubs['../database'].getSenateDivision.resetHistory();
  });

  it('GET returns 200 when senate divisions are retrieved from database', () => {
    const senateDivision = {
      senate_division_short_name: 'test-senate-division-short-name',
      name: 'test-senate-division-name',
    };
    stubs['../database'].getSenateDivision.resolves(senateDivision);
    req.params.name = 'test-senate-division-short-name';

    return routerActions.getSenateDivision(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 200);
      assert.equal(res.send.firstCall.args[0], senateDivision);
    });
  });

  it('GET returns 404 when there are no senate division in the database', () => {
    stubs['../database'].getSenateDivision.rejects({ result: { rowCount: 0 } });
    req.params.name = 'test-senate-division-short-name';

    return routerActions.getSenateDivision(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 404);
    });
  });

  it('GET returns 500 when there is an error getting senate divisions from database', () => {
    req.params.name = 'test-senate-division-short-name';

    stubs['../database'].getSenateDivision.rejects(new Error('test-error'));

    return routerActions.getSenateDivision(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 500);
      assert.deepEqual(res.send.firstCall.args[0], {
        message: 'Internal Server Error',
        error: 'test-error',
      });
    });
  });
});
