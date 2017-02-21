// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
// Copyright IBM Corporation 2011, 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("com.ibm.bpm.install.steps.InstallManagerStep");

dojo.require("com.ibm.bpm.install.steps.InstallStep");
dojo.require("com.ibm.bpm.install.utils.InstallUtils");

dojo.require("com.ibm.bpm.install.utils.InstallHelper");

/*
 * Installation step to install through IM.
 */
dojo.declare("com.ibm.bpm.install.steps.InstallManagerStep", [com.ibm.bpm.install.steps.InstallStep], {

    // Points for this step.
    points: null,
    // Response file to run with
    logName: null,
    id: null,
    location: '',
    repo: null,
    properties: '',
    
    // Installing Message
    installingMessage: null,
    // Expected size of the output file when completed.
    expectedSize: null,
    
    constructor: function(){
    },
    
    /*
     * Code to run to execute this step
     */
    execute: function(data){
        com.ibm.bpm.install.utils.InstallUtils.runImcl(this.id, this.location, this.repo, this.properties, this.logName);
    },
    
    /*
     * Returns the current number of points completed by this step and the current status text to display
     */
    getProgress: function(){
    
        var completedPoints = 0;
        
        if (this.logName) {
            var percent = com.ibm.bpm.install.utils.InstallUtils.checkFileProgress(this.logName + ".sysout", this.expectedSize);
            completedPoints = percent * this.points;
        }
        
        var text = null;
        if (completedPoints == 0) {
            text = property("wizard.startingIM");
        }
        else {
            text = this.installingMessage;
        }
        
        return {
            points: completedPoints,
            text: text
        };
    },
    
    /*
     * Returns true if the step has completed, false otherwise
     */
    isDone: function(){
        var exists = top.fileExists(this.logName + ".done");
        return exists;
    },
    
    /*
     * Returns the success/failure status and any messages
     */
    getResult: function(){
    
        // Read install process completion    
        var installResultText = top.readTextFile(this.logName + ".done", "ASCII");
        var installResult = dojo.fromJson(installResultText);
        this.success = installResult.isSuccess;
        
        // Read the install log        
        var txt = top.readTextFile(this.id + ".log", "UTF-8");
        
        if (txt != null) {
            if (window.DOMParser) {
                parser = new DOMParser();
                xmlDoc = parser.parseFromString(txt, "text/xml");
            }
            else // Internet Explorer
            {
                xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async = "false";
                xmlDoc.loadXML(txt);
            }
            
            // Create messages
            var messageNodes = xmlDoc.getElementsByTagName("result")[0].childNodes;
            for (var i = 0; i < messageNodes.length; i++) {
                var severity = messageNodes[i].nodeName;
                if (severity == "error") {
                    logger.logMessage(property("log.error.silent.install"));
                    this.success = false;
                    var text = messageNodes[i].childNodes[0].nodeValue;
                    this.messages[this.messages.length] = new com.ibm.bpm.install.utils.Message(severity, text);
                }
            }
        }
        
        // Add message pointing to the log file		
        if (!this.success) {
            var filename = com.ibm.bpm.install.utils.InstallUtils.getCanonicalFilename(this.logName);
            this.messages[this.messages.length] = new com.ibm.bpm.install.utils.Message("info", top.formatmsg(property("install.readLog"), filename + ".log"));
            this.messages[this.messages.length] = new com.ibm.bpm.install.utils.Message("info", top.formatmsg(property("install.readLog"), filename + ".sysout"));
            this.messages[this.messages.length] = new com.ibm.bpm.install.utils.Message("info", top.formatmsg(property("install.readLog"), filename + ".syserr"));
        }
        
        return {
            success: this.success,
            messages: this.messages
        };
    }
    
});
