const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const underTestFilename = '../../src/database/queries.js';

const stubs = {
  any: sinon.stub(),
  none: sinon.stub(),
  one: sinon.stub(),
};

const connection = () => ({
  any: stubs.any,
  none: stubs.none,
  one: stubs.one,
});

describe('Database queries', () => {
  let underTest;

  beforeEach(() => {
    underTest = proxyquire(underTestFilename, {
      './connection': {
        loadDatabaseConnection: connection,
      },
    });
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

  describe('getDepartmentAssociationsByDepartment', () => {
    it('returns data when query is successful', async () => {
      const departmentId = 42;
      stubs.any.resolves([
        {
          email: 'test-email',
          department_id: departmentId,
        },
      ]);
      const expected = {
        department_id: 42,
        emails: ['test-email'],
      };

      const result = await underTest.getDepartmentAssociationsByDepartment(
        departmentId
      );

      assert.deepEqual(result, expected);
    });

    it('returns empty array when query returns no results', async () => {
      const departmentId = 42;
      stubs.any.resolves([]);

      const result = await underTest.getDepartmentAssociationsByDepartment(
        departmentId
      );

      assert.equal(result.length, 0);
    });

    it('returns list of emails grouped by id', async () => {
      const departmentId = 42;
      stubs.any.resolves([
        {
          email: 'test-email-foo',
          department_id: departmentId,
        },
        {
          email: 'test-email-bar',
          department_id: departmentId,
        },
      ]);
      const expected = {
        department_id: 42,
        emails: ['test-email-foo', 'test-email-bar'],
      };

      const result = await underTest.getDepartmentAssociationsByDepartment(
        departmentId
      );

      assert.deepEqual(result, expected);
    });
  });

  describe('getDepartmentAssociationsByFaculty', () => {
    it('returns data when query is successful', async () => {
      stubs.any.resolves([
        {
          email: 'test-email',
          department_id: 1,
        },
      ]);
      const expected = {
        email: 'test-email',
        department_ids: [1],
      };

      const result = await underTest.getDepartmentAssociationsByFaculty();

      assert.deepEqual(result, expected);
    });

    it('returns empty array when query returns no results', async () => {
      stubs.any.resolves([]);

      const result = await underTest.getDepartmentAssociationsByFaculty();

      assert.equal(result.length, 0);
    });

    it('returns list of ids grouped by email', async () => {
      stubs.any.resolves([
        {
          email: 'test-email',
          department_id: 1,
        },
        {
          email: 'test-email',
          department_id: 2,
        },
      ]);
      const expected = {
        email: 'test-email',
        department_ids: [1, 2],
      };

      const result = await underTest.getDepartmentAssociationsByFaculty();

      assert.deepEqual(result, expected);
    });
  });

  describe('addFaculty', () => {
    it('returns nothing when query is successful', async () => {
      stubs.none.resolves();

      const result = await underTest.addFaculty(
        'test-full-name',
        'test-email',
        'test-job-title',
        'test-phone-num',
        'test-senate-division',
        1
      );

      assert.equal(result, undefined);
    });
  });

  describe('getDepartment', () => {
    let expected;
    beforeEach(() => {
      expected = {
        department_id: 1,
        name: 'Computer Science Department',
        description: 'Computer sci stuff',
      };
    });

    it('returns nothing when when query has no parameters', async () => {
      stubs.one.resolves();
      const result = await underTest.getDepartment(1);
      assert.equal(result, undefined);
    });

    it('returns department info when queried with a parameter', async () => {
      stubs.one.resolves(expected);

      const result = await underTest.getDepartment(1);
      assert.deepEqual(result, expected);
    });
  });

  describe('Get slot requirements by senate division', () => {
    let expected;
    beforeEach(() => {
      expected = [
        { committee_id: 1, slot_requirements: 2 },
        { committee_id: 2, slot_requirements: 5 },
      ];
    });

    it('returns nothing when query has no parameters', async () => {
      stubs.any.resolves();

      const result = await underTest.getCommitteeSlotsBySenate();

      assert.equal(result, undefined);
    });

    it('returns data when query is successful', async () => {
      stubs.any.resolves(expected);

      const result = await underTest.getCommitteeSlotsBySenate('AO');

      assert.deepEqual(result, expected);
    });
  });

  describe('Get slot requirements by committee id', () => {
    let expected;
    beforeEach(() => {
      expected = [
        { senate_division_short_name: 'AO', slot_requirements: 2 },
        { senate_division_short_name: 'BQ', slot_requirements: 5 },
      ];
    });

    it('returns nothing when query has no parameters', async () => {
      stubs.any.resolves();

      const result = await underTest.getCommitteeSlotsByCommittee();

      assert.equal(result, undefined);
    });

    it('returns data when query is successful', async () => {
      stubs.any.resolves(expected);

      const result = await underTest.getCommitteeSlotsByCommittee(1);

      assert.deepEqual(result, expected);
    });
  });
});
