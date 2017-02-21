// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
// Copyright IBM Corporation 2011, 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.require("com.ibm.bpm.install.utils.Logger");
dojo.provide("com.ibm.bpm.install.utils.InstallUtils");

dojo.require("com.ibm.bpm.install.SOEFactory");
dojo.require("com.ibm.bpm.install.utils.InstallHelper");
dojo.require("com.ibm.bpm.install.utils.LoggerFactory");
dojo.require("com.ibm.bpm.install.serviceability.launchpad.LPServiceability");

dojo.require("dojox.data.XmlStore");

/*
 * This class has utility methods for installation that will work operating system and browser independent.
 */

// global variables to work with
com.ibm.bpm.install.utils.InstallUtils.bootStrap = function() {
    util = new com.ibm.bpm.install.utils.InstallHelper();
    osHelperFactory = new com.ibm.bpm.install.SOEFactory();
    osHelper = osHelperFactory.getOS(top.OS, top.ARCHITECTURE);
    loggerFactory = new com.ibm.bpm.install.utils.LoggerFactory();
    serviceability = new com.ibm.bpm.install.serviceability.launchpad.LPServiceability();

    // bootstrap activities
    // util.checkForSupportedBrowser();
    util.setupPreloadForEditions();
};

/*
 * Checks whether the 32-bit of GTK is installed and returns the check response json
 */
com.ibm.bpm.install.utils.InstallUtils.checkGTK = function() {
    var failMessage = property("log.error.gtk");
    try {
        if (top.OSTYPE == 'windows') {
            return {
                ignore: true,
                passed: true
            };
        }
        if (!logger) {
            // Setup logger
            var now = new Date().getTime();
            logger = new com.ibm.bpm.install.utils.Logger("checkGTK_" + now + ".log");
        }

        var tempFile = util.getPersistedTempFilename("checkGTK.response");
        logger.logMessage(property("log.info.gtk") + " " + tempFile);

        var imPath = osHelper.getIMDiskLocation();
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
com.ibm.bpm.install.utils.InstallUtils.isDb2Installed = function() {
    var failMessage = property("log.error.db2");
    try {
        var tempFile = util.getPersistedTempFilename("checkDB2.response.json");
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
        } else {
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
 * Returns the default Installation Manager Agent Data location
 */

// TODO : @MV come back to this one, looks like a duplicate code or not used currently
com.ibm.bpm.install.utils.InstallUtils.getDefaultInstallationManagerAgentDataLocation = function(isAdmin) {

    var agentDataLocation;
    if (top.OSTYPE == "windows") {
        if (isAdmin) {
            if (top.OS == "Windows_XP" || top.OS == "Windows_2003") {
                agentDataLocation = "C:\Documents and Settings\All Users\Application Data\IBM\Installation Manager";
            } else {
                agentDataLocation = "C:\ProgramData\IBM\Installation Manager";
            }
        } else {
            agentDataLocation = getEnv("APPDATA") + "\IBM\Installation Manager";
        }

    } else if (top.OSTYPE == "unix") {
        if (isAdmin) {
            agentDataLocation = "/var/ibm/InstallationManager";
        } else {
            agentDataLocation = getEnv("HOME") + "/var/ibm/InstallationManager";
        }
    }
    return agentDataLocation;
};

/*
 * Returns the current ulimit
 */
com.ibm.bpm.install.utils.InstallUtils.getUlimit = function() {
    var failMessage = property("log.error.ulimit");
    try {
        var tempFile = util.getPersistedTempFilename("ulimit.response.json");
        logger.logMessage(property("log.info.request.file") + " " + tempFile);
        if (top.OS == 'SunOS') {
            top.runProgram("DISK1", command("checkUlimitSolaris", tempFile), FOREGROUND, HIDDEN);
        } else {
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
 * �* Returns true if string ends with suffix, otherwise false �
 */
com.ibm.bpm.install.utils.InstallUtils.endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

/*
 * Returns the DB2 port for the given instance
 */
com.ibm.bpm.install.utils.InstallUtils.getDB2Port = function(instance) {
    logger.logMessage(property("log.info.db2.request.port") + instance);

    var request = {
        method: "GET_DB2PORT",
        data: {
            servicename: "db2c_" + instance
        }
    };

    var now = new Date().getTime();
    var response = com.ibm.bpm.install.utils.InstallUtils.runJavaMethod(request, "GetDB2Port_" + now + ".json");
    if (null == response) {
        logger.logMessage(property("log.warning.default.port"));
        return "50000";
    } else {
        logger.logMessage(property("log.info.port") + " " + response);
        return response;
    }
};

/*
 * Returns the DB2 port for the given instance
 */
com.ibm.bpm.install.utils.InstallUtils.encryptPassword = function(plaintext_pw) {
    // do not log plaintext password by default
    // logger.logMessage("log.info.plaintext_pw" + plaintext_pw);
    var failMessage = "encryptPassword error";
    try {
        var tempFile = util.getPersistedTempFilename("encryptPassword.response.json");
        logger.logMessage(property("log.info.request.file") + " " + tempFile);

        var imPath = osHelper.getIMLocation();

        var imutilscCommand = imPath + top.PATHSEPARATOR + 'tools' + top.PATHSEPARATOR + 'imutilsc';
        var options = '-silent -noSplash encryptString ' + plaintext_pw;

        top.writeTextFile(tempFile, imutilscCommand, false, "ASCII");
        top.runProgram("DISK1", command("runCommand", imutilscCommand, options, tempFile), FOREGROUND, HIDDEN);

        var responseText = top.readTextFile(tempFile + ".sysout", "ASCII");
        if (null == responseText) {
            logger.logMessage(top.formatmsg(property("log.error.file"), tempFile));
            logger.logMessage(failMessage);
            throw failMessage;
        }
        var response = String(responseText);
        response = dojo.trim(response);
        logger.logMessage("encrypted_Pwd " + response);
        return response;
    }
    catch (exception) {
        logger.logMessage(failMessage);
        logger.logMessage(top.formatmsg(property("log.error"), exception.message));
        throw failMessage;
    }
};

/*
 * Returns true if the OS on this machine supports DB2, false otherwise
 */
com.ibm.bpm.install.utils.InstallUtils.isValidDb2OperatingSystem = function() {
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
com.ibm.bpm.install.utils.InstallUtils.getProductInstallSize = function(data, type) {

    // Set default install size.
    var installSize = -1;

    // Get product install size.
    var sizeProperty = data.edition;
    sizeProperty += ".size";

    // Set initial required size.
    installSize = parseInt(property(sizeProperty));

    return installSize;
};

/*
 * Runs a jdbc test with the given data and error string.
 */
com.ibm.bpm.install.utils.InstallUtils.testConnection = function(dbType, dbHost, dbPort, dbName, dbUser, dbPass, dbWinAuth) {

    var request = {
        method: "TEST_DATABASE",
        data: {
            dbType: dbType,
            dbHost: dbHost,
            dbPort: dbPort + "",
            dbName: dbName,
            dbUser: dbUser,
            dbPass: dbPass,
            dbWinAuth: dbWinAuth
        }
    };

    var now = new Date().getTime();
    var response = com.ibm.bpm.install.utils.InstallUtils.runJavaMethod(request, "testConnection_" + now + ".json");

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

    // No errors, the connection went fine.
    return "";
};

/*
 * 
 */

com.ibm.bpm.install.utils.InstallUtils.isValidDoneFile = function(file) {
    logger.logMessage("I: start of isValidDoneFile method");

    var exits = top.fileExists(file + ".done");
    var doneFile;
    var doneStatus;
    var valid = false;
    if (exits) {
        doneFile = top.readTextFile(file + ".done", "ASCII");
        doneStatus = dojo.fromJson(doneFile);

        if (doneStatus.isSuccess) {
            valid = true;
            return valid;
        }
    }

    logger.logMessage("I: End of isValidDoneFile method with return Value" + valid);

    return valid;
};

/*
 * Kicks off profile creation.
 */
com.ibm.bpm.install.utils.InstallUtils.createProfile = function(manageprofilesCommand, options, profileFilename) {
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
com.ibm.bpm.install.utils.InstallUtils.checkFileProgress = function(file, expectedSize) {

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
com.ibm.bpm.install.utils.InstallUtils.getHostname = function() {
    logger.logMessage(property("log.info.request.hostname"));

    var request = {
        method: "GET_HOSTNAME"
    };

    var response = com.ibm.bpm.install.utils.InstallUtils.runJavaMethod(request, "getHostname");
    if (null == response) {
        logger.logMessage(property("log.warning.default.host"));
        return "";
    } else {
        logger.logMessage(top.formatmsg(property("log.info.hostname"), response));
        return response;
    }
};

/*
 * Open a file selection dialog box and returns the selected directory or null if none chosen.
 */
com.ibm.bpm.install.utils.InstallUtils.openBrowseDialog = function() {

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
    } else {
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
 * Function which check for product updates from bpm_updates.properties @pending - try catch
 */
com.ibm.bpm.install.utils.InstallUtils.getLocalProductUpdatesRepositories = function() {

    var bpmUpdatesFile = "bpm_updates.properties";
    var request = '';
    var productRepository = '';
    var wasRepository = top.formatmsg(property('was.repository'), property('wasOfferingId'));

    logger.logMessage("I: Fetching local Fix packs and Fixes");

    productRepository = com.ibm.bpm.install.utils.InstallUtils.getProductRepository();

    request = {
        method: "GET_AVAILABLE_REPOSITORIES",
        data: {
            wasLiveUpdateSite: wasRepository,
            bpmLiveUpdateSite: productRepository,
            bpmUpdatesFile: bpmUpdatesFile

        }
    };

    var now = new Date().getTime();
    var response = com.ibm.bpm.install.utils.InstallUtils.runJavaMethod(request, "GetLocalProductsUpdates_" + now + ".json");
    if (null == response) {
        logger.logMessage("W: runJavaMethod returned null while fetching local Fix Packs and Fixes");
        return response;
    } else {
        logger.logMessage("I: runJavaMethod returned the following local Fix Packs and Fixes" + response);
        return response;
    }

};

/*
 * Function which gets applicable fixpacks using IBM IM imcl interface @pending: try catch
 */

com.ibm.bpm.install.utils.InstallUtils.getAvailableFixPacks = function(intermediatePassword, keyRingLocation, repositories, logName,
    callback) {

    var command = '';
    var options;
    var returnValue = false;

    logger.logMessage("I: Get available Fixpacks");

    command = ' listAvailablePackages';

    options = '	-repositories ' + repositories + ' -long';
    // ' -useServiceRepository ' +

    if (keyRingLocation != null) {

        options = options + ' -keyring ' + keyRingLocation + ' -password ' + intermediatePassword;
    }

    var imProps = osHelper.getInstalledIMProperties();

    if (imProps == null) {
        options = options + ' -datalocation ' + util.getPersistedTempDirectory();
        // parameter to resolve if there exist an Installed IM failure
    }

    var response = com.ibm.bpm.install.utils.InstallUtils.runImclBaseImplementation(command, options, BACKGROUND, logName, callback);

    if (null == response) {
        logger.logMessage("W: runImclBaseImplementation returned null while authenticating");
        return response;
    }

    returnValue = true; // Call executing successfull

    logger.logMessage("I: End of get available Fixpacks");

    return returnValue;
};

/*
 * Function which gets available fixes using IBM IM imcl interface
 */

com.ibm.bpm.install.utils.InstallUtils.getAvailableFixes = function(intermediatePassword, keyRingLocation, logName, offeringId,
    offeringRepository, callback) {

    logger.logMessage("I: Get available Fixes");

    var command = '';
    var returnValue = false;

    command = ' listAvailableFixes ';

    options = offeringId + ' -repositories ' + offeringRepository + ' -long';

    // ' -useServiceRepository ' +
    if (keyRingLocation != null) {
        options = options + ' -keyring ' + keyRingLocation + ' -password ' + intermediatePassword;

    }

    var imProps = osHelper.getInstalledIMProperties();

    if (imProps == null) {
        options = options + ' -datalocation ' + util.getPersistedTempDirectory();
        // parameter to resolve if there exist an Installed IM failure
    }

    var response = com.ibm.bpm.install.utils.InstallUtils.runImclBaseImplementation(command, options, BACKGROUND, logName, callback);

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
com.ibm.bpm.install.utils.InstallUtils.getInstallOfferingInfo = function() {

    logger.logMessage("I: At the beginning of getInstallOfferingInfo");
    var request = '';
    var prefix;

    if (top.OSTYPE == 'windows') {
        prefix = 'file:\\';
    } else {
        // unix
        prefix = 'file://';
    }

    var WASimRepositoryLocation = '';
    var WSRRimRepositoryLocation = '';

    WASimRepositoryLocation = prefix + top.IMAGEDIR + 'repository' + top.PATHSEPARATOR + property('WAS.RepositoryFolderName')
        + top.PATHSEPARATOR + 'repository.xml';
    WSRRimRepositoryLocation = prefix + top.IMAGEDIR + 'repository' + top.PATHSEPARATOR + property('WSRRServer.RepositoryFolderName')
        + top.PATHSEPARATOR + 'repository.xml';

    request = {
        method: "GET_INSTALL_OFFERINGS_INFO",
        data: {
            wasInstallRepositoryXmlFile: WASimRepositoryLocation,
            instInstallRepositoryXmlFile: WSRRimRepositoryLocation
        }
    };

    logger.logMessage("I: Get InstallingOfferingInfo");

    var now = new Date().getTime();
    var response = com.ibm.bpm.install.utils.InstallUtils.runJavaMethod(request, "GetInstallOfferingInfo_" + now + ".json");
    logger.logMessage("I: runJavaMethod returned the following InstallingOfferingInfo " + response);
    // response can be null
    logger.logMessage("I: At the end of getInstallOfferingInfo");

    return response;
};

/*
 * Function which gets the products live update repositories or urls
 */

com.ibm.bpm.install.utils.InstallUtils.getProductRepository = function() {

    logger.logMessage("I: At the beginning of GetProductRepository");

    var productRepository;
    var token = '';
    var versionToken = util.getUpdateVersion();

    switch (top.diskLabel.edition)
    {
        case "WSRR": {
            token = "wsrr";
            break;
        }
        default: {
            throw "Unknown Edition " + top.diskLabel.edition; // TODO - no throws to browser
        }
    }

    productRepository = top.formatmsg(property('product.repository'), token, versionToken);

    logger.logMessage("I: At the end of GetProductRepository");

    return productRepository;
};

/*
 * Function getPropertyValue get's the property value from json based property file
 * 
 */
com.ibm.bpm.install.utils.InstallUtils.getPropertyValue = function(name, location) {
    var currentPropertyFile = top.readTextFile(location, "ASCII");
    if (currentPropertyFile != null) {
        var currentProperties = eval("(" + currentPropertyFile + ")");
        if (currentProperties != null) {
            return currentProperties[name];
        } else {
            return null;
        }
    } else
        return null;

};

/*
 * GetApplicableFixPacks filters the available fix packs @pending - try catch
 */
com.ibm.bpm.install.utils.InstallUtils.getApplicableFixPacks = function(availableFixPacksOutputFile, logName) {

    var request = '';
    var instOfferingId = '';
    var installingOfferingsInfo = com.ibm.bpm.install.utils.InstallUtils.getInstallOfferingInfo();
    var instVersion = null;
    if (installingOfferingsInfo != null) {
        instVersion = installingOfferingsInfo.instOfferingVersion; // installing product version
    }

    var wasOfferingId = property('wasOfferingId');
    var wasVersion = com.ibm.bpm.install.utils.InstallUtils.getPropertyValue('wasVersion', top.IMAGEDIR
        + '/launchpad/content/launchpadIfixableProperties.json');
    logger.logMessage("I: Get Applicable Fix Packs");

    if (top.diskLabel.edition) {
        instOfferingId = property(top.diskLabel.edition + ".offering.id");
    }

    request = {
        method: "GET_APPLICABLE_FIXPACKS",
        data: {
            availableUpdatesFile: availableFixPacksOutputFile,
            instOfferingId: instOfferingId,
            instVersion: instVersion,
            wasOfferingId: wasOfferingId,
            wasVersion: wasVersion
        }
    };

    var now = new Date().getTime();
    var response = com.ibm.bpm.install.utils.InstallUtils.runJavaMethod(request, logName);
    if (null == response) {
        logger.logMessage("W: runJavaMethod returned null while obtaining applicable Fix Packs");
        return response;
    } else {
        logger.logMessage("I: runJavaMethod returned the following applicable Fix Packs" + response);
        return response;
    }

    logger.logMessage("I: At the end of Get Applicable Fix Packs");

};

/*
 * getApplicableFixes filter available fixes @pending try catch
 */

com.ibm.bpm.install.utils.InstallUtils.getApplicableFixes = function(availableWasFixes, availableProductFixes, logName) {

    var request = '';

    logger.logMessage("I: Get Applicable iFixes");

    request = {
        method: "GET_APPLICABLE_FIXES",
        data: {
            wasFixesFile: availableWasFixes,
            bpmFixesFile: availableProductFixes
        }
    };

    var now = new Date().getTime();
    var response = com.ibm.bpm.install.utils.InstallUtils.runJavaMethod(request, logName);
    if (null == response) {
        logger.logMessage("W: runJavaMethod returned null while obtaining applicable iFixes");
        return response;
    } else {
        logger.logMessage("I: runJavaMethod returned the following applicable iFixes" + response);
        return response;
    }

    logger.logMessage("I: At the end of Get Applicable iFixes");
};

com.ibm.bpm.install.utils.InstallUtils.baseCommandImplementation = function(fullCommand, options, mode, logName, callback) {

    var script;
    var scriptName;
    var returnValue = false;

    var failMessage = "unable to execute command";
    try {

        logger.logMessage("executing base command implementation");

        if (top.isWindows()) {
            // Contents of Script to write
            script = "\"" + fullCommand + "\" " + options;

            // Script name
            scriptName = logName + ".bat";

            // Write script to temp directory
            top.writeTextFile(scriptName, script, false, "ASCII");

            // Run imcl script, passing " " since there are no additional options
            top.runProgram("DISK1", command("runIM", scriptName, logName), BACKGROUND, HIDDEN, null, null, callback);
            returnValue = true;
        } else {
            script = fullCommand + options;
            scriptName = logName + ".sh";
            top.writeTextFile(scriptName, script, false, "ASCII");
            top.runProgram("DISK1", command("runDynamicCommand", scriptName, logName), mode, HIDDEN, null, null, callback);
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
 * IMCL [<command>] [<options>] @url: https://radical.rtp.raleigh.ibm.com/capilano/89010-ibm.html @pending - all
 * paramter check before execution, callback, runProgram return value
 */
com.ibm.bpm.install.utils.InstallUtils.runImclBaseImplementation = function(command, options, mode, logName, callback) {
    var failMessage = property("log.error.imcl");
    var imclCommand = '';
    var returnValue = false;
    try {
        logger.logMessage(property("log.info.imcl"));

        var isImInstallOrUpdateRequired = util.isImInstallOrUpdateRequired();

        // If IM is not found or needs to be updated, isImInstallOrUpdateRequired will be true
        // In this case use IM from disk image, otherwise use IM from location found on system
        if (isImInstallOrUpdateRequired) {
            var imPath = osHelper.getIMLocation();
            imclCommand = imPath + top.PATHSEPARATOR + 'tools' + top.PATHSEPARATOR + 'imcl';
        } else {
            var imProps = osHelper.getInstalledIMProperties();
            imclCommand = imProps.location + top.PATHSEPARATOR + 'eclipse' + top.PATHSEPARATOR + 'tools' + top.PATHSEPARATOR + 'imcl';
        }

        options = command + options;

        var response = com.ibm.bpm.install.utils.InstallUtils.baseCommandImplementation(imclCommand, options, mode, logName, callback);

        if (null == response) {
            logger.logMessage("W: BaseCommandImplementation returned null while authenticating");
            return response;
        }

        returnValue = true;

    }
    catch (exception) {
        logger.logMessage(top.formatmsg(property("log.error"), exception));
        logger.logMessage(failMessage);
    }

    logger.logMessage("At the end of runBaseImclImplementation");
    return returnValue;
};

com.ibm.bpm.install.utils.InstallUtils.runSaveCredential = function(userName, password, logName, keyringLocation, callback) {

    logger.logMessage("I: Running Save Credential");

    var command = '';
    var wasRepository = top.formatmsg(property('was.repository'), property('wasOfferingId'));
    var options = '';
    var returnValue = false;
    var isImInstallOrUpdateRequired = util.isImInstallOrUpdateRequired();

    // If IM is not found or needs to be updated, isImInstallOrUpdateRequired will be true
    // In this case use IM from disk image, otherwise use IM from location found on system

    if (isImInstallOrUpdateRequired) {
        var imPath = osHelper.getIMLocation();
        command = imPath + top.PATHSEPARATOR + 'tools' + top.PATHSEPARATOR + 'imutilsc';
    } else {
        var imProps = osHelper.getInstalledIMProperties();
        command = imProps.location + top.PATHSEPARATOR + 'eclipse' + top.PATHSEPARATOR + 'tools' + top.PATHSEPARATOR + 'imutilsc';
    }

    /*
     * userName, password, logName, keyringLocation
     */

    options = ' saveCredential' + ' -url ' + wasRepository + ' -userName ' + userName + ' -userPassword ' + password + ' -keyring '
        + keyringLocation + ' -password ' + 'test' + ' -verbose';

    var response = com.ibm.bpm.install.utils.InstallUtils.baseCommandImplementation(command, options, BACKGROUND, logName, callback);

    if (null == response) {
        logger.logMessage("W: BaseCommandImplementation returned null while authenticating at runSaveCredential");
        return response;
    }

    returnValue = true;

    logger.logMessage("At the end of Save Credential");

    return returnValue;
};

com.ibm.bpm.install.utils.InstallUtils.runImcl = function(id, location, repository, properties, logName, callback) {
    var failMessage = property("log.error.imcl");
    try {
        logger.logMessage(property("log.info.imcl"));

        var isImInstallOrUpdateRequired = util.isImInstallOrUpdateRequired();

        var encodes = {};

        var imclCommand = '';

        // If IM is not found or needs to be updated, imProps will be null
        // In this case use IM from disk image, otherwise use IM from location found on system
        if (isImInstallOrUpdateRequired) {
            imclCommand = osHelper.getIMLocation() + top.PATHSEPARATOR + 'tools' + top.PATHSEPARATOR + 'imcl';
        } else {
            var imProps = osHelper.getInstalledIMProperties();
            imclCommand = imProps.location + top.PATHSEPARATOR + 'eclipse' + top.PATHSEPARATOR + 'tools' + top.PATHSEPARATOR + 'imcl';
        }

        var options = '';

        logger.logMessage(top.formatmsg(property("log.info.imcl.id"), id));
        logger.logMessage(top.formatmsg(property("log.info.imcl.location"), location));
        logger.logMessage(top.formatmsg(property("log.info.imcl.repository"), repository));

        if (top.isWindows()) {
            options = "install " + id + " -acceptLicense -repositories " + "REPOS" + " -showVerboseProgress -log " + "LOGNAME" + ".log";

            // maintain the encodes defined
            encodes.REPOS = encodeURIComponent(repository);
            encodes.LOGNAME = encodeURIComponent(logName);
        } else {
            options = "install " + id + " -acceptLicense -repositories " + repository + " -showVerboseProgress -log " + logName + ".log";
        }

        // no need to pass -accessRights, imcl will default value based on current user permissions

        if (location != '') {
            if (top.isWindows()) {
                options = options + " -installationDirectory " + "LOCATION";

                // maintain the encodes defined
                encodes.LOCATION = encodeURIComponent(location);
            } else {
                options = options + " -installationDirectory " + location;
            }
        }

        if (properties != '') {
            options = options + " -properties " + properties;
        }

        if (top.addKeyringOption && top.keyRingStep) {
            options = options + " -keyring " + top.keyRingLocation + " -password " + "test";

        }

        if (top.isWindows()) {
            // Contents of Script to write
            instCmd = "\"" + "IMCL" + "\" " + options;

            // maintain the encodes defined
            encodes.IMCL = encodeURIComponent(imclCommand);

            // Script name
            instScript = logName + ".bat";

            var jsonObject = {
                "method": "CREATE_DYNAMIC_SCRIPT",
                "data": {
                    "encodes": encodes,
                    "fileName": instScript,
                    "content": instCmd
                }
            };

            // Write script to temp directory
            top.writeTextFile(instScript + ".json", dojo.toJson(jsonObject), false, "ASCII");

            var imPath = osHelper.getIMLocation();

            top.runProgram("DISK1", command("runJavaMethod", top.IMAGEDIR, instScript + ".json", imPath), FOREGROUND, HIDDEN);

            // Run imcl script, passing " " since there are no additional options
            top.runProgram("DISK1", command("runIM", instScript, logName), BACKGROUND, HIDDEN, null, null, callback);
        } else {
            top.runProgram("DISK1", command("runCommand", imclCommand, options, logName), BACKGROUND, HIDDEN, null, null, callback);
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

com.ibm.bpm.install.utils.InstallUtils.getUserHomeDirectory = function(userid) {
    var request = {
        method: "GET_USERHOMEDIRECTORY",
        data: {
            userid: userid
        }
    };

    var now = new Date().getTime();
    var response = com.ibm.bpm.install.utils.InstallUtils.runJavaMethod(request, "getUserHomeDirectory_" + now + ".json");
    return response;
};

/*
 * Returns a boolean value based on userId existence
 */
com.ibm.bpm.install.utils.InstallUtils.doesUidExist = function(userid, platform) {

    var request = {
        method: "DOES_USERID_EXIST",
        data: {
            userid: userid,
            platform: platform
        }
    };

    var now = new Date().getTime();
    var response = com.ibm.bpm.install.utils.InstallUtils.runJavaMethod(request, "doesUidExist_" + now + ".json");
    return response;
};

/*
 * validates password against system password policy
 */
com.ibm.bpm.install.utils.InstallUtils.isPasswordValid = function(programLocation, userId, password, platform) {
    var request = {
        method: "TEST_PASSWORD",
        data: {
            userid: userId,
            password: password,
            platform: platform,
            location: programLocation
        }
    };

    var now = new Date().getTime();
    var response = com.ibm.bpm.install.utils.InstallUtils.runJavaMethod(request, "validatePassword_" + platform + "_" + now + ".json");
    return response;
};

/*
 * verifies password for correctness
 */

com.ibm.bpm.install.utils.InstallUtils.verifyPassword = function(programLocation, userId, password, platform) {
    var request = {
        method: "TEST_PASSWORD",
        data: {
            userid: userId,
            password: password,
            platform: platform,
            location: programLocation
        }
    };

    var now = new Date().getTime();
    var response = com.ibm.bpm.install.utils.InstallUtils.runJavaMethod(request, "verifyPassword_" + platform + "_" + now + ".json");
    return response;
};

/*
 * Returns a directory information object containing boolean: isEmpty boolean: isReadable boolean: isWritable long:
 * availableSize (in MB)
 */
com.ibm.bpm.install.utils.InstallUtils.getDirectoryInfo = function(directory, operation) {
    var request = {
        method: "TEST_DIRECTORY",
        data: {
            location: encodeURIComponent(directory),
            operation: operation
        }
    };

    var now = new Date().getTime();
    var response = com.ibm.bpm.install.utils.InstallUtils.runJavaMethod(request, "getDirectoryInfo_" + now + ".json");
    return response;
};

/*
 * Returns the canonical form of this filename.
 */
com.ibm.bpm.install.utils.InstallUtils.getCanonicalFilename = function(filename) {

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
    var response = com.ibm.bpm.install.utils.InstallUtils.runJavaMethod(request, "getCanonicalForm_" + now + ".json");
    if (null == response) {
        logger.logMessage("E: Failure getting canonical form");
        return filename;
    } else {
        var canonicalFilename = decodeURIComponent(response);
        logger.logMessage(property("log.info.canonical") + " " + canonicalFilename);
        return canonicalFilename;
    }
};

/*
 * Run the given java method.
 */
com.ibm.bpm.install.utils.InstallUtils.runJavaMethod = function(request, filename, /* optional */installPath) {
    var failMessage = property("log.error.java.execute");
    try {
        var tempFile = util.getPersistedTempFilename(filename);
        logger.logMessage(property("log.info.request.file") + " " + tempFile);
        top.writeTextFile(tempFile, dojo.toJson(request), false, "ASCII");
        var imPath = osHelper.getIMLocation();
        if (installPath) {
            top.runProgram("DISK1", command("runJavaMethodWithInstallPath", top.IMAGEDIR, tempFile, imPath, installPath), FOREGROUND,
                HIDDEN);
        } else {
            top.runProgram("DISK1", command("runJavaMethod", top.IMAGEDIR, tempFile, imPath), FOREGROUND, HIDDEN);
        }

        // remove ending .json from file name
        result = tempFile.search(".json");

        if (result != "-1") {
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

// Determine if the current user is a member of Db2 admin so that it can create databases
com.ibm.bpm.install.utils.InstallUtils.determineDb2AdminMembership = function(data) {
    var failMessage = property("log.error.groupMembership");
    try {

        var now = new Date().getTime();
        var responseFile = util.getPersistedTempFilename("checkGroupMembership" + now + ".response.json");

        // db2instance userid (non windows)
        var param = data.database.dbUserId;

        // groupname (windows)
        if (top.isWindows()) {
            param = "DB2ADMNS";
        }

        top.runProgram("DISK1", command("checkGroupMembership", param, responseFile), FOREGROUND, HIDDEN);

        // read the response and update the results in data
        var responseText = top.readTextFile(responseFile, "ASCII");
        if (null == responseText) {
            loggerFactory.logTrace(top.formatmsg(property("log.error.file"), responseFile));
            throw failMessage;
        }
        var response = eval("(" + responseText + ")");

        // update results in data
        data.database.db2AdminGroupName = response.groupName;
        data.database.isExistingDb2AdminMember = response.isExistingMember;
    }
    catch (exception) {
        logger.logMessage(top.formatmsg(property("log.error"), exception));
        logger.logMessage(failMessage);
    }
};

// checks if the hostname is referring to the localhost
com.ibm.bpm.install.utils.InstallUtils.checkIsLocalhost = function(hostname) {
    var isLocalhost = false;

    var request = {
        method: "TEST_LOCALHOST",
        data: {
            "hostname": hostname
        }
    };

    var now = new Date().getTime();
    var response = com.ibm.bpm.install.utils.InstallUtils.runJavaMethod(request, "testLocalhost_" + now + ".json");

    // No data or error data came back
    if (null != response) {
        isLocalhost = response.isLocalhost;
    }

    return isLocalhost;
};

com.ibm.bpm.install.utils.InstallUtils.addUserToGroup = function(data) {
    var failMessage = property("log.error.addUserToGroup");
    var isSuccess = true;
    try {

        com.ibm.bpm.install.utils.InstallUtils.determineDb2AdminMembership(data);

        if (data.database.isExistingDb2AdminMember == false) {
            logger.logMessage("I: adding user to the group " + data.database.db2AdminGroupName);

            top.runProgram("DISK1", command("addUserToGroup", data.database.db2AdminGroupName), FOREGROUND, HIDDEN);
        }
    }
    catch (exception) {
        logger.logMessage(top.formatmsg(property("log.error"), exception));
        logger.logMessage(failMessage);
        isSuccess = false;
    }

    return isSuccess;
};

/*
 * Encode passwords in BPM config properties file
 */
com.ibm.bpm.install.utils.InstallUtils.encodePassword = function(decodedPassword, installPath) {

    if (decodedPassword && installPath) {
        var request = {
            "method": "ENCODE_PASSWORD",
            "data": decodedPassword
        };
        var now = new Date().getTime();

        var requestFile = "encodePassword_" + now + ".json";
        var response = com.ibm.bpm.install.utils.InstallUtils.runJavaMethod(request, requestFile, installPath);

        // delete the request file which has plain text password
        var fileToDelete = util.getPersistedTempFilename(requestFile);
        top.runProgram("DISK1", command("deleteFile", fileToDelete), BACKGROUND, HIDDEN);

        if (null == response) {
            logger.logMessage(top.formatmsg(property("log.error.file.json"), "encodePassword_" + now));
            // return the smae decoded password
            return decodedPassword;
        } else {
            return response;
        }
    } else {
        // return the decoded password itself
        return decodedPassword;
    }
};

/*
 * starts the server.
 */
com.ibm.bpm.install.utils.InstallUtils.startServer = function(startServerCommand, options, startServerFilename) {
    var failMessage = "E: Unable to start server";
    try {
        logger.logMessage("I: Starting server");

        // If this is windows, then the startServer command will exit the shell if not called.
        if (top.isWindows()) {
            startServerCommand = "call " + startServerCommand;
        }
        top.runProgram("DISK1", command("runCommand", startServerCommand, options, startServerFilename), BACKGROUND, HIDDEN);
    }
    catch (exception) {
        logger.logMessage(failMessage);
        logger.logMessage("E: " + exception.message);
        throw failMessage;
    }
};

/*
 * preload.
 */
com.ibm.bpm.install.utils.InstallUtils.preload = function(preloadCommand, options, preloadFilename) {
    var failMessage = "E: Unable to run preload";
    try {
        logger.logMessage("I: Running preload");

        // If this is windows, then the preload command will exit the shell if not called.
        if (top.isWindows()) {
            preloadCommand = "call " + preloadCommand;
        }
        top.runProgram("DISK1", command("runCommand", preloadCommand, options, preloadFilename), BACKGROUND, HIDDEN);
    }
    catch (exception) {
        logger.logMessage(failMessage);
        logger.logMessage("E: " + exception.message);
        throw failMessage;
    }
};

/*
 * runstats.
 */
com.ibm.bpm.install.utils.InstallUtils.runstats = function(runstatsCommand, options, db2admin, runstatsFilename) {
    var failMessage = "E: Unable to run runstats";
    try {
        logger.logMessage("I: Running runstats");

        // If this is windows, then the runstats command will exit the shell if not called.
        if (top.isWindows()) {
            runstatsCommand = "call " + runstatsCommand;
        } else {
            runstatsCommand = "\"" + runstatsCommand + " " + options + "\"";
        }

        if (top.isWindows()) {
            top.runProgram("DISK1", command("runCommand", runstatsCommand, options, runstatsFilename), BACKGROUND, HIDDEN);
        } else {
            top.runProgram("DISK1", command("runSuCommand", db2admin, runstatsCommand, runstatsFilename), BACKGROUND, HIDDEN);
        }

    }
    catch (exception) {
        logger.logMessage(failMessage);
        logger.logMessage("E: " + exception.message);
        throw failMessage;
    }
};