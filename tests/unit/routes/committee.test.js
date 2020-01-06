const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const mock = require('./mock');

const underTestFilename = '../../../src/routes/committee.js';

const routerPost = sinon.stub();
const routerPut = sinon.stub();
const routerGet = sinon.stub();
const routerActions = {};

const stubs = {
  express: {
    Router: () => ({
      post: routerPost,
      put: routerPut,
      get: routerGet,
    }),
  },
  '../database': {
    addCommittee: sinon.stub(),
    updateCommittee: sinon.stub(),
    getCommittee: sinon.stub(),
  },
};

describe('Request routing for /committee', () => {
  let underTest; // eslint-disable-line
  let req;
  let res;

  before(() => {
    underTest = proxyquire(underTestFilename, stubs);
    routerActions.postCommittee = routerPost.firstCall.args[1];
    routerActions.putCommittee = routerPut.firstCall.args[1];
    routerActions.getCommittee = routerGet.firstCall.args[1];

    sinon.stub(console, 'info');
    sinon.stub(console, 'error');
  });

  beforeEach(() => {
    req = mock.request();
    res = mock.response();
  });

  afterEach(() => {
    routerPost.resetHistory();
    routerPut.resetHistory();
    routerGet.resetHistory();

    stubs['../database'].addCommittee.resetHistory();
    stubs['../database'].updateCommittee.resetHistory();
    stubs['../database'].getCommittee.resetHistory();
  });

  it('POST returns 201 when committee is added to the database', () => {
    req.body = {
      name: 'test-committee-name',
      description: 'test-committee-description',
      totalSlots: 42,
    };
    stubs['../database'].addCommittee.resolves();

    return routerActions.postCommittee(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 201);
    });
  });

  it('POST returns 400 when missing name in request body', () => {
    req.body = {
      description: 'test-committee-description',
      totalSlots: 42,
    };

    return routerActions.postCommittee(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 400);
      assert.deepEqual(res.send.firstCall.args[0], { message: '400 Bad Request' });
    });
  });

  it('POST returns 400 when missing description in request body', () => {
    req.body = {
      name: 'test-committee-name',
      totalSlots: 42,
    };

    return routerActions.postCommittee(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 400);
      assert.deepEqual(res.send.firstCall.args[0], { message: '400 Bad Request' });
    });
  });

  it('POST returns 400 when missing totalSlots in request body', () => {
    req.body = {
      name: 'test-committee-name',
      description: 'test-committee-description',
    };

    return routerActions.postCommittee(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 400);
      assert.deepEqual(res.send.firstCall.args[0], { message: '400 Bad Request' });
    });
  });

  it('POST returns 500 when unable to get committees from database', () => {
    req.body = {
      name: 'test-committee-name',
      description: 'test-committee-description',
      totalSlots: 42,
    };
    stubs['../database'].addCommittee.rejects(new Error('test-error'));

    return routerActions.postCommittee(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 500);
      assert.deepEqual(res.send.firstCall.args[0], {
        error: 'Unable to complete database transaction',
      });
    });
  });

  it('PUT returns 200 when committee is updated in the database', () => {
    req.body = {
      committeeId: 42,
      name: 'test-committee-name',
      description: 'test-committee-description',
      totalSlots: 3,
    };
    stubs['../database'].updateCommittee.resolves({ rowCount: 1 });

    return routerActions.putCommittee(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 200);
    });
  });

  it('PUT returns 400 when missing committeeId in request body', () => {
    req.body = {
      name: 'test-committee-name',
      description: 'test-committee-description',
      totalSlots: 3,
    };

    return routerActions.putCommittee(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 400);
      assert.deepEqual(res.send.firstCall.args[0], {
        message: '400 Bad Request',
      });
    });
  });

  it('PUT returns 400 when missing name in request body', () => {
    req.body = {
      committeeId: 42,
      description: 'test-committee-description',
      totalSlots: 3,
    };

    return routerActions.putCommittee(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 400);
      assert.deepEqual(res.send.firstCall.args[0], {
        message: '400 Bad Request',
      });
    });
  });

  it('PUT returns 400 when missing description in request body', () => {
    req.body = {
      committeeId: 42,
      name: 'test-committee-name',
      totalSlots: 3,
    };

    return routerActions.putCommittee(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 400);
      assert.deepEqual(res.send.firstCall.args[0], {
        message: '400 Bad Request',
      });
    });
  });

  it('PUT returns 400 when missing totalSlots in request body', () => {
    req.body = {
      committeeId: 42,
      name: 'test-committee-name',
      description: 'test-committee-description',
    };

    return routerActions.putCommittee(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 400);
      assert.deepEqual(res.send.firstCall.args[0], {
        message: '400 Bad Request',
      });
    });
  });

  it('PUT returns 404 when faculty record did not exist to update', () => {
    req.body = {
      committeeId: 42,
      name: 'test-committee-name',
      description: 'test-committee-description',
      totalSlots: 3,
    };
    stubs['../database'].updateCommittee.resolves({ rowCount: 0 });

    return routerActions.putCommittee(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 404);
    });
  });

  it('PUT returns 500 when unable to update faculty in the database', () => {
    req.body = {
      committeeId: 42,
      name: 'test-committee-name',
      description: 'test-committee-description',
      totalSlots: 3,
    };
    stubs['../database'].updateCommittee.rejects(new Error('test-database-error'));

    return routerActions.putCommittee(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 500);
      assert.deepEqual(res.send.firstCall.args[0], {
        error: 'Unable to complete database transaction',
      });
    });
  });

  it('GET returns 200 when committee is retrieved from database', () => {
    const expected = {
      committee_id: 1,
      name: 'test-committee',
      description: 'test-committee-description',
    };
    stubs['../database'].getCommittee.resolves(expected);
    req.params.name = 'test-committee-name';

    return routerActions.getCommittee(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 200);
      assert.deepEqual(res.send.firstCall.args[0], expected);
    });
  });

  it('GET Returns 404 when committee is not found', () => {
    stubs['../database'].getCommittee.rejects({ result: { rowCount: 0 } });
    req.params.name = 'test-committee-name';

    return routerActions.getCommittee(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 404);
    });
  });

  it('GET returns 500 when there is a database error', () => {
    stubs['../database'].getCommittee.rejects(new Error('test-database-error'));
    req.params.name = 'test-committee-name';

    return routerActions.getCommittee(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 500);
      assert.deepEqual(res.send.firstCall.args[0], {
        error: 'Unable to complete database transaction',
      });
    });
  });
});
