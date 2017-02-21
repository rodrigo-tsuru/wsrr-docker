// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
// Copyright IBM Corporation 2011, 2012. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("installation.utils.PrereqCheckStep");

dojo.require("installation.utils.InstallPauseStep");
dojo.require("installation.utils.InstallUtils");

/*
 * Installation step to check the prereqs before install.
 */
dojo.declare("installation.utils.PrereqCheckStep", [installation.utils.InstallPauseStep], {

    // Step properties
    points: 30,
    // Ulimit minimum
    ulimitMin: null,
    
    constructor: function(){
        this.ulimitMin = parseInt(property("ulimit.min"));
    },
    
    /*
     * Code to run to execute this step
     */
    execute: function(data){
    
        // Get required size
        var requiredSize = data.installSize;
        
        // Add database size if using embedded db2
        if (data.embedded) {
            requiredSize += parseInt(property("DB2.size"));
        }
        
        // Add profile size
        requiredSize += parseInt(property("BPM.profile.size"));
        
        // Add Database size if windows
        if (top.isWindows()) {
            requiredSize += parseInt(property("BPM.DB2.database.size"));
        }
        
        // Check main installation directory for size.		
        var response = installation.utils.InstallUtils.getDirectoryInfo(data.location,"status");
        
        if (response.availableSize <= requiredSize) {
            // Translate MB to GB with one decimal for printing.
            var requiredGb = (requiredSize / 1024).toFixed(1);
            
            var errorMsg = top.formatmsg(property('validation.dir.size'), data.location, requiredGb + "");
            this.messages[this.messages.length] = new installation.utils.Message("error", errorMsg);
        }
        
        if(data.embedded && top.isWindows()){
        
        	var db2DatabaseInstanceDir = data.location.substring(0,3)+"\BPMINST";
        
        	response = installation.utils.InstallUtils.getDirectoryInfo(db2DatabaseInstanceDir ,"exists"); 
            
            if(response.exists==true){
            
            	var errorMsg = top.formatmsg(property('validation.dir.shouldnotexist'),'BPMINST', db2DatabaseInstanceDir); 
                this.messages[this.messages.length] = new installation.utils.Message("error", errorMsg);
            
            }
            
            
        	response = installation.utils.InstallUtils.doesUidExist(data.embedded.admin_user,top.OS);
        	
        	if(response.isExists==true){
        	
        	   var location = top.STARTINGDIR + "launchpad/content/scripts/AZY_PasswordChecker.exe";
        	   response = installation.utils.InstallUtils.verifyPassword(location,data.embedded.admin_user,data.database.dbPassword,top.OS);
        	  
        	  	if(response.isValid!=true){
            
        	  		if (data.isWsrr){
        	  			var errorMsg = top.formatmsg(property('validation.userId.inValidPassword.wsrr'), data.embedded.admin_user); 
        	  		} else {
        	  			var errorMsg = top.formatmsg(property('validation.userId.inValidPassword'), data.embedded.admin_user); 
        	  		}
                		this.messages[this.messages.length] = new installation.utils.Message("error", errorMsg);
            
            	}
            
            }else if(response.isExists==false){
            
            	var location = top.STARTINGDIR + "launchpad/content/scripts/AZY_PrecheckPassword.exe";
            	response = installation.utils.InstallUtils.isPasswordValid(location,data.embedded.admin_user,data.database.dbPassword,top.OS);
       
            		if(response.isValid!=true){
            			if (data.isWsrr){
            				var errorMsg = top.formatmsg(property('validation.password.inValidPassword.wsrr'),data.embedded.admin_user); 
            			} else {
            				var errorMsg = top.formatmsg(property('validation.password.inValidPassword'),data.embedded.admin_user); 
            			}
	            		this.messages[this.messages.length] = new installation.utils.Message("error", errorMsg);
            		}
            
            }
        
        }

        // Check database required size for embedded DB2  
        if (data.embedded && !top.isWindows()) {
            var db2DatabaseDir = "/home"; 
                        
            response = installation.utils.InstallUtils.getDirectoryInfo(db2DatabaseDir,"status");
            
            var db2DatabaseSize = parseInt(property("BPM.DB2.database.size"));
            
            if (response.availableSize <= db2DatabaseSize) {
                // Translate MB to GB with one decimal for printing.
                var requiredGb = (db2DatabaseSize / 1024).toFixed(1);
                
                var errorMsg = top.formatmsg(property('validation.dir.size'), db2DatabaseDir, requiredGb + "");
                this.messages[this.messages.length] = new installation.utils.Message("error", errorMsg);
            }
            
 
            
            response = installation.utils.InstallUtils.doesUidExist(data.database.dbUserId,top.OS);
        	
        	if(response.isExists==true){ // yes user exists
        	
        	   var location = top.STARTINGDIR + "launchpad/content/scripts/AZY_LinuxCheckPassword";
        	   response = installation.utils.InstallUtils.verifyPassword(location,data.database.dbUserId,data.database.dbPassword,top.OS);
        	  
        	  	if(response.isValid!=true){ //password is invalid
            
            		var errorMsg = top.formatmsg(property('validation.userId.inValidPassword'), data.database.dbUserId); 
                	this.messages[this.messages.length] = new installation.utils.Message("error", errorMsg);
            
            	}else if(response.isValid=true){ //password is valid
            	
            		var validUser = installation.utils.InstallUtils.getUserHomeDirectory(data.database.dbUserId);
            		
            		if(validUser.homeDirectory!=null){ //user home is valid
            		
            		           response = installation.utils.InstallUtils.getDirectoryInfo(validUser.homeDirectory + "/" + data.database.dbUserId ,"exists"); 
            
            					if(response.exists==true){ //existing db 2 instance folder exists
            						var errorMsg = top.formatmsg(property('validation.dir.shouldnotexist'), data.database.dbUserId, validUser.homeDirectory); 
                					this.messages[this.messages.length] = new installation.utils.Message("error", errorMsg);
            
            					}
            		}else{ //error obtaining user home 
            		
            		/*
            		
         				LDAP user with name colliding with Db2 instance name (bpminst), 
         				then we can't retrieve LDAP user home directory (as it won't be present at /etc/passwd file)
         				
         				Resolution: DB2 native installer doesn't allow LDAP user name	
            		
            		 */
            		 
            		
            		}
            	
            	}
            
        	}
        }
        
        // Check temp directory for size.		
        var tempDir = top.getNativeFileName(top.getEnv("LaunchPadTemp"));
        response = installation.utils.InstallUtils.getDirectoryInfo(tempDir,"status");
        
        var tempSize = parseInt(property("temp.size"));
        
        if (response.availableSize <= tempSize) {
            // Translate MB to GB with one decimal for printing.
            var requiredGb = (tempSize / 1024).toFixed(1);
            
            var errorMsg = top.formatmsg(property('validation.dir.temp.size'), tempDir, requiredGb + "");
            this.messages[this.messages.length] = new installation.utils.Message("error", errorMsg);
        }
        
        // Check ulimit if unix
        if (!top.isWindows()) {
            
            var ulimit = installation.utils.InstallUtils.getUlimit();
            var ulimitProperty  = "ulimit.number";     
            var ulimitValue = parseInt(property(ulimitProperty));
            if (ulimit < ulimitValue) {
                var errorMsg = top.formatmsg(property('validation.ulimit'), ulimitValue + "");
                this.messages[this.messages.length] = new installation.utils.Message("error", errorMsg);
            }
        }
        
        // Check WSRR DB2 Tablespace
        if (data.edition == "WSRR" && data.dbType == "DB2") {
            var wsrrDb2TablespaceDir = null;
            if (top.isWindows()) {
                wsrrDb2TablespaceDir = data.location.substring(0,3)+"\\";
            }
            else {
                wsrrDb2TablespaceDir = "/home/" + data.database.dbSysUserId;
            }
            
            response = installation.utils.InstallUtils.getDirectoryInfo(wsrrDb2TablespaceDir,"status");
            
            var wsrrDb2TablespaceSize = parseInt(property("WSRR.DB2.tablespace"));
            
            if (response.availableSize <= wsrrDb2TablespaceSize) {
                // Translate MB to GB with one decimal for printing.
                var requiredGb = (tempSize / 1024).toFixed(1);
                
                var errorMsg = top.formatmsg(property('validation.dir.size'), wsrrDb2TablespaceDir, requiredGb + "");
                this.messages[this.messages.length] = new installation.utils.Message("error", errorMsg);
            }
        }
        
        // Check overall success
        this.success = (this.messages.length == 0);
    },
    
    /*
     * Returns the current number of points completed by this step and the current status text to display
     */
    getProgress: function(){
        return {
            points: this.points,
            text: property("wizard.prereqCheck")
        };
    }
    
});
