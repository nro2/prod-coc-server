const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const underTestFilename = '../../../src/routes/faculty/index.js';

const routerPost = sinon.stub();
const routerActions = {};

const stubs = {
  express: {
    Router: () => ({
      post: routerPost,
    }),
  },
  '../../database': {
    addFaculty: sinon.stub(),
    UNIQUENESS_VIOLATION: '23505',
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

describe('Request routing for /faculty', () => {
  let underTest; // eslint-disable-line
  let req;
  let res;

  before(() => {
    underTest = proxyquire(underTestFilename, stubs);
    routerActions.postFaculty = routerPost.firstCall.args[1];
  });

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
  });

  afterEach(() => {
    routerPost.resetHistory();

    stubs['../../database'].addFaculty.resetHistory();
  });

  it('POST returns 201 when faculty is added to database', () => {
    req.body = {
      fullName: 'test-full-name',
      email: 'test-email',
      jobTitle: 'test-job-title',
      phoneNum: 'test-phone-num',
      senateDivision: 'test-senate-division',
    };
    stubs['../../database'].addFaculty.resolves(true);

    return routerActions.postFaculty(req, res).then(() => {
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

    return routerActions.postFaculty(req, res).then(() => {
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

    return routerActions.postFaculty(req, res).then(() => {
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

    return routerActions.postFaculty(req, res).then(() => {
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

    return routerActions.postFaculty(req, res).then(() => {
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

    return routerActions.postFaculty(req, res).then(() => {
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
    stubs['../../database'].addFaculty.rejects({ code: '23505' });

    return routerActions.postFaculty(req, res).then(() => {
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
    stubs['../../database'].addFaculty.rejects(new Error('test-database-error'));

    return routerActions.postFaculty(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 500);
      assert.deepEqual(res.send.firstCall.args[0], {
        error: 'Unable to complete database transaction',
      });
    });
  });
});
