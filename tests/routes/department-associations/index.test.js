const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const underTestFilename = '../../../src/routes/department-associations/index.js';

const routerGet = sinon.stub();
const routerActions = {};

const stubs = {
  express: {
    Router: () => ({
      get: routerGet,
    }),
  },
  '../../database': {
    getDepartmentAssociationsFaculty: sinon.stub(),
  },
};

const mockResponse = () => {
  const res = {};
  res.send = sinon.stub().returns(res);
  res.status = sinon.stub().returns(res);

  return res;
};

const mockRequest = () => {
  return { body: {}, query: {}, params: {} };
};

describe('Request routing for /department-associations/faculty', () => {
  let underTest; // eslint-disable-line
  let req;
  let res;

  before(() => {
    underTest = proxyquire(underTestFilename, stubs);
    routerActions.getDepartmentAssociationsFaculty = routerGet.firstCall.args[1];
  });

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
  });

  afterEach(() => {
    routerGet.resetHistory();

    stubs['../../database'].getDepartmentAssociationsFaculty.resetHistory();
  });

  it('GET returns 200 when department associations are retrieved from database', () => {
    const departmentAssociations = [
      {
        email: 'test@email.com',
        department_id: 1,
      },
    ];
    req.params = {
      email: 'test@email.com',
    };
    stubs['../../database'].getDepartmentAssociationsFaculty.resolves(
      departmentAssociations
    );

    return routerActions.getDepartmentAssociationsFaculty(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 200);
      assert.equal(res.send.firstCall.args[0], departmentAssociations);
    });
  });

  it('GET returns 404 when department associations returns an empty array', () => {
    req.params.email = 'test@email.com';
    stubs['../../database'].getDepartmentAssociationsFaculty.resolves([]);

    return routerActions.getDepartmentAssociationsFaculty(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 404);
    });
  });

  it('GET returns 400 when faculty email is missing from route parameters', () => {
    stubs['../../database'].getDepartmentAssociationsFaculty.resolves([]);

    return routerActions.getDepartmentAssociationsFaculty(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 400);
    });
  });

  it('GET returns 500 when there is a database error', () => {
    req.params.email = 'test@email.com';
    stubs['../../database'].getDepartmentAssociationsFaculty.rejects(
      new Error('test-error')
    );

    return routerActions.getDepartmentAssociationsFaculty(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 500);
    });
  });
});
