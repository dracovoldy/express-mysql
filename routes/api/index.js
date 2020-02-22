const router = require('express').Router();

// const tests = require('./routes/tests');
// const jobs = require('./routes/jobs');
// const lookups = require('./routes/lookups');
// const customers = require('./routes/customers');
// const orders = require('./routes/orders');
// const samples = require('./routes/samples');

router.use('/sales', require('./sales'));
router.use('/mm', require('./mm'));
router.use('/review', require('./review'));
router.use('/testing', require('./testing'));
router.use('/commons', require('./commons'));

module.exports = router;

