/***********************************************************************************************************************
 * Licensed Materials - Property of IBM
 * 
 * 5724-R31, 5655-S30
 * 
 * (C) Copyright IBM Corp. 2013. All Rights Reserved.
 * 
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with
 * IBM Corp. **********************************************
 */
dojo.provide("com.ibm.bpm.install.ui.widgets.textbox.DatabaseTextBox");

dojo.require("com.ibm.bpm.install.ui.widgets.textbox.ValidationTextBox");

/*
 * DatabaseTextBox for installation Database names
 */
dojo.declare("com.ibm.bpm.install.ui.widgets.textbox.DatabaseTextBox", [com.ibm.bpm.install.ui.widgets.textbox.ValidationTextBox
], {

    // Database type
    dbType: "",

    // Maximum database length sizes
    maxSizes: {
        "DB2": 8,
        "MSSQL": 30,
        "Oracle": 128
    },

    // @Override
    // Set default value, messages, and size restrictions.
    postCreate: function() {
        this.inherited(arguments);

        // Add database messages.
        this.messages = {
            "jdbc": property("validation.field.database"),
            "hasTables": property("validation.field.database.hasTables"),
            "pageSize": property("validation.field.database.pageSize"),
            "dbAdm": property("validation.field.database.dbAdm"),
            "found": property("validation.field.database.found")
        };

        // If dbType is set, setup the regex and invalid message now.
        if (this.dbType) {
            this.updateRegex();
        }
    },

    /*
     * Updates the regular expression and invalid message for the current dbType
     */
    updateRegex: function() {
        this.regExp = "\\w{1," + this.maxSizes[this.dbType] + "}";
        this.invalidMessage = top.formatmsg(property("validation.field.database.name"), "" + this.maxSizes[this.dbType]);
    },

    /*
     * Changes the dbType of this database text box.
     */
    setDbType: function(type) {
        this.dbType = type;
        this.updateRegex();
    }

});
