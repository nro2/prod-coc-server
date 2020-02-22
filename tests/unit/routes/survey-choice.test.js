const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const mock = require('./mock');

const underTestFilename = '../../../src/routes/survey-choice.js';

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
  '../database': {
    addSurveyChoice: sinon.stub(),
    getSurveyChoice: sinon.stub(),
  },
};

describe('Request routing for /survey-choices', () => {
  let underTest; // eslint-disable-line
  let req;
  let res;

  before(() => {
    underTest = proxyquire(underTestFilename, stubs);
    routerActions.getSurveyChoice = routerGet.firstCall.args[1];
    routerActions.postSurveyChoice = routerPost.firstCall.args[1];
  });

  beforeEach(() => {
    req = mock.request();
    res = mock.response();
  });

  afterEach(() => {
    routerGet.resetHistory();

    stubs['../database'].addSurveyChoice.resetHistory();
    stubs['../database'].getSurveyChoice.resetHistory();
  });

  it('GET returns 200 when survey choices are retrieved from database', () => {
    req.params = {
      date: '2019',
      email: 'test-email',
    };
    const surveyChoices = [
      {
        choice_id: 1,
        survey_date: '2019-01-01',
        email: 'test-email',
        committee_id: 1,
      },
    ];
    stubs['../database'].getSurveyChoice.resolves(surveyChoices);

    return routerActions.getSurveyChoice(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 200);
      assert.equal(res.send.firstCall.args[0], surveyChoices);
    });
  });

  it('GET returns 404 when there are no survey choices in the database', () => {
    req.params = {
      date: '2019',
      email: 'test-email',
    };
    stubs['../database'].getSurveyChoice.rejects({ result: { rowCount: 0 } });

    return routerActions.getSurveyChoice(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 404);
    });
  });

  it('GET returns 500 when there is an error getting survey choices from database', () => {
    req.params = {
      date: '2019',
      email: 'test-email',
    };
    stubs['../database'].getSurveyChoice.rejects(new Error('test-error'));

    return routerActions.getSurveyChoice(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 500);
      assert.deepEqual(res.send.firstCall.args[0], {
        message: 'Internal Server Error',
        error: 'test-error',
      });
    });
  });

  it('POST returns 201 when faculty is added to database', () => {
    req.body = {
      choiceId: 1,
      surveyDate: '2019-01-01',
      email: 'test-email',
      committeeId: 1,
    };
    stubs['../database'].addSurveyChoice.resolves(true);

    return routerActions.postSurveyChoice(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 201);
    });
  });

  it('POST returns 400 when missing choiceId in request body', () => {
    req.body = {
      surveyDate: '2019-01-01',
      email: 'test-email',
      committeeId: 1,
    };

    return routerActions.postSurveyChoice(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 400);
      assert.deepEqual(res.send.firstCall.args[0], {
        message: 'Bad Request',
      });
    });
  });

  it('POST returns 400 when missing surveyDate in request body', () => {
    req.body = {
      choiceId: 1,
      email: 'test-email',
      committeeId: 1,
    };

    return routerActions.postSurveyChoice(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 400);
      assert.deepEqual(res.send.firstCall.args[0], {
        message: 'Bad Request',
      });
    });
  });

  it('POST returns 400 when missing email in request body', () => {
    req.body = {
      choiceId: 1,
      surveyDate: '2019-01-01',
      committeeId: 1,
    };

    return routerActions.postSurveyChoice(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 400);
      assert.deepEqual(res.send.firstCall.args[0], {
        message: 'Bad Request',
      });
    });
  });

  it('POST returns 400 when missing committeeId in request body', () => {
    req.body = {
      choiceId: 1,
      surveyDate: '2019-01-01',
      email: 'test-email',
    };

    return routerActions.postSurveyChoice(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 400);
      assert.deepEqual(res.send.firstCall.args[0], {
        message: 'Bad Request',
      });
    });
  });

  it('POST returns 409 when primary key already exists in the database', () => {
    req.body = {
      choiceId: 1,
      surveyDate: '2019-01-01',
      email: 'test-email',
      committeeId: 1,
    };
    stubs['../database'].addSurveyChoice.rejects({ code: '23505' });

    return routerActions.postSurveyChoice(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 409);
    });
  });

  it('POST returns 409 when foreign key does not exist in the database', () => {
    req.body = {
      choiceId: 1,
      surveyDate: '2019-01-01',
      email: 'test-email',
      committeeId: 1,
    };
    stubs['../database'].addSurveyChoice.rejects({ code: '23503' });

    return routerActions.postSurveyChoice(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 409);
    });
  });

  it('POST returns 500 when unable to add survey choice to database', () => {
    req.body = {
      choiceId: 1,
      surveyDate: '2019-01-01',
      email: 'test-email',
      committeeId: 1,
    };
    stubs['../database'].addSurveyChoice.rejects(new Error('test-error'));

    return routerActions.postSurveyChoice(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 500);
      assert.deepEqual(res.send.firstCall.args[0], {
        message: 'Internal Server Error',
        error: 'test-error',
      });
    });
  });
});
