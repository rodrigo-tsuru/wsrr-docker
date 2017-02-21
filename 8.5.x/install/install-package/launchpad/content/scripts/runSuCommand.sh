#!/bin/sh
# Licensed Materials - Property of IBM
# 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
# Copyright IBM Corporation 2011, 2012. All Rights Reserved.
# US Government Users Restricted Rights- Use, duplication or disclosure
# restricted by GSA ADP Schedule Contract with IBM Corp.

# Run the given command with its options
su - $1 -c "$2" > $3.sysout 2> $3.syserr 

# Check to see if the command completed successfully
if [ "$?" != "0" ]; then
    echo "{isSuccess: false}" > $3.done
else
    echo "{isSuccess: true}" > $3.done
fi