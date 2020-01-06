const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const underTestFilename = '../../../src/database/queries.js';

const stubs = {
  any: sinon.stub(),
  none: sinon.stub(),
  one: sinon.stub(),
  result: sinon.stub(),
  tx: sinon.stub(),
};

const connection = () => ({
  any: stubs.any,
  none: stubs.none,
  one: stubs.one,
  result: stubs.result,
  tx: stubs.tx,
});

describe('Database queries', () => {
  let underTest;

  before(() => {
    // Suppress UnhandledPromiseRejection logging when running these tests
    process.on('unhandledRejection', () => {});
  });

  beforeEach(() => {
    underTest = proxyquire(underTestFilename, {
      './connection': {
        loadDatabaseConnection: connection,
      },
    });
    sinon.stub(console, 'log');
  });

  afterEach(() => {
    stubs.any.resetHistory();
    stubs.none.resetHistory();
    stubs.one.resetHistory();
    stubs.result.resetHistory();
    stubs.tx.resetHistory();
    sinon.restore();
  });

  describe('addCommittee', () => {
    it('returns nothing when query is successful', async () => {
      stubs.none.resolves();

      const result = await underTest.addCommittee(
        'test-committee-name',
        'test-committee-description',
        3
      );

      assert.equal(result, undefined);
    });
  });

  describe('addCommitteeSlots', () => {
    it('returns nothing when query is successful', async () => {
      stubs.none.resolves();

      const result = await underTest.addCommitteeSlots(
        1,
        'test-senate-division',
        3
      );

      assert.equal(result, undefined);
    });
  });

  describe('getFaculty', () => {
    it('returns data when query is successful', async () => {
      const firstName = 'test-first-name';
      const expected = {
        firstName: 'stub-first-name',
        lastName: 'stub-last-name',
        phoneNum: 'stub-phone-number',
      };
      stubs.one.resolves(expected);

      const result = await underTest.getFaculty(firstName);

      assert.deepEqual(result, expected);
    });

    it('returns empty array when there are no query results', async () => {
      const firstName = 'test-first-name';
      await stubs.one.resolves([]);

      const result = await underTest.getFaculty(firstName);

      assert.deepEqual(result, []);
    });
  });

  describe('getCommittees', () => {
    it('returns data when query is successful', async () => {
      const expected = [
        {
          name: 'test-committee-name',
          committee_id: 1,
        },
      ];
      stubs.any.resolves(expected);

      const result = await underTest.getCommittees();

      assert.deepEqual(result, expected);
    });

    it('returns empty array when there are no query results', async () => {
      await stubs.any.resolves([]);

      const result = await underTest.getCommittees();

      assert.deepEqual(result, []);
    });
  });

  describe('getDepartments', () => {
    it('returns data when query is successful', async () => {
      stubs.any.resolves('department-name');

      const result = await underTest.getDepartments();

      assert.equal(result, 'department-name');
    });

    it('returns empty array when there are no query results', async () => {
      await stubs.any.resolves([]);

      const result = await underTest.getDepartments();

      assert.deepEqual(result, []);
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

  describe('updateCommittee', () => {
    it('returns object when update succeeds', async () => {
      const committeeId = 42;
      const name = 'test-committee-name';
      const description = 'test-committee-description';
      const totalSlots = 3;
      const expected = { rowCount: 1 };

      stubs.tx.yields();
      stubs.result.resolves(expected);

      const result = await underTest.updateCommittee(
        committeeId,
        name,
        description,
        totalSlots
      );

      assert.deepEqual(result, expected);
    });

    it('throws exception when result query errors', async () => {
      const committeeId = 42;
      const name = 'test-committee-name';
      const description = 'test-committee-description';
      const totalSlots = 3;

      stubs.tx.yields();
      await stubs.result.rejects(new Error('test-error'));

      await assert.rejects(
        underTest
          .updateCommittee(committeeId, name, description, totalSlots)
          .catch(() => assert.fail('Should not have failed'))
      );
    });
  });

  describe('updateCommitteeAssignment', () => {
    it('returns object when update succeeds', async () => {
      const email = 'test-email';
      const committeeId = 42;
      const startDate = '1970-01-01';
      const endDate = '2050-01-01';
      const expected = { rowCount: 1 };

      stubs.tx.yields();
      stubs.result.resolves(expected);

      const result = await underTest.updateCommitteeAssignment(
        email,
        committeeId,
        startDate,
        endDate
      );

      assert.deepEqual(result, expected);
    });

    it('throws exception when result query errors', async () => {
      const email = 'test-email';
      const committeeId = 42;
      const startDate = '1970-01-01';
      const endDate = '2050-01-01';

      stubs.tx.yields();
      await stubs.result.rejects(new Error('test-error'));

      await assert.rejects(
        underTest
          .updateCommitteeAssignment(email, committeeId, startDate, endDate)
          .catch(() => assert.fail('Should not have failed'))
      );
    });
  });

  describe('updateCommitteeSlots', () => {
    it('returns object when update succeeds', async () => {
      const id = 1;
      const name = 'test-senate-division';
      const slotRequirements = 3;
      const expected = { rowCount: 1 };

      stubs.tx.yields();
      stubs.result.resolves(expected);

      const result = await underTest.updateCommitteeSlots(
        id,
        name,
        slotRequirements
      );

      assert.deepEqual(result, expected);
    });

    it('throws exception when result query errors', async () => {
      const id = 1;
      const name = 'test-senate-division';
      const slotRequirements = 3;

      stubs.tx.yields();
      await stubs.result.rejects(new Error('test-error'));

      await assert.rejects(
        underTest
          .updateCommitteeSlots(id, name, slotRequirements)
          .catch(() => assert.fail('Should not have failed'))
      );
    });
  });

  describe('updateFaculty', () => {
    it('returns object when update succeeds', async () => {
      const fullName = 'test-full-name';
      const email = 'test-email';
      const jobTitle = 'test-job-title';
      const phoneNum = '555-55-5555';
      const senateDivision = 'test-senate-division';
      const expected = { rowCount: 1 };

      stubs.tx.yields();
      stubs.result.resolves(expected);

      const result = await underTest.updateFaculty(
        fullName,
        email,
        jobTitle,
        phoneNum,
        senateDivision
      );

      assert.deepEqual(result, expected);
    });

    it('throws exception when result query errors', async () => {
      const fullName = 'test-full-name';
      const email = 'test-email';
      const jobTitle = 'test-job-title';
      const phoneNum = '555-55-5555';
      const senateDivision = 'test-senate-division';

      stubs.tx.yields();
      await stubs.result.rejects(new Error('test-error'));

      await assert.rejects(
        underTest
          .updateFaculty(fullName, email, jobTitle, phoneNum, senateDivision)
          .catch(() => assert.fail('Should not have failed'))
      );
    });
  });

  describe('Get senate division by short name', () => {
    let expected;
    beforeEach(() => {
      expected = { senate_division_short_name: 'AO', name: 'All Other Faculty' };
    });

    it('returns nothing when query has no parameters', async () => {
      stubs.one.resolves();

      const result = await underTest.getSenateDivision();

      assert.equal(result, undefined);
    });

    it('returns data when query is successful', async () => {
      stubs.one.resolves(expected);

      const result = await underTest.getSenateDivision('AO');

      assert.equal(result, expected);
    });
  });

  describe('Post survey data', () => {
    it('returns nothing when query is successful', async () => {
      stubs.none.resolves();

      const result = await underTest.addSurveyData(
        2019,
        'faculty@pdx.edu',
        true,
        'Im a faculty member'
      );

      assert.equal(result, undefined);
    });
  });

  describe('Update survey data', () => {
    it('returns object when update succeeds', async () => {
      const surveyData = 2019;
      const email = 'faculty@pdx.edu';
      const interested = true;
      const expertise = 'Im a faculty member';
      const expected = { rowCount: 1 };

      stubs.tx.yields();
      stubs.result.resolves(expected);

      const result = await underTest.updateSurveyData(
        surveyData,
        email,
        interested,
        expertise
      );

      assert.deepEqual(result, expected);
    });

    it('throws exception when result query errors', async () => {
      const surveyData = 2019;
      const email = 'faculty@pdx.edu';
      const interested = true;
      const expertise = 'Im a faculty member';

      stubs.tx.yields();
      await stubs.result.rejects(new Error('test-error'));

      await assert.rejects(
        underTest
          .updateSurveyData(surveyData, email, interested, expertise)
          .catch(() => assert.fail('Should not have failed'))
      );
    });
  });

  describe('Update department association', () => {
    it('Returns object when update succeeds', async () => {
      const email = 'test@test.edu';
      const oldDepartmentId = 1;
      const newDepartmentId = 2;
      const expected = { rowCount: 1 };

      stubs.tx.yields();
      stubs.result.resolves(expected);

      const result = await underTest.updateDepartmentAssociations(
        email,
        oldDepartmentId,
        newDepartmentId
      );

      assert.deepEqual(result, expected);
    });

    it('throws exception when query errors', async () => {
      const email = 'test@test.edu';
      const oldDepartmentId = 1;
      const newDepartmentId = 2;

      stubs.tx.yields();
      await stubs.result.rejects(new Error('test-error'));

      await assert.rejects(
        underTest
          .updateDepartmentAssociations(email, oldDepartmentId, newDepartmentId)
          .catch(() => assert.fail('Should not have failed'))
      );
    });
  });
});
