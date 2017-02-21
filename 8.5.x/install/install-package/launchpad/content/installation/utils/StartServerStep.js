// Licensed Materials - Property of IBM
// 5724-L01 5724-I82 5724-M24 5724-M23 5724-V37 5655-W01 5724-N72 5655-WBS 
// Copyright IBM Corporation 2011. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("installation.utils.StartServerStep");

dojo.require("installation.utils.InstallStep");
dojo.require("installation.utils.InstallUtils");

//dojo.require("dojo.string");

dojo.declare("installation.utils.StartServerStep", [installation.utils.InstallStep], {

    // Points for this step.
    points: 1000,
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
        this.startServerFilename = installation.utils.InstallUtils.getPersistedTempFilename("startServer");
        
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
        installation.utils.InstallUtils.startServer(startServerCommand, options, this.startServerFilename);
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
            var filename = installation.utils.InstallUtils.getCanonicalFilename(this.startServerFilename);
            this.messages[this.messages.length] = new installation.utils.Message("info", top.formatmsg(property("install.readLog"), this.logFilename));
            this.messages[this.messages.length] = new installation.utils.Message("info", top.formatmsg(property("install.readLog"), filename + ".sysout"));
            this.messages[this.messages.length] = new installation.utils.Message("info", top.formatmsg(property("install.readLog"), filename + ".syserr"));
        }
        
        return {
            success: this.success,
            messages: this.messages
        };
    }
    
});
