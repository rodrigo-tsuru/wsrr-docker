#!/bin/bash

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

export DBNAME=$1
export DBSCHEMA=$2
export DBUSER=$3
export DBPASSWORD=$4
export EXTRAPATH=$5
export PATH=$PATH:$EXTRAPATH

db2 connect to $DBNAME user $DBUSER using $DBPASSWORD
db2 runstats on table $DBSCHEMA.STATEMENT with distribution and detailed indexes all
db2 runstats on table $DBSCHEMA.GSTATEMENT with distribution and detailed indexes all
db2 runstats on table $DBSCHEMA.SUBJECT with distribution and detailed indexes all
db2 runstats on table $DBSCHEMA.PREDICATE with distribution and detailed indexes all
db2 runstats on table $DBSCHEMA.OBJECT with distribution and detailed indexes all
db2 runstats on table $DBSCHEMA.GRAPH with distribution and detailed indexes all

db2 reorg indexes all for table $DBSCHEMA.gstatement
db2 reorg indexes all for table $DBSCHEMA.statement
db2 reorg indexes all for table $DBSCHEMA.subject
db2 reorg indexes all for table $DBSCHEMA.predicate
db2 reorg indexes all for table $DBSCHEMA.object
db2 reorg indexes all for table $DBSCHEMA.graph

db2rbind $DBNAME all -u $DBUSER -p $DBPASSWORD

db2 disconnect current
