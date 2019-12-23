const express = require('express');
const router = express.Router();
const { getDepartments } = require('../database');

router.get('/', async (req, res) => {
  return getDepartments()
    .then(data => {
      if (data.length === 0) {
        console.info('No departments found');
        return res.status(404).send();
      }

      console.info('Successfully retrieved departments from database');
      return res.status(200).send(data);
    })
    .catch(err => {
      console.error(`Error retrieving departments: ${err}`);
      return res
        .status(500)
        .send({ error: 'Unable to complete database transaction' });
    });
});

module.exports = router;
