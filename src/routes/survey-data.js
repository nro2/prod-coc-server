const express = require('express');
const router = express.Router();
const {
  addSurveyData,
  updateSurveyData,
  FOREIGN_KEY_VIOLATION,
  UNIQUENESS_VIOLATION,
} = require('../database');

router.post('/', async (req, res) => {
  if (
    !req.body ||
    !req.body.surveyDate ||
    !req.body.email ||
    !req.body.isInterested ||
    !req.body.expertise
  ) {
    return res.status(400).send({ message: '400 Bad Request' });
  }

  const { surveyDate, email, isInterested, expertise } = req.body;

  return addSurveyData(surveyDate, email, isInterested, expertise)
    .then(() => {
      console.info('Successfully added survey data to database');
      return res.status(201).send();
    })
    .catch(err => {
      if ([FOREIGN_KEY_VIOLATION, UNIQUENESS_VIOLATION].includes(err.code)) {
        console.error(
          `Attempted to add an existing survey data with invalid keys: ${err}`
        );
        return res.status(409).send();
      }

      console.error(`Error adding survey choice: ${err}`);
      return res
        .status(500)
        .send({ error: 'Unable to complete database transaction' });
    });
});

router.put('/', async (req, res) => {
  if (
    !req.body ||
    !req.body.surveyDate ||
    !req.body.email ||
    !req.body.isInterested ||
    !req.body.expertise
  ) {
    return res.status(400).send({ message: '400 Bad Request' });
  }

  const { surveyDate, email, isInterested, expertise } = req.body;

  return await updateSurveyData(surveyDate, email, isInterested, expertise)
    .then(result => {
      if (!result.rowCount) {
        console.info(
          `Unable to update survey data, email ${email} or date ${surveyDate} does not exist`
        );
        return res.status(404).send();
      }

      console.info(
        `Updated survey data with email ${email} and/or date ${surveyDate}`
      );
      return res.status(200).send();
    })
    .catch(err => {
      console.error(`Error updating survey data in database: ${err}`);
      return res
        .status(500)
        .send({ error: 'Unable to complete database transaction' });
    });
});

module.exports = router;
