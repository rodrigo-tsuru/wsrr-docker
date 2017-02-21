// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS 
// Copyright IBM Corporation 2011, 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("com.ibm.bpm.install.ui.widgets.dialog.UpdateAuthenticationDialog");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.Form");
dojo.require("dijit.Dialog");

dojo.declare("com.ibm.bpm.install.ui.widgets.dialog.UpdateAuthenticationDialog", [
    dijit._Widget,
    dijit._Templated
], {
    // Template information
    templatePath: dojo.moduleUrl("com.ibm.bpm.install.ui.widgets.dialog.UpdateAuthenticationDialog",
        "../templates/UpdateAuthenticationDialog.html"),
    widgetsInTemplate: true,
    labels: {},
    _connections: null,

    // Widget information
    callerOkCallback: null,
    callerCancelCallback: null,
    errorFlag: null,

    // Load all labels
    postMixInProperties: function() {
        this.inherited(arguments);

        this.labels.TITLE = property('titleString');
        this.labels.DIRECTIONTEXT = property("directionText");
        this.labels.CANCELINFORMATION = property("cancelInformation");

        this.labels.USERNAME = property("labelName");
        this.labels.PASSWORD = property("labelPassword");

        this.labels.OK = "Login";
        this.labels.CANCEL = "Cancel";

        if (this.errorFlag == true) {
            this.labels.FAILURETEXT = property("failureText");
        } else {
            this.labels.FAILURETEXT = "";
        }
    },

    // @Override
    postCreate: function() {
        this.inherited(arguments);
        this._connections = new Array();

        // Register connection for buttons
        this._connections.push(dojo.connect(this.okButton, "onClick", this, this.okCallback));
        this._connections.push(dojo.connect(this.cancelButton, "onClick", this, this.cancelCallback));
    },

    /*
     * Show method
     */
    show: function() {
        this.dialog.show();
    },

    /*
     * Hide method
     */
    hide: function() {
        this.dialog.hide();
        this.destroyRecursive();
    },

    okCallback: function() {
        this.callerOkCallback();
    },

    cancelCallback: function() {
        this.dialog.hide();
        this.callerCancelCallback();
        this.destroyRecursive();
    }
});
