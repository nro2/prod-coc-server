const express = require('express');
const router = express.Router();
const { addCommittee, updateCommittee, getCommittee } = require('../database');

router.post('/', async (req, res) => {
  if (
    !req.body ||
    !req.body.name ||
    !req.body.description ||
    !req.body.totalSlots
  ) {
    return res.status(400).send({ message: '400 Bad Request' });
  }

  const { name, description, totalSlots } = req.body;

  return addCommittee(name, description, totalSlots)
    .then(() => {
      console.info('Successfully added committee to database');
      return res.status(201).send();
    })
    .catch(err => {
      console.error(`Error adding committee: ${err}`);
      return res
        .status(500)
        .send({ error: 'Unable to complete database transaction' });
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
    return res.status(400).send({ message: '400 Bad Request' });
  }

  const { committeeId, name, description, totalSlots } = req.body;

  return updateCommittee(committeeId, name, description, totalSlots)
    .then(result => {
      if (!result.rowCount) {
        console.info(
          `Unable to update committee record, committee with id ${committeeId} does not exist`
        );
        return res.status(404).send();
      }

      console.info(`Updated committee with id "${committeeId}"`);
      return res.status(200).send();
    })
    .catch(err => {
      console.error(`Error updating committee in database: ${err}`);
      return res
        .status(500)
        .send({ error: 'Unable to complete database transaction' });
    });
});

router.get('/:name', async (req, res) => {
  if (!req.params.name) {
    return res.status(400).send({ message: '400 Bad Request' });
  }
  return await getCommittee(req.params.name)
    .then(data => {
      console.info('Successfully retrieved committee from database');
      return res.status(200).send(data);
    })
    .catch(err => {
      if (err.result && err.result.rowCount === 0) {
        console.info(
          `Found no committee in the database with name ${req.params.name}`
        );
        return res.status(404).send();
      }

      console.error(`Error retrieving committee: ${err}`);
      return res
        .status(500)
        .send({ error: 'Unable to complete database transaction' });
    });
});
module.exports = router;
