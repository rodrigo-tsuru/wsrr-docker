// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
// Copyright IBM Corporation 2011, 2012. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.require("installation.utils.Logger");
dojo.provide("installation.utils.InstallUtils");

/*
 * This class has utility methods for installation that will work operating system and browser independent.
 */


/*
 * Returns true if the current user is a root or admin user, false otherwise
 */
installation.utils.InstallUtils.isAdmin = function(){
    var failMessage = property("log.error.admin");
    try {
        var tempFile = installation.utils.InstallUtils.getPersistedTempFilename("checkAdmin.response.json");
        logger.logMessage(property("log.info.request.file") + " " + tempFile);
        var programName = "checkAdmin";
        if (top.OS == 'SunOS') {
            programName = "checkAdminSolaris";
        }
        top.runProgram("DISK1", command(programName, top.IMAGEDIR, tempFile), FOREGROUND, HIDDEN);
        var responseText = top.readTextFile(tempFile, "ASCII");
        if (null == responseText) {
            logger.logMessage(top.formatmsg(property("log.error.file"), tempFile));
            throw failMessage;
        }
        var response = dojo.fromJson(responseText);
        return response.isAdmin;
    } 
    catch (exception) {
        logger.logMessage(top.formatmsg(property("log.error"), exception));
        logger.logMessage(failMessage);
    }
};

/*
 * Checks whether the 32-bit of GTK is installed and returns the check response json
 */
installation.utils.InstallUtils.checkGTK = function(){
    var failMessage = property("log.error.gtk");
    try {
        if (top.OSTYPE == 'windows') {
            return {ignore:true, passed:true};
        }
        if (!logger) {
            // Setup logger
            var now = new Date().getTime();
            logger = new installation.utils.Logger("checkGTK_"+now+".log");
        }
        var tempFile = installation.utils.InstallUtils.getPersistedTempFilename("checkGTK.response");
        logger.logMessage(property("log.info.gtk") + " " + tempFile);
	    var imPath = top.getIMDiskLocation();
	    top.runProgram("DISK1", command("checkGTK", tempFile, top.IMAGEDIR, imPath), FOREGROUND, HIDDEN);
        var responseText = top.readTextFile(tempFile);
        if (null == responseText) {
            logger.logMessage(top.formatmsg(property("log.error.file"), tempFile));
            throw failMessage;
        } else {
            logger.logMessage(property("log.info.response") + responseText);
        }
        var response = dojo.fromJson(responseText);
        if (response.ignore) {
          logger.logMessage(property("log.info.gtk.ignore"));
        } else {
          logger.logMessage(property("log.info.gtk.done"));
          if (!response.passed) {
               alert(response.message);
          }
        }
        return response;
    } 
    catch (exception) {
        if (logger) {
            logger.logMessage(top.formatmsg(property("log.error"), exception));
        	logger.logMessage(failMessage);
        }
    }
};

/*
 * Returns true if any DB2 Product is installed on this machine, false otherwise
 */
installation.utils.InstallUtils.isDb2Installed = function(){
    var failMessage = property("log.error.db2");
    try {
        var tempFile = installation.utils.InstallUtils.getPersistedTempFilename("checkDB2.response.json");
        logger.logMessage(property("log.info.request.file") + " " + tempFile);
        top.runProgram("DISK1", command("checkDB2", tempFile), FOREGROUND, HIDDEN);
        var responseText = top.readTextFile(tempFile, "ASCII");
        if (null == responseText) {
            logger.logMessage(top.formatmsg(property("log.error.file"), tempFile));
            throw failMessage;
        }
        var response = dojo.fromJson(responseText);
        if (response.isInstalled) {
            logger.logMessage(property("log.info.db2.exists"));
        }
        else {
            logger.logMessage(property("log.info.db2.not.exist"));
        }
        return response.isInstalled;
    } 
    catch (exception) {
        logger.logMessage(top.formatmsg(property("log.error"), exception));
		logger.logMessage(failMessage);
    }
};

/*
 * Returns the current ulimit
 */
installation.utils.InstallUtils.getUlimit = function(){
    var failMessage = property("log.error.ulimit");
    try {
        var tempFile = installation.utils.InstallUtils.getPersistedTempFilename("ulimit.response.json");
        logger.logMessage(property("log.info.request.file") + " " + tempFile);
		if (top.OS == 'SunOS') {
		    top.runProgram("DISK1", command("checkUlimitSolaris", tempFile), FOREGROUND, HIDDEN);
        }
		else {
		    top.runProgram("DISK1", command("checkUlimit", tempFile), FOREGROUND, HIDDEN);
		}
        var responseText = top.readTextFile(tempFile, "ASCII");
        if (null == responseText) {
            logger.logMessage(top.formatmsg(property("log.error.file"), tempFile));
            throw failMessage;
        }
        var response = parseInt(responseText);
        logger.logMessage(property("log.info.ulimit") + " " + response);
        return response;
    } 
    catch (exception) {
        logger.logMessage(top.formatmsg(property("log.error"), exception));
    	logger.logMessage(failMessage);
    }
};

/*
 * Returns true if string ends with suffix, otherwise false
 */
installation.utils.InstallUtils.endsWith = function(str, suffix){
    return str.indexOf(suffix, str.length - suffix.length)!== -1;
};




/*
 * Returns the DB2 port for the given instance
 */
installation.utils.InstallUtils.getDB2Port = function(instance){
    logger.logMessage(property("log.info.db2.request.port") + instance);
    
    var request = {
        method: "GET_DB2PORT",
        data: {
            servicename: "db2c_"+instance
        }
    };
    
    var now = new Date().getTime();
    var response = installation.utils.InstallUtils.runJavaMethod(request, "GetDB2Port_"+ now + ".json");
    if (null == response) {
        logger.logMessage(property("log.warning.default.port"));
        return "50000";
    }
    else {
        logger.logMessage(property("log.info.port") + " " + response);
        return response;
    }
};

/*
 * Returns the DB2 port for the given instance
 */
installation.utils.InstallUtils.encryptPassword = function(plaintext_pw) {
    // do not log plaintext passwords by default
	//logger.logMessage("log.info.plaintext_pw" + plaintext_pw);
	var failMessage = "encryptPassword error";
	try {
		var tempFile = installation.utils.InstallUtils.getPersistedTempFilename("encryptPassword.response.json");
		logger.logMessage(property("log.info.request.file") + " " + tempFile);
		var imutilscCommand = top.STARTINGDIR + top.PATHSEPARATOR + 'IM' + top.PATHSEPARATOR + 'tools' + top.PATHSEPARATOR + 'imutilsc';
		var options = '-silent -noSplash encryptString ' + plaintext_pw;

		top.writeTextFile(tempFile, imutilscCommand, false, "ASCII");
		top.runProgram("DISK1", command("runCommand", imutilscCommand, options, tempFile), FOREGROUND, HIDDEN);

		var responseText = top.readTextFile(tempFile+".sysout", "ASCII");
		if (null == responseText) {
			logger.logMessage(top.formatmsg(property("log.error.file"),	tempFile));
			logger.logMessage(failMessage);
			throw failMessage;
		}
		var response = String(responseText);
		response = dojo.trim(response);
		logger.logMessage("encrypted_Pwd " + response);
		return response;
	} catch (exception) {
		logger.logMessage(failMessage);
		logger.logMessage(top.formatmsg(property("log.error"), exception.message));
		throw failMessage;
	}
};

/*
 * Returns true if the OS on this machine supports DB2, false otherwise
 */
installation.utils.InstallUtils.isValidDb2OperatingSystem = function(){
    if (top.isWindows()) {
        logger.logMessage(property("log.info.db2.valid.os"));
        return true;
    }
    
    if (top.OS == "Linux" && (top.ARCHITECTURE == "x86" || top.ARCHITECTURE == "IA64" || top.ARCHITECTURE == "AMD64")) {
        logger.logMessage(property("log.info.db2.valid.os"));
        return true;
    }
    
    logger.logMessage(property("log.info.db2.invalid.os"));
    return false;
};

/*
 * Returns the minimum freespace needed for installation of the product.
 */
installation.utils.InstallUtils.getProductInstallSize = function(data, type){

    // Set default install size.
    var installSize = -1;
    
    // Get product install size.
    var sizeProperty = data.edition;
    if (sizeProperty == "BPM_PC") {
        sizeProperty += ("." + type);
    }
    sizeProperty += ".size";
    
    // Set initial required size.
    installSize = parseInt(property(sizeProperty));
    
    return installSize;
};

/*
 * Runs a jdbc test with the given data and error string.
 */
installation.utils.InstallUtils.testConnection = function(dbType, dbHost, dbPort, dbName, dbUser, dbPass, dbWinAuth){

    var request = {
        method: "TEST_DATABASE",
        data: {
            dbType:    dbType,
            dbHost:    dbHost,
            dbPort:    dbPort + "",
            dbName:    dbName,
            dbUser:    dbUser,
            dbPass:    dbPass,
            dbWinAuth: dbWinAuth
        }
    };
    
    var now = new Date().getTime();
    var response = installation.utils.InstallUtils.runJavaMethod(request, "testConnection_" + now + ".json");
    
    // No data or error data came back
    if (null == response) {
        return "jdbc";
    }
    
    // The database doesn't exist
    if (!response.doesExist) {
        return "jdbc";
    }
    
    // The database already has tables setup.
    if (response.hasTables) {
        return "hasTables";
    }
    
    // For DB2, check the 32K pagesize and dbAdm permissions as well.
    if (dbType == "DB2" && top.diskLabel.edition != "WSRR") {
        if (response.pageSize <= 32767) {
            return "pageSize";
        }
        
        if (!response.isDbAdm) {
            return "dbAdm";
        }
    }
    
    // No errors, the connection went fine.
    return "";
};

/*
 *
 */
 
installation.utils.InstallUtils.isValidDoneFile = function(file){
	logger.logMessage("I: start of isValidDoneFile method");
	
		var exits = top.fileExists(file + ".done");
		var doneFile;
		var doneStatus;
		var valid  = false;
		if(exits){
			doneFile = top.readTextFile(file + ".done", "ASCII");
			doneStatus = dojo.fromJson(doneFile);
			
			if(doneStatus.isSuccess){
				valid = true;
				return valid;
			}
		}
	
	logger.logMessage("I: End of isValidDoneFile method with return Value"+valid);	
		
	return valid;
};

/*
 * Kicks off profile creation.
 */
installation.utils.InstallUtils.createProfile = function(manageprofilesCommand, options, profileFilename){
    var failMessage = property("log.error.profile");
    try {
        logger.logMessage(property("log.info.profile.create"));
        
        // If this is windows, then the manageprofiles command will exit the shell if not called.
        if (top.isWindows()) {
            manageprofilesCommand = "call " + manageprofilesCommand;
        }
        top.runProgram("DISK1", command("runCommand", manageprofilesCommand, options, profileFilename), BACKGROUND, HIDDEN);
    } 
    catch (exception) {
        logger.logMessage(top.formatmsg(property("log.error"), exception));
		logger.logMessage(failMessage);
    }
};

/*
 * Check file size progress.
 */
installation.utils.InstallUtils.checkFileProgress = function(file, expectedSize){

    // Get the size of the file.
    var size = top.getFileSize(file);
    
    // Compare against the expectedSize.
    var percent = size / expectedSize;
    
    // Return a maximum of 99%
    var progress = Math.min(percent, 0.99);
    return progress;
};

/*
 * Returns the string hostname of this computer
 */
installation.utils.InstallUtils.getHostname = function(){
    logger.logMessage(property("log.info.request.hostname"));
    
    var request = {
        method: "GET_HOSTNAME"
    };
    
    var response = installation.utils.InstallUtils.runJavaMethod(request, "getHostname");
    if (null == response) {
        logger.logMessage(property("log.warning.default.host"));
        return "";
    }
    else {
        logger.logMessage(top.formatmsg(property("log.info.hostname"), response));
        return response;
    }
};

/*
 * Open a file selection dialog box and returns the selected directory or null if none chosen.
 */
installation.utils.InstallUtils.openBrowseDialog = function(){

    logger.logMessage(property("log.info.request.browse"));
    
    var path;
    if (top.BROWSER == 'IExplore') {
        try {
            var oFolder = new Object;
            var shellApp = new ActiveXObject("Shell.Application");
            var oFolder = shellApp.BrowseForFolder(0, "", 0);
            var oFolderItem = new Object;
            oFolderItem = oFolder.Items().Item();
            path = oFolderItem.Path;
        } 
        catch (e) {
            top.logException(e, arguments);
        }
    }
    else {
        try {
            var browseDialog = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
            browseDialog.init(window, "", browseDialog.modeGetFolder);
            if (browseDialog.show() != browseDialog.returnCancel) 
                path = browseDialog.file.path;
        } 
        catch (e) {
            top.logException(e, arguments);
        }
    }
    return path;
};

/*
 * Unzips the given file to the target directory
 */
installation.utils.InstallUtils.unzip = function(zipFile, targetDirectory){
    logger.logMessage(top.formatmsg(property("log.info.unzip"), zipFile, targetDirectory));
    
    var request = {
        method: "UNZIP_FILE",
        data: {
            zipFile: encodeURIComponent(zipFile),
            targetDirectory: encodeURIComponent(top.getEnv('LaunchPadTemp'))
        }
    };
    
    var response = installation.utils.InstallUtils.runJavaMethod(request, "unzip");
    return response;
};


/*
 * Function which check for product updates from bpm_updates.properties
 * @pending - try catch 
 */
installation.utils.InstallUtils.getLocalProductUpdatesRepositories = function(){
	
	var bpmUpdatesFile = "bpm_updates.properties";
	var request = '';
	var productRepository ='';
	var wasRepository = property('was.repository');
	
	logger.logMessage("I: Fetching local Fix packs and Fixes"); 
    
    productRepository = installation.utils.InstallUtils.getProductRepository();	
    	

    request = { method: "GET_AVAILABLE_REPOSITORIES", data : {
		wasLiveUpdateSite: wasRepository,
		bpmLiveUpdateSite: productRepository,
		bpmUpdatesFile: bpmUpdatesFile
		
		}};

	var now = new Date().getTime();
	var response = installation.utils.InstallUtils.runJavaMethod(request, "GetLocalProductsUpdates_"+ now + ".json");
	if (null == response) {
	    logger.logMessage("W: runJavaMethod returned null while fetching local Fix Packs and Fixes"); 
	    return response;
	}
	else {
	    logger.logMessage("I: runJavaMethod returned the following local Fix Packs and Fixes" + response); 
	    return response;
	}
	
};

/*
 * Function which gets applicable fixpacks using IBM IM imcl interface 
 * @pending: try catch
 */

installation.utils.InstallUtils.getAvailableFixPacks = function(intermediatePassword,keyRingLocation,repositories,logName,callback){
	
	var command = '';
	var options;
	var returnValue = false;
	
	logger.logMessage("I: Get available Fixpacks"); 
	
	command = ' listAvailablePackages';
	
	options = '	-repositories ' + repositories +
			  ' -long';
			//' -useServiceRepository ' +  
			  
	if(keyRingLocation!=null){
		
		options = options + ' -keyring ' + keyRingLocation +
			  ' -password ' + intermediatePassword;
	}
	
	var imProps = top.getInstallManagerProperties();
	
	if(imProps == null){
		options = options + ' -datalocation '+ top.getPersistedTempDirectory();
		// parameter to resolve if there exist an Installed IM failure
	}
		
	var response = installation.utils.InstallUtils.runImclBaseImplementation(command, options,BACKGROUND,logName,callback);

		if (null == response) {
        logger.logMessage("W: runImclBaseImplementation returned null while authenticating"); 
        return response;
    	}
	
	returnValue = true; // Call executing successfull
	
	logger.logMessage("I: End of get available Fixpacks");	
		
	return returnValue;
};

/*
 *  Function which gets available fixes using IBM IM imcl interface
 */

installation.utils.InstallUtils.getAvailableFixes = function(intermediatePassword, keyRingLocation, logName, offeringId, offeringRepository,callback){

	logger.logMessage("I: Get available Fixes"); 
	
	var command = '';
	var returnValue = false;
	
	command = ' listAvailableFixes ';
	
	options = offeringId  +
			  ' -repositories ' + offeringRepository+
			  ' -long';
			  
			 // ' -useServiceRepository ' + 
	if(keyRingLocation!=null){
			options = options + ' -keyring ' + keyRingLocation +
			  ' -password ' + intermediatePassword;
			  
	}
	
	var imProps = top.getInstallManagerProperties();
	
	if(imProps == null){
		options = options + ' -datalocation '+ top.getPersistedTempDirectory();
		// parameter to resolve if there exist an Installed IM failure
	}
	
	var response = installation.utils.InstallUtils.runImclBaseImplementation(command, options,BACKGROUND, logName, callback);
	
		if (null == response) {
        logger.logMessage("W: runImclBaseImplementation returned null while authenticating"); 
        return response;
    	}

	returnValue = true;
		
	logger.logMessage("I: End of get available Fixes");
	
	return returnValue;
};

/*
 * Get offering info from ESD or DVD
 */
installation.utils.InstallUtils.getInstallOfferingInfo = function(){
	
	logger.logMessage("I: At the beginning of getInstallOfferingInfo");
	var request ='';
	var prefix;
	
	 if(top.OSTYPE == 'windows'){
	 	prefix = 'file:\\';
	 }else{
	 	//unix
	 	prefix = 'file://';
	 }

	 var WASimRepositoryLocation = prefix + top.IMAGEDIR + 'repository' + top.PATHSEPARATOR + property('WAS.RepositoryFolderName') + top.PATHSEPARATOR + 'repository.xml';
	 var WSRRimRepositoryLocation = prefix + top.IMAGEDIR + 'repository' + top.PATHSEPARATOR + property('WSRRServer.RepositoryFolderName') + top.PATHSEPARATOR + 'repository.xml';
			 
	 
			 
	  request = {method: "GET_INSTALL_OFFERINGS_INFO", data : {
		 	wasInstallRepositoryXmlFile: WASimRepositoryLocation,
		 	instInstallRepositoryXmlFile: WSRRimRepositoryLocation
			}};
	 
	 logger.logMessage("I: Get InstallingOfferingInfo"); 

		var now = new Date().getTime();
		var response = installation.utils.InstallUtils.runJavaMethod(request, "GetInstallOfferingInfo_"+ now + ".json");
		logger.logMessage("I: runJavaMethod returned the following InstallingOfferingInfo " +response); 
		//response can be null
		logger.logMessage("I: At the end of getInstallOfferingInfo");
	
	return response;	
}; 
 

/*
 * Function which gets the products live update repositories or urls
 */

installation.utils.InstallUtils.getProductRepository = function(){

	logger.logMessage("I: At the beginning of GetProductRepository");
	
	var productRepository;
	var token = '';
	var versionToken = property('product.update.token');
	
	
	switch (top.diskLabel.edition) {
       case "BPM_STARTER":{
           token = "bpmexp";
           break;
       }
       case "BPM_STAND":{
           token = "bpmstd";
           break;
       }
       case "BPM_PC":{
           token = "bpmadv";
           break;
       }
       case "BPM_WPS":{
           token = "bpmadvps"; 
           break;
       }
       case "WSRR":{
           token = "wsrr";
           break;
       }
       default:
        {
        throw "Unknown Edition " + top.diskLabel.edition; //TODO - no throws to browser
        }
    }
		
	productRepository = top.formatmsg(property('product.repository'), token , versionToken);	
	
	logger.logMessage("I: At the end of GetProductRepository");
	
	return productRepository;
};

/*
 * 
 */

installation.utils.InstallUtils.getProductOffering = function(){

	logger.logMessage("I: At the beginning of GetProductOffering");
	var productOffering;
	var installingOfferingInfoResponse = installation.utils.InstallUtils.getInstallOfferingInfo();
	
	if(installingOfferingInfoResponse!= null && installingOfferingInfoResponse.instOfferingVersion!=null)
	{
			switch (top.diskLabel.edition) {
		       case "BPM_STARTER":
		       case "BPM_STAND":
		       case "BPM_PC":
		       case "BPM_WPS":
		       {
		           productOffering = installingOfferingInfoResponse.instOfferigId+ '_'+installingOfferingInfoResponse.instOfferingVersion;
		           break;
		       }
		       default:
		        {
		        	productOffering ="";
		        	break;
		        }
		    }
	}else{
	
		productOffering ="";
	}
	logger.logMessage("I: At the end of GetProductOffering "+ productOffering);	
	return productOffering;
};

/*
 * GetApplicableFixPacks filters the available fix packs
 * @pending - try catch
 */
installation.utils.InstallUtils.getApplicableFixPacks = function (availableFixPacksOutputFile,logName){

	 var request ='';
	 var instOfferingId ='';
	 var instVersion = property('instVersion');
	 var wasOfferingId = property('wasOfferingId');
	 var wasVersion = property('wasVersion');
	 
	 logger.logMessage("I: Get Applicable Fix Packs"); 
	 
	 if(top.diskLabel.edition){
	 instOfferingId = property(top.diskLabel.edition + ".offering.id");
	 }
	 

	 request = { method: "GET_APPLICABLE_FIXPACKS", data : {
		 	availableUpdatesFile: availableFixPacksOutputFile,
		 	instOfferingId: instOfferingId,
		 	instVersion: instVersion,
		 	wasOfferingId: wasOfferingId,
		 	wasVersion: wasVersion
			}};

		var now = new Date().getTime();
		var response = installation.utils.InstallUtils.runJavaMethod(request, logName);
		if (null == response) {
		    logger.logMessage("W: runJavaMethod returned null while obtaining applicable Fix Packs"); 
		    return response;
		}
		else {
		    logger.logMessage("I: runJavaMethod returned the following applicable Fix Packs" + response); 
		    return response;
		}

		 logger.logMessage("I: At the end of Get Applicable Fix Packs"); 

};

/*
 * getApplicableFixes filter available fixes
 * @pending try catch 
 */

installation.utils.InstallUtils.getApplicableFixes = function (availableWasFixes,availableBPMFixes,logName){
		
	 var request ='';
	 
	 logger.logMessage("I: Get Applicable iFixes"); 
	 
	 
	 request = { method: "GET_APPLICABLE_FIXES", data : {
		 	wasFixesFile: availableWasFixes,
		 	bpmFixesFile: availableBPMFixes
			
			}};

		var now = new Date().getTime();
		var response = installation.utils.InstallUtils.runJavaMethod(request, logName);
		if (null == response) {
		    logger.logMessage("W: runJavaMethod returned null while obtaining applicable iFixes"); 
		    return response;
		}
		else {
		    logger.logMessage("I: runJavaMethod returned the following applicable iFixes" + response); 
		    return response;
		}

	 logger.logMessage("I: At the end of Get Applicable iFixes"); 
};

installation.utils.InstallUtils.baseCommandImplementation = function(fullCommand, options,mode,logName,callback){

	 var script;
     var scriptName;
     var returnValue = false;
	
	 var failMessage = "unable to execute command";
	 try {
		 
		 logger.logMessage("executing base command implementation");
		 
		 	if (top.isWindows()) 
		 	{
		        //Contents of Script to write
		       	script="\"" + fullCommand + "\" " + options;
		       	
		       	//Script name
		       	scriptName = logName + ".bat";
		       	
		       	//Write script to temp directory
		       	top.writeTextFile(scriptName, script, false, "ASCII");
		       	
		       	//Run imcl script, passing " " since there are no additional options
		       	top.runProgram("DISK1", command("runIM", scriptName, logName), BACKGROUND, HIDDEN , null, null , callback);
		       	returnValue = true;
		 	}
		    else
		    {
		    	script = fullCommand + options;
		    	scriptName = logName + ".sh";
		    	top.writeTextFile(scriptName,script,false,"ASCII");
		    	top.runProgram("DISK1", command("runDynamicCommand", scriptName, logName), mode, HIDDEN , null, null , callback);
		    	returnValue = true;
		    }
	} 
    catch (exception) {
        logger.logMessage(top.formatmsg(property("log.error"), exception));
		logger.logMessage(failMessage);
		return null;
    }
    
    logger.logMessage("At the end of base command implementation");
    
    return returnValue;
};


/*
 *  IMCL [<command>] [<options>]
 *  @url: https://radical.rtp.raleigh.ibm.com/capilano/89010-ibm.html
 *  @pending - all paramter check before execution, callback, runProgram return value
 */
installation.utils.InstallUtils.runImclBaseImplementation = function(command, options,mode, logName, callback){
	var failMessage = property("log.error.imcl");
	var imclCommand = '';
	var returnValue = false;
	try{
	       	logger.logMessage(property("log.info.imcl"));

	       	var imProps = top.getInstallManagerProperties();
	       	
	       	//If IM is not found or needs to be updated, imProps will be null
	       	//In this case use IM from disk image, otherwise use IM from location found on system
	       	if(imProps == null)
	       	{
	       		var imPath = top.getIMDiskLocation();
	       		imclCommand = imPath + top.PATHSEPARATOR + 'tools' + top.PATHSEPARATOR + 'imcl';
	       	}
	       	else
	       	{
	        	imclCommand = imProps.location + top.PATHSEPARATOR + 'eclipse' + top.PATHSEPARATOR + 'tools' + top.PATHSEPARATOR + 'imcl';
	        }
	       	
	       	options = command + options;
	       	    	
	       	var response = installation.utils.InstallUtils.baseCommandImplementation(imclCommand, options,mode,logName, callback);
	       	
	       	if (null == response) {
	            logger.logMessage("W: BaseCommandImplementation returned null while authenticating"); 
	            return response;
	        }
	        
	        returnValue = true;
	
	}catch (exception) {
        logger.logMessage(top.formatmsg(property("log.error"), exception));
		logger.logMessage(failMessage);
    }
	
	logger.logMessage("At the end of runBaseImclImplementation");
	return returnValue;
};


installation.utils.InstallUtils.runSaveCredential = function(userName, password, logName, keyringLocation, callback){
	
	logger.logMessage("I: Running Save Credential");
	
    var command = '';
    var wasRepository = property('was.repository');
    var options	= '';
    var returnValue = false;
    var imProps = top.getInstallManagerProperties();
    
    
    //If IM is not found or needs to be updated, imProps will be null
   	//In this case use IM from disk image, otherwise use IM from location found on system
   	
    if(imProps == null)
   	{	
   		var imPath = top.getIMDiskLocation();
    	command = imPath + top.PATHSEPARATOR + 'tools' + top.PATHSEPARATOR + 'imutilsc';
   	}
   	else
   	{
    	command = imProps.location + top.PATHSEPARATOR + 'eclipse' + top.PATHSEPARATOR + 'tools' + top.PATHSEPARATOR + 'imutilsc';
    }
	   	
    /*
     * userName, password, logName, keyringLocation
     */

   	options = ' saveCredential'+
   			  ' -url ' + wasRepository +
   			  ' -userName ' +  userName +      
   			  ' -userPassword ' + password +                                 
   			  ' -keyring ' + keyringLocation +
   			  ' -password ' + 'test' +
   			  ' -verbose';
   	
   	var response = installation.utils.InstallUtils.baseCommandImplementation(command, options,BACKGROUND, logName, callback);
       	
   	if (null == response) {
        logger.logMessage("W: BaseCommandImplementation returned null while authenticating at runSaveCredential"); 
        return response;
    }
   	
   	returnValue = true;

    logger.logMessage("At the end of Save Credential");
   	
   	return returnValue;
};

installation.utils.InstallUtils.runImcl = function(id, location, repository, properties, logName, callback){
    var failMessage = property("log.error.imcl");
    try {
        logger.logMessage(property("log.info.imcl"));
       
       	var imProps = top.getInstallManagerProperties();

		var imclCommand = '';
       	
       	//If IM is not found or needs to be updated, imProps will be null
       	//In this case use IM from disk image, otherwise use IM from location found on system
       	if(imProps == null)
       	{
       		imclCommand = top.IMAGEDIR + top.PATHSEPARATOR + 'IM' + top.PATHSEPARATOR + 'tools' + top.PATHSEPARATOR + 'imcl';  	
       	}
       	else
       	{
        	imclCommand = imProps.location + top.PATHSEPARATOR + 'eclipse' + top.PATHSEPARATOR + 'tools' + top.PATHSEPARATOR + 'imcl';
        }
        
       var options='';
        
        logger.logMessage(top.formatmsg(property("log.info.imcl.id"), id));
        logger.logMessage(top.formatmsg(property("log.info.imcl.location"), location));
        logger.logMessage(top.formatmsg(property("log.info.imcl.repository"), repository));
                
        options = "install " + id + " -acceptLicense -repositories " + repository + " -showVerboseProgress -log " + logName +".log";
        
        //no need to pass -accessRights, imcl will default value based on current user permissions
        
        if(location != '')
        {
        	options = options + " -installationDirectory " + location;
        }
        
        if(properties != '')
        {
        	options = options + " -properties " + properties;
        }
        
        if(top.addKeyringOption && top.keyRingStep){
        	options = options + " -keyring " + top.keyRingLocation+
        	" -password " + "test";

        	}
         
        if (top.isWindows()) 
        {
            //Contents of Script to write
           	instCmd="\"" + imclCommand + "\" " + options;
           	
           	//Script name
           	instScript = logName + ".bat";
           	
           	//Write script to temp directory
           	top.writeTextFile(instScript, instCmd, false, "ASCII");
           	
           	//Run imcl script, passing " " since there are no additional options
           	top.runProgram("DISK1", command("runIM", instScript, logName), BACKGROUND, HIDDEN , null, null , callback);
        }
        else
        {
            top.runProgram("DISK1", command("runCommand", imclCommand, options, logName), BACKGROUND, HIDDEN , null, null , callback);
        }
    } 
    catch (exception) {
        logger.logMessage(top.formatmsg(property("log.error"), exception));
		logger.logMessage(failMessage);
    }
};


/*
 * Get current user home directory
 */

installation.utils.InstallUtils.getUserHomeDirectory = function(userid){
    var request = {
        method: "GET_USERHOMEDIRECTORY",
        data: { userid:userid}
    };
    
    var now = new Date().getTime();
    var response = installation.utils.InstallUtils.runJavaMethod(request, "getUserHomeDirectory_" + now + ".json");
    return response;
};


/*
 * Returns a boolean value based on userId existence
 */
installation.utils.InstallUtils.doesUidExist = function(userid,platform){
    var request = {
        method: "DOES_USERID_EXIST",
        data: { userid:userid, platform: platform}
    };
    
    var now = new Date().getTime();
    var response = installation.utils.InstallUtils.runJavaMethod(request, "doesUidExist_" + now + ".json");
    return response;
};


/*
 *  validates password against system password policy
 */
installation.utils.InstallUtils.isPasswordValid = function(programLocation,userId,password,platform){
    var request = {
        method: "TEST_PASSWORD",
        data: { userid:userId,
        		password:password,
        		platform:platform,
        		location:programLocation}
    };
    
    var now = new Date().getTime();
    var response = installation.utils.InstallUtils.runJavaMethod(request, "validatePassword_" + platform + "_"+ now + ".json");
    return response;
};

/*
 * verifies password for correctness
 */

installation.utils.InstallUtils.verifyPassword = function(programLocation,userId,password,platform){
    var request = {
        method: "TEST_PASSWORD",
        data: { userid:userId,
        		password:password,
        		platform:platform,
        		location:programLocation}
    };
    
    var now = new Date().getTime();
    var response = installation.utils.InstallUtils.runJavaMethod(request, "verifyPassword_" + platform + "_"+ now + ".json");
    return response;
};



/*
 * Returns a directory information object containing
 * boolean: isEmpty
 * boolean: isReadable
 * boolean: isWritable
 * long:	availableSize (in MB)
 */
installation.utils.InstallUtils.getDirectoryInfo = function(directory,operation){
    var request = {
        method: "TEST_DIRECTORY",
        data: { location:encodeURIComponent(directory), operation: operation}
    };
    
    var now = new Date().getTime();
    var response = installation.utils.InstallUtils.runJavaMethod(request, "getDirectoryInfo_" + now + ".json");
    return response;
};

/*
 * Returns the canonical form of this filename.
 */
installation.utils.InstallUtils.getCanonicalFilename = function(filename){

    // Nothing to do on a non-windows system.
    if (!top.isWindows()) {
        return filename;
    }
    
    logger.logMessage(property("log.info.request.canonical") + " " + filename);
    
    var request = {
        method: "GET_CANONICAL_PATH",
        data: encodeURIComponent(filename)
    };
    
    var now = new Date().getTime();
    var response = installation.utils.InstallUtils.runJavaMethod(request, "getCanonicalForm_" + now + ".json");
    if (null == response) {
        logger.logMessage("E: Failure getting canonical form");
        return filename;
    }
    else {
        var canonicalFilename = decodeURIComponent(response);
        logger.logMessage(property("log.info.canonical") + " " + canonicalFilename);
        return canonicalFilename;
    }
};

/*
 * Run the given java method.
 */
installation.utils.InstallUtils.runJavaMethod = function(request, filename){
    var failMessage = property("log.error.java.execute");
    try {
        var tempFile = installation.utils.InstallUtils.getPersistedTempFilename(filename);
        logger.logMessage(property("log.info.request.file") + " " + tempFile);
        top.writeTextFile(tempFile, dojo.toJson(request), false, "ASCII");
        var imPath = top.getIMDiskLocation();
        top.runProgram("DISK1", command("runJavaMethod", top.STARTINGDIR, tempFile,imPath), FOREGROUND, HIDDEN);
        
        //remove ending .json from file name
        result = tempFile.search(".json");
        
        if(result != "-1")
        {
        	tempFile = tempFile.substring(0, result);
        }
        
        var responseText = top.readTextFile(tempFile + ".response.json", "ASCII");
        if (null == responseText) {
            logger.logMessage(top.formatmsg(property("log.error.file.json"), tempFile));
            throw failMessage; 
        }
        logger.logMessage(property("log.info.java") + " " + responseText);
        var response = dojo.fromJson(responseText);
        if (response.result == "FAIL") {
            logger.logMessage(property("log.error.java"));
            throw response;
        }
        logger.logMessage(property("log.info.java.success"));
        return response.data;
    } 
    catch (exception) {
        logger.logMessage(top.formatmsg(property("log.error"), exception));
        logger.logMessage(failMessage);
        return null;
    }
};
