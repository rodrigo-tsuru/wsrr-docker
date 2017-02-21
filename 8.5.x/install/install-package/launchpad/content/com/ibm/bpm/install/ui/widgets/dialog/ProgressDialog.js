// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS 
// Copyright IBM Corporation 2011, 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("com.ibm.bpm.install.ui.widgets.dialog.ProgressDialog");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.Dialog");
dojo.require("com.ibm.bpm.install.utils.Message");

dojo.declare("com.ibm.bpm.install.ui.widgets.dialog.ProgressDialog", [
    dijit._Widget,
    dijit._Templated
], {

    // Template information
    templatePath: dojo.moduleUrl("com.ibm.bpm.install.ui.widgets.dialog.ProgressDialog", "../templates/ProgressDialog.html"),
    widgetsInTemplate: true,
    labels: {},
    _connections: null,

    // Load all labels
    postMixInProperties: function() {
        this.inherited(arguments);
        this.labels.TITLE = property("liveUpdates.progressbar.title");
        this.labels.SPINNERPATH = top.IMAGEDIR + "launchpad/content/images/Spinner.gif";
    },

    postCreate: function() {
        this.inherited(arguments);
    },

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

    addIcon: function(message) {
        logger.logMessage("addIcon");
        var currentMessageIconColumn = document.getElementById("incomplete");
        var messageIconColumnImage = document.createElement("img");

        messageIconColumnImage.setAttribute("src", top.IMAGEDIR + "launchpad/content/images/Ok.png");
        currentMessageIconColumn.appendChild(messageIconColumnImage);
        currentMessageIconColumn.removeAttribute("id");
        logger.logMessage("end of addIcon");
    },
    // Adds a new message row to the dialog.
    addMessage: function(message) {

        if (message.text == "success") {
            this.addIcon(message);
            return;
        }

        var messageRow = document.createElement("tr");
        var messageIconColumn = document.createElement("td");
        var messageIcon = document.createElement("div");
        var messageTextColumn = document.createElement("td");
        var messageText = document.createElement("span");

        this.messagesBody.appendChild(messageRow);
        messageRow.appendChild(messageTextColumn);
        messageTextColumn.appendChild(messageText);
        messageRow.appendChild(messageIconColumn);
        messageIconColumn.setAttribute("id", "incomplete");
        messageIconColumn.appendChild(messageIcon);
        /*
         * switch (message.severity) { case "error":{ dojo.addClass(messageIcon, "errorIcon"); break; } case "warning":{
         * dojo.addClass(messageIcon, "warningIcon"); break; } case "info":{ dojo.addClass(messageIcon, "infoIcon");
         * break; } }
         */
        messageText.innerHTML = message.text;
        logger.logMessage(property("log.error.install.fail") + " " + message.text);
    }

});