const express = require('express');
const router = express.Router();
const {
  getCommitteeAssignmentByCommittee,
  getCommitteeAssignmentByFaculty,
} = require('../../database');

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

module.exports = router;
