
const router = require('express').Router();

router.use('/customers', require('./customers'));
router.use('/orders', require('./orders'));

module.exports = router;