/***********************************************************************************************************************
 * Licensed Materials - Property of IBM
 * 
 * 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
 * 
 * (C) Copyright IBM Corp. 2011, 2013. All Rights Reserved.
 * 
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with
 * IBM Corp. **********************************************
 */
dojo.provide("com.ibm.bpm.install.ui.widgets.textbox.LocationTextBox");

dojo.require("com.ibm.bpm.install.ui.widgets.textbox.ValidationTextBox");
dojo.require("com.ibm.bpm.install.SOEFactory");

/*
 * ValidationTextBox for installation Locations
 */
dojo.declare("com.ibm.bpm.install.ui.widgets.textbox.LocationTextBox", [com.ibm.bpm.install.ui.widgets.textbox.ValidationTextBox
], {

    // Variables for calculating expected size
    installSize: -1,
    maxDirLength: -1,

    // @Override
    // Set default value, messages, and size restrictions.
    postCreate: function() {
        this.inherited(arguments);
        osHelperFactory = new com.ibm.bpm.install.SOEFactory();
        osHelper = osHelperFactory.getOS(top.OS, top.ARCHITECTURE);

        this.attr("value", osHelper.getDefaultWasHome());
        // Translate MB to GB with one decimal for printing.
        var requiredGb = (this.installSize / 1024).toFixed(1);

        // Get the maximum directory length on windows
        this.maxDirLength = parseInt(property("windows.dirLength.maximum"));

        // Add error messages to location
        this.messages = {
            "read_write": property("validation.field.dir.read_write"),
            "empty": property("validation.field.dir.empty"),
            "null": property("validation.field.required"),
            "size": top.formatmsg(property("validation.field.dir.size"), "" + requiredGb),
            "subdir": property("validation.field.dir.subdir")
        };
        this.missingMessage = this.messages["null"];
    },

    // One time validation to occur when next is clicked.
    passFunction: function(hostname) {

        var dir = this.attr("value");

        // Get the directory info and test it for any issues.
        var dirInfo = com.ibm.bpm.install.utils.InstallUtils.getDirectoryInfo(dir, "status");

        if (dirInfo && (!dirInfo.isReadable || !dirInfo.isWritable)) {
            this.forceError("read_write");
            return;
        }

        if (dirInfo && !dirInfo.isEmpty) {
            this.forceError("empty");
            return;
        }

        if (dirInfo && dirInfo.availableSize <= this.requiredSize) {
            this.forceError("size");
            return;
        }

        // Check max directory length given the hostname
        if (top.isWindows() & hostname != null) {

            var nodeName = hostname;
            var index = nodeName.indexOf(".");
            if (index != -1) {
                nodeName = nodeName.substring(0, index);
            }
            nodeName += "Node01";

            var nodeNameDoubleLength = (nodeName.length * 2);
            var maxAvailableLength = this.maxDirLength - nodeNameDoubleLength;
            this.messages["length"] = top.formatmsg(property("validation.field.dir.length"), "" + maxAvailableLength);

            var totalPathLength = dir.length + nodeNameDoubleLength;
            if (totalPathLength > this.maxDirLength) {
                this.forceError("length");
                return;
            }
        }
    }

});
