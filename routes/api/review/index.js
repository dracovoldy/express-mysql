const pool = require('../../../data/config');
const mysql = require('mysql');
const router = require('express').Router();

router.use('/RD50', require('./RD50'));
router.use('/RD03', require('./RD03'));


/*
    TODO: Reveiew Document Save
*/
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

/*
    TODO: Reveiew Document Submit after save - may be deprecated
*/
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


/*
    Deep Create Review Document

*/
router.post('/', function (req, res) {

    var jobHead = {
        "job_id": null,
        "customer_id": req.body.hJob.customerId,
        "order_id": req.body.hJob.orderId,
        "lab_id": req.body.hJob.labId,
        "dscpl_id": req.body.hJob.disciplineId,
        "group_id": req.body.hJob.groupId,
        "approver_id": req.body.hJob.approverId,
        "status_code": null,
        "header_desc": req.body.hJob.hText,
        "createdBy": req.body.hJob.issuerId,
        "createdAt": new Date(),
        "modifiedBy": null,
        "modifiedAt": null
    };

    if (req.body.iJob.length <= 0) {
        return res.status(400).send({
            error: true,
            message: "Job Items Missing Error"
        });
    }

    // add validations later
    if (!jobHead) {
        return res.status(400).send({
            error: true,
            message: 'Malformed Job Header'
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
            var records = req.body.iJob.map((item) => {
                let aItem = [jobId, item.sampleId, item.qty, item.qtyUom, item.testProduct, item.testMaster,
                    item.testType, item.tcCode, item.qsCode, jobHead.createdBy, new Date(), '000'];

                return aItem;
            });

            var sql = `INSERT INTO job_item (job_id, sample_id, qty_value, qty_uom, test_product, test_master, test_type, tc_flag, qs_flag, createdBy, createdAt, status) VALUES ?`;

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