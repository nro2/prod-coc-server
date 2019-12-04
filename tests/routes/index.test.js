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
    routerActions.getRoot = routerGet.firstCall.args[1];
    routerActions.postRoot = routerPost.firstCall.args[1];
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

    it('POST returns 201 when faculty is added to database', () => {
      req.body = {
        firstName: 'test-first-name',
        lastName: 'test-last-name',
        phoneNum: 'test-phone-num',
      };
      stubs['../database/queries'].addFaculty.resolves(true);

      return routerActions.postRoot(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 201);
      });
    });

    it('POST returns 400 when missing firstName in request body', () => {
      req.body = {
        lastName: 'test-last-name',
        phoneNum: 'test-phone-num',
      };

      return routerActions.postRoot(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 400);
        assert.deepEqual(res.send.firstCall.args[0], {
          message: '400 Bad Request',
        });
      });
    });

    it('POST returns 400 when missing lastName in request body', () => {
      req.body = {
        firstName: 'test-first-name',
        phoneNum: 'test-phone-num',
      };

      return routerActions.postRoot(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 400);
        assert.deepEqual(res.send.firstCall.args[0], {
          message: '400 Bad Request',
        });
      });
    });

    it('POST returns 400 when missing phoneNum in request body', () => {
      req.body = {
        firstName: 'test-first-name',
        lastName: 'test-last-name',
      };

      return routerActions.postRoot(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 400);
        assert.deepEqual(res.send.firstCall.args[0], {
          message: '400 Bad Request',
        });
      });
    });

    it('POST returns 500 when unable to add faculty to database', () => {
      req.body = {
        firstName: 'test-first-name',
        lastName: 'test-last-name',
        phoneNum: 'test-phone-num',
      };
      stubs['../database/queries'].addFaculty.resolves(false);

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
      const committees = ['test-first-committee', 'test-second-committee'];
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
});
