// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
// Copyright IBM Corporation 2011, 2012. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("installation.utils.InstallProductStep");

dojo.require("installation.utils.InstallManagerStep");
dojo.require("installation.utils.InstallUtils");
dojo.require("dojo.date.locale");

/*
 * Installation step to install the product through IM.
 */
dojo.declare("installation.utils.InstallProductStep", [installation.utils.InstallManagerStep], {

    // Points for this step.
    points: 2166,
    // Expected size of the output file when completed.
    expectedSize: 550001,
    // Wizard data
    data: null,
    // String with concat of product offerings.
    PRODUCT_OFFERINGS: 'com.ibm.websphere.NDTRIAL.v85 ',
    // String with concat of properties
    PROPS: "",
    REPOSITORY_LOC: "",
    
    constructor: function(data){
        this.data = data;
    },
    
    /*
     * Code to run to execute this step
     */
    execute: function(data){
    	this.data = data;
    	
    	top.addKeyringOption = false;  //disables adding of keyring and password paramater to imcl
    	this.logName = installation.utils.InstallUtils.getPersistedTempFilename('bpm.offering'); //$NON-NLS-1$
		
		this.createResponseFiles();
		this.repo = this.REPOSITORY_LOC;
    	this.location = this.data.location;
    	
 		this.id = dojo.trim(this.PRODUCT_OFFERINGS);
    	this.properties = this.PROPS.substring(0, this.PROPS.length - 1);
    	
        this.continueMessage = property("install.cancel.im.succeed");
        this.installingMessage = top.formatmsg(property("wizard.installing"), property(data.edition + ".product"));
        this.inherited(arguments);
    },
    
	/*
     * Creates the response files.
     */
    createResponseFiles: function(){
    
       // Set offering based on edition
        switch (this.data.edition) {
            case "BPM_STARTER":
            case "BPM_STAND":
            case "BPM_PC":
            case "BPM_WPS":{
                if(this.data.profile.isProdLic)
	                this.addOffering(property(top.diskLabel.edition + ".offering.id"));
	            else    
	                this.addOffering(property(top.diskLabel.edition + ".nonProd.offering.id"));
//               this.addOffering(property(top.diskLabel.edition + ".offering.id"));
                break;
            }
            case "WSRR":{
                this.addOffering(property(top.diskLabel.edition + ".offering.id"));
                break;
            }
            default:
                {
                    throw "Unknown Edition " + top.diskLabel.edition;
                }
        }
        
        
        // Initialize DB2 Data.
        
        
        // If we are doing DB2 Express, add those values as well.
        if (this.data.embedded) {
        	// If WSRR and using db2 express then encrypt the password and update datamodel
        	if (this.data.isWsrr) {
        		var encryptedPwd = installation.utils.InstallUtils.encryptPassword(this.data.profile.adminPassword);
        		if (top.isWindows()) {
        			this.data.embedded.admin_pw = encryptedPwd;
        			this.data.database.dbPassword = encryptedPwd;
        			this.data.database.dbSysPassword = encryptedPwd;
        		} else {
        			this.data.embedded.instance_pw = encryptedPwd;
        			this.data.embedded.fenced_pw = encryptedPwd;
        			this.data.embedded.das_pw = encryptedPwd;
        			this.data.database.dbPassword = encryptedPwd;
        			this.data.database.dbSysPassword = encryptedPwd;
        		}
        	}
            if (top.OSTYPE == 'windows') {
                this.addOffering("com.ibm.ws.DB2EXP.winia64");                
                this.addProperty("user.db2.admin.username", this.data.embedded.admin_user);
                this.addProperty("user.db2.admin.password", this.data.embedded.admin_pw);
            }
            else {
                if (top.ARCHITECTURE == 'IA64' || top.ARCHITECTURE == 'AMD64') {
                     this.addOffering("com.ibm.ws.DB2EXP.linuxia64");
                }
                this.addProperty("user.db2.instance.username", this.data.embedded.instance_user);
                this.addProperty("user.db2.instance.password", this.data.embedded.instance_pw);
                
                this.addProperty("user.db2.fenced.username", this.data.embedded.fenced_user);
                this.addProperty("user.db2.fenced.password", this.data.embedded.fenced_pw);
                this.addProperty("user.db2.fenced.newuser",this.data.embedded.fenced_newuser); // added a state for IM
                
                this.addProperty("user.db2.das.username", this.data.embedded.das_user);
                this.addProperty("user.db2.das.password", this.data.embedded.das_pw);
            	this.addProperty("user.db2.das.newuser",this.data.embedded.das_newuser); // added a state for IM
            }
            this.addProperty('user.db2.use.existing','false'); // added a state for IM
            this.addProperty("user.db2.port", "50000");
        }
        
        //TODO
        // Set repository location for 32/64 bit OS.
        this.REPOSITORY_LOC =  top.IMAGEDIR + 'repository';
		if (!this.data.isWsrr && (top.isWindows() || (top.OS == "Linux" && top.ARCHITECTURE != 's390x'))) {
            this.REPOSITORY_LOC += top.PATHSEPARATOR;
            this.REPOSITORY_LOC += "repos";
            if (top.ARCHITECTURE.indexOf("64") != -1) {
                this.REPOSITORY_LOC += "_64bit";
            }
            else {
                this.REPOSITORY_LOC += "_32bit";
            }
        }   
             
    },
    
    /*
     * Concat the given offeringIds to the PRODUCT_OFFERINGS.
     */
    addOffering: function(offeringId){
        this.PRODUCT_OFFERINGS += offeringId + " ";
    },
    
    /*
     * Concat the given properties key/value pairs to the PROPERTIES.
     */
    addProperty: function(key, value){
        this.PROPS += key + "=" + value + ",";
    }
    
});
