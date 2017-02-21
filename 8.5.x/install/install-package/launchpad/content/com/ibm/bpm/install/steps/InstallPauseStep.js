// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
// Copyright IBM Corporation 2011, 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("com.ibm.bpm.install.steps.InstallPauseStep");

dojo.require("com.ibm.bpm.install.steps.InstallStep");

/*
 * An installation step that is too quick needs a pause for the user to cancel.
 */
dojo.declare("com.ibm.bpm.install.steps.InstallPauseStep", [com.ibm.bpm.install.steps.InstallStep], {

    // Points this task is worth (Use seconds of execution time as scale)
    pause: true,
    
    constructor: function(){
    },
    
    /*
     * Add a pause because this step is so quick to finish.
     */
    isDone: function(){
        if (this.pause) {
            this.pause = false;
            return false;
        }
        else {
            return true;
        }
    }
    
});
