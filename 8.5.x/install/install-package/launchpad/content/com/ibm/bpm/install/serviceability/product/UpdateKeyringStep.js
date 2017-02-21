// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
// Copyright IBM Corporation 2011, 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.


dojo.provide("com.ibm.bpm.install.serviceability.product.UpdateKeyringStep");
dojo.require("com.ibm.bpm.install.utils.InstallUtils");

/*
 * Generate keyring File based on user authentication
 */
dojo.declare("com.ibm.bpm.install.serviceability.product.UpdateKeyringStep", null, {

    data: null,
    logName: null,
    keyRingLocation: null,
    userName: null,
    password: null,
    
    constructor: function(){
    
    },
    
    
    /*
     * Code to execute this step
     */
    execute: function(){
    
        logger.logMessage("I: Begin of execution UpdateKeyringStep");
        
        top.keyRingStep = false; //fall through state if any failure occurs
        top.keyRingShowError = false;
        var result;
        
        var now = new Date().getTime();
        
        this.logName = util.getPersistedTempFilename('saveCredentials_' + now);
        //the log file will be used in the case of error message//TODO
        //this.keyRingLocation = util.getPersistedTempFilename('keyRingFile_'+now);
        
        result = com.ibm.bpm.install.utils.InstallUtils.runSaveCredential(this.userName, this.password, this.logName, this.keyRingLocation);
        
        /*
         *  if runSaveCredentials didnt work - what should I do?
         */
        if (result == null) {
            // set a global done flag so that it can move to next step //this.setIsPasswordCheckDone(true);
            // go to next step this.goToNextPane(); //TODO
            logger.logMessage("I: Call to runSaveCredentail resulted in failure");
            
            return false;
        }
        
        logger.logMessage("I: End of execution UpdateKeyringStep returning true");
        return true;
        
    },
    
    isValidLogFile: function(logName){
    
        logger.logMessage("I: Begin of isValidLogFile method");
        
        return com.ibm.bpm.install.utils.InstallUtils.isValidDoneFile(logName);
        
        logger.logMessage("I: End of isValidLogFile method");
    },
    
    
    passwordCheckCallBack: function(rc){
        if (rc == 0) { // failure point
            this.returnState = true; // failure point
        }
    },
    
    /*
     *  Returns true if the step has completed, false otherwise
     *
     */
    isDone: function(){
    
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
        
            if (top.fileExists(this.keyRingLocation) && this.isValidLogFile(this.logName)) {
                top.keyRingStep = true;
                this.deleteTempScript();
                this.maskPasswordInLogs();
            }
            else {
                top.keyRingShowError = true;
            }
            
        }
        
        logger.logMessage("I: End of isDone method returning " + returnValue);
        return returnValue;
    },
    
    //delete the temp batch script file created for keyring
    deleteTempScript: function() {
    
      logger.logMessage("I: Begin of deleteTempScript method");
    
       var extn = '';
       
       if (top.isWindows()) {
         extn = ".bat";
       } else {
         extn = ".sh";
       }
       
       runProgram("DISK1", command("deleteFile", this.logName + extn), BACKGROUND, HIDDEN);
    },
    
    maskPasswordInLogs: function() {
      logger.logMessage("I: Begin of maskPasswordInLogs method");
      
      var mask = this.password.replace(/./g, "*");
      
      //exact match of the password
      var regex = new RegExp("\\b" + this.password + "\\b", "g");
       
      var sysout = top.readTextFile(this.logName + ".sysout", "ASCII");
      var syserr = top.readTextFile(this.logName + ".syserr", "ASCII");
      
      sysout = sysout.replace(regex, mask);
      syserr = syserr.replace(regex, mask);
      
      top.writeTextFile(this.logName + ".sysout", sysout, false, "ASCII");
      top.writeTextFile(this.logName + ".syserr", syserr, false, "ASCII");
    }
    
});
