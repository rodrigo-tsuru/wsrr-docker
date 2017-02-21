#!/bin/sh
# Licensed Materials - Property of IBM
# 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
# Copyright IBM Corporation 2011, 2012. All Rights Reserved.
# US Government Users Restricted Rights- Use, duplication or disclosure
# restricted by GSA ADP Schedule Contract with IBM Corp.

USERID=`id |cut -d '=' -f2|cut -d '(' -f1 2> /dev/null`

if [ "$USERID" = "0" ]; then
	echo "{isAdmin: true}" > $2	
else
	echo "{isAdmin: false}" > $2
fi
