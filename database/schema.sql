IF DB_ID(N'GymYogaHRM') IS NULL
BEGIN
    CREATE DATABASE GymYogaHRM;
END
GO

USE GymYogaHRM;
GO

IF OBJECT_ID(N'dbo.WorkSchedules', N'U') IS NOT NULL
    DROP TABLE dbo.WorkSchedules;
GO

IF OBJECT_ID(N'dbo.Employees', N'U') IS NOT NULL
    DROP TABLE dbo.Employees;
GO

IF OBJECT_ID(N'dbo.AppUsers', N'U') IS NOT NULL
    DROP TABLE dbo.AppUsers;
GO

IF OBJECT_ID(N'dbo.Shifts', N'U') IS NOT NULL
    DROP TABLE dbo.Shifts;
GO

IF OBJECT_ID(N'dbo.Roles', N'U') IS NOT NULL
    DROP TABLE dbo.Roles;
GO

CREATE TABLE dbo.Roles (
    RoleId INT IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(50) NOT NULL UNIQUE
);
GO

CREATE TABLE dbo.AppUsers (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    RoleId INT NOT NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_AppUsers_IsActive DEFAULT 1,
    CreatedAt DATETIME NOT NULL CONSTRAINT DF_AppUsers_CreatedAt DEFAULT GETDATE(),

    CONSTRAINT FK_AppUsers_Roles
        FOREIGN KEY (RoleId) REFERENCES dbo.Roles(RoleId)
);
GO

CREATE TABLE dbo.Employees (
    EmployeeId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Phone NVARCHAR(20) NULL,
    Email NVARCHAR(100) NULL,
    Position NVARCHAR(100) NOT NULL,
    Specialty NVARCHAR(100) NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_Employees_IsActive DEFAULT 1,
    UserId INT NULL,

    CONSTRAINT FK_Employees_AppUsers
        FOREIGN KEY (UserId) REFERENCES dbo.AppUsers(UserId)
);
GO

CREATE UNIQUE INDEX UX_Employees_UserId_NotNull
ON dbo.Employees(UserId)
WHERE UserId IS NOT NULL;
GO

CREATE TABLE dbo.Shifts (
    ShiftId INT IDENTITY(1,1) PRIMARY KEY,
    ShiftCode NVARCHAR(20) NOT NULL UNIQUE,
    ShiftName NVARCHAR(100) NOT NULL,
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_Shifts_IsActive DEFAULT 1,

    CONSTRAINT CK_Shifts_Time CHECK (EndTime > StartTime)
);
GO

CREATE TABLE dbo.WorkSchedules (
    ScheduleId INT IDENTITY(1,1) PRIMARY KEY,
    EmployeeId INT NOT NULL,
    ShiftId INT NOT NULL,
    WorkDate DATE NOT NULL,
    Status NVARCHAR(30) NOT NULL
        CONSTRAINT DF_WorkSchedules_Status DEFAULT N'Đã phân công',
    Note NVARCHAR(255) NULL,
    CreatedAt DATETIME NOT NULL
        CONSTRAINT DF_WorkSchedules_CreatedAt DEFAULT GETDATE(),

    CONSTRAINT FK_WorkSchedules_Employees
        FOREIGN KEY (EmployeeId) REFERENCES dbo.Employees(EmployeeId),

    CONSTRAINT FK_WorkSchedules_Shifts
        FOREIGN KEY (ShiftId) REFERENCES dbo.Shifts(ShiftId),

    CONSTRAINT UQ_WorkSchedules_Employee_Shift_Date
        UNIQUE (EmployeeId, ShiftId, WorkDate)
);
GO