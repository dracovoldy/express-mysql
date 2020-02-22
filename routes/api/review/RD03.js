const pool = require('../../../data/config');
const mysql = require('mysql');
const router = require('express').Router();


/*
    GET: Job Review document(s) - Header Level
*/
router.post('/headers', (req, res) => {

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
router.get('/items', (req, res) => {
    const jobId = req.query.jobId;
    if (!jobId) {
        return res.status(400).send({ error: "jobId required" });
    }

    pool.query(`SELECT * FROM labdb.job_item j WHERE j.jobId = ?`, [jobId], (error, result) => {
        if (error) throw error;

        res.send(result);
    });
});


module.exports = router;