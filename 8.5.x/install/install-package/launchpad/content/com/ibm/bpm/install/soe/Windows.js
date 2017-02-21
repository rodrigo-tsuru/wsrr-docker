// Licensed Materials - Property of IBM
// 5725-C94
// Copyright IBM Corporation 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.


dojo.provide("com.ibm.bpm.install.soe.Windows");

dojo.require("com.ibm.bpm.install.soe.OS");

dojo.declare("com.ibm.bpm.install.soe.Windows",
		[ com.ibm.bpm.install.soe.OS ], {
			// Place comma-separated class attributes here. Note, instance attributes 
			// should be initialized in the constructor. Variables initialized here
			// will be treated as 'static' class variables.
			
    		//@Override
    		// relative IM location on Disk
    		getRelativeIMDiskLocation : function() {
    		    var props = this.getInstalledIMProperties();
                if (this.architecture == 'x86') {
                    return 'IM_win32_x86';
                } else if (this.architecture.indexOf("64") != -1) {
                    if (props == null || props.is64bit == 'true') {
                        return 'IM_win32_x86_64';
                    } else {
                        return 'IM_win32_x86';
                    }
                }
    		},
    		
    		getShortName : function() {
    			return "win";
    		},	    		

			// Constructor function. Called when instance of this class is created
			constructor : function() {
			    
			},
			
            //@Override
            // default was homes for WSRR
            getDefaultWasHomes : function() {
				
				var wsrr = property('DefaultWSRRInstallLocationWindows');
				
				return { 'wsrr' : wsrr};     
            },
			
			//@Override
			//calculate IM ESD location and assign it
            getRelativeIMESDLocation : function() {
                var props = this.getInstalledIMProperties();
                if ((props == null || props.is64bit == 'true') && this.architecture.indexOf("64") != -1) {
                	return 'IM64';

                } else {
                	return 'IM';
                }
            },
			
			
			//@Override
			// get installed IM properties
			getInstalledIMProperties : function() {
			
			    var tmpDir = getEnv("TEMP");
			    var tmpFile = tmpDir + "\\lpwas_" + new Date().getTime() + ".txt";
			    var foundIM = false;
			    var type = null; // whether admin or nonadmin
			
			    loggerFactory.logTrace("Using temp file " + tmpFile);
			
			    if (this.isCurrentUserAdministrator() == true) {
			        runProgram(null, command('queryRegAdmin', tmpFile), FOREGROUND, HIDDEN);
			        if (top.fileExists(tmpFile)) {
			            loggerFactory.logTrace("Using admin registry");
			            foundIM = true;
			            type = 'admin';
			        } else {
			            // try 64-bit locations
			            runProgram(null, command('queryRegAdmin64', tmpFile), FOREGROUND, HIDDEN);
			            if (top.fileExists(tmpFile)) {
			                loggerFactory.logTrace("Using wow admin registry");
			                foundIM = true;
			                type = 'admin';
			            } // else no IM found - return null
			        }
			    } else if (this.isCurrentUserAdministrator() == false) {
			        runProgram(null, command('queryRegNonAdmin', tmpFile), FOREGROUND, HIDDEN);
			        if (top.fileExists(tmpFile)) {
			            loggerFactory.logTrace("Using non-admin registry");
			            foundIM = true;
			            type = 'nonadmin';
			        }
			    }
			
			    if (foundIM) {
			        var txt = top.readTextFile(tmpFile, "UTF-16LE");
			        loggerFactory.logTrace("reg value:  " + txt);
			        
			        var result = this.parseIMProperties(txt);
			        
			        //append the existing IM installation type to the IM props 
			        if (result != null) {
			            result.type = type;
			        };
			        
			        return result;
			    } else {
			        return null;
			    }
			},
		    
		    getExistingDBLearnMoreLink : function(dbType) {
		    	switch(dbType) {
			    	case "DB2": {
			    			return property('exisitng.db.learn.more.db2.win.url');
				    	}
				    	break;
			    	case "MSSQL": {
				    		return property('existing.db.learn.more.mssql.win.url');
				    	}
				    	break;
			    	case "Oracle": {
				    		return property('existing.db.learn.more.oracle.win.url');
				    	}
		    	}
		    },
			
			getDB2Offering : function(admin){
                var installXML='';
                if(this.is64bitArch()){
                    installXML = installXML +
                             "<offering id=\'" + property('DB2OfferingIdWindows64Id')+"\' />\n";
                }else{
                installXML = installXML +
                             "<offering id=\'" + property('DB2OfferingIdWindows32Id')+"\' />\n";
                }
                
                return installXML;
            }
		//, 
		//Uncomment above comma and add comma-separated functions here. Do not leave a 
		// trailing comma after last element.			
		});