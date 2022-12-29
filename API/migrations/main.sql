DROP TABLE IF EXISTS `timeentrylog`;
DROP TABLE IF EXISTS `timeentry`;

DROP TABLE IF EXISTS `timeofflog`;
DROP TABLE IF EXISTS `timeoff`;
DROP TABLE IF EXISTS `timeoffstatustype`;
DROP TABLE IF EXISTS `timeofftype`;
DROP TABLE IF EXISTS `logtype`;

DROP TABLE IF EXISTS `user`;

DROP VIEW IF EXISTS `validtimeentry`;

CREATE TABLE `user` (
  `Id` bigint NOT NULL AUTO_INCREMENT,
  `DisplayName` varchar(255) NOT NULL,
  `Email` varchar(320) NOT NULL,
  `PasswordHash` binary(60) NOT NULL,
  `Active` tinyint NOT NULL,
  `InsertedOnUtc` datetime NOT NULL,
  `UpdatedOnUtc` datetime NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `User_DisplayName_uindex` (`DisplayName`),
  UNIQUE KEY `User_Email_uindex` (`Email`)
);

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

CREATE TABLE `logtype` (
  `Id` bigint NOT NULL,
  `Name` varchar(256) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Name_UNIQUE` (`Name`)
);

INSERT INTO `logtype` (Id, Name) VALUES (1, 'Insert'), (2, 'Update'), (3, 'Delete');


CREATE TABLE `timeentry` (
  `Id` bigint NOT NULL AUTO_INCREMENT,
  `StartTimeUtc` datetime NOT NULL,
  `EndTimeUtc` datetime DEFAULT NULL,
  `Note` varchar(512) NOT NULL,
  `DailyHours` decimal(4,2) NOT NULL,
  `IsDeleted` tinyint NOT NULL,
  `UserId` bigint NOT NULL,
  `InsertedOnUtc` datetime NOT NULL,
  `UpdatedOnUtc` datetime NOT NULL,
  PRIMARY KEY (`Id`),
  FOREIGN KEY (`UserId`) REFERENCES `user`(`Id`)
);

INSERT INTO `timeentry` (StartTimeUtc, EndTimeUtc, Note, DailyHours, IsDeleted, UserId, InsertedOnUtc, UpdatedOnUtc) VALUES 
(UTC_TIMESTAMP, UTC_TIMESTAMP, 'asd', 13.3, false, 1, UTC_TIMESTAMP, UTC_TIMESTAMP);

CREATE VIEW `validtimeentry` AS
    SELECT * FROM `timeentry`
    WHERE `EndTimeUtc` IS NOT NULL AND `IsDeleted` = 0;

CREATE TABLE `timeentrylog` (
  `StartTimeUtc` datetime NOT NULL,
  `EndTimeUtc` datetime NOT NULL,
  `IsDeleted` tinyint NOT NULL,
  `UserId` bigint NOT NULL,
  `TimeEntryId` bigint NOT NULL,
  `LogTypeId` bigint NOT NULL,
  `InsertedOnUtc` datetime NOT NULL,
  PRIMARY KEY (`TimeEntryId`,`InsertedOnUtc`),
  FOREIGN KEY (`TimeEntryId`) REFERENCES `timeentry` (`Id`),
  FOREIGN KEY (`UserId`) REFERENCES `user`(`Id`),
  FOREIGN KEY (`LogTypeId`) REFERENCES `logtype`(`Id`)
);

CREATE TABLE `timeoffstatustype` (
  `Id` bigint NOT NULL,
  `Name` varchar(256) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Name_UNIQUE` (`Name`)
);

INSERT INTO `timeoffstatustype` (Id, Name) VALUES (1, 'Pending'), (2, 'Accepted'),(3, 'Rejected'),(4, 'Canceled');

CREATE TABLE `timeofftype` (
  `Id` bigint NOT NULL,
  `Name` varchar(256) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Name_UNIQUE` (`Name`)
);

INSERT INTO `timeofftype` (Id, Name) VALUES (1, 'Vacation'), (2, 'Medical'), (3, 'Other');

CREATE TABLE `timeoff` (
  `Id` bigint NOT NULL AUTO_INCREMENT,
  `StartTimeUtc` datetime NOT NULL,
  `EndTimeUtc` datetime NOT NULL,
  `Note` varchar(512) NOT NULL,
  `TimeOffTypeId` bigint NOT NULL,
  `TimeOffStatusTypeId` bigint NOT NULL,
  `UserId` bigint NOT NULL,
  `InsertedOnUtc` datetime NOT NULL,
  `UpdatedOnUtc` datetime NOT NULL,
  PRIMARY KEY (`Id`),
  FOREIGN KEY (`TimeOffStatusTypeId`) REFERENCES `timeoffstatustype` (`Id`),
  FOREIGN KEY (`TimeOffTypeId`) REFERENCES `timeofftype` (`Id`),
  FOREIGN KEY (`UserId`) REFERENCES `user`(`Id`)
);

CREATE TABLE `timeofflog` (
  `StartTimeUtc` datetime NOT NULL,
  `EndTimeUtc` datetime NOT NULL,
  `TimeOffTypeId` bigint NOT NULL,
  `TimeOffStatusTypeId` bigint NOT NULL,
  `TimeOffId` bigint NOT NULL,
  `UserId` bigint NOT NULL,
  `LogTypeId` bigint NOT NULL,
  `InsertedOnUtc` datetime NOT NULL,
  PRIMARY KEY (`TimeOffId`,`InsertedOnUtc`),
  FOREIGN KEY (`TimeOffId`) REFERENCES `timeoff` (`Id`),
  FOREIGN KEY (`TimeOffStatusTypeId`) REFERENCES `timeoffstatustype` (`Id`),
  FOREIGN KEY (`TimeOffTypeId`) REFERENCES `timeofftype` (`Id`),
  FOREIGN KEY (`UserId`) REFERENCES `user`(`Id`),
  FOREIGN KEY (`LogTypeId`) REFERENCES `logtype`(`Id`)
);


