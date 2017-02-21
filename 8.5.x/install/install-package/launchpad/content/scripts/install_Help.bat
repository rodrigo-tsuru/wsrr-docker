@ECHO OFF

REM Licensed Materials - Property of IBM

REM 5724-L01

REM Copyright IBM Corporation 2009. All Rights Reserved.

REM US Government Users Restricted Rights- Use, duplication or disclosure

REM restricted by GSA ADP Schedule Contract with IBM Corp.



SET CD_HOME=%~1

SET INST_LOCATION=%~2


mkdir %INST_LOCATION%


xcopy /S /I /Q /Y %CD_HOME%\IEHS\*.* %INST_LOCATION%

cd /D %INST_LOCATION%

call %INST_LOCATION%\help_start.bat