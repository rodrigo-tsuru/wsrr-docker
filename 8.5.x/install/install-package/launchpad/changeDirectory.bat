@ECHO off
REM Licensed Materials - Property of IBM
REM 5648-F10 (C) Copyright International Business Machines Corp. 2005 
REM All Rights Reserved
REM US Government Users Restricted Rights- Use, duplication or disclosure
REM restricted by GSA ADP Schedule Contract with IBM Corp.


@echo off
set NEW_DIR=%1
set LAUNCHPAD_SHIFTED_ARGS=
shift
:slurp
if "x%~1"=="x" goto execute
set LAUNCHPAD_SHIFTED_ARGS=%LAUNCHPAD_SHIFTED_ARGS% %1
shift
goto :slurp
:execute
pushd %NEW_DIR%
start /wait "" %LAUNCHPAD_SHIFTED_ARGS%
exit %errorlevel%