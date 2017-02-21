// Licensed Materials - Property of IBM
// 5725-C94, 5725-C95, 5725-C96, 5724-M24, 5724-I82, 5724-N72
// Copyright International Business Machines Corp. 2011, 2013
// All Rights Reserved
// US Government Users Restricted Rights - Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("com.ibm.bpm.install.steps.InstallFixesStep");

dojo.require("com.ibm.bpm.install.steps.InstallPauseStep");
dojo.require("com.ibm.bpm.install.utils.InstallUtils");

/*
 * Installation step to check the Imcl before install.
 */
dojo.declare("com.ibm.bpm.install.steps.InstallFixesStep", [com.ibm.bpm.install.steps.InstallManagerStep], {

    // Points for this step.
    points: 50,
    expectedSize: 550001,
    // Data reference.
    data: null,
    REPOSITORIES: '',
    FIXES_OFFERINGS: '',
    started: false,
    
    constructor: function(data){
        this.data = data;
    },
    
    /*
     * Code to run to execute this step
     */
    execute: function(data){
        this.data = data;
        
        top.addKeyringOption = true;  //enables adding of keyring and password paramater to imcl
        
        this.logName = util.getPersistedTempFilename('fixes.offering'); //$NON-NLS-1$
        this.createFixesResponse();
        this.repo = this.REPOSITORIES;
    	this.location = this.data.location;
 		this.id = dojo.trim(this.FIXES_OFFERINGS);
        this.continueMessage = property("install.cancel.fixpacks.succeed");
        this.installingMessage = property("wizard.check.fixpacks"); 
        if(this.FIXES_OFFERINGS.length > 0 && this.REPOSITORIES.length > 0) {
        	this.inherited(arguments);
        }
        this.started = true;
    },
    
    /*
     * terminate step
     */
    exitStep: function(){
    	var noOffersAvailable = this.FIXES_OFFERINGS.length == 0 && this.REPOSITORIES.length == 0 && this.started;
		return noOffersAvailable;
    },
    
     createFixesResponse: function(){
     	if (top.updates) {
     		
     		if(top.updates.wasFixes) {
     			this.addFixOffers(top.updates.wasFixes);
     		}
     		
           	if(top.updates.bpmFixes) {
            	this.addFixOffers(top.updates.bpmFixes);
            }
       	}  
     },
    
    addFixOffers: function(fixes){
        for(var idx = 0; idx < fixes.length ; idx++) {
            var fix = fixes[idx];
            if(fix.ifixOfferingIdVersion && fix.repository) {
        		this.addFixOffering(fix.ifixOfferingIdVersion);
        		this.addRepository(fix.repository);
        	}
        }
    },
    
    addFixOffering: function(offeringId){
        this.FIXES_OFFERINGS += offeringId + " ";
    },
    
    addRepository: function(repository){
    	if(this.REPOSITORIES && this.REPOSITORIES.length > 0) 
        	this.REPOSITORIES += "," + repository;
        else
        	this.REPOSITORIES += repository;
    }
    
});
