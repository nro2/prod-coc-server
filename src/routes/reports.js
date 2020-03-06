const express = require('express');
const router = express.Router();
const { getSenateDivisionStats, messageResponses } = require('../database');

/**
 * @swagger
 *
 * /api/reports:
 *   get:
 *     tags:
 *       - reports
 *     description: Retrieves report on senate division requirements for all committees.
 *     summary: Retrieve reports
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: "Report retrieved"
 *         schema:
 *           $ref: "#/responses/Reports"
 *       404:
 *         description: "Report not found"
 *       500:
 *         description: "Internal server error"
 */
router.get('/', async (req, res) => {
  return await getSenateDivisionStats()
    .then(data => {
      if (!data) {
        console.info(`No senate division stats found`);
        return res.status(404).send({ message: messageResponses[404] });
      }

      console.info(
        'Successfully retrieved all senate division stats info from database'
      );
      return res.status(200).send(data.json_build_object);
    })
    .catch(err => {
      console.error(`Error retrieving senate division stats info: ${err}`);
      return res
        .status(500)
        .send({ message: messageResponses[500], error: err.message });
    });
});

module.exports = router;
