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
dojo.provide("com.ibm.bpm.install.ui.widgets.InstallWizard");

dojo.require("dojox.widget.Wizard");
dojo.require("dijit.ProgressBar");
dojo.require("dijit._Templated");
dojo.require('dijit.form.Button');

dojo.require("com.ibm.bpm.install.ui.widgets.dialog.ContinueDialog");
dojo.require("com.ibm.bpm.install.ui.widgets.dialog.ErrorDialog");
dojo.require("com.ibm.bpm.install.ui.widgets.dialog.SuccessWSRRDialog");

/*
 * Extension of wizard to include new template
 */
dojo.declare("com.ibm.bpm.install.ui.widgets.InstallWizard", [
    dojox.widget.Wizard,
    dijit._Templated
], {

    // Altered template to allow for layout
    templateString: dojo.cache("com.ibm.bpm.install.ui.widgets", "templates/InstallWizard.html"),
    widgetsInTemplate: true,
    hideDisabled: true,

    // Data stored during wizard
    data: {},
    // Steps to be run as part of wizard
    steps: [],
    // Current step in execution
    currentStep: 0,
    // Total points completed so far
    completedPoints: 0,
    // If cancellation has occurred
    cancelled: false,
    // Interval in milliseconds to check steps for updates to status
    updateInterval: 2000,

    // @Override
    postMixInProperties: function() {
        this.inherited(arguments);

        // Add this object to the data
        this.data.wizard = this;

        // Load all button labels
        this.previousButtonLabel = property("wizard.previous");
        this.nextButtonLabel = property("wizard.next");
        this.doneButtonLabel = property("wizard.done");
        this.cancelButtonLabel = property("wizard.cancel");
        this.exitButtonLabel = property("wizard.exit");
        this.testConnectionButtonLabel = property("wizard.testConnection");
        this.cancellingLabel = property("wizard.cancelling");
    },

    // @Override
    resize: function(changeSize, resultSize) {
        // DOJO BUG - Workaround for a firefox only dojo bug where the wizard would not grow to fill the available
        // height.
        if (dojo.isFF && !changeSize) {
            var height = parent.document.getElementById('frame_typical_install').clientHeight - 50;
            this.resize({
                h: height
            });
        } else {
            this.inherited(arguments);
        }
    },

    /*
     * When Cancel button is clicked, Show cancel dialog for confirmation with Yes and No button.
     */
    cancelFunction: function() {
        logger.logMessage(property("log.info.cancel"));

        var dialog = new com.ibm.bpm.install.ui.widgets.dialog.ContinueDialog({
            continueCallback: dojo.hitch(this, this.monitorStep),
            cancelCallback: dojo.hitch(this, this.cancelInstallation)

        });
        dialog.show();
    },

    /*
     * When Yes is selected on cancel dialog, disable future clicks and show cancelling status.Cancel the installation.
     */
    cancelInstallation: function() {
        this.cancelButton.attr("disabled", true);
        this.status.innerHTML = this.cancellingLabel;
        this.progressBar.update({
            'indeterminate': true
        });
        this.cancelled = true;
    },

    /*
     * Adds an install step.
     */
    addStep: function(step) {
        this.steps[this.steps.length] = step;
    },

    /*
     * Clears out all install steps.
     */
    clearAllSteps: function() {
        this.steps = [];
    },

    /*
     * Start the execution of the installation steps.
     */
    runInstallSteps: function() {

        // Reset basic steps.
        this.currentStep = -1;
        this.completedPoints = 0;
        this.cancelled = false;

        // Calculate the total number of points
        var totalPoints = 0;
        for ( var i = 0; i < this.steps.length; i++) {
            totalPoints += this.steps[i].points;
        }

        // Setup the progress bar.
        this.progressBar.maximum = totalPoints;

        this.progressBar.update({
            'indeterminate': false,
            'progress': 0
        });

        // Show status, progress bar, and cancel button
        this.status.innerHTML = "";
        this.status.style.display = "";
        this.progressBar.domNode.style.display = "";
        this.cancelButton.attr("disabled", false);
        this.cancelButton.domNode.style.display = "";

        logger.logMessage(property("log.info.install"));

        // Kick off the first step and the monitor
        this.executeNextStep();
    },

    /*
     * Starts execution of the current step.
     */
    executeNextStep: function() {

        // Check if we are cancelled.
        if (this.cancelled && this.currentStep != -1) {
            this.cancelInstall();
            return;
        }

        // Increment current step count.
        this.currentStep++;

        logger.logMessage(top.formatmsg(property("log.info.install.step"), (this.currentStep + 1).toString(), this.steps.length.toString()));

        // Check if there is a next step
        if (this.currentStep >= this.steps.length) {
            this.installDone(true);
            return;
        }

        // Get next step to start.
        var step = this.steps[this.currentStep];

        // Get initial status message
        this.status.innerHTML = step.getProgress().text;

        // Run step
        step.execute(this.data);

        // Monitor step for completion.
        this.monitorStep();
    },

    /*
     * Checks to see if the currently running step has completed
     */
    monitorStep: function() {

        // Get currently running step.
        var step = this.steps[this.currentStep];

        // Update progress
        if (!this.cancelled) {
            var progress = step.getProgress();
            this.status.innerHTML = progress.text;
            this.progressBar.update({
                'indeterminate': false,
                'progress': this.completedPoints + progress.points
            });
        }

        // Check to see if the step is done.
        if (step.isDone()) {
            // Check to see if the step executed successfully
            var result = step.getResult();

            // If successful continue
            if (result.success) {

                // Add in the completed points
                this.completedPoints += step.points;
                this.executeNextStep();
            }
            // Otherwise stop install with error.
            else {
                this.installDone(false);
            }
        }
        // Check again later.
        else {
            setTimeout(dojo.hitch(this, this.monitorStep), this.updateInterval);
        }
    },

    /*
     * Cancel was called on the install.
     */
    cancelInstall: function() {

        // Get last step at cancellation time
        var step = this.steps[this.currentStep];

        // Get continue message
        var continueMessage = step.getContinueMessage();

        // If there is no continueMessage, cancel out immediately.
        if (continueMessage == null) {
            this.cancelOut();
        } else {
            var dialog = new com.ibm.bpm.install.ui.widgets.dialog.ContinueDialog({
                continueMessage: continueMessage,
                continueCallback: dojo.hitch(this, this.executeNextStep),
                cancelCallback: dojo.hitch(this, this.cancelOut)
            });

            // Reset cancelled in case we continue.
            this.cancelled = false;
            this.cancelButton.attr("disabled", false);
            this.progressBar.update({
                'indeterminate': false
            });

            dialog.show();
        }
    },

    /*
     * Sets wizard to a post-cancel state.
     */
    cancelOut: function() {

        // Log cancellation
        logger.logMessage(property("log.info.cancel.user"));

        // Hide status, progress bar, and cancel button
        this.status.style.display = "none";
        this.progressBar.domNode.style.display = "none";
        this.cancelButton.domNode.style.display = "none";

        // Show back and exit buttons
        this.previousButton.attr("disabled", false);
        this.previousButton.domNode.style.display = "";
        this.exitButton.domNode.style.display = "";
    },

    /*
     * Installation completed execution or ran into an error.
     */
    installDone: function(pass) {

        // Hide status, progress bar, and cancel button
        this.status.style.display = "none";
        this.progressBar.domNode.style.display = "none";
        this.cancelButton.domNode.style.display = "none";

        // Show exit button
        this.exitButton.domNode.style.display = "";

        // Show either the success or error dialog.
        var dialog = null;

        if (pass) {
            logger.logMessage(property("log.info.install.success"));
            dialog = new com.ibm.bpm.install.ui.widgets.dialog.SuccessWSRRDialog({
                data: this.data
            });
        } else {
            // Failed step
            var step = this.steps[this.currentStep];

            logger.logMessage(property("log.error.install.fail.step") + " " + (this.currentStep + 1));

            dialog = new com.ibm.bpm.install.ui.widgets.dialog.ErrorDialog({
                messages: step.messages
            });
        }

        dialog.show();
    }

});