const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const mock = require('../mock');

const underTestFilename = '../../../src/routes/committee-slots/index.js';

const routerGet = sinon.stub();
const routerActions = {};

const stubs = {
  express: {
    Router: () => ({
      get: routerGet,
    }),
  },
  '../../database': {
    getCommitteeSlotsBySenate: sinon.stub(),
  },
};

describe('Request routing for /committee-slots/senate-division/:shortname', () => {
  let underTest; // eslint-disable-line
  let req;
  let res;

  before(() => {
    underTest = proxyquire(underTestFilename, stubs);
    routerActions.getCommitteeSlotsBySenate = routerGet.firstCall.args[1];
  });

  beforeEach(() => {
    req = mock.request();
    res = mock.response();
  });

  afterEach(() => {
    routerGet.resetHistory();

    stubs['../../database'].getCommitteeSlotsBySenate.resetHistory();
  });

  it('GET returns 200 when slot-requirements are retrieved from database', () => {
    const slotRequirements = [
      { committee_id: 1, slot_requirements: 2 },
      { committee_id: 2, slot_requirements: 5 },
    ];

    req.params.shortname = 'AO';

    stubs['../../database'].getCommitteeSlotsBySenate.resolves(slotRequirements);

    return routerActions.getCommitteeSlotsBySenate(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 200);
      assert.equal(res.send.firstCall.args[0], slotRequirements);
    });
  });

  it('GET returns 404 when there are no slot requirements', () => {
    req.params.shortname = 'AO';

    stubs['../../database'].getCommitteeSlotsBySenate.resolves([]);

    return routerActions.getCommitteeSlotsBySenate(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 404);
    });
  });

  it('GET returns 400 when senate short name is missing from route parameters', () => {
    stubs['../../database'].getCommitteeSlotsBySenate.resolves([]);

    return routerActions.getCommitteeSlotsBySenate(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 400);
    });
  });

  it('GET returns 500 when there is a database error', () => {
    req.params.shortname = 'AO';

    stubs['../../database'].getCommitteeSlotsBySenate.rejects(
      new Error('test-error')
    );

    return routerActions.getCommitteeSlotsBySenate(req, res).then(() => {
      assert.equal(res.status.firstCall.args[0], 500);
    });
  });
});
