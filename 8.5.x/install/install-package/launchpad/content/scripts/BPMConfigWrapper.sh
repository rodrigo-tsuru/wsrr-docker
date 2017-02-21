#!/bin/sh
# Licensed Materials - Property of IBM
# 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
# Copyright IBM Corporation 2013. All Rights Reserved.
# US Government Users Restricted Rights- Use, duplication or disclosure
# restricted by GSA ADP Schedule Contract with IBM Corp.


# BPM installation directory
INSTALL_DIR=$1

# DB2 instance username. On unix system embedded DB2 gets installed in DB2 instance user home directory
DB2INST_USER=$2

# Create option
CREATE_OPT=$3

# DE option
DE_OPT=$4

# config properties file location
PROPERTIES_FILE=$5

# update path variable so that db2 command line environment is in path if embedded DB2 scenario.
if [ -f /home/$DB2INST_USER/sqllib/db2profile ]; then
  . /home/$DB2INST_USER/sqllib/db2profile
fi    

# call BPMConfig for configuration
$INSTALL_DIR/bin/BPMConfig.sh $CREATE_OPT $DE_OPT $PROPERTIES_FILE