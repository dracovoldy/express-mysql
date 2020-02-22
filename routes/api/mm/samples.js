const pool = require('../../../data/config');
const router = require('express').Router();

router.get('/', (req, res) => {
    const orderId = req.query.orderId;

    if (orderId) {
        pool.query('SELECT * FROM sample_data as h WHERE h.orderId = ?', [orderId], (error, result) => {
            if (error) throw error;

            res.send(result);
        });
    } else {
        pool.query('SELECT * FROM sample_data', (error, results) => {
            if (error) throw error;

            res.send(results);
        });
    }
});

router.post('/', function (req, res) {

    var payload = req.body;

    var sampleObj = {
        "orderId": payload.orderId,
        "sampleName": payload.sampleName,
        "sampleDesc": payload.sampleDesc,        
        "sampleQty": payload.sampleQty,
        "unit": payload.sampleUom,
        "sampleCKey": payload.sampleCKey,
        "sampleCond": payload.sampleCond,
        "createdBy": payload.createdBy,
        "createdAt": new Date()
    };

    // add validations later
    if (!sampleObj) {
        return res.status(400).send({
            error: true,
            message: 'Malformed sampleObj'
        });
    }

    pool.query("INSERT INTO sample_data SET ? ", sampleObj, function (error, results) {
        if (error) {

            return res.status(500).send({
                error: true,
                message: error
            });

        } else {

            return res.status(201).send({
                "results": results,
                "sampleId": results.insertId
            });

        }

    });
});

module.exports = router;