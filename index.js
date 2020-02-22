const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors());
app.use(express.static('public'));
app.use(morgan('tiny'));

//use - routes
app.use('/', require('./routes/home'));
app.use('/api', require('./routes/api'));


const port = process.env.PORT || 3000;
console.log(port)
app.listen(port, () => console.log(`Listening on port ${port}`));