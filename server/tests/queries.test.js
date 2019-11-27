const {getFaculty, getCommittees, addFaculty,loadDatabaseConnection} = require('../routes/queries');
let sinon = require('sinon');


describe('test queries', ()=>{

    afterEach(() => {
        sinon.restore();
    });

    it('Should get faculty', async ()=>{

        let db = loadDatabaseConnection();

        const mReq = { query: { firstName: "Lin" } };
        const mRes = { status: sinon.stub().returnsThis(), send: sinon.stub() };
        const mNext = sinon.stub();
        const mData = { first_name: "Lin", last_name: "Du", phone_number: 123 };
        const oneStub = sinon.stub(db, "one").resolves(mData);


        await getFaculty(mReq, mRes, mNext);
        sinon.assert.calledWith(mRes.status, 200);
        sinon.assert.calledWith(mRes.send, { firstName: "Lin", lastName: "Du", phoneNum: 123 });
        sinon.assert.calledWith(oneStub, "SELECT * FROM users WHERE first_name= $1", ["Lin"]);
    });

    it("should call error handler middleware when getting faculty", async () => {

        let db = loadDatabaseConnection();
        const mReq = { query: { firstName: "Lin" } };
        const mRes = { status: sinon.stub().returnsThis(), send: sinon.stub() };
        const mNext = sinon.stub();
        const mError = new Error("connect error");
        const oneStub = sinon.stub(db, "one").rejects(mError);

        await getFaculty(mReq, mRes, mNext);
        sinon.assert.calledWith(mNext, mError);
        sinon.assert.calledWith(oneStub, "SELECT * FROM users WHERE first_name= $1", ["Lin"]);

    });

    it('Should get committees', async ()=>{

        let db = loadDatabaseConnection();
        const mReq = sinon.stub();
        const mRes = { status: sinon.stub().returnsThis(), send: sinon.stub() };
        const mNext = sinon.stub();
        const mData = { committees: ['Biology Committee', 'Physics Commitee'] };
        const anyStub = sinon.stub(db, "any").resolves(mData);

        await getCommittees(mReq, mRes, mNext);
        sinon.assert.calledWith(mRes.status, 200);
        sinon.assert.calledWith(mRes.send, { committees: ['Biology Committee', 'Physics Commitee'] });
        sinon.assert.calledWith(anyStub, 'SELECT * FROM all_committees');
    });

    it("should call error handler middleware when getting committees", async () => {

        let db = loadDatabaseConnection();
        const mReq = sinon.stub();
        const mRes = { status: sinon.stub().returnsThis(), send: sinon.stub() };
        const mNext = sinon.stub();
        const mError = new Error("connect error");
        const anyStub = sinon.stub(db, "any").rejects(mError);

        await getCommittees(mReq, mRes, mNext);
        sinon.assert.calledWith(mNext, mError);
        sinon.assert.calledWith(anyStub, 'SELECT * FROM all_committees');

    });

    it('Should add faculty', async ()=>{

        let db = loadDatabaseConnection();
        const mReq = { body: { firstName: "Lin", lastName: "Du", phoneNum: 123  }};
        const mRes = { status: sinon.stub().returnsThis(), send: sinon.stub() };
        const mNext = sinon.stub();
        const noneStub = sinon.stub(db, "none").resolves('Data insert was a success');

        await addFaculty(mReq, mRes, mNext);
        sinon.assert.calledWith(mRes.status, 200);
        sinon.assert.calledWith(mRes.send, 'Data insert was a success');
        sinon.assert.calledWith(noneStub, 'INSERT INTO users(first_name, last_name, phone_number) values($1, $2, $3)', ["Lin", "Du", 123]);
    });

    it("should call error handler middleware when adding faculty", async () => {

        let db = loadDatabaseConnection();
        const mReq = { body: { firstName: "Lin", lastName: "Du", phoneNum: 123  }};
        const mRes = { status: sinon.stub().returnsThis(), send: sinon.stub() };
        const mNext = sinon.stub();
        const mError = new Error("connect error");
        const noneStub = sinon.stub(db, "none").rejects(mError);

        await addFaculty(mReq, mRes, mNext);
        sinon.assert.calledWith(mNext, mError);
        sinon.assert.calledWith(noneStub, 'INSERT INTO users(first_name, last_name, phone_number) values($1, $2, $3)', ["Lin", "Du", 123]);

    });
});
