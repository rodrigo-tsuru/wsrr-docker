// Licensed Materials - Property of IBM
// 5725-C94
// Copyright IBM Corporation 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.


dojo.provide("com.ibm.bpm.install.utils.JsonHelper");

dojo.declare("com.ibm.bpm.install.utils.JsonHelper", [], {
	// Place comma-separated class attributes here. Note, instance attributes 
	// should be initialized in the constructor. Variables initialized here
	// will be treated as 'static' class variables.
    

	// Constructor function. Called when instance of this class is created
	constructor : function() {
		
	},
	
	//JSON request for getting launchpad updates
	createGetLaunchpadUpdateRequest : function(requestFile) {
	             
        var requestFileDir = util.getPersistedTempDirectory();      

        var bpmUpdatesFile = "bpm_updates.properties";
        var targetDirectory = requestFileDir;   
        var token = "";
        var versionToken = util.getUpdateVersion();
        var message = null;
        var launchpadUpdateSite;
        
        var updatesLogger = loggerFactory.getLaunchpadUpdatesLogger();
        
        //check if valid value exists for property versionToken 
        if(versionToken && versionToken!="" ){
        	launchpadUpdateSite = top.formatmsg(property('launchpad.repository'), versionToken);
	        
	        if(util.checkForNoProperty('launchpad.repository',launchpadUpdateSite)==true || launchpadUpdateSite==""){
	           message = "E: Launchpad update site is null";
	           updatesLogger.logMessage(message);
	        }
        }else{
            //log if invalid value exists for versionToken property
             message = "E: Launchpad version is null";
             updatesLogger.logMessage(message);
             launchpadUpdateSite = "";
             message = "E: Launchpad update site is null";
             updatesLogger.logMessage(message);
        }

	    // json request to fetch Launchpad update repository from bpm_updates.properties 
	    var request =  '{ "method": "GET_UPDATES",  "data": {"targetDirectory":'+ util.escapeString(targetDirectory)
                    +',"bpmUpdatesFile":'+ util.escapeString(bpmUpdatesFile)
                    +',"launchpadId":'+ util.escapeString(property("launchpadUniqueId"))
                    +',"launchpadUpdateSite":'+util.escapeString(launchpadUpdateSite) +'}}';
		

        top.writeTextFile(requestFile, request, false, "ASCII");

	}
//, 
//Uncomment above comma and add comma-separated functions here. Do not leave a 
// trailing comma after last element.			
});