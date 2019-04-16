const express = require('express');
const pool = require('../data/config');
const router = express.Router();

router.get('/', (req, res) => {
    const groupId = req.query.group;
    const paramId = req.query.param;
    const methId = req.query.meth;

    if(groupId && !paramId && !methId){
        pool.query('SELECT DISTINCT ParamId, ParamValue, ParamDesc\t' +
        'FROM TEST_GROUP_VIEW WHERE GroupId = ?', [groupId], (error, result) => {
           if (error) throw error;
   
           res.send(result);
       });
       return;
    }else if(groupId && paramId && !methId){
        pool.query('SELECT DISTINCT MethodId, MethodValue, MethodDesc\t' +
        'FROM TEST_GROUP_VIEW WHERE GroupId = ? AND ParamId = ?', [groupId, paramId], (error, result) => {
           if (error) throw error;
   
           res.send(result);
       });
       return;
    }else if(groupId && paramId && methId){
        pool.query('SELECT MethodId, MethodValue, MethodDesc, Uom, XFLAG\t' +
        'FROM TEST_GROUP_VIEW WHERE GroupId = ? AND ParamId = ? AND MethodId = ?', [groupId, paramId, methId], (error, result) => {
           if (error) throw error;
   
           res.send(result);
       });
       return;
    }else{
        pool.query('SELECT * FROM TEST_GROUP_VIEW', (error, result) => {
            if (error) throw error;
    
            res.send(result);
        });
        return;
    }    
});

router.get('/groups', (req, res) => {
    pool.query('SELECT TG01.GPIX as GroupId, TG01.NAME as GroupValue, TG01.DESC as GroupDesc FROM TG01', (error, result) => {
        if (error) throw error;

        res.send(result);
    });
});

module.exports = router;