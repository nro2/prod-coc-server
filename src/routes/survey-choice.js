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

/**
 * @swagger
 *
 * /api/survey-choice/{date}/{email}:
 *   get:
 *     tags:
 *       - survey-choice
 *     description: Retrieve survey choice for a faculty member
 *     summary: Find survey choice by email and date
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: date
 *         in: path
 *         required: true
 *         type: integer
 *         format: int64
 *       - name: email
 *         in: path
 *         required: true
 *         format: string
 *     responses:
 *       200:
 *         description: "Survey choice retrieved"
 *         schema:
 *           $ref: "#/responses/SurveyChoice"
 *       400:
 *         description: "Invalid date or email format"
 *       404:
 *         description: "Survey choice not found"
 *       500:
 *         description: "Internal server error"
 */
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

/**
 * @swagger
 *
 * /api/survey-choice:
 *   post:
 *     tags:
 *       - survey-choice
 *     description: Add survey choice for a faculty member.
 *     summary: Add survey choice by email and date
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: "Survey choice object that needs to be added to the database"
 *         required: true
 *         schema:
 *          $ref: "#/definitions/SurveyChoice"
 *     responses:
 *       201:
 *         description: "Survey choice created"
 *       400:
 *         description: "Request is missing required fields"
 *       409:
 *         description: "Conflict"
 *       500:
 *         description: "Internal server error"
 */

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
