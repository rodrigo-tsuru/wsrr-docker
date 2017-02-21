#!/bin/sh
# Licensed Materials - Property of IBM
# 5724-L01
# Copyright IBM Corporation 2009. All Rights Reserved.
# US Government Users Restricted Rights- Use, duplication or disclosure
# restricted by GSA ADP Schedule Contract with IBM Corp.

CD_HOME=$1
INST_LOCATION=$2

mkdir $INST_LOCATION
cp -r $CD_HOME/IEHS/* $INST_LOCATION

cd $INST_LOCATION
chmod -R 755 $INST_LOCATION/*

./help_start.sh