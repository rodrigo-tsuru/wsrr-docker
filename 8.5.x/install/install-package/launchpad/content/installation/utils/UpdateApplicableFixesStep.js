// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
// Copyright IBM Corporation 2011, 2012. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("installation.utils.UpdateApplicableFixesStep");
dojo.require("installation.utils.InstallUtils");

/*
 * Get Applicable Fixes
 */
 
 dojo.declare("installation.utils.UpdateApplicableFixesStep", null, {
 	
 	data: null,
	logName: null,
	availableWASFixesPacksOutputFile:null,
	availableBPMFixesPacksOutputFile:null,
	applicableFixesResponse:null,
	 
	constructor: function(){
	
    },
    
     /*
 	 * Code to execute this step
     */
    
    execute: function(){
    	var doMonitorStep = false;
		logger.logMessage("I: Begin of execution UpdateFixesStep");
    	top.ApplicableFixesStep = false; //fall through state if any failure occurs
    	
    		var	now = new Date().getTime(); 
    		this.logName = "GetApplicableFixes_"+ now + ".json";
			this.applicableFixesResponse = installation.utils.InstallUtils.getApplicableFixes(this.availableWASFixesPacksOutputFile,this.availableBPMFixesPacksOutputFile,this.logName);
							 
			logger.logMessage("I: getApplicableFixes returned");						 
							 
			if(null!= this.applicableFixesResponse){

				logger.logMessage("I: applicableFixesResponse returned PASS");
				if(this.applicableFixesResponse.bpmFixes){
					logger.logMessage("I: applicableFixesResponse returned BPMFixes");
					top.updates = this.applicableFixesResponse;		 		
				}
				if(this.applicableFixesResponse.wasFixes){
					logger.logMessage("I: applicableFixesResponse returned WASFixes");		 			
					top.updates = this.applicableFixesResponse; 
					
				}
				top.ApplicableFixesStep = true;			 		
			}
					
		logger.logMessage("I: End of execution UpdateFixesStep");					
    	return doMonitorStep;
    }
    
    
 
});