// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
// Copyright IBM Corporation 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("com.ibm.bpm.install.steps.InstallFixPacksStep");

dojo.require("com.ibm.bpm.install.steps.InstallPauseStep");
dojo.require("com.ibm.bpm.install.utils.InstallUtils");

/*
 * Installation step to check the Imcl before install.
 */
dojo.declare("com.ibm.bpm.install.steps.InstallFixPacksStep", [com.ibm.bpm.install.steps.InstallManagerStep], {
	//TODO need to set the point
    // Points for this step.
    points: 50,
    expectedSize: 550001,
    // Data reference.
    data: null,
    REPOSITORIES: '',
    FIXPACK_OFFERINGS: '',
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
        
        this.logName = util.getPersistedTempFilename('fixPacks.offering'); //$NON-NLS-1$ 
        this.createFixPacksResponse();
        this.repo = this.REPOSITORIES;
    	this.location = this.data.location;
 		this.id = dojo.trim(this.FIXPACK_OFFERINGS);
        this.continueMessage = property("install.cancel.fixpacks.succeed");
        this.installingMessage = property("wizard.check.fixpacks"); 
        if(this.FIXPACK_OFFERINGS.length > 0 && this.REPOSITORIES.length > 0) {
        	this.inherited(arguments);
        }
        this.started = true;
    },
    
    /*
     * terminate step
     */
    exitStep: function(){
    	var noOffersAvailable = this.FIXPACK_OFFERINGS.length == 0 && this.REPOSITORIES.length == 0 && this.started;
		return noOffersAvailable;
    },
    
     createFixPacksResponse: function(){
     	if (top.fixPackUpdates) {
           	if(top.fixPackUpdates.targetWasIdVersion) {
            	this.addWASFixOffers(top.fixPackUpdates);
            }
     		
     		if(top.fixPackUpdates.targetInstIdVersion) {
            	this.addBPMFixOffers(top.fixPackUpdates);
            }
       	}  
     },
     
    addWASFixOffers: function(fixPacks){
        if(fixPacks.targetWasIdVersion && fixPacks.targetWasRepository){
        	this.addFixPacksOffering(fixPacks.targetWasIdVersion);
        	this.addRepository(fixPacks.targetWasRepository);
        }
    },
    
    addBPMFixOffers: function(fixPacks){
        if(fixPacks.targetInstIdVersion && fixPacks.targetInstRepository){
        	this.addFixPacksOffering(fixPacks.targetInstIdVersion);
        	this.addRepository(fixPacks.targetInstRepository);
        }
    },
   
    addFixPacksOffering: function(offeringId){
        this.FIXPACK_OFFERINGS += offeringId + " ";
    },
    
    addRepository: function(repository){
    	if(this.REPOSITORIES && this.REPOSITORIES.length > 0) 
        	this.REPOSITORIES += "," + repository;
        else
        	this.REPOSITORIES += repository;
    }
    
});
