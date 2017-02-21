// Licensed Materials - Property of IBM
// 5725-C94
// Copyright IBM Corporation 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("com.ibm.bpm.install.utils.InstallHelper");

dojo.require("com.ibm.bpm.install.ui.widgets.textbox.ValidationTextBox");
dojo.require("com.ibm.bpm.install.ui.widgets.textbox.PortTextBox");

dojo.declare("com.ibm.bpm.install.utils.InstallHelper", [], {
    // Place comma-separated class attributes here. Note, instance attributes
    // should be initialized in the constructor. Variables initialized here
    // will be treated as 'static' class variables.

    INVALID_CHARACTERS_PATTERN: /^.*([\\*?\"<>|\/,\^&:;=+%'#${}\[\] ])+.*$/, // includes a space character

    UPPERCASE_CHARACTERS_PATTERN: /[A-Z]/,

    // Constructor function. Called when instance of this class is created
    constructor: function() {
        // variable mods to cope with running in XPI on FF
        var origDir = top.getExternalTopDir() + "/";
        if (origDir == null || origDir == "") {
            top.setEnv("LaunchPadOriginalStartingDir", top.STARTINGDIR);
            top.ORIGINALSTARTINGDIR = top.STARTINGDIR;
        } else {
            top.ORIGINALSTARTINGDIR = origDir;
        }
        if (!top.IMAGEDIR || top.IMAGEDIR == "undefined") {
            top.IMAGEDIR = top.ORIGINALSTARTINGDIR;
        }
    },

    checkForNoProperty: function(propertyName, property) {
        var pattern = "** " + propertyName + " - NO PROPERTY **";

        if ((property == pattern) || (property.search("NO PROPERTY") >= 0)) {
            return true;
        } else {
            return false;

        }
    },

    // TODO : USE DOJO way of checking browser type
    /**
     * Run on startup, checks that the browser type and version are supported
     */
    checkForSupportedBrowser: function() {
        // Check for Firefox minimum version
        if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)) { // test for Firefox/x.x or Firefox x.x (ignoring
                                                                    // remaining digits);
            var ffversion = new Number(RegExp.$1) // capture x.x portion and store as a number
            if (ffversion >= 3.5) {
                return;
            }
        }

        // Check for IE6+
        if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) { // test for MSIE x.x;
            var ieversion = new Number(RegExp.$1) // capture x.x portion and store as a number
            if (ieversion >= 6) {
                return;
            }
        }

        // All other browsers and versions are considered invalid
        var noBrowserLocation = "launchpad/" + top.getLocaleMapping('engineLocales') + "/noBrowser.html";
        top.viewPage("DISK1", noBrowserLocation);
        setTimeout(top.Exit, 2000);
    },

    /**
     * Creates a dir with the given full path
     */
    createDir: function(dirNativeName) {
        if (top.isWindows()) {
            top.createDirectory(dirNativeName);
        } else {
            top.runProgram("DISK1", top.command("createDir", dirNativeName), top.FOREGROUND, top.HIDDEN);
        }
    },

    /**
     * Escape string
     */
    escapeString: function(str) {
        return ('"' + str.replace(/(["\\])/g, '\\$1') + '"').replace(/[\f]/g, "\\f").replace(/[\b]/g, "\\b").replace(/[\n]/g, "\\n")
            .replace(/[\t]/g, "\\t").replace(/[\r]/g, "\\r"); // string
    },

    /**
     * Parse Version Number
     */
    parseVersionNumber: function(version) {
        var parts = version.split(".");
        if (parts.length < 3) {
            loggerFactory.logTrace("version number invalid:  " + version);
        }

        return {
            'major': parseInt(parts[0]),
            'minor': parseInt(parts[1]),
            'service': parseInt(parts[2])
        };
    },

    /**
     * Setup Preload Editions
     */
    setupPreloadForEditions: function() {
        // TODO: Provide the default startup page id
        var startPage = 'welcome';

        // var edition = (typeof top.diskLabel.id == 'string')? top.diskLabel.id : null;
        var edition = (typeof top.diskLabel.edition == 'string') ? top.diskLabel.edition : null;

        if (edition != null) {
            var pageToView = (edition == 'WSRR') ? 'welcome' : 'install';
            if (top.isWindows()) {
                top.waitForContentWindows(pageToView, 
                    function() {
                        top.waitForStartPage(startPage, function(){ top.navigateTo(pageToView); } )
                    }
                );
            } else {
                top.waitForContentWindows(pageToView, function() {
                    this.waitForStartPage(startPage, function() {
                        top.navigateTo(pageToView);
                    })
                });
            }
        }
    },

    waitForStartPage: function(startPage, fx) {
        if (!top.root || !top.root.preload || !top.root.preload.document
            || !top.root.preload.document.getElementById("preload_" + startPage)
            || top.root.preload.document.getElementById("preload_" + startPage).style.display == "none") {
            setTimeout(function() {
                this.waitForStartPage(startPage, fx)
            }, 500);
        } else {
            fx();
        }
    },

    /**
     * Returns OS correct path to temp file that starts with the persisted temp dir and ends with filename
     */
    getPersistedTempFilename: function(filename) {
        return top.getNativeFileName(this.getPersistedTempDirectory() + "/" + filename);
    },

    /**
     * Returns OS correct path to temp file that starts with temp dir and ends with filename
     */
    getTempFilename: function(filename) {
        return top.getNativeFileName(getEnv("LaunchPadTemp") + "/" + filename);
    },

    /**
     * Gets the temp directory to write persistent log files to.
     */
    getPersistedTempDirectory: function() {
        if (top.tempDir == null || !top.tempDir) {
            var now = new Date().getTime();
            tempDir = top.getNativeFileName(getEnv("LaunchPadTemp") + "/../IBM_LaunchPad_WSRR_" + now);

            // Create the new temp dir
            this.createDir(tempDir);

            top.tempDir = tempDir;
        }
        return top.tempDir;
    },

    /*
     * Check's if media is spanned
     * 
     * @return - Boolean value manifesting the spanned media option
     * 
     */
    checkMediaSpanned: function() {

        var isMediaSpanned = 'false'; // set default media spanned option to false

        // look for "msd" folder at media
        if (top.directoryExists(NO_DISKID, top.IMAGEDIR + 'msd')) {
            isMediaSpanned = 'true';
        }

        return isMediaSpanned;
    },

    /*
     * Getter method that return's the product update version
     */

    getUpdateVersion: function() {
        return property('launchpad.releaseVersionMSB') + property('launchpad.releaseVersionLSB') + property('launchpad.modificationLevel');
    },

    /*
     * Getter method that return's the product short version
     */

    getShortVersion: function() {
        return property('launchpad.releaseVersionMSB') + '.' + property('launchpad.releaseVersionLSB');
    },
    /*
     * Function which check's for initialization of given property
     * 
     */

    checkForNoProperty: function(propertyName, property) {
        var pattern = "** " + propertyName + " - NO PROPERTY **";
        if ((property == pattern) || (property.search("NO PROPERTY") >= 0)) {
            return true;
        } else {
            return false;

        }
    },

    isImInstallOrUpdateRequired: function() {
        var imProps = osHelper.getInstalledIMProperties();
        var isImInsatallOrUpdateRequired = true;
        if (imProps != null) {
            var versionInfo = this.parseVersionNumber(imProps.version);
            var reqVersion = this.parseVersionNumber(property('minIMVersion'));
            if (versionInfo.major < reqVersion.major) {
                // major version too small
            } else if (versionInfo.major == reqVersion.major && versionInfo.minor < reqVersion.minor) {
                // minor version too small
            } else if (versionInfo.minor == reqVersion.minor && versionInfo.service < reqVersion.service) {
                // service version too small
            } else {
                isImInsatallOrUpdateRequired = false;
            }
        }
        // returns true if IM is not found or IM update is required.
        return isImInsatallOrUpdateRequired;
    },

    changeClassDisplay: function(style, excludeStyle, display) {
        if (excludeStyle) {
            dojo.query(style + ":not(" + excludeStyle + ")").forEach(function(node) {
                node.style.display = display;
            });
        } else {
            dojo.query(style).forEach(function(node) {
                node.style.display = display;
            });
        }
    },

    isIMAGEDIRInitialized: function(pageName, callback) {
        try {
            if (!top.IMAGEDIR || top.IMAGEDIR == "undefined") {
                top.logInfo("IMAGEDir is uninitialized" + top.IMAGEDIR);
                setTimeout(function() {
                    this.isIMAGEDIRInitialized(pageName, callback);
                }, 500);
                return;
            } else {
                top.logInfo("calling page callback" + pageName);
                callback(pageName);
            }
        }
        catch (exception) {
            top.logError(exception);
        }
    },

    areConstantsInitialized: function(pageName) {
        if (top.OS == 'SunOS') {
            if (!top["is" + pageName + "Initialized"]) {
                this.isIMAGEDIRInitialized(pageName, this.areConstantsInitializedCallback);
            }
        }
    },

    areConstantsInitializedCallback: function(pageName) {
        top.logInfo("At" + pageName + " callback" + top.IMAGEDIR);
        top["is" + pageName + "Initialized"] = true;
        top.logInfo(window.location);
        window.location.reload();
    },

    /*
     * check if create database verification check is required or not.
     * 
     */
    isCreateDbCheckRequired: function(data) {
        return (!data.embedded && data.database.dbCreateNew);
    },

    /*
     * checks if a string contains upper case letters.
     */
    containUpperCaseLetters: function(value) {
        // match gives null if it does not contain upper case characters
        if (value && value.match(this.UPPERCASE_CHARACTERS_PATTERN)) {
            return true;
        } else {
            return false;
        }
    },

    /*
     * check if a string contains any special characters.
     */
    containSpecialChars: function(value) {
        // match gives null if the pattern comparison is not successful i.e. it does not create any invalid characters
        if (value && value.match(this.INVALID_CHARACTERS_PATTERN)) {
            return true;
        } else {
            return false;
        }
    },

    // Set repository location for 32/64 bit OS.
    getBpmProductRepoLocation: function(rootLocation) {

        var repoLocation = rootLocation + 'repository';
        return repoLocation;
    }

// ,
// Uncomment above comma and add comma-separated functions here. Do not leave a
// trailing comma after last element.
});