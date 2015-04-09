-- begin_generated_IBM_copyright_prolog

-- Licensed Materials - Property of IBM
-- 
-- 5724-N72 5655-WBS
-- 
-- Copyright IBM Corp. 2006, 2008 All Rights Reserved.
-- 
-- US Government Users Restricted Rights - Use, duplication or
-- disclosure restricted by GSA ADP Schedule Contract with
-- IBM Corp.

-- end_generated_IBM_copyright_prolog

------------------------------------------------
---------------------------------------------------------------------
-- DDL Statements for PROCEDURES
---------------------------------------------------------------------
SET CURRENT SCHEMA = '@WSRR_DB_SCHEMA@';
---------------------------------------------------------------------
-- Drop Stored procedures for encoding strings and URI's
---------------------------------------------------------------------
DROP PROCEDURE @WSRR_DB_SCHEMA@.UPDST;
DROP PROCEDURE @WSRR_DB_SCHEMA@.NGUPDST;
DROP PROCEDURE @WSRR_DB_SCHEMA@.GUPDST;
DROP PROCEDURE @WSRR_DB_SCHEMA@.DELST;
DROP PROCEDURE @WSRR_DB_SCHEMA@.CRTST;
DROP PROCEDURE @WSRR_DB_SCHEMA@.NGCRTST;
DROP PROCEDURE @WSRR_DB_SCHEMA@.GCRTST;
DROP PROCEDURE @WSRR_DB_SCHEMA@.ENCOBJ;
DROP PROCEDURE @WSRR_DB_SCHEMA@.ENCGRAPH;
DROP PROCEDURE @WSRR_DB_SCHEMA@.ENCPRED;
DROP PROCEDURE @WSRR_DB_SCHEMA@.ENCSUBJ;

COMMIT;
