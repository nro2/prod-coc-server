const express = require('express');
const router = express.Router();
const { getSenateDivision, messageResponses } = require('../database');

/**
 * @swagger
 *
 * /api/senate-division/{name}:
 *   get:
 *     tags:
 *       - senate-division
 *     description: Retrieves senate division info by name.
 *     summary: Retrieve senate division
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: name
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: "Senate division retrieved"
 *         schema:
 *           $ref: "#/responses/SenateDivision"
 *       404:
 *         description: "Senate division not found"
 *       500:
 *         description: "Internal server error"
 */

router.get('/:name', async (req, res) => {
  return await getSenateDivision(req.params.name)
    .then(data => {
      console.info('Successfully retrieved senate division from database');
      return res.status(200).send(data);
    })
    .catch(err => {
      if (err.result && err.result.rowCount === 0) {
        console.info('Found no senate division in the database');
        return res.status(404).send({ message: messageResponses[404] });
      }

      console.error(`Error retrieving senate division: ${err}`);
      return res
        .status(500)
        .send({ message: 'Internal Server Error', error: err.message });
    });
});

module.exports = router;
