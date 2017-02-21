#!/bin/sh
# Licensed Materials - Property of IBM
# 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
# Copyright IBM Corporation 2013. All Rights Reserved.
# US Government Users Restricted Rights- Use, duplication or disclosure
# restricted by GSA ADP Schedule Contract with IBM Corp.

# Group Name
GROUPNAME=$1

# Current username
CURRENT_USERNAME=`whoami`

# Try RHEL method to add the user to the group
usermod -a -G $GROUPNAME $CURRENT_USERNAME > /dev/null 2>&1

# check if the command run successfully, otherwise try another method
if [ $? -gt 0 ]; then
  usermod -A $GROUPNAME $CURRENT_USERNAME > /dev/null 2>&1
fi