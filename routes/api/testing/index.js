const router = require('express').Router();

router.use('/repository', require('./repository'));
router.use('/JB01', require('./JB01'));
router.use('/JB03', require('./JB03'));


module.exports = router;