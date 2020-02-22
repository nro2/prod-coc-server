const express = require('express');
const router = express.Router();
const { SERVER_URL } = require('../config');
const {
  addSurveyData,
  updateSurveyData,
  getSurveyData,
  FOREIGN_KEY_VIOLATION,
  UNIQUENESS_VIOLATION,
  messageResponses,
} = require('../database');

router.post('/', async (req, res) => {
  if (
    !req.body ||
    !req.body.surveyDate ||
    !req.body.email ||
    !req.body.isInterested ||
    !req.body.expertise
  ) {
    return res.status(400).send({ message: messageResponses[400] });
  }

  const { surveyDate, email, isInterested, expertise } = req.body;

  return addSurveyData(surveyDate, email, isInterested, expertise)
    .then(result => {
      console.info('Successfully added survey data to database');
      const { year, email } = result;
      return res
        .set('Location', `${SERVER_URL}/api/survey-data/${year}/${email}`)
        .status(201)
        .send({ message: messageResponses[201] });
    })
    .catch(err => {
      if ([FOREIGN_KEY_VIOLATION, UNIQUENESS_VIOLATION].includes(err.code)) {
        const hint = 'Attempted to add an existing survey data with invalid keys';
        console.error(
          `Attempted to add an existing survey data with invalid keys: ${err}`
        );
        return res
          .status(409)
          .send({ message: err.message, detail: err.detail, hint: hint });
      }

      console.error(`Error adding survey choice: ${err}`);
      return res
        .status(500)
        .send({ message: messageResponses[500], error: err.message });
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
    return res.status(400).send({ message: messageResponses[400] });
  }

  const { surveyDate, email, isInterested, expertise } = req.body;

  return await updateSurveyData(surveyDate, email, isInterested, expertise)
    .then(result => {
      if (!result.rowCount) {
        console.info(
          `Unable to update survey data, email ${email} or date ${surveyDate} does not exist`
        );
        return res.status(404).send({ message: messageResponses[404] });
      }

      console.info(
        `Updated survey data with email ${email} and date ${surveyDate}`
      );
      return res.status(200).send({ message: messageResponses[200] });
    })
    .catch(err => {
      console.error(`Error updating survey data in database: ${err}`);
      return res
        .status(500)
        .send({ message: messageResponses[500], error: err.message });
    });
});

router.get('/:date/:email', async (req, res) => {
  if (!req.params.date || !req.params.email) {
    return res.status(400).send({ message: messageResponses[400] });
  }
  return await getSurveyData(req.params.date, req.params.email)
    .then(data => {
      console.info('Successfully retrieved survey data from database');
      res.status(200).send(data);
    })
    .catch(err => {
      if (err.result && err.result.rowCount === 0) {
        console.info('Found no survey data in the database');
        return res.status(404).send({ message: messageResponses[404] });
      }
      console.error(`Error retrieving survey data: ${err}`);
      return res
        .status(500)
        .send({ message: messageResponses[500], error: err.message });
    });
});

module.exports = router;
