const pool = require('../../../data/config');
const mysql = require('mysql');
const router = require('express').Router();

/**
 *  GET: Approval Items
 */
router.get('/', (req, res) => {

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
router.post('/', (req, res) => {
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


module.exports = router;