const express = require('express');
const router = express.Router();
const db = require('../database/queries');

router.get('/', async (req, res) => {
  if (!req.query || !req.query.firstName) {
    return res.status(400).send({ message: '400 Bad Request' });
  }

  const faculty = await db.getFaculty(req.query.firstName);

  if (!faculty) {
    return res.status(404).send();
  }

  return res.status(200).send(faculty);
});

router.post('/', async (req, res) => {
  if (
    !req.body ||
    !req.body.firstName ||
    !req.body.lastName ||
    !req.body.phoneNum
  ) {
    return res.status(400).send({ message: '400 Bad Request' });
  }

  const { firstName, lastName, phoneNum } = req.body;

  const result = await db.addFaculty(firstName, lastName, phoneNum);

  if (!result) {
    return res
      .status(500)
      .send({ error: 'Unable to complete database transaction' });
  }

  return res.status(201).send();
});

router.get('/committees', async (req, res) => {
  const committees = await db.getCommittees();

  if (!committees) {
    return res.status(500).send({ error: 'Unable to retrieve committees' });
  }

  return res.status(200).send(committees);
});

router.get('/departments', async (req, res) => {
  const departments = await db.getDepartments();
  if (!departments) {
    return res.status(404).send({ error: 'Unable to retrieve departments' });
  }
  return res.status(200).send(departments);
});

module.exports = router;
