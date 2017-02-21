// Licensed Materials - Property of IBM
// 5725-C94
// Copyright IBM Corporation 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.


dojo.provide("com.ibm.bpm.install.utils.LoggerFactory");

dojo.require("com.ibm.bpm.install.utils.Logger");

dojo.declare("com.ibm.bpm.install.utils.LoggerFactory", [], {
	// Place comma-separated class attributes here. Note, instance attributes 
	// should be initialized in the constructor. Variables initialized here
	// will be treated as 'static' class variables.
    
    //launchpad updates logger
    _launchpadUpdatesLogger : null,
    
    
    //logger for bpm launcher
    _bpmLauncherLogger : null,
    
    //logger for typical installation
    _typicalInstallationLogger : null,


	// Constructor function. Called when instance of this class is created
	constructor : function() {
		
	},

    /**
     * Write message to BPM Launcher log.
     */
    logTrace : function(msg) {
        this.getBPMLauncherLogger().logMessage(msg);
    },

    /**
     * Write exceptions to BPM Launcher log.
     */
    logException : function(exception) {
        var launcherLogger = this.getBPMLauncherLogger(); 
        if (exception instanceof Error) {
            launcherLogger.logMessage(exception.message);
            launcherLogger.logMessage(top.formatmsg(property("log.error"), exception));
        }
        
    },
        
    //gives logger for logging launchpad updates
    getBPMLauncherLogger : function() {
        if (com.ibm.bpm.install.utils.LoggerFactory.prototype._bpmLauncherLogger == null) {
            var now = new Date().getTime();
            var logFileName = "BPMLauncherLogger_"+ now +".log";
            var launcherLogger = new com.ibm.bpm.install.utils.Logger(logFileName);
            com.ibm.bpm.install.utils.LoggerFactory.prototype._bpmLauncherLogger = launcherLogger;
        }
        
        return this._bpmLauncherLogger;
    },
    
    //gives logger for logging launchpad updates
    getLaunchpadUpdatesLogger : function() {
        if (com.ibm.bpm.install.utils.LoggerFactory.prototype._launchpadUpdatesLogger == null) {
            var now = new Date().getTime();
            var logFileName = "launchpad_Updates_"+ now +".log";
            var updatesLogger = new com.ibm.bpm.install.utils.Logger(logFileName);
            com.ibm.bpm.install.utils.LoggerFactory.prototype._launchpadUpdatesLogger = updatesLogger;
        }
        
        return this._launchpadUpdatesLogger;
    },

    //gives logger for logging typical installation
    getTypicalInstallationLogger : function() {
        if (com.ibm.bpm.install.utils.LoggerFactory.prototype._typicalInstallationLogger == null) {
            var now = new Date().getTime();
            var logFileName = "typical_install.log";
            var typicalInstallLogger = new com.ibm.bpm.install.utils.Logger(logFileName);
            com.ibm.bpm.install.utils.LoggerFactory.prototype._typicalInstallationLogger = typicalInstallLogger;
        }
        
        return this._typicalInstallationLogger;
    }
//, 
//Uncomment above comma and add comma-separated functions here. Do not leave a 
// trailing comma after last element.			
});