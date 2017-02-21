// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS 
// Copyright IBM Corporation 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("com.ibm.bpm.install.ui.widgets.dialog.InsertDiskDialog");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.Dialog");

dojo.require("com.ibm.bpm.install.ui.widgets.textbox.ValidationTextBox");
dojo.require("com.ibm.bpm.install.utils.InstallUtils");

dojo.declare("com.ibm.bpm.install.ui.widgets.dialog.InsertDiskDialog", [
    dijit._Widget,
    dijit._Templated
], {

    // Template information
    templatePath: dojo.moduleUrl("com.ibm.bpm.install.ui.widgets.dialog.InsertDiskDialog", "../templates/InsertDiskDialog.html"),
    widgetsInTemplate: true,
    labels: {},
    _connections: null,

    // Widget information
    continueCallback: null,
    cancelCallback: null,

    // Load all labels
    postMixInProperties: function() {
        this.inherited(arguments);

        this.labels.TITLE = property("install.insertDisk.title");
        this.labels.WTE_INSERT_DISK = top.formatmsg(property("installing.info.wte.disk.insert"), this.getDiskEnvironment());

        this.labels.CANCEL = property("wizard.cancel");
        this.labels.OK = property("ok");
    },

    getDiskEnvironment: function() {
        var environment;

        if (top.isWindows()) {
            if (top.ARCHITECTURE.indexOf("64") != -1) {
                environment = property("windows.64bit");
            } else {
                environment = property("windows.32bit");
            }
        } else {
            if (top.ARCHITECTURE.indexOf("64") != -1) {
                environment = property("linux.64bit");
            } else {
                environment = property("linux.32bit");
            }
        }
        return environment;
    },

    // @Override
    postCreate: function() {
        this.inherited(arguments);
        this._connections = new Array();

        // Setup connection for buttons
        this._connections.push(dojo.connect(this.okButton, "onClick", this, "_continue"));
        this._connections.push(dojo.connect(this.cancelButton, "onClick", this, "_cancel"));
    },

    /*
     * Show method to show the dialog.
     */
    show: function() {
        this.dialog.show();
    },

    _cancel: function() {
        this.dialog.hide();
        this.cancelCallback();
        this.destroyRecursive();
    },

    _continue: function() {
        this.dialog.hide();
        this.continueCallback();

        // destroyRecursive is done by the callee, if conditions are met
        // this.destroyRecursive();
    }

});
