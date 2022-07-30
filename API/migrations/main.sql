DROP TABLE IF EXISTS `timeentrylog`;
DROP TABLE IF EXISTS `timeentry`;

DROP TABLE IF EXISTS `timeofflog`;
DROP TABLE IF EXISTS `timeoff`;
DROP TABLE IF EXISTS `timeoffstatustype`;
DROP TABLE IF EXISTS `timeofftype`;


DROP TABLE IF EXISTS `user`;

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

INSERT INTO `user` (DisplayName, Email, PasswordHash, Active, InsertedOnUtc, UpdatedOnUtc)
VALUES ('Admin', 'test@test.si', '$2a$12$fmAWtUTPYLjW0h1fEv9mwO7oLJ7eSDehEAiYDiUEGTEGMl/s9Tp.y', 1, NOW(), NOW());
/*password: test123*/

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

CREATE TABLE `timeentrylog` (
  `StartTimeUtc` datetime NOT NULL,
  `EndTimeUtc` datetime DEFAULT NULL,
  `Note` varchar(512) NOT NULL,
  `DailyHours` decimal(4,2) NOT NULL,
  `ChangeReason` varchar(512) NOT NULL,
  `UserId` bigint NOT NULL,
  `TimeEntryId` bigint NOT NULL,
  `InsertedOnUtc` datetime NOT NULL,
  PRIMARY KEY (`TimeEntryId`,`InsertedOnUtc`),
  FOREIGN KEY (`TimeEntryId`) REFERENCES `timeentry` (`Id`),
  FOREIGN KEY (`UserId`) REFERENCES `user`(`Id`)
);



CREATE TABLE `timeoffstatustype` (
  `Id` bigint NOT NULL AUTO_INCREMENT,
  `Name` varchar(256) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Name_UNIQUE` (`Name`)
);

INSERT INTO `timeoffstatustype` (Name) VALUES ('Pending'), ('Accepted'),('Rejected'),('Canceled');

CREATE TABLE `timeofftype` (
  `Id` bigint NOT NULL AUTO_INCREMENT,
  `Name` varchar(256) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Name_UNIQUE` (`Name`)
);

INSERT INTO `timeofftype` (Name) VALUES ('Vacation'), ('Medical'), ('Other');

CREATE TABLE `timeoff` (
  `Id` bigint NOT NULL AUTO_INCREMENT,
  `StartTimeUtc` datetime NOT NULL,
  `EndTimeUtc` datetime NOT NULL,
  `TimeOffTypeId` bigint NOT NULL,
  `TimeOffStatusTypeId` bigint NOT NULL,
  `UserId` bigint NOT NULL,
  `InsertedOnUtc` datetime NOT NULL,
  `UpdatedOnUtc` datetime NOT NULL,
  PRIMARY KEY (`Id`),
  FOREIGN KEY (`TimeOffStatusTypeId`) REFERENCES `timeoffstatustype` (`Id`),
  FOREIGN KEY (`TimeOffTypeId`) REFERENCES `timeofftype` (`Id`),
  FOREIGN KEY (`UserId`) REFERENCES `user`(`Id`)
) ;

INSERT INTO `timeoff` (StartTimeUtc, EndTimeUtc, TimeOffTypeId, TimeOffStatusTypeId, UserId, InsertedOnUtc, UpdatedOnUtc) VALUES 
(NOW(), NOW(), 1, 1, 1, NOW(), NOW()),
(NOW(), NOW(), 2, 2, 1, NOW(), NOW()),
(NOW(), NOW(), 3, 3, 1, NOW(), NOW());

CREATE TABLE `timeofflog` (
  `StartTimeUtc` datetime NOT NULL,
  `EndTimeUtc` datetime NOT NULL,
  `TimeOffTypeId` bigint NOT NULL,
  `TimeOffStatusTypeId` bigint NOT NULL,
  `TimeOffId` bigint NOT NULL,
  `UserId` bigint NOT NULL,
  `InsertedOnUtc` datetime NOT NULL,
  PRIMARY KEY (`TimeOffId`,`InsertedOnUtc`),
  FOREIGN KEY (`TimeOffId`) REFERENCES `timeoff` (`Id`),
  FOREIGN KEY (`TimeOffStatusTypeId`) REFERENCES `timeoffstatustype` (`Id`),
  FOREIGN KEY (`TimeOffTypeId`) REFERENCES `timeofftype` (`Id`),
  FOREIGN KEY (`UserId`) REFERENCES `user`(`Id`)
);


