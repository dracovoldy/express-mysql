/* Test Group - Master Table
-----------------------------------------------------
    author: Abhishek Mallik
    version: 0.0.1

    Field Descriptions: 
    Changelog: 
-----------------------------------------------------
*/
USE LIMSDB;
DROP TABLE IF EXISTS LIMSDB.TG01;
create table `LIMSDB`.`TG01` (
    `GPIX` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `NAME` VARCHAR(10) NOT NULL,
    `DESC` TEXT CHARACTER SET utf8,    
    PRIMARY KEY (`GPIX`)    
)ENGINE = InnoDB;
/* Test Param Header Table
-----------------------------------------------------
    author: Abhishek Mallik
    version: 0.0.1

    Field Descriptions: 
    Changelog: 
-----------------------------------------------------
*/
USE LIMSDB;
DROP TABLE IF EXISTS LIMSDB.TM01;
create table `LIMSDB`.`TM01` (
    `TPARAM` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `NAME` VARCHAR(10) NOT NULL,
    `DESC` TEXT CHARACTER SET utf8,    
    PRIMARY KEY (`TPARAM`)    
)ENGINE = InnoDB;

/* Test Param-Method Item Table
-----------------------------------------------------
    author: Abhishek Mallik
    version: 0.0.1

    Field Descriptions: 
    Changelog: 
-----------------------------------------------------
*/
USE LIMSDB;
DROP TABLE IF EXISTS LIMSDB.TM02;
create table `LIMSDB`.`TM02` (
    `TPARAM` INT UNSIGNED NOT NULL,
    `TMETH` INT UNSIGNED NOT NULL,
    `NAME` VARCHAR(10),
    `DESC` TEXT CHARACTER SET utf8,   
    `XUNIT` VARCHAR(10),
    `XFLAG` CHAR(1) NOT NULL DEFAULT 'X',
    PRIMARY KEY (`TPARAM`,`TMETH`),
    CONSTRAINT `fk_TPARAM_TM01`
		FOREIGN KEY (TPARAM) REFERENCES TM01 (TPARAM)
		ON DELETE CASCADE
		ON UPDATE RESTRICT
)ENGINE = InnoDB;
/*  Start of Trigger */
CREATE TRIGGER TM02AutoIncrement BEFORE INSERT ON TM02
FOR EACH ROW BEGIN
    SET NEW.TMETH = (
        SELECT IFNULL(MAX(TMETH), 0) + 1
        FROM TM02
        WHERE TPARAM = NEW.TPARAM
    );
END 
/*  End of Trigger */

/* Test Group Param Method Composite Table
-----------------------------------------------------
    author: Abhishek Mallik
    version: 0.0.1

    Field Descriptions: 
    Changelog: 
-----------------------------------------------------
*/
USE LIMSDB;
DROP TABLE IF EXISTS LIMSDB.TGPM;
create table `LIMSDB`.`TGPM` (
    `GPIX` INT UNSIGNED NOT NULL,
    `TPARAM` INT UNSIGNED NOT NULL,
    `TMETH` INT UNSIGNED NOT NULL,    
    PRIMARY KEY (`GPIX`,`TPARAM`,`TMETH`),
    CONSTRAINT `fk_GPIX_TG01`
		FOREIGN KEY (GPIX) REFERENCES TG01 (GPIX)
		ON DELETE CASCADE
		ON UPDATE RESTRICT,
    CONSTRAINT `fk_TPARAM_TM02`
		FOREIGN KEY (TPARAM,TMETH) REFERENCES TM02 (TPARAM,TMETH)
		ON DELETE CASCADE
		ON UPDATE RESTRICT    
)ENGINE = InnoDB;