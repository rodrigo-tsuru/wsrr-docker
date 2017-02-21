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
dojo.provide("com.ibm.bpm.install.ui.widgets.textbox.ValidationTextBox");

dojo.require("dijit.form.ValidationTextBox");

/*
 * Form Widget that will allow the look and feel of a TextBox, but the validation power of a dojo ValidationTextBox
 */
dojo.declare("com.ibm.bpm.install.ui.widgets.textbox.ValidationTextBox", [dijit.form.ValidationTextBox
], {

    templateString: dijit.form.TextBox.prototype.templateString,
    trim: true,
    required: true,
    tooltipPosition: [
        "below",
        "above"
    ],
    invalid: false,
    messages: {},
    messageKey: null,

    /*
     * Enables the user to force an error state on the validation text box by supplying an error message key.
     */
    forceError: function(errorMessageKey) {

        // If this message cannot be found, just return.
        if (!this.messages[errorMessageKey]) {
            return;
        }

        this.messageKey = errorMessageKey;
        this.invalid = true;
    },

    // @Override
    /*
     * Check the forced error flag, or default to the inherited validity.
     */
    isValid: function(/* Boolean */isFocused) {
        if (this.invalid) {
            return false;
        } else {
            return this.inherited(arguments);
        }
    },

    // @Override
    /*
     * If forced error, return the message key, otherwise return the default error message.
     */
    getErrorMessage: function() {
        if (null != this.messageKey) {
            return this.messages[this.messageKey];
        } else {
            return this.inherited(arguments);
        }
    },

    // @Override
    /*
     * The ValidationTextBox has been updated, clear out any forced errors.
     */
    _refreshState: function() {
        this.inherited(arguments);
        this.messageKey = null;
        this.invalid = false;
    }

});
