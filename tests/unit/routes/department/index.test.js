const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const mock = require('../mock');

const underTestFilename = '../../../../src/routes/department/index.js';

const routerGet = sinon.stub();
const routerActions = {};

const stubs = {
  express: {
    Router: () => ({
      get: routerGet,
    }),
  },
  '../../database': {
    getDepartment: sinon.stub(),
  },
};

describe('Request routing for /department', () => {
  let underTest; // eslint-disable-line
  let req;
  let res;

  before(() => {
    underTest = proxyquire(underTestFilename, stubs);
    routerActions.getDepartment = routerGet.firstCall.args[1];
  });

  beforeEach(() => {
    req = mock.request();
    res = mock.response();
  });

  afterEach(() => {
    routerGet.resetHistory();

    stubs['../../database'].getDepartment.resetHistory();
  });

  it('GET returns 200 when departments are retrieved from database', () => {
    const expected = {
      department_id: 1,
      name: 'test-department',
    };
    stubs['../../database'].getDepartment.resolves(expected);
    req.params.id = 1;

    return routerActions.getDepartment(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 200);
      assert.deepEqual(res.send.firstCall.args[0], expected);
    });
  });

  it('GET returns 400 when id is missing', () => {
    const expected = {
      department_id: 1,
      name: 'test-department',
    };

    stubs['../../database'].getDepartment.resolves(expected);
    return routerActions.getDepartment(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 400);
      assert.deepEqual(res.send.firstCall.args[0], {
        message: '400 Bad Request',
      });
    });
  });

  it('GET Returns 404 when department is not found', () => {
    stubs['../../database'].getDepartment.rejects({ result: { rowCount: 0 } });
    req.params.id = 1;

    return routerActions.getDepartment(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 404);
    });
  });

  it('GET returns 500 when there is a database error', () => {
    stubs['../../database'].getDepartment.rejects(new Error('test-database-error'));
    req.params.id = 1;

    return routerActions.getDepartment(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 500);
      assert.deepEqual(res.send.firstCall.args[0], {
        error: 'Unable to complete database transaction',
      });
    });
  });
});
