const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const underTestFilename = '../../../src/routes/departments/index.js';

const routerGet = sinon.stub();
const routerActions = {};

const stubs = {
  express: {
    Router: () => ({
      get: routerGet,
    }),
  },
  '../../database': {
    getDepartments: sinon.stub(),
  },
};

const mockResponse = () => {
  const res = {};
  res.send = sinon.stub().returns(res);
  res.status = sinon.stub().returns(res);

  return res;
};

const mockRequest = (body, query) => {
  return { body, query };
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
    req = mockRequest();
    res = mockResponse();
  });

  afterEach(() => {
    routerGet.resetHistory();

    stubs['../../database'].getDepartments.resetHistory();
  });

  it('GET returns 200 when departments are retrieved from database', () => {
    const departments = [
      {
        name: 'test-department1',
        department_id: 'test-department_id1',
      },
      {
        name: 'test-department2',
        department_id: 'test-department_id2',
      },
    ];
    stubs['../../database'].getDepartments.resolves(departments);

    return routerActions.getDepartments(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 200);
      assert.equal(res.send.firstCall.args[0], departments);
    });
  });

  it('GET returns 404 when unable to get departments from database', () => {
    stubs['../../database'].getDepartments.resolves(undefined);

    return routerActions.getDepartments(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 404);
      assert.deepEqual(res.send.firstCall.args[0], {
        error: 'Unable to retrieve departments',
      });
    });
  });
});
