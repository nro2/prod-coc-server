const express = require('express');
const router = express.Router();
const db = require('./queries');

router.get('/', db.getFaculty);
router.get('/committees', db.getCommittees);
router.post('/', db.addFaculty);

module.exports = router;
