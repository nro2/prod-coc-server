const express = require('express');
const router = express.Router();
const { getDepartments, messageResponses } = require('../database');

router.get('/', async (req, res) => {
  return getDepartments()
    .then(data => {
      if (data.length === 0) {
        console.info('No departments found');
        return res.status(404).send({ message: messageResponses[404] });
      }

      console.info('Successfully retrieved departments from database');
      return res.status(200).send(data);
    })
    .catch(err => {
      console.error(`Error retrieving departments: ${err}`);
      return res
        .status(500)
        .send({ message: messageResponses[500], error: err.message });
    });
});

module.exports = router;
