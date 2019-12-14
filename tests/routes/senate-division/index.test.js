const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const mock = require('../mock');

const underTestFilename = '../../../src/routes/senate-division/index.js';

const routerGet = sinon.stub();
const routerActions = {};

const stubs = {
  express: {
    Router: () => ({
      get: routerGet,
    }),
  },
  '../../database': {
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

    stubs['../../database'].getSenateDivision.resetHistory();
  });

  it('GET returns 200 when senate divisions are retrieved from database', () => {
    const senateDivision = {
      senate_division_short_name: 'test-senate-division-1',
      name: 'test-senate-division-name-1',
    };
    stubs['../../database'].getSenateDivision.resolves(senateDivision);

    req.params = {
      name: 'TEST',
    };

    return routerActions.getSenateDivision(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 200);
      assert.equal(res.send.firstCall.args[0], senateDivision);
    });
  });

  it('GET returns 404 when there are no senate division in the database', () => {
    stubs['../../database'].getSenateDivision.resolves([]);

    req.params = {
      name: 'TEST',
    };

    return routerActions.getSenateDivision(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 404);
    });
  });

  it('GET returns 500 when there is an error getting senate divisions from database', () => {
    stubs['../../database'].getSenateDivision.rejects();

    req.params = {
      name: 'TEST',
    };

    return routerActions.getSenateDivision(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 500);
      assert.deepEqual(res.send.firstCall.args[0], {
        error: 'Unable to complete database transaction',
      });
    });
  });

  it('GET returns 400 when there is no name with the request', () => {
    const senateDivision = {
      senate_division_short_name: 'test-senate-division-1',
      name: 'test-senate-division-name-1',
    };
    stubs['../../database'].getSenateDivision.resolves(senateDivision);

    req.params = {};

    return routerActions.getSenateDivision(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 400);
      assert.deepEqual(res.send.firstCall.args[0], {
        message: '400 Bad Request',
      });
    });
  });
});
