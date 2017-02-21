// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS 
// Copyright IBM Corporation 2011, 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("com.ibm.bpm.install.ui.widgets.dialog.ErrorDialog");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.Dialog");

dojo.require("com.ibm.bpm.install.utils.Message");

dojo.declare("com.ibm.bpm.install.ui.widgets.dialog.ErrorDialog", [
    dijit._Widget,
    dijit._Templated
], {

    // Template information
    templatePath: dojo.moduleUrl("com.ibm.bpm.install.ui.widgets.dialog.ErrorDialog", "../templates/ErrorDialog.html"),
    widgetsInTemplate: true,
    labels: {},
    _connections: null,

    // Dialog messages
    messages: null,

    // Load all labels
    postMixInProperties: function() {
        this.inherited(arguments);
        this.labels.TITLE = property("install.result");
        this.labels.FAIL = property("install.fail");
        this.labels.MESSAGES = property("install.messages");
        this.labels.PRINT = property("print");
        this.labels.CLOSE = property("close");
    },

    // @Override
    postCreate: function() {
        this.inherited(arguments);
        this._connections = new Array();

        // Setup connection for buttons
        this._connections.push(dojo.connect(this.closeButton, "onClick", this, "hide"));
        this._connections.push(dojo.connect(this.printButton, "onClick", this, "printPage"));

        // Add messages
        for ( var i = 0; i < this.messages.length; i++) {
            this.addMessage(this.messages[i]);
        }
    },

    /*
     * Show method to show the dialog.
     */
    show: function() {
        this.dialog.show();
    },

    /*
     * Custom hide method that hides the dialog, then destroys this widget.
     */
    hide: function() {
        this.dialog.hide();
        this.destroyRecursive();
    },

    /*
     * Prints this error dialog.
     */
    printPage: function() {
        // Get the contents
        var content = this.errorTable.innerHTML;
        var html = "<html><head><style>@media print {.printHidden {display:none !important;}}</style><title>";
        html += this.labels.TITLE;
        html += "</title></head><body onload=\"focus();print();\" >";
        html += content;
        html += "</body></html>";

        // Write them to a temp file.
        var errorHtmlFile = util.getPersistedTempFilename("errorDialog.html");
        top.writeTextFile(errorHtmlFile, html, false, "UTF-8");

        // Set them in the iframe.
        this.printArea.src = "file://" + errorHtmlFile;
    },

    // Adds a new message row to the dialog.
    addMessage: function(message) {

        var messageRow = document.createElement("tr");
        var messageIconColumn = document.createElement("td");
        var messageIcon = document.createElement("div");
        var messageTextColumn = document.createElement("td");
        var messageText = document.createElement("span");

        this.messagesBody.appendChild(messageRow);
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
        }

        messageText.innerHTML = message.text;
        logger.logMessage(property("log.error.install.fail") + " " + message.text);
    }

});
