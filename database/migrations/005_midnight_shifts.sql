SET XACT_ABORT ON;
BEGIN TRANSACTION;
IF EXISTS(SELECT 1 FROM sys.check_constraints WHERE parent_object_id=OBJECT_ID('dbo.Shifts') AND name='CK_Shifts_Time')
 ALTER TABLE dbo.Shifts DROP CONSTRAINT CK_Shifts_Time;
ALTER TABLE dbo.Shifts WITH CHECK ADD CONSTRAINT CK_Shifts_Time
 CHECK(EndTime>StartTime OR (EndTime=CONVERT(time,'00:00') AND StartTime>CONVERT(time,'00:00')));
COMMIT;
