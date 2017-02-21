// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
// Copyright IBM Corporation 2011, 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("com.ibm.bpm.install.ui.widgets.panel.CenterPane");

dojo.require("dojox.widget.Wizard");
dojo.require("dijit._Templated");

dojo.require("dijit.form.Form");
dojo.require("dijit.form.Button");

dojo.require("com.ibm.bpm.install.utils.InstallUtils");

dojo.require("com.ibm.bpm.install.ui.widgets.textbox.ValidationTextBox");
dojo.require("com.ibm.bpm.install.ui.widgets.textbox.LocationTextBox");
dojo.require("com.ibm.bpm.install.ui.widgets.panel.BPMWizardPane");

dojo.require("com.ibm.bpm.install.utils.InstallHelper");
dojo.require("com.ibm.bpm.install.SOEFactory");
/*
 * Process Center information pane.
 */
dojo.declare("com.ibm.bpm.install.ui.widgets.panel.CenterPane", [
    com.ibm.bpm.install.ui.widgets.panel.BPMWizardPane,
    dijit._Templated
], {

    // Template information
    templatePath: dojo.moduleUrl("com.ibm.bpm.install.ui.widgets.panel.CenterPane", "../templates/CenterPane.html"),
    widgetsInTemplate: true,

    // Labels that will be displayed on the page
    labels: {},
    // Current connections
    _connections: null,

    // Pane variables
    initialized: false,
    installSize: -1,

    // @Override
    postMixInProperties: function() {
        this.inherited(arguments);

        // Load all labels
        this.labels.STEP1 = property("step1");
        this.labels.STEP2 = property("step2");
        this.labels.STEP3 = property("step3");
        this.labels.INSTALLING_PROCESS_CENTER = property("installing.wsrr");
        this.labels.INSTALLING_PROCESS_CENTER_DESCRIPTION = property("installing.wsrr.description");
        this.labels.SELECT_HOSTNAME = property("select.hostname");
        this.labels.HOSTNAME = property("hostname");
        this.labels.SELECT_LOCATION = property("select.location");
        this.labels.LOCATION = property("location");
        this.labels.BROWSE = property("browse");
        this.labels.PASSWORD = property("password");
        this.labels.CONFIRM_PASSWORD = property("WSRR.confirm.password");
        this.labels.WSRR_DEFAULT_PASSWORD = property("WSRR.default.password");

        // Get the product installation size and if we can install process designer.
        this.installSize = com.ibm.bpm.install.utils.InstallUtils.getProductInstallSize(this.data, "center");
    },

    // @Override
    postCreate: function() {
        this.inherited(arguments);
        this._connections = new Array();

        // Setup connection for browse button
        this._connections.push(dojo.connect(this.browseButton, "onClick", this, "onClickBrowse"));

        // Setup validation for the confirm password box
        if (this.data.isWsrr) {
            this.confirmWsrrPassword.validator = dojo.hitch(this, this.confirmPassword);
            this.confirmWsrrPassword.intermediateChanges = false;
            this.confirmWsrrPassword.invalidMessage = property("WSRR.password.not.match");
        }

        // Initialize fields to valid values
        if (this.data.defaultHostname) {
            this.hostName.attr("value", this.data.defaultHostname);
            this.initialized = true;
        }
    },

    // @Override
    startup: function() {
        this.inherited(arguments);
    },

    // @Override
    onShow: function() {
        this.inherited(arguments);

        // Update installSize if we previously came from the server path.
        this.data.installSize = this.installSize;

        // For performance sake we started the wizard before hostname was known, if we still don't have hostname set, do
        // so now.
        if (!this.initialized) {

            this.initialized = true;

            // Set hostname
            if (this.data.defaultHostname) {
                this.hostName.attr("value", this.data.defaultHostname);
            } else {
                // You would have to be super fast to get here
                this.hostName.attr("value", com.ibm.bpm.install.utils.InstallUtils.getHostname());
            }
        }
    },

    // Handle browse button click
    onClickBrowse: function() {
        var path = com.ibm.bpm.install.utils.InstallUtils.openBrowseDialog();
        if (path) {
            this.location.attr("value", path);
        }
    },

    // Confirm that the two password fields are equal.
    confirmPassword: function() {
        var password1 = this.wsrrPassword.attr("value");
        var password2 = this.confirmWsrrPassword.attr("value");
        return (password1 == password2);
    },

    // @Override
    // Determine if next button can proceed the wizard and set the relevant data.
    passFunction: function() {
        this.location.passFunction(this.hostName.attr("value"));
        var pass = this.pcForm.validate();
        if (pass) {
            var formData = this.pcForm.attr("value");

            // Set the install size.
            this.data.installSize = this.installSize;

            // Set the location and hostname
            this.data.location = formData.location;
            this.data.profile = {
                hostName: formData.hostName
            };

            // Set the install type and default admin user/pass
            if (this.data.isWsrr) {
                this.data.type = "wsrr";
                this.data.profile.adminUserName = "wasadmin";
                this.data.profile.adminPassword = formData.wsrrPassword;
            } else {
                this.data.type = "center";
                this.data.profile.adminUserName = "admin";
                this.data.profile.adminPassword = "admin";
            }
        }

        return pass;
    }

});
