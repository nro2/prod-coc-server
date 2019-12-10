const express = require('express');
const router = express.Router();
const { getDepartment } = require('../../database');

router.get('/:id', async (req, res) => {
  if (!req.params.id) {
    return res.status(400).send({ message: '400 Bad Request' });
  }
  return await getDepartment(req.params.id)
    .then(data => {
      console.info('Successfully retrieved department from database');
      res.status(200).send(data);
    })
    .catch(err => {
      console.error(`Error retrieving department: ${err}`);
      return res
        .status(500)
        .send({ error: 'Unable to complete database transaction' });
    });
});

module.exports = router;
