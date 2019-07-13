const express = require('express');
const pool = require('../data/config');
const router = express.Router();

router.get('/', (req, res) => {
    const jobId = req.query.jobId;
    const labId = req.query.labId;

    if (jobId) {
        pool.query('SELECT * FROM job_header as h WHERE h.jobId = ?', [jobId], (error, result) => {
            if (error) throw error;

            res.send(result);
        });
    } else if (labId) {
        pool.query('SELECT * FROM job_header as h WHERE h.labId = ?', [labId], (error, result) => {
            if (error) throw error;

            res.send(result);
        });
    } else {
        pool.query('SELECT * FROM job_header', (error, result) => {
            if (error) throw error;

            res.send(result);
        });
    }
});

router.get('/:id/items', (req, res) => {
    const jobId = req.params.id;

    pool.query('SELECT * FROM job_item as i WHERE i.jobId = ?', [jobId], (error, result) => {
        if (error) throw error;

        res.send(result);
    });
});

router.post('/items', (req, res) => {

    let records = req.body.items.map((item) => {
        let aItem = [item.jobId, item.sampleId, item.testGroupId, item.testParamId,
        item.testMethId, item.desc, item.createdBy, new Date(), item.createdBy, new Date()];

        return aItem;
    });

    // console.log(records);
    // return;

    var sql = "INSERT INTO job_item (jobId, sampleId, test_group, test_param, test_meth, shortDesc, modifiedBy, modifiedAt, createdBy, createdAt) VALUES ?";

    pool.query(sql, [records], function (error, results, fields) {
        if (error) throw error;
        return res.status(201).send(results);
    });
});



router.post('/', function (req, res) {

    var headerPayload = req.body.header;

    var jobHead = {
        "jobId": null,
        "orderId": headerPayload.orderId,
        "labId": headerPayload.labId,
        "test_group": headerPayload.testGroup,
        "jobDesc": headerPayload.jobDesc,        
        "createdBy": headerPayload.createdBy,
        "createdAt": new Date(),
        "appvId": headerPayload.approverId,
        "appvAt": null,
        "modifiedBy": headerPayload.createdBy,
        "modifiedAt": new Date(),
        "status": null
    };

    if (req.body.items.length < 1) {
        return res.status(400).send({
            error: true,
            message: "Items cannot be empty"
        });
    }

    // add validations later
    if (!jobHead) {
        return res.status(400).send({
            error: true,
            message: 'Malformed job header'
        });
    }

    pool.query("INSERT INTO job_header SET ? ", jobHead, function (error, results) {
        if (error) {

            return res.status(500).send({
                error: true,
                message: error
            });

        } else {

            var jobId = results.insertId;

            // prepare records array of arrays
            var records = req.body.items.map((item) => {
                let aItem = [jobId, item.sampleId, item.testGroupId, item.testParamId,
                    item.testMethId, item.desc, item.createdBy, new Date(), item.createdBy, new Date()];

                return aItem;
            });

            var sql = "INSERT INTO job_item (jobId, sampleId, test_group, test_param, test_meth, shortDesc, modifiedBy, modifiedAt, createdBy, createdAt) VALUES ?";

            pool.query(sql, [records], function (error, results) {
                if (error) {
                    return res.status(500).send({
                        error: true,
                        message: error
                    });

                } else {
                    return res.status(201).send({
                        "results": results,
                        "jobId": jobId
                    });
                }
            });

        }

    });
});

router.post('/test', function (req, res) {

    console.log(req);


});

module.exports = router;