REM Licensed Materials - Property of IBM
REM 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
REM Copyright IBM Corporation 2011, 2012. All Rights Reserved.
REM US Government Users Restricted Rights- Use, duplication or disclosure
REM restricted by GSA ADP Schedule Contract with IBM Corp.

REM Run the given command with its options
%~1 %~2 > %3.sysout 2> %3.syserr 

REM Check to see if the command completed successfully
if %ERRORLEVEL% == 0 (
    echo {isSuccess: true} > %3.done
) else (
    echo {isSuccess: false} > %3.done
)