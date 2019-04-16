/* Job List Header Table
-----------------------------------------------------
    author: Abhishek Mallik
    version: 0.0.2

    Field Descriptions: 
    Changelog: 
-----------------------------------------------------
*/

create table `LIMSDB`.`JOBH` (
  `JOBIX` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY UNIQUE,
  `LABIX` INT UNSIGNED NOT NULL,
  `SPLIX` INT UNSIGNED NOT NULL,
  `TGIX` INT UNSIGNED NOT NULL,
  `ISSUED_BY` char(08) NOT NULL,
  `CREATED_AT` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `APPV_BY` char(08),
  `APPV_DATE` TIMESTAMP
);