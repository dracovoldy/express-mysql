const pool = require('../../../data/config');
const router = require('express').Router();

router.get('/', (req, res) => {
    const custId = req.query.custId;

    if (custId) {
        pool.query('SELECT * FROM order_trans as h WHERE h.custId = ?', [custId], (error, result) => {
            if (error) throw error;

            res.send(result);
        });
    } else {
        pool.query('SELECT * FROM order_trans', (error, results) => {
            if (error) throw error;

            res.send(results);
        });
    }
});

router.post('/', function (req, res) {

    var payload = req.body;

    var orderObj = {
        "orderId": null,
        "custId": payload.custId,
        "orderDesc": payload.orderDesc,
        "createdBy": payload.createdBy,
        "createdAt": new Date(),
        "docRef": null,
        "docDate": null
    };

    // add validations later
    if (!orderObj) {
        return res.status(400).send({
            error: true,
            message: 'Malformed orderObj'
        });
    }

    pool.query("INSERT INTO order_trans SET ? ", orderObj, function (error, results) {
        if (error) {

            return res.status(500).send({
                error: true,
                message: error
            });

        } else {

            return res.status(201).send({
                "results": results,
                "orderId": results.insertId
            });

        }

    });
});

module.exports = router;