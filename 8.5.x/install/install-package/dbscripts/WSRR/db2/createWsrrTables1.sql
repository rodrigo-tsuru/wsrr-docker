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

SET CURRENT SCHEMA __DBSCHEMA__;

CREATE TABLE SUBJECT (
    HASH    BIGINT         NOT NULL,
    URI     VARCHAR(1024)  NOT NULL,
    VERSION BIGINT         NOT NULL WITH DEFAULT 0,
    PRIMARY KEY(HASH)
) IN ATHDATATS;

CREATE TABLE PREDICATE (
    HASH    BIGINT        NOT NULL,
    URI     VARCHAR(1024) NOT NULL,
    PRIMARY KEY(HASH)
) IN ATHDATATS;

CREATE TABLE OBJECT (
    HASH      BIGINT        NOT NULL,
    STRING    VARCHAR(1024) NOT NULL,
    LANG      CHAR(2),
    DISTRICT  CHAR(2),
    LVARIANT  VARCHAR(254),
    CONTENT   BLOB (2G) INLINE LENGTH 3072,
    PRIMARY KEY(HASH)
) 
LONG IN ATHLOBTS
IN ATHDATATS;

CREATE TABLE GRAPH (
    HASH BIGINT        NOT NULL,
    URI  VARCHAR(1024) NOT NULL,
    PRIMARY KEY(HASH)
) IN ATHDATATS;

CREATE INDEX IDX_VALUE_LANG ON OBJECT(LANG ASC, DISTRICT ASC, LVARIANT ASC, HASH ASC) ALLOW REVERSE SCANS;

CREATE TABLE STATEMENT (
    SUBJ_HASH       BIGINT   NOT NULL,
    PRED_HASH       BIGINT   NOT NULL,
    OBJ_HASH        BIGINT   NOT NULL,
    OBJ_HASH_REL    BIGINT,
    OBJ_TYP_CD      SMALLINT NOT NULL
) IN ATHSTMTTS;

CREATE TABLE GSTATEMENT (
    SUBJ_HASH       BIGINT   NOT NULL,
    PRED_HASH       BIGINT   NOT NULL,
    OBJ_HASH        BIGINT   NOT NULL,
    OBJ_TYP_CD      SMALLINT NOT NULL,
    LANG            CHAR(2),
    GRAPH_HASH      BIGINT
) IN ATHSTMTTS;

ALTER TABLE GSTATEMENT ADD CONSTRAINT FK_GSTATEMENT_SUBJ FOREIGN KEY (SUBJ_HASH) REFERENCES SUBJECT(HASH);
ALTER TABLE GSTATEMENT ADD CONSTRAINT FK_GSTATEMENT_PRED FOREIGN KEY (PRED_HASH) REFERENCES PREDICATE(HASH);
ALTER TABLE GSTATEMENT ADD CONSTRAINT FK_GSTATEMENT_GRAPH FOREIGN KEY (GRAPH_HASH) REFERENCES GRAPH(HASH);

ALTER TABLE STATEMENT ADD CONSTRAINT FK_STATEMENT_SUBJ FOREIGN KEY (SUBJ_HASH) REFERENCES SUBJECT(HASH);
ALTER TABLE STATEMENT ADD CONSTRAINT FK_STATEMENT_OBJ_HASH_REL FOREIGN KEY (OBJ_HASH_REL) REFERENCES SUBJECT(HASH);
ALTER TABLE STATEMENT ADD CONSTRAINT FK_STATEMENT_PRED FOREIGN KEY (PRED_HASH) REFERENCES PREDICATE(HASH);


CREATE INDEX IDX_STMT_OBJ_HASH_REL ON STATEMENT(OBJ_HASH_REL ASC);

CREATE UNIQUE INDEX IDX_STMT_SUBJ_PRED_OBJ ON STATEMENT (SUBJ_HASH ASC, PRED_HASH ASC, OBJ_TYP_CD ASC, OBJ_HASH ASC) ALLOW REVERSE SCANS;
CREATE UNIQUE INDEX IDX_STMT_PRED_OBJ_SUBJ ON STATEMENT (PRED_HASH ASC, OBJ_HASH ASC, OBJ_TYP_CD ASC, SUBJ_HASH ASC) ALLOW REVERSE SCANS;
CREATE UNIQUE INDEX IDX_STMT_OBJ_SUBJ_PRED ON STATEMENT (OBJ_HASH ASC, OBJ_TYP_CD ASC, SUBJ_HASH ASC, PRED_HASH ASC) ALLOW REVERSE SCANS;

CREATE UNIQUE INDEX IDX_GSTMT_REL_OBJ ON GSTATEMENT(OBJ_HASH ASC, PRED_HASH ASC, OBJ_TYP_CD ASC, SUBJ_HASH ASC, GRAPH_HASH ASC) ALLOW REVERSE SCANS;
CREATE UNIQUE INDEX IDX_GSTMT_GRAPH ON GSTATEMENT(GRAPH_HASH ASC, SUBJ_HASH ASC, PRED_HASH ASC, OBJ_TYP_CD ASC, OBJ_HASH ASC) ALLOW REVERSE SCANS;
CREATE UNIQUE INDEX IDX_GSTMT_PRED ON GSTATEMENT(PRED_HASH ASC, SUBJ_HASH ASC, OBJ_HASH ASC, OBJ_TYP_CD ASC, GRAPH_HASH ASC) ALLOW REVERSE SCANS;

CREATE INDEX IDX_GSTMT_PRED_OBJ_SUB ON GSTATEMENT (PRED_HASH ASC, OBJ_HASH ASC, SUBJ_HASH ASC) ALLOW REVERSE SCANS;
CREATE INDEX IDX_GSTMT_OBJ_SUBJ_PRED ON GSTATEMENT (OBJ_HASH ASC, SUBJ_HASH ASC, PRED_HASH ASC) ALLOW REVERSE SCANS;
CREATE UNIQUE INDEX IDX_GSTMT_INSTANCE_ROW ON GSTATEMENT (SUBJ_HASH ASC, GRAPH_HASH ASC, OBJ_TYP_CD ASC, OBJ_HASH ASC, PRED_HASH ASC) ALLOW REVERSE SCANS;

CREATE UNIQUE INDEX IDX_OBJ_STRING ON OBJECT (HASH ASC) INCLUDE (STRING) ALLOW REVERSE SCANS;
CREATE UNIQUE INDEX IDX_PRED_URI ON PREDICATE (HASH ASC) INCLUDE (URI) ALLOW REVERSE SCANS;
CREATE UNIQUE INDEX IDX_GRAPH_URI ON GRAPH (HASH ASC) INCLUDE (URI) ALLOW REVERSE SCANS;
CREATE UNIQUE INDEX IDX_SUBJ_URI ON SUBJECT (HASH ASC) INCLUDE (URI, VERSION) ALLOW REVERSE SCANS;

ALTER TABLE SUBJECT   VOLATILE;
ALTER TABLE PREDICATE VOLATILE;
ALTER TABLE OBJECT    VOLATILE;
ALTER TABLE GRAPH     VOLATILE;



CREATE TABLE MOD_LOCK (
    ID INTEGER    NOT NULL,
    MLOCK INTEGER NOT NULL
) IN ATHDATATS;

INSERT INTO MOD_LOCK (ID,MLOCK) VALUES (1,0);

----------------------------------------------------------
-- View that shows the STATEMENT table in its resolved state - that is, with full
-- text values for GRAPH, SUBJECT, PREDICATE, and OBJECT.  Intended only for service purposes.
----------------------------------------------------------
CREATE VIEW SVC_STATEMENT AS
    SELECT (select URI from subject where hash = st.subj_hash) subject,
    (select URI from predicate where hash = st.pred_hash) predicate, 
    CASE
        WHEN st.OBJ_TYP_CD IN (1,2,9,16) THEN (SELECT STRING from OBJECT WHERE HASH=st.OBJ_HASH)
        WHEN st.OBJ_TYP_CD IN (17) THEN 'BLOB: ' || CAST(st.OBJ_HASH AS CHAR(25)) || ' (BYTELEN: ' || CAST((SELECT length(CONTENT) FROM OBJECT WHERE HASH = st.OBJ_HASH) AS CHAR(25)) || ')'
        WHEN st.OBJ_TYP_CD IN (18) THEN 'LARGE STRING: ' || CAST(st.OBJ_HASH AS CHAR(25)) || ' (BYTELEN: ' || CAST((SELECT length(CONTENT) FROM OBJECT WHERE HASH = st.OBJ_HASH) AS CHAR(25)) || ')'
        ELSE CAST(st.OBJ_HASH AS CHAR(25))
    END object,
    (SELECT URI from GRAPH WHERE HASH=st.GRAPH_HASH) GRAPH,
    st.OBJ_TYP_CD OBJ_TYP_CD, st.SUBJ_HASH SUBJ_HASH, st.PRED_HASH PRED_HASH, st.OBJ_HASH OBJ_HASH, st.OBJ_HASH_REL OBJ_HASH_REL, st.GRAPH_HASH GRAPH_HASH, st.LANG LANG
    FROM 
        (select SUBJ_HASH, PRED_HASH, OBJ_HASH, cast(null as bigint) as GRAPH_HASH, OBJ_TYP_CD, cast(null as CHAR(2)) as LANG, OBJ_HASH_REL from STATEMENT
        UNION ALL
        select SUBJ_HASH, PRED_HASH, OBJ_HASH, GRAPH_HASH, OBJ_TYP_CD, LANG, cast(null as bigint) as OBJ_HASH_REL from GSTATEMENT) st;    
    
GRANT SELECT,INSERT,UPDATE,DELETE ON SUBJECT TO USER __DBUSER__; 
GRANT SELECT,INSERT,UPDATE,DELETE ON PREDICATE TO USER __DBUSER__;
GRANT SELECT,INSERT,UPDATE,DELETE ON OBJECT TO USER __DBUSER__;
GRANT SELECT,INSERT,UPDATE,DELETE ON GRAPH TO USER __DBUSER__;
GRANT SELECT,INSERT,UPDATE,DELETE ON STATEMENT TO USER __DBUSER__;
GRANT SELECT,INSERT,UPDATE,DELETE ON GSTATEMENT TO USER __DBUSER__;
GRANT SELECT ON SVC_STATEMENT TO USER __DBUSER__;
GRANT UPDATE ON MOD_LOCK TO USER __DBUSER__;
