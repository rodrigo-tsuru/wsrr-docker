// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS 
// Copyright IBM Corporation 2011, 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("com.ibm.bpm.install.ui.widgets.dialog.SuccessWSRRDialog");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.Dialog");

dojo.require("com.ibm.bpm.install.utils.Message");

dojo.declare("com.ibm.bpm.install.ui.widgets.dialog.SuccessWSRRDialog", [
    dijit._Widget,
    dijit._Templated
], {

    // Template information
    templatePath: dojo.moduleUrl("com.ibm.bpm.install.ui.widgets.dialog.SuccessWSRRDialog", "../templates/SuccessWSRRDialog.html"),
    widgetsInTemplate: true,
    labels: {},
    _connections: null,

    // Dialog properties
    data: null,

    // Load all labels
    postMixInProperties: function() {
        this.inherited(arguments);
        this.labels.TITLE = property("install.result");
        this.labels.SUCCESS = property("install.success");
        this.labels.QUICK_STEPS = property("install.firstSteps");
        this.labels.FIRST_STEPS = property("install.firstSteps");
        this.labels.NO = property("no");
        this.labels.YES = property("ok");
    },

    // @Override
    postCreate: function() {
        this.inherited(arguments);
        this._connections = new Array();
        // Setup connection for buttons
        this._connections.push(dojo.connect(this.yesButton, "onClick", this, "showFirstSteps"));
        this._connections.push(dojo.connect(this.noButton, "onClick", this, "hide"));
    },

    /*
     * Show method to show the dialog.
     */
    show: function() {
        this.dialog.show();
    },

    /*
     * Custom hide method that hides the dialog, then destroys this widget.
     */
    hide: function() {
        this.dialog.hide();
        this.destroyRecursive();
    },

    // Show first steps
    showFirstSteps: function() {
        this.dialog.hide();

        // Set first steps executable based on edition
        var firstSteps = this.data.profileName + "/firststeps/wsrr/launchpad";
        // Add file extension
        if (top.isWindows()) {
            firstSteps = this.data.profileName + "\\firststeps\\wsrr\\launchpad";
            firstSteps += ".exe";            
        } else {
            firstSteps += ".sh";
        }        
        runProgram('DISK1', command('firststeps', this.data.location, firstSteps), BACKGROUND, HIDDEN);
        this.destroyRecursive();
    }

});
