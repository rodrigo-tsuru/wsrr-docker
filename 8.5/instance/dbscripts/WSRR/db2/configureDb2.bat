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

db2set DB2_SKIPINSERTED=
db2set DB2_SKIPDELETED=

db2set DB2_CREATE_DB_ON_PATH=YES
db2set DB2_INLIST_TO_NLJN=YES
db2stop
db2start
