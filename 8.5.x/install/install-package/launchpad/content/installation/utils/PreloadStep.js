// Licensed Materials - Property of IBM
// 5724-L01 5724-I82 5724-M24 5724-M23 5724-V37 5655-W01 5724-N72 5655-WBS 
// Copyright IBM Corporation 2011. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("installation.utils.PreloadStep");

dojo.require("installation.utils.InstallStep");
dojo.require("installation.utils.InstallUtils");

dojo.require("dojo.string");

dojo.declare("installation.utils.PreloadStep", [installation.utils.InstallStep], {

    // Points for this step.
    points: 400,

    // Data reference.
    data: null,

    // Profile filename base	
    preloadFilename: null,

    constructor: function(){
    },
    
    /*
     * Code to run to execute this step
     */
    execute: function(data){
        this.data = data;
        this.continueMessage = property("install.cancel.preload.succeed");
        
        // Create filename base for preload.
        this.preloadFilename = installation.utils.InstallUtils.getPersistedTempFilename("preload");
        
        // Basic create info
        var preloadCommand = top.getNativeFileName(this.data.location + "/profiles/" + this.data.profileName + "/bin/wsadmin");
        
        if (top.OSTYPE == 'windows') {
            preloadCommand += ".bat";
        }
        else {
            preloadCommand += ".sh";
        }

	var serverName = "server1";

        // read the port number
        var portdefFile = top.getNativeFileName(this.data.location + "/profiles/" + this.data.profileName + "/properties/portdef.props");
        var portdefs = top.readTextFile(portdefFile, "UTF-8");
        var portLinePattern = /SOAP_CONNECTOR_ADDRESS=\d+/;
        var portLine = "" + portdefs.match(portLinePattern);
        var port = portLine.split("=")[1];

        logger.logMessage("I: Read SOAP port as: " + port);
        
        // Start initial preload string.
	// JACL needs unix style paths
	var washome_unix = this.data.location;
	//washome_unix.replace(/\\/g, "/");
        var options = "-lang jacl -conntype SOAP -host localhost -port " + port + " -user " + this.data.profile.adminUserName + " -password " + this.data.profile.adminPassword + " -f " + this.data.location+"/Kapla/install/preload.jacl -washome "+washome_unix.replace(/\\/g, "/");
        
        // Kick off preload.
        installation.utils.InstallUtils.preload(preloadCommand, options, this.preloadFilename);
    },
    
    /*
     * Returns the current number of points completed by this step and the current status text to display
     */
    getProgress: function(){

        return {
            points: this.points,
            text: property("wizard.preload")
        };
    },
    
    /*
     * Returns true if the step has completed, false otherwise
     */
    isDone: function(){
        var exists = top.fileExists(this.preloadFilename + ".done");
        return exists;
    },
    
    /*
     * Returns the success/failure status and any messages
     */
    getResult: function(){
    
        // Read install process completion    
        var preloadResultText = top.readTextFile(this.preloadFilename + ".done", "ASCII");
        var preloadResult = dojo.fromJson(preloadResultText);
        this.success = preloadResult.isSuccess;
        
        // Add message pointing to the log file		
        if (!this.success) {
            var filename = installation.utils.InstallUtils.getCanonicalFilename(this.preloadFilename);
            this.messages[this.messages.length] = new installation.utils.Message("info", top.formatmsg(property("install.readLog"), filename + ".sysout"));
            this.messages[this.messages.length] = new installation.utils.Message("info", top.formatmsg(property("install.readLog"), filename + ".syserr"));
        }
        
        return {
            success: this.success,
            messages: this.messages
        };
    }
    
});
