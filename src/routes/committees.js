const express = require('express');
const router = express.Router();
const { getCommittees } = require('../database');

router.get('/', async (req, res) => {
  return getCommittees()
    .then(data => {
      if (data.length === 0) {
        console.info('No committees found');
        return res.status(404).send();
      }

      console.info('Successfully retrieved committees from database');
      return res.status(200).send(data);
    })
    .catch(err => {
      console.error(`Error retrieving committees: ${err}`);
      return res
        .status(500)
        .send({ error: 'Unable to complete database transaction' });
    });
});

module.exports = router;
