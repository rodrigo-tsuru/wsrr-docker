#!/bin/sh
# Licensed Materials - Property of IBM
# 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
# Copyright IBM Corporation 2011, 2012. All Rights Reserved.
# US Government Users Restricted Rights- Use, duplication or disclosure
# restricted by GSA ADP Schedule Contract with IBM Corp.

CD_LOC=$1
IM_LOC=$3
LP_LOC=$CD_LOC/launchpad/content/installation/lib
INSTALL_DIR=$4

# Add required jars to classpath
CLASS_PATH="$LP_LOC/launchpad.bpm.jar:$LP_LOC/json4j.jar:$LP_LOC/commons-io.jar"

# Add database jdbc jars to classpath
CLASS_PATH="$CLASS_PATH:$LP_LOC/db2jcc.jar:$LP_LOC/db2jcc_license_cu.jar:$LP_LOC/ojdbc5.jar:$LP_LOC/ojdbc6.jar:$LP_LOC/sqljdbc.jar:$LP_LOC/sqljdbc4.jar"

# Add bpm.config.jar and com.ibm.ws.runtime.jar to classpath if INSTALL_DIR is set
if [ -n "$INSTALL_DIR" ]; then
    CLASS_PATH="$CLASS_PATH:$INSTALL_DIR/plugins/com.ibm.bpm.config.jar:$INSTALL_DIR/plugins/com.ibm.ws.runtime.jar"
fi

JAVA_ARGS="-classpath $CLASS_PATH"

JRE_VERSION=`sed '/^\#/d' $IM_LOC/configuration/config.ini | grep 'im.installer.jre.version' | tail -1 | cut -d "=" -f2- | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'`

$IM_LOC/jre_$JRE_VERSION/jre/bin/java $JAVA_ARGS com.ibm.launchpad.bpm.tools.JavascriptBridge $2 > /dev/null 2>&1
