const express = require('express');
const router = express.Router();
const { SERVER_URL } = require('../config');
const {
  addCommitteeAssignment,
  deleteCommitteeAssignment,
  getCommitteeAssignmentByCommittee,
  getCommitteeAssignmentByFaculty,
  updateCommitteeAssignment,
  FOREIGN_KEY_VIOLATION,
  UNIQUENESS_VIOLATION,
  COMMITTEE_SLOT_VIOLATION_UNMET_REQUIREMENTS,
  COMMITTEE_SLOT_VIOLATION_NO_SLOTS_REMAINING,
  CHECK_VIOLATION,
  messageResponses,
} = require('../database');

/**
 * @swagger
 *
 * /api/committee-assignment/{id}/{email}:
 *   delete:
 *     tags:
 *       - committee-assignment
 *     description: Deletes an existing committee assignment.
 *     summary: Delete committee assignment
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
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
 *         description: "Committee assignment deleted"
 *       404:
 *         description: "Committee assignment not found"
 *       500:
 *         description: "Internal server error"
 */
router.delete('/:id/:email', async (req, res) => {
  return await deleteCommitteeAssignment(req.params.id, req.params.email)
    .then(result => {
      if (result.rowCount !== 1) {
        console.info(
          `No committee assignment found for id ${req.params.id} and email ${req.params.email}`
        );
        return res.status(404).send({ message: messageResponses[404] });
      }
      console.info('Successfully retrieved committee assignment from database');
      return res.status(200).send({ message: messageResponses[200] });
    })
    .catch(err => {
      console.error(`Error retrieving committee assignment info: ${err}`);
      return res
        .status(500)
        .send({ message: messageResponses[500], error: err.message });
    });
});

/**
 * @swagger
 *
 * /api/committee-assignment/committee/{id}:
 *   get:
 *     tags:
 *       - committee-assignment
 *     description: Retrieves an existing committee assignment by committee id.
 *     summary: Retrieve committee assignment
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: integer
 *         format: int64
 *     responses:
 *       200:
 *         description: "Committee assignment retrieved"
 *         schema:
 *           $ref: "#/responses/CommitteeAssignment"
 *       404:
 *         description: "Committee assignment not found"
 *       500:
 *         description: "Internal server error"
 */
router.get('/committee/:id', async (req, res) => {
  return await getCommitteeAssignmentByCommittee(req.params.id)
    .then(data => {
      if (data.length === 0) {
        console.info(`No committee assignments found for id ${req.params.id}`);
        return res.status(404).send({ message: messageResponses[404] });
      }

      console.info('Successfully retrieved committee assignments from database');
      return res.status(200).send(data);
    })
    .catch(err => {
      console.error(`Error retrieving committee assignments: ${err}`);
      return res
        .status(500)
        .send({ message: messageResponses[500], error: err.message });
    });
});

/**
 * @swagger
 *
 * /api/committee-assignment/faculty/{email}:
 *   get:
 *     tags:
 *       - committee-assignment
 *     description: Retrieves an existing committee assignment by faculty id.
 *     summary: Retrieve committee assignment
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: "Committee assignment retrieved"
 *         schema:
 *           $ref: "#/responses/CommitteeAssignment"
 *       404:
 *         description: "Committee assignment not found"
 *       500:
 *         description: "Internal server error"
 */
router.get('/faculty/:email', async (req, res) => {
  return await getCommitteeAssignmentByFaculty(req.params.email)
    .then(data => {
      if (data.length === 0) {
        console.info(
          `No committee assignments found for email ${req.params.email}`
        );
        return res.status(404).send({ message: messageResponses[404] });
      }

      console.info('Successfully retrieved committee assignments from database');
      return res.status(200).send(data);
    })
    .catch(err => {
      console.error(`Error retrieving committee assignments: ${err}`);
      return res
        .status(500)
        .send({ message: messageResponses[500], error: err.message });
    });
});

/**
 * @swagger
 *
 * /api/committee-assignment:
 *   post:
 *     tags:
 *       - committee-assignment
 *     description: Add a committee assignment to the database.
 *     summary: Add committee assignment
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: "Committee assignment object that needs to be added to the database"
 *         required: true
 *         schema:
 *           $ref: "#/definitions/CommitteeAssignment"
 *     responses:
 *       201:
 *         description: "Resource created"
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
    !req.body.email ||
    !req.body.committeeId ||
    !req.body.startDate ||
    !req.body.endDate
  ) {
    return res.status(400).send({ message: messageResponses[400] });
  }

  const { email, committeeId, startDate, endDate } = req.body;

  return addCommitteeAssignment(email, committeeId, startDate, endDate)
    .then(result => {
      console.info('Successfully added committee assignment to database');
      const { email } = result;
      return res
        .set('Location', `${SERVER_URL}/api/committee-assignment/faculty/${email}`)
        .status(201)
        .send({ message: messageResponses[201] });
    })
    .catch(err => {
      if ([FOREIGN_KEY_VIOLATION, UNIQUENESS_VIOLATION].includes(err.code)) {
        const hint =
          'You are trying to add a committee assignment that already exists.';
        console.error(
          `Attempted to add an existing committee association with invalid keys: ${err}`
        );
        return res.status(409).send({
          message: err.message,
          error: err.detail,
          hint: hint,
        });
      }

      if (
        [
          COMMITTEE_SLOT_VIOLATION_UNMET_REQUIREMENTS,
          COMMITTEE_SLOT_VIOLATION_NO_SLOTS_REMAINING,
        ].includes(err.code)
      ) {
        console.error(err.message);
        return res.status(409).send({
          message: err.message,
          error: err.detail,
          hint: err.hint,
        });
      }

      if ([CHECK_VIOLATION].includes(err.code)) {
        const hint = 'Start date must come before end date.';
        console.error(err.message);
        return res.status(409).send({
          message: err.message,
          error: err.detail,
          hint: hint,
        });
      }

      console.error(`Error adding committee assignment: ${err}`);
      return res
        .status(500)
        .send({ message: messageResponses[500], error: err.message });
    });
});

/**
 * @swagger
 *
 * /api/committee-assignment:
 *   put:
 *     tags:
 *       - committee-assignment
 *     description: Update an existing committee assignment.
 *     summary: Update committee assignment
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: "Committee assignment object that needs to be updated in the database"
 *         required: true
 *         schema:
 *           $ref: "#/definitions/CommitteeAssignment"
 *     responses:
 *       201:
 *         description: "Resource created"
 *       400:
 *         description: "Request is missing required fields"
 *       409:
 *         description: "Conflict"
 *       500:
 *         description: "Internal server error"
 */
router.put('/', async (req, res) => {
  if (
    !req.body ||
    !req.body.email ||
    !req.body.committeeId ||
    !req.body.startDate ||
    !req.body.endDate
  ) {
    return res.status(400).send({ message: messageResponses[400] });
  }

  const { email, committeeId, startDate, endDate } = req.body;

  return updateCommitteeAssignment(email, committeeId, startDate, endDate)
    .then(result => {
      if (!result.rowCount) {
        console.info(
          `Unable to update committee assignment record, committee with email ${email} and committee id ${committeeId} does not exist`
        );
        return res.status(404).send({ message: messageResponses[404] });
      }

      console.info(
        `Updated committee with email ${email} and committee id "${committeeId}"`
      );
      return res.status(200).send({ message: messageResponses[200] });
    })
    .catch(err => {
      console.log(err);
      if ([CHECK_VIOLATION].includes(err.code)) {
        const hint = 'Start date must come before end date.';
        console.error(err.message);
        return res.status(409).send({
          message: err.message,
          error: err.detail,
          hint: hint,
        });
      }

      console.error(`Error updating committee assignment in database: ${err}`);
      return res
        .status(500)
        .send({ message: messageResponses[500], error: err.message });
    });
});

module.exports = router;
