REM Licensed Materials - Property of IBM
REM 5724-L01 5724-I82 5724-M24 5724-M23 5724-V37 5655-W01
REM Copyright IBM Corporation 2009, 2011. All Rights Reserved.
REM US Government Users Restricted Rights- Use, duplication or disclosure
REM restricted by GSA ADP Schedule Contract with IBM Corp.

set CD_LOC=%1

set WAS_HOME=%2

cd %CD_LOC%\WAS

%CD_LOC%\JDK\jre.pak\repository\package.java.jre\java\jre\bin\java -jar %CD_LOC%\WAS\setup.jar -silent -OPT silentInstallLicenseAcceptance=true -OPT allowNonRootSilentInstall=true -OPT disableOSPrereqChecking=true -OPT disableNonBlockingPrereqChecking=true -OPT installType=installNew -OPT profileType=none -OPT feature=samplesSelected -OPT feature=languagepack.console.all -OPT feature=languagepack.server.all -OPT installLocation=%WAS_HOME%
