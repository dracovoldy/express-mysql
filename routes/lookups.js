const express = require('express');
const pool = require('../data/config');
const router = express.Router();

// lab_master lookups
router.get('/labs', (req, res) => {

    pool.query('SELECT * FROM lab_master', (error, result) => {
        if (error) throw error;
        res.send(result);
    });

});

// sample data lookups
router.get('/samples', (req, res) => {

    pool.query('SELECT * FROM sample_data', (error, result) => {
        if (error) throw error;
        res.send(result);
    });

});

// user lookups
router.get('/users', (req, res) => {

    pool.query('SELECT * FROM user_master', (error, result) => {
        if (error) throw error;
        res.send(result);
    });

});

// test groups lookups
router.get('/testGroups', (req, res) => {

    pool.query('SELECT * FROM test_group_01', (error, result) => {
        if (error) throw error;
        res.send(result);
    });

});

// test parameters lookups
router.get('/testParams', (req, res) => {
    let groupId = req.query.groupId;

    if (groupId) {
        pool.query('SELECT DISTINCT ParamId, Paramvalue, ParamDesc FROM test_group_view where GroupId = ?', [groupId], (error, result) => {
            if (error) throw error;
            res.send(result);
        });
    }

});

// test parameters lookups
router.get('/testMethods', (req, res) => {
    let groupId = req.query.groupId;
    let paramId = req.query.paramId;

    if (groupId && paramId) {
        pool.query('SELECT DISTINCT MethodId, MethodValue, MethodDesc\t' +
        'FROM test_group_view WHERE GroupId = ? AND ParamId = ?', [groupId, paramId], (error, result) => {
            if (error) throw error;
            res.send(result);
        });
    }

});

module.exports = router;