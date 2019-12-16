const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const mock = require('../mock');

const underTestFilename = '../../../src/routes/committees/index.js';

const routerGet = sinon.stub();
const routerActions = {};

const stubs = {
  express: {
    Router: () => ({
      get: routerGet,
    }),
  },
  '../../database': {
    getCommittees: sinon.stub(),
  },
};

describe('Request routing for /committee', () => {
  let underTest; // eslint-disable-line
  let req;
  let res;

  before(() => {
    underTest = proxyquire(underTestFilename, stubs);
    routerActions.getCommittees = routerGet.firstCall.args[1];
  });

  beforeEach(() => {
    req = mock.request();
    res = mock.response();
  });

  afterEach(() => {
    routerGet.resetHistory();

    stubs['../../database'].getCommittees.resetHistory();
  });

  it('GET returns 200 when committees are retrieved from database', () => {
    const committees = [
      {
        name: 'test-committee-name',
        committee_id: 'test-committee-id',
      },
    ];
    stubs['../../database'].getCommittees.resolves(committees);

    return routerActions.getCommittees(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 200);
      assert.equal(res.send.firstCall.args[0], committees);
    });
  });

  it('GET returns 404 when there are no departments in the database', () => {
    stubs['../../database'].getCommittees.resolves([]);

    return routerActions.getCommittees(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 404);
    });
  });

  it('GET returns 500 when there is a database error', () => {
    stubs['../../database'].getCommittees.rejects(new Error('test-error'));

    return routerActions.getCommittees(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 500);
      assert.deepEqual(res.send.firstCall.args[0], {
        error: 'Unable to complete database transaction',
      });
    });
  });
});
