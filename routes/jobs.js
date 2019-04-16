const express = require('express');
const pool = require('../data/config');
const router = express.Router();

router.get('/', (req, res) => {
    const jobId = req.query.id;
    const labId = req.query.lab;

    if (jobId) {
        pool.query('SELECT * FROM JOBH as h WHERE h.JOBIX = ?', [jobId], (error, result) => {
            if (error) throw error;

            res.send(result);
        });
    } else if (labId) {
        pool.query('SELECT * FROM JOBH as h WHERE h.LABIX = ?', [labId], (error, result) => {
            if (error) throw error;

            res.send(result);
        });
    } else {
        pool.query('SELECT * FROM JOBH', (error, result) => {
            if (error) throw error;

            res.send(result);
        });
    }
});

router.get('/:id/items', (req, res) => {
    const jobId = req.params.id;

    pool.query('SELECT * FROM JOBI as i WHERE i.JOBIX = ?', [jobId], (error, result) => {
        if (error) throw error;

        res.send(result);
    });
});

router.post('/', function (req, res) {
 
    let task = {};
    task.JOBIX = null;
    task.LABIX = req.body.LabIndex;
    task.SPLIX = req.body.SampleIndex;
    task.TGIX = req.body.TestGroup;
    task.ISSUED_BY = req.body.Issuer;    
    task.APPV_BY = req.body.Approver;
    
 
    if (!task) {
        return res.status(400).send({ error:true, message: 'Please provide task' });
    }
 
    pool.query("INSERT INTO JOBH SET ? ", task, function (error, results, fields) {
        if (error) throw error;
        return res.status(201).send(results);
    });
});

module.exports = router;