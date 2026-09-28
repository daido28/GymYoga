USE GymYogaHRM;
GO

IF NOT EXISTS (
    SELECT 1
    FROM dbo.Roles
    WHERE RoleName = N'Admin'
)
BEGIN
    INSERT INTO dbo.Roles (RoleName)
    VALUES (N'Admin');
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM dbo.Roles
    WHERE RoleName = N'Nhân viên'
)
BEGIN
    INSERT INTO dbo.Roles (RoleName)
    VALUES (N'Nhân viên');
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM dbo.Shifts
    WHERE ShiftCode = N'SANG'
)
BEGIN
    INSERT INTO dbo.Shifts (ShiftCode, ShiftName, StartTime, EndTime)
    VALUES (N'SANG', N'Ca sáng', '06:00', '12:00');
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM dbo.Shifts
    WHERE ShiftCode = N'CHIEU'
)
BEGIN
    INSERT INTO dbo.Shifts (ShiftCode, ShiftName, StartTime, EndTime)
    VALUES (N'CHIEU', N'Ca chiều', '12:00', '18:00');
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM dbo.Shifts
    WHERE ShiftCode = N'TOI'
)
BEGIN
    INSERT INTO dbo.Shifts (ShiftCode, ShiftName, StartTime, EndTime)
    VALUES (N'TOI', N'Ca tối', '18:00', '22:00');
END
GO