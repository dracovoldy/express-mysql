const router = require('express').Router();

router.use('/samples', require('./samples'));

module.exports = router;