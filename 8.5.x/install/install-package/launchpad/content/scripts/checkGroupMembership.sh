#!/bin/sh
# Licensed Materials - Property of IBM
# 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
# Copyright IBM Corporation 2013. All Rights Reserved.
# US Government Users Restricted Rights- Use, duplication or disclosure
# restricted by GSA ADP Schedule Contract with IBM Corp.

#Db2 instance username
DB2INST_USERNAME=$1

#Db2 instance and group name 
INSTADM_GROUPNAME=`id $DB2INST_USERNAME | sed 's/.*gid=[0-9]*(\([a-zA-Z0-9]*\).*/\1/'`

#current username
CURRENT_USERNAME=`whoami`

#Is already a group member of Db2 instance adm group
EXISTING_MEMBER=`groups $CURRENT_USERNAME | grep -Eo $INSTADM_GROUPNAME`

#variable is set if it the match is found
if [ $EXISTING_MEMBER ]; then
	echo "{userName: \"$CURRENT_USERNAME\", groupName: \"$INSTADM_GROUPNAME\", isExistingMember: true}" > $2	
else
	echo "{userName: \"$CURRENT_USERNAME\", groupName: \"$INSTADM_GROUPNAME\", isExistingMember: false}" > $2
fi
