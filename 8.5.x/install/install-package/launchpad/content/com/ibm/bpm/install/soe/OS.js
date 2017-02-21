// Licensed Materials - Property of IBM
// 5725-C94
// Copyright IBM Corporation 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.


dojo.provide("com.ibm.bpm.install.soe.OS");

dojo.declare("com.ibm.bpm.install.soe.OS", [], {
	// Place comma-separated class attributes here. Note, instance attributes 
	// should be initialized in the constructor. Variables initialized here
	// will be treated as 'static' class variables.
    
	// helper identities
	// os name
	os : null,
	
	// os architecture
	architecture : null,

	//whether user is admin
	isAdmin : null,
	
	// check admin function name
	checkAdmin : "checkAdmin",
	
	// relative IM Disk Location on ESD
	getRelativeIMESDLocation : function() {
		return "IM";
	},
	
	// relative IM location on Disk
    getRelativeIMDiskLocation : function() {
        return "";
    },
    
	getShortName : function() {
		return "";
	},	    

	// Constructor function. Called when instance of this class is created
	constructor : function() {
		
	},
    
    // default was homes for WSRR
    getDefaultWasHomes : function() {
        return { 'wsrr': ''}
    },
	
	// function returns the default WAS home to be used with typical install
    // scenarios
    getDefaultWasHome : function() {
        var home = "";
        
        var defaultWasHomes = this.getDefaultWasHomes();

        home = defaultWasHomes.wsrr;
        var ret = dojo.trim(home) + 'v' + util.getShortVersion();
        if (top.isWindows()) {
            ret = dojo.trim(home) + '\\v' + util.getShortVersion();
        }
        
        return ret;
    },
    
    
    // checks if current user is administrator
    isCurrentUserAdministrator : function() {
        if (this.isAdmin == null) {
            this.isAdmin = this.isAdministrator();
        }
        return this.isAdmin;
    },
    
    
    // common function for determining if the user is an administrator
    isAdministrator : function() {
        var failMessage = "E: Unable to determine administrative rights"
        
        try {
        	// TODO : @MV replace all top references logger and utilities
            var tempFile = util.getPersistedTempFilename("checkAdmin.response.json");
            loggerFactory.logTrace(property("log.info.request.file") + " " + tempFile);
            runProgram("DISK1", command(this.checkAdmin, top.STARTINGDIR, tempFile), FOREGROUND, HIDDEN);
            var responseText = top.readTextFile(tempFile, "ASCII");
            if (null == responseText) {
                loggerFactory.logTrace(top.formatmsg(property("log.error.file"), tempFile));
                throw failMessage;
            }
            var response = eval("(" + responseText + ")");
            return response.isAdmin;
        } catch (exception) {
            loggerFactory.logException(exception.message);
            loggerFactory.logTrace(failMessage);
        }
    },
    
    // function returns the IM location for the media
    getIMLocation : function() {
        if (util.checkMediaSpanned() == 'false') {
            return top.IMAGEDIR + this.getRelativeIMESDLocation();
        } else {
            return top.IMAGEDIR + this.getRelativeIMDiskLocation();
        }
    },


    // function reads installed IM properties
    getInstalledIMProperties : function() {
        return null;
    },

    /*
     * Parse a launchpad registry property.
     * 
     * For windows OS: it is of the format provided below and are read from the
     * reg.exe query command.
     * 
     * Example content: Windows Registry Editor Version 5.00
     * 
     * [HKEY_LOCAL_MACHINE\SOFTWARE\IBM\Installation Manager]
     * "location"="C:\\Program Files\\IBM\\Installation Manager"
     * "version"="1.4.2" "internalVersion"="1.4.2000.20100825_0107"
     * "launcher"="C:\\Program Files\\IBM\\Installation
     * Manager\\eclipse\\IBMIM.exe"
     * 
     * 
     * For Unix OS: it is read from launchpad registry laid down on unix system
     * 
     * Example content: location=/opt/IBM/InstallationManager version=1.4.1
     * internalVersion=1.4.1000.20100810_1125
     * launcher=/opt/IBM/InstallationManager/eclipse/IBMIM is64bit=true
     * 
     * @property - property name to be parsed @regtext - registry line
     * containing property name and value pair
     * 
     * @returns - property value
     */
    parseIMProperty : function(property, regtext) {

        // clean out all double quotes which gives trouble finding index in
        // windows OS
        regtext = regtext.replace(/"/g, "");
        regtext = regtext.replace(/\r/g, "");
        
        var locationStart = regtext.indexOf(property + "=");
        if (locationStart > -1) {
            locationStart += property.length + 1;
            var locationEnd = regtext.indexOf("\n", locationStart);
            var value = regtext.substring(locationStart);
            if (locationEnd > -1) {
                value = regtext.substring(locationStart, locationEnd);
            }
            return value;
        }
        return null;
    },

    /*
     * function parses all IM properties from the registry text passed as
     * argument
     */
    parseIMProperties : function(regtext) {
        // check to see if regtext is defined and not null
        if (regtext) {
            var appDataLocation = this.parseIMProperty("appDataLocation", regtext);
            loggerFactory.logTrace("appDataLocation:  " + appDataLocation);

            var launcher = this.parseIMProperty("launcher", regtext);
            loggerFactory.logTrace("launcher:  " + launcher);

            var version = this.parseIMProperty("version", regtext);
            loggerFactory.logTrace("version:  " + version);

            var location = this.parseIMProperty("location", regtext);
            loggerFactory.logTrace("location:  " + location);

            var is64bit = this.parseIMProperty("is64bit", regtext);
            loggerFactory.logTrace("is64bit:  " + is64bit);

            return {
                'launcher' : launcher,
                'appDataLocation' : appDataLocation,
                'version' : version,
                'location' : location,
                'is64bit' : is64bit
            };
        } else {
            return null;
        }
    },
    
    getRepos : function(){
		if(this.is64bitArch()){
			return "repos_64bit";
		}
		return "repos_32bit";
	},
	
	getSDK : function(){
		if(this.is64bitArch()){
			return "com.ibm.sdk.6_64bit";
		}
		return "com.ibm.sdk.6_32bit";
	},
    
    is64bitArch : function(){
		if((this.architecture.indexOf("64") != -1) || (this.architecture == 's390x')){
			return true;
		}
		return false;
		// do we support HP-UX?
    },    
    
    getExistingDBLearnMoreLink : function(dbType) {
    	return '';
    },
    
    getDB2Offering : function(admin){
        return '';
    }
//, 
//Uncomment above comma and add comma-separated functions here. Do not leave a 
// trailing comma after last element.			
});