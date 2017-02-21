// Licensed Materials - Property of IBM
// 5725-C94
// Copyright IBM Corporation 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.


dojo.provide("com.ibm.bpm.install.soe.Unix");
dojo.require("com.ibm.bpm.install.soe.OS");

dojo.declare("com.ibm.bpm.install.soe.Unix",
		[ com.ibm.bpm.install.soe.OS ], {
			// Place comma-separated class attributes here. Note, instance attributes 
			// should be initialized in the constructor. Variables initialized here
			// will be treated as 'static' class variables.
			
						
			// Constructor function. Called when instance of this class is created
			constructor : function() {
			    
			},
            
            //@Override
            // default was homes for WSRR
            getDefaultWasHomes : function() {
                return {
					'wsrr' : property('DefaultWSRRInstallLocationUnix')
                };
            },
			
			//get installed IM properties
			getInstalledIMProperties : function() {
			    var homeDir = getEnv("HOME");
			    var useAltMethod = (homeDir == '/'); // case where home dir is the
			    // root dir and we can't tell
			    // the locations apart
			    loggerFactory.logTrace("home dir is:  " + homeDir);
			    var userFile = homeDir + "/etc/.ibm/registry/InstallationManager.dat";
			    var adminFile = "/etc/.ibm/registry/InstallationManager.dat";
			    var file = null;
			    var type = null; // whether admin or nonadmin
			    if (!useAltMethod) {
			
			        if (this.isCurrentUserAdministrator() == true) {
			            if (top.fileExists(adminFile)) {
			                loggerFactory.logTrace("Using admin registry");
			                file = adminFile;
			                type = 'admin';
			            } else {
			                return null;
			            }
			        } else if (this.isCurrentUserAdministrator() == false) {
			            if (top.fileExists(userFile)) {
			                loggerFactory.logTrace("Using non-admin registry");
			                file = userFile;
			                type = 'nonadmin';
			            } else {
			                return null;
			            }
			
			        }
			    } else { // use alt method. // TODO : @MV check again this logic.
			        // Something is not quite right here. Mostly / as homedir
			        // are for root which is admin
			
			        if (top.fileExists(userFile)) {
			            // we have to find the ini file
			            file = userFile;
			
			            // TODO : @MV why are we trying to set type here? What purpose
			            // it is giving? Looks like a redundant code
			            var txt = top.readTextFile(file, "UTF-8");
			            var location = this.parseIMProperty("location", txt);
			            loggerFactory.logTrace("found IM location:  " + location);
			
			            if (location) {
			                var iniFile = location + "/eclipse/IBMIM.ini";
			                txt = top.readTextFile(iniFile, "UTF-8");
			                loggerFactory.logTrace("ini text is " + txt);
			
			                if (this.isCurrentUserAdministrator() == false) {
			                    if (txt.indexOf("nonAdmin") > -1) {
			                        loggerFactory.logTrace("using nonadmin");
			                        type = 'nonadmin';
			                    } else {
			                        return null;
			                    }
			                } else if (this.isCurrentUserAdministrator() == true) {
			                    if (txt.indexOf("admin") > -1) {
			                        loggerFactory.logTrace("admin");
			                        type = 'admin';
			                    } else {
			                        return null;
			                    }
			                }
			            } else {
			                return null;
			            }
			        } else {
			            // no IM found
			            return null;
			        }
			    }
			
			    var txt = top.readTextFile(file, "UTF-8");
			    loggerFactory.logTrace("reg value:  " + txt);
			
			    return this.parseIMProperties(txt);
			}

		//, 
		//Uncomment above comma and add comma-separated functions here. Do not leave a 
		// trailing comma after last element.			
		});