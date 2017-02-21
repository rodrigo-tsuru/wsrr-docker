#!/bin/sh

# begin_generated_IBM_copyright_prolog

# Licensed Materials - Property of IBM
# 
# 5724-N72 5655-WBS
# 
# Copyright IBM Corp. 2009, 2014 All Rights Reserved.
# 
# US Government Users Restricted Rights - Use, duplication or
# disclosure restricted by GSA ADP Schedule Contract with
# IBM Corp.

# end_generated_IBM_copyright_prolog

db2set DB2_SKIPINSERTED=
db2set DB2_SKIPDELETED=

db2set DB2_INLIST_TO_NLJN=YES
db2stop
db2start
