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

-- SQL server doesn't have a convenient way for us to ignore duplicate inserts
-- (duplicates can happen only in rare circumstances, so we don't want to 
-- pay the price of explicitly checking each time).  Instead, we use TRY...CATCH
-- and then use this method to throw any errors that aren't duplicate violations
CREATE PROCEDURE __DBSCHEMA__.RETHROW
AS
    IF ERROR_NUMBER() IS NULL
        RETURN ;

    DECLARE @ErrorMessage NVARCHAR(4000),
            @ErrorNumber INT,
            @ErrorSeverity INT,
            @ErrorState INT,
            @ErrorLine INT,
            @ErrorProcedure NVARCHAR(200) ;

    SELECT  @ErrorNumber = ERROR_NUMBER(), @ErrorSeverity = ERROR_SEVERITY(),
            @ErrorState = ERROR_STATE(), @ErrorLine = ERROR_LINE(),
            @ErrorProcedure = ISNULL(ERROR_PROCEDURE(), '-') ;

    IF @ErrorNumber = 547
        SET @ErrorState = 2;

    SELECT  @ErrorMessage = N'Error: %d, Level: %d, State: %d, Procedure: %s, Line: %d, ' + 'Message: ' + ERROR_MESSAGE() ;
    RAISERROR (@ErrorMessage, @ErrorSeverity, 2, @ErrorNumber, -- parameter: original error number.
               @ErrorSeverity, -- parameter: original error severity.
               @ErrorState, -- parameter: original error state.
               @ErrorProcedure, -- parameter: original error procedure name.
               @ErrorLine-- parameter: original error line number.
              ) ;

              
GO -- remove this line if running through JDBC
/
GO -- remove this line if running through JDBC


CREATE PROCEDURE __DBSCHEMA__.ENCSUBJ
    @str_in NVARCHAR(1024),
    @hash_in BIGINT
AS
    BEGIN TRY
        IF NOT EXISTS(SELECT HASH FROM __DBSCHEMA__.SUBJECT WHERE HASH = @hash_in) 
        BEGIN
            INSERT INTO __DBSCHEMA__.SUBJECT
                (HASH, URI)
            VALUES
                (@hash_in, @str_in);        
        END
    END TRY
    BEGIN CATCH
        IF ERROR_NUMBER() <> 2627 AND ERROR_NUMBER() <> 2601 
        BEGIN
            EXECUTE __DBSCHEMA__.RETHROW
        END
    END CATCH
GO -- remove this line if running through JDBC
/
GO -- remove this line if running through JDBC

CREATE PROCEDURE __DBSCHEMA__.ENCPRED
    @str_in NVARCHAR(1024),
    @hash_in BIGINT
AS
    BEGIN TRY    
        IF NOT EXISTS(SELECT HASH FROM __DBSCHEMA__.PREDICATE WHERE HASH = @hash_in)
        BEGIN
            INSERT INTO __DBSCHEMA__.PREDICATE
                (HASH, URI)
            VALUES
                (@hash_in, @str_in);        
        END
    END TRY
    BEGIN CATCH
        IF ERROR_NUMBER() <> 2627 AND ERROR_NUMBER() <> 2601 
        BEGIN
            EXECUTE __DBSCHEMA__.RETHROW
        END
    END CATCH
GO -- remove this line if running through JDBC
/
GO -- remove this line if running through JDBC

CREATE PROCEDURE __DBSCHEMA__.ENCGRAPH
    @str_in NVARCHAR(1024),
    @hash_in BIGINT
AS
    BEGIN TRY
        IF NOT EXISTS(SELECT HASH FROM __DBSCHEMA__.GRAPH WHERE HASH = @hash_in)
        BEGIN
            INSERT INTO __DBSCHEMA__.GRAPH
                (HASH, URI)
            VALUES
                (@hash_in, @str_in);        
        END
    END TRY
    BEGIN CATCH
        IF ERROR_NUMBER() <> 2627 AND ERROR_NUMBER() <> 2601 
        BEGIN
            EXECUTE __DBSCHEMA__.RETHROW
        END
    END CATCH
GO -- remove this line if running through JDBC
/
GO -- remove this line if running through JDBC

CREATE PROCEDURE __DBSCHEMA__.ENCOBJ
    @str_in  NVARCHAR(1024),
    @hash_in BIGINT,
    @lang_in NCHAR(2),
    @district_in NCHAR(2),
    @variant_in NVARCHAR(254)
AS
    BEGIN TRY
        IF NOT EXISTS (SELECT HASH FROM __DBSCHEMA__.OBJECT WHERE HASH = @hash_in)
        BEGIN
            INSERT INTO __DBSCHEMA__.OBJECT
                (HASH, STRING, LANG, DISTRICT, LVARIANT)
            VALUES
                (@hash_in, @str_in, @lang_in, @district_in, @variant_in);
        END
    END TRY
    BEGIN CATCH
        IF ERROR_NUMBER() <> 2627 AND ERROR_NUMBER() <> 2601 
        BEGIN
            EXECUTE __DBSCHEMA__.RETHROW
        END
    END CATCH
GO -- remove this line if running through JDBC
/
GO -- remove this line if running through JDBC


---------------------------------------------------------------------
---- Stored procedure for writing new statements to the store
---------------------------------------------------------------------
CREATE PROCEDURE __DBSCHEMA__.NGCRTST
    @subj_hash_in        BIGINT,
    @pred_hash_in        BIGINT,
    @obj_hash_in        BIGINT,
    @set_obj_hash_rel_in SMALLINT,
    @obj_typ_in        SMALLINT

AS
    DECLARE @obj_hash_rel BIGINT; 
   
    IF (@set_obj_hash_rel_in = 1)
    BEGIN
        SET @obj_hash_rel = @obj_hash_in;
    END
    ELSE
    BEGIN
        SET @obj_hash_rel = NULL;
    END
    BEGIN TRY
        INSERT INTO STATEMENT
            (SUBJ_HASH, PRED_HASH, OBJ_HASH, OBJ_HASH_REL, OBJ_TYP_CD)
            VALUES
                (@subj_hash_in, @pred_hash_in, @obj_hash_in, @obj_hash_rel, @obj_typ_in);
    END TRY
    BEGIN CATCH
        IF ERROR_NUMBER() <> 2627 AND ERROR_NUMBER() <> 2601 
        BEGIN
            EXECUTE __DBSCHEMA__.RETHROW
        END
    END CATCH

GO -- remove this line if running through JDBC
/
GO -- remove this line if running through JDBC

CREATE PROCEDURE __DBSCHEMA__.GCRTST
    @subj_hash_in        BIGINT,
    @pred_hash_in        BIGINT,
    @obj_hash_in        BIGINT,
    @obj_lang_in        NCHAR(2),
    @obj_typ_in        SMALLINT,
    @graph_uri_in        NVARCHAR(1024),
    @graph_hash_in        BIGINT

AS
    
    IF @graph_hash_in IS NOT NULL
    BEGIN
        EXECUTE  __DBSCHEMA__.ENCGRAPH @graph_uri_in, @graph_hash_in ; 
    END
    BEGIN TRY
        INSERT INTO GSTATEMENT
            (SUBJ_HASH, PRED_HASH, OBJ_HASH, OBJ_TYP_CD, LANG, GRAPH_HASH)
            VALUES
                (@subj_hash_in, @pred_hash_in, @obj_hash_in, @obj_typ_in, @obj_lang_in, @graph_hash_in);
    END TRY
    BEGIN CATCH
        IF ERROR_NUMBER() <> 2627 AND ERROR_NUMBER() <> 2601 
        BEGIN
            EXECUTE __DBSCHEMA__.RETHROW
        END
    END CATCH

GO -- remove this line if running through JDBC
/
GO -- remove this line if running through JDBC

CREATE PROCEDURE __DBSCHEMA__.CRTST
    @subj_uri_in         NVARCHAR(1024),
    @subj_hash_in        BIGINT,
    @pred_uri_in         NVARCHAR(1024),
    @pred_hash_in        BIGINT,
    @obj_in             NVARCHAR(1024),
    @obj_hash_in        BIGINT,
    @set_obj_hash_rel_in SMALLINT,
    @obj_lang_in        NCHAR(2),
    @obj_district_in    NCHAR(2),
    @obj_variant_in    NVARCHAR(254),
    @obj_typ_in        SMALLINT,
    @graph_uri_in        NVARCHAR(1024),
    @graph_hash_in        BIGINT

AS
    IF @subj_uri_in IS NOT NULL
    BEGIN
        EXECUTE __DBSCHEMA__.ENCSUBJ @subj_uri_in, @subj_hash_in ;
    END
   
    EXECUTE __DBSCHEMA__.ENCPRED @pred_uri_in, @pred_hash_in ;

    IF @obj_in IS NOT NULL
    BEGIN
        EXECUTE  __DBSCHEMA__.ENCOBJ @obj_in, @obj_hash_in, @obj_lang_in, @obj_district_in, @obj_variant_in ;
    END
   
    

    IF  (@graph_hash_in IS NULL)
    BEGIN
        EXECUTE __DBSCHEMA__.NGCRTST @subj_hash_in, @pred_hash_in, @obj_hash_in, @set_obj_hash_rel_in, @obj_typ_in ;
    END
    ELSE
    BEGIN
        EXECUTE __DBSCHEMA__.GCRTST @subj_hash_in, @pred_hash_in, @obj_hash_in, @obj_lang_in, @obj_typ_in, @graph_uri_in, @graph_hash_in ;
    END 
GO -- remove this line if running through JDBC
/
GO -- remove this line if running through JDBC

---------------------------------------------------------------------
---- Stored procedure for deleting statements from the store
---------------------------------------------------------------------
CREATE PROCEDURE __DBSCHEMA__.DELST 
    @subj_hash_in BIGINT,
    @pred_hash_in BIGINT,
    @graph_hash_in BIGINT,
    @obj_hash_in BIGINT,
    @obj_typ_in SMALLINT,
    @lang_in NCHAR(2)
AS
    DECLARE @alt_obj_typ SMALLINT;
    IF (@obj_typ_in = 2)
    BEGIN
        SET @alt_obj_typ = 18;
    END
    ELSE
    BEGIN
        SET @alt_obj_typ = @obj_typ_in;
    END
    -- Delete the statements when applicable
    
    IF  (@graph_hash_in IS NULL)
    BEGIN
        DELETE FROM __DBSCHEMA__.STATEMENT
            WHERE 
                (@subj_hash_in IS NULL OR SUBJ_HASH   = @subj_hash_in)  AND
                (@pred_hash_in IS NULL OR PRED_HASH    = @pred_hash_in) AND
                (@obj_hash_in IS NULL OR OBJ_HASH      = @obj_hash_in ) AND
                (@obj_typ_in IS NULL OR OBJ_TYP_CD     = @obj_typ_in  OR OBJ_TYP_CD=@alt_obj_typ);
    END
    ELSE
    BEGIN
        DELETE FROM __DBSCHEMA__.GSTATEMENT
            WHERE 
                (@subj_hash_in IS NULL OR SUBJ_HASH   = @subj_hash_in)  AND
                (@pred_hash_in IS NULL OR PRED_HASH    = @pred_hash_in) AND
                (@obj_hash_in IS NULL OR OBJ_HASH      = @obj_hash_in ) AND
                (@obj_typ_in IS NULL OR OBJ_TYP_CD     = @obj_typ_in  OR OBJ_TYP_CD=@alt_obj_typ)   AND
                (@lang_in IS NULL OR LANG     = @lang_in) AND
                (@graph_hash_in IS NULL OR GRAPH_HASH  = @graph_hash_in);
    END
    
GO -- remove this line if running through JDBC
/
GO -- remove this line if running through JDBC

--------------------------------------------------------------------
---- Stored procedure for updating statements in the store
---------------------------------------------------------------------
CREATE PROCEDURE __DBSCHEMA__.NGUPDST 
    @subj_hash_in        BIGINT,
    @pred_hash_in        BIGINT,
    @obj_hash_in        BIGINT,
    @obj_typ_in        SMALLINT,
    @alt_obj_typ_in        SMALLINT,
    @new_obj_hash_in        BIGINT,
    @set_obj_hash_rel_in    SMALLINT,
    @new_obj_typ_in        SMALLINT
AS               
    DECLARE @new_obj_hash_rel BIGINT;

    IF (@set_obj_hash_rel_in = 1)
    BEGIN
        SET @new_obj_hash_rel = @new_obj_hash_in;
    END
    ELSE
    BEGIN
        SET @new_obj_hash_rel = NULL;
    END
    BEGIN TRY
        UPDATE STATEMENT SET OBJ_HASH=@new_obj_hash_in, OBJ_HASH_REL=@new_obj_hash_rel, OBJ_TYP_CD=@new_obj_typ_in   
            WHERE  
                (SUBJ_HASH = @subj_hash_in) and (PRED_HASH = @pred_hash_in) and ( OBJ_HASH = @obj_hash_in) and ((OBJ_TYP_CD=@obj_typ_in) or (OBJ_TYP_CD=@alt_obj_typ_in));
        END TRY
    BEGIN CATCH
        IF ERROR_NUMBER() <> 2627 AND ERROR_NUMBER() <> 2601 
        BEGIN
            EXECUTE __DBSCHEMA__.RETHROW
        END
        ELSE
        BEGIN
            DELETE FROM STATEMENT WHERE (SUBJ_HASH = @subj_hash_in) and (PRED_HASH = @pred_hash_in) and ( OBJ_HASH = @obj_hash_in) and ((OBJ_TYP_CD=@obj_typ_in) or (OBJ_TYP_CD=@alt_obj_typ_in));
        END 
    END CATCH
 
GO -- remove this line if running through JDBC
/
GO -- remove this line if running through JDBC
    
CREATE PROCEDURE __DBSCHEMA__.GUPDST 
    @subj_hash_in        BIGINT,
    @pred_hash_in        BIGINT,
    @obj_hash_in        BIGINT,
    @obj_lang_in        NCHAR(2),
    @obj_typ_in        SMALLINT,
    @alt_obj_typ_in        SMALLINT,
    @graph_hash_in        BIGINT,
    @new_obj_hash_in        BIGINT,
    @new_obj_lang_in        NCHAR(2),
    @new_obj_typ_in        SMALLINT
AS               
    BEGIN TRY
        IF (@obj_lang_in IS NOT NULL) 
        BEGIN 
            UPDATE GSTATEMENT SET OBJ_HASH=@new_obj_hash_in, OBJ_TYP_CD=@new_obj_typ_in, LANG=@new_obj_lang_in   
                WHERE  
                    (SUBJ_HASH = @subj_hash_in) and (PRED_HASH = @pred_hash_in) and ( OBJ_HASH = @obj_hash_in) and ((OBJ_TYP_CD=@obj_typ_in) or (OBJ_TYP_CD=@alt_obj_typ_in)) and (GRAPH_HASH=@graph_hash_in) and (LANG=@obj_lang_in);
        END                                       
        ELSE
        BEGIN
            UPDATE GSTATEMENT SET OBJ_HASH=@new_obj_hash_in, OBJ_TYP_CD=@new_obj_typ_in, LANG=@new_obj_lang_in   
                WHERE  
                    (SUBJ_HASH = @subj_hash_in) and (PRED_HASH = @pred_hash_in) and ( OBJ_HASH = @obj_hash_in) and ((OBJ_TYP_CD=@obj_typ_in) or (OBJ_TYP_CD=@alt_obj_typ_in)) and (GRAPH_HASH=@graph_hash_in) and (LANG IS NULL);
        END
        END TRY
    BEGIN CATCH
        IF ERROR_NUMBER() <> 2627 AND ERROR_NUMBER() <> 2601 
        BEGIN
            EXECUTE __DBSCHEMA__.RETHROW
        END
        ELSE
        BEGIN
            IF (@obj_lang_in IS NOT NULL) 
                DELETE FROM GSTATEMENT WHERE (SUBJ_HASH = @subj_hash_in) and (PRED_HASH = @pred_hash_in) and ( OBJ_HASH = @obj_hash_in) and ((OBJ_TYP_CD=@obj_typ_in) or (OBJ_TYP_CD=@alt_obj_typ_in)) and (GRAPH_HASH=@graph_hash_in) and (LANG=@obj_lang_in);
            ELSE
                DELETE FROM GSTATEMENT WHERE (SUBJ_HASH = @subj_hash_in) and (PRED_HASH = @pred_hash_in) and ( OBJ_HASH = @obj_hash_in) and ((OBJ_TYP_CD=@obj_typ_in) or (OBJ_TYP_CD=@alt_obj_typ_in)) and (GRAPH_HASH=@graph_hash_in) and (LANG IS NULL);
      
        END 
    END CATCH
    
GO -- remove this line if running through JDBC
/
GO -- remove this line if running through JDBC
    
CREATE PROCEDURE __DBSCHEMA__.UPDST 
    @subj_hash_in        BIGINT,
    @pred_hash_in        BIGINT,
    @obj_hash_in        BIGINT,
    @obj_lang_in        NCHAR(2),
    @obj_typ_in        SMALLINT,
    @graph_hash_in        BIGINT,
    @new_obj_in             NVARCHAR(1024),
    @new_obj_hash_in        BIGINT,
    @set_obj_hash_rel_in    SMALLINT,
    @new_obj_lang_in        NCHAR(2),
    @new_obj_district_in    NCHAR(2),
    @new_obj_variant_in    NVARCHAR(254),
    @new_obj_typ_in        SMALLINT
AS               
    DECLARE @alt_obj_typ SMALLINT;
    
    IF @new_obj_in IS NOT NULL 
    BEGIN
        EXECUTE __DBSCHEMA__.ENCOBJ @new_obj_in, @new_obj_hash_in, @new_obj_lang_in, @new_obj_district_in, @new_obj_variant_in ;
    END
    
    IF (@obj_typ_in = 2)
    BEGIN
        SET @alt_obj_typ = 18;
    END
    ELSE
    BEGIN
        SET @alt_obj_typ = @obj_typ_in;
    END
    
    IF (@graph_hash_in IS NULL) 
    BEGIN 
        EXECUTE __DBSCHEMA__.NGUPDST @subj_hash_in, @pred_hash_in, @obj_hash_in, @obj_typ_in, @alt_obj_typ, @new_obj_hash_in, @set_obj_hash_rel_in, @new_obj_typ_in
    END                            
    ELSE
    BEGIN
        EXECUTE __DBSCHEMA__.GUPDST @subj_hash_in, @pred_hash_in, @obj_hash_in, @obj_lang_in, @obj_typ_in, @alt_obj_typ, @graph_hash_in, @new_obj_hash_in, @new_obj_lang_in, @new_obj_typ_in
    END
                   
    
GO -- remove this line if running through JDBC
/
GO -- remove this line if running through JDBC
