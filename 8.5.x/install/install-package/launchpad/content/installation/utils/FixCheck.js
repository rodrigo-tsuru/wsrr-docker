// Licensed Materials - Property of IBM
// 5724-M24 
// Copyright IBM Corporation 2011. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("installation.utils.FixCheck");

/*
 * Check for fixes
 */
dojo.declare("installation.utils.FixCheck", null, {

	constructor: function(){
    },
    
    /*
     * Code to run to execute this step
     */
    execute: function(){
   		var now = new Date().getTime();
    	var filename = "GetFixes_"+ now + ".json";
    	
        var tempFile = installation.utils.InstallUtils.getPersistedTempFilename(filename);        
        var tempDir = installation.utils.InstallUtils.getPersistedTempDirectory();      
                
        var result = tempFile.search(".json"); 
        
        var responseFile = '';
        	
        if(result != "-1")
        {
        	responseFile = tempFile.substring(0, result);
        }
        
        responseFile = responseFile + ".response.json";
                
        
        var bpmUpdatesFile = "bpm_updates.properties";
        var targetDirectory = tempDir;   
        var token = "";
        var instOfferingId = '';   
        var versionToken = property('product.update.token');

        switch (top.diskLabel.edition) {
           case "BPM_STARTER":{
               token = "bpmexp";
               instOfferingId = property(top.diskLabel.edition + ".offering.id");
               break;
           }
           case "BPM_STAND":{
               token = "bpmstd";
               instOfferingId = property(top.diskLabel.edition + ".offering.id");
               break;
           }
           case "BPM_PC":{
               token = "bpmadv";
               instOfferingId = property(top.diskLabel.edition + ".offering.id");
               break;
           }
           case "BPM_WPS":{
               token = "bpmadv";
               instOfferingId = property(top.diskLabel.edition + ".offering.id");
               break;
           }
           case "WSRR":{
               token = "wsrr";
               instOfferingId = property(top.diskLabel.edition + ".offering.id");
               break;
           }
           default:
            {
            throw "Unknown Edition " + top.diskLabel.edition;
            }
        }
        var productRepository = top.formatmsg(property('product.repository'), token , versionToken); 
        
        var request = '{ "method": "GET_FIXES",  "data": {"ifixUpdateSite":'+ top.escapeString(productRepository)
        			+',"targetDirectory":'+ top.escapeString(targetDirectory)
        			+',"bpmUpdatesFile":'+ top.escapeString(bpmUpdatesFile)
        			+',"fixpackUpdateSite":'+	top.escapeString(productRepository)
        			+',"instOfferingId":'+ top.escapeString(instOfferingId)
        			+',"instVersion":'+ top.escapeString("7.5.1000")
        			+',"wasOfferingId":'+ top.escapeString(property("wasOfferingId"))
        			+',"wasVersion":'+ top.escapeString(property("wasVersion")) +'}}';
        
        top.writeTextFile(tempFile, request, false, "ASCII");
        top.runProgram("DISK1", command("runJavaMethod", top.IMAGEDIR, tempFile), FOREGROUND, HIDDEN);
        
        var responseText = top.readTextFile(responseFile, "ASCII");
        
        if (null == responseText) {
            return;
        }
        var response = eval("(" + responseText + ")");
        if (response.result == "FAIL") {
            return;
        }
        
        top.updates = response.data;
		
		return responseFile;
},

/*
 * Returns true if the step has completed, false otherwise
  */
    isDone: function(filename){
    	
    	if(filename == null)
    	{
    		return false;
    	}
    	
    	var exists = top.fileExists(filename);
    	   	
        return exists;
    }

});
