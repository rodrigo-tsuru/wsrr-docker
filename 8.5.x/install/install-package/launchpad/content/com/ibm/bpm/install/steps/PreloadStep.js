// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
// Copyright IBM Corporation 2011, 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("com.ibm.bpm.install.steps.PreloadStep");

dojo.require("com.ibm.bpm.install.steps.InstallStep");
dojo.require("com.ibm.bpm.install.utils.InstallUtils");

dojo.require("dojo.string");

dojo.declare("com.ibm.bpm.install.steps.PreloadStep", [com.ibm.bpm.install.steps.InstallStep], {

    // Points for this step.
    points: 100,

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
        util = new com.ibm.bpm.install.utils.InstallHelper();
        this.preloadFilename = util.getPersistedTempFilename("preload");
        
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
        var options = "-lang jacl -conntype SOAP -host localhost -port " + port + " -user " + this.data.profile.adminUserName + " -password " + this.data.profile.adminPassword + " -f " + this.data.location+"/WSRR/install/preload.jacl -wsrrhome "+washome_unix.replace(/\\/g, "/")+"/WSRR";
        
        // Kick off preload.
        com.ibm.bpm.install.utils.InstallUtils.preload(preloadCommand, options, this.preloadFilename);
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
            var filename = com.ibm.bpm.install.utils.InstallUtils.getCanonicalFilename(this.preloadFilename);
            this.messages[this.messages.length] = new com.ibm.bpm.install.utils.Message("info", top.formatmsg(property("install.readLog"), filename + ".sysout"));
            this.messages[this.messages.length] = new com.ibm.bpm.install.utils.Message("info", top.formatmsg(property("install.readLog"), filename + ".syserr"));
        }
        
        return {
            success: this.success,
            messages: this.messages
        };
    }
    
});
