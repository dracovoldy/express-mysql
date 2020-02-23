const pool = require('../../../data/config');
const router = require('express').Router();

/**
 *  GET: New Jobs (Unassigned) with status '011'
 */
router.get('/', (req, res) => {

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
    WHERE i.status = '011'
    ORDER BY 
		h.job_id asc,
        i.item_id asc`;

    pool.query(query, [], (error, results) => {
        if (error) {
            throw error;
        } else {
            var toTree = function (results) {

                var final = [];
                var prevJob = null;
                var prevId = null;
                var branch = null;

                var i = 0;
                for (; i < results.length; i++) {

                    if (prevJob === null) {

                        prevId = 0;
                        prevJob = results[i].job_id;

                        final.push({
                            documentNo: results[i].job_id,
                            order_desc: results[i].order_desc,
                            disp_name: results[i].disp_name,
                            grp_desc: results[i].grp_desc,
                            documents: [{
                                documentNo: results[i].job_id,
                                itemNo: results[i].item_id,
                                pm_desc: results[i].pm_desc,
                                tms_snam: results[i].tms_snam,
                                tmt_name: results[i].tmt_name
                            }]
                        });
                    } else if (prevJob === results[i].job_id) {

                        branch = true;

                        final[prevId].documents.push({
                            documentNo: results[i].job_id,
                            itemNo: results[i].item_id,
                            pm_desc: results[i].pm_desc,
                            tms_snam: results[i].tms_snam,
                            tmt_name: results[i].tmt_name
                        });

                    } else {

                        branch = false;

                        prevJob = results[i].job_id;
                        prevId = prevId + 1;

                        final.push({
                            documentNo: results[i].job_id,
                            order_desc: results[i].order_desc,
                            disp_name: results[i].disp_name,
                            grp_desc: results[i].grp_desc,
                            documents: [{
                                documentNo: results[i].job_id,
                                itemNo: results[i].item_id,
                                pm_desc: results[i].pm_desc,
                                tms_snam: results[i].tms_snam,
                                tmt_name: results[i].tmt_name
                            }]
                        });
                    }
                }

                // if (branch) {
                //     // final.push({ ...nodeObj });
                // } else {
                //     final.push({ ...nodeObj });
                // }

                return final;
            };

            var documents = toTree(results);

            res.send({
                results: results,
                jobs: {
                    items: {
                        documents
                    }
                },
                count: results.length
            });
        }
    });
});

/**
 *  POST: Approve Item(s)
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
router.post('/', (req, res, next) => {
    let { lineitems, actionUser, comment } = req.body;

    console.log(req.body);

    var finalQuery = ""; 
    
    lineitems.map(lineitem => {

        var query = `
        START TRANSACTION;
            # Get lock
            SELECT @id := i.job_id, @item := i.item_id, i.status FROM labdb.job_item i 
            WHERE i.job_id = ${pool.escape(lineitem.jobId)} AND i.item_id = ${pool.escape(lineitem.itemNo)} FOR SHARE;
    
            # Set variables
            SET @user = ${pool.escape(actionUser)};
            SET @comment = ${pool.escape(comment)};
            
            # Insert into job_apprv
            SELECT * FROM job_apprv FOR UPDATE;
            INSERT INTO job_apprv (job_id, job_item, action, actionUser, createdBy, createdAt, comment)
            VALUES 
            (@id, @item, '012', @user, 'MALLIKA', NOW(), 'JOB ASSIGNED');
    
            # Update status
            UPDATE labdb.job_item i 
            SET i.status = '012',
                i.modifiedBy = 'MALLIKA',
                i.modifiedAt = NOW()
            WHERE i.job_id = @id AND i.item_id = @item;
        COMMIT;
        `;

        finalQuery = finalQuery + query;
    });



    pool.query(finalQuery, [], (error, results) => {
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