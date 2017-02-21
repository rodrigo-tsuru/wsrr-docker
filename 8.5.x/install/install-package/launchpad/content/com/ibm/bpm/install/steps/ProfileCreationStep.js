// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
// Copyright IBM Corporation 2011, 2012. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("com.ibm.bpm.install.steps.ProfileCreationStep");

dojo.require("com.ibm.bpm.install.steps.InstallStep");
dojo.require("com.ibm.bpm.install.utils.InstallUtils");

dojo.require("dojo.string");

dojo.declare("com.ibm.bpm.install.steps.ProfileCreationStep", [com.ibm.bpm.install.steps.InstallStep
], {

    // Points for this step.
    points: 3030,
    // Expected size of the output file when completed.
    expectedSize: 18820093,
    // Data reference.
    data: null,
    // Process Center link reference.
    centerLink: null,
    // Profile creation log file name
    logFilename: null,
    // Profile filename base
    profileFilename: null,

    constructor: function(centerLink) {
        this.centerLink = centerLink;
    },

    /*
     * Code to run to execute this step
     */
    execute: function(data) {
        this.data = data;
        this.continueMessage = property("install.cancel.profile.succeed");

        // Create filename base for manageprofiles.
        util = new com.ibm.bpm.install.utils.InstallHelper();
        this.profileFilename = util.getPersistedTempFilename("manageprofiles");

        // Basic create info
        var manageprofilesCommand = top.getNativeFileName(this.data.location + "/bin/manageprofiles");

        if (top.OSTYPE == 'windows') {
            manageprofilesCommand += ".bat";
        } else {
            manageprofilesCommand += ".sh";
        }

        // Add default profile options
        this.data.profile.winserviceCheck = false;
        this.data.profile.enableService = false;

        // Get the profile and template file name
        var profileName = null;
        var template = null;
        profileName = "WSRRSrv01";
        template = top.getNativeFileName(this.data.location + "/profileTemplates/default.wsrr");
        // Set template path
        this.data.profile.templatePath = template;

        // Set profile name
        this.data.profileName = profileName;

        // Set profile creation log filename
        this.logFilename = top.getNativeFileName(this.data.location + "/logs/manageprofiles/" + profileName + "_create.log");

        // Start initial profile creation string.
        var options = "-create";
        var instanceName = "bpminst";

        // If WSRR and using db2 express then ensure the passwords are not encrypted
        if (this.data.embedded && this.data.isWsrr) {
            if (top.isWindows()) {
                this.data.database.dbServerPort = parseInt(com.ibm.bpm.install.utils.InstallUtils.getDB2Port(instanceName));
                this.data.embedded.admin_pw = this.data.embedded.admin_pw_plainText;
                this.data.database.dbPassword = this.data.database.dbPassword_plainText;
                this.data.database.dbSysPassword = this.data.database.dbSysPassword_plainText;
            } else {
                this.data.database.dbServerPort = parseInt(com.ibm.bpm.install.utils.InstallUtils.getDB2Port(this.data.embedded.instance_user));
                this.data.embedded.instance_pw = this.data.embedded.instance_pw_plainText;
                this.data.embedded.fenced_pw = this.data.embedded.fenced_pw_plainText;
                this.data.embedded.das_pw = this.data.embedded.das_pw_plainText;
                this.data.database.dbPassword = this.data.database.dbPassword_plainText;
                this.data.database.dbSysPassword = this.data.database.dbSysPassword_plainText;
            }
        }

        // Append all profile options
        for ( var prop in this.data.profile) {
            if (prop != 'isProdLic') {
                options = options + " -" + prop + " " + this.data.profile[prop];
            }
        }

        // Append all database options
        for ( var prop in this.data.database) {
            if (!com.ibm.bpm.install.utils.InstallUtils.endsWith(prop, "_plainText")) {
                options = options + " -" + prop + " " + this.data.database[prop];
            }
        }

        // Append all special profile options
        for ( var prop in this.data.profileSpecial) {
            options = options + " -" + prop + " " + this.data.profileSpecial[prop];
        }

        // Kick off profile creation.
        com.ibm.bpm.install.utils.InstallUtils.createProfile(manageprofilesCommand, options, this.profileFilename);
    },

    /*
     * Returns the current number of points completed by this step and the current status text to display
     */
    getProgress: function() {

        var completedPoints = 0;

        if (this.logFilename) {
            var percent = com.ibm.bpm.install.utils.InstallUtils.checkFileProgress(this.logFilename, this.expectedSize);
            completedPoints = percent * this.points;
        }

        return {
            points: completedPoints,
            text: property("wizard.creatingProfile")
        };
    },

    /*
     * Returns true if the step has completed, false otherwise
     */
    isDone: function() {
        var exists = top.fileExists(this.profileFilename + ".done");
        return exists;
    },

    /*
     * Returns the success/failure status and any messages
     */
    getResult: function() {

        // Read install process completion
        var profileResultText = top.readTextFile(this.profileFilename + ".done", "ASCII");
        var profileResult = dojo.fromJson(profileResultText);
        this.success = profileResult.isSuccess;

        // Read the install log
        var txt = top.readTextFile(this.logFilename, "UTF-8");
        if (txt) {
            var index = txt.indexOf("INSTCONFFAILED");
            if (index != -1) {
                logger.logMessage(property("log.error.profile.fail"));
                this.success = false;
            }
        }

        // Add message pointing to the log file
        if (!this.success) {
            var filename = com.ibm.bpm.install.utils.InstallUtils.getCanonicalFilename(this.profileFilename);
            this.messages[this.messages.length] = new com.ibm.bpm.install.utils.Message("info", top.formatmsg(property("install.readLog"),
                this.logFilename));
            this.messages[this.messages.length] = new com.ibm.bpm.install.utils.Message("info", top.formatmsg(property("install.readLog"),
                filename + ".sysout"));
            this.messages[this.messages.length] = new com.ibm.bpm.install.utils.Message("info", top.formatmsg(property("install.readLog"),
                filename + ".syserr"));
        }

        // If success, read the port number
        if (this.success && this.data.type == "center") {
            var portdefFile = top
                .getNativeFileName(this.data.location + "/profiles/" + this.data.profileName + "/properties/portdef.props");
            var portdefs = top.readTextFile(portdefFile, "UTF-8");
            var portLinePattern = /WC_defaulthost=\d+/;
            var portLine = "" + portdefs.match(portLinePattern);
            var port = portLine.split("=")[1];
            this.data.pcPort = port;
            logger.logMessage(property("log.info.pc.port") + " " + port);
            this.centerLink.innerHTML = top.formatmsg("http://%1:%2/ProcessCenter", this.data.profile.hostName, port);
        }

        return {
            success: this.success,
            messages: this.messages
        };
    }

});
