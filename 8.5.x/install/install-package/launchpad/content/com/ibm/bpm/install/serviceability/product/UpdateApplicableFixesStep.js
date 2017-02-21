// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
// Copyright IBM Corporation 2011, 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("com.ibm.bpm.install.serviceability.product.UpdateApplicableFixesStep");
dojo.require("com.ibm.bpm.install.utils.InstallUtils");

/*
 * Get Applicable Fixes
 */
dojo.declare("com.ibm.bpm.install.serviceability.product.UpdateApplicableFixesStep", null, {

    data: null,
    logName: null,
    availableWASFixesPacksOutputFile: null,
    availableBPMFixesPacksOutputFile: null,
    applicableFixesResponse: null,
    
    constructor: function(){
    
    },
    
    /*
     * Code to execute this step
     */
    execute: function(){
        var doMonitorStep = false;
        logger.logMessage("I: Begin of execution UpdateFixesStep");
        top.ApplicableFixesStep = false; //fall through state if any failure occurs
        var now = new Date().getTime();
        this.logName = "GetApplicableFixes_" + now + ".json";
        this.applicableFixesResponse = com.ibm.bpm.install.utils.InstallUtils.getApplicableFixes(this.availableWASFixesPacksOutputFile, this.availableBPMFixesPacksOutputFile, this.logName);
        
        logger.logMessage("I: getApplicableFixes returned");
        
        if (null != this.applicableFixesResponse) {
        
            logger.logMessage("I: applicableFixesResponse returned PASS");
            if (this.applicableFixesResponse.bpmFixes) {
                logger.logMessage("I: applicableFixesResponse returned BPMFixes");
                top.updates = this.applicableFixesResponse;
            }
            if (this.applicableFixesResponse.wasFixes) {
                logger.logMessage("I: applicableFixesResponse returned WASFixes");
                top.updates = this.applicableFixesResponse;
                
            }
            top.ApplicableFixesStep = true;
            
            // Remove any repositories returned from the list of overall repositories
            if (this.applicableFixesResponse.bpmFixes) {
                for (var i = 0; i < this.applicableFixesResponse.bpmFixes.length; i++) {
                    var repository = this.applicableFixesResponse.bpmFixes[i].repository;
                    if(top.localFixPacksAndFixes && top.localFixPacksAndFixes.repositories){
                    	for (var i = top.localFixPacksAndFixes.repositories.length - 1; i >= 0; i--) {
                    		if (top.localFixPacksAndFixes.repositories[i] === repository) {
                    			top.localFixPacksAndFixes.repositories.splice(i, 1);
                    		}
                    	}
                    }
                    
                }
            }
            
            logger.logMessage("I: Removed applicable BPM ifixes");
            
            /*
            if (this.applicableFixesResponse.wasFixes) {
                for (var i = 0; i < this.applicableFixesResponse.wasFixes.length; i++) {
                    var repository = this.applicableFixesResponse.wasFixes[i].repository;
                    if(top.localFixPacksAndFixes && top.localFixPacksAndFixes.repositories){
                    	for (var i = top.localFixPacksAndFixes.repositories.length - 1; i >= 0; i--) {
                    		if (top.localFixPacksAndFixes.repositories[i] === repository) {
                    			top.localFixPacksAndFixes.repositories.splice(i, 1);
                    		}
                    	}
                    }
                }
            }
            */
            
            logger.logMessage("I: Removed applicable ifixes");
  
            if (top.localFixPacksAndFixes.repositories) {
                for (var i = 0; i < top.localFixPacksAndFixes.repositories.length; i++) {
                    var repository = top.localFixPacksAndFixes.repositories[i];
                    logger.logMessage(top.formatmsg(property("log.warning"), "applicableFixesStep unable to find any applicable fixes in repository: " + repository));
                }
            }
        }
        
        logger.logMessage("I: End of execution UpdateFixesStep");
        return doMonitorStep;
    }
});