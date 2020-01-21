const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const mock = require('./mock');

const underTestFilename = '../../../src/routes/faculty.js';

const routerPost = sinon.stub();
const routerPut = sinon.stub();
const routerGet = sinon.stub();
const routerActions = {};

const stubs = {
  express: {
    Router: () => ({
      post: routerPost,
      put: routerPut,
      get: routerGet,
    }),
  },
  '../database': {
    addFaculty: sinon.stub(),
    updateFaculty: sinon.stub(),
    getAllFaculty: sinon.stub(),
    getFaculty: sinon.stub(),
    getFacultyInfo: sinon.stub(),
    FOREIGN_KEY_VIOLATION: '23503',
    UNIQUENESS_VIOLATION: '23505',
  },
};

describe('Request routing for /faculty', () => {
  let underTest; // eslint-disable-line
  let req;
  let res;

  before(() => {
    underTest = proxyquire(underTestFilename, stubs);
    routerActions.postFaculty = routerPost.firstCall.args[1];
    routerActions.putFaculty = routerPut.firstCall.args[1];
    routerActions.getAllFaculty = routerGet.firstCall.args[1];
    routerActions.getFaculty = routerGet.secondCall.args[1];
    routerActions.getFacultyInfo = routerGet.thirdCall.args[1];
  });

  beforeEach(() => {
    req = mock.request();
    res = mock.response();
  });

  afterEach(() => {
    routerPost.resetHistory();
    routerPut.resetHistory();
    routerGet.resetHistory();
    stubs['../database'].addFaculty.resetHistory();
    stubs['../database'].updateFaculty.resetHistory();
    stubs['../database'].getAllFaculty.resetHistory();
    stubs['../database'].getFaculty.resetHistory();
    stubs['../database'].getFacultyInfo.resetHistory();
  });

  describe('Insert Tests (POST)', () => {
    it('POST returns 201 when faculty is added to database without dept associations', () => {
      req.body = {
        fullName: 'test-full-name',
        email: 'test-email',
        jobTitle: 'test-job-title',
        phoneNum: 'test-phone-num',
        senateDivision: 'test-senate-division',
      };
      stubs['../database'].addFaculty.resolves(true);

      return routerActions.postFaculty(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 201);
      });
    });

    it('POST returns 201 when faculty is added to database WITH dept associations', () => {
      req.body = {
        fullName: 'test-full-name',
        email: 'test-email',
        jobTitle: 'test-job-title',
        phoneNum: 'test-phone-num',
        senateDivision: 'test-senate-division',
        departmentAssociations: [
          {
            department_id: '11',
          },
        ],
      };
      stubs['../database'].addFaculty.resolves(true);

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
      stubs['../database'].addFaculty.rejects({ code: '23505' });

      return routerActions.postFaculty(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 409);
      });
    });

    it('POST returns 409 when foreign key does not exist in the database', () => {
      req.body = {
        fullName: 'test-full-name',
        email: 'test-existing-email',
        jobTitle: 'test-job-title',
        phoneNum: 'test-phone-num',
        senateDivision: 'test-senate-division',
      };
      stubs['../database'].addFaculty.rejects({ code: '23503' });

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
      stubs['../database'].addFaculty.rejects(new Error('test-database-error'));

      return routerActions.postFaculty(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 500);
        assert.deepEqual(res.send.firstCall.args[0], {
          error: 'Unable to complete database transaction',
        });
      });
    });
  });

  describe('Update Tests (PUT)', () => {
    it('PUT returns 200 when faculty is updated in the database', () => {
      req.body = {
        fullName: 'test-full-name',
        email: 'test-email',
        jobTitle: 'test-job-title',
        phoneNum: 'test-phone-num',
        senateDivision: 'test-senate-division',
      };
      stubs['../database'].updateFaculty.resolves({ rowCount: 1 });

      return routerActions.putFaculty(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 200);
      });
    });

    it('PUT returns 400 when missing phoneNum in request body', () => {
      req.body = {
        fullName: 'test-full-name',
        email: 'test-email',
        jobTitle: 'test-job-title',
        senateDivision: 'test-senate-division',
      };

      return routerActions.putFaculty(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 400);
        assert.deepEqual(res.send.firstCall.args[0], {
          message: '400 Bad Request',
        });
      });
    });

    it('PUT returns 400 when missing fullName in request body', () => {
      req.body = {
        email: 'test-email',
        jobTitle: 'test-job-title',
        phoneNum: 'test-phone-num',
        senateDivision: 'test-senate-division',
      };

      return routerActions.putFaculty(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 400);
        assert.deepEqual(res.send.firstCall.args[0], {
          message: '400 Bad Request',
        });
      });
    });

    it('PUT returns 400 when missing email in request body', () => {
      req.body = {
        fullName: 'test-full-name',
        jobTitle: 'test-job-title',
        phoneNum: 'test-phone-num',
        senateDivision: 'test-senate-division',
      };

      return routerActions.putFaculty(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 400);
        assert.deepEqual(res.send.firstCall.args[0], {
          message: '400 Bad Request',
        });
      });
    });

    it('PUT returns 400 when missing jobTitle in request body', () => {
      req.body = {
        fullName: 'test-full-name',
        email: 'test-email',
        phoneNum: 'test-phone-num',
        senateDivision: 'test-senate-division',
      };

      return routerActions.putFaculty(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 400);
        assert.deepEqual(res.send.firstCall.args[0], {
          message: '400 Bad Request',
        });
      });
    });

    it('PUT returns 400 when missing senateDivision in request body', () => {
      req.body = {
        fullName: 'test-full-name',
        email: 'test-email',
        phoneNum: 'test-phone-num',
        jobTitle: 'test-job-title',
      };

      return routerActions.putFaculty(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 400);
        assert.deepEqual(res.send.firstCall.args[0], {
          message: '400 Bad Request',
        });
      });
    });

    it('PUT returns 404 when faculty record did not exist to update', () => {
      req.body = {
        fullName: 'test-full-name',
        email: 'test-email',
        jobTitle: 'test-job-title',
        phoneNum: 'test-phone-num',
        senateDivision: 'test-senate-division',
      };
      stubs['../database'].updateFaculty.resolves({ rowCount: 0 });

      return routerActions.putFaculty(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 404);
      });
    });

    it('PUT returns 500 when unable to update faculty in the database', () => {
      req.body = {
        fullName: 'test-full-name',
        email: 'test-email',
        jobTitle: 'test-job-title',
        phoneNum: 'test-phone-num',
        senateDivision: 'test-senate-division',
      };
      stubs['../database'].updateFaculty.rejects(new Error('test-database-error'));

      return routerActions.putFaculty(req, res).then(() => {
        assert.equal(res.status.firstCall.args[0], 500);
        assert.deepEqual(res.send.firstCall.args[0], {
          error: 'Unable to complete database transaction',
        });
      });
    });
  });

  describe('Select Tests (GET)', () => {
    describe('getAllFaculty', () => {
      it('GET returns 200 when faculty are retrieved from database', () => {
        const faculty = [
          {
            name: 'test-full-name',
            email: 'test-email',
          },
        ];
        stubs['../database'].getAllFaculty.resolves(faculty);

        return routerActions.getAllFaculty(req, res).then(() => {
          assert.equal(res.status.firstCall.args[0], 200);
          assert.equal(res.send.firstCall.args[0], faculty);
        });
      });

      it('GET returns 404 when there are no faculty in the database', () => {
        stubs['../database'].getAllFaculty.resolves([]);

        return routerActions.getAllFaculty(req, res).then(() => {
          assert.equal(res.status.firstCall.args[0], 404);
        });
      });

      it('GET returns 500 when there is a database error', () => {
        stubs['../database'].getAllFaculty.rejects(new Error('test-error'));

        return routerActions.getAllFaculty(req, res).then(() => {
          assert.equal(res.status.firstCall.args[0], 500);
          assert.deepEqual(res.send.firstCall.args[0], {
            error: 'Unable to complete database transaction',
          });
        });
      });
    });

    describe('getFaculty', () => {
      it('GET returns 200 when a specific faculty is returned from the database', () => {
        const faculty_member = {
          email: 'test@email.com',
          full_name: 'Test McBenson',
          phone_num: '111-111-1111',
          job_title: 'Test Job Title',
          senate_division_short_name: 'AO',
        };

        req.params.email = 'wolsborn@pdx.edu';
        stubs['../database'].getFaculty.resolves(faculty_member);

        return routerActions.getFaculty(req, res).then(() => {
          assert.equal(res.status.firstCall.args[0], 200);
          assert.equal(res.send.firstCall.args[0], faculty_member);
        });
      });

      it('GET returns 404 when faculty is not found in the database', () => {
        req.params.email = 'jwolsborn@pdx.edu';
        stubs['../database'].getFaculty.resolves();

        return routerActions.getFaculty(req, res).then(() => {
          assert.equal(res.status.firstCall.args[0], 404);
        });
      });

      it('GET returns 500 when there is a database error', () => {
        req.params.email = 'wolsborn@pdx.edu';
        stubs['../database'].getFaculty.rejects(new Error('test-error'));

        return routerActions.getFaculty(req, res).then(() => {
          assert.equal(res.status.firstCall.args[0], 500);
          assert.deepEqual(res.send.firstCall.args[0], {
            error: 'Unable to complete database transaction',
          });
        });
      });
    });

    describe('getFacultyInfo', () => {
      it('GET returns 200 when a specific faculty info is returned from the database', () => {
        const faculty_member = {
          email: 'test@email.com',
          full_name: 'Test McBenson',
          phone_num: '111-111-1111',
          job_title: 'Test Job Title',
          senate_division_short_name: 'AO',
        };

        req.params.email = 'wolsborn@pdx.edu';
        stubs['../database'].getFacultyInfo.resolves(faculty_member);

        return routerActions.getFacultyInfo(req, res).then(() => {
          assert.equal(res.status.firstCall.args[0], 200);
          assert.equal(res.send.firstCall.args[0], faculty_member);
        });
      });

      it('GET returns 404 when faculty is not found in the database', () => {
        req.params.email = 'jwolsborn@pdx.edu';
        stubs['../database'].getFacultyInfo.resolves();

        return routerActions.getFacultyInfo(req, res).then(() => {
          assert.equal(res.status.firstCall.args[0], 404);
        });
      });

      it('GET returns 500 when there is a database error', () => {
        req.params.email = 'wolsborn@pdx.edu';
        stubs['../database'].getFacultyInfo.rejects(new Error('test-error'));

        return routerActions.getFacultyInfo(req, res).then(() => {
          assert.equal(res.status.firstCall.args[0], 500);
          assert.deepEqual(res.send.firstCall.args[0], {
            error: 'Unable to complete database transaction',
          });
        });
      });
    });
  });
});
