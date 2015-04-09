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

-- If using a different database for Activity Log from the main WSRR database
-- remove the -- db -- marker from the start of the following lines
-- db -- CREATE DATABASE __DBNAME__ ALIAS __DBNAME__ 
-- db --        USING CODESET UTF-8 TERRITORY US
-- db --        COLLATE USING IDENTITY PAGESIZE 32768
-- db --        USER TABLESPACE
-- db --          MANAGED BY AUTOMATIC STORAGE
-- db --          AUTORESIZE YES
-- db --          INITIALSIZE 500 M
-- db --          INCREASESIZE 10 PERCENT
-- db --          MAXSIZE NONE;

CONNECT TO __DBNAME__;

-- Create the bufferpools and tablespaces.  This is only needed if
-- a separate Activity Log database is being configured.
-- db -- CREATE BUFFERPOOL WSRRBP IMMEDIATE 
-- db --     SIZE 512 AUTOMATIC 
-- db --     PAGESIZE 32K; 
-- db -- CREATE BUFFERPOOL WSRRTMP IMMEDIATE 
-- db --     SIZE 64 AUTOMATIC 
-- db --     PAGESIZE 32K;

-- db -- CREATE LARGE TABLESPACE WSRRTS
-- db --     PAGESIZE 32K
-- db --     MANAGED BY AUTOMATIC STORAGE
-- db --     AUTORESIZE YES
-- db --     INITIALSIZE 5M
-- db --     INCREASESIZE 10 PERCENT
-- db --     MAXSIZE NONE
-- db --     EXTENTSIZE 16
-- db --     BUFFERPOOL WSRRBP
-- db --     FILE SYSTEM CACHING; 

-- db -- CREATE TEMPORARY TABLESPACE WSRRTEMP 
-- db --     PAGESIZE 32K
-- db --     MANAGED BY AUTOMATIC STORAGE
-- db --     EXTENTSIZE 16
-- db --     BUFFERPOOL WSRRTMP
-- db --     FILE SYSTEM CACHING;

-- schema -- GRANT IMPLICIT_SCHEMA ON DATABASE TO USER __DBSYSUSER__ ;

DISCONNECT CURRENT ;
