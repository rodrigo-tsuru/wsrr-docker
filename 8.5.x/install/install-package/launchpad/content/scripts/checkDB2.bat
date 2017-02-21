@ECHO OFF
REM Licensed Materials - Property of IBM
REM 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
REM Copyright IBM Corporation 2011, 2012. All Rights Reserved.
REM US Government Users Restricted Rights- Use, duplication or disclosure
REM restricted by GSA ADP Schedule Contract with IBM Corp.

db2licm -l

if %ERRORLEVEL% == 0 (
    echo {isInstalled: true} > %1
) else (
    echo {isInstalled: false} > %1
)