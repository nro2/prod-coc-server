const express = require('express');
const router = express.Router();
const { SERVER_URL } = require('../config');
const {
  addFaculty,
  updateFaculty,
  getAllFaculty,
  getFaculty,
  getFacultyInfo,
  FOREIGN_KEY_VIOLATION,
  UNIQUENESS_VIOLATION,
} = require('../database');

router.post('/', async (req, res) => {
  if (
    !req.body ||
    !req.body.fullName ||
    !req.body.email ||
    !req.body.senateDivision
  ) {
    return res.status(400).send({ message: '400 Bad Request' });
  }

  const {
    fullName,
    email,
    jobTitle,
    phoneNum,
    senateDivision,
    departmentAssociations,
  } = req.body;

  if (Array.isArray(departmentAssociations) && departmentAssociations.length) {
    departmentAssociations.forEach(d => {
      if (Object.entries(d).length === 0 && d.constructor === Object) {
        return res.status(400).send({
          message: '400 Bad Request',
          error:
            'JSON includes deaprtmentAssocitions object, but department_id is undefined/missing',
        });
      }
    });
  }

  return await addFaculty(
    fullName,
    email,
    jobTitle,
    phoneNum,
    senateDivision,
    departmentAssociations
  )
    .then(result => {
      console.info('Added faculty member to database');

      let e = {};

      if (Array.isArray(result) && result.length) {
        e = { return: result[0].email };
      } else {
        e = { return: result.email };
      }

      return res
        .set('Location', `${SERVER_URL}/api/faculty/${e.return}`)
        .status(201)
        .send();
    })
    .catch(err => {
      let code;
      let message;
      let detail;

      if (!err.stat) {
        code = err.code;
        message = err.message;
        detail = err.detail;
      } else {
        code = err.first.code;
        message = err.first.message;
        detail = err.first.detail;
      }

      if ([FOREIGN_KEY_VIOLATION, UNIQUENESS_VIOLATION].includes(code)) {
        console.error(
          `Attempted to add faculty with invalid keys:\n ${message} \n ${detail}`
        );
        return res.status(409).send({ msg: message, error: detail });
      }

      console.error(`Error adding faculty member to database:\n ${err}`);
      return res.status(500).send({
        msg: 'Unable to complete database transaction',
        error: err.message,
      });
    });
});

router.put('/', async (req, res) => {
  if (
    !req.body ||
    !req.body.fullName ||
    !req.body.email ||
    !req.body.senateDivision
  ) {
    return res.status(400).send({ message: '400 Bad Request' });
  }

  const {
    fullName,
    email,
    jobTitle,
    phoneNum,
    senateDivision,
    departmentAssociations,
  } = req.body;

  if (Array.isArray(departmentAssociations) && departmentAssociations.length) {
    departmentAssociations.forEach(d => {
      if (Object.entries(d).length === 0 && d.constructor === Object) {
        return res.status(400).send({
          message: '400 Bad Request',
          error:
            'JSON includes deaprtmentAssocitions object, but department_id is undefined/missing',
        });
      }
    });
  }

  return await updateFaculty(
    fullName,
    email,
    jobTitle,
    phoneNum,
    senateDivision,
    departmentAssociations
  )
    .then(result => {
      if (!result[0].rowCount) {
        console.info(
          `Unable to update faculty record, email ${email} does not exist`
        );
        return res.status(404).send();
      }
      console.info('Updated faculty member to database');

      let e = {};

      if (Array.isArray(result) && result.length) {
        e = { return: result[0].email };
      } else {
        e = { return: result.email };
      }

      console.info(`Updated faculty member with email ${email}`);
      return res
        .set('Location', `${SERVER_URL}/api/faculty/${e.return}`)
        .status(200)
        .send();
    })
    .catch(err => {
      let code;
      let message;
      let detail;

      if (!err.stat) {
        code = err.code;
        message = err.message;
        detail = err.detail;
      } else {
        code = err.first.code;
        message = err.first.message;
        detail = err.first.detail;
      }

      if ([FOREIGN_KEY_VIOLATION, UNIQUENESS_VIOLATION].includes(code)) {
        console.error(
          `Attempted to update faculty with invalid keys:\n ${message} \n ${detail}`
        );
        return res.status(404).send({ msg: message, error: detail });
      }

      console.error(`Error adding faculty member to database:\n ${err}`);
      return res.status(500).send({
        msg: 'Unable to complete database transaction',
        error: err.message,
      });
    });
});

router.get('/', async (req, res) => {
  return await getAllFaculty()
    .then(data => {
      if (data.length === 0) {
        console.info('Faculty table is empty');
        return res.status(404).send();
      }

      console.info('Successfully retrieved faculty list from the database');
      return res.status(200).send(data);
    })
    .catch(err => {
      console.error(`Error retrieving faculty: ${err}`);
      return res
        .status(500)
        .send({ error: 'Unable to complete database transaction' });
    });
});

router.get('/:email', async (req, res) => {
  if (!req.params.email) {
    return res.status(400).send({ message: '400 Bad Request' });
  }
  return await getFaculty(req.params.email)
    .then(data => {
      if (!data) {
        console.info(`No faculty found for email ${req.params.email}`);
        return res.status(404).send();
      }

      console.info('Successfully retrieved faculty from database');
      return res.status(200).send(data);
    })
    .catch(err => {
      console.error(`Error retrieving faculty: ${err}`);
      return res
        .status(500)
        .send({ error: 'Unable to complete database transaction' });
    });
});

router.get('/info/:email', async (req, res) => {
  if (!req.params.email) {
    return res.status(400).send({ message: '400 Bad Request' });
  }
  return await getFacultyInfo(req.params.email)
    .then(data => {
      if (!data) {
        console.info(`No faculty found for email ${req.params.email}`);
        return res.status(404).send();
      }

      console.info('Successfully retrieved faculty from database');
      return res.status(200).send(data);
    })
    .catch(err => {
      console.error(`Error retrieving faculty info: ${err}`);
      return res
        .status(500)
        .send({ error: 'Unable to complete database transaction' });
    });
});

module.exports = router;
