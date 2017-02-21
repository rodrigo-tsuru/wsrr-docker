@ECHO OFF
REM Licensed Materials - Property of IBM
REM 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
REM Copyright IBM Corporation 2013. All Rights Reserved.
REM US Government Users Restricted Rights- Use, duplication or disclosure
REM restricted by GSA ADP Schedule Contract with IBM Corp.

REM DB2 admin group name
set GROUPNAME=%1

REM initialize existing member as false
set EXISTING_MEMBER=false

REM Current username
set CURRENT_USERNAME=%USERNAME%

REM find out if the user is a member of the group
for /f "Tokens=*" %%a in ('net localgroup %GROUPNAME%^|find /i "%CURRENT_USERNAME%"') do set EXISTING_MEMBER=true

REM log the results
echo {userName: "%CURRENT_USERNAME%", groupName: "%GROUPNAME%", isExistingMember: %EXISTING_MEMBER%}>%2