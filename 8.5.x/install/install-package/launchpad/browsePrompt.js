// Licensed Materials - Property of IBM
// 5648-F10 (C) Copyright International Business Machines Corp. 2005, 2006, 2014
// All Rights Reserved
// US Government Users Restricted Rights - Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.


// may want to consider adding a new preference to startup: dom.disable_window_open_feature.status=false
// useful modal sleep routine
function sleep( milliseconds ) {
    if (milliseconds <= 0) return true;
    var timeToExit = (new Date()).getTime() + milliseconds;
    try {
        var nsIThread = Components.classes["@mozilla.org/thread;1"].getService(Components.interfaces.nsIThread);
        var currentTime = (new Date()).getTime();
        var timeout = timeToExit - currentTime;
        if (timeout <= 0) return true;
        if (timeout > milliseconds) timeout = milliseconds;
        nsIThread.currentThread.sleep(timeout);
        return true;
    }
    catch(e) {
        try {
            window.showModalDialog("javascript:document.writeln('<script>currentTime=(new Date()).getTime();if (currentTime>="+timeToExit+")window.close();else { if (currentTime<"+(timeToExit-milliseconds)+")timeout="+milliseconds+";else timeout="+timeToExit+"-currentTime;window.setTimeout( \"window.close()\",timeout);}<\/script>')");
	    return true;
        }
        catch(e2) { 
            return false; }
    }
}


window._modalPrompt_ = new Array();

// example of how we could handle a bunch of other events if needed by the user
function modalPromptEvent_onunload(e) {
    if (window._modalPrompt_['ONUNLOAD'] != null) {
	try {
	    return window._modalPrompt_['ONUNLOAD'](e);
	}
	catch(e) {}
	window._modalPrompt_['ONUNLOAD'] = null;
	window.focus();
	return true;
    }
}

function modalPromptEvent_onload(e) {
    if (window._modalPrompt_['ONLOAD'] != null) {
	try {
	    return window._modalPrompt_['ONLOAD'](e);
	}
	catch(e) {}
	window._modalPrompt_['ONLOAD'] = null;
	return true;
    }
}


function isDirOK(win,val) {
    return true;  // this should validate the directory that was chosen
}


// popup modal dialog to browse for a directory
function browseForFolder(directions) {

	top.logCLPEnter("browseForFolder", arguments);

    var result = null;
    try {
	var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var dialog = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	dialog.init(window, directions, nsIFilePicker.modeGetFolder);

	// start off with the home directory
	var initialDir = Components.classes["@mozilla.org/file/directory_service;1"]
                     .getService(Components.interfaces.nsIProperties)
                     .get("Home", Components.interfaces.nsIFile);
	// get the root directory of home
	try {
	while (typeof initialDir.parent != 'undefined' && initialDir.parent != null && initialDir.parent.path != initialDir.path)
	    initialDir = initialDir.parent;
	} catch(e) {}
	dialog.displayDirectory = initialDir;
	if (dialog.show() == nsIFilePicker.returnOK) {
	    result = dialog.file.path;
	}
    } catch(e) {
        try {
	    var shell = new ActiveXObject("Shell.Application");
            var folder = shell.BrowseForFolder(0, directions, 1+0x10+0x1000, 0x11);
	    var folderItem = folder.Items().item();
	    result = folderItem.Path;
        } catch(e) {
			try {
				result = Launchpad.browse(directions)[0];
        	} catch(e) {}
        }
     }
    top.logCLPExit("browseForFolder", arguments);
	return result;

	
	}


function isIE()
{
    return top.BROWSER == "IExplore";    
}
  
  

/*	simpleBrowseDialog(options)
 *		Displays dialog which requests that you browse to a file or folder based on parameters
 *
 *		Styling is minimal but is hardcoded. Future iteration should remove hardcoded styles and
 *		use stylesheet.
 *
 *	Use Example:
 *		//Following will display browse dialog for a folder, alerting user when folder is picked.
 *		top.simpleBrowseDialog({ callback: function(x){ alert('My returned path is: '+x); } });
 * 
 *		//Following will display browse dialog for a file, alerting user when file is picked.
 *		top.simpleBrowseDialog({ browseFor: 'file', callback: function(x){ alert('My returned path is: '+x); } });
 *
 *
 *	Options: {
 *				*Optional* browseFor: file || folder,		//Default - folder
 *				*Optional* id: String,			//Default - generatedBrowseDialog<#1-1000>
 *				*Optional* title: String,		//Default - property browseDialogDirectoriesTitle || property browseDialogFilesTitle
 *				*Optional* dialogText,			//Default - property browseFoldersPromptText || property browseFilesPromptText
 *				*Optional* defaultLocation: String || Function,		//Default - top.STARTINGDIR 
 *							*Note*: defaultLocation cannot be set when (browseFor != 'folder')!
 *				*Optional* validationFunction: Function,				// Default - return true	Ex: function(returnPath){ if(returnPath.length>0) return true; else return false; }
 *				callback: Function				//Ex: function(returnPath){ alert(returnPath); }
 *			}
 *
 *	return undefined
 */ 
function simpleBrowseDialog(options){

	top.logCLPEnter("simpleBrowseDialog", arguments);

    var myDoc ;
    if (top.IS_XUL) {
       myDoc = top.get_clp_root_doc();
    } else {
       myDoc = document;
    } 

				var callback = (options&&options.callback)?options.callback: function(rc){ top.logWarning('Callback not used'); };
				var id = (options&&options.id)?options.id: top.generateId("generatedBrowseDialog");
				var browseFor = (options&&options.browseFor)?options.browseFor: 'folder';
				var title = (options&&options.title)?options.title: (browseFor=='folder')?top.property('browseFoldersPromptTitle'):top.property('browseFilesPromptTitle');
				var defaultLocation = (options&&options.defaultLocation)?options.defaultLocation:top.STARTINGDIR;
				var dialogText = (options&&options.dialogText)?options.dialogText:(browseFor=='folder')?(property('browseFoldersPromptText')!='undefined')?property('browseFoldersPromptText'):'':(property('browseFilesPromptText')!='undefined')?property('browseFilesPromptText'):'';
				var validationFunction = (!options||(options&&!options.validationFunction))? function(path){ if(path!=''&&path.length>1)return true; else return false; }: (typeof options.validationFunction == "function")?options.validationFunction:new Function(id+"validationFx" ,options.validationFunction);
				
				
			
				var containingDiv = myDoc.createElement('div'); 
				
					var text = myDoc.createElement('div');
					text.innerHTML = dialogText;
					containingDiv.appendChild(text);
					var div = myDoc.createElement('div');
					div.style.textAlign="center";
					div.style.padding="3px";
				if(browseFor=='folder'){
					var textbox = myDoc.createElement('input');
					textbox.type="text";
					textbox.id = id+"InputTextbox";
					textbox.value = defaultLocation;
					textbox.style.width ="320px";
					var browseButton = myDoc.createElement('input');
					browseButton.type="button";
					browseButton.id = id+"InputBrowseButton";
					browseButton.name = browseButton.id;
					browseButton.value = property('promptBrowse');
					div.appendChild(textbox);
					div.appendChild(browseButton);		
					browseButton.onclick = function(){
						var tempdir = browseForFolder();
						if (tempdir && tempdir != 'null')
						  textbox.value = tempdir;
					};		
				}else{
					var input = myDoc.createElement('input');
					input.id = id+"InputTextbox";
					input.name = input.id;
					input.type = "file";
					input.value = defaultLocation;
					input.style.width ="400px";
					div.appendChild(input);
				}
					containingDiv.appendChild(div);
			
				    var options = { id: id, width: "500px", title: title,
							buttons: [
									{
										id: id+"CancelButton",
										name: id+"CancelButton",
										value: property('promptCancel'),
										onclick: function(){ top.closeDialog(id);	
												callback(undefined); 
										},
										enabled: true
									},
									{
										id: id+"OKButton",
										name: id+"OKButton",
										value: property('promptOK'),
										onclick: function(){ 
												var returnVal =  myDoc.getElementById(id+"InputTextbox").value;
												if(validationFunction(returnVal)){
													top.closeDialog(id);
													callback(returnVal); 
												}
										},
										enabled: true
									}
								]};
	    
	    top.showDialog(containingDiv, options);

	top.logCLPExit("simpleBrowseDialog", arguments);
}    
