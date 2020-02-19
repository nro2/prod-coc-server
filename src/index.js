const PORT = 8080;
const express = require('express');
const path = require('path');

const routes = require('./routes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../build')));

app.use('/api', routes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

module.exports = app.listen(PORT, () => {
  console.log(`Express running at http://localhost:${PORT}`);
});
