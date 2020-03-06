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
  messageResponses,
} = require('../database');

/**
 * @swagger
 *
 * /api/faculty:
 *   post:
 *     tags:
 *       - faculty
 *     description: Add a faculty member to the database.
 *     summary: Add faculty
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: "Faculty object that needs to be added to the database"
 *         required: true
 *         schema:
 *           $ref: "#/definitions/Faculty"
 *     responses:
 *       201:
 *         description: "Resource created"
 *       400:
 *         description: "Request is missing required fields"
 *       409:
 *         description: "Conflict"
 *       500:
 *         description: "Internal server error"
 */
router.post('/', async (req, res) => {
  if (
    !req.body ||
    !req.body.fullName ||
    !req.body.email ||
    !req.body.senateDivision
  ) {
    return res.status(400).send({ message: messageResponses[400] });
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
          message: messageResponses[400],
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
        .send({ message: messageResponses[201] });
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
        const hint = 'Attempted to add faculty with invalid keys';
        console.error(
          `Attempted to add faculty with invalid keys:\n ${message} \n ${detail}`
        );
        return res
          .status(409)
          .send({ message: message, error: detail, hint: hint });
      }

      console.error(`Error adding faculty member to database:\n ${err}`);
      return res.status(500).send({
        message: messageResponses[500],
        error: err.message,
      });
    });
});
/**
 * @swagger
 *
 * /api/faculty:
 *   put:
 *     tags:
 *       - faculty
 *     description: Update an existing faculty member.
 *     summary: Update faculty member by email
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: "Faculty object that needs to be updated in the database"
 *         required: true
 *         schema:
 *           $ref: "#/definitions/Faculty"
 *     responses:
 *       200:
 *         description: "Resource updated"
 *       400:
 *         description: "Request is missing required fields"
 *       409:
 *         description: "Faculty email doesn't match expected values"
 *       500:
 *         description: "Internal server error"
 */
router.put('/', async (req, res) => {
  if (
    !req.body ||
    !req.body.fullName ||
    !req.body.email ||
    !req.body.senateDivision
  ) {
    return res.status(400).send({ message: messageResponses[400] });
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
          message: messageResponses[400],
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
        return res.status(404).send({ message: messageResponses[404] });
      }
      console.info('Updated faculty member to database');

      console.info(`Updated faculty member with email ${email}`);
      return res
        .set('Location', `${SERVER_URL}/api/faculty/${email}`)
        .status(200)
        .send({ message: messageResponses[200] });
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
        const hint = 'Attempted to update faculty with invalid keys';
        console.error(
          `Attempted to update faculty with invalid keys:\n ${message} \n ${detail}`
        );
        return res
          .status(409)
          .send({ message: message, error: detail, hint: hint });
      }

      console.error(`Error adding faculty member to database:\n ${err}`);
      return res.status(500).send({
        message: messageResponses[500],
        error: err.message,
      });
    });
});

/**
 * @swagger
 *
 * /api/faculty:
 *   get:
 *     tags:
 *       - faculty
 *     description: Retrieve list of all faculty members.
 *     summary: Get all faculty
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: "Faculty successfully retrieved"
 *         schema:
 *           $ref: "#/responses/FacultyList"
 *       404:
 *         description: "Faculty list not found"
 *       500:
 *         description: "Internal server error"
 */
router.get('/', async (req, res) => {
  return await getAllFaculty()
    .then(data => {
      if (data.length === 0) {
        console.info('Faculty table is empty');
        return res.status(404).send({ message: messageResponses[404] });
      }

      console.info('Successfully retrieved faculty list from the database');
      return res.status(200).send(data);
    })
    .catch(err => {
      console.error(`Error retrieving faculty: ${err}`);
      return res
        .status(500)
        .send({ message: messageResponses[500], error: err.message });
    });
});

/**
 * @swagger
 *
 * /api/faculty/{email}:
 *   get:
 *     tags:
 *       - faculty
 *     description: Retrieve a faculty member from the database.
 *     summary: Get a faculty member by email
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: "Faculty member successfully retrieved"
 *         schema:
 *           $ref: "#/responses/Faculty"
 *       404:
 *         description: "Faculty member not found"
 *       500:
 *         description: "Internal server error"
 */
router.get('/:email', async (req, res) => {
  return await getFaculty(req.params.email)
    .then(data => {
      if (!data) {
        console.info(`No faculty found for email ${req.params.email}`);
        return res.status(404).send({ message: messageResponses[404] });
      }

      console.info('Successfully retrieved faculty from database');
      return res.status(200).send(data);
    })
    .catch(err => {
      console.error(`Error retrieving faculty: ${err}`);
      return res
        .status(500)
        .send({ message: messageResponses[500], error: err.message });
    });
});

/**
 * @swagger
 *
 * /api/faculty/info/{email}:
 *   get:
 *     tags:
 *       - faculty
 *     description: Retrieve all faculty member information from the database.
 *     summary: Get a faculty members information by email
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: "Faculty member successfully retrieved"
 *         schema:
 *           $ref: "#/responses/FacultyInfo"
 *       404:
 *         description: "Faculty member not found"
 *       500:
 *         description: "Internal server error"
 */
router.get('/info/:email', async (req, res) => {
  return await getFacultyInfo(req.params.email)
    .then(data => {
      if (!data) {
        console.info(`No faculty found for email ${req.params.email}`);
        return res.status(404).send({ message: messageResponses[404] });
      }

      console.info('Successfully retrieved faculty from database');
      return res.status(200).send(data);
    })
    .catch(err => {
      console.error(`Error retrieving faculty info: ${err}`);
      return res
        .status(500)
        .send({ message: messageResponses[500], error: err.message });
    });
});

module.exports = router;
