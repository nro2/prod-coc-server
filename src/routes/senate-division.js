const express = require('express');
const router = express.Router();
const { getSenateDivision } = require('../database');

router.get('/:name', async (req, res) => {
  if (!req.params.name) {
    return res.status(400).send({ message: '400 Bad Request' });
  }
  return await getSenateDivision(req.params.name)
    .then(data => {
      console.info('Successfully retrieved senate division from database');
      return res.status(200).send(data);
    })
    .catch(err => {
      if (err.result && err.result.rowCount === 0) {
        console.info('Found no senate division in the database');
        return res.status(404).send();
      }

      console.error(`Error retrieving senate division: ${err}`);
      return res
        .status(500)
        .send({ error: 'Unable to complete database transaction' });
    });
});

module.exports = router;
