-- -----------------------------------------------------
-- Table `diplomska`.`dayoff`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `diplomska`.`dayoff` (
  `Id` BIGINT NOT NULL AUTO_INCREMENT,
  `Date` DATE NOT NULL,
  PRIMARY KEY (`Id`));


-- -----------------------------------------------------
-- Table `diplomska`.`logtype`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `diplomska`.`logtype` (
  `Id` BIGINT NOT NULL,
  `Name` VARCHAR(256) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE INDEX `Name_UNIQUE` (`Name` ASC) VISIBLE);


-- -----------------------------------------------------
-- Table `diplomska`.`user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `diplomska`.`user` (
  `Id` BIGINT NOT NULL AUTO_INCREMENT,
  `DisplayName` VARCHAR(255) NOT NULL,
  `Email` VARCHAR(320) NOT NULL,
  `PasswordHash` BINARY(60) NOT NULL,
  `DailyWorkHours` DECIMAL(4,2) NOT NULL,
  `VacationDays` INT NOT NULL,
  `IsAdmin` TINYINT NOT NULL,
  `ImpersonatedUserId` BIGINT NULL DEFAULT NULL,
  `InsertedOnUtc` DATETIME NOT NULL,
  `UpdatedOnUtc` DATETIME NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE INDEX `User_DisplayName_uindex` (`DisplayName` ASC) VISIBLE,
  UNIQUE INDEX `User_Email_uindex` (`Email` ASC) VISIBLE,
  INDEX `user_impersonated_user_id` (`ImpersonatedUserId` ASC) VISIBLE,
  CONSTRAINT `user_impersonated_user_id`
    FOREIGN KEY (`ImpersonatedUserId`)
    REFERENCES `diplomska`.`user` (`Id`));


-- -----------------------------------------------------
-- Table `diplomska`.`timeentry`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `diplomska`.`timeentry` (
  `Id` BIGINT NOT NULL AUTO_INCREMENT,
  `StartTimeUtc` DATETIME NOT NULL,
  `EndTimeUtc` DATETIME NOT NULL,
  `Note` VARCHAR(512) NOT NULL,
  `PauseSeconds` INT NOT NULL,
  `DailyWorkHours` DECIMAL(4,2) NOT NULL,
  `IsDeleted` TINYINT NOT NULL,
  `UserId` BIGINT NOT NULL,
  `InsertedOnUtc` DATETIME NOT NULL,
  `UpdatedOnUtc` DATETIME NOT NULL,
  PRIMARY KEY (`Id`),
  INDEX `UserId` (`UserId` ASC) VISIBLE,
  CONSTRAINT `timeentry_ibfk_1`
    FOREIGN KEY (`UserId`)
    REFERENCES `diplomska`.`user` (`Id`));


-- -----------------------------------------------------
-- Table `diplomska`.`timeentrylog`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `diplomska`.`timeentrylog` (
  `StartTimeUtc` DATETIME NOT NULL,
  `EndTimeUtc` DATETIME NOT NULL,
  `PauseSeconds` INT NOT NULL,
  `ModifierUserId` BIGINT NOT NULL,
  `TimeEntryId` BIGINT NOT NULL,
  `LogTypeId` BIGINT NOT NULL,
  `InsertedOnUtc` DATETIME NOT NULL,
  PRIMARY KEY (`TimeEntryId`, `InsertedOnUtc`),
  INDEX `LogTypeId` (`LogTypeId` ASC) VISIBLE,
  INDEX `timeentrylog_ibfk_2` (`ModifierUserId` ASC) VISIBLE,
  CONSTRAINT `timeentrylog_ibfk_1`
    FOREIGN KEY (`TimeEntryId`)
    REFERENCES `diplomska`.`timeentry` (`Id`),
  CONSTRAINT `timeentrylog_ibfk_2`
    FOREIGN KEY (`ModifierUserId`)
    REFERENCES `diplomska`.`user` (`Id`),
  CONSTRAINT `timeentrylog_ibfk_3`
    FOREIGN KEY (`LogTypeId`)
    REFERENCES `diplomska`.`logtype` (`Id`));


-- -----------------------------------------------------
-- Table `diplomska`.`timeoffstatustype`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `diplomska`.`timeoffstatustype` (
  `Id` BIGINT NOT NULL,
  `Name` VARCHAR(256) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE INDEX `Name_UNIQUE` (`Name` ASC) VISIBLE);


-- -----------------------------------------------------
-- Table `diplomska`.`timeofftype`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `diplomska`.`timeofftype` (
  `Id` BIGINT NOT NULL,
  `Name` VARCHAR(256) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE INDEX `Name_UNIQUE` (`Name` ASC) VISIBLE);


CREATE TABLE IF NOT EXISTS `diplomska`.`timeoff` (
  `Id` BIGINT NOT NULL AUTO_INCREMENT,
  `StartDate` DATE NOT NULL,
  `EndDate` DATE NOT NULL,
  `Note` VARCHAR(512) NOT NULL,
  `TimeOffTypeId` BIGINT NOT NULL,
  `TimeOffStatusTypeId` BIGINT NOT NULL,
  `UserId` BIGINT NOT NULL,
  `InsertedOnUtc` DATETIME NOT NULL,
  `UpdatedOnUtc` DATETIME NOT NULL,
  PRIMARY KEY (`Id`),
  INDEX `TimeOffStatusTypeId` (`TimeOffStatusTypeId` ASC) VISIBLE,
  INDEX `TimeOffTypeId` (`TimeOffTypeId` ASC) VISIBLE,
  INDEX `UserId` (`UserId` ASC) VISIBLE,
  CONSTRAINT `timeoff_ibfk_1`
    FOREIGN KEY (`TimeOffStatusTypeId`)
    REFERENCES `diplomska`.`timeoffstatustype` (`Id`),
  CONSTRAINT `timeoff_ibfk_2`
    FOREIGN KEY (`TimeOffTypeId`)
    REFERENCES `diplomska`.`timeofftype` (`Id`),
  CONSTRAINT `timeoff_ibfk_3`
    FOREIGN KEY (`UserId`)
    REFERENCES `diplomska`.`user` (`Id`));


-- -----------------------------------------------------
-- Table `diplomska`.`timeofflog`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `diplomska`.`timeofflog` (
  `Id` BIGINT NOT NULL AUTO_INCREMENT,
  `StartDate` DATE NOT NULL,
  `EndDate` DATE NOT NULL,
  `TimeOffTypeId` BIGINT NOT NULL,
  `TimeOffStatusTypeId` BIGINT NOT NULL,
  `TimeOffId` BIGINT NOT NULL,
  `ModifierUserId` BIGINT NOT NULL,
  `LogTypeId` BIGINT NOT NULL,
  `InsertedOnUtc` DATETIME NOT NULL,
  PRIMARY KEY (`Id`),
  INDEX `TimeOffStatusTypeId` (`TimeOffStatusTypeId` ASC) VISIBLE,
  INDEX `TimeOffTypeId` (`TimeOffTypeId` ASC) VISIBLE,
  INDEX `UserId` (`ModifierUserId` ASC) VISIBLE,
  INDEX `LogTypeId` (`LogTypeId` ASC) VISIBLE,
  INDEX `timeofflog_ibfk_1` (`TimeOffId` ASC) VISIBLE,
  CONSTRAINT `timeofflog_ibfk_1`
    FOREIGN KEY (`TimeOffId`)
    REFERENCES `diplomska`.`timeoff` (`Id`),
  CONSTRAINT `timeofflog_ibfk_2`
    FOREIGN KEY (`TimeOffStatusTypeId`)
    REFERENCES `diplomska`.`timeoffstatustype` (`Id`),
  CONSTRAINT `timeofflog_ibfk_3`
    FOREIGN KEY (`TimeOffTypeId`)
    REFERENCES `diplomska`.`timeofftype` (`Id`),
  CONSTRAINT `timeofflog_ibfk_4`
    FOREIGN KEY (`ModifierUserId`)
    REFERENCES `diplomska`.`user` (`Id`),
  CONSTRAINT `timeofflog_ibfk_5`
    FOREIGN KEY (`LogTypeId`)
    REFERENCES `diplomska`.`logtype` (`Id`));

INSERT INTO `user` (DisplayName, Email, PasswordHash, VacationDays, DailyWorkHours, IsAdmin, ImpersonatedUserId, InsertedOnUtc, UpdatedOnUtc) VALUES
('Administrator', 'admin@test.si', '$2a$12$fmAWtUTPYLjW0h1fEv9mwO7oLJ7eSDehEAiYDiUEGTEGMl/s9Tp.y', 22, 8, 1, NULL, UTC_TIMESTAMP, UTC_TIMESTAMP),
('John Doe', 'john.doe@test.si', '$2a$12$fmAWtUTPYLjW0h1fEv9mwO7oLJ7eSDehEAiYDiUEGTEGMl/s9Tp.y', 22, 8, 0, NULL, UTC_TIMESTAMP, UTC_TIMESTAMP);
/*password: test123*/

INSERT INTO dayoff (Date) VALUES
('2023-1-2'),
('2023-2-8'),
('2023-4-10'),
('2023-4-27'),
('2023-5-1'),
('2023-5-2'),
('2023-6-26'),
('2023-8-15'),
('2023-10-31'),
('2023-11-1'),
('2023-12-25'),
('2023-12-26');

INSERT INTO `logtype` (Id, Name) VALUES (1, 'Insert'), (2, 'Update'), (3, 'Delete');

INSERT INTO `timeoffstatustype` (Id, Name) VALUES (1, 'Pending'), (2, 'Accepted'),(3, 'Rejected'),(4, 'Canceled');

INSERT INTO `timeofftype` (Id, Name) VALUES (1, 'Vacation'), (2, 'Medical'), (3, 'Other');
