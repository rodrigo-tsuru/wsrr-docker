// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
// Copyright IBM Corporation 2011, 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("com.ibm.bpm.install.serviceability.product.UpdateApplicableFixPacksStep");
dojo.require("com.ibm.bpm.install.utils.InstallUtils");

/*
 * Get Applicable fix packs
 */
dojo.declare("com.ibm.bpm.install.serviceability.product.UpdateApplicableFixPacksStep", null, {


    data: null,
    availableFixPacksOutputFile: null,
    logName: null,
    applicableFixPacksResponse: null,
    
    constructor: function(){
    },
    
    /*
     * Code to execute this step
     */
    execute: function(){
    
        var doMonitorStep = false;
        top.ApplicableFixPacksStep = false; //fall through state if any failure occurs
        var now = new Date().getTime();
        this.logName = "GetApplicableFixPacks_" + now + ".json";
        
        this.applicableFixPacksResponse = com.ibm.bpm.install.utils.InstallUtils.getApplicableFixPacks(this.availableFixPacksOutputFile, this.logName);
        
        
        if (null != this.applicableFixPacksResponse) {
            top.fixPackUpdates = this.applicableFixPacksResponse;
            top.ApplicableFixPacksStep = true;
        }
        
        return doMonitorStep;
    }
    
});
