REM Licensed Materials - Property of IBM
REM 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
REM Copyright IBM Corporation 2011, 2012. All Rights Reserved.
REM US Government Users Restricted Rights- Use, duplication or disclosure
REM restricted by GSA ADP Schedule Contract with IBM Corp.

REM Setup alias paths
set CD_LOC=%1
set IM_LOC=%3
set LP_LOC=%CD_LOC%\launchpad\content\installation\lib
set INSTALL_DIR=%4

REM Add required jars to classpath
set CLASS_PATH=%LP_LOC%\launchpad.bpm.jar;%LP_LOC%\json4j.jar;%LP_LOC%\commons-io.jar

REM Add database jdbc jars to classpath
set CLASS_PATH=%CLASS_PATH%;%LP_LOC%\db2jcc.jar;%LP_LOC%\db2jcc_license_cu.jar;%LP_LOC%\ojdbc5.jar;%LP_LOC%\ojdbc6.jar;%LP_LOC%\sqljdbc.jar;%LP_LOC%\sqljdbc4.jar

REM Add bpm.config.jar and com.ibm.ws.runtime.jar to classpath if INSTALL_DIR provided
IF NOT %INSTALL_DIR%.==. GOTO ADDBPMJAR
GOTO CONTINUE

:ADDBPMJAR
set CLASS_PATH=%CLASS_PATH%;%INSTALL_DIR%\plugins\com.ibm.bpm.config.jar;%INSTALL_DIR%\plugins\com.ibm.ws.runtime.jar

:CONTINUE
REM Locate and execute JRE
set JAVA_ARGS= -classpath %CLASS_PATH%

FOR /F "tokens=1,2 delims==" %%a IN (%IM_LOC%\configuration\config.ini) DO (
    IF /I "%%a" EQU "im.installer.jre.version" set JRE_VERSION=%%b
)

%IM_LOC%\jre_%JRE_VERSION%\jre\bin\java %JAVA_ARGS% com.ibm.launchpad.bpm.tools.JavascriptBridge %2