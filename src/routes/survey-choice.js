const express = require('express');
const router = express.Router();
const { SERVER_URL } = require('../config');
const {
  addSurveyChoice,
  getSurveyChoice,
  FOREIGN_KEY_VIOLATION,
  UNIQUENESS_VIOLATION,
  messageResponses,
} = require('../database');

router.get('/:date/:email', async (req, res) => {
  if (!req.params.date || !req.params.email) {
    return res.status(400).send({ message: messageResponses[400] });
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
        return res.status(404).send({ message: messageResponses[404] });
      }

      console.error(`Error retrieving survey choice: ${err}`);
      return res
        .status(500)
        .send({ message: messageResponses[500], error: err.message });
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
    return res.status(400).send({ message: messageResponses[400] });
  }

  const { choiceId, surveyDate, email, committeeId } = req.body;

  return addSurveyChoice(choiceId, surveyDate, email, committeeId)
    .then(result => {
      console.info('Successfully added survey choice to database');
      const { year, email } = result;
      return res
        .set('Location', `${SERVER_URL}/api/survey-choice/${year}/${email}`)
        .status(201)
        .send({ message: messageResponses[201] });
    })
    .catch(err => {
      if ([FOREIGN_KEY_VIOLATION, UNIQUENESS_VIOLATION].includes(err.code)) {
        const hint = 'Attempted to add an existing survey choice with invalid keys';
        console.error(
          `Attempted to add an existing survey choice with invalid keys: ${err}`
        );
        return res
          .status(409)
          .send({ message: err.message, error: err.detail, hint: hint });
      }

      console.error(`Error adding survey choice: ${err}`);
      return res
        .status(500)
        .send({ message: messageResponses[500], error: err.message });
    });
});

module.exports = router;
