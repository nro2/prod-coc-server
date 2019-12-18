const sinon = require('sinon');

const request = () => {
  return { body: {}, query: {}, params: {} };
};

const response = () => {
  const res = {};
  res.send = sinon.stub().returns(res);
  res.status = sinon.stub().returns(res);

  return res;
};

module.exports = {
  request,
  response,
};
