const express = require('express');
const router = express.Router();
const { SERVER_URL } = require('../config');
const {
  addCommitteeAssignment,
  getCommitteeAssignmentByCommittee,
  getCommitteeAssignmentByFaculty,
  updateCommitteeAssignment,
  FOREIGN_KEY_VIOLATION,
  UNIQUENESS_VIOLATION,
} = require('../database');

router.get('/committee/:id', async (req, res) => {
  if (!req.params.id) {
    return res.status(400).send({ message: '400 Bad Request' });
  }
  return await getCommitteeAssignmentByCommittee(req.params.id)
    .then(data => {
      if (data.length === 0) {
        console.info(`No committee assignments found for id ${req.params.id}`);
        return res.status(404).send();
      }

      console.info('Successfully retrieved committee assignments from database');
      return res.status(200).send(data);
    })
    .catch(err => {
      console.error(`Error retrieving committee assignments: ${err}`);
      return res
        .status(500)
        .send({ error: 'Unable to complete database transaction' });
    });
});

router.get('/faculty/:email', async (req, res) => {
  if (!req.params.email) {
    return res.status(400).send({ message: '400 Bad Request' });
  }
  return await getCommitteeAssignmentByFaculty(req.params.email)
    .then(data => {
      if (data.length === 0) {
        console.info(
          `No committee assignments found for email ${req.params.email}`
        );
        return res.status(404).send();
      }

      console.info('Successfully retrieved committee assignments from database');
      return res.status(200).send(data);
    })
    .catch(err => {
      console.error(`Error retrieving committee assignments: ${err}`);
      return res
        .status(500)
        .send({ error: 'Unable to complete database transaction' });
    });
});

router.post('/', async (req, res) => {
  if (
    !req.body ||
    !req.body.email ||
    !req.body.committeeId ||
    !req.body.startDate ||
    !req.body.endDate
  ) {
    return res.status(400).send({ message: '400 Bad Request' });
  }

  const { email, committeeId, startDate, endDate } = req.body;

  return addCommitteeAssignment(email, committeeId, startDate, endDate)
    .then(result => {
      console.info('Successfully added committee assignment to database');
      const { email } = result;
      return res
        .set('Location', `${SERVER_URL}/api/committee-assignment/faculty/${email}`)
        .status(201)
        .send();
    })
    .catch(err => {
      if ([FOREIGN_KEY_VIOLATION, UNIQUENESS_VIOLATION].includes(err.code)) {
        console.error(
          `Attempted to add an existing committee association with invalid keys: ${err}`
        );
        return res.status(409).send();
      }

      if (
        err.message === 'Adding this faculty violates committee slot requirements.'
      ) {
        console.error(err.message);
        return res
          .status(409)
          .send({
            error: 'Adding this faculty violates committee slot requirements.',
          });
      }

      console.error(`Error adding committee assignment: ${err}`);
      return res
        .status(500)
        .send({ error: 'Unable to complete database transaction' });
    });
});

router.put('/', async (req, res) => {
  if (
    !req.body ||
    !req.body.email ||
    !req.body.committeeId ||
    !req.body.startDate ||
    !req.body.endDate
  ) {
    return res.status(400).send({ message: '400 Bad Request' });
  }

  const { email, committeeId, startDate, endDate } = req.body;

  return updateCommitteeAssignment(email, committeeId, startDate, endDate)
    .then(result => {
      if (!result.rowCount) {
        console.info(
          `Unable to update committee assignment record, committee with email ${email} and committee id ${committeeId} does not exist`
        );
        return res.status(404).send();
      }

      console.info(
        `Updated committee with email ${email} and committee id "${committeeId}"`
      );
      return res.status(200).send();
    })
    .catch(err => {
      console.error(`Error updating committee assignment in database: ${err}`);
      return res
        .status(500)
        .send({ error: 'Unable to complete database transaction' });
    });
});

module.exports = router;
