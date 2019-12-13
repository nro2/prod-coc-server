const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const mock = require('../mock');

const underTestFilename = '../../../src/routes/committee/index.js';

const routerPost = sinon.stub();
const routerActions = {};

const stubs = {
  express: {
    Router: () => ({
      post: routerPost,
    }),
  },
  '../../database': {
    addCommittee: sinon.stub(),
  },
};

describe('Request routing for /committee', () => {
  let underTest; // eslint-disable-line
  let req;
  let res;

  before(() => {
    underTest = proxyquire(underTestFilename, stubs);
    routerActions.addCommittee = routerPost.firstCall.args[1];

    sinon.stub(console, 'info');
    sinon.stub(console, 'error');
  });

  beforeEach(() => {
    req = mock.request();
    res = mock.response();
  });

  afterEach(() => {
    routerPost.resetHistory();

    stubs['../../database'].addCommittee.resetHistory();
  });

  it('GET returns 201 when committee is added to the database', () => {
    req.body = {
      name: 'test-committee-name',
      description: 'test-committee-description',
      totalSlots: 42,
    };
    stubs['../../database'].addCommittee.resolves();

    return routerActions.addCommittee(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 201);
    });
  });

  it('GET returns 400 when missing name in request body', () => {
    req.body = {
      description: 'test-committee-description',
      totalSlots: 42,
    };

    return routerActions.addCommittee(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 400);
      assert.deepEqual(res.send.firstCall.args[0], { message: '400 Bad Request' });
    });
  });

  it('GET returns 400 when missing description in request body', () => {
    req.body = {
      name: 'test-committee-name',
      totalSlots: 42,
    };

    return routerActions.addCommittee(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 400);
      assert.deepEqual(res.send.firstCall.args[0], { message: '400 Bad Request' });
    });
  });

  it('GET returns 400 when missing totalSlots in request body', () => {
    req.body = {
      name: 'test-committee-name',
      description: 'test-committee-description',
    };

    return routerActions.addCommittee(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 400);
      assert.deepEqual(res.send.firstCall.args[0], { message: '400 Bad Request' });
    });
  });

  it('GET returns 500 when unable to get committees from database', () => {
    req.body = {
      name: 'test-committee-name',
      description: 'test-committee-description',
      totalSlots: 42,
    };
    stubs['../../database'].addCommittee.rejects(new Error('test-error'));

    return routerActions.addCommittee(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 500);
      assert.deepEqual(res.send.firstCall.args[0], {
        error: 'Unable to complete database transaction',
      });
    });
  });
});
