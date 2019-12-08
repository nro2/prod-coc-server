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

router.get('/departments/:id', async (req, res) => {
  if (!req.params.id) {
    return res.status(400).send({ message: '400 Bad Request' });
  }
  return await db
    .getDepartment(req.params.id)
    .then(data => {
      console.info('Successfully retrieved department from database');
      res.status(200).send(data);
    })
    .catch(err => {
      console.error(`Error retrieving department: ${err}`);
      return res
        .status(404)
        .send({ error: 'Unable to complete database transaction' });
    });
});

router.post('/faculty', async (req, res) => {
  if (
    !req.body ||
    !req.body.fullName ||
    !req.body.email ||
    !req.body.jobTitle ||
    !req.body.phoneNum ||
    !req.body.senateDivision
  ) {
    return res.status(400).send({ message: '400 Bad Request' });
  }

  const { fullName, email, jobTitle, phoneNum, senateDivision } = req.body;

  return await db
    .addFaculty(fullName, email, jobTitle, phoneNum, senateDivision)
    .then(() => {
      console.info('Added faculty member to database');
      return res.status(201).send();
    })
    .catch(err => {
      if (err.code === db.UNIQUENESS_VIOLATION) {
        console.error(
          `Attempted to add an existing faculty with a non unique-key: ${err}`
        );
        return res.status(409).send();
      }

      console.error(`Error adding faculty member to database: ${err}`);
      return res
        .status(500)
        .send({ error: 'Unable to complete database transaction' });
    });
});

router.get('/committees', async (req, res) => {
  const committees = await db.getCommittees();

  if (!committees) {
    return res.status(500).send({ error: 'Unable to retrieve committees' });
  }

  return res.status(200).send(committees);
});

module.exports = router;
