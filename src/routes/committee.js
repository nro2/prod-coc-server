const express = require('express');
const router = express.Router();
const { SERVER_URL } = require('../config');
const {
  addCommittee,
  updateCommittee,
  getCommittee,
  getCommitteeInfo,
} = require('../database');

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
    .then(result => {
      console.info('Successfully added committee to database');
      const { committeeId } = result;
      return res
        .set('Location', `${SERVER_URL}/api/committee/${committeeId}`)
        .status(201)
        .send();
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

router.get('/:id', async (req, res) => {
  if (!req.params.id) {
    return res.status(400).send({ message: '400 Bad Request' });
  }
  return await getCommittee(req.params.id)
    .then(data => {
      console.info('Successfully retrieved committee from database');
      return res.status(200).send(data);
    })
    .catch(err => {
      if (err.result && err.result.rowCount === 0) {
        console.info(`Found no committee in the database with id ${req.params.id}`);
        return res.status(404).send();
      }

      console.error(`Error retrieving committee: ${err}`);
      return res
        .status(500)
        .send({ error: 'Unable to complete database transaction' });
    });
});

router.get('/info/:id', async (req, res) => {
  if (!req.params.id) {
    return res.status(400).send({ message: '400 Bad Request' });
  }

  return await getCommitteeInfo(req.params.id)
    .then(data => {
      if (!data) {
        console.info(`No committee found for id ${req.params.id}`);
        return res.status(404).send();
      }
      console.info('Successfully retrieved committee from database');
      return res.status(200).send(data);
    })
    .catch(err => {
      console.error(`Error retrieving committee info: ${err}`);
      return res
        .status(500)
        .send({ error: 'Unable to complete database transaction' });
    });
});

module.exports = router;
