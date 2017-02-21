#!/bin/sh
# Licensed Materials - Property of IBM
# 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
# Copyright IBM Corporation 2011, 2012. All Rights Reserved.
# US Government Users Restricted Rights- Use, duplication or disclosure
# restricted by GSA ADP Schedule Contract with IBM Corp.

CD_LOC=$2
LP_LOC=$CD_LOC/launchpad/content/installation/lib
IM_LOC=$3

JRE_VERSION=`sed '/^\#/d' $IM_LOC/configuration/config.ini | grep 'im.installer.jre.version' | tail -1 | cut -d "=" -f2- | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'`

$IM_LOC/jre_$JRE_VERSION/jre/bin/java -jar $LP_LOC/com.ibm.bpm.gtklib.check.jar > $1
