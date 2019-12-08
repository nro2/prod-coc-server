const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const underTestFilename = '../../database/queries.js';

const stubs = {
  any: sinon.stub(),
  none: sinon.stub(),
  one: sinon.stub(),
};

const pgp = () => ({
  any: stubs.any,
  none: stubs.none,
  one: stubs.one,
});

describe('Database queries', () => {
  let underTest;

  beforeEach(() => {
    underTest = proxyquire(underTestFilename, { 'pg-promise': () => pgp });
    sinon.stub(console, 'log');
  });

  afterEach(() => {
    stubs.one.resetHistory();
    sinon.restore();
  });

  describe('getFaculty', () => {
    it('returns data when query is successful', async () => {
      const firstName = 'test-first-name';
      const expected = {
        firstName: 'stub-first-name',
        lastName: 'stub-last-name',
        phoneNum: 'stub-phone-number',
      };
      stubs.one.resolves({
        first_name: 'stub-first-name',
        last_name: 'stub-last-name',
        phone_number: 'stub-phone-number',
      });

      const result = await underTest.getFaculty(firstName);

      assert.deepEqual(result, expected);
    });

    it('returns undefined when query is unsuccessful', async () => {
      const firstName = 'test-first-name';
      await stubs.one.rejects(new Error('test-error'));

      const result = await underTest.getFaculty(firstName);

      assert.equal(result, undefined);
    });
  });

  describe('getCommittees', () => {
    it('returns data when query is successful', async () => {
      const expected = [
        {
          name: 'stub-name1',
          committee_id: 'stub-committee_id1',
        },
        {
          name: 'stub-name2',
          committee_id: 'stub-committee_id2',
        },
      ];
      stubs.any.resolves([
        {
          name: 'stub-name1',
          committee_id: 'stub-committee_id1',
        },
        {
          name: 'stub-name2',
          committee_id: 'stub-committee_id2',
        },
      ]);

      const result = await underTest.getCommittees();

      assert.deepEqual(result, expected);
    });

    it('returns undefined when query is unsuccessful', async () => {
      await stubs.any.rejects(new Error('test-error'));

      const result = await underTest.getCommittees();

      assert.equal(result, undefined);
    });
  });
  describe('getDepartments', () => {
    it('returns data when query is successful', async () => {
      stubs.any.resolves('department-name');

      const result = await underTest.getDepartments();

      assert.equal(result, 'department-name');
    });

    it('returns undefined when query is unsuccessful', async () => {
      stubs.any.rejects(new Error('test-error'));

      const result = await underTest.getDepartments();

      assert.equal(result, undefined);
    });
  });
  describe('addFaculty', () => {
    it('returns nothing when query is successful', async () => {
      stubs.none.resolves();

      const result = await underTest.addFaculty(
        'test-full-name',
        'test-email',
        'test-job-title',
        'test-senate-division',
        1
      );

      assert.equal(result, undefined);
    });
  });
});
