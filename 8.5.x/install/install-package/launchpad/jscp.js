// Licensed Materials - Property of IBM
// 5648-F10 (C) Copyright International Business Machines Corp. 2005, 2010, 2014
// All Rights Reserved
// US Government Users Restricted Rights - Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

//do not allow draging, it hangs the launchpad in the Internet Explorer.
document.ondragstart = function() { return false; }; 
	
var defaultIndex = "default";
var engineTop;
if (typeof window.opener == "undefined" || window.opener == null)
    engineTop = top;
else
    engineTop = window.opener.top;

var securityCheck = new Function('return window');

var openWindows = new Array();

// log unknown syntax errors
if (typeof window.onerror == "undefined")
    window.onerror = function (msg,fn,line) {
        engineTop.logMessage("LPV20011E", msg, fn, line);
        return true;
    }

// Following are Convenience functions for working in both a browser and Java launchpad environment
function browserEval(script)
{ 
  return eval(script); 
}
function javaEval(script)
{ 
  return null; 
}
function launchpadEval(scriptForBrowser, scriptForJava)
{ 
  if(typeof scriptForBrowser == 'string')
  { 
    return eval(scriptForBrowser); 
  }
  else
  { 
    return scriptForBrowser;
  } 
}
function javaString(text)
{ 
  return ''; 
}
function browserString(text)
{ 
  return text; 
}
function launchpadString(textForBrowser, textForJava)
{ 
  return textForBrowser; 
}
//<ACGC_Bidi> start
function bidiString(rtl, ltr)
{ 
  if(top.isBidiLocale())
  {
    return rtl;
  }
  return ltr; 
}
//<ACGC_Bidi> end

function property(varName,defaultValue) {
    return engineTop.findProperty(varName, self, defaultValue);
}

//Sets a property to a specified value
//varName - the name of the property
//value - the new value of the property
function setProperty(varName, value)
{
    return engineTop.assignProperty(varName, self, value);
}

FOREGROUND = true;
BACKGROUND = false;
VISIBLE = false;
HIDDEN = true;
ASCII = "ASCII";
UTF8 = "UTF-8";
// executes an arbitrary command
// diskID: string - ID that gets mapped to the current full directory path for relative names
// args: [strings] - command and parameters
// foreGroundValue: boolean - FOREGROUND or BACKGROUND
// isHidden: boolean - VISIBLE or HIDDEN
// element: document element - element to disable while running
// workingDirectory: The directory to be used as the working dir.  If not specified, launchpad temp is used
// callback: Use with the BACKGROUND parameter to call a function when the program returns. The function receives the return code as an argument. 
// timeout: Use with the callback parameter to set the time, in milliseconds, between checks to see if the program has returned.
// noQuotes: specify true if the function should not add quotes around the args
// returns: integer - exit code if foreground or process status if background
LAUNCHPAD_DISKID = null;
NO_DISKID = engineTop.UNDEFINED;
function runProgram(diskID,args,foreGroundValue,isHidden,element,workingDirectory,callback,timeout,noQuotes, showWarningDialogs) {
	top.logCLPEnter("runProgram", arguments);
    var disk = top.IS_XUL ? engineTop.getExternalTopDir() : engineTop.getDiskMapping(diskID);
    if ((disk == null) && (typeof diskID != "undefined"))
	{	
		top.logCLPExit("runProgram", arguments);
		return -1;
	}
	else if (!args || args.length == 0)
	{
		top.logMessage('LPV32115W');
		if (showWarningDialogs)
			top.showDialog(property('unsupportedPlatformText'), { id: 'unsupportedPlatformDialog', title: property('unsupportedPlatformTitle'), buttons: [{ id: 'okButton', value: property('promptOK'), onclick: "top.showDialog('unsupportedPlatformDialog', false);" } ] });
		return null;
	}
	top.logCLPExit("runProgram", arguments);
    return engineTop.secureRunProgram(securityCheck, disk, args, foreGroundValue, isHidden, element, workingDirectory, callback, timeout, noQuotes);
}

// popup an HTML page to view
// diskID: string - ID that gets mapped to the current full directory path for relative names
// name: string - messy URL spec to display
// element: document element - disable briefly while viewing for feedback
function viewPage(diskID,name,element) {
    return viewPageImpl(diskID, '',name, element);       
}

// popup an HTML page to view
// diskID: string - ID that gets mapped to the current full directory path for relative names
// windowName: string - Name of window to open.  If window of same name already exists, it is re-used.
// name: string - messy URL spec to display
// element: document element - disable briefly while viewing for feedback
function viewNamedPage(diskID,windowName,name,element) {
	if ( !!getEnv('LaunchPadViewNamedPage') ) {
		var oldViewerPath = top.VIEWERPATH;
		top.VIEWERPATH="";
		var returnVal = viewPageImpl(diskID,windowName,name,element);
		top.VIEWERPATH = oldViewerPath;    
		return returnVal;
	} else {
		engineTop.logMessage('LPV31043W', 'function viewNamedPage', 'function viewPage');
		viewPageImpl(diskID, '',name, element); 
	}
}

// popup an HTML page to view
// diskID: string - ID that gets mapped to the current full directory path for relative names
// windowName: string - Name of window to open.  If window of same name already exists, it is re-used.
// name: string - messy URL spec to display
// element: document element - disable briefly while viewing for feedback
function viewPageImpl(diskID,windowName,name,element) {
    var disk = top.IS_XUL ? engineTop.getExternalTopDir() : engineTop.getDiskMapping(diskID);
    if ((disk == null) && (typeof diskID != "undefined")) return false;
    var win = null;
    if (typeof top.VIEWERPATH != "string" || top.VIEWERPATH == '') {
        //The window is already open... unless it's been closed
        if (windowName != '' && typeof openWindows[windowName] != "undefined" && openWindows[windowName] != null) {
            win = openWindows[windowName]; 
            try
            {
                //this is the code path for firefox and mozilla.  IE will crash on the win.closed line and
                //go to the catch.
                if (win.closed) {
                    win = window.open('about:blank',windowName,'resizable,toolbar,status,menubar,personalbar,location,directories,titlebar,close,scrollbars');
                    openWindows[windowName] = win;
                }
            }
            catch(e)
            {
                //this is really stupid, but IE crashes if win.closed is called after the window has
                //been closed.  Mozilla/firefox work fine.  onunload events don't seem to work either.
                win = window.open('about:blank',windowName,'resizable,toolbar,status,menubar,personalbar,location,directories,titlebar,close,scrollbars');
                openWindows[windowName] = win;
            }            
        } else {  //the window is not already open or it's not a named window
            if(top.OSTYPE != "windows" || windowName != '')
            	win = window.open('about:blank',windowName,'resizable,toolbar,status,menubar,personalbar,location,directories,titlebar,close,scrollbars');

            if (windowName != '') {
                openWindows[windowName] = win;
            }
        }        
    }
    return engineTop.secureViewPage(securityCheck, win, disk, name, element);
}


// see if a messy-named file exists
// diskID: string - ID that gets mapped to the current full directory path for relative names
// name: string - messy file name
// returns string - full native file if it exists
//         null - if not exists
function clientFileExists(diskID,name) {
    return engineTop.secureClientFileExists(securityCheck, engineTop.getDiskMapping(diskID), name);
}

//Determines if a directory exists
// diskID: string - ID that gets mapped to the current full directory path for relative names
// fileName: string - full native directory name
// returns: boolean
function directoryExists(diskID, directory) {

    var topDir = engineTop.getDiskMapping(diskID);
    var fullDirectory = top.getFullFileName(topDir,directory);    

    return engineTop.secureDirectoryExists(securityCheck, top.getNativeFileName(fullDirectory));
}

// search for a file
// diskID: string - ID that gets mapped to the current full directory path for relative names
// name: string - relative path to find
// returns string - full native file name if found
//         undefined/null if not found
// search order:
//      content/locale
//      content/fallback locale
//      content
//      skin/locale
//      skin/fallback locale
//      skin
//      launchpad/locale
//      launchpad/fallback locale
//      launchpad
function findFile(diskID,name) {
    var fallBackLocale = property('fallBackLocale','en');
    return engineTop.secureFindFile(securityCheck, engineTop.getDiskMapping(diskID), name, fallBackLocale, self);
}

// diskID: string - ID that gets mapped to the current full directory path for relative names
function findURL(diskID,name) {
    var i = name.indexOf('?');
    var fullFileName = findFile(diskID, (i > 0) ? name.substring(0,i) : name);
    return top.nativeFileToURL(fullFileName+((i > 0) ? name.substring(i) : ''));
}

//Searches a list of paths for a file with a give disk ID
//
//sample usage
//  var pathList = new Array();
//  pathList.push(startingDir + top.LOCALE);
//  pathList.push(startingDir + fallBackLocale);
//  return findFileInPaths(pathList, 'foo.txt');
//
// pathList - a list of paths to be searched
// name - the file to search for
function findFileInPaths(diskID, pathList, name) {
    var file = null;
    if ((typeof pathList == "object") && (pathList.length > 0)) {
        var startingDir = top.IS_XUL ? engineTop.getExternalTopDir() : engineTop.getDiskMapping(diskID);
        if ( (startingDir == null) || (startingDir.length == 0))
            startingDir = '';
        for (var i in pathList) {
            var fullPath = top.getFullFileName(startingDir, pathList[i]+'/'+name);
            if (top.secureFileExists(securityCheck, fullPath)) {
                file = fullPath;
                break;
            }
        }
    }
    return file;
}

// This function allows the content writer to search for files of the form
// fileName_xx.extension where xx is a locale code.  This is a different
// translated file naming convention than what the launchpad uses internally.
// Sometimes, files must conform to external naming conventions that do not
// match the launchpads conventions.  
// 
// Usage: findTranslatedFileInDirectory(NO_DISKID, top.STARTINGDIR + '/info/, 'readme_xx.html');
// diskId - the launchpad disk id
// directory - directory where the file is located
// templateFileName - a template for the file name.  This function will replace _xx with _<locale>
// and return the path to that file.  If the file for the current locale cannot be found, this function
// will try the fallBackLocale.  If that cannot be found, it will return null
function findTranslatedFileInDirectory(diskID, directory, templateFileName)
{
  var file = null;
  var startingDir = engineTop.getDiskMapping(diskID);
  if ( (startingDir == null) || (startingDir.length == 0))
  {
      startingDir = directory;
  }
  else
  {
    startingDir += "/" + directory;
  }

  file = top.getFullFileName(startingDir, templateFileName);
  file = file.replace("_xx", "_" + top.LOCALE);
  if (!top.secureFileExists(securityCheck, file)) {
    file = top.getFullFileName(startingDir, templateFileName);
    file = file.replace("_xx", "_" + property('fallBackLocale'));
    if (!top.secureFileExists(securityCheck, file)) {   
      file = null;
      engineTop.logMessage('LPV22040W', top.getFullFileName(startingDir, templateFileName));
    }    
  }
  return file;
  
}

// get and format a platform dependent command to execute
// commandID: string - property name of array of platform dependent command templates
// arguments: [strings] - optional substitution parameters
function command(commandID) {   
    return engineTop.getCommand(property(commandID,null), arguments);
}
// Generic utility to best match the operating system
// commandDataArray: [strings] - array of platform dependent command templates
function getBestOSMatch(labelArray)
{
    var retVal = null;

    var osArchCombinations = new Array();
    osArchCombinations[0] = top.OS + "/" + top.ARCHITECTURE + "->" + top.TARGETOS + "/" + top.TARGETARCHITECTURE;
    osArchCombinations[1] = top.OS + "/" + top.ARCHITECTURE + "->" + top.TARGETOS;
    osArchCombinations[2] = top.OS + "/" + top.ARCHITECTURE + "->" + top.TARGETOSTYPE + "/" + top.TARGETARCHITECTURE;
    osArchCombinations[3] = top.OS + "/" + top.ARCHITECTURE + "->" + top.TARGETOSTYPE;
    osArchCombinations[4] = top.OS + "->" + top.TARGETOS + "/" + top.TARGETARCHITECTURE;
    osArchCombinations[5] = top.OS + "->" + top.TARGETOS;
    osArchCombinations[6] = top.OS + "->" + top.TARGETOSTYPE + "/" + top.TARGETARCHITECTURE;
    osArchCombinations[7] = top.OS + "->" + top.TARGETOSTYPE;
    osArchCombinations[8] = top.OSTYPE + "/" + top.ARCHITECTURE + "->" + top.TARGETOS + "/" + top.TARGETARCHITECTURE;
    osArchCombinations[9] = top.OSTYPE + "/" + top.ARCHITECTURE + "->" + top.TARGETOS;
    osArchCombinations[10] = top.OSTYPE + "/" + top.ARCHITECTURE + "->" + top.TARGETOSTYPE + "/" + top.TARGETARCHITECTURE; 
    osArchCombinations[11] = top.OSTYPE + "/" + top.ARCHITECTURE + "->" + top.TARGETOSTYPE; 
    osArchCombinations[12] = top.OSTYPE + "->" + top.TARGETOS + "/" + top.TARGETARCHITECTURE; 
    osArchCombinations[13] = top.OSTYPE + "->" + top.TARGETOS; 
    osArchCombinations[14] = top.OSTYPE + "->" + top.TARGETOSTYPE + "/" + top.TARGETARCHITECTURE; 
    osArchCombinations[15] = top.OSTYPE + "->" + top.TARGETOSTYPE; 
    osArchCombinations[16] = top.OS + "/" + top.ARCHITECTURE; 
    osArchCombinations[18] = top.OS;
    osArchCombinations[17] = top.OSTYPE + "/" + top.ARCHITECTURE;
    osArchCombinations[19] = top.OSTYPE;
    osArchCombinations[20] = defaultIndex;

    for (var i = 0; i < osArchCombinations.length; i++ ) {      
      if (labelArray[osArchCombinations[i]])
      {
        retVal = labelArray[osArchCombinations[i]];
        break;
      }      
    }

    //If we get through all of the combinations and don't have a match, just return the array
    if (typeof retVal == "undefined" || retVal == null) {
        try {
            retVal = labelArray;
        } catch(e) {}
    }
    return retVal;
}

// gets the value of an environment variable
// name: string - name of variable
// returns: string - value of variable
//          undefined - variable is not defined
function getEnv(name) {
    return engineTop.secureGetEnv(securityCheck, name);
}

// sets the value of an environment variable
// name: string - name of variable
// value: string - new value of variable
// returns: boolean - success status
function setEnv(name,value) {
    return engineTop.secureSetEnv(securityCheck, name, value);
}




function addTooltip(content, element, options)
{
	top.logCLPEnter("addTooltip", arguments);
	options = options || {};
	var defaultOptions = {
		id: 'tooltip' + Math.round(Math.random() * 1000000000),
		trigger: 'hover',
		document: document
	};
	options = top.launchpad.extend(options, defaultOptions);

	if (options.trigger === 'hover') {
	
		var helpHovered = false;
		
		function onTooltipEnter(e) {
		
			helpHovered = true;
		}
		
		function onTooltipLeave(e) {
		
			helpHovered = false;
			
			setTimeout(function() {
			
				if (!helpHovered) {
				
					top.launchpad.get(options.id, options.document).hide();
				}
				
			}, 500);
		}

		var elementHovered = false;

		function onEnter(e) {
		
			elementHovered = true;
			
			setTimeout(function () {
			
				if (elementHovered) {
				
					if (!top.launchpad.get(options.id, options.document)) {
					
						top.launchpad.get(options.document.body).append(
							'<div id="' + options.id + '" class="tooltip">' + 
								'<div class="tooltipContent">' + content + '</div>' + 
							'</div>'
						);
						top.launchpad.get(options.id, options.document).hover(onTooltipEnter, onTooltipLeave);
					}
					
					var coords = (options.document.parentWindow || options.document.defaultView).coordinates();
					var x = coords.x + 5 + 'px';
					var y = coords.y + 5 + 'px';
					
					top.launchpad.get(options.id, options.document).style('left', x).style('top', y).show();
				}
				
			}, 1250);
		}
		
		function onLeave(e) {
		
			elementHovered = false;
			
			setTimeout(function() {
			
				if (!helpHovered) {
				
					var tooltip = top.launchpad.get(options.id, options.document);
					if (tooltip) {
						tooltip.hide();
					}
				}
				
			}, 500);
		}
		
		top.launchpad.get(element, options.document).hover(onEnter, onLeave);
		
	} else if (options.trigger === 'click') {
		
		function onClick(e) {
		
			if (!top.launchpad.get(options.id, options.document)) {
			
				top.launchpad.get(options.document.body).append(
					'<div id="' + options.id + '" class="tooltip">' + 
						'<div class="close"><a href="javascript:void 0" onclick="top.launchpad.get(\'' + options.id + '\', document).remove(); return false"><img border="0" src="' + findURL(null, 'close.gif') + '" title="' + property('closeDialog') + '"></a></div>' + 
						'<div class="tooltipContent">' + content + '</div>' + 
					'</div>'
				);

			}
			
			var coords = (options.document.parentWindow || options.document.defaultView).coordinates();
			var x = coords.x + 5 + 'px';
			var y = coords.y + 5 + 'px';
			
			top.launchpad.get(options.id, options.document).style('left', x).style('top', y).show();
		}
		
		top.launchpad.get(element, options.document).click(onClick);
	}
	top.logCLPExit("addTooltip", arguments);
}

/**
 Tracks the coordinates of the mouse for the jscp window.  Example usage:
 var coords = coordinates();
 var x = coords.x;
 var y = coords.y;
 */
coordinates = (function () {

		var coords = { x: 0, y: 0 };
		var doc = document;
		
		// FIXME: Need to update this after creating document ready function in order to eliminate race condition
		setTimeout(function(){ 
			top.launchpad.get(doc.body).mousemove( function(e) { 
				coords.x = e.pageX ? e.pageX : e.clientX + doc.body.scrollLeft;
				coords.y = e.pageY ? e.pageY : e.clientY + doc.body.scrollTop;
			});
		}, 1000);
		
		return function (e) {
		
			if (!e) return coords;
			
			var pageX = e.pageX ? e.pageX : e.clientX + doc.body.scrollLeft;
			var pageY = e.pageY ? e.pageY : e.clientY + doc.body.scrollTop;
			
			return { x: pageX, y: pageY, current: coords };
		}
})();
	
// exits launchpad
// showPrompt: boolean - Determines if an "Are you sure you want to exit" dialog will be shown
// returns void
function Exit(showPrompt) {
  top.logCLPEnter("Exit", arguments);

    if (typeof showPrompt == "boolean" && showPrompt == true) {
	    top.exitDialogId ="exitPromptDialog";
        var content = "<div>"+property('exitPrompt')+"</div>";
		showDialog(content, {
			id: top.exitDialogId,
			title: top.evalJSCP(property('exitPromptTitle', property('title'))),
			buttons: [
				{
					id: "exitPromptConfirmationButton",
					name: "exitPromptConfirmationButton",
					value: property('exitPromptOK'),
					onclick: function(){ engineTop.secureExit(securityCheck); }
				},
				{
					id: "exitPromptCancelButton",
					name: "exitPromptCancelButton",
					value: property('exitPromptCancel'),
					onclick: function(){ top.closeDialog(top.exitDialogId); }
				}
			],
			width: "350px"
		});
		return;
    }
	top.logCLPExit("Exit", arguments);
    return engineTop.secureExit(securityCheck);
}

// repaint the current HTML doc
// returns void
function refreshPage() {
    return document.location.reload(false);
}

// read and inline a CSS file
// fileName: string - fully qualified native file name
// returns void
function loadCSSfile(fileName) {
  top.logCLPEnter("loadCSSfile", arguments);
    document.writeln('<STYLE>');
    var lines = engineTop.secureReadTextFile(securityCheck, fileName);
    if (lines && lines.length > 0) {
        var v = lines.join("\n");
        if (typeof v == "string" && v != null && v.length > 0) {
            parseJSCP(v,true);
        }
    }
    document.writeln('</STYLE>');
	top.logCLPExit("loadCSSfile", arguments);
}

DEFAULTCSS = '_DEFAULTCSS_';
// find and inline CSS files
// optional string - DEFAULTCSS represents the default css files: global.css and <document name>.css
// optional list of filenames: strings
// returns void
// search order:
//    1 or more of:
//	skin
//	skin/locale
//	skin/fallback locale
//	content
//	content/locale
//	content/fallback locale
function loadCSSfiles() {
    var css;
    if (arguments.length == 0)
        loadCSSfiles(engineTop.GLOBALCSS,document.baseName+".css");
    else {
        var fallBackLocale = property('fallBackLocale','en');
		var files = top.getSearchDirs(engineTop.STARTINGDIR);
        for (var i=0; i < arguments.length; i++) {
            if (typeof arguments[i] == "undefined" || arguments[i] == null) {
            } else if (arguments[i] == DEFAULTCSS) {
                loadCSSfiles(engineTop.GLOBALCSS,document.baseName+".css");
            } else {
				var f;
				for (j in files)
				{
					if ((f=top.secureClientFileExists(securityCheck, files[j], arguments[i])) != null)
					{
						loadCSSfile(f);
					}
					
				}
            }
        }
    }
}

/*
function call() {
    var fcn;
    var v;
    var p = self;
    do {
        try { eval("fcn = p."+arguments[0]); } catch(e) {}
        if (typeof fcn != "undefined") {
        var exec_cmd="v = fcn(";
        for (var i=1; i < arguments.length-1; i++) exec_cmd += "arguments["+i+"],";
        if (arguments.length > 1)
        exec_cmd += "arguments["+(arguments.length-1)+"]";
        exec_cmd += ")";
        eval(exec_cmd);
        return v;
        }
        if (p.parent == p) p = null;
        else
        p = p.parent;
    } while (p != null);
    return v;
}
*/

// find and inline the file 
// fileName: string - messy relative file name
// search order:  ( defined in getBaseJSCPSearchDirs() or  getLocaleJSCPSearchDirs() )
//    1 or 0 of:
//  extensions dir
//	content
//	skin
//	launchpad
//    1 or 0 of:
//  extensions dir/locale
//  extensions dir/fallback locale
//	content/locale
//	content/fallback locale
//	skin/locale
//	skin/fallback locale
//	launchpad/locale
//	launchpad/fallback locale
function includeJSCP(fileName) {
    try {
        var fallBackLocale = property('fallBackLocale','en');
        var lines = new Array();
        var f;
        var localelines;

        //Read the locale independent file first
		var files = top.getBaseJSCPSearchDirs(engineTop.STARTINGDIR);
		for (i in files)
		{
			if ((f=top.secureClientFileExists(securityCheck, files[i], fileName)) != null)
			{
				localelines = engineTop.secureReadTextFile(securityCheck, f);
				lines = lines.concat(localelines);
				break;
			}
		}

        //Then try to read the locale specific file
		
		files = top.getLocaleJSCPSearchDirs(engineTop.STARTINGDIR);
		for (i in files)
		{
			if ((f=top.secureClientFileExists(securityCheck, files[i], fileName)) != null)
			{
				localelines = engineTop.secureReadTextFile(securityCheck, f);
				lines = lines.concat(localelines);
				break;
			}
		}

        var isFileEmpty = false;
        try
        {   //if lines.length is undefined, the next check will fail.  This happens
            //when you import a file that is empty.
            var x = lines.length;
        }
        catch(e)
        {
            isFileEmpty = true;
        }

        if (!isFileEmpty && lines.length > 0) {
            var v = lines.join("\n");
            if (typeof v == "string" && v != null && v.length > 0) {
                parseJSCP(v,false);
            }
        }
    }
    catch(e) { alert('include exception ' + e.message);}
}

// 
// doc write and log substitution parse errors
//   badEvalString : Escaped substitution string that failed evaluation.
//   This is done as a separate function to avoid inlining this code
//   for every substitution
function substituteParseError(badEvalString) {
    document.write('Undefined reference in '+document.baseName+' : '+unescape(badEvalString));
    engineTop.logMessage('LPV20001S', document.location.href, engineTop.trim(unescape(badEvalString)));
}

// process JSCP
// __jscphtml__: string - JSCP syntax
// __mested__: boolean - deferred evaluation for variables
// returns void
function parseJSCP(_jscphtml_,_nested_)
{
    var _i_ = 0;
    while (_i_ >= 0 && _i_ < _jscphtml_.length)
    {
        var _j_ = _jscphtml_.indexOf("<%", _i_);
        if (_j_ == -1)
        {
            if (_nested_)
            {
                document.write(_jscphtml_.substring(_i_));
            }
            else
            {
                var _thisText_ = _jscphtml_.substring(_i_);
                var _regexp_ = new RegExp(/\'|\r|\n/);
                if (_regexp_.test(_thisText_))
                document.writeln("document.write(unescape('"+escape(_thisText_)+"'));");
                else
                document.writeln("document.write('"+_thisText_+"');");
            }
            break;
        }
        else if (_j_ >= _i_)
        {
            if (_j_ > _i_)
            {
                if (_nested_)
                {
                    document.write(_jscphtml_.substring(_i_,_j_));
                }
                else
                {
                    var _thisText_ = _jscphtml_.substring(_i_,_j_);
                    var _regexp_ = new RegExp(/\'|\r|\n/);
                    if (_regexp_.test(_thisText_))
                    document.writeln("document.write(unescape('"+escape(_thisText_)+"'));");
                    else
                    document.writeln("document.write('"+_thisText_+"');");
                }
            }
            _i_ = _j_;
            _j_ = _jscphtml_.indexOf("%>", _i_+2);
            if (_j_ == -1)
            {
                _j_ = _jscphtml_.length;
                engineTop.logMessage('LPV20023S', document.location.href);
            }
            else
            {
                var _k_ = _jscphtml_.indexOf("<%",_i_+2);
                if (_k_ > _i_ && _k_ < _j_)
                {
                    engineTop.logMessage('LPV20023S', document.location.href);
                }
            }
            var _v_;
            if ((_i_+2) < _j_)
            {
                if (_jscphtml_.charAt(_i_+2) == "=")
                {
                    _v_ = engineTop.UNDEFINED;
                    try
                    {
                        _v_ = eval(_jscphtml_.substring(_i_+3,_j_));
                    }
                    catch(e)
                    {
                    }
                    if ((typeof _v_ == "string") && _v_ != null && _v_.length > 0 && (_nested_ || (_v_.indexOf("<%") >= 0 && _v_.indexOf("%>") > 0)))
                    {
                        parseJSCP(_v_,_nested_);
                    }
                    else if (! _nested_)
                    {
                        var _evalString_ = _jscphtml_.substring(_i_+3,_j_);
                        document.write(
                        "try { var _err_=false; var _v_="+_evalString_+";\n"+
                        "if (typeof _v_ == 'undefined') _err_=true;\n"+
                        "else if ((typeof _v_ == 'string') && _v_ != null && _v_.length > 0 && _v_.indexOf('<%') >= 0 && _v_.indexOf('%>') > 0)\n"+
                        " parseJSCP(_v_, true);\n"+
                        "else if ((typeof _v_ == 'string') && _v_ != null && _v_.length > 0 && (_v_.indexOf('<%') >= 0 || _v_.indexOf('%>') >= 0)) _err_=true;\n"+
                        "else document.write(_v_);}\n"+
                        "catch(_dummyex_) {_err_ = true;}\n"+
                        "if(_err_) substituteParseError('"+escape(_evalString_)+"');\n");
                    }
                    else
                    {
                        substituteParseError(escape(_jscphtml_))
                    }
                }
                else if (!_nested_ && (_jscphtml_.charAt(_i_+2) == "@"))
                {
                    try
                    {
                        _v_ = _jscphtml_.substring(_i_+3,_j_);
                        var _k_ = _v_.indexOf("=");
                        _v_ = eval("_v_"+_v_.substring(_k_));
                        includeJSCP(_v_);
                    }
                    catch(e)
                    {
                    }
                }
                else if (!_nested_)
                {
                    document.writeln(_jscphtml_.substring(_i_+2,_j_));
                }
            }
            _i_ = _j_ + 2;
        }
    }
}

function evalJSCP(str, windowReference)
{
  if(!windowReference)
  {
    windowReference = window;
  }
  var i = 0;

  var START = 0;
  var LESS_THAN = 1;
  var OPEN_PERCENT = 2;
  var EQUALS = 3;
  var GATHER_PROPERTY = 4;
  var CLOSE_PERCENT = 5;    

  var state = START;

  var verifiedBuffer = "";
  var tempBuffer = "";

  while (i < str.length) {
    var curChar = str.charAt(i);

    switch (state) {
    //Start state
    case START:
      if (curChar != '<') {
        verifiedBuffer += curChar;
      } else {
        tempBuffer += curChar;
        state = LESS_THAN;
      }
      break;

      //Found the first <
    case LESS_THAN:
      if (curChar != '%') {
        verifiedBuffer += tempBuffer + curChar;
        tempBuffer = "";
        state = START;
      } else if (curChar == '%') {
        tempBuffer += curChar;
        state = OPEN_PERCENT;
      }
      break;

      //We have found <%
    case OPEN_PERCENT:
      if (curChar != '=') {
        verifiedBuffer += tempBuffer + curChar;
        tempBuffer = "";
        state = START;
      } else if (curChar == '=') {
        tempBuffer += curChar;
        state = EQUALS;
      }
      break;

      //We have found <%=
    case EQUALS:
      if (curChar != '%') {
        tempBuffer += curChar;
        state = GATHER_PROPERTY;
      } else {
        verifiedBuffer += tempBuffer + curChar;
        tempBuffer = "";
        state = START;
      }
      break;

      //We have found <%= and we're gathering the characters in the property key
    case GATHER_PROPERTY:
      if (curChar != '%') {
        tempBuffer += curChar;
      } else if (curChar == '%' ) {
        tempBuffer += curChar;
        state = CLOSE_PERCENT;
      }
      break;

      //We have found <%= XXXX %
    case CLOSE_PERCENT:
      if (curChar == '>') {
        //We have found something of the form <%= XXXX %>
        //Strip the leading <%= and the trailing % from tempBuffer and do a property lookup on the remainder
        var expression = tempBuffer.substring(3, tempBuffer.length - 1);          
        windowReference.jscpParseResult = null;

        try
        {
          windowReference.eval("jscpParseResult = " + expression);
        }
        catch(e)
        {
          top.logException(e,arguments);
          jscpParseResult = undefined;
        }

        if (typeof windowReference.jscpParseResult == "undefined") {
          top.logMessage("LPV22038W", label);
          state = START;
          tempBuffer = "";
        } else {
          //Append what ever we get to the verified buffer and get ready to start over
          verifiedBuffer += windowReference.jscpParseResult;
          windowReference.jscpParseResult = null;
          tempBuffer = "";
          state = START;
        }          
      } else {
        //Log an error message
        tempBuffer += curChar;          
        state = GATHER_PROPERTY;        
      }
      break;
    }  //End switch

    i++;
  }

  //If we exit the FSM and we're not in the START state, that means there is an incomplete expression
  if (state != START) {
    top.logMessage('LPV22039W', str);
    verifiedBuffer += tempBuffer;
    tempBuffer = "";
  } else if (verifiedBuffer.indexOf("<%") > -1) {
	verifiedBuffer = evalJSCP(verifiedBuffer);
  }
  return verifiedBuffer;
}

// This begins the code that runs on inclusion of JSCP
try
{

	//<ACGC_Bidi> start
	//if locale is Bidi set dir= rtl for the HTML tag
	var orientation = top.isBidiLocale() ? 'rtl' : 'ltr';
	var direction;
	try
	{
		var html = document.getElementsByTagName("HTML")[0];
		direction = html.getAttribute('dir');
		//if current direction  does not equal orientation update the dir attribute in the html
		if((orientation == 'rtl' && direction != 'rtl') || (orientation == 'ltr' && direction == 'rtl'))
		{
			html.setAttribute('dir',orientation);
		}
	}
	catch(e)
	{
	}
	try
	{
		direction = document.dir;
		//if current direction  does not equal orientation update the document.dir value
		if((orientation == 'rtl' && direction != 'rtl') || (orientation == 'ltr' && direction == 'rtl'))
		{
			document.dir = orientation;
		}
	}
	catch(e)
	{
	}
//<ACGC_Bidi> end
    if ((typeof document.haveProcessedDocumentProperties == "undefined") || document.haveProcessedDocumentProperties == false)
    {
        var document_baseName = document.location.pathname;
        if ((typeof document_baseName != "undefined") && document_baseName != null)
        {
            document.haveProcessedDocumentProperties = true;
            engineTop.setHTMLlang(document);
            var i = document_baseName.indexOf("?");
            if (i > 0)
            document_baseName = document_baseName.substring(0,i);
            document_baseName = engineTop.getFullFileName(null,document_baseName);
            i = document_baseName.lastIndexOf(engineTop.PATHSEPARATOR);
            if (i > 0)
            {
                document.baseName = document_baseName.substring(i+1);
                document.dirName = document_baseName.substring(0,i+1);
            }
            i = document.baseName.lastIndexOf(".");
            if (i > 0)
            document.baseName = document.baseName.substring(0,i);
            if (typeof document.properties == "undefined")
            document.properties = new Array();
            engineTop.getURLproperties(document,document.properties);
            engineTop.secureReadPropertiesFile(securityCheck, engineTop.STARTINGDIR+engineTop.RELATIVEDIR, document.baseName + ".properties", document.properties, property('fallBackLocale','en'));
        }
    }
    try
    {
        var allScripts = document.getElementsByTagName("SCRIPT");
        var orightml = allScripts[allScripts.length-1].text;
        document.writeln('<SCRIPT language="JavaScript">');
        document.writeln("try {");
        parseJSCP(orightml,false);
        document.writeln("} catch(e) { engineTop.logException(e,document.location.href); }");
        document.writeln("</SCRIPT>");
    }
    catch(e)
    {
    }
}
catch(e)
{
    engineTop.logException(e,'jscp.js');
}

top.include(document, property("jscpIncludeScripts",[]), true);
top.include(document, property("jscpIncludeStyleSheets",[]), true, 'style');

// Disable right-click context menu unless desired
if (property && property('launchpadContextMenu', 'false') == 'false') 
	document.oncontextmenu = function(){return false;}; 

if(typeof jscpLoaded != "undefined") top.logMessage("LPV30042W", document.location.href);
jscpLoaded = true;