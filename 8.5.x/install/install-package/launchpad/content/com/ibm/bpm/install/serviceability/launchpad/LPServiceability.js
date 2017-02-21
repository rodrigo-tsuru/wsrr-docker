// Licensed Materials - Property of IBM
// 5725-C94
// Copyright IBM Corporation 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("com.ibm.bpm.install.serviceability.launchpad.LPServiceability");

dojo.require("com.ibm.bpm.install.utils.JsonHelper");

dojo.declare("com.ibm.bpm.install.serviceability.launchpad.LPServiceability", [], {
	// Place comma-separated class attributes here. Note, instance attributes 
	// should be initialized in the constructor. Variables initialized here
	// will be treated as 'static' class variables.

    // Constructor function. Called when instance of this class is created
	constructor : function() {
		
	},
    
    checkForLaunchpadUpdates : function() {

        var now = new Date().getTime();
        var requestFileName = "GetLaunchpadUpdates_"+ now + ".json";  //JSON request file name
        
        var requestFile = util.getPersistedTempFilename(requestFileName);       
		
        var logger = loggerFactory.getLaunchpadUpdatesLogger();
        
        jsonHelper = new com.ibm.bpm.install.utils.JsonHelper();
        
        // json request to fetch Launchpad update repository from bpm_updates.properties 
        jsonHelper.createGetLaunchpadUpdateRequest(requestFile);
               
        var imPath = osHelper.getIMLocation(); // Get IM folder location
        
        message = "I: Fetching Launchpad updates: " + top.readTextFile(requestFile, "ASCII");
        logger.logMessage(message);
        
        runProgram("DISK1", command("runJavaMethod", top.STARTINGDIR, requestFile, imPath), FOREGROUND, HIDDEN);
        
       
        //response processing
        var responseText = top.readTextFile(requestFile.replace(".json", ".response.json"), "ASCII");
        
        if (null == responseText) {
            message = "E: runJavaMethod returned null while fetching Launchpad updates";
            logger.logMessage(message);
            return;
        }
        
        var response = eval("(" + responseText + ")");
        
        if (response.result == "FAIL") {
            if(response.message){
                message = "E: runJavaMethod returned FAIL while fetching Launchpad updates with message "+ response.message;
                logger.logMessage(message);
            }
            
            return;
        }
        
        //log the issues 
        if(response.data.issues){
        
                message = "W: Launchpad updates issues:";
                logger.logMessage(message);
        
                for(var i = 0 ; i < response.data.issues.length ; i++ ) {
                        var issue = response.data.issues[i];
                        message = "W: issueType: "+issue.type + "; issueId: " +issue.id + "; issueValue: "+ issue.value;
                        logger.logMessage(message);           
                }
        }
        
        // TODO : @MV find out if there is any other way to access it. 
        //        Maybe a global variable in this class itself. Check with Sashti
        top.launchpadUpdates = response.data;
        
        //Apply launchpad updates if applicable  
        if(top.launchpadUpdates
           && top.launchpadUpdates.launchpad
           && top.launchpadUpdates.launchpad.pkgUrl && top.launchpadUpdates.launchpad.version) {
         
            var launchpadUniqueId = property("launchpadUniqueId"); //fetch the value of launchpadUniqueId
            var update = false; //default value set to false
            
            message = "I: ifixes to Launchpad Applicability check";
            logger.logMessage(message);     
            
            if(util.checkForNoProperty('launchpadUniqueId',launchpadUniqueId)!=true && launchpadUniqueId!=""){
                
                message = "I: launchpadUniqueId is valid";
                logger.logMessage(message);     
                
                    
                /*
                 * Launchpad unique id is present at 
                 * content/global.properties after build.
                 * 
                 * The id is programmed as part of launchpad.bpm/build.xml script
                 * 
                 */
                
                //extract the version
                var launchpadUniqueIdversionLocation = launchpadUniqueId.search('-')+1;
                var launchpadUpdateRepositoryPrefix = "update";
                
                var launchpadFullVersion = launchpadUniqueId.substr(launchpadUniqueIdversionLocation); //BPM_Launchpad-*.*.*.*
                var splittedLaunchpadVersion = launchpadFullVersion.split('.');  
                
                //extract the update version from launchpad update repository file
                var fullpkgFileName = launchpadUpdateRepositoryPrefix +top.launchpadUpdates.launchpad.version;
                var fullVersionPkgFile = fullpkgFileName.substr(launchpadUpdateRepositoryPrefix.length); //update*.pkg
                var splittedPkgVersion = fullVersionPkgFile.split('.');
                
                var releaseMajor = splittedPkgVersion[0];
                var releaseMinor = splittedPkgVersion[1];
                var modification = splittedPkgVersion[2];
                var fixPack = splittedPkgVersion[3];
                
                //extract the version from launchpad unique id
                var oldReleaseMajor = splittedLaunchpadVersion[0];
                var oldReleaseMinor = splittedLaunchpadVersion[1];
                var oldModification =splittedLaunchpadVersion[2];
                var oldFixPack;
                
                /*
                 * From KingFisk release, BPM Launchpad is following four digit version 
                 * x.y.z.f 
                 *  x,y - Release
                 *  z - modification
                 *  f - Fix pack version
                 *  Exception: BPM 7.5.1 launchpad (Apollo Launchpad)
                 */
                
                if(splittedLaunchpadVersion[3]!=null){
                    oldFixPack = splittedLaunchpadVersion[3];
                }else{
                   oldFixPack  ='0';
                   //Apollo launchpad was released with launchpad unique id BPM_Launchpad-7.5.1
                    message = "I: Apollo Launchpad";
                    logger.logMessage(message);     
                }
                
                //is the lanchpad update applicable 
                if(releaseMajor==oldReleaseMajor){
                    if(releaseMinor==oldReleaseMinor){
                        if(modification==oldModification){
                             if(fixPack==oldFixPack){
                                                update = true;    
                                    //launchpad ifix version check is done by java code
                                    //first time launchpad ifix version is nothing and it updates
                                                message = "I: Applicable launchpad Update";
                                                logger.logMessage(message);     
                              }
                          }
                      }
                }
            }
            
            // TODO : @MV what did we do in the last if clause? 
            //       I see only two info logs written and update flag set.
            //       Is it purely based upon the update*.pkg file name?
            /*
             * else update = false; wont apply updates
             */
           
            //nuance - will be removed at a later point of time
           
            // TODO : @MV whats this replacement? someurl/update8000.pkg => someurl/updates.pkg
           var temp = "update"+top.launchpadUpdates.launchpad.version;
           top.launchpadUpdates.launchpad.pkgUrl   = top.launchpadUpdates.launchpad.pkgUrl.replace(temp,"updates");
           
           message = "I: Available launchpad updates: " +top.launchpadUpdates.launchpad.pkgUrl;
           logger.logMessage(message);
        
           if(update) {     
                message = "I: Applying applicable launchpad Update"
                logger.logMessage(message);
           
               /* As per launchpad documentation, launchpad internal function
                * will show the update pop-up and update launchpad as per user action.
                */
                top.setLaunchpadUpdateSite(top.launchpadUpdates.launchpad.pkgUrl);
       
              /*    In the KingFish release while working on launchpad serviceability, 
               *  BPM Install team found an inherent issue with Common Launchpad tool while performing update. 
               *  The core internal update function of launchpad (launchpad/update.js/checkUpdates()) 
               *  was racing with BPM Install team extended code and it was decided that we (BPM install) 
               *  team will call the their internal method after our initial checks.
               */  
               top.checkUpdates();
           }
               
               /*
                * else irrelevant update 
                */
        }
        
    },
        
        /*
         * Function which sets the IMAGEDIR variable based on launchpad start location
         * and kick starts check for updates to launchpad. 
         */
        setupForLaunchpadUpdates : function() {
           if (!top.ORIGINALSTARTINGDIR || top.ORIGINALSTARTINGDIR=="undefined")
              window.setTimeout(function() {this.setupForLaunchpadUpdates();}, 500);
           else {
                 // do stuff once ORIGINALSTARTINGDIR is set
                  top.IMAGEDIR = top.ORIGINALSTARTINGDIR;
                  this.checkForLaunchpadUpdates();
             }
        }
//, 
//Uncomment above comma and add comma-separated functions here. Do not leave a 
// trailing comma after last element.			
});