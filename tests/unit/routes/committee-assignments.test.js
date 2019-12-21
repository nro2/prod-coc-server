const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const mock = require('./mock');

const underTestFilename = '../../../src/routes/committee-assignment.js';

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
    addCommitteeAssignment: sinon.stub(),
    getCommitteeAssignmentByCommittee: sinon.stub(),
    getCommitteeAssignmentByFaculty: sinon.stub(),
    updateCommitteeAssignment: sinon.stub(),
  },
};

describe('Request routing for /committee-assignment', () => {
  let underTest; // eslint-disable-line
  let req;
  let res;

  before(() => {
    underTest = proxyquire(underTestFilename, stubs);
    routerActions.postCommitteeAssignment = routerPost.firstCall.args[1];
    routerActions.putCommitteeAssignment = routerPut.firstCall.args[1];
  });

  beforeEach(() => {
    req = mock.request();
    res = mock.response();
  });

  afterEach(() => {
    routerPut.resetHistory();

    stubs['../database'].updateCommitteeAssignment.resetHistory();
  });

  it('POST returns 201 when committee assignment is added to the database', () => {
    req.body = {
      email: 'test-email',
      committeeId: 42,
      startDate: '1970-01-01',
      endDate: '2050-01-01',
    };
    stubs['../database'].addCommitteeAssignment.resolves();

    return routerActions.postCommitteeAssignment(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 201);
    });
  });

  it('POST returns 400 when missing email in request body', () => {
    req.body = {
      committeeId: 42,
      startDate: '1970-01-01',
      endDate: '2050-01-01',
    };

    return routerActions.postCommitteeAssignment(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 400);
      assert.deepEqual(res.send.firstCall.args[0], { message: '400 Bad Request' });
    });
  });

  it('POST returns 400 when missing committeeId in request body', () => {
    req.body = {
      email: 'test-email',
      startDate: '1970-01-01',
      endDate: '2050-01-01',
    };

    return routerActions.postCommitteeAssignment(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 400);
      assert.deepEqual(res.send.firstCall.args[0], { message: '400 Bad Request' });
    });
  });

  it('POST returns 400 when missing startDate in request body', () => {
    req.body = {
      email: 'test-email',
      committeeId: 42,
      endDate: '2050-01-01',
    };

    return routerActions.postCommitteeAssignment(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 400);
      assert.deepEqual(res.send.firstCall.args[0], { message: '400 Bad Request' });
    });
  });

  it('POST returns 400 when missing endDate in request body', () => {
    req.body = {
      email: 'test-email',
      committeeId: 42,
      startDate: '1970-01-01',
    };

    return routerActions.postCommitteeAssignment(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 400);
      assert.deepEqual(res.send.firstCall.args[0], { message: '400 Bad Request' });
    });
  });

  it('POST returns 409 when foreign keys do not exist in the database', () => {
    req.body = {
      email: 'test-email',
      committeeId: 42,
      startDate: '1970-01-01',
      endDate: '2050-01-01',
    };
    stubs['../database'].addCommitteeAssignment.rejects({ code: '23503' });

    return routerActions.postCommitteeAssignment(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 409);
    });
  });

  it('POST returns 409 when email and committee id pair already exists in the database', () => {
    req.body = {
      email: 'test-existing-email',
      committeeId: 42,
      startDate: '1970-01-01',
      endDate: '2050-01-01',
    };
    stubs['../database'].addCommitteeAssignment.rejects({ code: '23505' });

    return routerActions.postCommitteeAssignment(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 409);
    });
  });

  it('POST returns 500 when unable to get committee assignment from database', () => {
    req.body = {
      email: 'test-email',
      committeeId: 42,
      startDate: '1970-01-01',
      endDate: '2050-01-01',
    };
    stubs['../database'].addCommitteeAssignment.rejects(new Error('test-error'));

    return routerActions.postCommitteeAssignment(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 500);
      assert.deepEqual(res.send.firstCall.args[0], {
        error: 'Unable to complete database transaction',
      });
    });
  });

  it('PUT returns 200 when committee is updated in the database', () => {
    req.body = {
      email: 'test-email',
      committeeId: 42,
      startDate: '1970-01-01',
      endDate: '2050-01-01',
    };
    stubs['../database'].updateCommitteeAssignment.resolves({ rowCount: 1 });

    return routerActions.putCommitteeAssignment(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 200);
    });
  });

  it('PUT returns 400 when missing email in request body', () => {
    req.body = {
      committeeId: 42,
      startDate: '1970-01-01',
      endDate: '2050-01-01',
    };

    return routerActions.putCommitteeAssignment(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 400);
      assert.deepEqual(res.send.firstCall.args[0], {
        message: '400 Bad Request',
      });
    });
  });

  it('PUT returns 400 when missing committeeId in request body', () => {
    req.body = {
      email: 'test-email',
      startDate: '1970-01-01',
      endDate: '2050-01-01',
    };

    return routerActions.putCommitteeAssignment(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 400);
      assert.deepEqual(res.send.firstCall.args[0], {
        message: '400 Bad Request',
      });
    });
  });

  it('PUT returns 400 when missing startDate in request body', () => {
    req.body = {
      email: 'test-email',
      committeeId: 42,
      endDate: '2050-01-01',
    };

    return routerActions.putCommitteeAssignment(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 400);
      assert.deepEqual(res.send.firstCall.args[0], {
        message: '400 Bad Request',
      });
    });
  });

  it('PUT returns 400 when missing endDate in request body', () => {
    req.body = {
      email: 'test-email',
      committeeId: 42,
      startDate: '1970-01-01',
    };

    return routerActions.putCommitteeAssignment(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 400);
      assert.deepEqual(res.send.firstCall.args[0], {
        message: '400 Bad Request',
      });
    });
  });

  it('PUT returns 404 when committee assignment record did not exist to update', () => {
    req.body = {
      email: 'test-email',
      committeeId: 42,
      startDate: '1970-01-01',
      endDate: '2050-01-01',
    };
    stubs['../database'].updateCommitteeAssignment.resolves({ rowCount: 0 });

    return routerActions.putCommitteeAssignment(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 404);
    });
  });

  it('PUT returns 500 when unable to update faculty in the database', () => {
    req.body = {
      email: 'test-email',
      committeeId: 42,
      startDate: '1970-01-01',
      endDate: '2050-01-01',
    };
    stubs['../database'].updateCommitteeAssignment.rejects(
      new Error('test-database-error')
    );

    return routerActions.putCommitteeAssignment(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 500);
      assert.deepEqual(res.send.firstCall.args[0], {
        error: 'Unable to complete database transaction',
      });
    });
  });
});

describe('Request routing for /committee-assignment/committee', () => {
  let underTest; // eslint-disable-line
  let req;
  let res;

  before(() => {
    underTest = proxyquire(underTestFilename, stubs);
    routerActions.getCommitteeAssignmentByCommittee = routerGet.firstCall.args[1];
  });

  beforeEach(() => {
    req = mock.request();
    res = mock.response();
  });

  afterEach(() => {
    routerGet.resetHistory();

    stubs['../database'].getCommitteeAssignmentByCommittee.resetHistory();
  });

  it('GET returns 200 when committee assignments are retrieved from database', () => {
    const committeeAssignments = [
      {
        email: 'test-email',
        committee_id: 1,
        start_date: 'test-start-date',
        end_date: 'test-end-date',
      },
    ];
    req.params.id = 42;

    stubs['../database'].getCommitteeAssignmentByCommittee.resolves(
      committeeAssignments
    );

    return routerActions.getCommitteeAssignmentByCommittee(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 200);
      assert.equal(res.send.firstCall.args[0], committeeAssignments);
    });
  });

  it('GET returns 404 when there are no committee assignments', () => {
    req.params.id = 42;
    stubs['../database'].getCommitteeAssignmentByCommittee.resolves([]);

    return routerActions.getCommitteeAssignmentByCommittee(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 404);
    });
  });

  it('GET returns 400 when committee id is missing from route parameters', () => {
    stubs['../database'].getCommitteeAssignmentByCommittee.resolves([]);

    return routerActions.getCommitteeAssignmentByCommittee(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 400);
    });
  });

  it('GET returns 500 when there is a database error', () => {
    req.params.id = 42;

    stubs['../database'].getCommitteeAssignmentByCommittee.rejects(
      new Error('test-error')
    );

    return routerActions.getCommitteeAssignmentByCommittee(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 500);
    });
  });
});

describe('Request routing for /committee-assignment/faculty', () => {
  let underTest; // eslint-disable-line
  let req;
  let res;

  before(() => {
    underTest = proxyquire(underTestFilename, stubs);
    routerActions.getCommitteeAssignmentByFaculty = routerGet.secondCall.args[1];
  });

  beforeEach(() => {
    req = mock.request();
    res = mock.response();
  });

  afterEach(() => {
    routerGet.resetHistory();

    stubs['../database'].getCommitteeAssignmentByFaculty.resetHistory();
  });

  it('GET returns 200 when committee assignments are retrieved from database', () => {
    const committeeAssignments = [
      {
        email: 'test-email',
        committee_id: 1,
        start_date: 'test-start-date',
        end_date: 'test-end-date',
      },
    ];
    req.params.email = 'test-email';

    stubs['../database'].getCommitteeAssignmentByFaculty.resolves(
      committeeAssignments
    );

    return routerActions.getCommitteeAssignmentByFaculty(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 200);
      assert.equal(res.send.firstCall.args[0], committeeAssignments);
    });
  });

  it('GET returns 404 when there are no committee assignments', () => {
    req.params.email = 'test-email';
    stubs['../database'].getCommitteeAssignmentByFaculty.resolves([]);

    return routerActions.getCommitteeAssignmentByFaculty(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 404);
    });
  });

  it('GET returns 400 when faculty email is missing from route parameters', () => {
    stubs['../database'].getCommitteeAssignmentByFaculty.resolves([]);

    return routerActions.getCommitteeAssignmentByFaculty(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 400);
    });
  });

  it('GET returns 500 when there is a database error', () => {
    req.params.email = 'test@email.com';
    stubs['../database'].getCommitteeAssignmentByFaculty.rejects(
      new Error('test-error')
    );

    return routerActions.getCommitteeAssignmentByFaculty(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 500);
    });
  });
});
