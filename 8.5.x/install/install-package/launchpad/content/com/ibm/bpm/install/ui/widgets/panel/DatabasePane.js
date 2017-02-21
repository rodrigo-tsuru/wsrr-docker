// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS 
// Copyright IBM Corporation 2011, 2012. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("com.ibm.bpm.install.ui.widgets.panel.DatabasePane");

dojo.require("dojox.widget.Wizard");
dojo.require("dijit._Templated");
dojo.require("dijit.form.RadioButton");
dojo.require("dijit.ProgressBar");

/*
 * Embedded DB2 / Existing database selection pane.
 */
dojo.declare("com.ibm.bpm.install.ui.widgets.panel.DatabasePane", [
    dojox.widget.WizardPane,
    dijit._Templated
], {

    // Template information
    templatePath: dojo.moduleUrl("com.ibm.bpm.install.ui.widgets.panel.DatabasePane", "../templates/DatabasePane.html"),
    widgetsInTemplate: true,

    // Labels that will be displayed on the page
    labels: {},
    // Current connections
    _connections: null,
    updateInterval: 2000,
    checkInterval: 100,

    // Existing database pane reference.
    existingDatabasePane: null,
    defaultSet: false,

    // @Override
    postMixInProperties: function() {
        this.inherited(arguments);

        // Load all labels
        this.labels.SELECT_DB_CONFIG = property("select.database.configuration");
        this.labels.SELECT_DB_CONFIG_DESCRIPTION = property("select.database.configuration.description");
        this.labels.INSTALL_DB2 = property("install.database.DB2");
        this.labels.INSTALL_EXISTING = property("install.database.existing");
    },

    // @Override
    onShow: function() {
        this.inherited(arguments);

        // If this is the first time shown, set the DB2 Express defaults
        if (!this.data.database && !this.defaultSet) {
            this.defaultSet = true;
            this.setDb2ExpressDefaults();
        }

        // If embedded is the current selection, update the client selectable values if needed
        if (this.data.embedded) {
            this.data.database.dbHostName = this.data.profile.hostName;
        }
    },

    // @Override
    // Hide the Progress Bar when the user moves on to another screen
    onHide: function() {
        this.inherited(arguments);

        this.data.wizard.status.style.display = "none";
        this.data.wizard.progressBar.domNode.style.display = "none";

    },
    closeProgressBar: function() {
        this.data.wizard.status.style.display = "none";
        this.data.wizard.progressBar.domNode.style.display = "none";
    },

    showProgressBar: function() {

        this.data.wizard.progressBar.update({
            'indeterminate': false,
            'progress': 0
        });
        this.data.wizard.progressBar.domNode.style.display = "";
        this.data.wizard.nextButton.attr("disabled", true);
        this.data.wizard.previousButton.attr("disabled", true);
        this.data.wizard.status.innerHTML = "";
        this.data.wizard.status.style.display = "";
    },

    updateProgressBar: function(tag, percent) {

        var message;

        if (tag == 'fixpack') {
            message = property("progress.fix.check");
        } else if (tag == 'fix') {
            message = property("progress.fix.check");
        } else if (tag == 'start') {
            message = property("progress.fixpack.check");
        }

        this.data.wizard.progressBar.update({
            'progress': percent
        });
        this.data.wizard.status.innerHTML = message;
    },

    // @Override
    passFunction: function() {

        /*
         * this.data.wizard.progressBar.update({'indeterminate': false, 'progress' : 0});
         * this.data.wizard.progressBar.domNode.style.display = ""; this.data.wizard.nextButton.attr("disabled", true);
         * this.data.wizard.status.innerHTML = ""; this.data.wizard.status.style.display = "";
         * this.data.wizard.progressBar.update({'progress' : 50}); this.data.wizard.status.innerHTML =
         * property("progress.fixpack.check"); this.data.wizard.progressBar.update({'progress' : 75});
         * this.data.wizard.status.innerHTML = property("progress.fix.check");
         * 
         */
        /*
         * if (this.embedded.checked) { //check for fix pack(s) and fixe(s) if embedded path
         * 
         * top.onUpdateStep = false;
         * 
         * logger.logMessage('initializing check for updates');
         * 
         * var updateInstance = com.ibm.bpm.install.utils.Updates(); updateInstance.callerReference = this;
         * 
         * logger.logMessage('about to start check for updates');
         * 
         * updateInstance.start();
         * 
         * logger.logMessage('end of getting updates at database pane'); logger.logMessage('returing from passfunction
         * with value '+top.onUpdateStep); return top.onUpdateStep; }
         */
    },

    goToNextPane: function() {
        this.data.wizard.forward();
    },

    // Set the DB2 Express defaults
    setDb2ExpressDefaults: function() {

        var response;
        this.data.embedded = {};
        this.data.dbType = "DB2";

        // port value is replaced in ProfileCreationStep
        this.data.database = {
            dbType: "DB2_DATASERVER",
            dbHostName: this.data.profile.hostName,
            dbServerPort: 50000,
            dbName: "WSRRDB",
            dbCreateNew: true,
            dbSchemaName: "WSRR"
        };

        if (top.isWindows()) {
            this.data.embedded.admin_user = "db2admin";
            this.data.embedded.admin_pw = this.data.profile.adminPassword;
            this.data.embedded.admin_pw_plainText = this.data.profile.adminPassword;
            this.data.database.dbUserId = "db2admin";
            this.data.database.dbPassword = this.data.profile.adminPassword;
            this.data.database.dbPassword_plainText = this.data.profile.adminPassword;
            this.data.database.dbSysUserId = "db2admin";
            this.data.database.dbSysPassword = this.data.profile.adminPassword;
            this.data.database.dbSysPassword_plainText = this.data.profile.adminPassword;
        } else {
            // _plainText used by WSRR
            this.data.embedded.instance_user = "db2inst";
            this.data.embedded.instance_pw = this.data.profile.adminPassword;
            this.data.embedded.instance_pw_plainText = this.data.profile.adminPassword;

            this.data.embedded.fenced_user = "db2fenc";
            this.data.embedded.fenced_pw = this.data.profile.adminPassword;
            this.data.embedded.fenced_pw_plainText = this.data.profile.adminPassword;
            response = com.ibm.bpm.install.utils.InstallUtils.doesUidExist(this.data.embedded.fenced_user, top.OS);
            if (response.isExists == true) {
                this.data.embedded.fenced_newuser = "false";
            } else {
                this.data.embedded.fenced_newuser = "true";
            }

            this.data.embedded.das_user = "dasusr";
            this.data.embedded.das_pw = this.data.profile.adminPassword;
            this.data.embedded.das_pw_plainText = this.data.profile.adminPassword;

            response = com.ibm.bpm.install.utils.InstallUtils.doesUidExist(this.data.embedded.das_user, top.OS);
            if (response.isExists == true) {
                this.data.embedded.das_newuser = "false";
            } else {
                this.data.embedded.das_newuser = "true";
            }

            this.data.database.dbUserId = "db2inst";
            this.data.database.dbPassword = this.data.profile.adminPassword;
            this.data.database.dbPassword_plainText = this.data.profile.adminPassword;

            this.data.database.dbSysUserId = "db2inst";
            this.data.database.dbSysPassword = this.data.profile.adminPassword;
            this.data.database.dbSysPassword_plainText = this.data.profile.adminPassword;
        }

    },

    // Handler for radio button changes
    onChangeSelection: function() {

        // Clear out the relevant data
        delete this.data.embedded;
        delete this.data.database;

        // Get our index in the wizard
        var children = this.data.wizard.getChildren();
        var index = dojo.indexOf(children, this);

        // Alter wizard flow to select either client or server next
        if (this.embedded.checked) {
            this.data.wizard.removeChild(this.existingDatabasePane);
            // Set the DB2 Express defaults.
            this.setDb2ExpressDefaults();
        } else {
            this.data.wizard.addChild(this.existingDatabasePane, index + 1);
        }
    }
});
