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
} = require('../database');

router.delete('/:id/:email', async (req, res) => {
  return await deleteCommitteeAssignment(req.params.id, req.params.email)
    .then(result => {
      if (result.rowCount !== 1) {
        console.info(
          `No committee assignment found for id ${req.params.id} and email ${req.params.email}`
        );
        return res.status(404).send();
      }
      console.info('Successfully retrieved committee assignment from database');
      return res.status(200).send();
    })
    .catch(err => {
      console.error(`Error retrieving committee assignment info: ${err}`);
      return res
        .status(500)
        .send({ error: 'Unable to complete database transaction' });
    });
});

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
        const hint =
          'You are trying to add a committee assignment that already exists.';
        console.error(
          `Attempted to add an existing committee association with invalid keys: ${err}`
        );
        return res.status(409).send({
          error: err.message,
          detail: err.detail,
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
          error: err.message,
          detail: err.detail,
          hint: err.hint,
        });
      }

      if ([CHECK_VIOLATION].includes(err.code)) {
        const hint = 'Start date must come before end date.';
        console.error(err.message);
        return res.status(409).send({
          error: err.message,
          detail: err.detail,
          hint: hint,
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
      console.log(err);
      if ([CHECK_VIOLATION].includes(err.code)) {
        const hint = 'Start date must come before end date.';
        console.error(err.message);
        return res.status(409).send({
          error: err.message,
          detail: err.detail,
          hint: hint,
        });
      }

      console.error(`Error updating committee assignment in database: ${err}`);
      return res
        .status(500)
        .send({ error: 'Unable to complete database transaction' });
    });
});

module.exports = router;
