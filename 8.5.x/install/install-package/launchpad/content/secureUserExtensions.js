<script>
// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS 
// Copyright IBM Corporation 2011, 2012. All Rights Reserved.
// US Government Users Restricted Rights - Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.


/* Code to determine if IM is installed and its install location, adapted from WAS 80 launchpad */

/*
 * If IM is installed, this method returns
 * {launcher: <launcher exe path>, version: <version>, type: <admin|nonadmin>}
 * otherwise returns null.
 */
function secureGetInstallManagerProperties(securityCheck) {

	if (top.OSTYPE == "windows") {
		return getWindowsInstallManagerProperties(securityCheck);
	} else if (top.OSTYPE == "unix") {
		return getUnixInstallManagerProperties(securityCheck);
	}

}

/*
 * Gets information about the install manager for Windows.
 * It first checks for the non-admin key: HKCU\\SOFTWARE\\IBM\\Installation Manager
 * Then it checks the admin key: HKLM\\SOFTWARE\\IBM\\Installation Manager.
 * If either of those exist, it dumps the content to a temp file and parses it.
 * Afterwards it deletes the temp file.
 */
function getWindowsInstallManagerProperties(securityCheck) {
	if (!top.isSecure(userSecurityCheck)) { //if the security check fails, bail out 
		return null; 
	}
	
	var tmpDir = getEnv("TEMP");
	var tmpFile = tmpDir + "\\lpwas_" + new Date().getTime() + ".txt";
	top.logTrace("Using temp file " + tmpFile);
	
	runProgram(null, command('queryRegNonAdmin', tmpFile), FOREGROUND, HIDDEN );
	var foundIM = false;
	var type = null;	//whether admin or nonadmin
	if (top.fileExists(tmpFile)) {
		top.logTrace("Using non-admin registry");
		foundIM = true;
		type = 'nonadmin';
	} else {
		runProgram(null, command('queryRegAdmin', tmpFile), FOREGROUND, HIDDEN );
		if (top.fileExists(tmpFile)) {
			top.logTrace("Using admin registry");
			foundIM = true;
			type = 'admin';
		} else {
			//try 64-bit locations
			runProgram(null, command('queryRegNonAdmin64', tmpFile), FOREGROUND, HIDDEN );
			if (top.fileExists(tmpFile)) {
				top.logTrace("Using non-admin registry");
				foundIM = true;
				type = 'nonadmin';
			} else {
				runProgram(null, command('queryRegAdmin64', tmpFile), FOREGROUND, HIDDEN );
				if (top.fileExists(tmpFile)) {
					top.logTrace("Using admin registry");
					foundIM = true;
					type = 'admin';
				} else {
					//no IM found - return null
				}
			}
		}
	}
	
	if (foundIM) {
		var txt = top.readTextFile(tmpFile, "UTF-16LE");
		top.logTrace("reg value:  " + txt);
		
		var launcher =  parsePropertyWin("launcher", txt);
		top.logTrace("launcher:  " + launcher);
		
		var version = parsePropertyWin("version", txt);
		top.logTrace("version:  " + version);
		
		var location = parsePropertyWin("location", txt);
		top.logTrace("location:  " + location);
		
		runProgram(null, command('delFile', tmpFile) , BACKGROUND, HIDDEN);
		if (launcher == null || version == null) {
			return null;
		}
		return {'launcher': launcher, 'version': version, 'type': type, 'location': location};
	} else {
		return null;
	}
}

/*
 * Gets information about the install manager for Unix.
 * It first checks for the non-admin config: {user home Directory}/etc/.ibm/registry/InstallationManger.dat
 * Then it checks the admin config: /etc/.ibm/registry/InstallationManger.dat
 * If either of those exist, it reads the IM launcher and version from it.
 */
function getUnixInstallManagerProperties(securityCheck) {
	if (!top.isSecure(userSecurityCheck)) { //if the security check fails, bail out 
		return null; 
	}
	var homeDir = getEnv("HOME");
	var useAltMethod = (homeDir == '/');	//case where home dir is the root dir and we can't tell the locations apart
	top.logTrace("home dir is:  " + homeDir);
	var userFile = homeDir + "/etc/.ibm/registry/InstallationManager.dat";
	var adminFile = "/etc/.ibm/registry/InstallationManager.dat";
	var file = null;
	var type = null;	//whether admin or nonadmin
	if (!useAltMethod) {
		if (top.fileExists(userFile)) {
			top.logTrace("Using non-admin registry");
			file = userFile;
			type = 'nonadmin';
		} else {
			if (top.fileExists(adminFile)) {
				top.logTrace("Using admin registry");
				file = adminFile;
				type = 'admin';
			} else {
				//no IM found - return null
				return null;
			}
		}
	} else { //use alt method
		
		if (top.fileExists(userFile)) {
			//we have to find the ini file
			file = userFile;
			var txt = top.readTextFile(file, "UTF-8");
			var location = parsePropertyUnix("location", txt);
			top.logTrace("found IM location:  " + location);
			if (location) {
				var iniFile = location + "/eclipse/IBMIM.ini";
				txt = top.readTextFile(iniFile, "UTF-8");
				top.logTrace("ini text is " + txt);
				if (txt.indexOf("nonAdmin") > -1) {
					top.logTrace("using nonadmin");
					type = 'nonadmin';
				} else {
					top.logTrace("admin");
					type = 'admin';
				}
			} else {
				return null;
			}
		} else {
		    //no IM found
			return null;
		}
	}
	
	var txt = top.readTextFile(file, "UTF-8");
	top.logTrace("reg value:  " + txt);
	
	var launcher =  parsePropertyUnix("launcher", txt);
	top.logTrace("launcher:  " + launcher);
	
	var version = parsePropertyUnix("version", txt);
	top.logTrace("version:  " + version);
	
	var location = parsePropertyUnix("location", txt);
	top.logTrace("location:  " + location);
	
	return {'launcher': launcher, 'version': version, 'type': type, 'location': location};
	
}

/*
 * Parse a launchpad registry property from the text returned by the reg.exe command.
 * Example content:
 * Windows Registry Editor Version 5.00
 *
 * [HKEY_LOCAL_MACHINE\SOFTWARE\IBM\Installation Manager]
 * "location"="C:\\Program Files\\IBM\\Installation Manager"
 * "version"="1.4.2"
 * "internalVersion"="1.4.2000.20100825_0107"
 * "launcher"="C:\\Program Files\\IBM\\Installation Manager\\eclipse\\IBMIM.exe"
 */
function parsePropertyWin(property, regtext) {
	var locationStart = regtext.indexOf("\"" + property + "\"");
	if (locationStart > -1) {
		locationStart += property.length + 4;	//add 2 for surrounding "s and add 2 for the subsequent ="
		var locationEnd = regtext.indexOf("\"", locationStart);
		var value = regtext.substring(locationStart, locationEnd);
		return value;
	}
	return null;
}

/*
 * Parse a launchpad registry property from a UNIX system.
 * Example content:
 * location=/opt/IBM/InstallationManager
 * version=1.4.1
 * internalVersion=1.4.1000.20100810_1125
 * launcher=/opt/IBM/InstallationManager/eclipse/IBMIM
 */
function parsePropertyUnix(property, regtext) {
	var locationStart = regtext.indexOf(property + "=");
	if (locationStart > -1) {
		locationStart += property.length + 1;
		var locationEnd = regtext.indexOf("\n", locationStart);
		if (locationEnd > -1) {
			value = regtext.substring(locationStart, locationEnd);
		} else {
			value = regtext.substring(locationStart);
		}
		return value;
	}
	return null;
}


function getLinuxInstallManagerProperties(securityCheck) {
	if (!top.isSecure(userSecurityCheck)) { //if the security check fails, bail out 
		return null; 
	}
}


</script>
