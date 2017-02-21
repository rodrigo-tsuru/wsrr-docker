// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
// Copyright IBM Corporation 2011, 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("com.ibm.bpm.install.steps.InstallProductStep");

dojo.require("com.ibm.bpm.install.steps.InstallManagerStep");
dojo.require("com.ibm.bpm.install.utils.InstallUtils");
dojo.require("dojo.date.locale");

/*
 * Installation step to install the product through IM.
 */
dojo.declare("com.ibm.bpm.install.steps.InstallProductStep", [com.ibm.bpm.install.steps.InstallManagerStep
], {

    // Points for this step.
    points: 2166,
    // Expected size of the output file when completed.
    expectedSize: 550001,
    // Wizard data
    data: null,
    // String with concat of product offerings.
    PRODUCT_OFFERINGS: null,
    // String with concat of properties
    PROPS: "",
    REPOSITORY_LOC: "",

    constructor: function(data) {
        this.data = data;
    },

    /*
     * Code to run to execute this step
     */
    execute: function(data) {
        this.PRODUCT_OFFERINGS = property('wasOfferingId') + ' ';
        this.data = data;

        top.addKeyringOption = false; // disables adding of keyring and password paramater to imcl
        this.logName = util.getPersistedTempFilename('bpm.offering'); //$NON-NLS-1$
        this.createResponseFiles();
        this.repo = this.REPOSITORY_LOC;
        this.location = this.data.location;

        this.id = dojo.trim(this.PRODUCT_OFFERINGS);
        this.properties = this.PROPS.substring(0, this.PROPS.length - 1);

        this.continueMessage = property("install.cancel.im.succeed");

        var messageKey = "";
        messageKey = data.edition + ".product";
        this.installingMessage = top.formatmsg(property("wizard.installing"), top.formatmsg(property(messageKey),
            property('launchpad.releaseVersionMSB') + '.' + property('launchpad.releaseVersionLSB') + '.'
                + property('launchpad.modificationLevel')));
        this.inherited(arguments);
    },

    /*
     * Creates the response files.
     */
    createResponseFiles: function() {
        var offeringId = property(top.diskLabel.edition + '.offering.id');

        // Set offering based on edition
        switch (this.data.edition)
        {
            case "WSRR": {
                this.addOffering(property(top.diskLabel.edition + ".offering.id"));
                break;
            }
            default: {
                throw "Unknown Edition " + top.diskLabel.edition;
            }
        }

        // Initialize DB2 Data.

        // If we are doing DB2 Express, add those values as well.
        if (this.data.embedded && top.ARCHITECTURE != 'x86') {
            // If WSRR and using db2 express then encrypt the password and update datamodel
            if (this.data.isWsrr) {
                var encryptedPwd = com.ibm.bpm.install.utils.InstallUtils.encryptPassword(this.data.profile.adminPassword);
                if (top.isWindows()) {
                    this.data.embedded.admin_pw = encryptedPwd;
                    this.data.database.dbPassword = encryptedPwd;
                    this.data.database.dbSysPassword = encryptedPwd;
                } else {
                    this.data.embedded.instance_pw = encryptedPwd;
                    this.data.embedded.fenced_pw = encryptedPwd;
                    this.data.embedded.das_pw = encryptedPwd;
                    this.data.database.dbPassword = encryptedPwd;
                    this.data.database.dbSysPassword = encryptedPwd;
                }
            }
            if (top.OSTYPE == 'windows') {
                this.addOffering(property('DB2OfferingIdWindows64Id'));
                this.addProperty("user.db2.admin.username", this.data.embedded.admin_user);
                this.addProperty("user.db2.admin.password", this.data.embedded.admin_pw);
            } else {
                if (top.ARCHITECTURE == 'IA64' || top.ARCHITECTURE == 'AMD64') {
                    this.addOffering(property('DB2OfferingIdLinux64Id'));
                }
                this.addProperty("user.db2.instance.username", this.data.embedded.instance_user);
                this.addProperty("user.db2.instance.password", this.data.embedded.instance_pw);

                this.addProperty("user.db2.fenced.username", this.data.embedded.fenced_user);
                this.addProperty("user.db2.fenced.newuser", this.data.embedded.fenced_newuser); // added a state for IM
                if (this.data.embedded.fenced_newuser) {
                    this.addProperty("user.db2.fenced.password", this.data.embedded.fenced_pw);
                }
                this.addProperty("user.db2.das.username", this.data.embedded.das_user);
                this.addProperty("user.db2.das.newuser", this.data.embedded.das_newuser); // added a state for IM
                if (this.data.embedded.das_newuser) {
                    this.addProperty("user.db2.das.password", this.data.embedded.das_pw);
                }
            }
            this.addProperty('user.db2.use.existing', 'false'); // added a state for IM
            this.addProperty("user.db2.port", property('DB2DefaultPort'));
        }

        this.REPOSITORY_LOC = util.getBpmProductRepoLocation(top.IMAGEDIR);
        // Add NLS property
        this.addProperty("cic.selector.nl", "en,,cs,,de,,es,,fr,,hu,,it,,ja,,ko,,pl,,pt_BR,,ro,,ru,,zh,,zh_TW");
    },

    /*
     * Concat the given offeringIds to the PRODUCT_OFFERINGS.
     */
    addOffering: function(offeringId) {
        this.PRODUCT_OFFERINGS += offeringId + " ";
    },

    /*
     * Concat the given properties key/value pairs to the PROPERTIES.
     */
    addProperty: function(key, value) {
        this.PROPS += key + "=" + value + ",";
    }

});
