SET XACT_ABORT ON;
BEGIN TRANSACTION;
IF COL_LENGTH('dbo.Shifts','Capacity') IS NULL
 ALTER TABLE dbo.Shifts ADD Capacity INT NOT NULL CONSTRAINT DF_Shifts_Capacity DEFAULT 3;
IF COL_LENGTH('dbo.Shifts','IsSupport') IS NULL
 ALTER TABLE dbo.Shifts ADD IsSupport BIT NOT NULL CONSTRAINT DF_Shifts_IsSupport DEFAULT 0;
IF NOT EXISTS(SELECT 1 FROM sys.check_constraints WHERE name='CK_Shifts_Capacity')
 EXEC(N'ALTER TABLE dbo.Shifts ADD CONSTRAINT CK_Shifts_Capacity CHECK(Capacity>0)');
COMMIT;
