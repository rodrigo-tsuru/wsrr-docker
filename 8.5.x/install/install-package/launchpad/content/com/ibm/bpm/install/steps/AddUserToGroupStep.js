// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
// Copyright IBM Corporation 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("com.ibm.bpm.install.steps.AddUserToGroupStep");

dojo.require("com.ibm.bpm.install.steps.InstallPauseStep");
dojo.require("com.ibm.bpm.install.utils.InstallUtils");

/*
 * Installation step to add user to a group.
 */
dojo.declare("com.ibm.bpm.install.steps.AddUserToGroupStep", [com.ibm.bpm.install.steps.InstallPauseStep], {

    // Step properties
    points: 30,
    
    constructor: function(){
    },
    
    /*
     * Code to run to execute this step
     */
    execute: function(data){
      
        var response = com.ibm.bpm.install.utils.InstallUtils.addUserToGroup(data);
        
        // Check overall success
        this.success = response;
    },
    
    /*
     * Returns the current number of points completed by this step and the current status text to display
     */
    getProgress: function(){
        return {
            points: this.points,
            text: property("wizard.addUserToGroup")
        };
    }
    
});
