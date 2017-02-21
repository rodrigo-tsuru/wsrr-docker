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
dojo.provide("com.ibm.bpm.install.ui.widgets.textbox.UserPassTextBox");

dojo.require("com.ibm.bpm.install.ui.widgets.textbox.ValidationTextBox");

/*
 * Oracle/MSSQL Username and Password schema TextBox.
 */
dojo.declare("com.ibm.bpm.install.ui.widgets.textbox.UserPassTextBox", [com.ibm.bpm.install.ui.widgets.textbox.ValidationTextBox
], {

    // @Override
    postCreate: function() {
        this.inherited(arguments);

        // Add database messages.
        this.messages = {
            "jdbc": property("validation.field.database"),
            "user.will.exist": property("db2.linux.user.will.exist")
        };
    }
});
