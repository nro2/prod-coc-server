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

/**
 * @swagger
 *
 * /api/survey-data:
 *   post:
 *     tags:
 *       - survey-data
 *     description: Add a survey-data to the database.
 *     summary: Add survey data
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: "Survey Data object that needs to be added to the database"
 *         required: true
 *         schema:
 *           $ref: "#/definitions/SurveyData"
 *     responses:
 *       201:
 *         description: "Resource created"
 *       400:
 *         description: "Request is missing required fields"
 *       500:
 *         description: "Internal server error"
 */
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

/**
 * @swagger
 *
 * /api/survey-data:
 *   put:
 *     tags:
 *       - survey-data
 *     description: Update survey-data for a faculty member in the database.
 *     summary: Update survey data by email and date
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: "Survey Data object that needs to be updated in the database"
 *         required: true
 *         schema:
 *           $ref: "#/definitions/SurveyData"
 *     responses:
 *       200:
 *         description: "Resource updated"
 *       400:
 *         description: "Request is missing required fields"
 *       404:
 *         description: "Unable to update survey data"
 *       500:
 *         description: "Internal server error"
 */
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

/**
 * @swagger
 *
 * /api/survey-data/{date}/{email}:
 *   get:
 *     tags:
 *       - survey-data
 *     description: Retrieve survey data for a faculty member.
 *     summary: Find survey data by date and email
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
 *         type: string
 *     responses:
 *       200:
 *         description: "Survey data retrieved"
 *         schema:
 *           $ref: "#/responses/SurveyData"
 *       400:
 *         description: "Invalid date or email format"
 *       404:
 *         description: "Survey data not found"
 *       500:
 *         description: "Internal server error"
 */

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
