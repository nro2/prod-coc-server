const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const mock = require('./mock');

const underTestFilename = '../../../src/routes/survey-data.js';

const routerPost = sinon.stub();
const routerPut = sinon.stub();
const routerActions = {};

const stubs = {
  express: {
    Router: () => ({
      put: routerPut,
      post: routerPost,
    }),
  },
  '../database': {
    addSurveyData: sinon.stub(),
    updateSurveyData: sinon.stub(),
    FOREIGN_KEY_VIOLATION: '23503',
    UNIQUENESS_VIOLATION: '23505',
  },
};

describe('Request routing for /survey-data', () => {
  let underTest; // eslint-disable-line
  let req;
  let res;

  before(() => {
    underTest = proxyquire(underTestFilename, stubs);
    routerActions.putSurveyData = routerPut.firstCall.args[1];
    routerActions.postSurveyData = routerPost.firstCall.args[1];
  });

  beforeEach(() => {
    req = mock.request();
    res = mock.response();
  });

  afterEach(() => {
    stubs['../database'].addSurveyData.resetHistory();
    stubs['../database'].updateSurveyData.resetHistory();
  });

  it('PUT returns 200 when survey data is updated in the database', () => {
    req.body = {
      surveyDate: '2019-01-01',
      email: 'test@test.edu',
      isInterested: true,
      expertise: 'TEST',
    };

    stubs['../database'].updateSurveyData.resolves({ rowCount: 1 });

    return routerActions.putSurveyData(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 200);
    });
  });

  it('POST returns 201 when survey data is added to database', () => {
    req.body = {
      surveyDate: '2019-01-01',
      email: 'test@test.edu',
      isInterested: true,
      expertise: 'TEST',
    };
    stubs['../database'].addSurveyData.resolves(true);

    return routerActions.postSurveyData(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 201);
    });
  });

  it('POST returns 400 when missing surveyDate from body', () => {
    req.body = {
      email: 'test@test.edu',
      isInterested: true,
      expertise: 'TEST',
    };

    return routerActions.postSurveyData(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 400);
      assert.deepEqual(res.send.firstCall.args[0], {
        message: '400 Bad Request',
      });
    });
  });

  it('POST returns 400 when missing email from body', () => {
    req.body = {
      surveyDate: '2019-01-01',

      expertise: 'TEST',
    };

    return routerActions.postSurveyData(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 400);
      assert.deepEqual(res.send.firstCall.args[0], {
        message: '400 Bad Request',
      });
    });
  });

  it('POST returns 400 when missing isInterested from body', () => {
    req.body = {
      surveyDate: '2019-01-01',
      email: 'test@test.edu',
      expertise: 'TEST',
    };

    return routerActions.postSurveyData(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 400);
      assert.deepEqual(res.send.firstCall.args[0], {
        message: '400 Bad Request',
      });
    });
  });

  it('POST returns 400 when missing expertise from body', () => {
    req.body = {
      surveyDate: '2019-01-01',
      email: 'test@test.edu',
      isInterested: true,
    };

    return routerActions.postSurveyData(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 400);
      assert.deepEqual(res.send.firstCall.args[0], {
        message: '400 Bad Request',
      });
    });
  });

  it('POST returns 409 when primary key already exists in the database', () => {
    req.body = {
      surveyDate: '2019-01-01',
      email: 'test@test.edu',
      isInterested: true,
      expertise: 'TEST',
    };
    stubs['../database'].addSurveyData.rejects({ code: '23505' });

    return routerActions.postSurveyData(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 409);
    });
  });

  it('POST returns 409 when primary key does not exist in the database', () => {
    req.body = {
      surveyDate: '2019-01-01',
      email: 'test@test.edu',
      isInterested: true,
      expertise: 'TEST',
    };
    stubs['../database'].addSurveyData.rejects({ code: '23503' });

    return routerActions.postSurveyData(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 409);
    });
  });

  it('POST returns 500 when unable to add survey choice to database', () => {
    req.body = {
      surveyDate: '2019-01-01',
      email: 'test@test.edu',
      isInterested: true,
      expertise: 'TEST',
    };
    stubs['../database'].addSurveyData.rejects(new Error('test-database-error'));

    return routerActions.postSurveyData(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 500);
      assert.deepEqual(res.send.firstCall.args[0], {
        error: 'Unable to complete database transaction',
      });
    });
  });
});
