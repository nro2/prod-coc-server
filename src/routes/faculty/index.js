const express = require('express');
const router = express.Router();
const { addFaculty, UNIQUENESS_VIOLATION } = require('../../database/queries');

router.post('/', async (req, res) => {
  if (
    !req.body ||
    !req.body.fullName ||
    !req.body.email ||
    !req.body.jobTitle ||
    !req.body.phoneNum ||
    !req.body.senateDivision
  ) {
    return res.status(400).send({ message: '400 Bad Request' });
  }

  const { fullName, email, jobTitle, phoneNum, senateDivision } = req.body;

  return await addFaculty(fullName, email, jobTitle, phoneNum, senateDivision)
    .then(() => {
      console.info('Added faculty member to database');
      return res.status(201).send();
    })
    .catch(err => {
      if (err.code === UNIQUENESS_VIOLATION) {
        console.error(
          `Attempted to add an existing faculty with a non unique-key: ${err}`
        );
        return res.status(409).send();
      }

      console.error(`Error adding faculty member to database: ${err}`);
      return res
        .status(500)
        .send({ error: 'Unable to complete database transaction' });
    });
});

module.exports = router;
