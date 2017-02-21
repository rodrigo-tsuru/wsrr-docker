-- begin_generated_IBM_copyright_prolog

-- Licensed Materials - Property of IBM
-- 
-- 5724-N72 5655-WBS
-- 
-- Copyright IBM Corp. 2008, 2009 All Rights Reserved.
-- 
-- US Government Users Restricted Rights - Use, duplication or
-- disclosure restricted by GSA ADP Schedule Contract with
-- IBM Corp.

-- end_generated_IBM_copyright_prolog

-- Creates MS SQL Server database with binary collation that takes advantage of new true code-point comparisons.
-- For binary collations on Unicode data types, the locale is not considered in data sorts.
-- 
-- Location for data file and log files is currently set to the default. In order to
-- maximize throughput and performance the locations may need changing to conform to specific
-- installation standards. Wherever possible, the data and log files should be placed
-- on seperate physical disks and these disks striped.

-- db -- CREATE DATABASE [__DBNAME__] COLLATE SQL_Latin1_General_CP1_CS_AS
-- db -- GO


-- Specifies the compatability level SQL Server supports
-- 90 = SQL Server 2005
-- db -- EXEC dbo.sp_dbcmptlevel @dbname=N'__DBNAME__', @new_cmptlevel=90
-- db -- GO

-- The following sets SQL Server options (many of them are default)
-- If necessary, these options may be changed in order to suite the
-- requirements of the installtion.
-- db -- ALTER DATABASE [__DBNAME__] SET ANSI_NULL_DEFAULT OFF 
-- db -- GO
-- db -- ALTER DATABASE [__DBNAME__] SET ANSI_NULLS OFF 
-- db -- GO
-- db -- ALTER DATABASE [__DBNAME__] SET ANSI_PADDING OFF 
-- db -- GO
-- db -- ALTER DATABASE [__DBNAME__] SET ANSI_WARNINGS OFF 
-- db -- GO
-- db -- ALTER DATABASE [__DBNAME__] SET ARITHABORT OFF 
-- db -- GO
-- db -- ALTER DATABASE [__DBNAME__] SET AUTO_CLOSE OFF 
-- db -- GO
-- db -- ALTER DATABASE [__DBNAME__] SET AUTO_CREATE_STATISTICS ON 
-- db -- GO
-- db -- ALTER DATABASE [__DBNAME__] SET AUTO_SHRINK OFF 
-- db -- GO
-- db -- ALTER DATABASE [__DBNAME__] SET AUTO_UPDATE_STATISTICS ON 
-- db -- GO
-- db -- ALTER DATABASE [__DBNAME__] SET CURSOR_CLOSE_ON_COMMIT OFF 
-- db -- GO
-- db -- ALTER DATABASE [__DBNAME__] SET CURSOR_DEFAULT  GLOBAL 
-- db -- GO
-- db -- ALTER DATABASE [__DBNAME__] SET CONCAT_NULL_YIELDS_NULL OFF 
-- db -- GO
-- db -- ALTER DATABASE [__DBNAME__] SET NUMERIC_ROUNDABORT OFF 
-- db -- GO
-- db -- ALTER DATABASE [__DBNAME__] SET QUOTED_IDENTIFIER OFF 
-- db -- GO
-- db -- ALTER DATABASE [__DBNAME__] SET RECURSIVE_TRIGGERS OFF 
-- db -- GO
-- db -- ALTER DATABASE [__DBNAME__] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
-- db -- GO
-- db -- ALTER DATABASE [__DBNAME__] SET DATE_CORRELATION_OPTIMIZATION OFF 
-- db -- GO
-- db -- ALTER DATABASE [__DBNAME__] SET PARAMETERIZATION SIMPLE 
-- db -- GO
-- db -- ALTER DATABASE [__DBNAME__] SET  READ_WRITE 
-- db -- GO
-- db -- ALTER DATABASE [__DBNAME__] SET RECOVERY FULL 
-- db -- GO
-- db -- ALTER DATABASE [__DBNAME__] SET  MULTI_USER 
-- db -- GO
-- db -- ALTER DATABASE [__DBNAME__] SET PAGE_VERIFY CHECKSUM  
-- db -- GO
-- db -- USE [__DBNAME__]
-- db -- GO
-- db -- IF NOT EXISTS (SELECT name FROM sys.filegroups WHERE is_default=1 AND name = N'PRIMARY') ALTER DATABASE [__DBNAME__] MODIFY FILEGROUP [PRIMARY] DEFAULT
-- db -- GO


ALTER DATABASE [__DBNAME__] SET ALLOW_SNAPSHOT_ISOLATION ON
GO
ALTER DATABASE [__DBNAME__] SET READ_COMMITTED_SNAPSHOT ON
GO
ALTER DATABASE [__DBNAME__] MODIFY FILE( NAME = N'__DBNAME__' , SIZE = 1GB , FILEGROWTH = 10%)
GO
ALTER DATABASE [__DBNAME__] MODIFY FILE( NAME = N'__DBNAME___log' , SIZE = 1GB , FILEGROWTH = 10%)
GO
ALTER DATABASE [__DBNAME__] SET RECOVERY SIMPLE
GO

-- Create the SQL Server user in [master] if needed and add it to the SqlJDBCXAUser role
--  If the user already exists, do nothing
--  If not, check if we need to create a login too
-- NOTE: If the user is to use Windows Authentication, then it MUST already exist and be mapped to the correct login
--  also see the note below.
USE [master];
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = '__DBUSER__')
BEGIN
   IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = '__DBUSER__' OR name LIKE '%\__DBUSER__')
   BEGIN
      CREATE LOGIN __DBUSER__ WITH PASSWORD = '__DBPASSWORD__', DEFAULT_DATABASE=__DBNAME__, CHECK_EXPIRATION=OFF, CHECK_POLICY=OFF
   END
   CREATE USER __DBUSER__ FOR LOGIN __DBUSER__;
END

EXEC sp_addrolemember [SqlJDBCXAUser], '__DBUSER__'
GO

-- Add a user to the current database.
USE [__DBNAME__]

-- NOTE: If the user is to use Windows Authentication, change this line to read:
--   CREATE USER __DBUSER__ FOR LOGIN <domain>\__DBUSER__;
-- In this case the login MUST already be defined in SQL Server
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE NAME='__DBUSER__') CREATE USER __DBUSER__ FOR LOGIN __DBUSER__;

EXEC sp_addrolemember 'db_owner', '__DBUSER__'
GO
