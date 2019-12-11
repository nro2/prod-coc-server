const express = require('express');
const router = express.Router();

router.use('/committees', require('./committees'));
router.use('/department', require('./department'));
router.use('/departments', require('./departments'));
router.use('/department-associations', require('./department-associations'));
router.use('/faculty', require('./faculty'));

module.exports = router;
