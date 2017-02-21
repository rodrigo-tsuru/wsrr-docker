// Licensed Materials - Property of IBM
// 5725-C94
// Copyright IBM Corporation 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.


dojo.provide("com.ibm.bpm.install.soe.Solaris");
dojo.require("com.ibm.bpm.install.soe.Unix");

dojo.declare("com.ibm.bpm.install.soe.Solaris",
		[ com.ibm.bpm.install.soe.Unix ], {
			// Place comma-separated class attributes here. Note, instance attributes 
			// should be initialized in the constructor. Variables initialized here
			// will be treated as 'static' class variables.
			
			checkAdmin : 'checkAdminSolaris',

			// relative IM location on Disk
			getRelativeIMDiskLocation : function() {
			    return 'IM_solaris_sparc';
			},
			
    		getShortName : function() {
    			return "sol";
    		},				

			// Constructor function. Called when instance of this class is created
			constructor : function() {
				
			},
		    
		    getExistingDBLearnMoreLink : function(dbType) {
		    	switch(dbType) {
			    	case "DB2": {
			    			return property('exisitng.db.learn.more.db2.solaris.url');
				    	}
				    	break;
			    	case "MSSQL": {
				    		return property('existing.db.learn.more.mssql.solaris.url');
				    	}
				    	break;
			    	case "Oracle": {
				    		return property('existing.db.learn.more.oracle.solaris.url');
				    	}
		    	}
		    }
		//, 
		//Uncomment above comma and add comma-separated functions here. Do not leave a 
		// trailing comma after last element.			
		});