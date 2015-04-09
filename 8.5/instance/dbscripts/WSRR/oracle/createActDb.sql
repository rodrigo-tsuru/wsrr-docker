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

CONNECT / AS SYSDBA
STARTUP OPEN __DBNAME__
SET ECHO ON
ALTER USER SYSTEM IDENTIFIED BY __DBSYSPASSWORD__;
ALTER USER SYS IDENTIFIED BY __DBSYSPASSWORD__;

-- user -- CREATE USER __DBUSER__ IDENTIFIED BY __DBPASSWORD__;
-- user -- GRANT CREATE SESSION TO __DBUSER__;
-- user -- GRANT UNLIMITED TABLESPACE TO __DBUSER__;

exit
