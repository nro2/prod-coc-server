const express = require('express');
const router = express.Router();
const { SERVER_URL } = require('../config');
const {
  addCommittee,
  updateCommittee,
  getCommittee,
  getCommitteeInfo,
  TOTAL_COMMITTEE_SLOT_VIOLATION,
  messageResponses,
} = require('../database');

/**
 * @swagger
 *
 * /api/committee:
 *   post:
 *     tags:
 *       - committee
 *     description: Add a committee to the database.
 *     summary: Add committee
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: "Committee object that needs to be added to the database"
 *         required: true
 *         schema:
 *           $ref: "#/definitions/Committee"
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
    !req.body.name ||
    !req.body.description ||
    !req.body.totalSlots
  ) {
    return res.status(400).send({ message: messageResponses[400] });
  }

  const { name, description, totalSlots } = req.body;

  return addCommittee(name, description, totalSlots)
    .then(result => {
      console.info('Successfully added committee to database');
      const { committeeId } = result;
      return res
        .set('Location', `${SERVER_URL}/api/committee/${committeeId}`)
        .status(201)
        .send({ message: messageResponses[201] });
    })
    .catch(err => {
      console.error(`Error adding committee: ${err}`);
      return res
        .status(500)
        .send({ message: messageResponses[500], error: err.message });
    });
});

/**
 * @swagger
 *
 * /api/committee:
 *   put:
 *     tags:
 *       - committee
 *     description: Update an existing committee.
 *     summary: Update committee
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: "Committee object that needs to be updated in the database"
 *         required: true
 *         schema:
 *           $ref: "#/definitions/CommitteeId"
 *     responses:
 *       200:
 *         description: "Resource updated"
 *       400:
 *         description: "Request is missing required fields"
 *       409:
 *         description: "Committee slots don't match expected values"
 *       500:
 *         description: "Internal server error"
 */
router.put('/', async (req, res) => {
  if (
    !req.body ||
    !req.body.committeeId ||
    !req.body.name ||
    !req.body.description ||
    !req.body.totalSlots
  ) {
    return res.status(400).send({ message: messageResponses[400] });
  }

  const { committeeId, name, description, totalSlots } = req.body;

  return updateCommittee(committeeId, name, description, totalSlots)
    .then(result => {
      if (!result.rowCount) {
        console.info(
          `Unable to update committee record, committee with id ${committeeId} does not exist`
        );
        return res.status(404).send({ message: messageResponses[404] });
      }

      console.info(`Updated committee with id "${committeeId}"`);
      return res.status(200).send({ message: messageResponses[200] });
    })
    .catch(err => {
      if ([TOTAL_COMMITTEE_SLOT_VIOLATION].includes(err.code)) {
        console.error(err.message);
        return res.status(409).send({
          message: messageResponses[409],
          error: err.message,
          detail: err.detail,
          hint: err.hint,
        });
      }

      console.error(`Error updating committee in database: ${err}`);
      return res
        .status(500)
        .send({ message: messageResponses[500], error: err.message });
    });
});

/**
 * @swagger
 *
 * /api/committee/{id}:
 *   get:
 *     tags:
 *       - committee
 *     description: Retrieve an existing committee.
 *     summary: Find committee by ID
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
 *         description: "Committee retrieved"
 *       400:
 *         description: "Invalid committee id format"
 *       404:
 *         description: "Committee not found"
 *       500:
 *         description: "Internal server error"
 */
router.get('/:id', async (req, res) => {
  if (!Number.isInteger(parseInt(req.params.id))) {
    return res.status(400).send({ message: messageResponses[400] });
  }
  console.log(req.params.id);
  return await getCommittee(req.params.id)
    .then(data => {
      console.info('Successfully retrieved committee from database');
      return res.status(200).send(data);
    })
    .catch(err => {
      if (err.result && err.result.rowCount === 0) {
        console.info(`Found no committee in the database with id ${req.params.id}`);
        return res.status(404).send({ message: messageResponses[404] });
      }

      console.error(`Error retrieving committee: ${err}`);
      return res
        .status(500)
        .send({ message: messageResponses[500], error: err.message });
    });
});

/**
 * @swagger
 *
 * /api/committee/info/{id}:
 *   get:
 *     tags:
 *       - committee
 *     description: Retrieve committee info by id.
 *     summary: Find committee info by ID
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
 *         description: "Committee info retrieved"
 *       400:
 *         description: "Invalid committee id format"
 *       404:
 *         description: "Committee info not found"
 *       500:
 *         description: "Internal server error"
 */
router.get('/info/:id', async (req, res) => {
  return await getCommitteeInfo(req.params.id)
    .then(data => {
      if (!data) {
        console.info(`No committee found for id ${req.params.id}`);
        return res.status(404).send({ message: messageResponses[404] });
      }
      console.info('Successfully retrieved committee from database');
      return res.status(200).send(data);
    })
    .catch(err => {
      console.error(`Error retrieving committee info: ${err}`);
      return res
        .status(500)
        .send({ message: messageResponses[500], error: err.message });
    });
});

module.exports = router;
