@rem begin_generated_IBM_copyright_prolog

@rem Licensed Materials - Property of IBM
@rem 
@rem 5724-N72 5655-WBS
@rem 
@rem Copyright IBM Corp. 2009, 2014 All Rights Reserved.
@rem 
@rem US Government Users Restricted Rights - Use, duplication or
@rem disclosure restricted by GSA ADP Schedule Contract with
@rem IBM Corp.

@rem end_generated_IBM_copyright_prolog

SET DBNAME=%1
SET DBSCHEMA=%2
SET DBUSER=%3
SET DBPASSWORD=%4
SET EXTRAPATH=%5
SET PATH=%PATH%;%EXTRAPATH%

db2 connect to %DBNAME% user %DBUSER% using %DBPASSWORD%
db2 runstats on table %DBSCHEMA%.STATEMENT with distribution and detailed indexes all
db2 runstats on table %DBSCHEMA%.GSTATEMENT with distribution and detailed indexes all
db2 runstats on table %DBSCHEMA%.SUBJECT with distribution and detailed indexes all
db2 runstats on table %DBSCHEMA%.PREDICATE with distribution and detailed indexes all
db2 runstats on table %DBSCHEMA%.OBJECT with distribution and detailed indexes all
db2 runstats on table %DBSCHEMA%.GRAPH with distribution and detailed indexes all

db2 reorg indexes all for table %DBSCHEMA%.statement
db2 reorg indexes all for table %DBSCHEMA%.gstatement
db2 reorg indexes all for table %DBSCHEMA%.subject
db2 reorg indexes all for table %DBSCHEMA%.predicate
db2 reorg indexes all for table %DBSCHEMA%.object
db2 reorg indexes all for table %DBSCHEMA%.graph

db2rbind %DBNAME% all -u %DBUSER% -p %DBPASSWORD%

db2 disconnect current

exit
