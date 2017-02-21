// Licensed Materials - Property of IBM
// 5725-C94
// Copyright IBM Corporation 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.


dojo.provide("com.ibm.bpm.install.soe.Linux");

dojo.require("com.ibm.bpm.install.soe.Unix");

dojo.declare("com.ibm.bpm.install.soe.Linux",
		[ com.ibm.bpm.install.soe.Unix ], {
			// Place comma-separated class attributes here. Note, instance attributes 
			// should be initialized in the constructor. Variables initialized here
			// will be treated as 'static' class variables.
			
    		getShortName : function() {
    			return "lin";
    		},			
			
			// Constructor function. Called when instance of this class is created
			constructor : function() {
				
			},
            
            //@Override
            // default was homes for WSRR
            getDefaultWasHomes : function() {
                var userHome = getEnv('HOME');

                var wsrr = property('DefaultWSRRInstallLocationLinux');
				return { 'wsrr' : wsrr};

            },
			
			//calculate IM ESD location and assign it
			getRelativeIMESDLocation : function() {
			    var props = this.getInstalledIMProperties();
			    //PPC only has an IM directory, so must not use the IM64 location
			    if ((props == null || props.is64bit == 'true') && this.architecture.indexOf("64") != -1 && this.architecture != 'PPC64') {		    	
			    		return 'IM64';
			    } else {			    
			    		return 'IM';
			    }
			},
			
			// calculate and assign relative IM location on Disk
			getRelativeIMDiskLocation : function() {
			    var props = this.getInstalledIMProperties();
			    if (this.architecture == 'x86') {
			        return 'IM_linux_x86';
			    } else if (this.architecture.indexOf("64") != -1) {
			        if (props == null || props.is64bit == 'true') {
			            return 'IM_linux_x86_64';
			        } else {
			            return 'IM_linux_x86';
			        }
			    } else if (this.architecture == 'PPC32' || this.architecture == 'PPC64') {
			        return 'IM_linux_ppc';
			    } else if (this.architecture == 's390x') {
			        return 'IM_linux_s390';
			    }
			},
		    
		    
		    getExistingDBLearnMoreLink : function(dbType) {
		    	switch(dbType) {
			    	case "DB2": {
			    			return property('exisitng.db.learn.more.db2.linux.url');
				    	}
				    	break;
			    	case "MSSQL": {
				    		return property('existing.db.learn.more.mssql.linux.url');
				    	}
				    	break;
			    	case "Oracle": {
				    		return property('existing.db.learn.more.oracle.linux.url');
				    	}
		    	}
		    },
			
			getDB2Offering : function(admin) {
                var installXML='';
                if(admin && (this.architecture == 'IA64' || this.architecture == 'AMD64')) {
                    installXML = "<offering id=\'" + property('DB2OfferingIdLinux64Id') + "\' />\n";
                }
                else if(admin && this.architecture == 'x86') {
                    installXML = "<offering id=\'" + property('DB2OfferingIdLinux32Id') + "\' />\n";                    
                }
                return installXML;
            }
		//, 
		//Uncomment above comma and add comma-separated functions here. Do not leave a 
		// trailing comma after last element.			
		});