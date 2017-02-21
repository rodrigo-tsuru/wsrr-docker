// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
// Copyright IBM Corporation 2011, 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("com.ibm.bpm.install.steps.PrereqCheckStep");

dojo.require("com.ibm.bpm.install.steps.InstallPauseStep");
dojo.require("com.ibm.bpm.install.utils.InstallUtils");

/*
 * Installation step to check the prereqs before install.
 */
dojo.declare("com.ibm.bpm.install.steps.PrereqCheckStep", [com.ibm.bpm.install.steps.InstallPauseStep
], {

    // Step properties
    points: 30,
    // Ulimit minimum
    ulimitMin: null,

    constructor: function() {
        this.ulimitMin = parseInt(property("ulimit.min"));
    },

    /*
     * Code to run to execute this step
     */
    execute: function(data) {

        // Get required size
        var requiredSize = data.installSize;

        // Add database size if using embedded db2
        if (data.embedded) {
            requiredSize += parseInt(property("DB2.size"));
        }

        // Add profile size
        requiredSize += parseInt(property("WSRR.profile.size"));

        // Add Database size if windows
        if (top.isWindows()) {
            requiredSize += parseInt(property("WSRR.DB2.database.size"));
        }

        // Check main installation directory for size.
        var response = com.ibm.bpm.install.utils.InstallUtils.getDirectoryInfo(data.location, "status");

        if (response.availableSize <= requiredSize) {
            // Translate MB to GB with one decimal for printing.
            var requiredGb = (requiredSize / 1024).toFixed(1);

            var errorMsg = top.formatmsg(property('validation.dir.size'), data.location, requiredGb + "");
            this.messages[this.messages.length] = new com.ibm.bpm.install.utils.Message("error", errorMsg);
        }

        if (data.embedded && top.isWindows()) {

            var db2DatabaseInstanceDir = data.location.substring(0, 3) + "\BPMINST";

            response = com.ibm.bpm.install.utils.InstallUtils.getDirectoryInfo(db2DatabaseInstanceDir, "exists");

            if (response.exists == true) {

                var errorMsg = top.formatmsg(property('validation.dir.shouldnotexist'), 'BPMINST', db2DatabaseInstanceDir);
                this.messages[this.messages.length] = new com.ibm.bpm.install.utils.Message("error", errorMsg);

            }

            response = com.ibm.bpm.install.utils.InstallUtils.doesUidExist(data.embedded.admin_user, top.OS);

            if (response.isExists == true) {

                var location = top.IMAGEDIR + "launchpad/content/scripts/AZY_PasswordChecker.exe";
                response = com.ibm.bpm.install.utils.InstallUtils.verifyPassword(location, data.embedded.admin_user,
                    data.database.dbPassword, top.OS);

                if (response.isValid != true) {

                    var errorMsg = top.formatmsg(property('validation.userId.inValidPassword.wsrr'), data.embedded.admin_user);
                    this.messages[this.messages.length] = new com.ibm.bpm.install.utils.Message("error", errorMsg);

                }

            } else if (response.isExists == false) {

                var location = top.IMAGEDIR + "launchpad/content/scripts/AZY_PrecheckPassword.exe";
                response = com.ibm.bpm.install.utils.InstallUtils.isPasswordValid(location, data.embedded.admin_user,
                    data.database.dbPassword, top.OS);

                if (response.isValid != true) {
                    var errorMsg = top.formatmsg(property('validation.password.inValidPassword.wsrr'),data.embedded.admin_user);
                    this.messages[this.messages.length] = new com.ibm.bpm.install.utils.Message("error", errorMsg);
                }

            }

        }

        // Check database required size for embedded DB2
        if (data.embedded && !top.isWindows()) {
            var db2DatabaseDir = "/home";

            response = com.ibm.bpm.install.utils.InstallUtils.getDirectoryInfo(db2DatabaseDir, "status");

            var db2DatabaseSize = parseInt(property("WSRR.DB2.database.size"));

            if (response.availableSize <= db2DatabaseSize) {
                // Translate MB to GB with one decimal for printing.
                var requiredGb = (db2DatabaseSize / 1024).toFixed(1);

                var errorMsg = top.formatmsg(property('validation.dir.size'), db2DatabaseDir, requiredGb + "");
                this.messages[this.messages.length] = new com.ibm.bpm.install.utils.Message("error", errorMsg);
            }

            response = com.ibm.bpm.install.utils.InstallUtils.doesUidExist(data.database.dbUserId, top.OS);

            if (response.isExists == true) { // yes user exists
                var location = top.IMAGEDIR + "launchpad/content/scripts/AZY_LinuxCheckPassword";
                response = com.ibm.bpm.install.utils.InstallUtils.verifyPassword(location, data.database.dbUserId,
                    data.database.dbPassword, top.OS);

                if (response.isValid != true) { // password is invalid
                    var errorMsg = top.formatmsg(property('validation.userId.inValidPassword.wsrr'), data.database.dbUserId);
                    this.messages[this.messages.length] = new com.ibm.bpm.install.utils.Message("error", errorMsg);

                } else if (response.isValid = true) { // password is valid
                    var validUser = com.ibm.bpm.install.utils.InstallUtils.getUserHomeDirectory(data.database.dbUserId);

                    if (validUser.homeDirectory != null) { // user home is valid
                        response = com.ibm.bpm.install.utils.InstallUtils.getDirectoryInfo(validUser.homeDirectory + "/"
                            + data.database.dbUserId, "exists");

                        if (response.exists == true) { // existing db 2 instance folder exists
                            var errorMsg = top.formatmsg(property('validation.dir.shouldnotexist'), data.database.dbUserId,
                                validUser.homeDirectory);
                            this.messages[this.messages.length] = new com.ibm.bpm.install.utils.Message("error", errorMsg);

                        }
                    }

                }
            }
        }

        // Check temp directory for size.
        var tempDir = top.getNativeFileName(top.getEnv("LaunchPadTemp"));
        response = com.ibm.bpm.install.utils.InstallUtils.getDirectoryInfo(tempDir, "status");

        var tempSize = parseInt(property("temp.size"));

        if (response.availableSize <= tempSize) {
            // Translate MB to GB with one decimal for printing.
            var requiredGb = (tempSize / 1024).toFixed(1);

            var errorMsg = top.formatmsg(property('validation.dir.temp.size'), tempDir, requiredGb + "");
            this.messages[this.messages.length] = new com.ibm.bpm.install.utils.Message("error", errorMsg);
        }

        // Check Installation Manager agent data location for minimal size
        var agentDataLocation;
        var currentUserImProperties = osHelper.getInstalledIMProperties();
        if (currentUserImProperties == null) {
            // set agentDataLocation to default location based on OS
            agentDataLocation = com.ibm.bpm.install.utils.InstallUtils.getDefaultInstallationManagerAgentDataLocation(osHelper
                .isCurrentUserAdministrator());
        } else {
            agentDataLocation = currentUserImProperties.appDataLocation;

            if (agentDataLocation == null) {
                // set agentDataLocation to default location based on OS
                agentDataLocation = com.ibm.bpm.install.utils.InstallUtils.getDefaultInstallationManagerAgentDataLocation(osHelper
                    .isCurrentUserAdministrator());

            }
        }
        if (agentDataLocation) {
            response = com.ibm.bpm.install.utils.InstallUtils.getDirectoryInfo(agentDataLocation, "status");

            var agentDataLocationSize = parseInt(property("agentDataLocation.minimum.size"));

            if (response.availableSize <= agentDataLocationSize) {
                // Translate MB to GB with one decimal for printing.
                var requiredGb = (agentDataLocationSize / 1024).toFixed(1);
                var errorMsg = top.formatmsg(property('validation.dir.IM.temp.size'), agentDataLocation, requiredGb + "");
                this.messages[this.messages.length] = new com.ibm.bpm.install.utils.Message("error", errorMsg);
            }
        }

        // Check ulimit if unix
        if (!top.isWindows()) {

            var ulimit = com.ibm.bpm.install.utils.InstallUtils.getUlimit();
            var ulimitProperty = "ulimit.number";
            var ulimitValue = parseInt(property(ulimitProperty));
            if (ulimit < ulimitValue) {
                var errorMsg = top.formatmsg(property('validation.ulimit'), ulimitValue + "");
                this.messages[this.messages.length] = new com.ibm.bpm.install.utils.Message("error", errorMsg);
            }
        }

        // Check if user can create databases
        if (util.isCreateDbCheckRequired(data)) {
            com.ibm.bpm.install.utils.InstallUtils.determineDb2AdminMembership(data);

            // check if non admin user
            if (!osHelper.isCurrentUserAdministrator()) {
                if (!data.database.isExistingDb2AdminMember) {
                    var errorMsg = top.formatmsg(property('validation.groupMembership'), data.database.db2AdminGroupName);
                    this.messages[this.messages.length] = new com.ibm.bpm.install.utils.Message("error", errorMsg);
                }
            }
        }

        // Check overall success
        this.success = (this.messages.length == 0);
    },

    /*
     * Returns the current number of points completed by this step and the current status text to display
     */
    getProgress: function() {
        return {
            points: this.points,
            text: property("wizard.prereqCheck")
        };
    }

});
