// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
// Copyright IBM Corporation 2011, 2012. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("com.ibm.bpm.install.ui.widgets.panel.WsrrDatabasePane");

dojo.require("dojox.widget.Wizard");
dojo.require("dijit._Templated");

dojo.require("dijit.form.Form");
dojo.require("dijit.form.Select");
dojo.require("dijit.form.CheckBox");

dojo.require("com.ibm.bpm.install.serviceability.product.Updates");

dojo.require("dijit.ProgressBar");

dojo.require("com.ibm.bpm.install.ui.widgets.textbox.DatabaseTextBox");
dojo.require("com.ibm.bpm.install.ui.widgets.textbox.PortTextBox");
dojo.require("com.ibm.bpm.install.ui.widgets.textbox.ValidationTextBox");

/*
 * Wsrr Existing Database Configuration pane.
 */
dojo.declare("com.ibm.bpm.install.ui.widgets.panel.WsrrDatabasePane", [
    dojox.widget.WizardPane,
    dijit._Templated
], {

    // Template information
    templatePath: dojo.moduleUrl("com.ibm.bpm.install.ui.widgets.panel.WsrrDatabasePane", "../templates/WsrrDatabasePane.html"),
    widgetsInTemplate: true,

    // Labels that will be displayed on the page
    labels: {},
    // Current connections
    _connections: null,
    updateInterval: 2000,

    // Full profile creation database names
    fullNames: {
        "DB2": "DB2_DATASERVER",
        "MSSQL": "MSSQLSERVER_MICROSOFT",
        "Oracle": "ORACLE"
    },

    // Have the connections been tested successfully?
    areConnectionsOk: false,

    // @Override
    postMixInProperties: function() {
        this.inherited(arguments);

        // Load all labels
        this.labels.STEP1 = property("step1");
        this.labels.STEP2 = property("step2");
        this.labels.STEP3 = property("step3");

        this.labels.EXISTING_DATABASE_SETUP = property("existing.database.setup");
        this.labels.EXISTING_DATABASE_SETUP_DESCRIPTION_1 = property("existing.database.setup.desc1");
        this.labels.EXISTING_DATABASE_SETUP_DESCRIPTION_2 = property("existing.database.setup.desc2");
        this.labels.EXISTING_DATABASE_SETUP_DESCRIPTION_3 = property("existing.database.setup.desc3");

        this.labels.TYPE = property("type");
        this.labels.HOSTNAME = property("hostname");
        this.labels.PORT = property("port");
        this.labels.USERNAME = property("username");
        this.labels.PASSWORD = property("password");

        this.labels.EXISTING_DATABASE_CONFIGURE_DB2 = property("existing.database.configure.db2");
        this.labels.EXISTING_DATABASE_CONFIGURE_OTHER = property("existing.database.configure.other");

        this.labels.WSRR_DATABASE = property("wsrr.dbName");
        this.labels.CREATE_DATABASE = property("existing.database.wsrr.create");
        this.labels.DATABASE_LOCATION = property("existing.database.wsrr.location");
        this.labels.BROWSE = property("browse");
        this.labels.ORACLE_OS_USER = property("existing.database.wsrr.oracle.user");
        this.labels.DATABASE_SYSTEM = property("existing.database.wsrr.system");
    },

    // @Override
    postCreate: function() {
        this.inherited(arguments);
        this._connections = new Array();

        // Setup connection for test connection button
        this._connections.push(dojo.connect(this.data.wizard.testConnectionButton, "onClick", this, "onClickTestDatabaseConnection"));

        // Setup connection for database type change
        this._connections.push(dojo.connect(this.dbType, "onChange", this, "onChangeDatabaseType"));

        // Setup connection for database created
        this._connections.push(dojo.connect(this.dbCreateNew, "onChange", this, "onChangeCreateDb"));

        // Set onClick for the Setup Instructions link
        this._connections.push(dojo.connect(this.setupInstructions, "onclick", this, function() {
            viewPage(NO_DISKID,
                'http://www.ibm.com/support/knowledgecenter/SSWLGF_8.5.5/com.ibm.sr.doc/twsr_typicalinstallation.html');
        }));

    },

    // @Override
    startup: function() {
        this.inherited(arguments);

        // Do initial create db stylings.
        this.onChangeCreateDb();
    },

    // @Override
    // On Show of the Pane, make the test connection button visible
    onShow: function() {
        this.inherited(arguments);
        this.data.wizard.testConnectionButton.domNode.style.display = "";

        // If we haven't shown this page before, set the defaults
        if (!this.areConnectionsOk) {
            this.onChangeDatabaseType();
        } else {
            this.resetStatus();
        }
    },

    // @Override
    // Hide the Test Database Connection button when the user moves on to another screen
    onHide: function() {
        this.inherited(arguments);
        this.data.wizard.testConnectionButton.domNode.style.display = "none";
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

    // Update the style.display for any node that has the given style class
    changeClassDisplay: function(style, display) {
        dojo.query(style).forEach(function(node) {
            node.style.display = display;
            var widget = dijit.getEnclosingWidget(node);
            if (widget instanceof com.ibm.bpm.install.ui.widgets.textbox.ValidationTextBox) {
                widget.attr("disabled", display == "none");
            }
        });
    },

    // Reset all status objects to non-pass and non-fail
    resetStatus: function() {
        this.areConnectionsOk = false;

        dojo.query(".test").forEach(function(node) {
            dojo.removeClass(node, "pass fail");
        });
    },

    // @Override
    passFunction: function() {
        top.onUpdateStep = false;

        // Catch missing and invalid size fields.
        var pass = this.dbForm.validate();

        // If no jdbc connection test has run on this data, do so now.
        if (pass && !this.areConnectionsOk) {
            this.onClickTestDatabaseConnection();
        }

        // Combine results for final check.
        pass = pass && this.areConnectionsOk;
        if (pass) {
            // Save data

            this.data.database = this.dbForm.attr("value");

            // Set dbType and full dbType name
            this.data.dbType = this.data.database.dbType;
            this.data.database.dbType = this.fullNames[this.data.dbType];
            // Set dbCreateNew
            if (this.data.dbType == "DB2") {
                this.data.database.dbCreateNew = this.dbCreateNew.checked;
            } else {
                this.data.database.dbCreateNew = false;
            }
            logger.logMessage('initializing check for updates');

            var updateInstance = com.ibm.bpm.install.serviceability.product.Updates();
            updateInstance.callerReference = this;
            this.data.UpdateOption = updateInstance.checkForAvailableUpdateOption();
            if (this.data.UpdateOption == 1) {

                updateInstance.processLocalUpdates();
                logger.logMessage('end of getting updates at database pane');
            } else {
                top.onUpdateStep = true;
                logger.logMessage('unable to do local updates');
            }

            logger.logMessage('end of getting updates at database pane');
        }

        logger.logMessage('returing from passfunction with value ' + top.onUpdateStep);
        return pass && top.onUpdateStep;
    },

    goToNextPane: function() {
        this.data.wizard.forward();
    },

    // Event Handling

    // Handle change of database create
    onChangeCreateDb: function() {
        var dbType = this.dbType.attr("value");
        var dbCreateNew = false;
        if ("DB2" == dbType) {
            dbCreateNew = this.dbCreateNew.checked;
        }
        this.dbSysUserId.attr("disabled", !dbCreateNew);
        this.dbSysPassword.attr("disabled", !dbCreateNew);
        this.oracleOSUser.attr("disabled", !dbCreateNew);
        this.data.wizard.testConnectionButton.attr("disabled", dbCreateNew);
        this.resetStatus();
    },

    // Handle change of database type selector
    onChangeDatabaseType: function() {

        var dbType = this.dbType.attr("value");

        // Hide all DB specific nodes
        this.changeClassDisplay(".MSSQL", "none");
        this.changeClassDisplay(".Oracle", "none");
        this.changeClassDisplay(".DB2", "none");

        // Hide and show all relevant nodes and set all defaults
        if ("DB2" == dbType) {
            // Set defaults
            this.dbName.innerHTML = property("wsrr.dbName");
            this.dbName.attr("value", "WSRRDB");

            // Set step2 label
            this.step2.innerHTML = this.labels.EXISTING_DATABASE_CONFIGURE_DB2;
        } else {

            // Set default offering name and value.
            if ("Oracle" == dbType) {
                // Set step2 label
                this.step2.innerHTML = this.labels.EXISTING_DATABASE_CONFIGURE_OTHER;
                this.dbName.innerHTML = property("wsrr.sid");
                this.dbName.attr("value", "WSRRDB1");
            } else {
                // Set step2 label
                this.step2.innerHTML = this.labels.EXISTING_DATABASE_CONFIGURE_DB2;
                this.dbName.innerHTML = property("wsrr.dbName");
                this.dbName.attr("value", "WSRRDB");
            }
        }

        // Show database type fields
        this.changeClassDisplay("." + dbType, "");

        // Update dbType in other text boxes
        this.dbServerPort.setDbType(dbType);
        this.dbName.setDbType(dbType);

        // Reset the database test status
        this.resetStatus();
    },

    // Handle click of test database connection button
    onClickTestDatabaseConnection: function() {

        // Reset the database test status
        this.resetStatus();

        var data = this.dbForm.attr("value");

        // Set connections to passing before the tests.
        this.areConnectionsOk = true;
        var useWinAuth = false;

        // Check create new flag
        if ("DB2" == data.dbType && this.dbCreateNew.checked) {

            // We are to create a new database, so verify the information does not point to an existing database.
            var dbExists = com.ibm.bpm.install.utils.InstallUtils.testConnection(data.dbType, data.dbHostName, data.dbServerPort,
                data.dbName, data.dbUserId, data.dbPassword, useWinAuth);
            if (dbExists != "jdbc") {
                this.dbName.forceError("found");
                this.areConnectionsOk = false;
            }
        } else {
            // We are to verify that the existing database information is correct.
            this.validateJdbc(data.dbType, data.dbHostName, data.dbServerPort, this.dbName, this.dbUserId, this.dbPassword);
        }

        // If the connections are not ok, show the user the failing fields.
        if (!this.areConnectionsOk) {
            this.dbForm.validate();
        }
    },

    /*
     * Validates the jdbc connection with the given properites and sets the page status accordingly.
     */
    validateJdbc: function(dbType, dbHostName, dbServerPort, databaseField, usernameField, passwordField) {

        // Get the data from the fields.
        var database = databaseField.attr("value");
        var username = usernameField.attr("value");
        var password = passwordField.attr("value");
        var useWinAuth = false;

        // Run the test connection.
        var result = com.ibm.bpm.install.utils.InstallUtils.testConnection(dbType, dbHostName, dbServerPort, database, username, password,
            useWinAuth);

        // Find the test node.
        var testNode = dojo.byId(databaseField.id + "_test");

        // Check the result and either mark it passing or failing and notify the fields.
        if (result == "") {
            dojo.addClass(testNode, "pass");
        } else {
            dojo.addClass(testNode, "fail");
            databaseField.forceError(result);
            this.areConnectionsOk = false;
        }
    }

});
