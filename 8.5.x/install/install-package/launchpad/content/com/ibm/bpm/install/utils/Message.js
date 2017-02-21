// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
// Copyright IBM Corporation 2011, 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("com.ibm.bpm.install.utils.Message");

dojo.declare("com.ibm.bpm.install.utils.Message", null, {

    severity: null,
    text: null,
    
    constructor: function(severity, text){
        this.severity = severity;
        this.text = text;
    }
    
});
