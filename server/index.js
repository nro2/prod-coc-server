const PORT = 8080;
const express = require('express');

const routes = require('./routes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', routes);

module.exports = app.listen(PORT, () => {
  console.log(`Express running at http://localhost:${PORT}`);
});
