// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
// Copyright IBM Corporation 2011, 2012. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("installation.utils.UpdateAvailableFixesStep");
dojo.require("installation.utils.InstallUtils");

/*
 * Get available fixes
 */
 
 dojo.declare("installation.utils.UpdateAvailableFixesStep", null, {
 
 	data: null,
	logName: null,
	keyRingLocation: null,
	id:null,
	repository:null,
 
	 
	constructor: function(){
	
    },
    
    /*
 	 * Code to execute this step
     */
    
    execute: function(){
    
    	 logger.logMessage("I: Begin of execution Update Available Fixes Step");
 			
 				if(this.logName.search(/BPM/i)>=0){
        		top.AvailableBPMFixesStep = false;
        		}
        		
        		if(this.logName.search(/WAS/i)>=0){
        		top.AvailableWASFixesStep = false;
        		}
    /*
     * log name should be externalised. 
     *
     */
    //this.availableWASFixesPacksOutputFile = util.getPersistedTempFilename('availableWASFixes_'+now);
							result = installation.utils.InstallUtils.getAvailableFixes("test",
							this.keyRingLocation,
							this.logName,
							this.id,
							this.repository
							);
							
							if(result==null){
									// set a global done flag so that it can move to next step //this.setIsPasswordCheckDone(true);
    							// go to next step this.goToNextPane(); //TODO
    							logger.logMessage("I: Execution Get Available Fixes returned null");
    							return false;
							}
    		logger.logMessage("I: End of execution Update Available Fixes Step");
    		return true;	
     },
    
    getAvailableFixesCallback: function(rc){
     	if(rc==0){ // failure point
		this.returnState = true; // failure point
		}
    },
    
    
    isValidLogFile: function(logName){
    	logger.logMessage("I: Begin of isValidLogFile method");
		return installation.utils.InstallUtils.isValidDoneFile(logName);
		logger.logMessage("I: End of isValidLogFile method");
	},
	
    /*
	 *  Returns true if the step has completed, false otherwise
	 * 
	 */
    isDone: function(filename){
    	
    	/*
    	 * logName.done file exits if command is complete
    	 * else command didn't get executed or in the process of execution
    	 * Infinite execution will be prevented by monitor step.
    	 */	
    	
    	logger.logMessage("I: Begin of isDone method");
    	
    	var returnValue = false;
    	var exists;
    	
    	if(this.logName==null){
    		exists = false;
    	}else{ 
    	   	exists = top.fileExists(this.logName + ".done");
    	   	returnValue = exists;
    	}
        
        if(exists){
        	
        	if(this.isValidLogFile(this.logName)){
        		if(this.logName.search(/BPM/i)>=0){
        			top.AvailableBPMFixesStep = true;
        		}
        		
        		
        		if(this.logName.search(/WAS/i)>=0){
        			top.AvailableWASFixesStep = true;
        		}
        	}else{
        	
        		if(this.logName.search(/BPM/i)>=0){
					top.AvailableBPMFixesStepFailed = true;
				}
				
        		if(this.logName.search(/WAS/i)>=0){
					top.AvailableWASFixesStepFailed = true;
				}
        	}
        	
        }
        logger.logMessage("I: End of isDone method returning "+returnValue);
    	return returnValue; 
    		
     }
 
 });
 