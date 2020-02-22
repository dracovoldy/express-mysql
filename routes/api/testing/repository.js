const pool = require('../../../data/config');
const router = require('express').Router();

router.get('/disp', (req, res) => {
    pool.query('SELECT * FROM disp', (error, result) => {
        if (error) throw error;
        res.send(result);
    });
});

router.get('/group', (req, res) => {
    const dispId = req.query.dispId;

    if (!dispId) {
        res.status(400).send({ "error": "dispId required" });
    } else {        
        if (dispId.trim().length < 8 || dispId.trim().length <= 0 || dispId.trim().length > 8) {
            res.status(422).send({ "error": "dispId format error", "length": dispId.trim().length });
        } else if (dispId.length === 8) {
            pool.query('SELECT * FROM grps WHERE disp_id = ?;', [dispId], (error, result) => {
                if (error) throw error;
                res.send(result);
            });
        }
    }
});

router.get('/prod', (req, res) => {
    const groupId = req.query.groupId;

    if (!groupId) {
        res.send({ "error": "groupId required" });
    } else {        
        if (groupId.trim().length < 8 || groupId.trim().length <= 0 || groupId.trim().length > 8) {
            res.send({ "error": "groupId format error", "length": groupId.trim().length  });
        } else if (groupId.length === 8) {
            pool.query('SELECT * FROM pmat WHERE grp_id = ?;', [groupId], (error, result) => {
                if (error) throw error;
                res.send(result);
            });
        }
    }
});

router.get('/master', (req, res) => {
    const prodId = req.query.prodId;

    if (!prodId) {
        res.send({ "error": "prodId required" });
    } else {        
        if (prodId.trim().length < 8 || prodId.trim().length <= 0 || prodId.trim().length > 8) {
            res.send({ "error": "prodId format error", "length": prodId.trim().length  });
        } else if (prodId.length === 8) {
            pool.query('SELECT * FROM tm01 WHERE pm_id = ?;', [prodId], (error, result) => {
                if (error) throw error;
                res.send(result);
            });
        }
    }
});

router.get('/type', (req, res) => {
    const masterId = req.query.masterId;

    if (!masterId) {
        res.send({ "error": "masterId required" });
    } else {        
        if (masterId.trim().length < 8 || masterId.trim().length <= 0 || masterId.trim().length > 8) {
            res.send({ "error": "masterId format error", "length": masterId.trim().length  });
        } else if (masterId.length === 8) {
            pool.query('SELECT * FROM tm02 WHERE tms_id = ?;', [masterId], (error, result) => {
                if (error) throw error;
                res.send(result);
            });
        }
    }
});

// router.get('/', (req, res) => {
//     const groupId = req.query.group;
//     const paramId = req.query.param;
//     const methId = req.query.meth;

//     if(groupId && !paramId && !methId){
//         pool.query('SELECT DISTINCT ParamId, ParamValue, ParamDesc\t' +
//         'FROM test_group_view WHERE GroupId = ?', [groupId], (error, result) => {
//            if (error) throw error;

//            res.send(result);
//        });
//        return;
//     }else if(groupId && paramId && !methId){
//         pool.query('SELECT DISTINCT MethodId, MethodValue, MethodDesc\t' +
//         'FROM test_group_view WHERE GroupId = ? AND ParamId = ?', [groupId, paramId], (error, result) => {
//            if (error) throw error;

//            res.send(result);
//        });
//        return;
//     }else if(groupId && paramId && methId){
//         pool.query('SELECT MethodId, MethodValue, MethodDesc, Uom, XFLAG\t' +
//         'FROM test_group_view WHERE GroupId = ? AND ParamId = ? AND MethodId = ?', [groupId, paramId, methId], (error, result) => {
//            if (error) throw error;

//            res.send(result);
//        });
//        return;
//     }else{
//         pool.query('SELECT * FROM test_group_view', (error, result) => {
//             if (error) throw error;

//             res.send(result);
//         });
//         return;
//     }    
// });

// router.get('/groups', (req, res) => {
//     pool.query('SELECT test_group_01.GPIX as GroupId, test_group_01.NAME as GroupValue, test_group_01.DESC as GroupDesc FROM test_group_01', (error, result) => {
//         if (error) throw error;

//         res.send(result);
//     });
// });

module.exports = router;