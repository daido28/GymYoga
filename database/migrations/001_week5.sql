-- Run in the selected database. Additive and repeatable; does not drop existing data.
SET XACT_ABORT ON;
BEGIN TRANSACTION;
IF OBJECT_ID(N'dbo.Attendance',N'U') IS NULL
CREATE TABLE dbo.Attendance (
 AttendanceId INT IDENTITY PRIMARY KEY,
 ScheduleId INT NOT NULL UNIQUE REFERENCES dbo.WorkSchedules(ScheduleId),
 CheckInAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
 CheckOutAt DATETIME2 NULL,
 CONSTRAINT CK_Attendance_Order CHECK(CheckOutAt IS NULL OR CheckOutAt >= CheckInAt)
);
IF OBJECT_ID(N'dbo.LeaveRequests',N'U') IS NULL
CREATE TABLE dbo.LeaveRequests (
 RequestId INT IDENTITY PRIMARY KEY,
 ScheduleId INT NOT NULL REFERENCES dbo.WorkSchedules(ScheduleId),
 EmployeeId INT NOT NULL REFERENCES dbo.Employees(EmployeeId),
 Reason NVARCHAR(500) NOT NULL,
 Status VARCHAR(20) NOT NULL DEFAULT 'Pending',
 CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
 ReviewedBy INT NULL REFERENCES dbo.AppUsers(UserId),
 ReviewedAt DATETIME2 NULL,
 ReviewNote NVARCHAR(500) NULL,
 CONSTRAINT CK_Leave_Status CHECK(Status IN ('Pending','Approved','Rejected'))
);
IF OBJECT_ID(N'dbo.ShiftChangeRequests',N'U') IS NULL
CREATE TABLE dbo.ShiftChangeRequests (
 RequestId INT IDENTITY PRIMARY KEY,
 ScheduleId INT NOT NULL REFERENCES dbo.WorkSchedules(ScheduleId),
 EmployeeId INT NOT NULL REFERENCES dbo.Employees(EmployeeId),
 OriginalShiftId INT NOT NULL REFERENCES dbo.Shifts(ShiftId),
 TargetShiftId INT NOT NULL REFERENCES dbo.Shifts(ShiftId),
 Reason NVARCHAR(500) NOT NULL,
 Status VARCHAR(20) NOT NULL DEFAULT 'Pending',
 CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
 ReviewedBy INT NULL REFERENCES dbo.AppUsers(UserId),
 ReviewedAt DATETIME2 NULL,
 ReviewNote NVARCHAR(500) NULL,
 CONSTRAINT CK_Change_Status CHECK(Status IN ('Pending','Approved','Rejected')),
 CONSTRAINT CK_Change_Target CHECK(OriginalShiftId<>TargetShiftId)
);
IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE name='UX_Leave_Pending' AND object_id=OBJECT_ID('dbo.LeaveRequests'))
CREATE UNIQUE INDEX UX_Leave_Pending ON dbo.LeaveRequests(ScheduleId) WHERE Status='Pending';
IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE name='UX_Change_Pending' AND object_id=OBJECT_ID('dbo.ShiftChangeRequests'))
CREATE UNIQUE INDEX UX_Change_Pending ON dbo.ShiftChangeRequests(ScheduleId) WHERE Status='Pending';
COMMIT;
