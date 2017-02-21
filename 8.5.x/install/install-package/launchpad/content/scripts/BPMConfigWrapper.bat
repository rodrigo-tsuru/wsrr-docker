REM Licensed Materials - Property of IBM
REM 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
REM Copyright IBM Corporation 2013. All Rights Reserved.
REM US Government Users Restricted Rights- Use, duplication or disclosure
REM restricted by GSA ADP Schedule Contract with IBM Corp.

REM start for local env setup

setlocal

REM BPM installation directory
set INSTALL_DIR=%1

REM Create option
set CREATE_OPT=%3

REM DE option
set DE_OPT=%4

REM config properties file location
set PROPERTIES_FILE=%5

REM embedded DB2 default location. Does not harm anything even if it is an existing DB scenario.
set DB2_HOME=%INSTALL_DIR%\db2

REM update path variable to that db2cmd is in path if embedded DB2 scenario.
set PATH=%PATH%;%DB2_HOME%\BIN;%DB2_HOME%\FUNCTION;%DB2_HOME%\SAMPLES\REPL

REM call BPMConfig for configuration
call %INSTALL_DIR%\bin\BPMConfig.bat %CREATE_OPT% %DE_OPT% %PROPERTIES_FILE%

endlocal