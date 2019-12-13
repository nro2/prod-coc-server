const express = require('express');
const router = express.Router();

router.use('/committee', require('./committee'));
router.use('/committee-assignment', require('./committee-assignment'));
router.use('/committees', require('./committees'));
router.use('/department', require('./department'));
router.use('/departments', require('./departments'));
router.use('/department-associations', require('./department-associations'));
router.use('/faculty', require('./faculty'));
router.use('/senate-divisions', require('./senate-divisions'));

module.exports = router;
