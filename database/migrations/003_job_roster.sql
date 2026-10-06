SET XACT_ABORT ON;
BEGIN TRANSACTION;
IF OBJECT_ID('dbo.JobTypes','U') IS NULL
 CREATE TABLE dbo.JobTypes(JobTypeId INT IDENTITY PRIMARY KEY,JobName NVARCHAR(80) NOT NULL UNIQUE,Color VARCHAR(7) NOT NULL DEFAULT '#2563eb',IsActive BIT NOT NULL DEFAULT 1);
IF OBJECT_ID('dbo.EmployeeJobTypes','U') IS NULL
 CREATE TABLE dbo.EmployeeJobTypes(EmployeeId INT NOT NULL REFERENCES Employees(EmployeeId),JobTypeId INT NOT NULL REFERENCES JobTypes(JobTypeId),IsPrimary BIT NOT NULL DEFAULT 0,PRIMARY KEY(EmployeeId,JobTypeId));
IF OBJECT_ID('dbo.ShiftJobRequirements','U') IS NULL
 CREATE TABLE dbo.ShiftJobRequirements(ShiftId INT NOT NULL REFERENCES Shifts(ShiftId),JobTypeId INT NOT NULL REFERENCES JobTypes(JobTypeId),MinStaff INT NOT NULL,MaxStaff INT NOT NULL,PRIMARY KEY(ShiftId,JobTypeId),CHECK(MinStaff>=0 AND MaxStaff>=1 AND MaxStaff>=MinStaff));
IF OBJECT_ID('dbo.RosterPublications','U') IS NULL
 CREATE TABLE dbo.RosterPublications(ShiftId INT NOT NULL REFERENCES Shifts(ShiftId),WorkDate DATE NOT NULL,PublishedBy INT NOT NULL REFERENCES AppUsers(UserId),PublishedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),PRIMARY KEY(ShiftId,WorkDate));
IF COL_LENGTH('dbo.WorkSchedules','JobTypeId') IS NULL
 ALTER TABLE dbo.WorkSchedules ADD JobTypeId INT NULL REFERENCES JobTypes(JobTypeId);
IF NOT EXISTS(SELECT 1 FROM dbo.JobTypes)
 INSERT INTO dbo.JobTypes(JobName,Color) VALUES(N'Quầy lễ tân','#2563eb'),(N'Vệ sinh phòng tập','#10a37f'),(N'Bảo vệ / giữ xe','#d99a24'),(N'Huấn luyện viên','#8b5cf6');
COMMIT;
