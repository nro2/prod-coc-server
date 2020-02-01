const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const underTestFilename = '../../../src/database/queries.js';

const stubs = {
  any: sinon.stub(),
  many: sinon.stub(),
  none: sinon.stub(),
  one: sinon.stub(),
  oneOrNone: sinon.stub(),
  result: sinon.stub(),
  tx: sinon.stub(),
  pgp: sinon.stub(),
};

const pgp = () => ({
  helpers: {
    insert: stubs.pgp,
  },
});

const connection = () => ({
  any: stubs.any,
  many: stubs.many,
  none: stubs.none,
  one: stubs.one,
  oneOrNone: stubs.oneOrNone,
  result: stubs.result,
  tx: stubs.tx,
  $config: {
    pgp: pgp.helpers,
  },
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
    stubs.many.resetHistory();
    stubs.none.resetHistory();
    stubs.one.resetHistory();
    stubs.pgp.resetHistory();
    stubs.oneOrNone.resetHistory();
    stubs.result.resetHistory();
    stubs.tx.resetHistory();
    sinon.restore();
  });

  describe('addCommittee', () => {
    it('returns committeeId when query is successful', async () => {
      const committeeId = 42;
      stubs.one.resolves(committeeId);

      const result = await underTest.addCommittee(
        'test-committee-name',
        'test-committee-description',
        3
      );

      assert.equal(result, committeeId);
    });
  });

  describe('addCommitteeAssignment', () => {
    it('returns email when query is successful', async () => {
      const email = 'test-email';
      stubs.one.resolves(email);

      const result = await underTest.addCommitteeAssignment(
        email,
        42,
        '2030-01-01',
        '2050-01-01'
      );

      assert.equal(result, email);
    });
  });

  describe('addDepartmentAssociation', () => {
    it('returns email when query is successful', async () => {
      const email = 'test-email';
      stubs.one.resolves(email);

      const result = await underTest.addDepartmentAssociation(email, 1);

      assert.equal(result, email);
    });
  });

  describe('addCommitteeSlots', () => {
    it('returns committeeId when query is successful', async () => {
      const committeeId = 42;
      stubs.one.resolves(committeeId);

      const result = await underTest.addCommitteeSlots(
        1,
        'test-senate-division',
        3
      );

      assert.equal(result, committeeId);
    });
  });

  describe('deleteCommitteeAssignment', () => {
    it('returns one row affected when query is successful', async () => {
      const id = 42;
      const email = 'test-email';
      const expected = {
        rowCount: 1,
      };
      stubs.result.resolves(expected);

      const result = await underTest.deleteCommitteeAssignment(id, email);

      assert.deepEqual(result, expected);
    });

    it('returns no rows affected there are no query results', async () => {
      const id = 42;
      const email = 'test-email';
      const expected = {
        rowCount: 0,
      };
      await stubs.result.resolves(expected);

      const result = await underTest.deleteCommitteeAssignment(id, email);

      assert.deepEqual(result, expected);
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

  describe('Faculty Query Tests', () => {
    describe('addFaculty', () => {
      it('returns email when query is successful without dept', async () => {
        const email = 'test-email';

        stubs.tx.yields();
        stubs.one.resolves('test-email');

        const result = await underTest.addFaculty(
          'test-full-name',
          'test-email',
          'test-job-title',
          'test-phone-num',
          'test-senate-division'
        );

        assert.equal(result, email);
      });

      it('returns email when query is successful with dept', async () => {
        const email = 'test-email';

        stubs.tx.yields();
        stubs.one.resolves('test-email');

        const result = await underTest.addFaculty(
          'test-full-name',
          'test-email',
          'test-job-title',
          'test-phone-num',
          'test-senate-division',
          'test-department-associations'
        );

        assert.equal(result, email);
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

    describe('getAllFaculty', () => {
      it('returns data when query is successful', async () => {
        const expected = {
          full_name: 'test-full-name',
          email: 'test-email',
        };

        stubs.any.resolves(expected);
        const result = await underTest.getAllFaculty();

        assert.deepEqual(result, expected);
      });

      it('returns empty array when there are no query results', async () => {
        await stubs.any.resolves([]);

        const result = await underTest.getAllFaculty();

        assert.deepEqual(result, []);
      });
    });

    describe('getFaculty', () => {
      it('returns faculty member when query is successful', async () => {
        const email = 'test-full-email';
        const expected = {
          email: 'stub-full-email',
          full_name: 'stub-full-name',
          phone_num: 'stub-phone-num',
          job_title: 'stub-job-title',
          senate_division_short_name: 'stub-senate-short-name',
        };

        stubs.oneOrNone.resolves({
          email: 'stub-full-email',
          full_name: 'stub-full-name',
          phone_num: 'stub-phone-num',
          job_title: 'stub-job-title',
          senate_division_short_name: 'stub-senate-short-name',
        });

        const result = await underTest.getFaculty(email);

        assert.deepEqual(result, expected);
      });

      it('returns empty array when there are no query results', async () => {
        const email = 'test-full-email';
        await stubs.oneOrNone.resolves([]);

        const result = await underTest.getFaculty(email);

        assert.deepEqual(result, []);
      });
    });

    describe('getFacultyInfo', () => {
      it('returns faculty member when query is successful', async () => {
        const email = 'test-full-email';

        const expected = {
          full_name: 'stub-test-name',
          email: 'test-full-email',
          phone_num: 'stub-test-phone',
          job_title: 'stub-test-title',
          senate_division_short_name: 'stub-test-senate',
          departments: [
            {
              department_id: 1,
              name: 'stub-test-dept-name',
              description: 'stub-test-dept-desc',
            },
          ],
          committees: [
            {
              committee_id: 8,
              start_date: '2019-01-01',
              end_date: '2020-01-01',
              name: 'stub-test-committee-name',
              description: 'stub-test-committee-desc',
              total_slots: 10,
            },
          ],
          surveys: {
            survey_date: '2019-01-01',
            is_interested: true,
            expertise: 'stub-test-survey-expertise',
            choices: [
              {
                choice_id: 1,
                committee_id: 1,
                name: 'stub-test-choice-name',
                description: 'stub-test-choice-desc',
                total_slots: 10,
              },
            ],
          },
        };

        stubs.oneOrNone.resolves({
          full_name: 'stub-test-name',
          email: 'test-full-email',
          phone_num: 'stub-test-phone',
          job_title: 'stub-test-title',
          senate_division_short_name: 'stub-test-senate',
          departments: [
            {
              department_id: 1,
              name: 'stub-test-dept-name',
              description: 'stub-test-dept-desc',
            },
          ],
          committees: [
            {
              committee_id: 8,
              start_date: '2019-01-01',
              end_date: '2020-01-01',
              name: 'stub-test-committee-name',
              description: 'stub-test-committee-desc',
              total_slots: 10,
            },
          ],
          surveys: {
            survey_date: '2019-01-01',
            is_interested: true,
            expertise: 'stub-test-survey-expertise',
            choices: [
              {
                choice_id: 1,
                committee_id: 1,
                name: 'stub-test-choice-name',
                description: 'stub-test-choice-desc',
                total_slots: 10,
              },
            ],
          },
        });

        const result = await underTest.getFacultyInfo(email);

        assert.deepEqual(result, expected);
      });

      it('returns empty array when there are no query results', async () => {
        const email = 'test-full-email';
        await stubs.oneOrNone.resolves([]);

        const result = await underTest.getFacultyInfo(email);

        assert.deepEqual(result, []);
      });
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

  describe('getCommittee', () => {
    let expected;
    beforeEach(() => {
      expected = {
        committee_id: 1,
        name: 'Committee on Space Exploration',
        description: 'exploring space stuff',
      };
    });

    it('returns nothing when query has no parameters', async () => {
      stubs.one.resolves();
      const result = await underTest.getCommittee(1);
      assert.equal(result, undefined);
    });

    it('returns committee info when queried with a parameter', async () => {
      stubs.one.resolves(expected);
      const result = await underTest.getCommittee(1);
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

  describe('getSurveyChoice', () => {
    it('returns nothing when query has no parameters', async () => {
      stubs.many.resolves();

      const result = await underTest.getSurveyChoice();

      assert.equal(result, undefined);
    });

    it('returns data when query is successful', async () => {
      const date = '2050';
      const email = 'test-email';
      const expected = [
        {
          choice_id: 1,
          survey_date: '2050-01-01T08:00:00.000Z',
          email: 'test-email',
          committee_id: 1,
        },
      ];
      stubs.many.resolves(expected);

      const result = await underTest.getSurveyChoice(date, email);

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
      const expected = {
        year: 2019,
        email: 'faculty@pdx.edu',
      };
      stubs.one.resolves(expected);

      const result = await underTest.addSurveyData(
        '2019-01-01',
        expected.email,
        true,
        'Im a faculty member'
      );

      assert.deepEqual(result, expected);
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

  describe('Get survey data', () => {
    let expected;
    beforeEach(() => {
      expected = {
        survey_date: 'stub-survey-date',
        email: 'stub-email',
        is_interested: true,
        expertise: 'stub-expertise',
      };
    });

    it('returns nothing when when query has no parameters', async () => {
      stubs.one.resolves();
      const result = await underTest.getSurveyData();
      assert.equal(result, undefined);
    });

    it('returns data when query is successful', async () => {
      stubs.one.resolves(expected);
      const result = await underTest.getSurveyData(2019, 'boat@gmail.com');
      assert.equal(result, expected);
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

  describe('getCommitteeInfo', () => {
    it('returns committee when query is successful', async () => {
      const id = 900;
      const expected = {
        name: 'stub-committee-name',
        id: 900,
        description: 'stub-committee-description',
        totalSlots: 10,
        committeeSlots: [
          {
            senateShortname: 'stub-test-senate-short-name',
            slotMinimum: 0,
            slotFilled: 20,
            slotsRemaining: 0,
          },
        ],
        committeeAssignment: [
          {
            facultyName: 'stub-faculty-name',
            facultyEmail: 'stub-faculty-email',
            startDate: '2019-1-15',
            endDate: '2020-10-15',
            senateDivsion: 'stub-test-senate-division',
          },
        ],
      };

      stubs.oneOrNone.resolves({
        name: 'stub-committee-name',
        id: 900,
        description: 'stub-committee-description',
        totalSlots: 10,
        committeeSlots: [
          {
            senateShortname: 'stub-test-senate-short-name',
            slotMinimum: 0,
            slotFilled: 20,
            slotsRemaining: 0,
          },
        ],
        committeeAssignment: [
          {
            facultyName: 'stub-faculty-name',
            facultyEmail: 'stub-faculty-email',
            startDate: '2019-1-15',
            endDate: '2020-10-15',
            senateDivsion: 'stub-test-senate-division',
          },
        ],
      });
      const result = await underTest.getCommitteeInfo(id);
      assert.deepEqual(result, expected);
    });

    it('returns empty array when there are no query results', async () => {
      const id = 900;
      stubs.oneOrNone.resolves([]);
      const result = await underTest.getCommitteeInfo(id);
      assert.deepEqual(result, []);
    });
  });
});
