#!/bin/sh

# Licensed Materials - Property of IBM
# 5648-F10 (C) Copyright International Business Machines Corp. 2005, 2010
# All Rights Reserved
# US Government Users Restricted Rights - Use, duplication or disclosure
# restricted by GSA ADP Schedule Contract with IBM Corp.


LAUNCHPAD_SHIFTED_ARGS=
LAUNCHPAD_SKIPPED_ARG_1=
export LAUNCHPAD_SHIFTED_ARGS
export LAUNCHPAD_SKIPPED_ARG_1

for arg in $*; do
	if [ "$LAUNCHPAD_SKIPPED_ARG_1" = "" ]; then
		LAUNCHPAD_SKIPPED_ARG_1=true; export LAUNCHPAD_SKIPPED_ARG_1
	else
		LAUNCHPAD_SHIFTED_ARGS="$LAUNCHPAD_SHIFTED_ARGS $arg"; export LAUNCHPAD_SHIFTED_ARGS
	fi
done

cd $1
$LAUNCHPAD_SHIFTED_ARGS
