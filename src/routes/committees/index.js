const express = require('express');
const router = express.Router();
const { getCommittees } = require('../../database/queries');

router.get('/', async (req, res) => {
  const committees = await getCommittees();

  if (!committees) {
    return res.status(500).send({ error: 'Unable to retrieve committees' });
  }

  return res.status(200).send(committees);
});

module.exports = router;
