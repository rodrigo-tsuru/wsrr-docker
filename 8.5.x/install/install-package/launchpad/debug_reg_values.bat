@ECHO off
REM Licensed Materials - Property of IBM
REM 5648-F10 (C) Copyright International Business Machines Corp. 2005 
REM All Rights Reserved
REM US Government Users Restricted Rights- Use, duplication or disclosure
REM restricted by GSA ADP Schedule Contract with IBM Corp.


@echo off
@REM -------------------------------------------------------------------------------
@REM This bat file is created help debug launchpad.bat 
@REM -------------------------------------------------------------------------------
@REM -------------------------------------------------------------------------------
@cls
@echo DEBUG Common Launchpad - Expected Values for Windows 2008 R2 Enterprise
@date /t
@time /t
@echo -------------------------------------------------------------------------------
@	echo calling 'ver' - Expecting something similar to 
@   echo Microsoft Windows [Version 6.1.7600]
@echo.
ver


set tempPath=%PATH%

for %%i in (reg.exe) do set myReg=%%~$tempPath:i

echo REG in path is %myReg%

set regCmd=%myReg%


if exist c:\windows\system32\reg.exe set regCmd=c:\windows\system32\reg 

echo reg used is %regCmd%

	
@echo -------------------------------------------------------------------------------
rem CALL "%~dp0readRegistry.bat" "HKEY_LOCAL_MACHINE\System\CurrentControlSet\Control\Session Manager\Environment" PROCESSOR_ARCHITECTURE arch LaunchPadArch > nul
@ echo calling registry check for Processor Architecture
@echo expecting something similar to  
@echo     PROCESSOR_ARCHITECTURE    REG_SZ    AMD64
@echo.
%regCmd% QUERY "HKEY_LOCAL_MACHINE\System\CurrentControlSet\Control\Session Manager\Environment" /v PROCESSOR_ARCHITECTURE
@echo.
REM @echo -------------------------------------------------------------------------------
rem CALL "%~dp0%readRegistry.bat" "HKEY_LOCAL_MACHINE\System\CurrentControlSet\Control\Nls\Language" Default lang LaunchPadLocaleID > nul
REM @echo calling registry check for language/locale
REM @echo expecting something similar to
REM @echo.
REM reg QUERY "HKEY_LOCAL_MACHINE\System\CurrentControlSet\Control\Nls\Language"  
REM @echo.
@echo -------------------------------------------------------------------------------
rem CALL "%LaunchPadBatchPath%\readRegistryVista.bat" "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion" ProductName subOs LaunchPadOSCheck
@echo calling registry check for current version
@echo expecting something similar to  
@echo     ProductName    REG_SZ    Windows Server 2008 R2 Enterprise
@echo.
%regCmd% QUERY "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion"  /v ProductName 
@echo.
@echo -------------------------------------------------------------------------------
rem CALL "%LaunchPadBatchPath%\readRegistry.bat" "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" EnableLUA uac LaunchPadUACValue > nul
@echo calling registry check for EnableLUA
@echo expecting something similar to  
@echo     EnableLUA    REG_DWORD    0x1
@echo.
%regCmd% QUERY "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System"  /v EnableLUA
@echo.







