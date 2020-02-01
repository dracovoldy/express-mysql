// const Joi = require('joi');

const router = require('express').Router();

router.get('/', (req, res) => {
    res.send("I'm alive");
});

module.exports = router;