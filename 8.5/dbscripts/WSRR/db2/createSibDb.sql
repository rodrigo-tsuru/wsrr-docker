-- begin_generated_IBM_copyright_prolog

-- Licensed Materials - Property of IBM
-- 
-- 5724-N72 5655-WBS
-- 
-- Copyright IBM Corp. 2006, 2009 All Rights Reserved.
-- 
-- US Government Users Restricted Rights - Use, duplication or
-- disclosure restricted by GSA ADP Schedule Contract with
-- IBM Corp.

-- end_generated_IBM_copyright_prolog

-- The WSRR installer will replace the DBNAME, DBUSER and DB2TSDIR variables in this file

-- AUTOCONFIGURE:
-- ==============
-- DB2 will automatically configure 25% of physical memory for the database
-- and the USERSPACE1 tablespace will automatically be configured to use
-- automatic storage, with an initial size of 500M

-- If using a different database for SIBus from the main WSRRs database
-- remove the -- db -- marker from the start of the following lines
-- db -- CREATE DATABASE __DBNAME__ ALIAS __DBNAME__ 
-- db --       USING CODESET UTF-8 TERRITORY US
-- db --       COLLATE USING IDENTITY PAGESIZE 32768
-- db --       USER TABLESPACE
-- db --         MANAGED BY AUTOMATIC STORAGE
-- db --         AUTORESIZE YES
-- db --         INITIALSIZE 500 M
-- db --         INCREASESIZE 10 PERCENT
-- db --         MAXSIZE NONE;

CONNECT TO __DBNAME__;

-- Switch off AUTO RUNSTATS for the SIBOWNER table as this can cause locking issues 
CALL SYSPROC.AUTOMAINT_SET_POLICY('AUTO_RUNSTATS', BLOB(' <?xml version="1.0" encoding="UTF-8"?>
  <DB2AutoRunstatsPolicy xmlns="http://www.ibm.com/xmlns/prod/db2/autonomic/config">
   <RunstatsTableScope>
    <FilterCondition>TABNAME NOT IN(''SIBOWNER'')</FilterCondition>
   </RunstatsTableScope>
  </DB2AutoRunstatsPolicy> '));

-- schema -- GRANT IMPLICIT_SCHEMA ON DATABASE TO USER __DBSYSUSER__ ;

DISCONNECT CURRENT;
