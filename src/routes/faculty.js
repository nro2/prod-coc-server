const express = require('express');
const router = express.Router();
const { SERVER_URL } = require('../config');
const {
  addFaculty,
  updateFaculty,
  FOREIGN_KEY_VIOLATION,
  getFaculty,
  UNIQUENESS_VIOLATION,
} = require('../database');

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
    .then(result => {
      console.info('Added faculty member to database');
      const { email } = result;
      return res
        .set('Location', `${SERVER_URL}/faculty/${email}`)
        .status(201)
        .send();
    })
    .catch(err => {
      if ([FOREIGN_KEY_VIOLATION, UNIQUENESS_VIOLATION].includes(err.code)) {
        console.error(
          `Attempted to add an existing faculty with invalid keys: ${err}`
        );
        return res.status(409).send();
      }

      console.error(`Error adding faculty member to database: ${err}`);
      return res
        .status(500)
        .send({ error: 'Unable to complete database transaction' });
    });
});

router.put('/', async (req, res) => {
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

  return await updateFaculty(fullName, email, jobTitle, phoneNum, senateDivision)
    .then(result => {
      if (!result.rowCount) {
        console.info(
          `Unable to update faculty record, email ${email} does not exist`
        );
        return res.status(404).send();
      }

      console.info(`Updated faculty member with email ${email}`);
      return res.status(200).send();
    })
    .catch(err => {
      console.error(`Error updating faculty member in database: ${err}`);
      return res
        .status(500)
        .send({ error: 'Unable to complete database transaction' });
    });
});

router.get('/:email', async (req, res) => {
  if (!req.params.email) {
    return res.status(400).send({ message: '400 Bad Request' });
  }
  return await getFaculty(req.params.email)
    .then(data => {
      if (!data) {
        console.info(`No faculty found for email ${req.params.email}`);
        return res.status(404).send();
      }

      console.info('Successfully retrieved faculty from database');
      return res.status(200).send(data);
    })
    .catch(err => {
      console.error(`Error retrieving faculty: ${err}`);
      return res
        .status(500)
        .send({ error: 'Unable to complete database transaction' });
    });
});

module.exports = router;
