const pool = require('../../../data/config');
const router = require('express').Router();

/**
 *  GET: Returns Jobs List for Lab Operator
 */

router.get('/', (req, res) => {
    
    const { labUser } = req.query;

    if (!labUser) {
        return res.status(400).send({ error: "labUser required" });
    }

    const query = `
    SELECT 
        h.job_id, i.item_id, i.sample_id,
        sp.sampleName, sp.sampleDesc, sp.sampleCond, sp.sampleCKey,
        i.qty_value, i.qty_uom,
        d.disp_name, g.grp_desc, pmat.pm_desc, tm1.tms_snam, tm2.tmt_name,
        i.status, ap.actionUser assignedTo, ap.createdBy assignedBy, ap.createdAt assignedAt
    FROM labdb.job_header h
    INNER JOIN labdb.job_item i
        ON h.job_id = i.job_id
    LEFT JOIN labdb.sample_data sp
        ON i.sample_id = sp.sampleId
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
    INNER JOIN labdb.job_apprv ap
        ON i.job_id = ap.job_id
        AND i.item_id = ap.job_item
        AND i.status = ap.action
    WHERE 
        i.status = '012' OR i.status = '020'
        AND ap.del_ind is null
        AND ap.actionUser = ${pool.escape(labUser)}
    ORDER BY 
        h.job_id asc,
        i.item_id asc`;

    
    pool.query(query, [], (error, results) => {
        if (error) throw error;
        res.send(results);
    });
});

/**
 *  GET: Returns specific Job-Item if applicable to operator
 */

router.get('/refresh', (req, res) => {
    
    const { labUser, jobId, itemId, isAfterSubmit } = req.query;

    if (!labUser || !jobId || !itemId) {
        return res.status(400).send({ error: "labUser required" });
    }

    if(isAfterSubmit) {
        const query = `
        SELECT 
            h.job_id, i.item_id, i.sample_id,
            sp.sampleName, sp.sampleDesc, sp.sampleCond, sp.sampleCKey,
            i.qty_value, i.qty_uom,
            d.disp_name, g.grp_desc, pmat.pm_desc, tm1.tms_snam, tm2.tmt_name,
            i.status, ap.actionUser assignedTo, ap.createdBy assignedBy, ap.createdAt assignedAt,
            pf.value performValue, pf.comments performComments
        FROM labdb.job_header h
        INNER JOIN labdb.job_item i
            ON h.job_id = i.job_id
        LEFT JOIN labdb.sample_data sp
            ON i.sample_id = sp.sampleId
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
        INNER JOIN labdb.job_perform as pf
            ON h.job_id = pf.job_id
            AND i.item_id = pf.item_id
        INNER JOIN labdb.job_apprv ap
            ON i.job_id = ap.job_id
            AND i.item_id = ap.job_item
            AND i.status = ap.action
        WHERE 
            i.status = '100'
            AND ap.del_ind is null
            AND pf.del_ind is null
            AND ap.actionUser = ${pool.escape(labUser)}
            AND h.job_id = ${pool.escape(jobId)}
            AND i.item_id = ${pool.escape(itemId)}
        ORDER BY 
            h.job_id asc,
            i.item_id asc`;
    
        
        pool.query(query, [], (error, results) => {
            if (error) throw error;
            res.send(results);
        });
    }else {
        const query = `
    SELECT 
        h.job_id, i.item_id, i.sample_id,
        sp.sampleName, sp.sampleDesc, sp.sampleCond, sp.sampleCKey,
        i.qty_value, i.qty_uom,
        d.disp_name, g.grp_desc, pmat.pm_desc, tm1.tms_snam, tm2.tmt_name,
        i.status, ap.actionUser assignedTo, ap.createdBy assignedBy, ap.createdAt assignedAt
    FROM labdb.job_header h
    INNER JOIN labdb.job_item i
        ON h.job_id = i.job_id
    LEFT JOIN labdb.sample_data sp
        ON i.sample_id = sp.sampleId
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
    INNER JOIN labdb.job_apprv ap
        ON i.job_id = ap.job_id
        AND i.item_id = ap.job_item
        AND i.status = ap.action
    WHERE 
        i.status = '012' OR i.status = '020'
        AND ap.del_ind is null
        AND ap.actionUser = ${pool.escape(labUser)}
        AND h.job_id = ${pool.escape(jobId)}
        AND i.item_id = ${pool.escape(itemId)}
    ORDER BY 
        h.job_id asc,
        i.item_id asc`;

    
    pool.query(query, [], (error, results) => {
        if (error) throw error;
        res.send(results);
    });
    }

    
});

/**
 *  POST: Change Job Status
 *  Status Codes: 000 ... Review Created
 *                001 ... Review Approved
 *                002 ... Review Rejected
 *                011 ... Job Created, Unassigned
 *                012 ... Job Assigned *                
 *                020 ... Job In-Progress
 *                021 ... Job Pending
 *                100 ... Job Finished
*                 090 ... Job Suspended
 */
router.post('/setStatusWIP', (req, res) => {
    let { jobId, jobItem, comment, actionUser } = req.body;

    console.log(req.body);

    let query = `
    START TRANSACTION;
        # Get lock
        SELECT @id := i.job_id, @item := i.item_id, i.status FROM labdb.job_item i 
        WHERE i.job_id = ${pool.escape(jobId)} AND i.item_id = ${pool.escape(jobItem)} FOR SHARE;

        # Set variables
        SET @user = ${pool.escape(actionUser)};
        SET @comment = ${pool.escape(comment)};

        # Insert into job_apprv
        SELECT * FROM job_apprv FOR UPDATE;
        INSERT INTO job_apprv (job_id, job_item, action, actionUser, createdBy, createdAt, comment)
        VALUES      
        (@id, @item, '020', @user, @user, NOW(), @comment);

        # Update status
        UPDATE labdb.job_item i 
        SET i.status = '020',
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


/**
 *  POST: perform job
 *  Status Codes: 000 ... Review Created
 *                001 ... Review Approved
 *                002 ... Review Rejected
 *                011 ... Job Created, Unassigned
 *                012 ... Job Assigned *                
 *                020 ... Job In-Progress
 *                021 ... Job Pending
 *                100 ... Job Finished
*                 090 ... Job Suspended
 */
router.post('/perform', (req, res) => {
    let { jobId, itemId, value, comment, actionUser } = req.body;

    console.log(req.body);

    let query = `
    START TRANSACTION;
        # Get lock
        SELECT @id := i.job_id, @item := i.item_id, i.status FROM labdb.job_item i 
        WHERE i.job_id = ${pool.escape(jobId)} AND i.item_id = ${pool.escape(itemId)} FOR SHARE;

        # Set variables
        SET @user = ${pool.escape(actionUser)};
        SET @comment = ${pool.escape(comment)};

        # Insert into job_apprv
        SELECT * FROM job_apprv FOR UPDATE;
        INSERT INTO job_apprv (job_id, job_item, action, actionUser, createdBy, createdAt, comment)
        VALUES      
        (@id, @item, '100', @user, @user, NOW(), 'JOB FINISHED');

        # Insert into job_perform
        SELECT * FROM job_perform FOR UPDATE;
        INSERT INTO job_perform (job_id, item_id, value, comments, createdBy, createdAt)
        VALUES      
        (@id, @item, ${pool.escape(value)},@comment, @user, NOW());

        # Update status
        UPDATE labdb.job_item i 
        SET i.status = '100',
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