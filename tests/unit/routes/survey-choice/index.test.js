const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const mock = require('../mock');

const underTestFilename = '../../../../src/routes/survey-choice/index.js';

const routerGet = sinon.stub();
const routerActions = {};

const stubs = {
  express: {
    Router: () => ({
      get: routerGet,
    }),
  },
  '../../database': {
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
  });

  beforeEach(() => {
    req = mock.request();
    res = mock.response();
  });

  afterEach(() => {
    routerGet.resetHistory();

    stubs['../../database'].getSurveyChoice.resetHistory();
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
    stubs['../../database'].getSurveyChoice.resolves(surveyChoices);

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
    stubs['../../database'].getSurveyChoice.rejects({ result: { rowCount: 0 } });

    return routerActions.getSurveyChoice(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 404);
    });
  });

  it('GET returns 500 when there is an error getting survey choices from database', () => {
    req.params = {
      date: '2019',
      email: 'test-email',
    };
    stubs['../../database'].getSurveyChoice.rejects(new Error('test-error'));

    return routerActions.getSurveyChoice(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 500);
      assert.deepEqual(res.send.firstCall.args[0], {
        error: 'Unable to complete database transaction',
      });
    });
  });
});
