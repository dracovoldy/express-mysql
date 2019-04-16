/* Job List Items Table
-----------------------------------------------------
    author: Abhishek Mallik
    version: 0.0.3

    Field Descriptions: JOBIX & ITMIX are composite keys
    Changelog: 
-----------------------------------------------------
*/


/*  v1  */
DROP TABLE IF EXISTS LIMSDB.JOBI;
create table `LIMSDB`.`JOBI` (
    `JOBIX` INT UNSIGNED NOT NULL,
    `ITMIX` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `TPARAM` INT UNSIGNED NOT NULL,
    `TMETH` INT UNSIGNED NOT NULL,
    `TXVAL` TEXT CHARACTER SET utf8,
    `TESTED_BY` char(08),
    `TESTED_AT` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,   
    UNIQUE KEY `ITMIX` (`JOBIX`,`ITMIX`)
)ENGINE = InnoDB;

/*  v2  */
USE LIMSDB;
DROP TABLE IF EXISTS LIMSDB.JOBI;
create table `LIMSDB`.`JOBI` (
    `JOBIX` INT UNSIGNED NOT NULL,
    `ITMIX` INT UNSIGNED NOT NULL,
    `TPARAM` INT UNSIGNED NOT NULL,
    `TMETH` INT UNSIGNED NOT NULL,
    `TXVAL` TEXT CHARACTER SET utf8,
    `TESTED_BY` char(08),
    `TESTED_AT` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,   
    PRIMARY KEY (`JOBIX`,`ITMIX`),
    CONSTRAINT `fk_JOBIX_JOBH`
		FOREIGN KEY (JOBIX) REFERENCES JOBH (JOBIX)
		ON DELETE CASCADE
		ON UPDATE RESTRICT
)ENGINE = InnoDB;

/*  Start of Trigger */
CREATE TRIGGER JOBIAutoIncrement BEFORE INSERT ON JOBI
FOR EACH ROW BEGIN
        SET NEW.ITMIX = (
             SELECT IFNULL(MAX(ITMIX), 0) + 1
             FROM JOBI
             WHERE JOBIX = NEW.JOBIX
        );
END 
/*  End of Trigger */

/*
CREATE INDEX JobId ON LIMSDB.JOBI(JOBIX);
*/
/*
EXPLAIN SELECT * FROM LIMSDB.JOBI where JOBIX = 2;
DROP TRIGGER JOBIAutoIncrement;
]*/