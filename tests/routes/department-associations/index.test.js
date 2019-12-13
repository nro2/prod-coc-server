const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const mock = require('../mock');

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
    getDepartmentAssociationsByDepartment: sinon.stub(),
    getDepartmentAssociationsByFaculty: sinon.stub(),
  },
};

describe('Request routing for /department-associations', () => {
  let underTest; // eslint-disable-line
  let req;
  let res;

  before(() => {
    underTest = proxyquire(underTestFilename, stubs);
    routerActions.getDepartmentAssociationsByDepartment =
      routerGet.firstCall.args[1];
    routerActions.getDepartmentAssociationsByFaculty = routerGet.secondCall.args[1];
  });

  beforeEach(() => {
    req = mock.request();
    res = mock.response();
  });

  afterEach(() => {
    routerGet.resetHistory();

    stubs['../../database'].getDepartmentAssociationsByDepartment.resetHistory();
    stubs['../../database'].getDepartmentAssociationsByFaculty.resetHistory();
  });

  describe('Route /department', () => {
    it('GET returns 200 when department associations are retrieved from database', () => {
      const departmentAssociations = [
        {
          email: 'test@email.com',
          department_id: 42,
        },
      ];
      req.params.id = 42;
      stubs['../../database'].getDepartmentAssociationsByDepartment.resolves(
        departmentAssociations
      );

      return routerActions
        .getDepartmentAssociationsByDepartment(req, res)
        .then(() => {
          assert.equal(res.status.firstCall.args[0], 200);
          assert.equal(res.send.firstCall.args[0], departmentAssociations);
        });
    });

    it('GET returns 404 when department associations returns an empty array', () => {
      req.params.id = 42;
      stubs['../../database'].getDepartmentAssociationsByDepartment.resolves([]);

      return routerActions
        .getDepartmentAssociationsByDepartment(req, res)
        .then(() => {
          assert.equal(res.status.firstCall.args[0], 404);
        });
    });

    it('GET returns 400 when department id is missing from route parameters', () => {
      stubs['../../database'].getDepartmentAssociationsByDepartment.resolves([]);

      return routerActions
        .getDepartmentAssociationsByDepartment(req, res)
        .then(() => {
          assert.equal(res.status.firstCall.args[0], 400);
        });
    });

    it('GET returns 500 when there is a database error', () => {
      req.params.id = 42;
      stubs['../../database'].getDepartmentAssociationsByDepartment.rejects(
        new Error('test-error')
      );

      return routerActions
        .getDepartmentAssociationsByDepartment(req, res)
        .then(() => {
          assert.equal(res.status.firstCall.args[0], 500);
        });
    });
  });

  describe('Route /faculty', () => {
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
      stubs['../../database'].getDepartmentAssociationsByFaculty.resolves(
        departmentAssociations
      );

      return routerActions.getDepartmentAssociationsByFaculty(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 200);
        assert.equal(res.send.firstCall.args[0], departmentAssociations);
      });
    });

    it('GET returns 404 when department associations returns an empty array', () => {
      req.params.email = 'test@email.com';
      stubs['../../database'].getDepartmentAssociationsByFaculty.resolves([]);

      return routerActions.getDepartmentAssociationsByFaculty(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 404);
      });
    });

    it('GET returns 400 when faculty email is missing from route parameters', () => {
      stubs['../../database'].getDepartmentAssociationsByFaculty.resolves([]);

      return routerActions.getDepartmentAssociationsByFaculty(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 400);
      });
    });

    it('GET returns 500 when there is a database error', () => {
      req.params.email = 'test@email.com';
      stubs['../../database'].getDepartmentAssociationsByFaculty.rejects(
        new Error('test-error')
      );

      return routerActions.getDepartmentAssociationsByFaculty(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 500);
      });
    });
  });
});
