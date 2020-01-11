const express = require('express');
const router = express.Router();
const { SERVER_URL } = require('../config');
const {
  addSurveyChoice,
  getSurveyChoice,
  FOREIGN_KEY_VIOLATION,
  UNIQUENESS_VIOLATION,
} = require('../database');

router.get('/:date/:email', async (req, res) => {
  if (!req.params.date || !req.params.email) {
    return res.status(400).send({ message: '400 Bad Request' });
  }

  const { date, email } = req.params;

  return getSurveyChoice(date, email)
    .then(data => {
      console.info('Successfully retrieved survey choice from database');
      return res.status(200).send(data);
    })
    .catch(err => {
      if (err.result && err.result.rowCount === 0) {
        console.info(
          `No survey choice found for date ${req.params.date} and email ${req.params.email}`
        );
        return res.status(404).send();
      }

      console.error(`Error retrieving survey choice: ${err}`);
      return res
        .status(500)
        .send({ error: 'Unable to complete database transaction' });
    });
});

router.post('/', async (req, res) => {
  if (
    !req.body ||
    !req.body.choiceId ||
    !req.body.surveyDate ||
    !req.body.email ||
    !req.body.committeeId
  ) {
    return res.status(400).send({ message: '400 Bad Request' });
  }

  const { choiceId, surveyDate, email, committeeId } = req.body;

  return addSurveyChoice(choiceId, surveyDate, email, committeeId)
    .then(result => {
      console.info('Successfully added survey choice to database');
      const { year, email } = result;
      return res
        .set('Location', `${SERVER_URL}/survey-choice/${year}/${email}`)
        .status(201)
        .send();
    })
    .catch(err => {
      if ([FOREIGN_KEY_VIOLATION, UNIQUENESS_VIOLATION].includes(err.code)) {
        console.error(
          `Attempted to add an existing survey choice with invalid keys: ${err}`
        );
        return res.status(409).send();
      }

      console.error(`Error adding survey choice: ${err}`);
      return res
        .status(500)
        .send({ error: 'Unable to complete database transaction' });
    });
});

module.exports = router;
