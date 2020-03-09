const express = require('express');
const router = express.Router();
const { SERVER_URL } = require('../config');
const {
  addDepartmentAssociation,
  getDepartmentAssociationsByDepartment,
  getDepartmentAssociationsByFaculty,
  updateDepartmentAssociations,
  FOREIGN_KEY_VIOLATION,
  UNIQUENESS_VIOLATION,
  messageResponses,
} = require('../database');

/**
 * @swagger
 *
 * /api/department-associations:
 *   post:
 *     tags:
 *       - department-associations
 *     description: Add a department association to the database.
 *     summary: Add department association
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: "Department associations object that needs to be added to the database"
 *         required: true
 *         schema:
 *           $ref: "#/definitions/DepartmentAssociations"
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
  if (!req.body || !req.body.email || !req.body.departmentId) {
    return res.status(400).send({ message: messageResponses[400] });
  }

  const { email, departmentId } = req.body;

  return addDepartmentAssociation(email, departmentId)
    .then(result => {
      console.info('Successfully added department association to database');
      const { email } = result;
      return res
        .set(
          'Location',
          `${SERVER_URL}/api/department-associations/faculty/${email}`
        )
        .status(201)
        .send({ message: messageResponses[201] });
    })
    .catch(err => {
      if ([FOREIGN_KEY_VIOLATION, UNIQUENESS_VIOLATION].includes(err.code)) {
        const hint =
          'Attempted to add an existing committee association with invalid keys';
        console.error(
          `Attempted to add an existing committee association with invalid keys: ${err}`
        );
        return res
          .status(409)
          .send({ message: err.message, detail: err.detail, hint: hint });
      }

      console.error(`Error adding department association: ${err}`);
      return res
        .status(500)
        .send({ message: 'Internal Server Error', error: err.message });
    });
});

/**
 * @swagger
 *
 * /api/department-associations/department/{id}:
 *   get:
 *     tags:
 *       - department-associations
 *     description: Retrieves all faculty members associated with a department.
 *     summary: Retrieve department associations by department
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: integer
 *         format: int64
 *     responses:
 *       200:
 *         description: "Department associations retrieved"
 *         schema:
 *           $ref: "#/responses/DepartmentAssociationsId"
 *       404:
 *         description: "Department associations not found"
 *       500:
 *         description: "Internal server error"
 */

router.get('/department/:id', async (req, res) => {
  return await getDepartmentAssociationsByDepartment(req.params.id)
    .then(data => {
      if (data.length === 0) {
        console.info(`No department association found for id ${req.params.id}`);
        return res.status(404).send({ message: messageResponses[404] });
      }

      console.info('Successfully retrieved department association from database');
      return res.status(200).send(data);
    })
    .catch(err => {
      console.error(`Error retrieving department association: ${err}`);
      return res
        .status(500)
        .send({ message: 'Internal Server Error', error: err.message });
    });
});

/**
 * @swagger
 *
 * /api/department-associations/faculty/{email}:
 *   get:
 *     tags:
 *       - department-associations
 *     description: Retrieves all departments associated with a faculty member.
 *     summary: Retrieve department associations by faculty
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: "Department associations retrieved"
 *         schema:
 *           $ref: "#/responses/DepartmentAssociationsEmail"
 *       404:
 *         description: "Department associations not found"
 *       500:
 *         description: "Internal server error"
 */

router.get('/faculty/:email', async (req, res) => {
  return await getDepartmentAssociationsByFaculty(req.params.email)
    .then(data => {
      if (data.length === 0) {
        console.info(
          `No department association found for email ${req.params.email}`
        );
        return res.status(404).send({ message: messageResponses[404] });
      }

      console.info('Successfully retrieved department association from database');
      return res.status(200).send(data);
    })
    .catch(err => {
      console.error(`Error retrieving department association: ${err}`);
      return res
        .status(500)
        .send({ message: 'Internal Server Error', error: err.message });
    });
});

/**
 * @swagger
 *
 * /api/department-associations:
 *   put:
 *     tags:
 *       - department-associations
 *     description: Update an existing department-association.
 *     summary: Update department-associations
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: "Department-association object that needs to be updated in the database"
 *         required: true
 *         schema:
 *           $ref: "#/definitions/DepartmentAssociationsPut"
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

router.put('/', async (req, res) => {
  if (
    !req.body ||
    !req.body.email ||
    !req.body.oldDepartmentId ||
    !req.body.newDepartmentId
  ) {
    return res.status(400).send({ message: messageResponses[400] });
  }

  const { email, oldDepartmentId, newDepartmentId } = req.body;

  return await updateDepartmentAssociations(email, oldDepartmentId, newDepartmentId)
    .then(result => {
      if (!result.rowCount) {
        console.info(
          `Unable to update department association, email ${email} does not exist`
        );
        return res.status(404).send({ message: messageResponses[404] });
      }
      console.info(`Updated department association with email ${email}`);
      return res.status(200).send({ message: messageResponses[200] });
    })
    .catch(err => {
      console.error(`Error updating department association in database: ${err}`);
      return res
        .status(500)
        .send({ message: 'Internal Server Error', error: err.message });
    });
});

module.exports = router;
