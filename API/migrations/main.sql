DROP TABLE IF EXISTS `timeentrylog`;
DROP TABLE IF EXISTS `timeentry`;

DROP TABLE IF EXISTS `timeoffentrylog`;
DROP TABLE IF EXISTS `timeoffentry`;
DROP TABLE IF EXISTS `timeoffstatustype`;
DROP TABLE IF EXISTS `timeofftype`;

CREATE TABLE `timeentry` (
  `Id` bigint NOT NULL AUTO_INCREMENT,
  `StartTimeUtc` datetime NOT NULL,
  `EndTimeUtc` datetime DEFAULT NULL,
  `Note` varchar(512) NOT NULL,
  `DailyHours` decimal(4,2) NOT NULL,
  `IsDeleted` tinyint(1) NOT NULL,
  `UserId` int NOT NULL,
  `InsertedOnUtc` datetime NOT NULL,
  `UpdatedOnUtc` datetime NOT NULL,
  PRIMARY KEY (`Id`)
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
  KEY `TimeEntryId_idx` (`TimeEntryId`),
  CONSTRAINT `TimeEntryId` FOREIGN KEY (`TimeEntryId`) REFERENCES `timeentry` (`Id`)
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

CREATE TABLE `timeoffentry` (
  `Id` bigint NOT NULL AUTO_INCREMENT,
  `StartTimeUtc` datetime NOT NULL,
  `EndTimeUtc` datetime NOT NULL,
  `TimeOffTypeId` bigint NOT NULL,
  `TimeOffStatusTypeId` bigint NOT NULL,
  `UserId` bigint NOT NULL,
  `InsertedOnUtc` datetime NOT NULL,
  `UpdatedOnUtc` datetime NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `TimeOffTypeId_idx` (`TimeOffTypeId`),
  KEY `TimeOffStatusTypeId_idx` (`TimeOffStatusTypeId`),
  CONSTRAINT `TimeOffStatusTypeId` FOREIGN KEY (`TimeOffStatusTypeId`) REFERENCES `timeoffstatustype` (`Id`),
  CONSTRAINT `TimeOffTypeId` FOREIGN KEY (`TimeOffTypeId`) REFERENCES `timeofftype` (`Id`)
) ;

CREATE TABLE `timeoffentrylog` (
  `StartTimeUtc` datetime NOT NULL,
  `EndTimeUtc` datetime NOT NULL,
  `TimeOffTypeId` bigint NOT NULL,
  `TimeOffStatusTypeId` bigint NOT NULL,
  `TimeOffEntryId` bigint NOT NULL,
  `UserId` bigint NOT NULL,
  `InsertedOnUtc` datetime NOT NULL,
  PRIMARY KEY (`TimeOffEntryId`,`InsertedOnUtc`),
  KEY `TimeOffTypeId_idx` (`TimeOffTypeId`),
  KEY `TimeOffStatusTypeId_idx` (`TimeOffStatusTypeId`),
  KEY `TimeOffEntryId_1` (`TimeOffEntryId`),
  CONSTRAINT `TimeOffEntryId_1` FOREIGN KEY (`TimeOffEntryId`) REFERENCES `timeoffentry` (`Id`),
  CONSTRAINT `TimeOffStatusTypeId_1` FOREIGN KEY (`TimeOffStatusTypeId`) REFERENCES `timeoffstatustype` (`Id`),
  CONSTRAINT `TimeOffTypeId_1` FOREIGN KEY (`TimeOffTypeId`) REFERENCES `timeofftype` (`Id`)
);


