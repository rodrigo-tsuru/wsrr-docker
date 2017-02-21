// Licensed Materials - Property of IBM
// 5725-C94
// Copyright IBM Corporation 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.


dojo.provide("com.ibm.bpm.install.utils.Logger");

/*
 * This class has utility methods for logging.
 */
dojo.declare("com.ibm.bpm.install.utils.Logger", [], {
	// Place comma-separated class attributes here. Note, instance attributes 
	// should be initialized in the constructor. Variables initialized here
	// will be treated as 'static' class variables.
	// Constructor function. Called when instance of this class is created
    

    // File to log general progress statements to.
    logFile: null,
    
    // Assert valid logFile
    constructor: function(logFile){
        if (!logFile) {
            throw "No logFile was given";
        }
        this.logFile = util.getPersistedTempFilename(logFile);
    },
    
    // Log message to the logFile, make sure this is translated if it needs to be.
    logMessage: function(message){
    
        var now = new Date().getTime();
        message = "" + now + " " + message;
        
        if (top.isWindows()) {
            message += "\r\n";
        }
        else {
            message += "\n";
        }
        top.writeTextFile(this.logFile, message, true, "UTF-8");
    }
//, 
//Uncomment above comma and add comma-separated functions here. Do not leave a 
// trailing comma after last element.
});