@ECHO OFF
REM Licensed Materials - Property of IBM
REM 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
REM Copyright IBM Corporation 2013. All Rights Reserved.
REM US Government Users Restricted Rights- Use, duplication or disclosure
REM restricted by GSA ADP Schedule Contract with IBM Corp.set


REM Group Name
GROUPNAME=%1

REM Current username
CURRENT_USERNAME=%USERNAME%

REM add the user to the localgroup
net localgroup %CURRENT_USERNAME% /add