const pool = require('../../../data/config');
const mysql = require('mysql');
const router = require('express').Router();


/*
    GET: Job Review document(s) - Header Level
*/
router.post('/Docs', (req, res) => {

    const { labId, jobId, fromDate, toDate, status } = req.body   

    if (jobId) {
        pool.query(`SELECT * FROM labdb.job_header h 
                    WHERE h.job_id = ?
                    AND h.createdAt BETWEEN ? AND ?`, [jobId, fromDate, toDate],
            (err, results) => {
                if (err) {
                    throw err;
                }

                res.send({ results: results, count: results.length });
            });
    } else if (labId) {
        pool.query(`SELECT * FROM labdb.job_header h 
                    WHERE h.lab_id = ?
                    AND h.createdAt BETWEEN = ? AND ?`, [labId, fromDate, toDate],
            (err, results) => {
                if (err) {
                    throw err;
                }

                res.send({ results: results, count: results.length });
            });
    } else {
        pool.query(`SELECT 
        h.job_id, h.header_desc, h.lab_id, h.order_id, h.customer_id, h.dscpl_id, h.group_id, h.status_code, h.createdBy, h.createdAt,
        c.name as customer_name,
        d.disp_name,
        g.grp_desc,
        lab.labName as lab_name
        FROM labdb.job_header as h
        LEFT JOIN labdb.customer_master as c
        ON h.customer_id = c.custId
        LEFT JOIN labdb.disp as d
        ON h.dscpl_id = d.disp_id
        LEFT JOIN labdb.grps as g
        ON h.group_id = g.grp_id
        LEFT JOIN labdb.lab_master as lab
        ON h.lab_id = lab.labId
        WHERE h.createdAt BETWEEN ? AND ?`, [fromDate, toDate],
            (err, results) => {
                if (err) {
                    throw err;
                }

                res.send({ results: results, count: results.length });
            });
    }
});

/*
 *  GET: Reveiew Document Items
 */
router.get('/DocItems', (req, res) => {
    const jobId = req.query.jobId;
    if (!jobId) {
        return res.status(400).send({ error: "jobId required" });
    }

    pool.query(`SELECT * FROM labdb.job_item j WHERE j.jobId = ?`, [jobId], (error, result) => {
        if (error) throw error;

        res.send(result);
    });
});

/**
 *  GET: Approval Items
 */
router.get('/ApprovalItems', (req, res) => {

    const userName = 'MALLIKA';

    const query = `
    SELECT 
        h.job_id, h.header_desc, h.order_id, od.orderDesc as order_desc,c.name as customer_name,
        i.item_id, i.createdAt as created_at, i.createdBy as created_by, 
        i.sample_id, i.qty_value, i.qty_uom, 
        d.disp_name, g.grp_desc, pmat.pm_desc, tm1.tms_snam, tm2.tmt_name, 
        i.status
    FROM labdb.job_header h
    INNER JOIN	labdb.job_item i
        ON h.job_id = i.job_id
    LEFT JOIN labdb.customer_master as c
        ON h.customer_id = c.custId
    LEFT JOIN labdb.disp as d
        ON h.dscpl_id = d.disp_id
    LEFT JOIN labdb.grps as g
        ON h.group_id = g.grp_id
    LEFT JOIN labdb.lab_master as lab
        ON h.lab_id = lab.labId
    LEFT JOIN labdb.pmat as pmat
        ON i.test_product = pmat.pm_id
    LEFT JOIN labdb.tm01 as tm1
        ON i.test_master = tm1.tms_id
    LEFT JOIN labdb.tm02 as tm2
        ON i.test_type = tm2.tmt_id
    LEFT JOIN labdb.order_trans as od
        ON h.order_id = od.orderId
    WHERE h.approver_id = ?
        AND i.status = '000'
    ORDER BY created_at DESC`;
    
    pool.query(query, [userName], (error, results) => {
        if (error) throw error;

        res.send({ results: results, count: results.length });
    });
});


/**
 *  POST: Approve Item(s)
 *  Status Codes: 000 ... Review Created
 *                001 ... Review Approved
 *                002 ... Review Rejected
 *                010 ... Job Created, Assigned
 *                010 ... Job Created, Unassigned, Future
 *                012 ... Job Suspended
 *                020 ... Job In-Progress
 *                021 ... Job Pending
 *                100 ... Job Finished
 */
router.post('/ApprovalItems', (req, res) => {
    let { jobId, jobItem, comment, approver } = req.body;

    console.log(req.body);

    let query = `
    START TRANSACTION;
        # Get lock
        SELECT @id := i.job_id, @item := i.item_id, i.status FROM labdb.job_item i 
        WHERE i.job_id = ${pool.escape(jobId)} AND i.item_id = ${pool.escape(jobItem)} FOR SHARE;

        # Set variables
        SET @user = ${pool.escape(approver)};
        SET @comment = ${pool.escape(comment)};

        # Insert into job_apprv
        SELECT * FROM job_apprv FOR UPDATE;
        INSERT INTO job_apprv (job_id, job_item, action, createdBy, createdAt, comment)
        VALUES (@id, @item, '001', @user, NOW(), @comment);

        # Update status
        UPDATE labdb.job_item i 
        SET i.status = '001',
            i.modifiedBy = @user,
            i.modifiedAt = NOW()
        WHERE i.job_id = @id AND i.item_id = @item;
    COMMIT;
    `;   

    pool.query(query, [], (error, results) => {
        if (error) {
            return res.status(500).send({
                error: true,
                message: error
            });
        } else {           
            console.log(results); 
            return res.status(201).send({
                "results": results
            });
        }
    });
});


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