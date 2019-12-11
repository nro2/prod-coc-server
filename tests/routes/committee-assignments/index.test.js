const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const mock = require('../mock');

const underTestFilename = '../../../src/routes/committee-assignment/index.js';

const routerGet = sinon.stub();
const routerActions = {};

const stubs = {
  express: {
    Router: () => ({
      get: routerGet,
    }),
  },
  '../../database': {
    getCommitteeAssignmentByCommittee: sinon.stub(),
    getCommitteeAssignmentByFaculty: sinon.stub(),
  },
};

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

    stubs['../../database'].getCommitteeAssignmentByCommittee.resetHistory();
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

    stubs['../../database'].getCommitteeAssignmentByCommittee.resolves(
      committeeAssignments
    );

    return routerActions.getCommitteeAssignmentByCommittee(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 200);
      assert.equal(res.send.firstCall.args[0], committeeAssignments);
    });
  });

  it('GET returns 404 when there are no committee assignments', () => {
    req.params.id = 42;
    stubs['../../database'].getCommitteeAssignmentByCommittee.resolves([]);

    return routerActions.getCommitteeAssignmentByCommittee(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 404);
    });
  });

  it('GET returns 400 when committee id is missing from route parameters', () => {
    stubs['../../database'].getCommitteeAssignmentByCommittee.resolves([]);

    return routerActions.getCommitteeAssignmentByCommittee(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 400);
    });
  });

  it('GET returns 500 when there is a database error', () => {
    req.params.id = 42;

    stubs['../../database'].getCommitteeAssignmentByCommittee.rejects(
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

    stubs['../../database'].getCommitteeAssignmentByFaculty.resetHistory();
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

    stubs['../../database'].getCommitteeAssignmentByFaculty.resolves(
      committeeAssignments
    );

    return routerActions.getCommitteeAssignmentByFaculty(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 200);
      assert.equal(res.send.firstCall.args[0], committeeAssignments);
    });
  });

  it('GET returns 404 when there are no committee assignments', () => {
    req.params.email = 'test-email';
    stubs['../../database'].getCommitteeAssignmentByFaculty.resolves([]);

    return routerActions.getCommitteeAssignmentByFaculty(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 404);
    });
  });

  it('GET returns 400 when faculty email is missing from route parameters', () => {
    stubs['../../database'].getCommitteeAssignmentByFaculty.resolves([]);

    return routerActions.getCommitteeAssignmentByFaculty(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 400);
    });
  });

  it('GET returns 500 when there is a database error', () => {
    req.params.email = 'test@email.com';
    stubs['../../database'].getCommitteeAssignmentByFaculty.rejects(
      new Error('test-error')
    );

    return routerActions.getCommitteeAssignmentByFaculty(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 500);
    });
  });
});
