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

-- CONNECT TO __DBNAME__;
-----------------------------------------------------------------------
-- Drop ATHENE TABLES
-----------------------------------------------------------------------
SET CURRENT SCHEMA __DBSCHEMA__;

DROP INDEX IDX_GSTMT_REL_OBJ;
DROP INDEX IDX_GSTMT_GRAPH;
DROP INDEX IDX_GSTMT_PRED;
DROP INDEX IDX_GSTMT_PRED_OBJ_SUB;
DROP INDEX IDX_GSTMT_OBJ_SUBJ_PRED;
DROP INDEX IDX_GSTMT_INSTANCE_ROW;

DROP INDEX IDX_STMT_OBJ_HASH_REL;
DROP INDEX IDX_STMT_SUBJ_PRED_OBJ;
DROP INDEX IDX_STMT_PRED_OBJ_SUBJ;
DROP INDEX IDX_STMT_OBJ_SUBJ_PRED;


DROP INDEX IDX_OBJ_STRING;
DROP INDEX IDX_PRED_URI;
DROP INDEX IDX_GRAPH_URI;
DROP INDEX IDX_SUBJ_URI;
DROP INDEX IDX_VALUE_LANG;

DROP VIEW SVC_STATEMENT;
DROP TABLE GSTATEMENT;
DROP TABLE STATEMENT;
DROP TABLE GRAPH;
DROP TABLE OBJECT;
DROP TABLE PREDICATE;
DROP TABLE SUBJECT;
DROP TABLE MOD_LOCK;
