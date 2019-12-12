const express = require('express');
const router = express.Router();
const { getDepartmentAssociationsFaculty } = require('../../database');

router.get('/faculty/:email', async (req, res) => {
  if (!req.params.email) {
    return res.status(400).send({ message: '400 Bad Request' });
  }
  return await getDepartmentAssociationsFaculty(req.params.email)
    .then(data => {
      if (data.length === 0) {
        console.info(
          `No department association found for email ${req.params.email}`
        );
        return res.status(404).send();
      }

      console.info('Successfully retrieved department association from database');
      return res.status(200).send(data);
    })
    .catch(err => {
      console.error(`Error retrieving department association: ${err}`);
      return res
        .status(500)
        .send({ error: 'Unable to complete database transaction' });
    });
});

module.exports = router;
