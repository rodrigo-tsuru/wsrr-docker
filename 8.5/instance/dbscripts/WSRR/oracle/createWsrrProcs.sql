-- begin_generated_IBM_copyright_prolog

-- Licensed Materials - Property of IBM
-- 
-- 5724-N72 5655-WBS
-- 
-- Copyright IBM Corp. 2006, 2010 All Rights Reserved.
-- 
-- US Government Users Restricted Rights - Use, duplication or
-- disclosure restricted by GSA ADP Schedule Contract with
-- IBM Corp.

-- end_generated_IBM_copyright_prolog

------------------------------------------------
---------------------------------------------------------------------
---- Stored procedures for encoding strings and URI's
---------------------------------------------------------------------
SET SQLT /

ALTER SESSION SET CURRENT_SCHEMA = __DBSCHEMA__ /

CREATE OR REPLACE PROCEDURE ENCSUBJ(
    str_in  IN VARCHAR2,
    hash_in IN NUMBER) AS
    x NUMBER;
BEGIN
    SELECT HASH INTO x FROM SUBJECT WHERE HASH = hash_in;
    EXCEPTION
    WHEN NO_DATA_FOUND
    THEN
        BEGIN
            INSERT INTO SUBJECT
                (HASH, URI)
                VALUES
                    (hash_in, str_in);
            EXCEPTION
                WHEN DUP_VAL_ON_INDEX
                THEN
                    NULL;
        END;     
END ENCSUBJ;
/


CREATE OR REPLACE PROCEDURE ENCPRED(
    str_in  IN VARCHAR2,
    hash_in IN NUMBER) AS
    x NUMBER;
BEGIN
    SELECT HASH INTO x FROM PREDICATE WHERE HASH = hash_in;
    EXCEPTION
    WHEN NO_DATA_FOUND
    THEN
        BEGIN
            INSERT INTO PREDICATE
                (HASH, URI)
                VALUES
                    (hash_in, str_in);
            EXCEPTION
                WHEN DUP_VAL_ON_INDEX
                THEN
                    NULL;
        END;     
END ENCPRED;
/

CREATE OR REPLACE PROCEDURE ENCGRAPH(
    str_in  IN VARCHAR2,
    hash_in IN NUMBER) AS
    x NUMBER;
BEGIN
    SELECT HASH INTO x FROM GRAPH WHERE HASH = hash_in;
    EXCEPTION
    WHEN NO_DATA_FOUND
    THEN
        BEGIN
            INSERT INTO GRAPH
                (HASH, URI)
                VALUES
                    (hash_in, str_in);
            EXCEPTION
                WHEN DUP_VAL_ON_INDEX
                THEN
                    NULL;
        END;     
END ENCGRAPH;
/

CREATE OR REPLACE PROCEDURE ENCOBJ(
    str_in  IN VARCHAR2,
    hash_in IN NUMBER,
    lang_in IN CHAR,
    district_in IN CHAR,
    variant_in IN VARCHAR2) AS
    x NUMBER;
BEGIN
    SELECT HASH INTO x FROM OBJECT WHERE HASH = hash_in;
    EXCEPTION
    WHEN NO_DATA_FOUND
    THEN
        BEGIN
            INSERT INTO OBJECT
                (HASH, STRING, LANG, DISTRICT, LVARIANT)
                VALUES
                    (hash_in, str_in, lang_in, district_in, variant_in);
            EXCEPTION
                WHEN DUP_VAL_ON_INDEX
                THEN
                    NULL;
        END;     
END ENCOBJ;
/

CREATE OR REPLACE PROCEDURE NGCRTST ( 
    subj_hash_in        IN  NUMBER,
    pred_hash_in        IN  NUMBER,
    obj_hash_in         IN  NUMBER,
    set_obj_hash_rel_in IN NUMBER,
    obj_typ_in          IN  NUMBER) AS
    obj_hash_rel    NUMBER;
BEGIN
        
        IF (set_obj_hash_rel_in = 1) THEN
            obj_hash_rel := obj_hash_in;
        ELSE
            obj_hash_rel := NULL;
        END IF;
        
        INSERT INTO STATEMENT
            (SUBJ_HASH, PRED_HASH, OBJ_HASH, OBJ_HASH_REL, OBJ_TYP_CD)
            VALUES
                (subj_hash_in, pred_hash_in, obj_hash_in, obj_hash_rel, obj_typ_in);
        EXCEPTION
            WHEN DUP_VAL_ON_INDEX
            THEN
                NULL ;
END NGCRTST;
/

CREATE OR REPLACE PROCEDURE GCRTST ( 
    subj_hash_in        IN  NUMBER,
    pred_hash_in        IN  NUMBER,
    obj_hash_in         IN  NUMBER,
    obj_lang_in         IN  CHAR,
    obj_typ_in          IN  NUMBER,
    graph_uri_in        IN  VARCHAR2,
    graph_hash_in       IN  NUMBER) AS
    x    NUMBER;
BEGIN
        
        ENCGRAPH(graph_uri_in, graph_hash_in);
        INSERT INTO GSTATEMENT
            (SUBJ_HASH, PRED_HASH, OBJ_HASH, OBJ_TYP_CD, LANG, GRAPH_HASH)
            VALUES
                (subj_hash_in, pred_hash_in, obj_hash_in, obj_typ_in, obj_lang_in, graph_hash_in);
        EXCEPTION
            WHEN DUP_VAL_ON_INDEX
            THEN
                NULL ;
END GCRTST;
/

CREATE OR REPLACE PROCEDURE CRTST ( 
    subj_uri_in         IN  VARCHAR2,
    subj_hash_in        IN  NUMBER,
    pred_uri_in         IN  VARCHAR2,
    pred_hash_in        IN  NUMBER,
    obj_in              IN  VARCHAR2,
    obj_hash_in         IN  NUMBER,
    set_obj_hash_rel_in IN NUMBER,
    obj_lang_in         IN  CHAR,
    obj_district_in     IN  CHAR,
    obj_variant_in      IN  VARCHAR2,                                                
    obj_typ_in          IN  NUMBER,
    graph_uri_in        IN  VARCHAR2,
    graph_hash_in       IN  NUMBER) AS
    found_dup       NUMBER;
    obj_hash_rel    NUMBER;
BEGIN
        IF subj_uri_in IS NOT NULL THEN
            ENCSUBJ(subj_uri_in, subj_hash_in);
        END IF;
        
        ENCPRED(pred_uri_in, pred_hash_in);
        IF obj_in IS NOT NULL THEN
            ENCOBJ(obj_in, obj_hash_in, obj_lang_in, obj_district_in, obj_variant_in);
        END IF;
        
        IF graph_hash_in IS NULL THEN
                NGCRTST(subj_hash_in, pred_hash_in, obj_hash_in, set_obj_hash_rel_in, obj_typ_in);
        ELSE
                GCRTST(subj_hash_in, pred_hash_in, obj_hash_in, obj_lang_in, obj_typ_in, graph_uri_in, graph_hash_in);
        END IF;
        
END CRTST;
/

---------------------------------------------------------------------
---- Stored procedure for deleting statements from the store
---------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE DELST (
    subj_hash_in  IN NUMBER,
    pred_hash_in  IN NUMBER,
    graph_hash_in IN NUMBER,
    obj_hash_in   IN NUMBER,
    obj_typ_in    IN NUMBER,
    lang_in       IN CHAR) AS
    alt_obj_typ NUMBER;
BEGIN
    IF (obj_typ_in = 2) THEN
        alt_obj_typ := 18;
    ELSE
        alt_obj_typ := obj_typ_in;
    END IF;
    -- Delete the statements when applicable
    IF (graph_hash_in IS NULL) THEN
        DELETE FROM STATEMENT
            WHERE 
                (subj_hash_in IS NULL OR SUBJ_HASH   = subj_hash_in)  AND
                (pred_hash_in IS NULL OR PRED_HASH    = pred_hash_in) AND
                (obj_hash_in IS NULL OR OBJ_HASH      = obj_hash_in ) AND
                (obj_typ_in IS NULL OR OBJ_TYP_CD     = obj_typ_in OR OBJ_TYP_CD = alt_obj_typ);
    ELSE
        DELETE FROM GSTATEMENT
            WHERE 
                (subj_hash_in IS NULL OR SUBJ_HASH   = subj_hash_in)  AND
                (pred_hash_in IS NULL OR PRED_HASH    = pred_hash_in) AND
                (obj_hash_in IS NULL OR OBJ_HASH      = obj_hash_in ) AND
                (obj_typ_in IS NULL OR OBJ_TYP_CD     = obj_typ_in OR OBJ_TYP_CD = alt_obj_typ)   AND
                (lang_in IS NULL OR LANG     = lang_in)   AND
                (graph_hash_in IS NULL OR GRAPH_HASH  = graph_hash_in);
    END IF;

END DELST;
/

--------------------------------------------------------------------
---- Stored procedure for updating statements in the store
---------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE NGUPDST (
    subj_hash_in        IN      NUMBER,
    pred_hash_in        IN      NUMBER,
    obj_hash_in         IN      NUMBER,
    obj_typ_in          IN      NUMBER,
    alt_obj_typ_in      IN      NUMBER,
    new_obj_hash_in     IN      NUMBER,
    set_obj_hash_rel_in IN      NUMBER,
    new_obj_typ_in      IN      NUMBER) AS                 
    new_obj_hash_rel    NUMBER;
BEGIN 

    IF (set_obj_hash_rel_in = 1) THEN
        new_obj_hash_rel := new_obj_hash_in;
    ELSE
        new_obj_hash_rel := NULL;
    END IF;
           
    
    UPDATE STATEMENT SET OBJ_HASH=new_obj_hash_in, OBJ_HASH_REL=new_obj_hash_rel, OBJ_TYP_CD=new_obj_typ_in   
        WHERE  
            (SUBJ_HASH = subj_hash_in) and (PRED_HASH = pred_hash_in) and ( OBJ_HASH = obj_hash_in) and ((OBJ_TYP_CD=obj_typ_in) or (OBJ_TYP_CD=alt_obj_typ_in));            

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX
        THEN
            DELETE FROM STATEMENT WHERE (SUBJ_HASH = subj_hash_in) and (PRED_HASH = pred_hash_in) and ( OBJ_HASH = obj_hash_in) and ((OBJ_TYP_CD=obj_typ_in) or (OBJ_TYP_CD=alt_obj_typ_in));
END NGUPDST;
/


CREATE OR REPLACE PROCEDURE GUPDST (
    subj_hash_in        IN      NUMBER,
    pred_hash_in        IN      NUMBER,
    obj_hash_in         IN      NUMBER,
    obj_lang_in         IN      VARCHAR2,
    obj_typ_in          IN      NUMBER,
    alt_obj_typ_in          IN      NUMBER,
    graph_hash_in       IN      NUMBER,
    new_obj_hash_in     IN      NUMBER,
    new_obj_lang_in     IN      CHAR,
    new_obj_typ_in      IN      NUMBER) AS                 
    x         NUMBER;
BEGIN 
    
    IF (obj_lang_in IS NOT NULL) THEN 
        UPDATE GSTATEMENT SET OBJ_HASH=new_obj_hash_in, OBJ_TYP_CD=new_obj_typ_in, LANG=new_obj_lang_in   
           WHERE  
                (SUBJ_HASH = subj_hash_in) and (PRED_HASH = pred_hash_in) and ( OBJ_HASH = obj_hash_in) and ((OBJ_TYP_CD=obj_typ_in) or (OBJ_TYP_CD=alt_obj_typ_in)) and (GRAPH_HASH=graph_hash_in) and (LANG=obj_lang_in);                           
    ELSE
        UPDATE GSTATEMENT SET OBJ_HASH=new_obj_hash_in, OBJ_TYP_CD=new_obj_typ_in, LANG=new_obj_lang_in   
            WHERE  
                (SUBJ_HASH = subj_hash_in) and (PRED_HASH = pred_hash_in) and ( OBJ_HASH = obj_hash_in) and ((OBJ_TYP_CD=obj_typ_in) or (OBJ_TYP_CD=alt_obj_typ_in)) and (GRAPH_HASH=graph_hash_in) and (LANG IS NULL);                
    END IF;                                        
    EXCEPTION
        WHEN DUP_VAL_ON_INDEX
        THEN
            IF (obj_lang_in IS NOT NULL) THEN 
                DELETE FROM GSTATEMENT WHERE (SUBJ_HASH = subj_hash_in) and (PRED_HASH = pred_hash_in) and ( OBJ_HASH = obj_hash_in) and ((OBJ_TYP_CD=obj_typ_in) or (OBJ_TYP_CD=alt_obj_typ_in)) and (GRAPH_HASH=graph_hash_in) and (LANG=obj_lang_in);
            ELSE
                DELETE FROM GSTATEMENT WHERE (SUBJ_HASH = subj_hash_in) and (PRED_HASH = pred_hash_in) and ( OBJ_HASH = obj_hash_in) and ((OBJ_TYP_CD=obj_typ_in) or (OBJ_TYP_CD=alt_obj_typ_in)) and (GRAPH_HASH=graph_hash_in) and (LANG IS NULL);
            END IF;

END GUPDST;
/

CREATE OR REPLACE PROCEDURE UPDST (
    subj_hash_in        IN      NUMBER,
    pred_hash_in        IN      NUMBER,
    obj_hash_in         IN      NUMBER,
    obj_lang_in         IN      VARCHAR2,
    obj_typ_in          IN      NUMBER,
    graph_hash_in       IN      NUMBER,
    new_obj_in          IN      VARCHAR2,
    new_obj_hash_in     IN      NUMBER,
    set_obj_hash_rel_in IN      NUMBER,
    new_obj_lang_in     IN      CHAR,
    new_obj_district_in IN      CHAR,
    new_obj_variant_in  IN      VARCHAR2,
    new_obj_typ_in      IN      NUMBER) AS                 
    found_dup           NUMBER;
    alt_obj_typ         NUMBER;
    new_obj_hash_rel    NUMBER;
BEGIN 

    IF new_obj_in IS NOT NULL THEN
        ENCOBJ(new_obj_in, new_obj_hash_in, new_obj_lang_in, new_obj_district_in, new_obj_variant_in);
    END IF;
    
    IF (obj_typ_in = 2) THEN
        alt_obj_typ := 18;
    ELSE
        alt_obj_typ := obj_typ_in;
    END IF;
           
    IF (graph_hash_in IS NULL) THEN 
        NGUPDST(subj_hash_in, pred_hash_in, obj_hash_in, obj_typ_in, alt_obj_typ, new_obj_hash_in, set_obj_hash_rel_in, new_obj_typ_in);
    ELSE
        GUPDST(subj_hash_in, pred_hash_in, obj_hash_in, obj_lang_in, obj_typ_in, alt_obj_typ, graph_hash_in, new_obj_hash_in, new_obj_lang_in, new_obj_typ_in);
    END IF;        
  
END UPDST;
/

GRANT EXECUTE ON ENCSUBJ TO __DBUSER__ /
GRANT EXECUTE ON ENCPRED TO __DBUSER__ /
GRANT EXECUTE ON ENCGRAPH TO __DBUSER__ /
GRANT EXECUTE ON ENCOBJ TO __DBUSER__ /
GRANT EXECUTE ON NGCRTST TO __DBUSER__ /
GRANT EXECUTE ON GCRTST TO __DBUSER__ /
GRANT EXECUTE ON CRTST TO __DBUSER__ /
GRANT EXECUTE ON NGUPDST TO __DBUSER__ /
GRANT EXECUTE ON GUPDST TO __DBUSER__ /
GRANT EXECUTE ON UPDST TO __DBUSER__ /
GRANT EXECUTE ON DELST TO __DBUSER__ /
