const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const underTestFilename = '../../routes/index.js';

const routerGet = sinon.stub();
const routerPost = sinon.stub();
const routerActions = {};

const stubs = {
  express: {
    Router: () => ({
      get: routerGet,
      post: routerPost,
    }),
  },
  '../database/queries': {
    addFaculty: sinon.stub(),
    getCommittees: sinon.stub(),
    getFaculty: sinon.stub(),
    getDepartment: sinon.stub(),
    UNIQUENESS_VIOLATION: '23505',
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

describe('Request routing', () => {
  let underTest; // eslint-disable-line
  let req;
  let res;

  before(() => {
    underTest = proxyquire(underTestFilename, stubs);
    routerActions.getCommittees = routerGet.secondCall.args[1];
    routerActions.getDepartments = routerGet.thirdCall.args[1];
    routerActions.getRoot = routerGet.firstCall.args[1];
    routerActions.postRoot = routerPost.firstCall.args[1];
    routerActions.getDepartment = routerGet.thirdCall.args[1];

    sinon.stub(console, 'info');
    sinon.stub(console, 'error');
  });

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
  });

  afterEach(() => {
    routerGet.resetHistory();
    routerPost.resetHistory();

    stubs['../database/queries'].addFaculty.resetHistory();
    stubs['../database/queries'].getCommittees.resetHistory();
    stubs['../database/queries'].getFaculty.resetHistory();
    stubs['../database/queries'].getDepartment.resetHistory();
    stubs['../database/queries'].getDepartments.resetHistory();
  });

  describe('Routing for /', () => {
    it('GET returns 200 when faculty exists in database', () => {
      const expected = {
        firstName: 'test-first-name',
        lastName: 'test-last-name',
        phoneNum: 'test-phone-number',
      };
      req.query = {
        firstName: 'test-first-name',
      };
      stubs['../database/queries'].getFaculty.resolves(expected);

      return routerActions.getRoot(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 200);
        assert.deepEqual(res.send.firstCall.args[0], expected);
      });
    });

    it('GET returns 400 when missing firstName in query parameters', () => {
      return routerActions.getRoot(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 400);
        assert.deepEqual(res.send.firstCall.args[0], {
          message: '400 Bad Request',
        });
      });
    });

    it('GET returns 404 when getting response from database fails', () => {
      req.query = {
        firstName: 'test-first-name',
      };
      stubs['../database/queries'].getFaculty.resolves(undefined);

      return routerActions.getRoot(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 404);
      });
    });
  });

  describe('Routing for /faculty', () => {
    it('POST returns 201 when faculty is added to database', () => {
      req.body = {
        fullName: 'test-full-name',
        email: 'test-email',
        jobTitle: 'test-job-title',
        phoneNum: 'test-phone-num',
        senateDivision: 'test-senate-division',
      };
      stubs['../database/queries'].addFaculty.resolves(true);

      return routerActions.postRoot(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 201);
      });
    });
    it('POST returns 400 when missing phoneNum in request body', () => {
      req.body = {
        fullName: 'test-full-name',
        email: 'test-email',
        jobTitle: 'test-job-title',
        senateDivision: 'test-senate-division',
      };

      return routerActions.postRoot(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 400);
        assert.deepEqual(res.send.firstCall.args[0], {
          message: '400 Bad Request',
        });
      });
    });

    it('POST returns 400 when missing fullName in request body', () => {
      req.body = {
        email: 'test-email',
        jobTitle: 'test-job-title',
        phoneNum: 'test-phone-num',
        senateDivision: 'test-senate-division',
      };

      return routerActions.postRoot(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 400);
        assert.deepEqual(res.send.firstCall.args[0], {
          message: '400 Bad Request',
        });
      });
    });

    it('POST returns 400 when missing email in request body', () => {
      req.body = {
        fullName: 'test-full-name',
        jobTitle: 'test-job-title',
        phoneNum: 'test-phone-num',
        senateDivision: 'test-senate-division',
      };

      return routerActions.postRoot(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 400);
        assert.deepEqual(res.send.firstCall.args[0], {
          message: '400 Bad Request',
        });
      });
    });

    it('POST returns 400 when missing jobTitle in request body', () => {
      req.body = {
        fullName: 'test-full-name',
        email: 'test-email',
        phoneNum: 'test-phone-num',
        senateDivision: 'test-senate-division',
      };

      return routerActions.postRoot(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 400);
        assert.deepEqual(res.send.firstCall.args[0], {
          message: '400 Bad Request',
        });
      });
    });

    it('POST returns 400 when missing senateDivision in request body', () => {
      req.body = {
        fullName: 'test-full-name',
        email: 'test-email',
        phoneNum: 'test-phone-num',
        jobTitle: 'test-job-title',
      };

      return routerActions.postRoot(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 400);
        assert.deepEqual(res.send.firstCall.args[0], {
          message: '400 Bad Request',
        });
      });
    });

    it('POST returns 409 when primary key already exists in the database', () => {
      req.body = {
        fullName: 'test-full-name',
        email: 'test-existing-email',
        jobTitle: 'test-job-title',
        phoneNum: 'test-phone-num',
        senateDivision: 'test-senate-division',
      };
      stubs['../database/queries'].addFaculty.rejects({ code: '23505' });

      return routerActions.postRoot(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 409);
      });
    });

    it('POST returns 500 when unable to add faculty to database', () => {
      req.body = {
        fullName: 'test-full-name',
        email: 'test-email',
        jobTitle: 'test-job-title',
        phoneNum: 'test-phone-num',
        senateDivision: 'test-senate-division',
      };
      stubs['../database/queries'].addFaculty.rejects(
        new Error('test-database-error')
      );

      return routerActions.postRoot(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 500);
        assert.deepEqual(res.send.firstCall.args[0], {
          error: 'Unable to complete database transaction',
        });
      });
    });
  });

  describe('Routing for /committees', () => {
    it('GET returns 200 when committees are retrieved from database', () => {
      const committees = [
        {
          name: 'test-name1',
          committee_id: 'test-committee_id1',
        },
        {
          name: 'test-name2',
          committee_id: 'test-committee_id2',
        },
      ];
      stubs['../database/queries'].getCommittees.resolves(committees);

      return routerActions.getCommittees(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 200);
        assert.equal(res.send.firstCall.args[0], committees);
      });
    });

    it('GET returns 500 when unable to get committees from database', () => {
      stubs['../database/queries'].getCommittees.resolves(undefined);

      return routerActions.getCommittees(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 500);
        assert.deepEqual(res.send.firstCall.args[0], {
          error: 'Unable to retrieve committees',
        });
      });
    });
  });

  describe('Routing for departments', () => {
    it('GET Returns 200 when departments are retrieved from database', () => {
      const expected = {
        department_id: 1,
        name: 'test-department',
      };
      stubs['../database/queries'].getDepartment.resolves(expected);

      req.params = {
        id: 1,
      };

      return routerActions.getDepartment(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 200);
        assert.deepEqual(res.send.firstCall.args[0], expected);
      });
    });

    it('GET Returns 400 when id is missing', () => {
      const expected = {
        department_id: 1,
        name: 'test-department',
      };

      req.params = {};
      stubs['../database/queries'].getDepartment.resolves(expected);
      return routerActions.getDepartment(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 400);
        assert.deepEqual(res.send.firstCall.args[0], {
          message: '400 Bad Request',
        });
      });
    });

    it('GET Returns 500 when department cant be retrieved', () => {
      stubs['../database/queries'].getDepartment.rejects(
        new Error('test-database-error')
      );

      req.params = {
        id: 1,
      };

      return routerActions.getDepartment(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 500);
        assert.deepEqual(res.send.firstCall.args[0], {
          error: 'Unable to complete database transaction',
        });
      });
    });
  });
  describe('Routing for /departments', () => {
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
      stubs['../database/queries'].getDepartments.resolves(departments);

      return routerActions.getDepartments(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 200);
        assert.equal(res.send.firstCall.args[0], departments);
      });
    });

    it('GET returns 404 when unable to get departments from database', () => {
      stubs['../database/queries'].getDepartments.resolves(undefined);

      return routerActions.getDepartments(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 404);
        assert.deepEqual(res.send.firstCall.args[0], {
          error: 'Unable to retrieve departments',
        });
      });
    });
  });
});
