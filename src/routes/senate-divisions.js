const express = require('express');
const router = express.Router();
const { getSenateDivisions, messageResponses } = require('../database');

/**
 * @swagger
 *
 * /api/senate-divisions:
 *   get:
 *     tags:
 *       - senate-divisions
 *     description: Retrieves all senate divisions info.
 *     summary: Retrieves all senate divisions
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: "Senate divisions retrieved"
 *         schema:
 *           $ref: "#/responses/SenateDivisions"
 *       404:
 *         description: "Senate divisions not found"
 *       500:
 *         description: "Internal server error"
 */
router.get('/', async (req, res) => {
  return await getSenateDivisions()
    .then(data => {
      if (data.length === 0) {
        console.info('Found no senate division in the database');
        return res.status(404).send({ message: messageResponses[404] });
      }

      console.info('Successfully retrieved senate divisions from database');
      return res.status(200).send(data);
    })
    .catch(err => {
      console.error(`Error retrieving senate divisions: ${err}`);
      return res
        .status(500)
        .send({ message: messageResponses[500], error: err.message });
    });
});

module.exports = router;
