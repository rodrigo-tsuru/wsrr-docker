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

--#SET TERMINATOR /

-- CONNECT TO __DBNAME__/

SET CURRENT SCHEMA __DBSCHEMA__ /
---------------------------------------------------------------------
---- Stored procedures for encoding strings and URI's
---------------------------------------------------------------------
CREATE PROCEDURE __DBSCHEMA__.ENCSUBJ(
    IN str_in   VARCHAR(1024),
    IN hash_in  BIGINT)
LANGUAGE SQL MODIFIES SQL DATA
CRSUBJ: BEGIN
    DECLARE CONTINUE HANDLER FOR SQLSTATE '23505' BEGIN END;
    IF NOT EXISTS(SELECT HASH FROM SUBJECT WHERE HASH = hash_in) THEN
        INSERT INTO SUBJECT
            (HASH, URI)
            VALUES
                (hash_in, str_in);
    END IF;
END CRSUBJ/

CREATE PROCEDURE __DBSCHEMA__.ENCPRED(
    IN str_in   VARCHAR(1024),
    IN hash_in  BIGINT)
LANGUAGE SQL MODIFIES SQL DATA
CRSUBJ: BEGIN
    DECLARE CONTINUE HANDLER FOR SQLSTATE '23505' BEGIN END;
    IF NOT EXISTS(SELECT HASH FROM PREDICATE WHERE HASH = hash_in) THEN
    INSERT INTO PREDICATE
        (HASH, URI)
        VALUES
        (hash_in, str_in);
    END IF;
END CRSUBJ/

CREATE PROCEDURE __DBSCHEMA__.ENCGRAPH(
    IN str_in   VARCHAR(1024),
    IN hash_in  BIGINT)
    LANGUAGE SQL MODIFIES SQL DATA
CRSUBJ: BEGIN
    DECLARE CONTINUE HANDLER FOR SQLSTATE '23505' BEGIN END;
    IF NOT EXISTS(SELECT HASH FROM GRAPH WHERE HASH = hash_in) THEN
        INSERT INTO GRAPH
            (HASH, URI)
            VALUES
                (hash_in, str_in);
    END IF;
END CRSUBJ/


CREATE PROCEDURE __DBSCHEMA__.ENCOBJ(
    IN str_in       VARCHAR(1024),
    IN hash_in      BIGINT,
    IN lang_in      CHAR(2),
    IN district_in  CHAR(2),
    IN variant_in   VARCHAR(254))
    LANGUAGE SQL MODIFIES SQL DATA
UPDVAL: BEGIN
    DECLARE CONTINUE HANDLER FOR SQLSTATE '23505' BEGIN END;
    IF NOT EXISTS (SELECT HASH FROM OBJECT WHERE HASH = hash_in) THEN
        INSERT INTO OBJECT
            (HASH, STRING, LANG, DISTRICT, LVARIANT)
            VALUES
                (hash_in, str_in, lang_in, district_in, variant_in);
    END IF;
END UPDVAL/

CREATE PROCEDURE __DBSCHEMA__.NGCRTST (
    IN subj_hash_in         BIGINT,
    IN pred_hash_in         BIGINT,
    IN obj_hash_in          BIGINT,
    IN set_obj_hash_rel_in  SMALLINT,
    IN obj_typ_in           SMALLINT)
    LANGUAGE SQL MODIFIES SQL DATA
CRTSTMT: BEGIN
    DECLARE obj_hash_rel BIGINT;
    DECLARE CONTINUE HANDLER FOR SQLSTATE '23505' BEGIN END;

    IF (set_obj_hash_rel_in = 1) THEN
        SET obj_hash_rel = obj_hash_in;
    ELSE
        SET obj_hash_rel = NULL;
    END IF;

    INSERT INTO STATEMENT
        (SUBJ_HASH, PRED_HASH, OBJ_HASH, OBJ_HASH_REL, OBJ_TYP_CD)
    VALUES
        (subj_hash_in, pred_hash_in, obj_hash_in, obj_hash_rel, obj_typ_in);
END CRTSTMT/


CREATE PROCEDURE __DBSCHEMA__.GCRTST (
    IN subj_hash_in         BIGINT,
    IN pred_hash_in         BIGINT,
    IN obj_hash_in          BIGINT,
    IN obj_lang_in          CHAR(2),
    IN obj_typ_in           SMALLINT,
    IN graph_uri_in         VARCHAR(1024),
    IN graph_hash_in        BIGINT)
    LANGUAGE SQL MODIFIES SQL DATA
CRTSTMT: BEGIN
    DECLARE obj_hash_rel BIGINT;
    DECLARE CONTINUE HANDLER FOR SQLSTATE '23505' BEGIN END;
    
    CALL __DBSCHEMA__.ENCGRAPH(graph_uri_in, graph_hash_in); 

    INSERT INTO GSTATEMENT
        (SUBJ_HASH, PRED_HASH, OBJ_HASH, OBJ_TYP_CD, LANG, GRAPH_HASH)
    VALUES
        (subj_hash_in, pred_hash_in, obj_hash_in, obj_typ_in, obj_lang_in, graph_hash_in);
END CRTSTMT/

---------------------------------------------------------------------
---- Stored procedure for writing new statements to the store
---------------------------------------------------------------------
CREATE PROCEDURE __DBSCHEMA__.CRTST (
    IN subj_uri_in          VARCHAR(1024),
    IN subj_hash_in         BIGINT,
    IN pred_uri_in          VARCHAR(1024),
    IN pred_hash_in         BIGINT,
    IN obj_in               VARCHAR(1024),
    IN obj_hash_in          BIGINT,
    IN set_obj_hash_rel_in  SMALLINT,
    IN obj_lang_in          CHAR(2),
    IN obj_district_in      CHAR(2),
    IN obj_variant_in       VARCHAR(254),
    IN obj_typ_in           SMALLINT,
    IN graph_uri_in         VARCHAR(1024),
    IN graph_hash_in        BIGINT)
    LANGUAGE SQL MODIFIES SQL DATA
CRTSTMT: BEGIN
        
    IF subj_uri_in IS NOT NULL THEN
        CALL  __DBSCHEMA__.ENCSUBJ(subj_uri_in, subj_hash_in); 
    END IF;
   
    CALL __DBSCHEMA__.ENCPRED(pred_uri_in, pred_hash_in);
    
    IF obj_in IS NOT NULL THEN
        CALL __DBSCHEMA__.ENCOBJ(obj_in, obj_hash_in, obj_lang_in, obj_district_in, obj_variant_in);
    END IF;
    
    IF graph_hash_in IS NULL THEN
       CALL  __DBSCHEMA__.NGCRTST(subj_hash_in, pred_hash_in, obj_hash_in, set_obj_hash_rel_in, obj_typ_in);
    ELSE
       CALL  __DBSCHEMA__.GCRTST(subj_hash_in, pred_hash_in, obj_hash_in, obj_lang_in, obj_typ_in, graph_uri_in, graph_hash_in);
    END IF;
END CRTSTMT/

---------------------------------------------------------------------
---- Stored procedure for deleting statements from the store
---------------------------------------------------------------------

CREATE PROCEDURE __DBSCHEMA__.DELST (
    IN subj_hash_in BIGINT,
    IN pred_hash_in     BIGINT,
    IN graph_hash_in    BIGINT,
    IN obj_hash_in      BIGINT,
    IN obj_typ_in       SMALLINT,
    IN lang_in          CHAR(2))
    LANGUAGE SQL MODIFIES SQL DATA
DLTSTMT : BEGIN
    DECLARE alt_obj_typ SMALLINT;
    
    IF (obj_typ_in = 2) THEN
        SET alt_obj_typ = 18;
    ELSE
        SET alt_obj_typ = obj_typ_in;
    END IF;
        -- Delete the statements when applicable
    IF graph_hash_in IS NULL THEN
        DELETE FROM __DBSCHEMA__.STATEMENT
            WHERE 
                (subj_hash_in IS NULL OR SUBJ_HASH   = subj_hash_in)  AND
                (pred_hash_in IS NULL OR PRED_HASH    = pred_hash_in) AND
                (obj_hash_in IS NULL OR OBJ_HASH      = obj_hash_in ) AND
                (obj_typ_in IS NULL OR OBJ_TYP_CD     = obj_typ_in OR OBJ_TYP_CD = alt_obj_typ);
    ELSE
        DELETE FROM __DBSCHEMA__.GSTATEMENT
            WHERE 
                (subj_hash_in IS NULL OR SUBJ_HASH   = subj_hash_in)  AND
                (pred_hash_in IS NULL OR PRED_HASH    = pred_hash_in) AND
                (obj_hash_in IS NULL OR OBJ_HASH      = obj_hash_in ) AND
                (obj_typ_in IS NULL OR OBJ_TYP_CD     = obj_typ_in OR OBJ_TYP_CD = alt_obj_typ) AND
                (lang_in IS NULL OR LANG     = lang_in)   AND
                (graph_hash_in IS NULL OR GRAPH_HASH  = graph_hash_in);
    END IF;
END DLTSTMT/



-- Update the non-graph statement table
CREATE PROCEDURE __DBSCHEMA__.NGUPDST (
    IN subj_hash_in         BIGINT,
    IN pred_hash_in         BIGINT,
    IN obj_hash_in          BIGINT,
    IN obj_typ_in           SMALLINT,
    IN alt_obj_typ_in       SMALLINT,
    IN new_obj_hash_in      BIGINT,
    IN set_obj_hash_rel_in  SMALLINT,
    IN new_obj_typ_in       SMALLINT)
    LANGUAGE SQL MODIFIES SQL DATA
UPDSTMT: BEGIN
    DECLARE new_obj_hash_rel    BIGINT;
    DECLARE CONTINUE HANDLER FOR SQLSTATE '23505' BEGIN 
        DELETE FROM STATEMENT WHERE (SUBJ_HASH = subj_hash_in) and (PRED_HASH = pred_hash_in) and ( OBJ_HASH = obj_hash_in) and ((OBJ_TYP_CD=obj_typ_in) or (OBJ_TYP_CD=alt_obj_typ_in));
    END;

   
    IF (set_obj_hash_rel_in = 1) THEN
        SET new_obj_hash_rel = new_obj_hash_in;
    ELSE
        SET new_obj_hash_rel = NULL;
    END IF;
   
        

    UPDATE STATEMENT SET OBJ_HASH=new_obj_hash_in, OBJ_HASH_REL=new_obj_hash_rel, OBJ_TYP_CD=new_obj_typ_in   
        WHERE  
            (SUBJ_HASH = subj_hash_in) and (PRED_HASH = pred_hash_in) and ( OBJ_HASH = obj_hash_in) and ((OBJ_TYP_CD=obj_typ_in) or (OBJ_TYP_CD=alt_obj_typ_in));


    
END UPDSTMT/

-- update the graph statement table
CREATE PROCEDURE __DBSCHEMA__.GUPDST (
    IN subj_hash_in         BIGINT,
    IN pred_hash_in         BIGINT,
    IN obj_hash_in          BIGINT,
    IN obj_lang_in          CHAR(2),
    IN obj_typ_in           SMALLINT,
    IN alt_obj_typ_in       SMALLINT,
    IN graph_hash_in        BIGINT,
    IN new_obj_hash_in      BIGINT,
    IN new_obj_lang_in      CHAR(2),
    IN new_obj_typ_in       SMALLINT)
    LANGUAGE SQL MODIFIES SQL DATA
UPDSTMT: BEGIN
    DECLARE CONTINUE HANDLER FOR SQLSTATE '23505' BEGIN 
        IF (obj_lang_in IS NOT NULL) THEN 
            DELETE FROM GSTATEMENT WHERE (SUBJ_HASH = subj_hash_in) and (PRED_HASH = pred_hash_in) and ( OBJ_HASH = obj_hash_in) and ((OBJ_TYP_CD=obj_typ_in) or (OBJ_TYP_CD=alt_obj_typ_in)) and (GRAPH_HASH=graph_hash_in) and (LANG=obj_lang_in);
        ELSE
            DELETE FROM GSTATEMENT WHERE (SUBJ_HASH = subj_hash_in) and (PRED_HASH = pred_hash_in) and ( OBJ_HASH = obj_hash_in) and ((OBJ_TYP_CD=obj_typ_in) or (OBJ_TYP_CD=alt_obj_typ_in)) and (GRAPH_HASH=graph_hash_in) and (LANG IS NULL);
        END IF;
    END;
   
    IF (obj_lang_in IS NOT NULL) THEN 
        UPDATE GSTATEMENT SET OBJ_HASH=new_obj_hash_in, OBJ_TYP_CD=new_obj_typ_in, LANG=new_obj_lang_in   
            WHERE  
                (SUBJ_HASH = subj_hash_in) and (PRED_HASH = pred_hash_in) and ( OBJ_HASH = obj_hash_in) and ((OBJ_TYP_CD=obj_typ_in) or (OBJ_TYP_CD=alt_obj_typ_in)) and (GRAPH_HASH=graph_hash_in) and (LANG=obj_lang_in);   
    ELSE
        UPDATE GSTATEMENT SET OBJ_HASH=new_obj_hash_in, OBJ_TYP_CD=new_obj_typ_in, LANG=new_obj_lang_in   
            WHERE  
                (SUBJ_HASH = subj_hash_in) and (PRED_HASH = pred_hash_in) and ( OBJ_HASH = obj_hash_in) and ((OBJ_TYP_CD=obj_typ_in) or (OBJ_TYP_CD=alt_obj_typ_in)) and (GRAPH_HASH=graph_hash_in) and (LANG IS NULL);    
    END IF;    

END UPDSTMT/

--------------------------------------------------------------------
---- Stored procedure for updating statements in the store
---------------------------------------------------------------------
CREATE PROCEDURE __DBSCHEMA__.UPDST (
    IN subj_hash_in         BIGINT,
    IN pred_hash_in         BIGINT,
    IN obj_hash_in          BIGINT,
    IN obj_lang_in          CHAR(2),
    IN obj_typ_in           SMALLINT,
    IN graph_hash_in        BIGINT,
    IN new_obj_in           VARCHAR(1024),
    IN new_obj_hash_in      BIGINT,
    IN set_obj_hash_rel_in  SMALLINT,
    IN new_obj_lang_in      CHAR(2),
    IN new_obj_district_in  CHAR(2),
    IN new_obj_variant_in   VARCHAR(254),
    IN new_obj_typ_in       SMALLINT)
    LANGUAGE SQL MODIFIES SQL DATA
UPDSTMT: BEGIN
    DECLARE alt_obj_typ         SMALLINT;
    
    IF new_obj_in IS NOT NULL THEN
        CALL __DBSCHEMA__.ENCOBJ(new_obj_in, new_obj_hash_in, new_obj_lang_in, new_obj_district_in, new_obj_variant_in);
    END IF;
    -- check for duplicates
    IF (obj_typ_in = 2) THEN
        SET alt_obj_typ = 18;
    ELSE
        SET alt_obj_typ = obj_typ_in;
    END IF;
   
    IF (graph_hash_in IS NULL) THEN 
        CALL __DBSCHEMA__.NGUPDST(subj_hash_in, pred_hash_in, obj_hash_in, obj_typ_in, alt_obj_typ, new_obj_hash_in, set_obj_hash_rel_in, new_obj_typ_in);
    ELSE
        CALL __DBSCHEMA__.GUPDST(subj_hash_in, pred_hash_in, obj_hash_in, obj_lang_in, obj_typ_in, alt_obj_typ, graph_hash_in, new_obj_hash_in, new_obj_lang_in, new_obj_typ_in);
        
    END IF;

END UPDSTMT/

GRANT EXECUTE ON PROCEDURE __DBSCHEMA__.ENCSUBJ TO USER __DBUSER__ /
GRANT EXECUTE ON PROCEDURE __DBSCHEMA__.ENCGRAPH TO USER __DBUSER__ /
GRANT EXECUTE ON PROCEDURE __DBSCHEMA__.ENCOBJ TO USER __DBUSER__ /
GRANT EXECUTE ON PROCEDURE __DBSCHEMA__.NGCRTST TO USER __DBUSER__ /
GRANT EXECUTE ON PROCEDURE __DBSCHEMA__.GCRTST TO USER __DBUSER__ /
GRANT EXECUTE ON PROCEDURE __DBSCHEMA__.CRTST TO USER __DBUSER__ /
GRANT EXECUTE ON PROCEDURE __DBSCHEMA__.NGUPDST TO USER __DBUSER__ /
GRANT EXECUTE ON PROCEDURE __DBSCHEMA__.GUPDST TO USER __DBUSER__ /
GRANT EXECUTE ON PROCEDURE __DBSCHEMA__.UPDST TO USER __DBUSER__ /
GRANT EXECUTE ON PROCEDURE __DBSCHEMA__.DELST TO USER __DBUSER__ /
