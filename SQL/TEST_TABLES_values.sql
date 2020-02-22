/* Test Group - Master Table
-----------------------------------------------------
    author: Abhishek Mallik
    version: 0.0.1

    Field Descriptions: 
    Changelog: 
-----------------------------------------------------
*/
INSERT INTO `LIMSDB`.`TG01`(`GPIX`,`NAME`,`DESC`) 
VALUES  (NULL,'MECH','Mechanical'),
        (NULL,'CHEM','Chemical'),
        (NULL,'OTH1','Custom Other');
        
/* Test Param Header Table
-----------------------------------------------------
    author: Abhishek Mallik
    version: 0.0.1

    Field Descriptions: 
    Changelog: 
-----------------------------------------------------
*/
INSERT INTO `LIMSDB`.`TM01`(`TPARAM`,`NAME`,`DESC`) 
VALUES  (NULL,'MPM001A','Mass per meter'),
        (NULL,'TS001A','Tensile Strength'),
        (NULL,'YS001A','Yield Stress'),
        (NULL,'BNT180-001A','Bend Test 180 degrees'),
        (NULL,'ELG001A','Elongation');

/* Test Param-Method Item Table
-----------------------------------------------------
    author: Abhishek Mallik
    version: 0.0.1

    Field Descriptions: 
    Changelog: 
-----------------------------------------------------
*/
INSERT INTO `LIMSDB`.`TM02`(`TPARAM`,`TMETH`,`NAME`,`DESC`,`XUNIT`,`XFLAG`) 
VALUES  (1,NULL,'IS17862008','IS 1786: 2008','Kg/m','X'),
        (1,NULL,'ASTM000122','ASTM 122','Kg/m','X'),     
        (2,NULL,'IS16082005','IS 1608: 2005','N/mm2','X'),      
        (2,NULL,'ASTM000133','ASTM 133','N/mm2','X'),
        (3,NULL,'IS16082005','IS 1608: 2005','N/mm2','X'),
        (3,NULL,'ASTM000143','ASTM 143','N/mm2','X'),
        (4,NULL,'IS16082005','IS 1608: 2005','%','X'),
        (5,NULL,'IS15992012','IS 1599: 2012',NULL,'Q');

/* Test Group Param Method Composite Table
-----------------------------------------------------
    author: Abhishek Mallik
    version: 0.0.1

    Field Descriptions: 
    Changelog: 
-----------------------------------------------------
*/
INSERT INTO `LIMSDB`.`TGPM`(`GPIX`,`TPARAM`,`TMETH`) 
VALUES  (1,1,1),
        (1,1,2),
        (1,2,1),
        (1,2,2),
        (1,3,1),
        (1,3,2),
        (1,4,1),
        (1,5,1);
        