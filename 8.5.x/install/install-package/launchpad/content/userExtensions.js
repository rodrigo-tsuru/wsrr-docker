<script>
// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
// Copyright IBM Corporation 2005, 2012. All Rights Reserved.
// US Government Users Restricted Rights - Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

// This check can be passed as an argument to an secure functions
// in the API that you call or any secure functions you define in
// secureUserExtensions.js

var userSecurityCheck = new Function('return window');
var tempDir = null;

// To use this funtion in your content, you must refer to it as top.myFunc()

/** **************** Code Provided by Common Launchpad Team to fix Mocked Translation Issue ************************ */
function formatmsg(template) {
    try {
        var args = arguments;
        var msg = template;
        if (typeof msg == "string" && typeof arguments[1] != "undefined" && arguments[1] != null) {
            if (typeof arguments[1] != "string") {
                args = arguments[1];
            }
            for ( var i = 1; i < args.length; i++) {
                if ((typeof args[i] != "undefined") && args[i] != null) {
                    var ndx = 0;
                    do {
                        ndx = msg.indexOf("%" + i, ndx);
                        if (ndx >= 0) {
                            var replacement = args[i].toString();
                            msg = msg.substring(0, ndx) + replacement + msg.substring(ndx + 2);
                            ndx += replacement.length;
                        }
                    } while (ndx >= 0);
                }
            }
        }
        return msg;
    }
    catch (e) {
        top.logException(e, arguments);
    }
    return top.UNDEFINED;
}

/** ***************** END code provided by Launchpad team ****************************** */

/*
 * *******************************Code provided by Common Launchpad team to fix issue with preloading first page that
 * isn't used in some editions*******
 */

/*
 * If the preloaded pages have finished loading, this returns whether or not there is a preloaded page corresponding to
 * the given menu_id. If preload has NOT finished, we have no way of knowing, so this method will simply return null.
 */
function hasContentWindow(menu_id) {
    if (top.preloadLoaded) {
        var element = top.preloadDocument.getElementById("preload_" + menu_id);
        return element != null;
    }
    return null;
}

/*
 * Returns a handle to the contentWindow displayed within the content frame. If it is not yet loaded, this method will
 * return null. A callback function can be passed to this method which will be called once the page has finished
 * loading. @arg menu_id the menu id. If this is not set, uses the current content page @arg callback the function to
 * execute once the content window has finished loading
 */
function getContentWindow(menu_id, callback) {

    // If all pages are loaded and there is no page for this menu_id, we return null
    var check = (hasContentWindow(menu_id));
    if (check != null && check == false) {
        return null;
    } else if (check == true) {
        var frame = top.root.preload.document.getElementById("frame_" + menu_id);

        // If the frame is finished loading, we call the callback function if it is set and return the frame
        // alert('frame: '+frame);
        if (frame && frame.contentWindow.jscpLoaded) {
            // alert('frame: '+frame+' | menu_id: '+menu_id);
            if (callback) {
                callback(menu_id, frame);
            }
            return frame.contentWindow;
        }
    }
    // We reach this if the frame is not yet loaded. If a callback is set, we recurse this function until the page
    // has finished loading, then call the callback function
    if (callback) {
        // alert('creating callback');
        var wrappedCallback = function() {
            top.getContentWindow(menu_id, callback);
        };
        setTimeout(wrappedCallback, 250);
    }
    return null;
}

/*
 * Similar to getContentWindow, but does not return the content window; simply waits for all windows in the menu_ids
 * array to finish loading, then calls the callback function
 */
function waitForContentWindows(menu_ids, callback) {
    var flag = true;
    for ( var i = 0; i < menu_ids.length; i++) {
        var id = menu_ids[i];
        var check = hasContentWindow(id);
        if (check != null && check == false) {
            continue; 
        // If there is no page for this menu_id, we do not need to wait for it
        }

        var window = getContentWindow(id);
        // If any of these frames are not fully loaded, we do not perform the callback
        if (!window) {
            flag = false;
            break;
        }
    }
    if (flag) {
        callback();
    } else {
        var wrappedCallback = function() {
            top.waitForContentWindows(menu_ids, callback);
        };
        setTimeout(wrappedCallback, 250);
    }
}

function waitForStartPage(startPage, fx) {
    if (!top.root || !top.root.preload || !top.root.preload.document || !top.root.preload.document.getElementById("preload_" + startPage)
        || top.root.preload.document.getElementById("preload_" + startPage).style.display == "none") {
        setTimeout(function() {
            this.waitForStartPage(startPage, fx)
        }, 500);
    } else {
        fx();
    }
}

/** **********************END OF CODE PROVIDED BY COMMON LAUNCHPAD *********************** */

/*
 * Gets the temp directory to write persistent log files to.
 */
function getPersistedTempDirectory() {
    if (!tempDir) {
        var now = new Date().getTime();
        tempDir = top.getNativeFileName(top.getEnv("LaunchPadTemp") + "/../IBM_LaunchPad_WSRR_" + now);

        // Create the new temp dir
        top.createDir(tempDir);
    }
    return tempDir;
}

/**
 * Creates a dir with the given full path
 */
function createDir(dirNativeName) {
    if (top.isWindows()) {
        top.createDirectory(dirNativeName);
    } else {
        runProgram("DISK1", command("createDir", dirNativeName), FOREGROUND, HIDDEN);
    }
}

/**
 * Returns OS correct path to temp file that starts with temp dir and ends with filename
 */
function getTempFilename(filename) {
    return top.getNativeFileName(top.getEnv("LaunchPadTemp") + "/" + filename);
}

/**
 * Returns OS correct path to temp file that starts with the persisted temp dir and ends with filename
 */
function getPersistedTempFilename(filename) {
    return top.getNativeFileName(top.getPersistedTempDirectory() + "/" + filename);
}

function installProduct(admin) {
    var isESD = 'true';
    if (top.directoryExists(NO_DISKID, top.IMAGEDIR + 'msd')) {
        isESD = 'false';
    }

    var installXMLFileLoc = top.IMAGEDIR + top.PATHSEPARATOR + 'IM' + top.PATHSEPARATOR + 'install.xml';

    if (isESD == 'true') {
        if ((top.ARCHITECTURE.indexOf("64") != -1) || (top.ARCHITECTURE == 's390x')) // It is 64 bit
        {
            installXMLFileLoc = top.IMAGEDIR + top.PATHSEPARATOR + 'IM' + top.PATHSEPARATOR + 'install_64.xml';
        }
    } else // is DVD
    {
        if ((top.ARCHITECTURE.indexOf("64") != -1) || (top.ARCHITECTURE == 's390x')) // It is 64 bit
        {
            installXMLFileLoc = writeIMInstall64XML(admin);
            writeIMPostInstall64XML(admin);
        } else {
            installXMLFileLoc = writeIMInstallXML(admin);
            writeIMPostInstallXML(admin);
        }

    }

    if (admin == true) {
        if (top.diskLabel.edition == 'WSRRSTUDIO') {
            runProgram('DISK1', command('installIMStudio.root', top.IMAGEDIR), top.BROWSER == 'IExplore' ? FOREGROUND : BACKGROUND,
                VISIBLE, this);
        } else {
            runProgram('DISK1', command('installIM.root', getIMDiskLocation(), installXMLFileLoc), top.BROWSER == 'IExplore' ? FOREGROUND
                : BACKGROUND, VISIBLE, this);
        }
    } else {
        if (top.diskLabel.edition == 'WSRRSTUDIO') {
            runProgram('DISK1', command('installIMStudio.nonroot', top.IMAGEDIR), top.BROWSER == 'IExplore' ? FOREGROUND : BACKGROUND,
                VISIBLE, this);
        } else {
            runProgram('DISK1', command('installIM.nonroot', getIMDiskLocation(), installXMLFileLoc),
                top.BROWSER == 'IExplore' ? FOREGROUND : BACKGROUND, VISIBLE, this);
        }
    }
}

function installWSRRClient(admin) {
    if (admin == true) {
        runProgram('DISK1', command('installIMClient.root', top.IMAGEDIR), top.BROWSER == 'IExplore' ? FOREGROUND : BACKGROUND, VISIBLE,
            this);
    } else {
        runProgram('DISK1', command('installIMClient.nonroot', top.IMAGEDIR), top.BROWSER == 'IExplore' ? FOREGROUND : BACKGROUND, VISIBLE,
            this);
    }
}

function startIM(admin) {
    var isESD = 'true';
    if (top.directoryExists(NO_DISKID, top.IMAGEDIR + 'msd')) {
        isESD = 'false';
    }

    var installXMLFileLoc = null;

    if (isESD == 'false') {
        installXMLFileLoc = writeExistingWASIMInstallXML();
        writeExistingWASIMPostInstallXML();
    }

    if (isESD == 'true') {

        installXMLFileLoc = writeInstallImportXML();
        writePostInstallImportXML();

    }
    // removed soft references to install-import.xml and post-install_import.xml

    if (admin == true) {
        runProgram('DISK1', command('installIM.root', getIMDiskLocation(), installXMLFileLoc), BACKGROUND, VISIBLE);
    } else {
        runProgram('DISK1', command('installIM.nonroot', getIMDiskLocation(), installXMLFileLoc), BACKGROUND, VISIBLE);
    }

    return;
}

function installLaunchHelp(help_home) {
    if (top.directoryExists(NO_DISKID, help_home)) {
        alert(property('doc.warning'));
        return;
    } else {
        runProgram('DISK1', command('installHelp', top.IMAGEDIR, help_home), BACKGROUND, HIDDEN);
    }
}

function defaultWASHome() {
    var installLocation = '';

    if (top.OS == 'AIX' || top.OS == 'SunOS') {
        installLocation = '/opt/IBM/WebSphere/WSRR/v8.5';
    } else if (top.OS == 'Linux') {
        installLocation = '/opt/ibm/WebSphere/WSRR/v8.5';
    } else if (top.OSTYPE == 'windows') {
        installLocation = 'C:\\IBM\\WebSphere\\WSRR\\v8.5';
    }

    return installLocation;
}

function launchpadStartup() {
    top.checkForSupportedBrowser();
    top.setupPreloadForEditions();
    top.setupForLaunchpadUpdates();

}

/*
 * Function which set's the IMAGEDIR variable based on launchpad start location and kick start's check for updates to
 * launchpad.
 */

function setupForLaunchpadUpdates() {
    if (!top.ORIGINALSTARTINGDIR || top.ORIGINALSTARTINGDIR == "undefined")
        window.setTimeout("top.setupForLaunchpadUpdates()", 500);
    else {
        // do stuff once ORIGINALSTARTINGDIR is set
        top.IMAGEDIR = top.ORIGINALSTARTINGDIR;
        top.checkForLaunchpadUpdates();

    }
}

/*
 * Function which check's for initialization of given property
 * 
 */

function checkForNoProperty(propertyName, property) {

    var pattern = "** " + propertyName + " - NO PROPERTY **";

    if ((property == pattern) || (property.search("NO PROPERTY") >= 0)) {
        return true;
    } else {
        return false;

    }

}

/*
 * Function which fetches Common Launchpad updates from the update repository if any
 */

function checkForLaunchpadUpdates() {
    var now = new Date().getTime();
    var filename = "GetLaunchpadUpdates_" + now + ".json";

    var tempFile = top.getPersistedTempFilename(filename);
    var tempDir = top.getPersistedTempDirectory();

    var bpmUpdatesFile = "bpm_updates.properties";
    var targetDirectory = tempDir;
    var token = "";
    var versionToken = property('product.update.token');
    var logFileName = "launchpad_Updates_" + now + ".log"
    var tempLogFile = top.getPersistedTempFilename(logFileName);
    var message = null;
    var launchpadUpdateSite;

    if (top.checkForNoProperty('product.update.token', versionToken) != true && versionToken != "") {
        launchpadUpdateSite = top.formatmsg(property('launchpad.repository'), versionToken);

        if (top.checkForNoProperty('launchpad.repository', launchpadUpdateSite) == true || launchpadUpdateSite == "") {
            message = "E: Launchpad update site is null\r\n"
            top.writeTextFile(tempLogFile, message, true, "UTF-8");
        }

    } else {
        message = "E: Launchpad version is null\r\n"
        top.writeTextFile(tempLogFile, message, true, "UTF-8");
        launchpadUpdateSite = "";
        message = "E: Launchpad update site is null\r\n"
        top.writeTextFile(tempLogFile, message, true, "UTF-8");

    }

    var request = '{ "method": "GET_UPDATES",  "data": {"targetDirectory":' + escapeString(targetDirectory) + ',"bpmUpdatesFile":'
        + escapeString(bpmUpdatesFile) + ',"launchpadId":' + escapeString(property("launchpadUniqueId")) + ',"launchpadUpdateSite":'
        + escapeString(launchpadUpdateSite) + '}}';

    top.writeTextFile(tempFile, request, false, "ASCII");
    var imPath = top.getIMDiskLocation();

    message = "I: Fetching Launchpad updates: " + request + "\r\n"
    top.writeTextFile(tempLogFile, message, true, "UTF-8");

    runProgram("DISK1", command("runJavaMethod", top.STARTINGDIR, tempFile, imPath), FOREGROUND, HIDDEN);

    // remove ending .json from file name
    result = tempFile.search(".json");

    if (result != "-1") {
        tempFile = tempFile.substring(0, result);
    }

    var responseText = top.readTextFile(tempFile + ".response.json", "ASCII");

    if (null == responseText) {
        message = "E: runJavaMethod returned null while fetching Launchpad updates\r\n"
        top.writeTextFile(tempLogFile, message, true, "UTF-8");
        return;
    }
    var response = eval("(" + responseText + ")");
    if (response.result == "FAIL") {

        if (response.message) {
            message = "E: runJavaMethod returned FAIL while fetching Launchpad updates with message " + response.message + "\r\n"
            top.writeTextFile(tempLogFile, message, true, "UTF-8");
        }

        return;
    }

    if (response.data.issues) {

        message = "W: Launchpad updates issues: \r\n";
        top.writeTextFile(tempLogFile, message, true, "UTF-8");

        for ( var i = 0; i < response.data.issues.length; i++) {
            var issue = response.data.issues[i];

            message = "W: issueType: " + issue.type + "; issueId: " + issue.id + "; issueValue: " + issue.value + "\r\n";
            top.writeTextFile(tempLogFile, message, true, "UTF-8");

        }

    }

    top.launchpadUpdates = response.data;

    if (top.launchpadUpdates && top.launchpadUpdates.launchpad && top.launchpadUpdates.launchpad.pkgUrl) {

        // nuance - will be removed at a later point of time

        var temp = "update" + top.launchpadUpdates.launchpad.version;
        top.launchpadUpdates.launchpad.pkgUrl = top.launchpadUpdates.launchpad.pkgUrl.replace(temp, "updates");

        message = "I: Available launchpad updates: " + top.launchpadUpdates.launchpad.pkgUrl + "\r\n";
        top.writeTextFile(tempLogFile, message, true, "UTF-8");

        /*
         * As per launchpad documentation, launchpad internal function will show the update pop-up and update launchpad
         * as per user action.
         */

        top.setLaunchpadUpdateSite(top.launchpadUpdates.launchpad.pkgUrl);

        /*
         * In the KingFish release while working on launchpad serviceability, BPM Install team found an inherent issue
         * with Common Launchpad tool while performing update. The core internal update function of launchpad
         * (launchpad/update.js/checkUpdates()) was racing with BPM Install team extended code and it was decided that
         * we (BPM install) team will call the their internal method after our initial checks.
         */

        top.checkUpdates();

    }

}

function escapeString(str) {
    return ('"' + str.replace(/(["\\])/g, '\\$1') + '"').replace(/[\f]/g, "\\f").replace(/[\b]/g, "\\b").replace(/[\n]/g, "\\n").replace(
        /[\t]/g, "\\t").replace(/[\r]/g, "\\r"); // string
}

/*
 * Gets information about the install manager.
 */
function getInstallManagerProperties() {
    var props = secureGetInstallManagerProperties(userSecurityCheck);

    if (props != null) {
        var versionInfo = parseVersionNumber(props.version);
        var reqVersion = parseVersionNumber(property('minIMVersion'));
        var versionValid = false;
        if (versionInfo.major < reqVersion.major) {
            // major version too small
        } else if (versionInfo.major == reqVersion.major && versionInfo.minor < reqVersion.minor) {
            // minor version too small
        } else if (versionInfo.minor == reqVersion.minor && versionInfo.service < reqVersion.service) {
            // service version too small
        } else {
            versionValid = true;
        }

        if (versionValid) {

            return props;

        } else {
            // IM needs to be upgraded
            return null;
        }
    } else {
        // didn't find IM
        return null;
    }
}

function parseVersionNumber(version) {
    var parts = version.split(".");
    if (parts.length < 3) {
        top.logTrace("version number invalid:  " + version);
    }

    return {
        'major': parseInt(parts[0]),
        'minor': parseInt(parts[1]),
        'service': parseInt(parts[2])
    };
}

function getIMDiskLocation() {

    var IMpath = top.IMAGEDIR + 'IM'; // default location on ESD

    if (top.directoryExists(NO_DISKID, top.IMAGEDIR + 'msd')) {
        if (top.OSTYPE == 'windows') {
            IMpath = top.IMAGEDIR + 'IM_win32_x86';
        } else if (top.OS == 'Linux' && (top.ARCHITECTURE == 'x86' || top.ARCHITECTURE == 'IA64' || top.ARCHITECTURE == 'AMD64')) {
            IMpath = top.IMAGEDIR + 'IM_linux_x86';
        } else if (top.OS == 'Linux' && (top.ARCHITECTURE == 'PPC32' || top.ARCHITECTURE == 'PPC64')) {
            IMpath = top.IMAGEDIR + 'IM_linux_ppc';
        } else if (top.OS == 'AIX') {
            IMpath = top.IMAGEDIR + 'IM_aix_ppc';

        } else if (top.OS == 'SunOS') {
            IMpath = top.IMAGEDIR + 'IM_solaris_sparc';

        } else if (top.OS == 'Linux' && top.ARCHITECTURE == 's390x') {
            IMpath = top.IMAGEDIR + 'IM_linux_s390';
        } else if (top.OS == 'HP-UX') {
            IMpath = top.IMAGEDIR + 'IM_hpux_ia64_32';
        }
    }

    return IMpath;
}

/*
 * Function which writes install_import.xml file to launchpad temporary location if launchpad is updated
 */

function writeInstallImportXML() {

    var contents = "\<?xml version=\"1.0\" encoding=\"UTF-8\"?\>\n" + "\<agent-input\>\n" + "\<server\>\n" + "\<repository location=\'"
        + top.IMAGEDIR + "IM" + top.PATHSEPARATOR + "\'" + " temporary=\'true\'/\>\n" + "\<repository location=\'" + top.IMAGEDIR
        + "repository" + top.PATHSEPARATOR + "repository.config\'" + " temporary=\'true\' /\>\n"
        + "\<repository location=\'http://public.dhe.ibm.com/software/websphere/repositories/\' temporary=\'true\' /\>\n" + "\</server\>\n"
        + "\<install\>\n" + "\<offering features=\'agent_core,agent_jre\' id=\'com.ibm.cic.agent\' /\>\n" + "\</install\>\n"
        + "\</agent-input\>\n"

    var fileLocation = top.getEnv("LaunchPadTemp") + top.PATHSEPARATOR + 'install_import.xml';
    top.writeTextFile(fileLocation, contents, false, "UTF-8");

    return fileLocation;

}

/*
 * Function which writes post-install_import.xml file to launchpad temporary location if launchpad is updated
 */

function writePostInstallImportXML() {

    var contents = "\<?xml version=\"1.0\" encoding=\"UTF-8\"?\>\n" + "\<agent-input\>\n" + "\<server\>\n" + "\<repository location=\'"
        + top.IMAGEDIR + "repository" + top.PATHSEPARATOR + "repository.config\'" + " temporary=\'true\' /\>\n"
        + "\<repository location=\'http://public.dhe.ibm.com/software/websphere/repositories/\' temporary=\'true\' /\>\n" + "\</server\>\n"
        + "\</agent-input\>\n"

    var fileLocation = top.getEnv("LaunchPadTemp") + top.PATHSEPARATOR + 'post-install_import.xml';
    top.writeTextFile(fileLocation, contents, false, "UTF-8");

    return fileLocation;
}

function writeIMInstall64XML(admin) {
    var installXMLFile = "\<?xml version=\"1.0\" encoding=\"UTF-8\"?\>\n" + "\<agent-input temporary=\'true\' \>\n"
        + "\<preference value=\"true\" name=\"com.ibm.cic.common.core.preferences.import.enabled\" /\>\n" + "\<server\>\n"
        + "\<repository location=\'" + top.IMAGEDIR + "IM_win32_x86\' /\>\n" + "\<repository location=\'" + top.IMAGEDIR
        + "IM_linux_x86\' /\>\n" + "\<repository location=\'" + top.IMAGEDIR + "IM_linux_s390\' /\>\n" + "\<repository location=\'"
        + top.IMAGEDIR + "IM_solaris_sparc\' /\>\n" + "\<repository location=\'" + top.IMAGEDIR + "IM_aix_ppc\' /\>\n";

    installXMLFile = installXMLFile
        + "\<repository location=\'"
        + top.IMAGEDIR
        + "\' /\>\n"
        + "\</server\>\n"
        + "\<install\>\n"
        + "\<offering features=\'agent_core,agent_jre\' id=\'com.ibm.cic.agent\'/\>\n"
        + "\<offering id=\'com.ibm.websphere.NDTRIAL.v85\' features=\'core.feature,samples,import.productProviders.feature,import.configLauncher.feature,consoleLanguagesSupport.feature,runtimeLanguagesSupport.feature\'/\>\n";
    installXML = installXML + "<offering id=\'" + property('WSRR.offering.id') + "\' />\n";
    if (top.OSTYPE == "windows" && admin) {
        installXMLFile = installXMLFile + "\<offering id=\'com.ibm.ws.DB2EXP.winia64\' /\>\n";
    } else if (top.OS == 'Linux' && admin && (top.ARCHITECTURE == 'IA64' || top.ARCHITECTURE == 'AMD64')) {
        installXMLFile = installXMLFile + "\<offering id=\'com.ibm.ws.DB2EXP.linuxia64\' /\>\n";
    }
    installXMLFile = installXMLFile + "\<offering id=\'com.ibm.ws.DB2EXP.linuxia64\' /\>\n";
    installXMLFile = installXMLFile + "\<\/install\>\n" + "\</agent-input\>";

    var fileLoc = top.getEnv("LaunchPadTemp") + top.PATHSEPARATOR + 'install_64.xml';
    top.writeTextFile(fileLoc, installXMLFile, false, "UTF-8");

    return fileLoc;
}


function writeExistingWASIMInstallXML() {
    var installXMLFile = "\<?xml version=\"1.0\" encoding=\"UTF-8\"?\>\n" + "\<agent-input temporary=\'true\' \>\n"
        + "\<preference value=\"true\" name=\"com.ibm.cic.common.core.preferences.import.enabled\" /\>\n" + "\<server\>\n"
        + "\<repository location=\'" + top.IMAGEDIR + "IM_win32_x86\' /\>\n" + "\<repository location=\'" + top.IMAGEDIR
        + "IM_linux_x86\' /\>\n" + "\<repository location=\'" + top.IMAGEDIR + "IM_linux_s390\' /\>\n" + "\<repository location=\'"
        + top.IMAGEDIR + "IM_solaris_sparc\' /\>\n" + "\<repository location=\'" + top.IMAGEDIR + "IM_aix_ppc\' /\>\n";

    installXMLFile = installXMLFile + "\<repository location=\'" + top.IMAGEDIR + "\' /\>\n" + "\</server\>\n" + "\<install\>\n"
        + "\<offering features=\'agent_core,agent_jre\' id=\'com.ibm.cic.agent\'/\>\n" + "\<\/install\>\n" + "\</agent-input\>";

    var fileLoc = top.getEnv("LaunchPadTemp") + top.PATHSEPARATOR + 'install_importDVD.xml';
    top.writeTextFile(fileLoc, installXMLFile, false, "UTF-8");

    return fileLoc;
}

function writeExistingWASIMPostInstallXML() {
    var installXMLFile = "\<?xml version=\"1.0\" encoding=\"UTF-8\"?\>\n" + "\<agent-input temporary=\'true\' \>\n"
        + "\<preference value=\"true\" name=\"com.ibm.cic.common.core.preferences.import.enabled\" /\>\n" + "\<server\>\n"
        + "\<repository location=\'" + top.IMAGEDIR + "\' /\>\n" + "\</server\>\n" + "\<install\>\n" + "\<\/install\>\n"
        + "\</agent-input\>";

    var fileLoc = top.getEnv("LaunchPadTemp") + top.PATHSEPARATOR + 'post-install_importDVD.xml';
    top.writeTextFile(fileLoc, installXMLFile, false, "UTF-8");

    return fileLoc;
}

function setupPreloadForEditions()
{

    // TODO: Provide the default startup page id
    var startPage = 'welcome';

    //var edition = (typeof top.diskLabel.id == 'string')? top.diskLabel.id : null;
    var edition = (typeof top.diskLabel.edition == 'string')? top.diskLabel.edition : null;

    if(edition!=null){
        var pageToView = (edition=='BPM_STARTER' || edition=='BPM_STAND' || edition=='BPM_PC' || edition=='BPM_WPS' || edition=='WSRR') ? 'welcome' : 'install';
        top.waitForContentWindows(pageToView, function() {
        top.waitForStartPage(startPage, function(){ top.navigateTo(pageToView); })
        
    });
    
    }
}

function checkForSupportedBrowser()
{
    // Check for Firefox 3.5+
    if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)) { //test for Firefox/x.x or Firefox x.x (ignoring remaining digits);
        var ffversion = new Number(RegExp.$1) // capture x.x portion and store as a number
        if (ffversion >= 3.5) {
            return;
        } 
    }
    
    // Check for IE6+
    if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) { //test for MSIE x.x;
        var ieversion = new Number(RegExp.$1) // capture x.x portion and store as a number
        if (ieversion >= 6) {
            return;
        }
    }

    // All other browsers and versions are considered invalid
    var noBrowserLocation = "launchpad/" + top.getLocaleMapping('engineLocales') + "/noBrowser.html";
    top.viewPage("DISK1",noBrowserLocation);
    setTimeout(top.Exit, 2000);
}
</script>