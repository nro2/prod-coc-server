const express = require('express');
const router = express.Router();
const { getDepartments } = require('../../database');

router.get('/', async (req, res) => {
  const departments = await getDepartments();
  if (!departments) {
    return res.status(404).send({ error: 'Unable to retrieve departments' });
  }
  return res.status(200).send(departments);
});

module.exports = router;
