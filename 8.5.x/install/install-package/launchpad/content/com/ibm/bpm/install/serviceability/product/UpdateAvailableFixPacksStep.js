// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
// Copyright IBM Corporation 2011, 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("com.ibm.bpm.install.serviceability.product.UpdateAvailableFixPacksStep");
dojo.require("com.ibm.bpm.install.utils.InstallUtils");

/*
 * Get Available fix packs
 */
dojo.declare("com.ibm.bpm.install.serviceability.product.UpdateAvailableFixPacksStep", null, {

    data: null,
    logName: null,
    keyRingLocation: null,
    repositories: null,
    
    constructor: function(){
    
    },
    
    
    /*
     * Code to execute this step
     */
    execute: function(){
    
        logger.logMessage("I: At the begninning of AvailableFixPacksStep");
        
        top.AvailableFixPacksStep = false; //fall through state if any failure occurs
        //this.logName = util.getPersistedTempFilename('availableFixPacks_'+now);
        
        var result = com.ibm.bpm.install.utils.InstallUtils.getAvailableFixPacks("test", this.keyRingLocation, this.repositories, this.logName);
        
        if (result == null) {
            // set a global done flag so that it can move to next step //this.setIsPasswordCheckDone(true);
            // go to next step this.goToNextPane(); //TODO
            logger.logMessage("W: AvailableFixPacksStep retunrning false");
            return false;
        }
        
        logger.logMessage("I: AvailableFixPacksStep retunrning true");
        return true;
    },
    
    getAvailableFixPacksCallback: function(rc){
    
        if (rc == 0) { // failure point
            this.returnState = true; // failure point
        }
    },
    
    isValidLogFile: function(logName){
        return com.ibm.bpm.install.utils.InstallUtils.isValidDoneFile(logName);
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
        
        if (this.logName == null) {
            exists = false;
        }
        else {
            exists = top.fileExists(this.logName + ".done");
            returnValue = exists;
        }
        
        if (exists) {
        
            if (this.isValidLogFile(this.logName)) {
                top.AvailableFixPacksStep = true;
            }
            else {
                top.AvailableFixPacksStepFailed = true;
            }
            
        }
        logger.logMessage("I: End of isDone method returning " + returnValue);
        return returnValue;
        
    }
    
});
