// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS 
// Copyright IBM Corporation 2011, 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("com.ibm.bpm.install.ui.widgets.panel.InstallationSummaryPane");

dojo.require("dojox.widget.Wizard");
dojo.require("dijit._Templated");
dojo.require("com.ibm.bpm.install.ui.widgets.textbox.UserPassTextBox");

dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.Button");
dojo.require("com.ibm.bpm.install.ui.widgets.dialog.ProgressDialog");
dojo.require("com.ibm.bpm.install.serviceability.product.Updates");
dojo.require("com.ibm.bpm.install.ui.widgets.panel.BPMWizardPane");

/*
 * Installation Summary pane showing the chosen install paths and options.
 */
dojo
    .declare(
        "com.ibm.bpm.install.ui.widgets.panel.InstallationSummaryPane",
        [
            com.ibm.bpm.install.ui.widgets.panel.BPMWizardPane,
            dijit._Templated
        ],
        {

            // Template information
            templatePath: dojo.moduleUrl("com.ibm.bpm.install.ui.widgets.panel.InstallationSummaryPane",
                "../templates/InstallationSummaryPane.html"),
            widgetsInTemplate: true,
            fixesIssuesParsed: false,
            fixPackIssuesParsed: false,
            lpadIssuesParsed: false,
            dialogRef: null,
            checkForUpdatesCompleted: false,
            // Labels that will be displayed on the page
            labels: {},
            // Current connections
            _connections: null,

            // Flag to determine if file is unparseable -- use so we don't list error twice, once for launchpad fixes
            // and once for bpm fixes
            isInvalid: false,

            // @Override
            postMixInProperties: function() {
                this.inherited(arguments);

                // Load product update variables
                this.labels.USERNAME = property("username");
                this.labels.PASSWORD = property("password");
                this.labels.CHECKBOXUPDATESDESCRIPTION = property("checkbox.updates.description");
                this.labels.CHECKBOXUPDATESHELPER = property("checkbox.updates.description.help");
                this.labels.LOGIN = property('liveUpdates.buttonCaption');

                // Load all labels
                this.labels.INSTALL_SUMMARY = property("installSummary");
                this.labels.INSTALL_SUMMARY_DESCRIPTION = property("installSummary.desc");
                this.labels.LICENSE = property('installSummary.license');
            },

            // @Override
            postCreate: function() {
                this.inherited(arguments);

                this._connections = new Array();

                // Setup connection for license accepted state change
                this._connections.push(dojo.connect(this.licenseAccepted, "onClick", this, function() {
                    if (this.checkboxGetUpdates.checked) {
                        this.data.wizard.doneButton.attr("disabled",
                            !(this.licenseAccepted.checked && this.checkboxGetUpdates.checked && this.checkForUpdatesCompleted));
                    } else {
                        this.data.wizard.doneButton.attr("disabled", !(this.licenseAccepted.checked));
                    }

                }));

                this._connections.push(dojo.connect(this.checkboxGetUpdates, "onClick", this, function() {
                    if (this.checkboxGetUpdates.checked) {
                        this.enableUpdatePrompt(); // will be invisible once updates are retrieved
                        this.showMessages();
                        this.data.wizard.doneButton.attr("disabled",
                            !(this.licenseAccepted.checked && this.checkboxGetUpdates.checked && this.checkForUpdatesCompleted));
                    } else {
                        this.hideMessages();
                        this.disableUpdatePrompt(); // will be invisible once updates are retrieved
                        this.data.wizard.doneButton.attr("disabled", !(this.licenseAccepted.checked));
                    }
                }));

                this._connections.push(dojo.connect(this.IBMCredentailsHelper, "onclick", this, function() {
                    viewPage(NO_DISKID, property('ibm.credentials.help.url'));
                }));

                this._connections.push(dojo.connect(this.loginButton, "onClick", this, "loginOnClickHandler"));

                // Set onClick for the license
                this._connections.push(dojo.connect(this.license, "onclick", this, function() {
                    var LICENSE_ROOT = top.IMAGEDIR + "launchpad" + top.PATHSEPARATOR + "content" + top.PATHSEPARATOR + "licenses"
                        + top.PATHSEPARATOR + top.diskLabel.edition + top.PATHSEPARATOR;
                    var FALLBACK_LICENSE = "LA_en";

                    var locale = top.getLocaleMapping("engineLocales");
                    var localeParts = locale.split(/_/g);
                    var lang = localeParts[0];
                    var region = localeParts[1];

                    if (!top.fileExists(LICENSE_ROOT + top.PATHSEPARATOR + FALLBACK_LICENSE))
                        logger.logMessage(property("log.error.fallbackLicense"));

                    var licenseName = "LA_" + lang;
                    if (region != undefined) {
                        var regionalLicense = "LA_" + lang + "_" + region;
                        if (top.fileExists(LICENSE_ROOT + top.PATHSEPARATOR + regionalLicense))
                            licenseName = regionalLicense;
                    }

                    if (!top.fileExists(LICENSE_ROOT + top.PATHSEPARATOR + licenseName)) {
                        licenseName = FALLBACK_LICENSE;
                    }

                    viewPage("DISK1", LICENSE_ROOT + top.PATHSEPARATOR + licenseName);
                }));

                // Set onClick for the notices
                this._connections.push(dojo.connect(this.notices, "onclick", this, function() {
                    viewPage("DISK1", "launchpad/content/licenses/" + top.diskLabel.edition + "/notices");
                }));
            },

            showMessages: function() {
                dojo.byId("productMessages").style.display = 'block';
            },
            hideMessages: function() {
                dojo.byId("productMessages").style.display = 'none';
            },
            hideUpdateForm: function() {
                dojo.byId("CheckForUpdatesForm").style.display = 'none';
            },
            hideUpdatePrompt: function() {
                dojo.byId("CheckForUpdatesPrompt").style.display = 'none';
            },
            showUpdatePrompt: function() {
                dojo.byId("CheckForUpdatesPrompt").style.display = 'block';
            },
            liveUpdatesCallbackFunction: function(errorStatus) {
                logger.logMessage("updatesProcessComplete");
                this.enableUpdatePrompt();
                this.dialogRef.hide();
                dojo.empty("productMessages");

                if (errorStatus.text == "timeout") {
                    this.addMessage(new com.ibm.bpm.install.utils.Message("warning", property("liveUpdates.Timeout.message")),
                        "productMessages");
                } else if (errorStatus.text == "AuthenticationFailed") {
                    this.addMessage(
                        new com.ibm.bpm.install.utils.Message("warning", property('liveUpdates.authenticationFailure.message')),
                        "productMessages");
                } else if (errorStatus.text == "complete") {
                    this.checkForUpdatesCompleted = true;
                    this.hideUpdatePrompt();
                    // since updates are complete, check if the Install button needs to be enabled
                    // user might have already accepted the license agreement.
                    this.handleInstallButtonState();
                }
                this.showProductSummaryOfMessages();
            },

            handleInstallButtonState: function() {
                this.data.wizard.doneButton.attr("disabled",
                    !(this.licenseAccepted.checked && this.checkboxGetUpdates.checked && this.checkForUpdatesCompleted));
            },

            enableUpdatePrompt: function() {
                this.userIdTextBox.attr("disabled", false);
                this.passwordTextBox.attr("disabled", false);
                this.loginButton.attr("disabled", false);
            },
            disableUpdatePrompt: function() {
                this.userIdTextBox.attr("disabled", true);
                this.passwordTextBox.attr("disabled", true);
                this.loginButton.attr("disabled", true);
            },
            loginOnClickHandler: function() {
                var userId = this.userIdTextBox.attr("value");
                var password = this.passwordTextBox.attr("value");

                if (this.checkboxGetUpdates.checked && userId != null && userId != '' && userId && password != null && password != ''
                    && password) {
                    this.disableUpdatePrompt();
                    this.checkForUpdatesCompleted = false;

                    logger.logMessage('initializing check for updates');
                    this.dialogRef = new com.ibm.bpm.install.ui.widgets.dialog.ProgressDialog();

                    var updateInstance = com.ibm.bpm.install.serviceability.product.Updates();
                    updateInstance.callerReference = this;
                    // show progressDialog
                    this.dialogRef.show();
                    logger.logMessage('about to start check for updates');

                    updateInstance.processLiveUpdates(userId, password, dojo.hitch(this, "liveUpdatesCallbackFunction"), dojo.hitch(
                        this.dialogRef, this.dialogRef.addMessage));
                    logger.logMessage('end of loginOnClickHandler');
                }

            },
            // Adds a new message row to the dialog.
            addMessage: function(message, type) {
                var messageRow = document.createElement("tr");
                var messageIconColumn = document.createElement("td");
                var messageIcon = document.createElement("div");
                var messageTextColumn = document.createElement("td");
                var messageText = document.createElement("span");

                if (type == "productMessages") {
                    document.getElementById("productMessages").appendChild(messageRow);
                } else if (type == "launchpadMessages") {
                    document.getElementById("launchpadMessages").appendChild(messageRow);
                }
                messageRow.appendChild(messageIconColumn);
                messageIconColumn.appendChild(messageIcon);
                messageRow.appendChild(messageTextColumn);
                messageTextColumn.appendChild(messageText);

                switch (message.severity)
                {
                    case "error": {
                        dojo.addClass(messageIcon, "errorIcon");
                        break;
                    }
                    case "warning": {
                        dojo.addClass(messageIcon, "warningIcon");
                        break;
                    }
                    case "info": {
                        dojo.addClass(messageIcon, "infoIcon");
                        break;
                    }
                    case "infoWithLargeIcon": {
                        dojo.addClass(messageIcon, "infoIconLarge");
                        break;
                    }
                }

                messageText.innerHTML = message.text;
            },

            // @Override
            // On Show of the Pane, make sure all the data is up to date
            onShow: function() {
                this.inherited(arguments);

                // Format the location message and set it
                var locationKey = "installSummary." + this.data.type;
                this.data.profile.isProdLic = true;
                var installLocation = this.data.location;
                var locationMessage = top.formatmsg(property(locationKey), installLocation);
                this.location.innerHTML = locationMessage;

                // If existing database selected
                if (this.data.embedded) {
                    this.databaseDesc.innerHTML = property("installSummary.newDatabase");
                } else {
                    this.databaseDesc.innerHTML = top.formatmsg(property("installSummary.existingDatabase"), this.data.dbType);
                }

                // Set the done button disabled.
                this.data.wizard.doneButton.attr("disabled", !this.licenseAccepted.checked);

                // if local updates available disable liveform
                if (this.data.UpdateOption == 1 || this.data.UpdateOption == 0) {
                    this.checkboxGetUpdates.attr("checked", false);
                    this.hideUpdateForm();
                    this.showProductSummaryOfMessages();
                }
                this.showLaunchpadSummaryOfMessages();

                // build selected features list
                // Set isLastChild to true to prevent next button.
                this.isLastChild = true;

                // Give the license acceptance the focus.
                this.licenseAccepted.focus();
            },

            showLaunchpadSummaryOfMessages: function() {

                if (!this.lpadIssuesParsed && top.launchpadUpdates && top.launchpadUpdates.issues && top.launchpadUpdates.issues.length > 0) {

                    for ( var i = 0; i < top.launchpadUpdates.issues.length; i++) {
                        var issue = top.launchpadUpdates.issues[i];
                        var type = issue.type;
                        var msg = null;
                        switch (issue.id)
                        {
                            case "INVALID_FILE": {
                                msg = property("launchpad.update.unparsableMsg");
                                this.isInvalid = true;
                                break;
                            }
                            case "INVALID_REPOSITORY": {
                                msg = top.formatmsg(property("launchpad.update.invalidMsg"), issue.value);
                                break;
                            }
                        }
                        if (type && msg) {
                            this.addMessage(new com.ibm.bpm.install.utils.Message(type, msg), "launchpadMessages");
                            logger.logMessage(top.formatmsg(property("log.warning"), msg));
                        }
                    }
                    this.lpadIssuesParsed = true;
                }

            },
            showProductSummaryOfMessages: function() {
                var isInvalidUpdate = false;

                /*
                 * Possible issue values:
                 * 
                 * a) MSGID_LIVE_REPOSITORY_UNREACHABLE || MSGID_URL_PROTOCOL_UNSUPPORTED for local ifixes or fix pack
                 * b) MSGID_LIVE_REPOSITORY_UNREACHABLE || MSGID_URL_PROTOCOL_UNSUPPORTED for live repositories
                 * 
                 * Pseudo code: if (BPM_update.properties.exists) show invalid ifixes and fixpacks dont show live
                 * repositories are offine if they are offline else show live repositories are offline if they are
                 * offline (defect is deferred , 134720)
                 * 
                 */

                if (top.localFixPacksAndFixes && top.localFixPacksAndFixes.issues) {
                    for ( var i = 0; i < top.localFixPacksAndFixes.issues.length; i++) {
                        var issue = top.localFixPacksAndFixes.issues[i];
                        if (this.data.UpdateOption == 1) {
                            // local updates available
                            if (issue.value == top.formatmsg(property('was.repository'), property('wasOfferingId'))
                                || issue.value == com.ibm.bpm.install.utils.InstallUtils.getProductRepository()) {
                                // ignoring live repositories issues if they are offline
                            } else {
                                // showing local invalid ifixes or fix packs
                                if ("MSGID_LIVE_REPOSITORY_UNREACHABLE" == issue.id || "MSGID_URL_PROTOCOL_UNSUPPORTED" == issue.id) {
                                    isInvalidUpdate = true;
                                    var msg = top.formatmsg(property("bpm_updates.invalid"), issue.value);
                                    this.addMessage(new com.ibm.bpm.install.utils.Message("error", msg), "productMessages");
                                    logger.logMessage(top.formatmsg(property("log.error"), msg));
                                }
                            }
                        } else {
                            // defect is deferred , 134720
                        }
                    }
                }

                // display Fix Pack updates

                if (!this.fixPackIssuesParsed && top.fixPackUpdates && top.fixPackUpdates.issues) {

                    for ( var i = 0; i < top.fixPackUpdates.issues.length; i++) {
                        var issue = top.fixPackUpdates.issues[i];
                        var type = issue.type;
                        var msg = null;
                        switch (issue.id)
                        {
                            case "INVALID_FILE": {

                                if (this.isInvalid == false) {
                                    msg = property("launchpad.update.unparsableMsg");
                                }
                                break;
                            }
                            case "INVALID_REPOSITORY": {
                                msg = top.formatmsg(property("FixPacks.update.invalidMsg"), issue.value);
                                break;
                            }
                        }
                        if (type && msg) {
                            isInvalidUpdate = true;
                            this.addMessage(new com.ibm.bpm.install.utils.Message(type, msg), "productMessages");
                            logger.logMessage("W: " + msg);
                        }
                    }

                    // TODO top.fixPackUpdates.targetWasIdVersion targetWasRepository ;
                    // top.fixPackUpdates.targetInstIdVersion targetInstRepository
                    // if(top.fixPackUpdates.fixPacks && top.fixPackUpdates.fixPacks.length > 0)

                    if (top.fixPackUpdates && (top.fixPackUpdates.targetWasIdVersion || top.fixPackUpdates.targetInstIdVersion)) {
                        this.addMessage(new com.ibm.bpm.install.utils.Message("info", top.formatmsg(property("FixPacks.update.infoMsg"),
                            top.formatmsg(property(top.diskLabel.edition + '.shortname'), property('launchpad.releaseVersionMSB') + '.'
                                + property('launchpad.releaseVersionLSB') + '.' + property('launchpad.modificationLevel')))),
                            "productMessages"); //$NON-NLS-1$
                        logger.logMessage("I: "
                            + top.formatmsg(property("FixPacks.update.infoMsg"), top.formatmsg(property(top.diskLabel.edition
                                + '.shortname'), property('launchpad.releaseVersionMSB') + '.' + property('launchpad.releaseVersionLSB')
                                + '.' + property('launchpad.modificationLevel'))));

                        var fixIds = "<ul>";
                        var fixIdsLogging = '';

                        if (top.fixPackUpdates.targetWasIdVersion) {
                            fixIds = fixIds + "<li>" + top.fixPackUpdates.targetWasIdVersion + "</li>";
                            fixIdsLogging = fixIdsLogging + ' ' + top.fixPackUpdates.targetWasIdVersion;

                        }

                        if (top.fixPackUpdates.targetInstIdVersion) {
                            fixIds = fixIds + "<li>" + top.fixPackUpdates.targetInstIdVersion + "</li>";
                            fixIdsLogging = fixIdsLogging + ' ' + top.fixPackUpdates.targetInstIdVersion;

                        }

                        fixIds = fixIds + "</ul>";

                        this.addMessage(new com.ibm.bpm.install.utils.Message("info", fixIds), "productMessages"); //$NON-NLS-1$
                        logger.logMessage("I: " + fixIdsLogging);
                    }

                    this.fixPackIssuesParsed = true;
                }

                // display fixes

                if (!this.fixesIssuesParsed && top.updates && top.updates.issues) {

                    for ( var i = 0; i < top.updates.issues.length; i++) {
                        var issue = top.updates.issues[i];
                        var type = issue.type;
                        var msg = null;
                        switch (issue.id)
                        {
                            case "INVALID_FILE": {
                                if (this.isInvalid == false) {
                                    msg = property("launchpad.update.unparsableMsg");
                                }
                                break;
                            }
                            case "INVALID_REPOSITORY": {
                                msg = top.formatmsg(property("Fixes.update.invalidMsg"), issue.value);
                                break;
                            }
                        }
                        if (type && msg) {
                            isInvalidUpdate = true;
                            this.addMessage(new com.ibm.bpm.install.utils.Message(type, msg), "productMessages");
                            logger.logMessage(top.formatmsg(property("log.warning"), msg));
                        }
                    }

                    // TODO top.updates.wasFixes //top.updates.bpmFixes

                    /*
                     * top.updates.wasFixes.repository top.updates.wasFixes.ifixOfferingIdVersion
                     * top.updates.bpmFixes.repository top.updates.bpmFixes.ifixOfferingIdVersion
                     * top.updates.fixes.length > 0
                     */
                    if ((top.updates.wasFixes && top.updates.wasFixes.length > 0)
                        || (top.updates.bpmFixes && top.updates.bpmFixes.length > 0)) {
                        this.addMessage(new com.ibm.bpm.install.utils.Message("info", top.formatmsg(property("Fixes.update.infoMsg"), top
                            .formatmsg(property(top.diskLabel.edition + '.shortname'), property('launchpad.releaseVersionMSB') + '.'
                                + property('launchpad.releaseVersionLSB') + '.' + property('launchpad.modificationLevel')))),
                            "productMessages"); //$NON-NLS-1$
                        logger.logMessage(top.formatmsg(property("log.info"), top.formatmsg(property("Fixes.update.infoMsg"), top
                            .formatmsg(property(top.diskLabel.edition + '.shortname'), property('launchpad.releaseVersionMSB') + '.'
                                + property('launchpad.releaseVersionLSB') + '.' + property('launchpad.modificationLevel')))));

                        var fixIds = "<ul>";
                        var fixIdsLogging = '';

                        if (top.updates.wasFixes && top.updates.wasFixes.length > 0) {
                            for ( var i = 0; i < top.updates.wasFixes.length; i++) {
                                fixIds = fixIds + "<li>" + top.updates.wasFixes[i].ifixOfferingIdVersion + "</li>";
                                fixIdsLogging = fixIdsLogging + ' ' + top.updates.wasFixes[i].ifixOfferingIdVersion;
                            }

                        }

                        if (top.updates.bpmFixes && top.updates.bpmFixes.length > 0) {
                            for ( var i = 0; i < top.updates.bpmFixes.length; i++) {
                                fixIds = fixIds + "<li>" + top.updates.bpmFixes[i].ifixOfferingIdVersion + "</li>";
                                fixIdsLogging = fixIdsLogging + ' ' + top.updates.bpmFixes[i].ifixOfferingIdVersion;
                            }

                        }

                        fixIds = fixIds + "</ul>";

                        this.addMessage(new com.ibm.bpm.install.utils.Message("info", fixIds), "productMessages"); //$NON-NLS-1$
                        logger.logMessage(top.formatmsg(property("log.info"), fixIdsLogging));
                    }

                    this.fixesIssuesParsed = true;
                }

                // Display no updates are available message if there was no applicable updates from live site
                if (this.data.UpdateOption == 2) {
                    if (!isInvalidUpdate && this.isFixPackUpdateAvailable() == false && this.isFixUpdateAvailable() == false) {
                        this.addMessage(new com.ibm.bpm.install.utils.Message(
                            "infoWithLargeIcon", property("liveUpdates.NoUpdates.message")), "productMessages"); //$NON-NLS-1$
                        logger.logMessage(property("liveUpdates.NoUpdates.message"));
                    }
                }

            },
            // Boolean method that return's the state of fix pack update
            isFixPackUpdateAvailable: function() {
                var hasFixPackUpdate = null;
                if ((top.fixPackUpdates == null)
                    || (top.fixPackUpdates != null && (top.fixPackUpdates.targetWasIdVersion == null || top.fixPackUpdates.targetInstIdVersion == null))) {
                    hasFixPackUpdate = false;
                } else if (top.fixPackUpdates != null
                    && (top.fixPackUpdates.targetWasIdVersion != null || top.fixPackUpdates.targetInstIdVersion != null)) {
                    hasFixPackUpdate = true;
                }
                return hasFixPackUpdate;
            },
            // Boolean method that return's the state of fix update
            isFixUpdateAvailable: function() {
                var hasfixUpdate = null;
                if ((top.updates == null)
                    || (top.updates != null && ((top.updates.wasFixes && top.updates.wasFixes.length == 0) || (top.updates.bpmFixes && top.updates.bpmFixes.length == 0)))) {
                    hasfixUpdate = false;
                } else if (top.updates != null
                    && ((top.updates.wasFixes && top.updates.wasFixes.length > 0) || (top.updates.bpmFixes && top.updates.bpmFixes.length > 0))) {
                    hasfixUpdate = true;
                }
                return hasfixUpdate;
            },

            // Update the style.display for any node that has the given style class
            changeClassDisplay: function(style, excludeStyle, display) {
                if (excludeStyle) {
                    dojo.query(style + ":not(" + excludeStyle + ")").forEach(function(node) {
                        node.style.display = display;
                    });
                } else {
                    dojo.query(style).forEach(function(node) {
                        node.style.display = display;
                    });
                }
            },

            // @Override
            doneFunction: function() {
                // reset live updates urls if disabled by consumer
                if (this.data.UpdateOption == 2) {
                    if (this.checkboxGetUpdates && !this.checkboxGetUpdates.checked && this.checkForUpdatesCompleted) {
                        logger.logMessage("Updates are discarded");
                        if (top.updates) { // remove retrieved fixes
                            top.updates = null;
                        }
                        if (top.fixPackUpdates) { // remove retrieved fix packs
                            top.fixPackUpdates = null;
                        }
                    }
                }
                this.data.wizard.forward();
            }

        });
