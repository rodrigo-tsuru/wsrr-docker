// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
// Copyright IBM Corporation 2011, 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("com.ibm.bpm.install.steps.StartServerStep");

dojo.require("com.ibm.bpm.install.steps.InstallStep");
dojo.require("com.ibm.bpm.install.utils.InstallUtils");
dojo.require("com.ibm.bpm.install.utils.InstallHelper");

dojo.declare("com.ibm.bpm.install.steps.StartServerStep", [com.ibm.bpm.install.steps.InstallStep], {

    // Points for this step.
    points: 100,
    // Expected size of the output file when completed.
    expectedSize: 18820093,
    // Data reference.
    data: null,
    // Profile creation log file name	
    logFilename: null,
    // Profile filename base	
    startServerFilename: null,

    constructor: function(){
    },
    
    /*
     * Code to run to execute this step
     */
    execute: function(data){
        this.data = data;
        this.continueMessage = property("install.cancel.startServer.succeed");
        
        // Create filename base for startServer.
        util = new com.ibm.bpm.install.utils.InstallHelper();
        this.startServerFilename = util.getPersistedTempFilename("startServer");
        
        // Basic create info
        var startServerCommand = top.getNativeFileName(this.data.location + "/profiles/" + this.data.profileName + "/bin/startServer");
        
        if (top.OSTYPE == 'windows') {
            startServerCommand += ".bat";
        }
        else {
            startServerCommand += ".sh";
        }

	var serverName = "server1";
        
        // Set startServer log filename
        this.logFilename = top.getNativeFileName(this.data.location + "/profiles/" + this.data.profileName + "/logs/" + serverName + "startServer.log");
        
        // Start initial startServer string.
        var options = serverName + " -username " + this.data.profile.adminUserName + " -password " + this.data.profile.adminPassword;
        
        // Kick off startServer.
        com.ibm.bpm.install.utils.InstallUtils.startServer(startServerCommand, options, this.startServerFilename);
    },
    
    /*
     * Returns the current number of points completed by this step and the current status text to display
     */
    getProgress: function(){
           
        return {
            points: this.points,
            text: property("wizard.startingServer")
        };
    },
    
    /*
     * Returns true if the step has completed, false otherwise
     */
    isDone: function(){
        var exists = top.fileExists(this.startServerFilename + ".done");
        return exists;
    },
    
    /*
     * Returns the success/failure status and any messages
     */
    getResult: function(){
    
        // Read install process completion    
        var startServerResultText = top.readTextFile(this.startServerFilename + ".done", "ASCII");
        var startServerResult = dojo.fromJson(startServerResultText);
        this.success = startServerResult.isSuccess;
        
        // Read the install log        
        var txt = top.readTextFile(this.logFilename, "UTF-8");
        if (txt) {
            var index = txt.indexOf("FAILED");
            if (index != -1) {
                logger.logMessage("E: Found FAILED error message in the startServer log.");
                this.success = false;
            }
        }
        
        // Add message pointing to the log file		
        if (!this.success) {
            var filename = com.ibm.bpm.install.utils.InstallUtils.getCanonicalFilename(this.startServerFilename);
            this.messages[this.messages.length] = new com.ibm.bpm.install.utils.Message("info", top.formatmsg(property("install.readLog"), this.logFilename));
            this.messages[this.messages.length] = new com.ibm.bpm.install.utils.Message("info", top.formatmsg(property("install.readLog"), filename + ".sysout"));
            this.messages[this.messages.length] = new com.ibm.bpm.install.utils.Message("info", top.formatmsg(property("install.readLog"), filename + ".syserr"));
        }
        
        return {
            success: this.success,
            messages: this.messages
        };
    }
    
});
