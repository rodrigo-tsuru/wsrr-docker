@ECHO off
REM Licensed Materials - Property of IBM
REM 5648-F10 (C) Copyright International Business Machines Corp. 2005 
REM All Rights Reserved
REM US Government Users Restricted Rights- Use, duplication or disclosure
REM restricted by GSA ADP Schedule Contract with IBM Corp.


@echo off
SETLOCAL enabledelayedexpansion
SET LAUNCHPAD_SHIFTED_ARGS=
SET LAUNCHPAD_SKIPPED_ARG_1=
FOR %%A IN (%*) DO (
	if {"!LAUNCHPAD_SKIPPED_ARG_1!"} == {""} (
		set LAUNCHPAD_SKIPPED_ARG_1=true
	) else (
		set LAUNCHPAD_SHIFTED_ARGS=!LAUNCHPAD_SHIFTED_ARGS! %%A
	)
)

start /wait "" !LAUNCHPAD_SHIFTED_ARGS!
set LAUNCHPAD_EXEC_RETURN_CODE=%errorlevel%
echo %LAUNCHPAD_EXEC_RETURN_CODE% >%1
exit %LAUNCHPAD_EXEC_RETURN_CODE%