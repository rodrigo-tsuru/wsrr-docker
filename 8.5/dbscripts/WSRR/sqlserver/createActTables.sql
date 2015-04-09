-- begin_generated_IBM_copyright_prolog

-- Licensed Materials - Property of IBM
-- 
-- 5724-N72 5655-WBS
-- 
-- Copyright IBM Corp. 2009 All Rights Reserved.
-- 
-- US Government Users Restricted Rights - Use, duplication or
-- disclosure restricted by GSA ADP Schedule Contract with
-- IBM Corp.

-- end_generated_IBM_copyright_prolog


CREATE TABLE __DBSCHEMA__.SR_ACTIVITY_APICALL (
	ID int IDENTITY PRIMARY KEY CLUSTERED,
	CONTAINER_ID int NOT NULL ,
        OWNING_APICALL_ID int,
	API_TYPE nvarchar (8) ,
	METHOD nvarchar (32) ,
	ROOT_OBJECT nvarchar (72),
	USERID nvarchar (64) ,
	TIME_CREATED  datetime NOT NULL
);


CREATE TABLE __DBSCHEMA__.SR_ACTIVITY_RECORD (
        ID int IDENTITY PRIMARY KEY CLUSTERED,
        API_CALL_ID int NOT NULL,
        RESOURCE_ACTION nvarchar (16) ,
	RESOURCE_TYPE nvarchar (16) ,
	SUBJECT nvarchar (72) ,
	PREDICATE nvarchar (1020),
	FROM_VALUE nvarchar (1020) ,
	TO_VALUE nvarchar (1020) ,
        TIME_CREATED datetime NOT NULL
);


CREATE NONCLUSTERED INDEX IDX_ACT_REC_SUB ON __DBSCHEMA__.SR_ACTIVITY_RECORD(SUBJECT, API_CALL_ID);

CREATE UNIQUE INDEX IDX_ACT_APICALL_1 ON __DBSCHEMA__.SR_ACTIVITY_APICALL(ID ASC) INCLUDE(METHOD, USERID);
CREATE NONCLUSTERED INDEX IDX_ACT_APICALL_2 ON __DBSCHEMA__.SR_ACTIVITY_APICALL(USERID ASC, METHOD ASC, ID ASC);
CREATE NONCLUSTERED INDEX IDX_ACT_APICALL_3 ON __DBSCHEMA__.SR_ACTIVITY_APICALL(METHOD ASC, USERID ASC, ID ASC);

GO -- remove this line if running through JDBC
