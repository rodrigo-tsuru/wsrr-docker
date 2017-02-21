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
SET CURRENT SCHEMA = '@ACT_DB_SCHEMA@' ;

DROP TABLE @ACT_DB_SCHEMA@.SR_ACTIVITY_RECORD ;
DROP TABLESPACE @ACT_DB_NAME@.WSRRACT3 ;

DROP INDEX @ACT_DB_SCHEMA@.IDX_ACT_APICALL_2 ;
DROP INDEX @ACT_DB_SCHEMA@.IDX_ACT_APICALL_3 ;
DROP TABLE @ACT_DB_SCHEMA@.SR_ACTIVITY_APICALL ;
DROP TABLESPACE @ACT_DB_NAME@.WSRRACT2 ;

COMMIT ;
