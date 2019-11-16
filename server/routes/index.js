const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  return res.status(200).send("OK");
});

router.post('/', (req, res) => {
  return res.status(200).send("Request received");
});

module.exports = router;
