const express = require('express');
const pool = require('../data/config');
const mysql = require('mysql');
const router = express.Router();

router.get('/', (req, res) => {
    const jobId = req.query.jobId;
    const labId = req.query.labId;

    if (jobId) {
        pool.query(`SELECT 
        h.jobId,
        h.jobDesc,
        h.labId,
        l.labName,
        h.orderId,
        o.orderDesc,
        c.name as custName,
        g.GPIX as groupId,
        g.NAME as groupName,
        g.DESC as groupDesc,
        h.createdBy,
        h.createdAt,
        h.appvId,
        h.appvAt,
        h.status
    FROM
        labdb.job_header h
            INNER JOIN
        labdb.lab_master l ON h.labId = l.labId
            INNER JOIN
        labdb.order_trans o ON h.orderId = o.orderId
            INNER JOIN
        labdb.customer_master c ON o.custId = c.custId
            INNER JOIN
        labdb.test_group_01 g ON h.test_group = g.GPIX
    WHERE
        h.jobId = ?`, [jobId], (error, result) => {
                if (error) throw error;

                res.send(result);
            });
    } else if (labId) {
        pool.query(`SELECT 
        h.jobId,
        h.jobDesc,
        h.labId,
        l.labName,
        h.orderId,
        o.orderDesc,
        c.name as custName,
        g.GPIX as groupId,
        g.NAME as groupName,
        g.DESC as groupDesc,
        h.createdBy,
        h.createdAt,
        h.appvId,
        h.appvAt,
        h.status
    FROM
        labdb.job_header h
            INNER JOIN
        labdb.lab_master l ON h.labId = l.labId
            INNER JOIN
        labdb.order_trans o ON h.orderId = o.orderId
            INNER JOIN
        labdb.customer_master c ON o.custId = c.custId
            INNER JOIN
        labdb.test_group_01 g ON h.test_group = g.GPIX
    WHERE
        h.labId = ?`, [labId], (error, result) => {
                if (error) throw error;

                res.send(result);
            });
    } else {
        pool.query(`
            SELECT 
                h.jobId,
                h.jobDesc,
                h.labId,
                l.labName,
                h.orderId,
                o.orderDesc,
                c.name as custName,
                g.GPIX as groupId,
                g.NAME as groupName,
                g.DESC as groupDesc,
                h.createdBy,
                h.createdAt,
                h.appvId,
                h.appvAt,
                h.status
            FROM
                labdb.job_header h
                    INNER JOIN
                labdb.lab_master l ON h.labId = l.labId
                    INNER JOIN
                labdb.order_trans o ON h.orderId = o.orderId
                    INNER JOIN
                labdb.customer_master c ON o.custId = c.custId
                    INNER JOIN
                labdb.test_group_01 g ON h.test_group = g.GPIX`,
            (error, result) => {
                if (error) throw error;

                res.send(result);
            });
    }
});

router.get('/items', (req, res) => {
    const jobId = req.query.jobId;
    if (!jobId) {
        return res.status(400).send({ error: "jobId required" });
    }

    pool.query(`SELECT 
    j.itemId,
    j.shortDesc AS itemDesc,
    t.GroupId,
    t.GroupValue,
    t.GroupDesc,
    t.ParamId,
    t.ParamValue,
    t.ParamDesc,
    t.MethodId,
    t.MethodValue,
    t.MethodDesc,
    t.UoM,
    s.sampleId,
    s.sampleName,
    s.sampleDesc,
    s.sampleCond,
    j.test_value,
    j.performBy,
    j.performAt,
    j.XFLAG
FROM
    labdb.job_item j
        INNER JOIN
    labdb.test_group_view t ON j.test_group = t.GroupId
        AND j.test_param = t.ParamId
        AND j.test_meth = t.MethodId
        INNER JOIN
    labdb.sample_data s ON j.sampleId = s.sampleId
WHERE
    j.jobId = ?`, [jobId], (error, result) => {
            if (error) throw error;

            res.send(result);
        });
});

// update job (perform save)
router.post('/performSave', (req, res) => {

    var jobId = req.body.jobId;

    // prepare records array of arrays
    var aItems = req.body.items.map((obj) => {
        let aItem = [obj.test_value, obj.performBy, new Date(), 'M', obj.jobId, obj.itemId];
        return aItem;
    });

    var queries = '';

    aItems.forEach(function (aItem) {
        queries += mysql.format("UPDATE `job_item` SET `test_value` = ?, `performBy` = ?, `performAt` = ?, `XFLAG` = ? WHERE (`jobId` = ?) and (`itemId` = ?); ", aItem);
    });

    pool.query(queries, function (error, results, fields) {
        if (error) {
            return res.status(500).send({
                error: true,
                message: error
            });
        } else {
            pool.query(mysql.format("UPDATE `job_header` SET `status` = 'P' WHERE (`jobId` = ?)", [jobId]));
            return res.status(201).send({
                "results": results
            });
        }
    });

});

// perform submit
router.post('/performSubmit', (req, res) => {

    var jobId = req.body.jobId;

    // prepare records array of arrays
    var aItems = req.body.items.map((obj) => {
        let aItem = [obj.test_value, obj.performBy, new Date(), 'T', obj.jobId, obj.itemId];
        return aItem;
    });

    var queries = '';

    aItems.forEach(function (aItem) {
        queries += mysql.format("UPDATE `job_item` SET `test_value` = ?, `performBy` = ?, `performAt` = ?, `XFLAG` = ? WHERE (`jobId` = ?) and (`itemId` = ?); ", aItem);
    });

    pool.query(queries, function (error, results, fields) {
        if (error) {
            return res.status(500).send({
                error: true,
                message: error
            });
        } else {
            // pool.query(mysql.format("UPDATE `job_header` SET `status` = 'P' WHERE (`jobId` = ?)", [jobId]));
            pool.query(`SELECT 
                            j.itemId,                            
                            j.XFLAG
                        FROM
                            labdb.job_item j                                
                        WHERE
                            j.jobId = ?`,
                [jobId],
                (e1, r1) => {
                    if (e1) {
                        throw e1;
                    } else {
                        let cFlag = 0;
                        r1.map(ro1 => {
                            if (ro1.XFLAG !== 'T') {
                                cFlag++;
                            }
                        });

                        if (cFlag > 0) {
                            //Set status to In Progress
                            pool.query(mysql.format("UPDATE `job_header` SET `status` = 'P' WHERE (`jobId` = ?)", [jobId]), (e2, r2) => {
                                if (e2) {
                                    res.status(201).send({
                                        "results": results,
                                        "info_r1": r1,
                                        "info_r2": e2
                                    });
                                    throw e2;
                                } else {
                                    return res.status(201).send({
                                        "results": results,
                                        "info_r1": r1,
                                        "info_r2": r2
                                    });
                                }

                            });
                        } else if (cFlag <= 0) {
                            //Set status Complete
                            pool.query(mysql.format("UPDATE `job_header` SET `status` = 'C' WHERE (`jobId` = ?)", [jobId]), (e2, r2) => {
                                if (e2) {
                                    res.status(201).send({
                                        "results": results,
                                        "info_r1": r1,
                                        "info_r2": e2
                                    });
                                    throw e2;
                                } else {
                                    return res.status(201).send({
                                        "results": results,
                                        "info_r1": r1,
                                        "info_r2": r2
                                    });
                                }
                            });
                        }
                    }

                });


        }
    });

});


//create job
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

    pool.query(`INSERT INTO job_header SET ? `, jobHead, function (error, results) {
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

            var sql = `INSERT INTO job_item (jobId, sampleId, test_group, test_param, test_meth, shortDesc, modifiedBy, modifiedAt, createdBy, createdAt) VALUES ?`;

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

module.exports = router;