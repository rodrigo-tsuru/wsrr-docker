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
DROP INDEX IDX_ACT_REC_SUB ON __DBSCHEMA__.SR_ACTIVITY_RECORD;

DROP INDEX IDX_ACT_APICALL_1 ON __DBSCHEMA__.SR_ACTIVITY_APICALL;
DROP INDEX IDX_ACT_APICALL_2 ON __DBSCHEMA__.SR_ACTIVITY_APICALL;
DROP INDEX IDX_ACT_APICALL_3 ON __DBSCHEMA__.SR_ACTIVITY_APICALL;

DROP TABLE __DBSCHEMA__.SR_ACTIVITY_RECORD;
DROP TABLE __DBSCHEMA__.SR_ACTIVITY_APICALL;



GO -- remove this line if running through JDBC
