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
        name: 'test-name1',
        committee_id: 'test-committee_id1',
      },
      {
        name: 'test-name2',
        committee_id: 'test-committee_id2',
      },
    ];
    stubs['../../database'].getCommittees.resolves(committees);

    return routerActions.getCommittees(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 200);
      assert.equal(res.send.firstCall.args[0], committees);
    });
  });

  it('GET returns 500 when unable to get committees from database', () => {
    stubs['../../database'].getCommittees.resolves(undefined);

    return routerActions.getCommittees(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 500);
      assert.deepEqual(res.send.firstCall.args[0], {
        error: 'Unable to retrieve committees',
      });
    });
  });
});
