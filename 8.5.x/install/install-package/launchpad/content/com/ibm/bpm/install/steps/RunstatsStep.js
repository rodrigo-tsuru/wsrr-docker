// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
// Copyright IBM Corporation 2011, 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("com.ibm.bpm.install.steps.RunstatsStep");

dojo.require("com.ibm.bpm.install.steps.InstallStep");
dojo.require("com.ibm.bpm.install.utils.InstallUtils");
dojo.require("com.ibm.bpm.install.utils.InstallHelper");

dojo.declare("com.ibm.bpm.install.steps.RunstatsStep", [com.ibm.bpm.install.steps.InstallStep
], {

    // Points for this step.
    points: 50,
    // Expected size of the output file when completed.
    expectedSize: 18820093,
    // Data reference.
    data: null,
    // Profile creation log file name
    logFilename: null,
    // Profile filename base
    runstatsFilename: null,

    constructor: function() {
    },

    /*
     * Code to run to execute this step
     */
    execute: function(data) {
        this.data = data;
        this.continueMessage = property("install.cancel.runstats.succeed");

        // Create filename base for runstats.
        util = new com.ibm.bpm.install.utils.InstallHelper();
        this.runstatsFilename = util.getPersistedTempFilename("runstats");

        // Basic create info
        var runstatsCommand = top.getNativeFileName(this.data.location + "/WSRR/dbscripts/db2/runstats");

        if (top.OSTYPE == 'windows') {
            runstatsCommand += ".bat";
            runstatsCommand = this.data.location + "/db2/bin/db2cmd.exe -c -w -i " + runstatsCommand;
        } else {
            runstatsCommand += ".sh";
        }

        // runstats options (dbname, schema, user, password)
        var user = this.data.embedded.instance_user;
        if (top.isWindows()) {
            user = this.data.database.dbUserId;
        }
        var options = this.data.database.dbName+" WSRR " + user + " \"" + this.data.database.dbSysPassword_plainText + "\" " + this.data.location + "/db2/bin";
        if (this.data.embedded && this.data.isWsrr) {
            // Kick off runstats.
            com.ibm.bpm.install.utils.InstallUtils.runstats(runstatsCommand, options, user, this.runstatsFilename);
        }
    },

    /*
     * Returns the current number of points completed by this step and the current status text to display
     */
    getProgress: function() {

        return {
            points: this.points,
            text: property("wizard.runstats")
        };
    },

    /*
     * Returns true if the step has completed, false otherwise
     */
    isDone: function() {
        var exists = top.fileExists(this.runstatsFilename + ".done");
        return exists;
    },

    /*
     * Returns the success/failure status and any messages
     */
    getResult: function() {

        if (this.data.embedded && this.data.isWsrr) {
            // Read install process completion
            var runstatsResultText = top.readTextFile(this.runstatsFilename + ".done", "ASCII");
            var runstatsResult = dojo.fromJson(runstatsResultText);
            this.success = runstatsResult.isSuccess;
        } else {
            this.success = true;
        }
        // Add message pointing to the log file     
        if (!this.success) {
            var filename = com.ibm.bpm.install.utils.InstallUtils.getCanonicalFilename(this.runstatsFilename);
            this.messages[this.messages.length] = new com.ibm.bpm.install.utils.Message("info", top.formatmsg(property("install.readLog"), filename + ".sysout"));
            this.messages[this.messages.length] = new com.ibm.bpm.install.utils.Message("info", top.formatmsg(property("install.readLog"), filename + ".syserr"));
        }

        return {
            success: this.success,
            messages: this.messages
        };
    }

});
