// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
// Copyright IBM Corporation 2011, 2012. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("installation.utils.UnzipStep");

dojo.require("installation.utils.InstallPauseStep");
dojo.require("installation.utils.InstallUtils");

/*
 * Installation step for unzipping Process Designer.
 */
dojo.declare("installation.utils.UnzipStep", [installation.utils.InstallPauseStep], {

    // Points for this step.
    points: 52,
    // Data reference
    data: null,
    
    constructor: function(){
    },
    
    /*
     * Code to run to execute this step
     */
    execute: function(data){
        this.data = data;
        this.continueMessage = property("install.cancel.profile.succeed");
        
        // Get the Process Designer zip file
        var zipFile = this.data.location + "\\BPM\\Lombardi\\tools\\designer\\authoring-environment-win.zip";
        
        // Unzip and test for success
        var response = installation.utils.InstallUtils.unzip(zipFile, top.getEnv('LaunchPadTemp'));
        this.success = (response != null);
        
        // Add message pointing to the zip file
        if (!this.success) {
            this.messages[this.messages.length] = new installation.utils.Message("error", top.formatmsg(property("install.failed.unzip"), zipFile));
        }
    },
    
    /*
     * Returns the current number of points completed by this step and the current status text to display
     */
    getProgress: function(){
    
        return {
            points: this.points,
            text: property("wizard.unzip.pd")
        };
    },
    
    /*
     * Returns the success/failure status and any messages
     */
    getResult: function(){
    
        // If success, update the eclipse.ini
        if (this.success) {
            var eclipseIniFilename = top.getTempFilename("eclipse.ini");
            var eclipseIni = top.readTextFile(eclipseIniFilename, "UTF-8");
            eclipseIni = eclipseIni.replace(/-Dcom.ibm.bpm.processcenter.url=.*/, "-Dcom.ibm.bpm.processcenter.url=\"http://" + this.data.profile.hostName + ":" + this.data.pcPort + "\"");
            top.writeTextFile(eclipseIniFilename, eclipseIni, false, "UTF-8");
            logger.logMessage(property("log.info.eclipse.ini"));
        }
        
        return {
            success: this.success,
            messages: this.messages
        };
    }
    
});
