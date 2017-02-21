// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
// Copyright IBM Corporation 2011, 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("com.ibm.bpm.install.steps.InstallStep");

dojo.require("com.ibm.bpm.install.utils.Message");

/*
 * Base class for all installation steps.
 */
dojo.declare("com.ibm.bpm.install.steps.InstallStep", null, {

    // Points this task is worth (Use seconds of execution time as scale)
    points: 0,
    success: false,
    messages: [],
    continueMessage: null,
    
    constructor: function(){
    },
    
    /*
     * Code to run to execute this step
     */
    execute: function(data){
        // Intentionally left blank
    },
    
    /*
     * Returns the continue confirmation message if install succeeded up until this point
     */
    getContinueMessage: function(){
        return this.continueMessage;
    },
    
    /*
     * Returns true if the step has completed, false otherwise
     */
    isDone: function(){
        return true;
    },
    
    /*
     * Returns the success/failure status and any messages
     */
    getResult: function(){
        return {
            success: this.success,
            messages: this.messages
        };
    },
    
    /*
     * Returns the current number of points completed by this step and the current status text to display
     */
    getProgress: function(){
        return {
            points: 0,
            text: ""
        };
    }
    
});
