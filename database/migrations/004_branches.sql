SET XACT_ABORT ON;
BEGIN TRANSACTION;
IF OBJECT_ID('dbo.Branches','U') IS NULL
BEGIN
 CREATE TABLE dbo.Branches(BranchId int IDENTITY PRIMARY KEY,BranchName nvarchar(100) NOT NULL UNIQUE,IsActive bit NOT NULL DEFAULT 1);
 INSERT dbo.Branches(BranchName) VALUES(N'Chi nhánh hiện tại');
END;
IF COL_LENGTH('dbo.Employees','BranchId') IS NULL
 ALTER TABLE dbo.Employees ADD BranchId int NOT NULL CONSTRAINT DF_Employees_Branch DEFAULT 1 WITH VALUES;
IF COL_LENGTH('dbo.Shifts','BranchId') IS NULL
 ALTER TABLE dbo.Shifts ADD BranchId int NOT NULL CONSTRAINT DF_Shifts_Branch DEFAULT 1 WITH VALUES;
IF COL_LENGTH('dbo.JobTypes','BranchId') IS NULL
 ALTER TABLE dbo.JobTypes ADD BranchId int NOT NULL CONSTRAINT DF_JobTypes_Branch DEFAULT 1 WITH VALUES;
IF NOT EXISTS(SELECT 1 FROM sys.foreign_keys WHERE name='FK_Employees_Branch')
 ALTER TABLE dbo.Employees ADD CONSTRAINT FK_Employees_Branch FOREIGN KEY(BranchId) REFERENCES dbo.Branches(BranchId);
IF NOT EXISTS(SELECT 1 FROM sys.foreign_keys WHERE name='FK_Shifts_Branch')
 ALTER TABLE dbo.Shifts ADD CONSTRAINT FK_Shifts_Branch FOREIGN KEY(BranchId) REFERENCES dbo.Branches(BranchId);
IF NOT EXISTS(SELECT 1 FROM sys.foreign_keys WHERE name='FK_JobTypes_Branch')
 ALTER TABLE dbo.JobTypes ADD CONSTRAINT FK_JobTypes_Branch FOREIGN KEY(BranchId) REFERENCES dbo.Branches(BranchId);
IF OBJECT_ID('dbo.UserBranches','U') IS NULL
 CREATE TABLE dbo.UserBranches(UserId int NOT NULL REFERENCES dbo.AppUsers(UserId),BranchId int NOT NULL REFERENCES dbo.Branches(BranchId),PRIMARY KEY(UserId,BranchId));
IF NOT EXISTS(SELECT 1 FROM dbo.Roles WHERE RoleName=N'Quản lý chi nhánh')
 INSERT dbo.Roles(RoleName) VALUES(N'Quản lý chi nhánh');
-- Retain codes and names, but allow their reuse in a different branch.
DECLARE @drop nvarchar(max)=N'';
SELECT @drop=@drop+N'ALTER TABLE dbo.'+QUOTENAME(OBJECT_NAME(k.parent_object_id))+N' DROP CONSTRAINT '+QUOTENAME(k.name)+N';'
FROM sys.key_constraints k
JOIN sys.index_columns ic ON ic.object_id=k.parent_object_id AND ic.index_id=k.unique_index_id
JOIN sys.columns c ON c.object_id=ic.object_id AND c.column_id=ic.column_id
WHERE k.type='UQ' AND ((k.parent_object_id=OBJECT_ID('dbo.Shifts') AND c.name='ShiftCode') OR (k.parent_object_id=OBJECT_ID('dbo.JobTypes') AND c.name='JobName'))
AND NOT EXISTS(SELECT 1 FROM sys.index_columns i2 WHERE i2.object_id=k.parent_object_id AND i2.index_id=k.unique_index_id AND i2.key_ordinal>1);
IF LEN(@drop)>0 EXEC sp_executesql @drop;
IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID('dbo.Shifts') AND name='UX_Shifts_Branch_Code')
 EXEC(N'CREATE UNIQUE INDEX UX_Shifts_Branch_Code ON dbo.Shifts(BranchId,ShiftCode)');
IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID('dbo.JobTypes') AND name='UX_JobTypes_Branch_Name')
 EXEC(N'CREATE UNIQUE INDEX UX_JobTypes_Branch_Name ON dbo.JobTypes(BranchId,JobName)');
COMMIT;
