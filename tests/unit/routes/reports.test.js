const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const mock = require('./mock');

const underTestFilename = '../../../src/routes/reports.js';

const routerGet = sinon.stub();
const routerActions = {};

const stubs = {
  express: {
    Router: () => ({
      get: routerGet,
    }),
  },
  '../database': {
    getSenateDivisionStats: sinon.stub(),
  },
};

describe('Request routing for /reports', () => {
  let underTest; // eslint-disable-line
  let req;
  let res;

  before(() => {
    underTest = proxyquire(underTestFilename, stubs);
    routerActions.getSenate = routerGet.firstCall.args[1];
  });

  beforeEach(() => {
    req = mock.request();
    res = mock.response();
  });

  afterEach(() => {
    routerGet.resetHistory();

    stubs['../database'].getSenateDivisionStats.resetHistory();
  });

  it('POST returns 200 when stats retrieved from the database', () => {
    const expected = {
      total_slots: 259,
      slots_filled: 18,
      senate_division: [
        {
          senate_division: 'CUPA',
          SlotMinimum: 8,
          SlotsFilled: 0,
          SlotsRemaining: 8,
        },
      ],
    };

    stubs['../database'].getSenateDivisionStats.resolves(expected);
    return routerActions.getSenate(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 200);
      assert.equal(res.send.firstCall.args[0], expected);
    });
  });
});
