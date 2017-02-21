// Licensed Materials - Property of IBM
// 5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
// Copyright IBM Corporation 2011, 2012. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.require("installation.utils.InstallUtils");
dojo.require("installation.utils.UpdateKeyringStep");
dojo.require("installation.utils.UpdateAvailableFixPacksStep");
dojo.require("installation.utils.UpdateAvailableFixesStep");
dojo.require("installation.utils.UpdateApplicableFixPacksStep");
dojo.require("installation.utils.UpdateApplicableFixesStep");
dojo.require("installation.widgets.UpdateAuthenticationDialog");
dojo.provide("installation.utils.Updates");

dojo.declare("installation.utils.Updates", null, {

	maxInterval: 300000,
	runningInterval: 0,
	stepInterval: 5000,
	callerReference: null,
	dialogReference:null,
	
start: function(){

	  top.installingOfferingInfo = installation.utils.InstallUtils.getInstallOfferingInfo();
	  
	  top.localFixPacksAndFixes = installation.utils.InstallUtils.getLocalProductUpdatesRepositories();
        
        if(top.localFixPacksAndFixes!=null && top.localFixPacksAndFixes.result != "FAIL")
        {
        	logger.logMessage("getLocalProductUpdatesRepositories call returned PASS");
        	
        	if(top.localFixPacksAndFixes.bpmUpdatesPropertiesFileContainsFixOrFixPackEntries){
        		
        		logger.logMessage("bpm_updates.properties file contains content");
        		
        		var now;
        		if(top.localFixPacksAndFixes.fixPackRepositories &&
        	!this.isBlank(top.localFixPacksAndFixes.fixPackRepositories)){
        			 
            		/*availableFixPacksStep.keyRingLocation = null; 
            		 * implies no url at bpm_updates.properties
            		 */
            		this.callerReference.showProgressBar();
					this.callerReference.updateProgressBar('start',10); 
            		this.availableLocalFixPacksFunction();      			
        		
        		}else if(top.localFixPacksAndFixes.ifixRepositories && 
        				!this.isBlank(top.localFixPacksAndFixes.ifixRepositories)){
        					this.callerReference.showProgressBar();
        					this.availableLocalWASFixesStepFunction();
	    		
        		}else{
        			logger.logMessage("invalid local fixes and fix packs");
        			top.onUpdateStep = true;
        		}
        		
        		
        	}else{
        		
        		if(top.localFixPacksAndFixes.bpmLiveUpdateSiteValid && top.localFixPacksAndFixes.wasLiveUpdateSiteValid){
        			
        			/*
        			 * loop
        			 * 		Show pop up
        			 * 		  OK button callback	
        			 * 			if (authenticated) 
        			 * 
        			 * 				installation.utils.InstallUtils.getAvailableFixPacks(userName,password,file to write)
        			 * 				if valid contents call installation.utils.InstallUtils.getApplicableFixPacks(existing file)
        			 * 				pass the contents onto top.fixPackUpdates
        			 * 				installation.utils.InstallUtils.getAvailableFixes(file to write)
        			 * 				if valid contents call installation.utils.InstallUtils.getApplicableFixes
        			 * 				pass the contents onto top.updates
        			 * 
        			 * 			else
        			 * 
        			 *  			show error messages
        			 *  			loop until user cancel
        			 *        CANCEL button callback
        			 * 				exit loop
        			 * 
        			 *  Pop up - dojo pop requires some background work - time being going with launchpad based pop-up
        			 */
        				top.keyRingShowError = false;
        				
        				//top.onUpdateStep = true;
        				this.showLoginDialogBox();
        				
        				
        		}else if(top.localFixPacksAndFixes.bpmLiveUpdateSiteValid){
        			
        			top.keyRingShowError = false;
        			
        			//top.onUpdateStep = true;
        			this.showLoginDialogBox();
        				
        		}else if(top.localFixPacksAndFixes.wasLiveUpdateSiteValid){
        			top.keyRingShowError = false;
        			//top.onUpdateStep = true;
        			this.showLoginDialogBox();
        		}else{
					//installing machine cannot connect to the live repositories  of WAS and BPM       			
        			logger.logMessage("Cannot connect to live repositories for updates");
                    top.onUpdateStep = true;
        		}
        	}
        }else{
                 logger.logMessage("getLocalProductUpdatesRepositories call returned null");
                 top.onUpdateStep = true;
        }
},

availableLocalFixPacksFunction: function(){
				
				logger.logMessage("At the beginning of availableLocalFixPacksFunction");
            	var now = new Date().getTime();
            		
            	top.availableFixPacksOutputFile = installation.utils.InstallUtils.getPersistedTempFilename('availableFixPacks_'+now);
            		
            	var availableFixPacksStep = new installation.utils.UpdateAvailableFixPacksStep();
            	availableFixPacksStep.logName = top.availableFixPacksOutputFile;
            	availableFixPacksStep.keyRingLocation = null;
            	availableFixPacksStep.repositories = top.localFixPacksAndFixes.fixPackRepositories;
            	this.executeStep(availableFixPacksStep);
		this.callbackLocalavailableFixPacks();
},

callbackLocalavailableFixPacks: function(){

		logger.logMessage("checking local availableFixPackStep status"); 		
	
			if(top.AvailableFixPacksStep){
            	logger.logMessage("local availableFixPacksStep success");
            	var applicableFixPacksStep = new installation.utils.UpdateApplicableFixPacksStep();
            	applicableFixPacksStep.availableFixPacksOutputFile = top.availableFixPacksOutputFile+'.sysout';
            	this.executeStep(applicableFixPacksStep);
            	logger.logMessage("Completed execution of applicableFixPacks");
            	if(top.localFixPacksAndFixes.ifixRepositories && 
        				!this.isBlank(top.localFixPacksAndFixes.ifixRepositories)){
        			logger.logMessage("completed fetching local fixpacks; fetching local fixes");	
            		this.availableLocalWASFixesStepFunction();
				}
				else{
					logger.logMessage("completed fetching local fixpacks; no local fixes");
					this.localClose();
				}
				return;
            }else if (top.AvailableFixPacksStepFailed){
            	 logger.logMessage("AvailableFixPackStep failed");
				 
				if(top.localFixPacksAndFixes.ifixRepositories && 
        				!this.isBlank(top.localFixPacksAndFixes.ifixRepositories)){
            		logger.logMessage("completed fetching local fixpacks; fetching local fixes");
            		this.availableLocalWASFixesStepFunction();
				}
				else{
					logger.logMessage("completed fetching local fixpacks; no local fixes");
					this.localClose();
				}
				return;
            }else if(this.runningInterval>this.maxInterval){
				logger.logMessage("Monitor step max timeout");
				this.localClose();
				return;
			}
            setTimeout(dojo.hitch(this, "callbackLocalavailableFixPacks"), this.stepInterval);
},

availableLocalWASFixesStepFunction: function(){
		this.callerReference.updateProgressBar('fixpack',50);
	    var now = new Date().getTime();
        top.availableWASFixesPacksOutputFile = installation.utils.InstallUtils.getPersistedTempFilename('availableWASFixes_'+now);
	    var availableWASFixesStep = new installation.utils.UpdateAvailableFixesStep();
	    availableWASFixesStep.keyRingLocation = null; 
		availableWASFixesStep.logName=top.availableWASFixesPacksOutputFile;
					 
        if(top.fixPackUpdates && top.fixPackUpdates.targetWasIdVersion){

	    		 logger.logMessage("Get local WAS fixes based on Fix packs");
        		 availableWASFixesStep.id =top.fixPackUpdates.targetWasIdVersion;

        			     
		}else{

        		logger.logMessage("Get local WAS fixes based on base product level");
        		if(top.installingOfferingInfo!= null 
        					&& top.installingOfferingInfo.wasOfferingVersion!=null 
        					&& top.installingOfferingInfo.wasOfferigId!=null)
						{
							availableWASFixesStep.id = top.installingOfferingInfo.wasOfferigId +'_'+top.installingOfferingInfo.wasOfferingVersion;
							logger.logMessage("I: Base WAS product id: "+availableWASFixesStep.id);
						}else{
							availableWASFixesStep.id = null;
							logger.logMessage("I: Base WAS product id: "+availableWASFixesStep.id);
				}
        		
        		
        }
        
        availableWASFixesStep.repository=top.localFixPacksAndFixes.ifixRepositories;
        this.executeStep(availableWASFixesStep);
        this.callbackLocalavailableWASFixes();			            			
},

callbackLocalavailableWASFixes : function(){

			logger.logMessage("checking availableWASFixes step status"); 		
	
			if(top.AvailableWASFixesStep){
				logger.logMessage("availableWASFixes step succeed"); 	
				this.availableLocalBPMFixesFunction();
				return;

            }else if (top.AvailableWASFixesStepFailed){
            	 logger.logMessage("availableWASFixes Step failed");
				 this.availableLocalBPMFixesFunction();		
				 return;
            }else if(this.runningInterval>this.maxInterval){
				logger.logMessage("Monitor step max timeout");
				this.localClose();
				return;
			}
            setTimeout(dojo.hitch(this, "callbackLocalavailableWASFixes"), this.stepInterval);
},

availableLocalBPMFixesFunction: function(){
	
	var now = new Date().getTime();
    top.availableBPMFixesPacksOutputFile = installation.utils.InstallUtils.getPersistedTempFilename('availableBPMFixes_'+now);
	var availableBPMFixesStep = new installation.utils.UpdateAvailableFixesStep();
	availableBPMFixesStep.keyRingLocation= null;
	availableBPMFixesStep.logName =top.availableBPMFixesPacksOutputFile;
				
	if( top.fixPackUpdates && top.fixPackUpdates.targetInstIdVersion )
       {
        	logger.logMessage("Get BPM fixes based on Fix Pack level");
        	availableBPMFixesStep.id =top.fixPackUpdates.targetInstIdVersion;
        			    
        }else{
        	logger.logMessage("Get local BPM fixes based on base product level");
        	/*
        	if(productOffering==''){
        	will hit null when there no repository folder
        	top.AvailableBPMFixesStep = false;
			this.ApplicableLocalFixesFunction()
			}*/
        	
        	if(top.installingOfferingInfo!= null 
        	&& top.installingOfferingInfo.instOfferingVersion!=null 
        	&& top.installingOfferingInfo.instOfferigId!=null)
				{
					availableBPMFixesStep.id = top.installingOfferingInfo.instOfferigId +'_'+top.installingOfferingInfo.instOfferingVersion;
					logger.logMessage("I: Base BPM product id: "+availableBPMFixesStep.id);
				}else{
					availableBPMFixesStep.id = null;
					logger.logMessage("I: Base BPM product id: "+availableBPMFixesStep.id);
				}	
        }
        
        availableBPMFixesStep.repository=top.localFixPacksAndFixes.ifixRepositories;
        this.executeStep(availableBPMFixesStep);
        this.callbackLocalavailableBPMFixesFunction();
},

callbackLocalavailableBPMFixesFunction: function(){
	
			logger.logMessage("checking local availableBPMFixes step status"); 		
	
			if(top.AvailableBPMFixesStep){
				logger.logMessage("availableBPMFixes step succeed"); 	
				this.ApplicableLocalFixesFunction();
				return;

            }else if(top.AvailableBPMFixesStepFailed){
            	logger.logMessage("availableBPMFixes Step failed");
				this.ApplicableLocalFixesFunction();
				return;
            }else if(this.runningInterval>this.maxInterval){
				logger.logMessage("Monitor step max timeout");
				this.localClose; 
				return;
			}
   	
            setTimeout(dojo.hitch(this, "callbackLocalavailableBPMFixesFunction"), this.stepInterval);
},


ApplicableLocalFixesFunction : function(){

		logger.logMessage("value of top.AvailableBPMFixesStep"+top.AvailableBPMFixesStep);
        logger.logMessage("value of top.AvailableWASFixesStep"+top.AvailableWASFixesStep);
        			            		
        if(top.AvailableBPMFixesStep || top.AvailableWASFixesStep){ //paul check
        			            		
        	logger.logMessage("preparing to get applicable fixes");
        	var applicableFixesStep =  new installation.utils.UpdateApplicableFixesStep();
        	logger.logMessage("applicableFixesStep initialised" +applicableFixesStep);
        	applicableFixesStep.availableWASFixesPacksOutputFile=top.availableWASFixesPacksOutputFile+'.sysout';
        	applicableFixesStep.availableBPMFixesPacksOutputFile=top.availableBPMFixesPacksOutputFile+'.sysout';
        	logger.logMessage("applicableFixesStep.availableWASFixesPacksOutputFile "+applicableFixesStep.availableWASFixesPacksOutputFile);
        	logger.logMessage("applicableFixesStep.availableBPMFixesPacksOutputFile "+applicableFixesStep.availableBPMFixesPacksOutputFile);
        	this.executeStep(applicableFixesStep);
        	logger.logMessage("applicableFixesStep complete");
        }
        this.callerReference.updateProgressBar('fix',100);
        this.localClose();
        
},

localClose:function(){
		//top.onUpdateStep = true; 
		this.callerReference.closeProgressBar();                  
		this.callerReference.goToNextPane();
},


	
showLoginDialogBox: function(){
	/*
	
	var content = "<div>"+ property("directionText") + " "+ property("cancelInformation") +
			  "</div><br><table><tr><td><label for='user'>"+
		      property("labelName") + "</label>"+
		      "</td> <td><input type='text' id='user' name='user' /> </td> </tr>"+
		      "<tr> <td><label for='password'>"+
		      property("labelPassword") + "</label>"+
		      "</td> <td> <input type='password' id='password' name='password' /></td> </tr></table>"+
		      "<br><div id='errorData'>";
	
	var failureContent ='';
	
		if(top.keyRingShowError){
			failureContent = property("failureText");
		}
		
	content = content + failureContent +"</div>";


		      if(top.loginDialogId){
                  top.closeDialog(top.loginDialogId);  
          }  
	
	top.loginDialogId = top.showDialog( content, {
		title: property('titleString'),
		buttons: [
			{
				id: "loginPromptConfirmationButton",
				name: "loginPromptConfirmationButton",
				value: "login",
				onclick: dojo.hitch(this,this.loginPromptOKCallback) 
			},
			{
				id: "cancelPromptCancelButton",
				name: "cancelPromptCancelButton",
				value: "cancel",
				onclick: dojo.hitch(this,this.loginPromptCancelCallback)   
			}
		],
		width: "350px"
	});
	*/

	if(this.dialogReference){
		this.dialogReference.hide();
		this.dialogReference = new installation.widgets.UpdateAuthenticationDialog({
				callerOkCallback: dojo.hitch(this, this.loginPromptOKCallback),
                callerCancelCallback: dojo.hitch(this, this.loginPromptCancelCallback),
				errorFlag:true});

	}else{
		this.dialogReference = new installation.widgets.UpdateAuthenticationDialog({
				callerOkCallback: dojo.hitch(this, this.loginPromptOKCallback),
                callerCancelCallback: dojo.hitch(this, this.loginPromptCancelCallback)});
	
	}
		this.dialogReference.show();

},

loginPromptCancelCallback: function(){

	//top.closeDialog(top.loginDialogId);
	this.dialogReference.hide(); 
	this.callerReference.goToNextPane();
},

loginPromptOKCallback: function(){
	
	//top.document.getElementById('loginPromptConfirmationButton').disabled = 'disabled';
	//top.document.getElementById('cancelPromptCancelButton').disabled = 'disabled';
	//top.keyRingAuthenticationUser = top.document.getElementById("user").value;
	//top.keyRingAuthenticationPassword = top.document.getElementById("password").value;
	
	this.dialogReference.okButton.attr('disabled', 'disabled');
	this.dialogReference.cancelButton.attr('disabled', 'disabled');
	top.keyRingAuthenticationUser = this.dialogReference.userId.attr("value");
	top.keyRingAuthenticationPassword = this.dialogReference.password.attr("value");
	
	
	logger.logMessage('UserName :'+top.keyRingAuthenticationUser);
	logger.logMessage('Password : *******');
	
	 if(top.keyRingAuthenticationUser!=null  &&  top.keyRingAuthenticationUser!='' && 
			 top.keyRingAuthenticationUser && 
			 top.keyRingAuthenticationPassword != null && 
			 top.keyRingAuthenticationPassword && top.keyRingAuthenticationPassword!=''){
    		
    		logger.logMessage("I: Valid UserName and Password");
    		
        	var now = new Date().getTime();
        	top.keyRingLocation = installation.utils.InstallUtils.getPersistedTempFilename('keyRingFile_'+now);

    		var UpdateKeyringStep = new installation.utils.UpdateKeyringStep();
    		UpdateKeyringStep.keyRingLocation = top.keyRingLocation;
    		UpdateKeyringStep.userName = top.keyRingAuthenticationUser;
    		UpdateKeyringStep.password = top.keyRingAuthenticationPassword;
    		
    		logger.logMessage("I: Before execution of keyringStep");
            this.executeStep(UpdateKeyringStep);
            this.callbackOfKeyringStep();
            
	}else{
		
		logger.logMessage("User entered null username and password");
		this.showLoginDialogBox();
		
	}		
	
},

callbackOfKeyringStep: function(){

			logger.logMessage("checking keyring step status"); 		
	
			if(top.keyRingStep){
				logger.logMessage("keyring step succeeded"); 	
				this.availableFixPacksFunction();
				return;
            }else if (top.keyRingShowError){
            	 logger.logMessage("Keyring Step failed");
            	 this.showLoginDialogBox();
				 return;
            }else if(this.runningInterval>this.maxInterval){
				logger.logMessage("Monitor step max timeout");
				this.close();
				return;
			}
    	
            setTimeout(dojo.hitch(this, "callbackOfKeyringStep"), this.stepInterval);
},	

availableFixPacksFunction: function(){
		this.dialogReference.hide();
		//top.closeDialog(top.loginDialogId);
		this.callerReference.showProgressBar();

		this.callerReference.updateProgressBar('start',10);
		logger.logMessage("UpdateKeyringStep success");
            	var now = new Date().getTime();
            		
            	top.availableFixPacksOutputFile = installation.utils.InstallUtils.getPersistedTempFilename('availableFixPacks_'+now);
            		
            	var availableFixPacksStep = new installation.utils.UpdateAvailableFixPacksStep();
            	availableFixPacksStep.logName = top.availableFixPacksOutputFile;
            	availableFixPacksStep.keyRingLocation = top.keyRingLocation;
            	availableFixPacksStep.repositories = property('was.repository') + ',' +
            	installation.utils.InstallUtils.getProductRepository();
            		
            	this.executeStep(availableFixPacksStep);
				this.callbackavailableFixPacks();
				

},

callbackavailableFixPacks : function(){

		logger.logMessage("checking availableFixPackStep status"); 		
	
			if(top.AvailableFixPacksStep){
            
				 logger.logMessage("AvailableFixPackStep succeed");	
            	 var applicableFixPacksStep = new installation.utils.UpdateApplicableFixPacksStep();
            	 applicableFixPacksStep.availableFixPacksOutputFile = top.availableFixPacksOutputFile+'.sysout';
            	 this.executeStep(applicableFixPacksStep);
            	 logger.logMessage("Completed execution of applicableFixPacks");
				 this.AvailableWASFixesStepFunction();
				return;

            }else if (top.AvailableFixPacksStepFailed){
            	 logger.logMessage("AvailableFixPackStep failed");
				 this.AvailableWASFixesStepFunction();
				 return;
            }else if(this.runningInterval>this.maxInterval){
				logger.logMessage("Monitor step max timeout");
				this.close();
				return;
			}
            setTimeout(dojo.hitch(this, "callbackavailableFixPacks"), this.stepInterval);
},

AvailableWASFixesStepFunction: function(){
				this.callerReference.updateProgressBar('fixpack',50);
	
	          		var now = new Date().getTime();
            		top.availableWASFixesPacksOutputFile = installation.utils.InstallUtils.getPersistedTempFilename('availableWASFixes_'+now);
					
					var availableWASFixesStep = new installation.utils.UpdateAvailableFixesStep();
            			availableWASFixesStep.keyRingLocation=top.keyRingLocation;
            			availableWASFixesStep.logName=top.availableWASFixesPacksOutputFile;

					if(top.fixPackUpdates.targetWasIdVersion){
            			
            			logger.logMessage("Get WAS fixes based on Fix packs");
            			
            			availableWASFixesStep.id =top.fixPackUpdates.targetWasIdVersion;
						availableWASFixesStep.repository = top.fixPackUpdates.targetWasRepository;
						
            		}else{
					
						 logger.logMessage("Get WAS fixes based on base product level");
    					 var wasRepository = property('was.repository');
    					 if(top.installingOfferingInfo!= null 
        					&& top.installingOfferingInfo.wasOfferingVersion!=null 
        					&& top.installingOfferingInfo.wasOfferigId!=null)
						{
							availableWASFixesStep.id = top.installingOfferingInfo.wasOfferigId +'_'+top.installingOfferingInfo.wasOfferingVersion;
							logger.logMessage("I: Base WAS product id: "+availableWASFixesStep.id);
						}else{
							availableWASFixesStep.id = null;
							logger.logMessage("I: Base WAS product id: "+availableWASFixesStep.id);
						}
            			availableWASFixesStep.repository= wasRepository;

					}
					
					/* Get WAS ifixes from BPM live site 
					 * either based on WAS fix pack level from WAS live site
					 * or from shipped WAS level (base or fix pack)
					 */
					availableWASFixesStep.repository = availableWASFixesStep.repository + ',' +
	            	installation.utils.InstallUtils.getProductRepository();
										
					logger.logMessage("before execute function of AvailableWASFixesStep");
					this.executeStep(availableWASFixesStep);
					this.callbackavailableWASFixes();
},

callbackavailableWASFixes : function(){

			logger.logMessage("checking availableWASFixes step status"); 		
	
			if(top.AvailableWASFixesStep){
				logger.logMessage("availableWASFixes step succeed"); 	
				this.AvailableBPMFixesFunction();
				return;

            }else if (top.AvailableWASFixesStepFailed){
            	 logger.logMessage("availableWASFixes Step failed");
				 this.AvailableBPMFixesFunction();		
				 return;
            }else if(this.runningInterval>this.maxInterval){
				logger.logMessage("Monitor step max timeout");
				this.close();
				return;
			}
    	
            setTimeout(dojo.hitch(this, "callbackavailableWASFixes"), this.stepInterval);
},

AvailableBPMFixesFunction : function(){
	
	    			var	now = new Date().getTime();
            		top.availableBPMFixesPacksOutputFile = installation.utils.InstallUtils.getPersistedTempFilename('availableBPMFixes_'+now);
            		var availableBPMFixesStep = new installation.utils.UpdateAvailableFixesStep();
					availableBPMFixesStep.keyRingLocation= top.keyRingLocation;
    				availableBPMFixesStep.logName =top.availableBPMFixesPacksOutputFile;
					
					if(top.fixPackUpdates.targetInstIdVersion){
    		
            			logger.logMessage("Get BPM fixes based on Fix Pack level");
    					availableBPMFixesStep.id =top.fixPackUpdates.targetInstIdVersion;
    					availableBPMFixesStep.repository=top.fixPackUpdates.targetInstRepository;
            			
            			
            		}else{
            			
    					var productRepository = installation.utils.InstallUtils.getProductRepository();
    				
            		/*
        				if(productOffering==''){
        				will hit null when there no repository folder
        				top.AvailableBPMFixesStep = false;
						this.ApplicableFixesFunction();
					}*/
    					
            			
    					logger.logMessage("Get BPM fixes based on base product level");
            			if(top.installingOfferingInfo!= null 
        					&& top.installingOfferingInfo.instOfferingVersion!=null 
        					&& top.installingOfferingInfo.instOfferigId!=null)
						{
							availableBPMFixesStep.id = top.installingOfferingInfo.instOfferigId +'_'+top.installingOfferingInfo.instOfferingVersion;
							logger.logMessage("I: Base BPM product id: "+availableBPMFixesStep.id);
						}else{
							availableBPMFixesStep.id = null;
							logger.logMessage("I: Base BPM product id: "+availableBPMFixesStep.id);
						}	
            			availableBPMFixesStep.repository = productRepository;
         			
            		}
			         this.executeStep(availableBPMFixesStep);
					 this.callbackavailableBPMFixesFunction();

},

callbackavailableBPMFixesFunction: function(){
	
			logger.logMessage("checking availableBPMFixes step status"); 		
	
			if(top.AvailableBPMFixesStep){
				logger.logMessage("availableBPMFixes step succeed"); 	
				this.ApplicableFixesFunction();
				return;

            }else if (top.AvailableBPMFixesStepFailed){
            	 logger.logMessage("availableBPMFixes Step failed");
				 this.ApplicableFixesFunction();
				 return;
            }else if(this.runningInterval>this.maxInterval){
				logger.logMessage("Monitor step max timeout");
				this.close();
				return;
			}
    	
            setTimeout(dojo.hitch(this, "callbackavailableBPMFixesFunction"), this.stepInterval);
	
},

ApplicableFixesFunction : function(){

	          		logger.logMessage("value of top.AvailableBPMFixesStep"+top.AvailableBPMFixesStep);
            		logger.logMessage("value of top.AvailableWASFixesStep"+top.AvailableWASFixesStep);
            		
     				if(top.AvailableBPMFixesStep || top.AvailableWASFixesStep){ //paul check
            		
     	        	logger.logMessage("preparing to get applicable fixes");
     				
     	        	var applicableFixesStep =  new installation.utils.UpdateApplicableFixesStep();

     	        	logger.logMessage("applicableFixesStep initialised" +applicableFixesStep);
					applicableFixesStep.availableWASFixesPacksOutputFile=top.availableWASFixesPacksOutputFile+'.sysout';
            		applicableFixesStep.availableBPMFixesPacksOutputFile=top.availableBPMFixesPacksOutputFile+'.sysout';
            		
            		
            		logger.logMessage("applicableFixesStep.availableWASFixesPacksOutputFile "+applicableFixesStep.availableWASFixesPacksOutputFile);
            		logger.logMessage("applicableFixesStep.availableBPMFixesPacksOutputFile "+applicableFixesStep.availableBPMFixesPacksOutputFile);
            		
            		
            		this.executeStep(applicableFixesStep);
            		  		
            		logger.logMessage("applicableFixesStep complete");
					
					}
					this.callerReference.updateProgressBar('fix',100);
					this.close();
},
	
close:function(){
	//	top.closeDialog(top.loginDialogId); 
		this.callerReference.closeProgressBar();                 
		this.callerReference.goToNextPane();

},	

executeStep: function(step){
	//Run step
	logger.logMessage("Start of execute step");
	var response = step.execute();    
	
	// Monitor step for completion. 
	if(response) {
		logger.logMessage("do monitor step");
			this.runningInterval = 0;
			this.monitorStep(step); 
	 }
	 //if false command execution failed. Don't do monitor step
	logger.logMessage("end of execute step");
},

monitorStep: function(step){    
	//Check to see if the step is done.
	logger.logMessage("Start of monitor step");
	if (step.isDone()) { 
		logger.logMessage("isDone returned true");
		return;
	}
	else {
		//Infinite loop checker
		this.runningInterval =  this.runningInterval + this.stepInterval;
		logger.logMessage("Current running interval "+this.runningInterval);
		
		if(this.runningInterval>this.maxInterval){
			logger.logMessage("Monitor step max timeout");
			return;
		}
		logger.logMessage("Before monitor timeout call");
		setTimeout(dojo.hitch(this, "monitorStep" , step), this.stepInterval);
	}
},

isBlank: function (str) {
    return (!str || /^\s*$/.test(str));
},

otherSteps: function(){

logger.logMessage("I:Completed execution of UpdateKeyringStep");

	if(ds){ ///timebeing            
            if(top.keyRingStep){
            
            	logger.logMessage("UpdateKeyringStep sucess");
            		now = new Date().getTime();
            		
            		top.availableFixPacksOutputFile = installation.utils.InstallUtils.getPersistedTempFilename('availableFixPacks_'+now);
            		
            		var availableFixPacksStep = new installation.utils.UpdateAvailableFixPacksStep();
            		availableFixPacksStep.logName = top.availableFixPacksOutputFile;
            		availableFixPacksStep.keyRingLocation = top.keyRingLocation;
            		availableFixPacksStep.repositories = property('was.repository') + ',' +
            		installation.utils.InstallUtils.getProductRepository();
            		
            		this.executeStep(availableFixPacksStep);
            		logger.logMessage("Completed execution of availableFixPacksStep");
            		
            		if(top.AvailableFixPacksStep){
            			
            			logger.logMessage("availableFixPacksStep success");
            			var applicableFixPacksStep = new installation.utils.UpdateApplicableFixPacksStep();
            			applicableFixPacksStep.availableFixPacksOutputFile = top.availableFixPacksOutputFile+'.sysout';
            			this.executeStep(applicableFixPacksStep);
            			
            			logger.logMessage("Completed execution of applicableFixPacks");
            		}
            		
            		//WAS
            		now = new Date().getTime();
            		top.availableWASFixesPacksOutputFile = installation.utils.InstallUtils.getPersistedTempFilename('availableWASFixes_'+now);
            		if(top.fixPackUpdates.targetWasIdVersion){
            			
            			logger.logMessage("Get WAS fixes based on Fix packs");
            		
            			var availableWASFixesStep = new installation.utils.UpdateAvailableFixesStep();
            			
            			
            			availableWASFixesStep.keyRingLocation = top.keyRingLocation;
            			availableWASFixesStep.logName= top.availableWASFixesPacksOutputFile;
            			availableWASFixesStep.id =top.fixPackUpdates.targetWasIdVersion;
            			availableWASFixesStep.repository = top.fixPackUpdates.targetWasRepository;

            			this.executeStep(availableWASFixesStep);
            			logger.logMessage("availiableWASFixesStep complete");
            			
            		
            		}else{
            			
            			logger.logMessage("Get WAS fixes based on base product level");
    					 var wasOfferingId = property('wasOfferingId'); // MOST IMPORTANT TODO
    					 var wasOfferingVersion = property('wasOfferingVersion');
    					 var wasRepository = property('was.repository');
    				
            			var availableWASFixesStep = new installation.utils.UpdateAvailableFixesStep();
            			
            			availableWASFixesStep.keyRingLocation=top.keyRingLocation;
            			availableWASFixesStep.logName=top.availableWASFixesPacksOutputFile;
            			availableWASFixesStep.id = wasOfferingId + '_' + wasOfferingVersion;
            			availableWASFixesStep.repository= wasRepository;
            			
            			this.executeStep(availableWASFixesStep);
            			
            			logger.logMessage("availiableWASFixesStep complete");
            		}
            		
            		//BPM
    				now = new Date().getTime();
            		top.availableBPMFixesPacksOutputFile = installation.utils.InstallUtils.getPersistedTempFilename('availableBPMFixes_'+now);
            		if(top.fixPackUpdates.targetInstIdVersion){
    		
            			logger.logMessage("Get BPM fixes based on Fix Pack level");
            			
    					var availableBPMFixesStep = new installation.utils.UpdateAvailableFixesStep();
    					
    					availableBPMFixesStep.keyRingLocation= top.keyRingLocation;
    					availableBPMFixesStep.logName =top.availableBPMFixesPacksOutputFile;
    					availableBPMFixesStep.id =top.fixPackUpdates.targetInstIdVersion;
    					availableBPMFixesStep.repository=top.fixPackUpdates.targetInstRepository;
    					
            			this.executeStep(availableBPMFixesStep);
            			
            			logger.logMessage("availiableBPMFixesStep complete");
            			
            		}else{
            			
    					var productRepository = installation.utils.InstallUtils.getProductRepository();
    					var productOffering = installation.utils.InstallUtils.getProductOffering();
            		
    					logger.logMessage("Get BPM fixes based on base product level");
    					
            			var availableBPMFixesStep = new installation.utils.UpdateAvailableFixesStep();
            			
            			availableBPMFixesStep.keyRingLocation = this.keyRingLocation;
            			availableBPMFixesStep.logName = top.availableBPMFixesPacksOutputFile;
            			availableBPMFixesStep.id = productOffering;
            			availableBPMFixesStep.repository = productRepository;
            			
            			
            			this.executeStep(availableBPMFixesStep);
            			
            			logger.logMessage("availiableBPMFixesStep complete");
            		}
            		
            		logger.logMessage("value of top.AvailableBPMFixesStep"+top.AvailableBPMFixesStep);
            		logger.logMessage("value of top.AvailableWASFixesStep"+top.AvailableWASFixesStep);
            		
     				if(top.AvailableBPMFixesStep || top.AvailableWASFixesStep){ //paul check
            		
     	        	logger.logMessage("preparing to get applicable fixes");
     				
     	        	var applicableFixesStep =  new installation.utils.UpdateApplicableFixesStep();

     	        	logger.logMessage("applicableFixesStep initialised" +applicableFixesStep);

     	        	
            		applicableFixesStep.availableWASFixesPacksOutputFile=top.availableWASFixesPacksOutputFile+'.sysout';
            		applicableFixesStep.availableBPMFixesPacksOutputFile=top.availableBPMFixesPacksOutputFile+'.sysout';
            		
            		
            		logger.logMessage("applicableFixesStep.availableWASFixesPacksOutputFile "+applicableFixesStep.availableWASFixesPacksOutputFile);
            		logger.logMessage("applicableFixesStep.availableBPMFixesPacksOutputFile "+applicableFixesStep.availableBPMFixesPacksOutputFile);
            		
            		
            		this.executeStep(applicableFixesStep);
            		  		
            		logger.logMessage("applicableFixesStep complete");

     				}
            
     		logger.logMessage("after all steps"); 		
     		top.closeDialog(top.loginDialogId);                   
            logger.logMessage("end of steps"); 		
            this.callerReference.goToNextPane();//TODO
            
            }else{
            	 logger.logMessage("Keyring Step failed");
            	 /**SET ERROR MESSAGES that will be displayed on dialog box***/
            	 
            	 this.showLoginDialogBox();
            }
    	
    		
    	
	
	}else{
		
		logger.logMessage("User entered null username and password");
		this.showLoginDialogBox();
		
	}
	

}	


	
});