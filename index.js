const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

//Require Routes
const home = require('./routes/home');
const tests = require('./routes/tests');
const jobs = require('./routes/jobs');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(helmet());
app.use(cors());
app.use(express.static('public'));
app.use(morgan('tiny'));

//use - routes
app.use('/', home);
app.use('/api/tests', tests);
app.use('/api/jobs', jobs);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));