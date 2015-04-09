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

ALTER SESSION SET CURRENT_SCHEMA = __DBSCHEMA__;

DROP SEQUENCE SEQ_SR_ACTIVITY_RECORD_ID;
DROP SEQUENCE SEQ_SR_ACTIVITY_APICALL_ID;

DROP INDEX IDX_ACT_REC_SUB;

DROP INDEX IDX_ACT_APICALL_2;
DROP INDEX IDX_ACT_APICALL_3;
DROP INDEX IDX_ACT_REC_2;
DROP INDEX IDX_ACT_REC_3;
DROP INDEX IDX_ACT_REC_4;
DROP INDEX IDX_ACT_REC_5;

DROP TABLE SR_ACTIVITY_RECORD;
DROP TABLE SR_ACTIVITY_APICALL;
