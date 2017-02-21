// Licensed Materials - Property of IBM
// 5725-C94
// Copyright IBM Corporation 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("com.ibm.bpm.install.SOEFactory");

dojo.require("com.ibm.bpm.install.soe.Windows");
dojo.require("com.ibm.bpm.install.soe.AIX");
dojo.require("com.ibm.bpm.install.soe.Linux");
dojo.require("com.ibm.bpm.install.soe.Solaris");

dojo.declare("com.ibm.bpm.install.SOEFactory", [], {
	// Place comma-separated class attributes here. Note, instance attributes 
	// should be initialized in the constructor. Variables initialized here
	// will be treated as 'static' class variables.

	// Constructor function. Called when instance of this class is created
	constructor : function() {
		
	},
	
	/**
	 * Function is a factory function to return the correct OS instance
	 * 
	 * @param os OS name
	 * @param arch OS architecture
	 */
	getOS : function(os, arch) {
        var helper;

        if (os.toLowerCase().indexOf('windows') > -1) {
            helper = new com.ibm.bpm.install.soe.Windows();
        } else if (os.toLowerCase().indexOf('linux') > -1) {
            helper = new com.ibm.bpm.install.soe.Linux();
        } else if (os.toLowerCase().indexOf('sunos') > -1) {
            helper = new com.ibm.bpm.install.soe.Solaris();
        } else if (os.toLowerCase().indexOf('aix') > -1) {
            helper = new com.ibm.bpm.install.soe.AIX();
        } else {
            loggerFactory.logTrace('please give the correct os, passed value is:' + os);
        }

        // set helper identities
        helper.os = os;
        helper.architecture = arch;

        return helper;
    },
    
    /**
     * Function is a factory function to return the correct DB instance
     * TODO : Need implementation
     */
    getDB : function() {
        var db = new com.ibm.bpm.install.soe.DB();
        return db;
    }
//, 
//Uncomment above comma and add comma-separated functions here. Do not leave a 
// trailing comma after last element.			
});