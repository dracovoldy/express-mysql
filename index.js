const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

//Require Routes
const home = require('./routes/home');
const tests = require('./routes/tests');
const jobs = require('./routes/jobs');
const lookups = require('./routes/lookups');
const customers = require('./routes/customers');
const orders = require('./routes/orders');
const samples = require('./routes/samples');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors());
app.use(express.static('public'));
app.use(morgan('tiny'));

//use - routes
app.use('/', home);
app.use('/api/tests', tests);
app.use('/api/jobs', jobs);
app.use('/api/lookups', lookups);
app.use('/api/customers', customers);
app.use('/api/orders', orders);
app.use('/api/samples', samples);

const port = process.env.PORT || 3000;
console.log(port)
app.listen(port, () => console.log(`Listening on port ${port}`));