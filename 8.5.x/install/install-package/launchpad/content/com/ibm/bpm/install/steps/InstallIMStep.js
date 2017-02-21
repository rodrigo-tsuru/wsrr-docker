// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
// Copyright IBM Corporation 2011, 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("com.ibm.bpm.install.steps.InstallIMStep");

dojo.require("com.ibm.bpm.install.steps.InstallManagerStep");
dojo.require("com.ibm.bpm.install.utils.InstallUtils");
dojo.require("dojo.date.locale");

/*
 * Installation step to install Installation Manager
 */
dojo.declare("com.ibm.bpm.install.steps.InstallIMStep", [com.ibm.bpm.install.steps.InstallManagerStep], {

    // Points for this step.
    points: 50,
    // Expected size of the output file when completed.
    expectedSize: 182986,
    // Wizard data
    data: null,
    // String with concat of product offerings.
    PRODUCT_OFFERINGS: null,
    // String with concat of properties
    PROPS: "",
        
    constructor: function(data){
        this.data = data;
    },
    
    /*
     * Code to run to execute this step
     */
    execute: function(data){
    	this.PRODUCT_OFFERINGS = property('InstallationManagerOfferingId');
    	this.data = data;
    	top.addKeyringOption = false;  //disable adding of keyring and password paramater to imcl
    	this.logName = util.getPersistedTempFilename('im'); //$NON-NLS-1$
		this.repo = osHelper.getIMLocation();
		
		//let IM default install location
    	this.location = '';
 		
 		this.id = dojo.trim(this.PRODUCT_OFFERINGS);

        this.continueMessage = property("install.cancel.im.succeed");
        this.installingMessage = top.formatmsg(property("wizard.installing"), property("IM.product"));
        this.inherited(arguments);
    }
    
});
