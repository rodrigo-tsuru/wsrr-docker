// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS 
// Copyright IBM Corporation 2011, 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("com.ibm.bpm.install.ui.widgets.panel.InstallingPane");

dojo.require("dojox.widget.Wizard");
dojo.require("dijit._Templated");

dojo.require("dijit.form.Button");
dojo.require("dijit.form.CheckBox");

dojo.require("com.ibm.bpm.install.steps.AddUserToGroupStep");
dojo.require("com.ibm.bpm.install.steps.PrereqCheckStep");
dojo.require("com.ibm.bpm.install.steps.InstallIMStep");
dojo.require("com.ibm.bpm.install.steps.InstallProductStep");
dojo.require("com.ibm.bpm.install.steps.ProfileCreationStep");
dojo.require("com.ibm.bpm.install.steps.InstallFixesStep");
dojo.require("com.ibm.bpm.install.steps.InstallFixPacksStep");
dojo.require("com.ibm.bpm.install.steps.StartServerStep");
dojo.require("com.ibm.bpm.install.steps.PreloadStep");
dojo.require("com.ibm.bpm.install.steps.RunstatsStep");
dojo.require("com.ibm.bpm.install.ui.widgets.panel.BPMWizardPane");
dojo.require("com.ibm.bpm.install.utils.InstallUtils");

dojo.declare("com.ibm.bpm.install.ui.widgets.panel.InstallingPane", [
    com.ibm.bpm.install.ui.widgets.panel.BPMWizardPane,
    dijit._Templated
], {

    // Template information
    templatePath: dojo.moduleUrl("com.ibm.bpm.install.ui.widgets.panel.InstallingPane", "../templates/InstallingPane.html"),
    widgetsInTemplate: true,

    // Labels that will be displayed on the page
    labels: {},
    // Current connections
    _connections: null,

    // Wizard property
    canGoBack: false,

    // Show Passwords state
    showPasswords: false,
    passwords: {},

    // @Override
    postMixInProperties: function() {
        this.inherited(arguments);

        // Load all labels
        this.labels.INSTALLING_HEADER = property("installingPane");
        this.labels.PRE_INTRO = property("installingPane.intro");
        this.labels.SHOW_PASSWORD = property("installingPane.showPassword");
        this.labels.PRINT = property("print");
        this.labels.OFFER_INSTALL_LOCATION = property("installingPane.offer_install_location");
        this.labels.OFFER_ADMIN_USER = property("installingPane.offer_admin_user");
        this.labels.OFFER_ADMIN_PASSWORD = property("installingPane.offer_admin_password");

        this.labels.NAME = property("name");
        this.labels.DB_EMBEDDED = property("installingPane.db.embedded");
        this.labels.DB_EXISTING = property("installingPane.db.existing");
        this.labels.DB_TYPE = property("installingPane.database_type");
        this.labels.DB_HOSTNAME = property("installingPane.hostname");
        this.labels.DB_PORT = property("installingPane.port");
        this.labels.USERNAME = property("username");
        this.labels.PASSWORD = property("password");
        this.labels.DB2_INSTANCE = property("installingPane.db2.instance");
        this.labels.DB2_FENCED = property("installingPane.db2.fenced");
        this.labels.DB2_DAS = property("installingPane.db2.das");
        this.labels.COMMON_DATABASE = property("common.dbName");
        this.labels.COMMON_DB = property("common.db");
        this.labels.INSTANCE_NAME = property("sid");
    },

    // @Override
    postCreate: function() {
        this.inherited(arguments);
        this._connections = new Array();

        // Setup connection for show passwords checkbox
        this._connections.push(dojo.connect(this.showPasswords, "onChange", this, "toggleShowPasswords"));

    },

    // @Override
    startup: function() {
        this.inherited(arguments);
        // Remove the nodes not for this OS.
        if (top.isWindows()) {
            dojo.query(".linux").orphan();
        } else {
            dojo.query(".windows").orphan();
        }
    },

    // Toggle show passwords and display the new style
    toggleShowPasswords: function() {
        this.showingPasswords = !this.showingPasswords;
        this.updatePasswords();
    },

    // Update the masking of all password fields.
    updatePasswords: function() {

        var self = this;

        // For each password node, get the dojoAttachPoint and show/hide the innerHTML
        dojo.query(".password").forEach(function(node) {

            // Get the node reference
            var nodeName = node.getAttribute('dojoAttachPoint');
            var password = self.passwords[nodeName];

            if (self.showingPasswords) {
                // Replace the innerHTML with the stored value.
                node.innerHTML = password;
            } else {
                // Replace the innerHTML with masking.
                var mask = "";
                for ( var i = 0; i < password.length; i++) {
                    mask += "*";
                }
                node.innerHTML = mask;
            }
        });
    },

    // @Override
    onShow: function() {
        this.inherited(arguments);
        // Populate the fields.
        this.populateFields();
        // Set password masking.
        this.updatePasswords();

        // Add user to group step, if create DB check is required
        // must be run before PrereqCheckStep as that fails if the User doesn't have admin rights
        // and that is set here
        if (util.isCreateDbCheckRequired(this.data)) {
            this.data.wizard.addStep(new com.ibm.bpm.install.steps.AddUserToGroupStep());
        }
        // Add the installation steps
        this.data.wizard.addStep(new com.ibm.bpm.install.steps.PrereqCheckStep());

        // need to install/upgrade IM if required
        var isImInstallOrUpdateRequired = util.isImInstallOrUpdateRequired();
        if (isImInstallOrUpdateRequired) {
            this.data.wizard.addStep(new com.ibm.bpm.install.steps.InstallIMStep());
        }
        this.data.wizard.addStep(new com.ibm.bpm.install.steps.InstallProductStep());

        // Installing fix pack(s) as a separate step
        // top.fixPackUpdates.targetWasIdVersion || top.fixPackUpdates.targetInstIdVersion
        if (top.fixPackUpdates) {
            if (top.fixPackUpdates.targetWasIdVersion || top.fixPackUpdates.targetInstIdVersion) {
                this.data.wizard.addStep(new com.ibm.bpm.install.steps.InstallFixPacksStep());
            }
        }

        // Installing fix(es) as a separate step
        if (top.updates) {
            if ((top.updates.wasFixes && top.updates.wasFixes.length > 0) || (top.updates.bpmFixes && top.updates.bpmFixes.length > 0)) {
                this.data.wizard.addStep(new com.ibm.bpm.install.steps.InstallFixesStep());
            }
        }
        this.data.wizard.addStep(new com.ibm.bpm.install.steps.ProfileCreationStep(this.centerLink));

        this.data.wizard.addStep(new com.ibm.bpm.install.steps.StartServerStep());

        this.data.wizard.addStep(new com.ibm.bpm.install.steps.PreloadStep());

        if (this.data.embedded && this.data.isWsrr) {
            this.data.wizard.addStep(new com.ibm.bpm.install.steps.RunstatsStep());
        }

        // Start install delayed, so the UI has a chance to catch up.
        setTimeout(dojo.hitch(this.data.wizard, this.data.wizard.runInstallSteps), 0);
    },

    // @Override
    onHide: function() {
        this.inherited(arguments);

        // Clear out all install steps.
        this.data.wizard.clearAllSteps();

        // Hide the exit button if present.
        this.data.wizard.exitButton.domNode.style.display = "none";
    },

    // Populate the UI fields with the correct display data based on the install type.
    populateFields: function() {

        // Hide all the DB types
        util.changeClassDisplay(".MSSQL", null, "none");
        util.changeClassDisplay(".Oracle", null, "none");
        util.changeClassDisplay(".DB2", null, "none");

        switch (this.data.type)
        {
            case "wsrr": {
                // Set the install type
                this.installType.innerHTML = property("installingPane.wsrrServer");
                break;
            }
            default: {
                throw "Unknown install type '" + this.data.type + "'";
                break;
            }

        }

        // Set install location
        this.location.innerHTML = this.data.location;

        // Set default admin user and pw
        this.admin_user.innerHTML = this.data.profile.adminUserName;
        this.admin_pw.innerHTML = this.data.profile.adminPassword;

        // Check database settings and fill out the needed nodes.
        var db = this.data.database;

        // Check for embedded versus existing database.
        if (this.data.embedded) {
            // Set database title to embedded.
            this.dbTitle.innerHTML = this.labels.DB_EMBEDDED;

            // Set the embedded db2 user/pass settings.
            if (top.isWindows()) {
                this.db2a_user.innerHTML = this.data.embedded.admin_user;
                this.db2a_pw.innerHTML = this.data.embedded.admin_pw_plainText;
            } else {
                this.db2i_user.innerHTML = this.data.embedded.instance_user;
                this.db2i_pw.innerHTML = this.data.embedded.instance_pw_plainText;
                this.db2f_user.innerHTML = this.data.embedded.fenced_user;
                if (this.data.embedded.fenced_newuser) {
                    this.db2f_pw.innerHTML = this.data.embedded.fenced_pw_plainText;
                } else {
                    util.changeClassDisplay(".db2f_newuser", null, "none");
                }
                this.db2d_user.innerHTML = this.data.embedded.das_user;
                if (this.data.embedded.das_newuser) {
                    this.db2d_pw.innerHTML = this.data.embedded.das_pw_plainText;
                } else {
                    util.changeClassDisplay(".db2d_newuser", null, "none");
                }
            }
        } else {
            // Set database title to existing.
            this.dbTitle.innerHTML = top.formatmsg(this.labels.DB_EXISTING, this.data.dbType);

            // Set dbUserId and dbPassword
            this.dbUserId.innerHTML = db.dbUserId || "";
            this.dbPassword.innerHTML = db.dbPassword || "";

            // Set the database specific fields
            if ("DB2" != this.data.dbType) {
                if (!this.data.isWsrr) {
                    this.proc_user.innerHTML = db.dbProcSvrUserId;
                    this.proc_pw.innerHTML = db.dbProcSvrPassword;
                    this.perf_user.innerHTML = db.dbPerfDWUserId;
                    this.perf_pw.innerHTML = db.dbPerfDWPassword;

                    if ("Oracle" == this.data.dbType) {
                        this.instanceName.innerHTML = db.instanceName;
                        this.common_user.innerHTML = db.dbCommonUserId;
                        this.common_pw.innerHTML = db.dbCommonPassword;
                        this.cell_user.innerHTML = db.dbCellUserId;
                        this.cell_pw.innerHTML = db.dbCellPassword;
                    } else {
                        this.common_user.innerHTML = db.dbUserId;
                        this.common_pw.innerHTML = db.dbPassword;
                    }
                }
            }
        }
        // Set common db name
        if (this.data.dbType == "DB2" || this.data.dbType == "MSSQL") {
            this.common.innerHTML = db.dbName;
        }
        // Set the common database hostname and port.
        this.dbHostName.innerHTML = db.dbHostName;
        this.dbServerPort.innerHTML = db.dbServerPort;

        // Show database type fields
        util.changeClassDisplay("." + this.data.dbType, null, "");
        // If this is DB2, show either jdbc or embedded and hide the other.
        if ("DB2" == this.data.dbType) {
            if (this.data.embedded) {
                util.changeClassDisplay(".jdbc", null, "none");
            } else {
                util.changeClassDisplay(".embedded", null, "none");
            }
        }

        // If this is WSRR and not using embedded, then show the wsrr fields.
        if (this.data.isWsrr && !this.data.embedded) {
            util.changeClassDisplay(".wsrr", null, "");
        }

        var self = this;
        // Store all the set passwords.
        dojo.query(".password").forEach(function(node) {
            var nodeName = node.getAttribute('dojoAttachPoint');
            self.passwords[nodeName] = node.innerHTML;
        });
    }
});
