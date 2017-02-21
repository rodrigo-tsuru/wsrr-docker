// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS 
// Copyright IBM Corporation 2011, 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("com.ibm.bpm.install.ui.widgets.dialog.ContinueDialog");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.Dialog");

dojo.declare("com.ibm.bpm.install.ui.widgets.dialog.ContinueDialog", [
    dijit._Widget,
    dijit._Templated
], {

    // Template information
    templatePath: dojo.moduleUrl("com.ibm.bpm.install.ui.widgets.dialog.ContinueDialog", "../templates/ContinueDialog.html"),
    widgetsInTemplate: true,
    labels: {},
    _connections: null,

    // Widget information
    continueMessage: null,
    continueCallback: null,
    cancelCallback: null,

    // Load all labels
    postMixInProperties: function() {
        this.inherited(arguments);
        this.labels.TITLE = property("install.cancel.title");
        this.labels.CANCEL = property("install.cancel");
        this.labels.YES = property("yes");
        this.labels.NO = property("no");
    },

    // @Override
    postCreate: function() {
        this.inherited(arguments);
        this._connections = new Array();

        // Setup connection for buttons
        this._connections.push(dojo.connect(this.yesButton, "onClick", this, "_cancel"));
        this._connections.push(dojo.connect(this.noButton, "onClick", this, "_continue"));
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
        this.destroyRecursive();
    }

});
