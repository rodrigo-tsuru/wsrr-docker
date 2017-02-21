#!/bin/sh
# Licensed Materials - Property of IBM
# 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
# Copyright IBM Corporation 2011, 2012. All Rights Reserved.
# US Government Users Restricted Rights- Use, duplication or disclosure
# restricted by GSA ADP Schedule Contract with IBM Corp.

#first query if DB2 is installed by the admin user
DB2LSPATH="/usr/local/bin/db2ls"

$DB2LSPATH -c > /dev/null 2>&1

QUERY_ROOT_RES=$?

#if it is not available query from the userhome local installation
if [ "$QUERY_ROOT_RES" != "0" ]; then
    DB2LSPATH="$HOME/sqllib/install/db2ls"
    
    $DB2LSPATH -c > /dev/null 2>&1
    
    QUERY_USER_RES=$?
fi

# any of the two queries success means success. 
# first compared root query so that it will short circuit the comparison.
if [[ ("$QUERY_ROOT_RES" == "0") || ("$QUERY_USER_RES" == "0") ]]; then
    echo "{isInstalled: true}" > $1
else
    echo "{isInstalled: false}" > $1
fi