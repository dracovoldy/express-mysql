const Joi = require('joi');
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send("I'm alive");
});

module.exports = router;