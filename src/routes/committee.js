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
