const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const mock = require('./mock');

const underTestFilename = '../../../src/routes/departments.js';

const routerGet = sinon.stub();
const routerActions = {};

const stubs = {
  express: {
    Router: () => ({
      get: routerGet,
    }),
  },
  '../database': {
    getDepartments: sinon.stub(),
  },
};

describe('Request routing for /departments', () => {
  let underTest; // eslint-disable-line
  let req;
  let res;

  before(() => {
    underTest = proxyquire(underTestFilename, stubs);
    routerActions.getDepartments = routerGet.firstCall.args[1];
  });

  beforeEach(() => {
    req = mock.request();
    res = mock.response();
  });

  afterEach(() => {
    routerGet.resetHistory();

    stubs['../database'].getDepartments.resetHistory();
  });

  it('GET returns 200 when departments are retrieved from database', () => {
    const departments = [
      {
        name: 'test-department-name',
        department_id: 'test-department-id',
      },
    ];
    stubs['../database'].getDepartments.resolves(departments);

    return routerActions.getDepartments(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 200);
      assert.equal(res.send.firstCall.args[0], departments);
    });
  });

  it('GET returns 404 when there are no departments in the database', () => {
    stubs['../database'].getDepartments.resolves([]);

    return routerActions.getDepartments(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 404);
    });
  });

  it('GET returns 500 when there is a database error', () => {
    stubs['../database'].getDepartments.rejects(new Error('test-error'));

    return routerActions.getDepartments(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 500);
      assert.deepEqual(res.send.firstCall.args[0], {
        error: 'Unable to complete database transaction',
      });
    });
  });
});
