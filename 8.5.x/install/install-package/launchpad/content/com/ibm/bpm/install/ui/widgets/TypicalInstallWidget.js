// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS 
// Copyright IBM Corporation 2011, 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("com.ibm.bpm.install.ui.widgets.TypicalInstallWidget");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.require("com.ibm.bpm.install.ui.widgets.panel.CenterPane");
dojo.require("com.ibm.bpm.install.ui.widgets.panel.DatabasePane");
dojo.require("com.ibm.bpm.install.ui.widgets.panel.WsrrDatabasePane");
dojo.require("com.ibm.bpm.install.ui.widgets.panel.InstallationSummaryPane");
dojo.require("com.ibm.bpm.install.ui.widgets.panel.InstallingPane");

dojo.require("com.ibm.bpm.install.ui.widgets.InstallWizard");

dojo.require("com.ibm.bpm.install.utils.InstallUtils");

/*
 * Typical install main widget.
 */
dojo.declare("com.ibm.bpm.install.ui.widgets.TypicalInstallWidget", [
    dijit._Widget,
    dijit._Templated
], {

    // Template information
    templatePath: dojo.moduleUrl("com.ibm.bpm.install.ui.widgets.TypicalInstallWidget", "../templates/TypicalInstallWidget.html"),
    widgetsInTemplate: true,

    // @Override
    startup: function() {
        // If already started, return
        if (this._started) {
            return;
        }

        // Setup logger
        logger = loggerFactory.getTypicalInstallationLogger();
        logger.logMessage(property("log.info.start"));

        // Determine and record operating data with the wizard
        var data = this.wizard.data;

        // Handle multiple editions and set their convenience properties
        data.edition = top.diskLabel.edition;
        data.isWsrr = false;
        switch (data.edition)
        {
            case "WSRR": {
                data.isWsrr = true;
                data.isAdvanced = false;
                break;
            }
            default: {
                logger.logMessage(property("log.error.edition") + " " + data.edition);
                throw "Unknown Edition: " + data.edition;
            }
        }
        logger.logMessage(property("log.info.edition") + " " + data.edition);

        // Check administrative rights
        data.isAdmin = osHelper.isCurrentUserAdministrator();
        logger.logMessage(property("log.info.admin") + " " + data.isAdmin);
        // Add Center/Server wizard panes
        var centerPane = new com.ibm.bpm.install.ui.widgets.panel.CenterPane({
            data: data
        });
        this.wizard.addChild(centerPane);
        // Check to see if db2 express can be installed
        var isDb2Installed = com.ibm.bpm.install.utils.InstallUtils.isDb2Installed();
        data.isDb2Installed = isDb2Installed;

        var isValidDb2OperatingSystem = com.ibm.bpm.install.utils.InstallUtils.isValidDb2OperatingSystem();

        existingDatabasePane = new com.ibm.bpm.install.ui.widgets.panel.WsrrDatabasePane({
            data: data
        });
        if (data.isAdmin && !isDb2Installed && isValidDb2OperatingSystem) {
            logger.logMessage(property("log.info.db2.allow"));
            var databasePane = new com.ibm.bpm.install.ui.widgets.panel.DatabasePane({
                data: data,
                existingDatabasePane: existingDatabasePane
            });
            this.wizard.addChild(databasePane);
            data.embeddedDb2Enabled = true;
        } else {
            logger.logMessage(property("log.info.db2.prevent"));
            data.embeddedDb2Enabled = false;
            // Add existing database pane.
            this.wizard.addChild(existingDatabasePane);
        }
        // Statup the children (Do this early to prevent utility methods from slowing down the UI).
        this.inherited(arguments);

        // Start rest of startup delayed, so the UI has a chance to catch up.
        setTimeout(dojo.hitch(this, this.moreStartup), 0);
    },

    /*
     * Continuation of startup to allow the UI to catch up.
     */
    moreStartup: function() {
        var data = this.wizard.data;

        // Get default hostname
        data.defaultHostname = com.ibm.bpm.install.utils.InstallUtils.getHostname();

        // Add installation summary pane.
        var installationSummaryPane = new com.ibm.bpm.install.ui.widgets.panel.InstallationSummaryPane({
            data: data
        });
        this.wizard.addChild(installationSummaryPane);

        // Add installing pane.
        var installingPane = new com.ibm.bpm.install.ui.widgets.panel.InstallingPane({
            data: data
        });
        this.wizard.addChild(installingPane);
    }

});
