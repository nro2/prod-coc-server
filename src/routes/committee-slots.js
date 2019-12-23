const express = require('express');
const router = express.Router();
const {
  addCommitteeSlots,
  getCommitteeSlotsBySenate,
  getCommitteeSlotsByCommittee,
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
        return res.status(404).send;
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
        return res.status(404).send;
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
    .then(() => {
      console.info('Successfully added committee slots to database');
      return res.status(201).send();
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
