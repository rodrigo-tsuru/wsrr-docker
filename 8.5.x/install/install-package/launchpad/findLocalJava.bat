REM Licensed Materials - Property of IBM
REM 5648-F10 (C) Copyright International Business Machines Corp. 2010
REM All Rights Reserved
REM US Government Users Restricted Rights- Use, duplication or disclosure
REM restricted by GSA ADP Schedule Contract with IBM Corp.

set localJavaTmpfile=%TEMP%\clp_java_version.txt
set localResultFile=%TEMP%\clp_java_version_test.txt
set clp_java15=0
set clp_java16=0
set clp_java17=0
set clp_java18=0
set clp_java19=0
set clp_java20=0

set tempPath=%PATH%;C:\Progra~1\IBM\Java60\sdk\jre\bin\;C:\Progra~1\Java\jre6\bin\;C:\Progra~1\IBM\Java50\sdk\jre\bin\;C:\Progra~1\Java\jre5\bin\

for %%i in (java.exe) do set localJRE=%%~$tempPath:i


"%localJRE%" -fullversion > %localJavaTmpfile% 2>&1

	set length=0  
	findstr "2\.0" %localJavaTmpfile% > %localResultFile% 2>&1
	for /F "usebackq" %%a in ('%localResultFile%') do @set /a length=%%~za 
	if %length% GTR 0 ( set clp_java20=1)


	set length=0  
	findstr "1\.9" %localJavaTmpfile% > %localResultFile% 2>&1
	for  /F "usebackq" %%a in ('%localResultFile%') do @set /a length=%%~za 
	if %length% GTR 0 ( set clp_java19=1)

	set length=0  
	findstr "1\.8" %localJavaTmpfile% > %localResultFile% 2>&1
	for  /F "usebackq" %%a in ('%localResultFile%') do @set /a length=%%~za 
	if %length% GTR 0 ( set clp_java18=1)


	set length=0  
	findstr "1\.7" %localJavaTmpfile% > %localResultFile% 2>&1
	for  /F "usebackq" %%a in ('%localResultFile%') do @set /a length=%%~za 
	if %length% GTR 0 ( set clp_java17=1)

	set length=0  
	findstr "1\.6" %localJavaTmpfile% > %localResultFile% 2>&1
	for  /F "usebackq" %%a in ('%localResultFile%') do @set /a length=%%~za 
	if %length% GTR 0 ( set clp_java16=1)

	set length=0  
	findstr "1\.5" %localJavaTmpfile% > %localResultFile% 2>&1
	for  /F "usebackq" %%a in (%localResultFile%) do @set /a length=%%~za 
	if %length% GTR 0 ( set clp_java15=1)

if %clp_java15% EQU 1 (
	if "%LAUNCHPAD_JAVA_15%" == "true" set LaunchPadLocalJRE="%localJRE%"
)
 
if %clp_java16% EQU 1 (
	if "%LAUNCHPAD_JAVA_16%" == "true" set LaunchPadLocalJRE="%localJRE%"
)
if %clp_java17% EQU 1 (
	if "%LAUNCHPAD_JAVA_17%" == "true" set LaunchPadLocalJRE="%localJRE%"
)

if %clp_java18% EQU 1 (
	if "%LAUNCHPAD_JAVA_18%" == "true" set LaunchPadLocalJRE="%localJRE%"
)

if %clp_java19% EQU 1 (
	if "%LAUNCHPAD_JAVA_19%" == "true" set LaunchPadLocalJRE="%localJRE%"
)

if %clp_java20% EQU 1 (
	if "%LAUNCHPAD_JAVA_20%" == "true" set LaunchPadLocalJRE="%localJRE%"
)


del %localJavaTmpFile%
del %localResultFile%

echo LaunchPadLocalJRE = %LaunchPadLocalJRE%
