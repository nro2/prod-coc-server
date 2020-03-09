const express = require('express');
const router = express.Router();
const { getDepartment, messageResponses } = require('../database');

/**
 * @swagger
 *
 * /api/department/{id}:
 *   get:
 *     tags:
 *       - department
 *     description: Get a department from the database.
 *     summary: Get department
 *     consumes:
 *       - application/json
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
 *         description: "Department retrieved"
 *         schema:
 *           $ref: "#/responses/Department"
 *       404:
 *         description: "Department not found"
 *       500:
 *         description: "Internal server error"
 */

router.get('/:id', async (req, res) => {
  return await getDepartment(req.params.id)
    .then(data => {
      console.info('Successfully retrieved department from database');
      return res.status(200).send(data);
    })
    .catch(err => {
      if (err.result && err.result.rowCount === 0) {
        console.info(
          `Found no department in the database with id ${req.params.id}`
        );
        return res.status(404).send({ message: messageResponses[404] });
      }

      console.error(`Error retrieving department: ${err}`);
      return res
        .status(500)
        .send({ message: messageResponses[500], error: err.message });
    });
});

module.exports = router;
