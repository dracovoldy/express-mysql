const router = require('express').Router();

router.use('/repository', require('./repository'));
router.use('/JB01', require('./JB01'));

module.exports = router;