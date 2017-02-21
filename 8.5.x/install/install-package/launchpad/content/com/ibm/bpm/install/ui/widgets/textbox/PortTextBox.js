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
dojo.provide("com.ibm.bpm.install.ui.widgets.textbox.PortTextBox");

dojo.require("dijit.form.NumberTextBox");

/*
 * Form Widget that will allow the look and feel of a TextBox, but the validation power of a dojo PortTextBox
 */
dojo.declare("com.ibm.bpm.install.ui.widgets.textbox.PortTextBox", [dijit.form.NumberTextBox
], {

    templateString: dijit.form.TextBox.prototype.templateString,
    trim: true,
    required: true,

    // Default ports
    defaultPorts: {
        "DB2": 50000,
        "MSSQL": 1433,
        "Oracle": 1521
    },

    // @Override
    postMixInProperties: function() {
        this.inherited(arguments);

        // Set port range and format constraints
        var constraints = {
            min: 0,
            max: 65535,
            places: 0,
            pattern: "#####"
        };

        this.attr("constraints", constraints);
    },

    // @Override
    postCreate: function() {
        this.inherited(arguments);

        // Add portText styling
        dojo.addClass(this.domNode, "portText");
    },

    /*
     * Sets the dbType, chaning the port to the new default value
     */
    setDbType: function(type) {
        var defaultPort = this.defaultPorts[type];
        this.attr("value", defaultPort);
    }

});
