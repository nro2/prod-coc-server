const express = require('express');
const router = express.Router();
const { getSenateDivisions } = require('../database');

router.get('/', async (req, res) => {
  return await getSenateDivisions()
    .then(data => {
      if (data.length === 0) {
        console.info('Found no senate division in the database');
        return res.status(404).send();
      }

      console.info('Successfully retrieved senate divisions from database');
      return res.status(200).send(data);
    })
    .catch(err => {
      console.error(`Error retrieving senate divisions: ${err}`);
      return res
        .status(500)
        .send({ error: 'Unable to complete database transaction' });
    });
});

module.exports = router;
