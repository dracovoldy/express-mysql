const pool = require('../../../data/config');
const router = require('express').Router();

router.get('/', (req, res) => {
    const custId = req.query.custId;

    if (custId) {
        pool.query('SELECT * FROM customer_master as h WHERE h.custId = ?', [custId], (error, result) => {
            if (error) throw error;

            res.send(result);
        });
    } else {
        pool.query('SELECT * FROM customer_master', (error, results) => {
            if (error) throw error;

            res.send(results);
        });
    }
});

router.post('/', function (req, res) {

    var payload = req.body;

    var custObj = {
        "custId": null,
        "name": payload.name,
        "desc": payload.desc,        
        "createdBy": payload.createdBy,
        "createdAt": new Date(),        
        "modifiedBy": payload.createdBy,
        "modifiedAt": new Date(),
        "addLine1": payload.addLine1,     
        "addLine2": payload.addLine2,     
        "city": payload.city,     
        "zipcode": payload.zipcode    
    };

    // add validations later
    if (!custObj) {
        return res.status(400).send({
            error: true,
            message: 'Malformed custObj'
        });
    }

    pool.query("INSERT INTO customer_master SET ? ", custObj, function (error, results) {
        if (error) {

            return res.status(500).send({
                error: true,
                message: error
            });

        } else {

            return res.status(201).send({
                "results": results,
                "custId": results.insertId
            });

        }

    });
});

module.exports = router;