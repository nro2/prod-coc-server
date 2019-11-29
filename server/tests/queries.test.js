const {
  getFaculty,
  getCommittees,
  addFaculty,
  loadDatabaseConnection,
} = require('../routes/queries');
const sinon = require('sinon');

describe('test queries', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('Should get faculty', async () => {
    const db = loadDatabaseConnection();

    const middlewareReq = { query: { firstName: 'Lin' } };
    const middlewareRes = {
      status: sinon.stub().returnsThis(),
      send: sinon.stub(),
    };
    const middlewareData = {
      first_name: 'Lin',
      last_name: 'Du',
      phone_number: 123,
    };
    const oneStub = sinon.stub(db, 'one').resolves(middlewareData);

    await getFaculty(middlewareReq, middlewareRes);
    sinon.assert.calledWith(middlewareRes.status, 200);
    sinon.assert.calledWith(middlewareRes.send, {
      firstName: 'Lin',
      lastName: 'Du',
      phoneNum: 123,
    });
    sinon.assert.calledWith(oneStub, 'SELECT * FROM users WHERE first_name= $1', [
      'Lin',
    ]);
  });

  it('should call error handler middleware when getting faculty', async () => {
    const db = loadDatabaseConnection();
    const middlewareReq = { query: { firstName: 'Lin' } };
    const middlewareRes = {
      status: sinon.stub().returnsThis(),
      send: sinon.stub()
    };
    const middlewareNext = sinon.stub()
    const middlewareError = new Error('connect error');
    const oneStub = sinon.stub(db, 'one').rejects(middlewareError);

    await getFaculty(middlewareReq, middlewareRes, middlewareNext);
    sinon.assert.calledWith(middlewareNext,'connect error');
    sinon.assert.calledWith(oneStub, 'SELECT * FROM users WHERE first_name= $1', [
      'Lin',
    ]);
  });

  it('Should get committees', async () => {
    const db = loadDatabaseConnection();
    const middlewareReq = sinon.stub();
    const middlewareRes = {
      status: sinon.stub().returnsThis(),
      send: sinon.stub(),
    };
    const middlewareNext = sinon.stub();
    const middlewareData = {
      committees: ['Biology Committee', 'Physics Commitee'],
    };
    const anyStub = sinon.stub(db, 'any').resolves(middlewareData);

    await getCommittees(middlewareReq, middlewareRes, middlewareNext);
    sinon.assert.calledWith(middlewareRes.status, 200);
    sinon.assert.calledWith(middlewareRes.send, {
      committees: ['Biology Committee', 'Physics Commitee'],
    });
    sinon.assert.calledWith(anyStub, 'SELECT * FROM all_committees');
  });

  it('should call error handler middleware when getting committees', async () => {
    const db = loadDatabaseConnection();
    const middlewareReq = sinon.stub();
    const middlewareRes = {
      status: sinon.stub().returnsThis(),
      send: sinon.stub(),
    };
    const middlewareNext = sinon.stub();
    const middlewareError = new Error('connect error');
    const anyStub = sinon.stub(db, 'any').rejects(middlewareError);

    await getCommittees(middlewareReq, middlewareRes, middlewareNext);
    sinon.assert.calledWith(middlewareNext, 'connect error');
    sinon.assert.calledWith(anyStub, 'SELECT * FROM all_committees');
  });

  it('Should add faculty', async () => {
    const db = loadDatabaseConnection();
    const middlewareReq = {
      body: { firstName: 'Lin', lastName: 'Du', phoneNum: 123 },
    };
    const middlewareRes = {
      status: sinon.stub().returnsThis(),
      send: sinon.stub(),
    };
    const middlewareNext = sinon.stub();
    const noneStub = sinon.stub(db, 'none').resolves('Data insert was a success');

    await addFaculty(middlewareReq, middlewareRes, middlewareNext);
    sinon.assert.calledWith(middlewareRes.status, 200);
    sinon.assert.calledWith(middlewareRes.send, 'Data insert was a success');
    sinon.assert.calledWith(
      noneStub,
      'INSERT INTO users(first_name, last_name, phone_number) values($1, $2, $3)',
      ['Lin', 'Du', 123]
    );
  });

  it('should call error handler middleware when adding faculty', async () => {
    const db = loadDatabaseConnection();
    const middlewareReq = {
      body: { firstName: 'Lin', lastName: 'Du', phoneNum: 123 },
    };
    const middlewareRes = {
      status: sinon.stub().returnsThis(),
      send: sinon.stub(),
    };
    const middlewareNext = sinon.stub();
    const middlewareError = new Error('connect error');
    const noneStub = sinon.stub(db, 'none').rejects(middlewareError);

    await addFaculty(middlewareReq, middlewareRes, middlewareNext);
    sinon.assert.calledWith(middlewareNext, 'connect error');
    sinon.assert.calledWith(
      noneStub,
      'INSERT INTO users(first_name, last_name, phone_number) values($1, $2, $3)',
      ['Lin', 'Du', 123]
    );
  });
});
