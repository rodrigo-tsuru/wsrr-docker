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
dojo.provide("com.ibm.bpm.install.ui.widgets.tree.CheckBoxTree");

// dojo.require the necessary dijit hierarchy
dojo.require("dijit.Tree");

dojo.declare("com.ibm.bpm.install.ui.widgets.tree._CheckBoxTreeNode", dijit._TreeNode, {

    // Override this method to perform custom behavior during dijit construction.
    // Common operations for constructor:
    // 1) Initialize non-primitive types (i.e. objects and arrays)
    // 2) Add additional properties needed by succeeding lifecycle methods
    constructor: function() {

    },

    _checkbox: null,

    _createCheckbox: function() {
        this._checkbox = dojo.doc.createElement('input');
        this._checkbox.type = 'checkbox';
        this._checkbox.checked = false;
        dojo.place(this._checkbox, this.expandoNode, 'after');
    },

    // postCreate() is called after buildRendering(). This is useful to override when
    // you need to access and/or manipulate DOM nodes included with your widget.
    // DOM nodes and widgets with the dojoAttachPoint attribute specified can now be directly
    // accessed as fields on "this".
    // Common operations for postCreate
    // 1) Access and manipulate DOM nodes created in buildRendering()
    // 2) Add new DOM nodes or widgets
    postCreate: function() {
        this._createCheckbox();
        this.inherited(arguments);
    }
});

dojo.declare("com.ibm.bpm.install.ui.widgets.tree.CheckBoxTree", dijit.Tree, {

    // selected features
    selectedFeatures: '',

    // list of selected features name
    selectedFeaturesName: [],

    // Override this method to perform custom behavior during dijit construction.
    // Common operations for constructor:
    // 1) Initialize non-primitive types (i.e. objects and arrays)
    // 2) Add additional properties needed by succeeding lifecycle methods
    constructor: function() {

    },

    // if not INPUT type node i.e. checkbox not clicked, do parent's _onClick,
    // otherwise if this checkbox is a tree node type, then toggle checkbox checked state
    _onClick: function(/* TreeNode */node, /* Event */evt) {
        var domElement = evt.target;
        if (domElement.nodeName != 'INPUT') {
            return this.inherited(arguments);
        }
        var nodeWidget = dijit.getEnclosingWidget(domElement);
        if (!nodeWidget || !nodeWidget.isTreeNode) {
            return;
        }
        nodeWidget._checkbox.checked ^ true;
        if (nodeWidget._checkbox.checked) {
            this.onNodeChecked(nodeWidget.item, nodeWidget);
        } else {
            this.onNodeUnchecked(nodeWidget.item, nodeWidget);
        }
    },

    _createTreeNode: function(args) {
        var node = new com.ibm.bpm.install.ui.widgets.tree._CheckBoxTreeNode(args);

        // disable if restrictions
        if (args.item.restrictions) {
            if (args.item.restrictions[0].os == top.OS) {
                node._checkbox.disabled = true;
            }
        }

        // do default selections if defined and applicable (node is not disabled)
        if (!node._checkbox.disabled) {
            if (args.item.selected) {
                node._checkbox.checked = true;
                this.onNodeChecked(args.item, node);
            }
        }
        return node;
    },

    // labels to be read from properties file
    getLabel: function(/* dojo.data.Item */item) {
        if (item.arg) {
            return top.formatmsg(property(this.model.getLabel(item)), String(item.arg));
        } else {
            return property(this.model.getLabel(item));
        }
    },

    // tooltip for the node
    getTooltip: function(/* dojo.data.Item */item) {
        if (item.tooltip) {
            return property(String(item.tooltip));
        } else {
            return this.getLabel(item);
        }
    },

    onNodeChecked: function(/* dojo.data.Item */storeItem, /* treeNode */nodeWidget) {

        if (nodeWidget.hasChildren()) {
            var children = nodeWidget.getChildren();

            for ( var i = 0; i < children.length; i++) {
                var child = children[i];
                if (!child._checkbox.disabled) {
                    child._checkbox.checked = true;
                    this.onNodeChecked(child.item, child);
                }
            }
        }
    },

    onNodeUnchecked: function(/* dojo.data.Item */storeItem, /* treeNode */nodeWidget) {

        if (nodeWidget.hasChildren()) {
            var children = nodeWidget.getChildren();

            for ( var i = 0; i < children.length; i++) {
                var child = children[i];
                child._checkbox.checked = false;
                this.onNodeUnchecked(child.item, child);
            }
        }

    },

    getSelectedFeatures: function() {
        this.calculateSelectedFeatures();
        return this.selectedFeatures;
    },

    calculateSelectedFeatures: function(/* treeNode */node) {
        if (!node || node == "undefined") {
            node = this.rootNode;
            this.selectedFeatures = '';
            this.selectedFeaturesName = [];
        }

        if (node._checkbox.checked) {
            var feature = this.model.store.getValue(node.item, "value");
            if (feature) {
                if (this.selectedFeatures.length == 0) {
                    this.selectedFeatures = String(feature);
                } else {
                    this.selectedFeatures = this.selectedFeatures + "," + String(feature);
                }
                this.selectedFeaturesName[this.selectedFeaturesName.length] = this.getLabel(node.item);
            }
        }

        var children = node.getChildren();
        for ( var i = 0; i < children.length; i++) {
            this.calculateSelectedFeatures(children[i]);
        }
    },

    // postCreate() is called after buildRendering(). This is useful to override when
    // you need to access and/or manipulate DOM nodes included with your widget.
    // DOM nodes and widgets with the dojoAttachPoint attribute specified can now be directly
    // accessed as fields on "this".
    // Common operations for postCreate
    // 1) Access and manipulate DOM nodes created in buildRendering()
    // 2) Add new DOM nodes or widgets
    postCreate: function() {
        this.inherited(arguments);
    }
});