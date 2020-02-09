const express = require('express');
const router = express.Router();
const { SERVER_URL } = require('../config');
const {
  addCommitteeSlots,
  getCommitteeSlotsBySenate,
  getCommitteeSlotsByCommittee,
  updateCommitteeSlots,
  FOREIGN_KEY_VIOLATION,
  UNIQUENESS_VIOLATION,
} = require('../database');

router.get('/senate-division/:shortname', async (req, res) => {
  if (!req.params.shortname) {
    return res.status(400).send({ message: '400 Bad Request' });
  }

  return await getCommitteeSlotsBySenate(req.params.shortname)
    .then(data => {
      if (data.length === 0) {
        console.info(
          `No slot requirements found for senate division ${req.params.shortname}`
        );
        return res.status(404).send();
      }

      console.info(
        `Successfully retrieved slot requirements for ${req.params.shortname}`
      );
      return res.status(200).send(data);
    })
    .catch(err => {
      console.error(`Error retrieving slot requirements: ${err}`);
      return res
        .status(500)
        .send({ error: 'Unable to complete database transaction' });
    });
});

router.get('/committee/:id', async (req, res) => {
  if (!req.params.id) {
    return res.status(400).send({ message: '400 Bad Request' });
  }

  return await getCommitteeSlotsByCommittee(req.params.id)
    .then(data => {
      if (data.length === 0) {
        console.info(`No slot requirements found for committee ${req.params.id}`);
        return res.status(404).send();
      }

      console.info(
        `Successfully retrieved slot requirements for committee ${req.params.id}`
      );
      res.status(200).send(data);
    })
    .catch(err => {
      console.error(`Error retrieving slot requirements: ${err}`);
      return res
        .status(500)
        .send({ error: 'Unable to complete database transaction' });
    });
});

router.put('/:id/:name', async (req, res) => {
  if (!req.body || !req.body.slotRequirements || req.body.slotRequirements < 0) {
    return res.status(400).send({ message: '400 Bad Request' });
  }

  const { id, name } = req.params;
  const { slotRequirements } = req.body;

  return await updateCommitteeSlots(id, name, slotRequirements)
    .then(result => {
      if (result[0].rowCount === 0) {
        console.info(
          `Unable to update committee slots record, committee id ${id} or senate division ${name} do not exist`
        );
        console.log(result);
        return res.status(404).send();
      }

      console.info(
        `Updated committee slots with committee id ${id} and senate division ${name}`
      );
      return res.status(200).send();
    })
    .catch(err => {
      console.error(`Error updating committee slots record in database: ${err}`);
      return res
        .status(500)
        .send({ error: 'Unable to complete database transaction' });
    });
});

router.post('/', async (req, res) => {
  if (
    !req.body ||
    !req.body.committeeId ||
    !req.body.senateDivision ||
    !req.body.slotRequirements
  ) {
    return res.status(400).send({ message: '400 Bad Request' });
  }

  const { committeeId, senateDivision, slotRequirements } = req.body;

  return addCommitteeSlots(committeeId, senateDivision, slotRequirements)
    .then(result => {
      console.info('Successfully added committee slots to database');
      const { committeeId } = result;
      return res
        .set(
          'Location',
          `${SERVER_URL}/api/committee-slots/committee/${committeeId}`
        )
        .status(201)
        .send();
    })
    .catch(err => {
      if ([FOREIGN_KEY_VIOLATION, UNIQUENESS_VIOLATION].includes(err.code)) {
        console.error(
          `Attempted to add existing committee slots with invalid keys: ${err}`
        );
        return res.status(409).send();
      }
      console.error(`Error adding committee slots: ${err}`);
      return res
        .status(500)
        .send({ error: 'Unable to complete database transaction' });
    });
});

module.exports = router;
