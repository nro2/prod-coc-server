const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const mock = require('./mock');

const underTestFilename = '../../../src/routes/department-associations.js';

const routerGet = sinon.stub();
const routerPost = sinon.stub();
const routerPut = sinon.stub();
const routerActions = {};

const stubs = {
  express: {
    Router: () => ({
      get: routerGet,
      post: routerPost,
      put: routerPut,
    }),
  },
  '../database': {
    addDepartmentAssociation: sinon.stub(),
    getDepartmentAssociationsByDepartment: sinon.stub(),
    getDepartmentAssociationsByFaculty: sinon.stub(),
    updateDepartmentAssociations: sinon.stub(),
  },
};

describe('Request routing for /department-associations', () => {
  let underTest; // eslint-disable-line
  let req;
  let res;

  before(() => {
    underTest = proxyquire(underTestFilename, stubs);
    routerActions.postDepartmentAssociation = routerPost.firstCall.args[1];
    routerActions.getDepartmentAssociationsByDepartment =
      routerGet.firstCall.args[1];
    routerActions.getDepartmentAssociationsByFaculty = routerGet.secondCall.args[1];
    routerActions.updateDepartmentAssociations = routerPut.firstCall.args[1];
  });

  beforeEach(() => {
    req = mock.request();
    res = mock.response();
  });

  afterEach(() => {
    routerGet.resetHistory();
    routerPost.resetHistory();
    routerPut.resetHistory();

    stubs['../database'].addDepartmentAssociation.resetHistory();
    stubs['../database'].getDepartmentAssociationsByDepartment.resetHistory();
    stubs['../database'].getDepartmentAssociationsByFaculty.resetHistory();
    stubs['../database'].updateDepartmentAssociations.resetHistory();
  });

  it('POST returns 201 when committee assignment is added to the database', () => {
    req.body = {
      email: 'test-email',
      departmentId: 42,
    };
    stubs['../database'].addDepartmentAssociation.resolves(true);

    return routerActions.postDepartmentAssociation(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 201);
    });
  });

  it('POST returns 400 when missing email in request body', () => {
    req.body = {
      departmentId: 42,
    };

    return routerActions.postDepartmentAssociation(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 400);
      assert.deepEqual(res.send.firstCall.args[0], { message: 'Bad Request' });
    });
  });

  it('POST returns 400 when missing departmentId in request body', () => {
    req.body = {
      email: 'test-email',
    };

    return routerActions.postDepartmentAssociation(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 400);
      assert.deepEqual(res.send.firstCall.args[0], { message: 'Bad Request' });
    });
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
      stubs['../database'].getDepartmentAssociationsByDepartment.resolves(
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
      stubs['../database'].getDepartmentAssociationsByDepartment.resolves([]);

      return routerActions
        .getDepartmentAssociationsByDepartment(req, res)
        .then(() => {
          assert.equal(res.status.firstCall.args[0], 404);
        });
    });

    it('GET returns 500 when there is a database error', () => {
      req.params.id = 42;
      stubs['../database'].getDepartmentAssociationsByDepartment.rejects(
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
      req.params.email = 'test@email.com';
      stubs['../database'].getDepartmentAssociationsByFaculty.resolves(
        departmentAssociations
      );

      return routerActions.getDepartmentAssociationsByFaculty(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 200);
        assert.equal(res.send.firstCall.args[0], departmentAssociations);
      });
    });

    it('GET returns 404 when department associations returns an empty array', () => {
      req.params.email = 'test@email.com';
      stubs['../database'].getDepartmentAssociationsByFaculty.resolves([]);

      return routerActions.getDepartmentAssociationsByFaculty(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 404);
      });
    });

    it('GET returns 500 when there is a database error', () => {
      req.params.email = 'test@email.com';
      stubs['../database'].getDepartmentAssociationsByFaculty.rejects(
        new Error('test-error')
      );

      return routerActions.getDepartmentAssociationsByFaculty(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 500);
      });
    });
  });

  describe('Route put /', () => {
    it('PUT returns 200 when department association is updated in the database', () => {
      req.body = {
        email: 'test@test.edu',
        oldDepartmentId: 1,
        newDepartmentId: 2,
      };
      stubs['../database'].updateDepartmentAssociations.resolves({ rowCount: 1 });

      return routerActions.updateDepartmentAssociations(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 200);
      });
    });

    it('PUT returns 404 when email does not exist in database', () => {
      req.body = {
        email: 'test@test.edu',
        oldDepartmentId: 1,
        newDepartmentId: 2,
      };
      stubs['../database'].updateDepartmentAssociations.resolves({ rowCount: 0 });

      return routerActions.updateDepartmentAssociations(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 404);
      });
    });

    it('PUT returns 500 when unable to update department association', () => {
      req.body = {
        email: 'test@test.edu',
        oldDepartmentId: 1,
        newDepartmentId: 2,
      };
      stubs['../database'].updateDepartmentAssociations.rejects(
        new Error('test-database-error')
      );

      return routerActions.updateDepartmentAssociations(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 500);
        assert.deepEqual(res.send.firstCall.args[0], {
          message: 'Internal Server Error',
          error: 'test-database-error',
        });
      });
    });

    it('PUT returns 400 when missing email from request body', () => {
      req.body = {
        oldDepartmentId: 1,
        newDepartmentId: 2,
      };

      return routerActions.updateDepartmentAssociations(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 400);
        assert.deepEqual(res.send.firstCall.args[0], {
          message: 'Bad Request',
        });
      });
    });

    it('PUT returns 400 when missing oldDepartmentId from request body', () => {
      req.body = {
        email: 'test@test.edu',
        newDepartmentId: 2,
      };

      return routerActions.updateDepartmentAssociations(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 400);
        assert.deepEqual(res.send.firstCall.args[0], {
          message: 'Bad Request',
        });
      });
    });

    it('PUT returns 400 when missing newDeprtmentId from request body', () => {
      req.body = {
        email: 'test@test.edu',
        oldDepartmentId: 1,
      };

      return routerActions.updateDepartmentAssociations(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 400);
        assert.deepEqual(res.send.firstCall.args[0], {
          message: 'Bad Request',
        });
      });
    });
  });
});
