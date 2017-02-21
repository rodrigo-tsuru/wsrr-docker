// Licensed Materials - Property of IBM
// 5648-F10 (C) Copyright International Business Machines Corp. 2005, 2006, 2014
// All Rights Reserved
// US Government Users Restricted Rights - Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

var lastUsedId;
var viewPageTempUserName = 'lp_user_' + Math.floor(Math.random()*1000000);


// high contrast check
// sets top.highContrast to be true of false
function checkHighContrast()
{

    if (top.IS_XUL) {
       myDoc = top.get_clp_root_doc();
       
    } else {
       myDoc = top.document;
    } 
    
  top.logCLPEnter("checkHighContrast", arguments);
  var vTestHC = myDoc.createElement("div");
  vTestHC.id = "testHC";
  vTestHC.style.cssText = 'border: 1px solid;'
      + 'border-color:red green;'
      + 'position: absolute;'
      + 'height: 5px;'
      + 'top: -999px;'
      + 'background-image: url("transparent.gif");';


  myDoc.body.appendChild(vTestHC);
  //do the tests
  var vTestHC = myDoc.getElementById("testHC");
  var vStyle = null;
  try{
    vStyle = myDoc.defaultView.getComputedStyle(vTestHC, "");
  }catch(e){
    vStyle = vTestHC.currentStyle;
  }
  var vTestImg = vStyle.backgroundImage;

  
  if ((vStyle.borderTopColor==vStyle.borderRightColor) || (vTestImg != null && (vTestImg == "none" || vTestImg == "url(invalid-url:)" ))){
    top.highContrast = true;
    top.setProperty("highContrast", "true");
  }
  else
  {
    top.highContrast = false;
    top.setProperty("highContrast", "false")
  }

  top.logCLPExit("checkHighContrast", arguments);
}

// security check
// fcn: function
// returns boolean - if secure
function isSecure(fcn) {
    try {
        // Need to check if the security function passed contains the expected source.
        // Ensures a malevolent function is not being passed and run before the actual check to see if secure.
        if ((new Function("return window")).toString().replace(/\n/g," ") != fcn.toString().replace(/\n/g," "))
            return false;

        return(fcn().top == window.top);

    } catch(e) { alert(e.message);}
    return false;
}

// returns boolean - If is in Wizard mode.
function isWizard()
{
  return (top.navigationMode && top.navigationMode.toUpperCase() == "WIZARD");
}

// returns boolean - If is in Essentials mode.
function isEssentials()
{
  return (top.navigationMode && top.navigationMode.toUpperCase() == "ESSENTIALS");
}

// returns boolean - If is Windows 64-bit
function isWin64()
{
  return (top.ARCHITECTURE.indexOf("64") > -1)?true:false;
    
}

// returns boolean - if it is a dojo skin
function isDojo() 
{
	return ( top.SKINDIR.indexOf("Dojo") > -1)?true:false;
}

// returns string - script launcher executable for Windows
function getScriptLauncherExeName()
{
	if (!top.scriptLauncherExeName)
	{
		top.scriptLauncherExeName = getEnv('LaunchPadScriptLauncher') || (top.findProperty && top.findProperty('launchpadScriptLauncher', top, null)) || isWin64() ? 'ScriptLauncher64.exe' : 'ScriptLauncher.exe';
	}
	return top.scriptLauncherExeName;
}

// strip whitespace
// s : string
// returns string - no leading or trailing whitespace
function trim(s) {
    try {
        s = s.match(/\S.*/);
        if (s == null) return '';
        return s.toString().match(/.*\S/).toString();
    } catch(e) { top.logException(e,arguments);}
    return top.UNDEFINED;
}


// Add quotes if the string is not already surrounded by quotes
// s: string
// returns string with quotes around it
function addQuotes(s) {
   if (s.charAt(0) != '"') {
      return '"' + s + '"';
   } else if (s.charAt(s.length-1) === '"' ) {
      return s;
   } else {
      return '"' + s + '"';
   }
}


function createTempFile(prefix, suffix, directory)
{
	top.logCLPEnter("createTempFile", arguments);
	if(!directory) directory = top.getEnv('LaunchPadTemp');
	if(!suffix) suffix = '';
	if(!prefix) prefix = '';
	
	prefix = directory + top.PATHSEPARATOR + prefix;
	
	// find a filename that doesn't exist yet in temp
	var index = Math.round(Math.random() * 1000);
	var path = prefix + suffix;
	while(top.clientFileExists(null, path))
	{
		path = prefix + index + suffix;
		index++;
	}
	top.writeTextFile(path,'');
	top.logCLPExit("createTempFile", arguments);
	return path;
}

// format a message with substitution references
// template: string - template message
// optional args: substitution values
// returns string - message with subsitution
function formatmsg(template) {
    try {
        var args = arguments;
        var msg = template;
        if (typeof msg == "string" && typeof arguments[1] != "undefined" && arguments[1] != null) {
            if (typeof arguments[1] != "string") {
                args = arguments[1];
            }
            for (var i=args.length - 1; i > 0; i--) {
               if (args[i] == null) {
                   args[i] = "null";
               }
                if ((typeof args[i] != "undefined") && args[i] != null) {
                    var ndx = 0;
                    do {
                        ndx = msg.indexOf("%"+i, ndx);
                        if (ndx >= 0) {
							var replacement = args[i].toString();
							msg = msg.substring(0,ndx) + replacement + msg.substring(ndx+( i < 10 ? 2 : 3));
							ndx += replacement.length;
						}
                    } while (ndx >= 0);
                }
            }
        }
        return msg;
    } catch(e) { top.logException(e,arguments);}
    return top.UNDEFINED;
}

// see if a messy-named file exists
// securityFcn: function = new Function('return window')
// topDir: string - current full directory path for relative names
// fileName: string - messy file name
// logSeverity: string - optional log severity letter if logging is requested
// returns string - full native file if it exists
//         null - if not exists
function secureClientFileExists(securityFcn,topDir,fileName,logSeverity) {
    try {
        var fullFileName = top.getFullFileName(topDir,fileName);
        if (top.secureFileExists(securityFcn, fullFileName))
            return fullFileName;
    } catch(e) { top.logException(e,arguments);}
    if (typeof logSeverity == "string")
        top.logMessage('LPV20016'+logSeverity.toUpperCase(), fileName, topDir);
    return null;
}

// enable or disable a document element
// element: document element
// enableFlag: boolean 
// returns void
function enableElement(element, enableFlag) {
    try {
        if ((typeof element == "undefined") || (typeof element == "string") || element == null || element == '') return;
        if (typeof element.disabled != "undefined") {
            element.disabled = !enableFlag;
        }
        if (typeof element.style != "undefined") {
			if (enableFlag)
			{
				// Restore original element values
				element.style.cursor = (typeof element.savedCursor != "undefined") ? element.savedCursor : "hand";
				element.style.color = (typeof element.savedColor != "undefined") ? element.savedColor : "purple";
				element.onclick = (typeof element.savedOnclick != "undefined") ? element.savedOnclick : element.onclick;
			} 
			else 
			{
				// Save original element values
				element.savedCursor = element.style.cursor;
				element.savedColor = element.style.color;
				element.savedOnclick = element.onclick;
				
				// Set disabled element values
				element.style.cursor = "default";
				element.style.color = "gray";
				element.onclick = function(){ return false; };
			}
        }
    } catch(e) { top.logException(e,arguments);}
}

// expand a string with %envVar% parameters
// inCmd: string - string to perform substitution
// returns string - expanded string
top.expandEnv = function (inCmd)
{
    var startPos=inCmd.indexOf('%');
    while (startPos != -1) {
        var cmBefore=inCmd.substring(0,startPos);
        var cmAfter=inCmd.substring(startPos+1);
        var endPos=cmAfter.indexOf('%');
        if (endPos != -1) {
            inCmd=cmBefore+
                  top.secureGetEnv(new Function('return window'), cmAfter.substring(0,endPos))+
                  cmAfter.substring(endPos+1);
        } else {
            top.logMessage('LPV20026S',inCmd);
            break;
        }
        startPos=inCmd.indexOf('%');
    }
    return inCmd;
}


// get and format a platform dependent command to execute
// commandDataArray: [strings] - array of platform dependent command templates
// args: [strings] - substitution parameters
function getCommand(commandDataArray, args) {
    top.logCLPEnter("getCommand", arguments);
	try {
        var rc;
        var command = null;
        
        try
        {
            command = top.getBestOSMatch(commandDataArray);
        } catch(e) {}
        
        if (typeof command == "undefined" || command == null) {
            top.logMessage("LPV20020S", "null");
            return;
        }

        var cmd = new Array();
        for (var i=0; i < command.length; i++) {
            if (typeof command[i] == "string")
                cmd[i] = top.formatmsg(command[i], ((typeof args == "object") ? args : arguments));
                // Expand env variables (%varName%) on command element
                if (typeof cmd[i] == "string") {
                  cmd[i]=expandEnv(cmd[i]);
                }
            else {
                cmd[i] = command[i];
                top.logMessage("LPV20020S", command);
            }
        }
		top.logCLPExit("getCommand", arguments);
        return cmd;
    } catch(e) { top.logException(e,arguments);}
}

// popup an HTML page to view
// securityFcn: function = new Function('return window')
// win: window - HTML target or null to run an external browser
// topDir: string - full current directory for relative paths
// url: string - messy URL spec to display
// element: optional document element - disable briefly while viewing for feedback
// returns boolean - true if error
var UrlRegExp = new RegExp("https?://|file://|ftp://","i");
function secureViewPage(securityFcn,win,topDir,url,element) {
    try {
        var f = null;
        if (typeof win == "undefined" && !top.isMac()) {
            return true;
        }

        var anchorRegex = new RegExp("#");
        var anchorPosition = url.search(anchorRegex);
        var queryStringRegex = new RegExp("[\?]");
        var queryStringPosition = url.search(queryStringRegex);

        var anchor = "";
        var queryString = "";
        var tempUrl = url;
        //We only have an anchor
        if (anchorPosition > 0 && queryStringPosition == -1) {
            tempUrl = url.substring(0,anchorPosition);
            anchor = url.substring(anchorPosition, url.length);
        }
        //we only have a queryString
        else if (anchorPosition == -1 && queryStringPosition > 0) {
            tempUrl = url.substring(0,queryStringPosition);
            queryString = url.substring(queryStringPosition, url.length);
        }
        //we have both an anchor and a query string.  Assume the anchor comes first
        else if (anchorPosition > 0 && queryStringPosition > 0 && anchorPosition<  queryStringPosition) {
            tempUrl = url.substring(0,anchorPosition);
            anchor = url.substring(anchorPosition, queryStringPosition);
            queryString = url.substring(queryStringPosition, url.length);
        }
        //we have both an anchor and a query string and the query string is first
        else if (queryStringPosition > 0 && queryStringPosition > 0 && queryStringPosition < anchorPosition) {
            tempUrl = url.substring(0,queryStringPosition);
            queryString = url.substring(queryStringPosition, anchorPosition);
            anchor = url.substring(anchorPosition, url.length);             
        }

        if (url.search(UrlRegExp) == 0)
            var fullURL = url;
        else {
            if ((f = top.secureClientFileExists(securityFcn, topDir, tempUrl, 'W')) == null) {
                if (win != null) win.close();
                return true;
            } else {                
                var fullURL = top.nativeFileToURL(f);
                if (anchorPosition != -1 && queryStringPosition != -1 && anchorPosition < queryStringPosition) {
                    fullURL += anchor + queryString;
                } else if (anchorPosition != -1 && queryStringPosition != -1 && queryStringPosition < anchorPosition) {
                    fullURL += queryString + anchor;
                } else if (anchorPosition != -1 && queryStringPosition == -1) {
                    fullURL += anchor;
                } else if (queryStringPosition != -1 && anchorPosition == -1) {
                    fullURL += queryString;
                }
            }
        }
        
        try
        {            
           if (top.OSTYPE=="windows" && win == null) {
				if (top.BROWSER === 'IExplore') {
					secureRunProgram(securityFcn, "", ["cmd.exe","/c", "start",'""' , fullURL], false, true, element);                				
				} else {
					var modifiedURL = fullURL.replace(/&/g, "^&");
					secureRunProgram(securityFcn, "", ["cmd.exe",'/c start ' + modifiedURL], false, true, element);                
				}
                return false;
           }
        }
        catch(e)
        { //fall through
        }
		
		        
        try
        {            
           if (top.isMac() && win == null) {
				top.Launchpad.openURL(fullURL);
                return false;
           }
        }
        catch(e)
        { //fall through
        }

        if (win != null) {
            try
            {    
              win.location.replace(fullURL);
              //Closes the old blank window if UAC is on
              //if(isUACOn() && engineTop.getEnv("LaunchPadOS") == "Windows_Vista" && engineTop.getEnv("LaunchPadDefaultBrowser") == "IExplore") win.close();
            }
            catch(e)
            {
				//This is most likely to fail if the launchpad is started from a network share on another domain, and has
                //to pull a file from the local drive or a location other than where it was started from.  
                top.logException(e,arguments); 
                if (win != null) win.close();

                return true;
            }
        }

        else if (typeof top.VIEWERPATH == "string" && top.VIEWERPATH != '' && typeof top.VIEWERARGS == "string" && top.VIEWERARGS != '') {
            // run cmd /c start *.html
            secureRunProgram(securityFcn,"",[top.VIEWERPATH,top.VIEWERARGS,fullURL],false,true,element);
        } else if (typeof top.VIEWERPATH == "string" && top.VIEWERPATH != '') {
            // run mozilla or firefox *.html
            if (top.OSTYPE == "unix") {
                fullURL = fullURL.replace(/&/g, '\\&');
                var SET_LOGIN_NAME = 'LOGNAME=' + viewPageTempUserName + '; export LOGNAME; ';
				var BROWSER_CMD = "";
				if (top.BROWSER == "Firefox")
				{
					BROWSER_CMD = (top.OS === 'AIX' ? '' : SET_LOGIN_NAME) 
									+ 'unset MOZ_NO_REMOTE; '
									+ secureGetEnv(securityFcn,'LaunchPadBrowser') + " " 
									+ "-P " + secureGetEnv(securityFcn,'LaunchPadViewProfileName')  + " " 
									+ "-profile " + secureGetEnv(securityFcn,'userviewprefpath') + " "
									+ fullURL;

				}
				else
				{
					BROWSER_CMD = (top.OS === 'AIX' ? '' : SET_LOGIN_NAME) 
									+ 'unset MOZ_NO_REMOTE;' 
									+ secureGetEnv(securityFcn,'LaunchPadBrowser') + " " 
									+ fullURL;
				}							
                secureRunProgram(securityFcn,"",['/bin/sh','-c',  BROWSER_CMD],false,false,element);
            } else {
                secureRunProgram(securityFcn,"",[top.VIEWERPATH, fullURL], false, false, element);
            }
        } else
            window.open(fullURL);
        return false;
    } catch(e) { top.logException(e,arguments); 
        if (win != null) win.close();
        return true;
    }
}


// Function to determine whether User Access Control is turned on in Windows Vista/2008
function isUACOn()
{
  var uacValue = top.getEnv("LaunchPadUACValue");
  try
  {
    return uacValue.charAt(uacValue.length - 1) == '1';
  }
  catch(e) { return false };
  return false;
}

// Returns a sorted list of valid locale IDs and translated language names
// NOTE: This function can only be called after properties.js has been loaded!!
// If top.LOCALE is not in the validLocales property list, this function will
// add it to insure the current local is in the list.
// returns: Array of localID/Name Array
function getValidLocaleNames() {
    var validLocales = property('validLocales',['en']);
    var localeNames = property('localeName', new Array());

    // Build locale list
    var localeList = new Array();
    for (var i in validLocales) {
        var localeID = validLocales[i];
		// display each language name in it's own locale.
		var tempName = getPropertyAlternateLocale("localeName[" + localeID + "]", localeID, top.GLOBALPROPERTIES, true, localeNames[localeID]);
        if (typeof tempName != "undefined"){
            localeList.push([localeID, tempName]);    
        }    
    }

    // Sort localeList by name using locale-based compare
    localeList.sort(function(a,b){ return a[0].localeCompare(b[0]);});

    return(localeList);
}

 //<ACGC_Bidi> Start 
function isBidiLocale()
{
try {
	var bidiLocales = property('bidiLocales',['ar','he']); 
} catch (e){};
	for(var x in bidiLocales)
	{
		if(bidiLocales[x] == top.LOCALE) return true;
	}
	return false;
}

// restart launchpad with a different locale
        // lang: string 
// returns void - launchpad repaints
function changeLocale(lang) {
    try {
        var startingDir = top.getDiskMapping(null);
        if (startingDir == null) return;
        top.STARTINGDIR = startingDir;
        try {
            if (top.secureSetEnv(new Function('return window'), "LaunchPadLocale", lang)) {
                setTimeout('top.document.location.replace("'+top.document.location.href+'")',100);
                // reload() won't work in mozilla = cache problem?
                // top.document.location.reload(false);
                return;
            }
        } catch(e) {}
        top.LOCALE = lang;
        top.initializeProperties();
        var title = top.findProperty('title',this,null);
        if (typeof title == "string")
            top.document.title = title;
        for (var i=top.frames.length-1; i >= 0; i--)
            if (typeof top.frames[i].location != "undefined" && top.frames[i].location.href != '')
                // reload() won't work in mozilla = cache problem?
                setTimeout('top.frames['+i+'].location.replace("'+top.frames[i].location.href+'")',100);
        return;
    } catch(e) { top.logException(e,arguments);}
}

// Takes the current launchpad locale and converts it to the corresponding value found in the map.
function getLocaleMapping(mapName)
{
	if(typeof mapName == "undefined" || mapName == null)
	{
		mapName = "engineLocales";
	}
	var localeMappings = property(mapName);
	var locale = localeMappings[top.LOCALE];

	if ( locale == null ) { // if no mapping exists for the 5 character lang code, try the two digit code
		locale = localeMappings[top.LOCALE.substring(0,2).toLowerCase()];
	}
	if ( locale == null ) { // try the fallbackLocale
		locale = localeMappings[property('fallBackLocale', 'en')];
	}
	if ( locale == null ) { // if everything fails, default to English
		locale = localeMappings['en'];
	}
	return locale;
}

// search for a file
// securityFcn: function = new Function('return window')
// startingDir: string - full current directory for relative references
// baseFileName: string - relative path to find
// fallBackLocale: string - optional locale directory to look in 
// returns string - full native file name if found
//         undefined/null if not found
// search order:
//  ( defined in getSearchDirs() )
//  extensions/locale (if applicable)
//  extensions/fallback locale (if applicable)
//  extensions (if applicable)
//	content/locale
//	content/fallback locale
//	content
//	skin/locale
//	skin/fallback locale
//	skin
//	launchpad/locale
//	launchpad/fallback locale
//	launchpad
function secureFindFile(securityFcn,startingDir,baseFileName,fallBackLocale,doc) {    
    try {        
		var files = top.getSearchDirs(startingDir);
		var f;
		for (i in files)
		{
			if ((f=top.secureClientFileExists(securityFcn, files[i], baseFileName)) != null)
			{
				break;
			}
		}
       if ((typeof f == "undefined" || f == null) && (baseFileName.indexOf("NO PROPERTY **") == -1))
            top.logMessage("LPV20013W", startingDir, baseFileName);
		return f;
    } catch(e) { top.logException(e,arguments);}
    return top.UNDEFINED;
}

// debug function to write generated HTML to a random window
// doc: document reference
// win: window
// returns void - HTML text replaces win contents
function showHTML(doc,win) {
    var newHTML = doc.documentElement.innerHTML.replace(/</g, "&lt;"); 
    newHTML = newHTML.replace(/\n/g, "<br>");
    newHTML = newHTML.replace(/\s+\}/g, "<br>}");
    newHTML = newHTML.replace(/\}\s+/g, "}<br>");
    newHTML = newHTML.replace(/;\s+/g, ";<br>");
    newHTML = newHTML.replace(/\{\s+/g, "{<br>");
    newHTML = newHTML.replace(/document\.write\(unescape\('%0D%0A'\)\);/g, "");
    newHTML = newHTML.replace(/document\.write\(unescape\('0A'\)\);/g, "");
    win.document.write(newHTML); 
}

// resize launchpad
// x: integer - width
// y: integer - height
// returns void
function resize(x,y) {
  try
  {
    window.resizeTo(x,y);
  }
  catch(e){}
}

// set <HTML lang="??"> based on launchpad locale
// doc: document reference
// returns void
function setHTMLlang(doc) {
    try {
        var htmlelement = doc.getElementsByTagName("HTML")[0];
        if (htmlelement == undefined){htmlelement.lang=top.LOCALE};
        if (typeof htmlelement.lang != "string" || htmlelement.lang == '') {
            if (top.LOCALE.length > 2 && top.LOCALE.charAt(2) == '_')
                htmlelement.lang = top.LOCALE.substring(0,2) + "-" + top.LOCALE.substring(3);
            else
                htmlelement.lang = top.LOCALE;
        } 
    } catch(e) {}
}

/*
strict unicode UTF-8:
^([\x00-\x7f]|
[\xc2-\xdf][\x80-\xbf]|
\xe0[\xa0-\xbf][\x80-\xbf]|
[\xe1-\xec][\x80-\xbf]{2}|
\xed[\x80-\x9f][\x80-\xbf]|
[\xee-\xef][\x80-\xbf]{2}|
f0[\x90-\xbf][\x80-\xbf]{2}|
[\xf1-\xf3][\x80-\xbf]{3}|
\xf4[\x80-\x8f][\x80-\xbf]{2})*$

ISO-10646 UTF-8:
^([\x00-\x7f]|
[\xc0-\xdf][\x80-\xbf]|
[\xe0-\xef][\x80-\xbf]{2}|
[\xf0-\xf7][\x80-\xbf]{3}|
[\xf8-\xfb][\x80-\xbf]{4}|
[\xfc-\xfd][\x80-\xbf]{5})*$
*/
var UTF8toStringRegExp = new RegExp("[\xc0-\xff]");
function UTF8toString(bytes) {
    var j = bytes.search(UTF8toStringRegExp);
    if (j < 0) return bytes;
    var retString = bytes.substring(0,j);
    var len = bytes.length;
    while (j < len) {
        var charCode = bytes.charCodeAt(j);

        if (charCode < 192) {
            retString += bytes.charAt(j);
            j++;
        } else {
            var shift;
            var mb_len;
            var dec;
            if (charCode <= 223) {
                // \xc0-\xdf
                mb_len = 2;
                dec = 192;
                shift = 6;
            } else if (charCode <= 239) {
                // \xe0-\xef
                mb_len = 3;
                dec = 224;
                shift = 12;
            } else if (charCode <= 247) {
                // \xf0-\xf7
                mb_len = 4;
                dec = 240;
                shift = 18;
            } else if (charCode <= 251) {
                // \xf8-\xfb
                mb_len = 5;
                dec = 248;
                shift = 24;
            } else {
                // \xfc-\xfd
                mb_len = 6;
                dec = 252;
                shift = 30;
            }
            charCode = 0;
            while (mb_len-- > 0) {
                charCode += (bytes.charCodeAt(j++) - dec) << shift;
                dec = 128;
                shift -= 6;
            }
            retString += String.fromCharCode(charCode);
        }
    }
    return retString;
}

/*
function call() {
  try {
    var fcn;
    var v;
    var p = this;
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
  } catch(e) { top.logException(e,arguments); }
}
*/

top.document.href = top.document.location.href;

function getDocument(doc)
{
	if(!doc) doc = document;
	else if(typeof element == "string") 
	{
		// get document for top/main/log/banner/content/navigation/
		alert('string not supported in getDocument');
	}
	return doc;
}

function createElement(type, id, content, document)
{

	document = getDocument(document);
	var element = document.createElement(type);
	if(id) element.setAttribute('id',id);
	if(content) element.innerHTML = content;
	return element;

}

function getElement(element, document)
{
	document = getDocument(document);
	
	if(!element) element = document.body;
	if(typeof element == "string") 
	{

		element = document.getElementById(element);
	}
	
	return element;
}

function appendElement(element, parent, document)
{
	parent = getElement(parent, document);
	element = getElement(element, document);
	parent.appendChild(element);
}

function removeElement(element, document)
{
	element = getElement(element, document);
	element.parentNode.removeChild(element);
}

function addFrameOverlay(id, url, document)
{
	var element = createElement('div',id,'<div class="frame_overlay' + '' + '"></div> '+'<iframe id="frame_' + id + '" src="' + url + '" width="100%" height="100%" marginwidth="0" marginheight="0" frameborder="0" application="yes" />',document);
	element.className = 'frame_overlay_wrapper';
	appendElement(element, document.body, document);
}
function removeFrameOverlay(id, document)
{
	removeElement(id, document);
}

// function showOverlay
// show - (optional) true or false - default is to remove 
//             the  last one
// doc - which doc to overlay (default is top.document)
// id - an optional id to name the overlay
// optionalZindex - controls layering
function showOverlay(show, doc, id, optionalZindex)
{
  top.logCLPEnter("showOverlay", arguments);
  if(!doc) doc = top.document;
  
  if(!show)
  {
    if(!id) id = lastUsedId;
    top.removeElement(id, doc);
	top.logCLPExit("showOverlay", arguments);
    return;
  }
  
  if(!id) id = "" + Math.floor(Math.random() * 1000000000);
  lastUsedId = id;

  var innerHTML = '\
  <div id="' + id + '" class="black semitransparent fill absolute">\
  </div>';

  var element = top.createElement('div',id,innerHTML,doc);
  top.appendElement(element, doc.body, doc);

  if(optionalZindex)
    element.style.zindex = optionalZindex;
  top.logCLPExit("showOverlay", arguments);
  return id;
}


function ternary(booleanValue, resultIfTrue, resultIfFalse) 
{ 
	return (booleanValue) ? resultIfTrue : resultIfFalse;
}

function compare(comparisonType, value1, value2) 
{
	if (comparisonType == "==") 
		return (value1 == value2);  
	else if (comparisonType == "!=") 
		return (value1 != value2);
	else 
		return false; 
}

function include(document, scripts, shouldFindFile, type) {
	if(typeof scripts == 'string')
	{
		scripts = [scripts];
	}
	if(!type) type = 'script';
	
	var head = document.getElementsByTagName('head')[0];
	for(var i in scripts)
	{
		var script = scripts[i];
		if(shouldFindFile)
		{
			script = findURL(null, script);
		}
		var element = document.createElement(type);
		element.src = script;
		head.appendChild(element)
	}
}

function convertHexStringToByteArray(hexString)
{
	var byteArray = new Array();
	try
	{
		for(var i = 0; i < hexString.length; i += 2)
		{
			var b1 = parseInt(hexString.charAt(i), 16);
			var b2 = i < hexString.length - 1 ? parseInt(hexString.charAt(i + 1), 16) : 0;
		
			var b = (b1 << 4) + b2;
			byteArray.push(b);
		}
		return byteArray;
	}
	catch(e)
	{
		//TODO logging of message
		alert('Invalid hexidecimal string: ' + hexString);
		return null;
	}
}

function getUpdateLocation()
{
	if (top.updateLocation == null || top.updateLocation == "" || top.updateLocation == "undefined")
	{
		top.updateLocation = top.findProperty('updateLocation', self, '');
		if (top.updateLocation == null || top.updateLocation == "" || top.updateLocation == "undefined")
			top.updateLocation = top.secureGetEnv(new Function('return window'), "LaunchPadUpdateLocation");
	}
	return top.updateLocation;
}

function setCacheLocation(newCacheLocation)
{
	return (top.secureSetEnv(new Function('return window'), "LaunchPadCacheLocation", newCacheLocation));
}

function getCacheLocation()
{
  
  if (!top.cacheLocation || top.cacheLocation != '')
  {
    top.cacheLocation = top.getEnv("LaunchPadCacheLocation") || top.property('launchpadCacheLocation', '');
    if (top.cacheLocation == '' &&  (top.property('launchpadUniqueId', '') != ''))
    {
      top.cacheLocation = top.getNativeFileName(top.isWindows()?top.getEnv("APPDATA") + "/IBM/CLP/" +  top.property('launchpadUniqueId', '') + "/":"/opt/IBM/CLP/" + top.property('launchpadUniqueId', '') + "/");
      if (top.isWindows())
      {
        top.cacheLocation = top.getNativeFileName(top.getEnv("APPDATA") + "/IBM/CLP/" +  top.property('launchpadUniqueId', '') + "/");
      }
      else if (top.isMac())
      {
        top.cacheLocation = top.getNativeFileName("/Library/Caches/IBM/" + top.property('launchpadUniqueId', '') + "/");
      }
      else
      {
        top.cacheLocation = top.getNativeFileName("/opt/IBM/CLP/" + top.property('launchpadUniqueId', '') + "/");
      }
    }
  }
  return top.cacheLocation;
}

function setUpdateLocation(newUpdateLocation)
{
	top.updateLocation = null;
	return (top.secureSetEnv(new Function('return window'), "LaunchPadUpdateLocation", newUpdateLocation));
}




function getLaunchpadUpdateSite()
{
  if (top.getEnv("LaunchPadRestart", "TRUE")) 
	{
		top.setEnv("LaunchPadRestart", "");
    if (top.getEnv("LaunchPadLoadedFromCache")!="TRUE")
      return "";
	}
	if (top.launchpadUpdateSite == null || top.launchpadUpdateSite == "" || top.launchpadUpdateSite == "undefined")
	{
		top.launchpadUpdateSite = top.secureGetEnv(new Function('return window'), "LaunchPadUpdateSite");
		if (top.launchpadUpdateSite == null || top.launchpadUpdateSite == "" || top.launchpadUpdateSite == "undefined")
			top.launchpadUpdateSite = property('launchpadUpdateSite', property('launchPadUpdateSite', ''));
	}
	if (top.launchpadUpdateSite && top.launchpadUpdateSite != "" && top.launchpadUpdateSite.indexOf("http://") == -1 && top.launchpadUpdateSite.indexOf("https://") == -1 && top.launchpadUpdateSite.indexOf("ftp://") == -1 && top.launchpadUpdateSite.indexOf("file://") == -1)
		top.launchpadUpdateSite = nativeFileToURL(top.launchpadUpdateSite);
	return top.launchpadUpdateSite;
}

function setLaunchpadUpdateSite(newUpdateSite)
{
	return (top.secureSetEnv(new Function('return window'), "LaunchPadUpdateSite", newUpdateSite));
}

function generateSearchDirs(startingDir, dirsToAdd, dirsToPrepend, inverseOrder)
{		
	var rawSearchDirs = new Array();
	var rawPrependDirs = new Array();
	var searchDirs = new Array();
	if (dirsToAdd)
	{
		for (i in dirsToAdd)
		{
			if (rawSearchDirs.length == 0)
			{
				rawSearchDirs[0] = dirsToAdd[i];
			}
			else
			{
				rawSearchDirs.unshift(dirsToAdd[i]);
			}
		}
	}
	if (dirsToPrepend)
	{
		if (dirsToPrepend instanceof Array)
		{	
			for (i in dirsToPrepend)
			{
				if (rawPrependDirs.length == 0)
				{
					rawPrependDirs[0] = dirsToPrepend[i];
				}
				else
				{
					rawPrependDirs.unshift(dirsToPrepend[i]);	
				}
			}
		}
		else
			rawPrependDirs.unshift(dirsToPrepend);	
	}
	
	//var updateLocation = null;
	var updateLocation = getUpdateLocation();
	if (updateLocation != null && updateLocation != "" && updateLocation != "undefined")
	{
		if (rawPrependDirs.length == 0)
		{
			rawPrependDirs[0] = updateLocation;
		}
		else
		{
			rawPrependDirs.unshift(updateLocation);	
		}
	}
	if (startingDir == null || startingDir.length == 0)
	{
		startingDir = "./";
	}
	// TODO: Cache the results for better performance
	//if (!dirsToAdd && !dirsToPrepend && top.searchDirs[startingDir])
	//	return top.searchDirs[startingDir];
	//else
	
		var dirs = new Array();
		var prependeddirs = new Array();
		for (i in rawPrependDirs)
		{
			for (j in rawSearchDirs)
			{
				if (rawSearchDirs[j] != null && rawPrependDirs[i] != null)
				{
						prependeddirs.push(rawPrependDirs[i] + rawSearchDirs[j]);
				}
			}
		}
		for (j in rawSearchDirs)
		{
			if (rawSearchDirs[j] != null)
				dirs.push(top.getFullFileName(startingDir , rawSearchDirs[j]));
		}
	dirs = prependeddirs.concat(dirs);
	if (!inverseOrder)
		return dirs;
		
	return dirs.reverse();
}

function getSearchDirs(startingDir,reverseOrder)
{
	var fallBackLocale = property('fallBackLocale', 'en');
	var initDirs = new Array();
	if (reverseOrder == null)
		reverseOrder == false;
	
               
	initDirs.push(top.RELATIVEDIR + top.CONTENTDIR + top.LOCALE + "/");
	if (typeof fallBackLocale == "string" && top.LOCALE != fallBackLocale)
		initDirs.push(top.RELATIVEDIR + top.CONTENTDIR + fallBackLocale + "/");
	initDirs.push(top.RELATIVEDIR + top.CONTENTDIR);
	initDirs.push(top.RELATIVEDIR + top.SKINDIR + top.LOCALE + "/");
	if (typeof fallBackLocale == "string" && top.LOCALE != fallBackLocale)
		initDirs.push(top.RELATIVEDIR + top.SKINDIR + fallBackLocale + "/");
	initDirs.push(top.RELATIVEDIR + top.SKINDIR);
	initDirs.push(top.RELATIVEDIR + top.LOCALE + "/");
	if (typeof fallBackLocale == "string" && top.LOCALE != fallBackLocale)
		initDirs.push(top.RELATIVEDIR + fallBackLocale + "/");
	initDirs.push(top.RELATIVEDIR);
	return generateSearchDirs(startingDir, initDirs, null, reverseOrder);
}

function getBaseJSCPSearchDirs(startingDir)
{
	var fallBackLocale = property('fallBackLocale', 'en');
	var initDirs = new Array();
	initDirs.push(top.RELATIVEDIR + top.CONTENTDIR);
	initDirs.push(top.RELATIVEDIR + top.SKINDIR);
	initDirs.push(top.RELATIVEDIR);
	return generateSearchDirs(startingDir, initDirs, null, true);
}

function getLocaleJSCPSearchDirs(startingDir)
{
	var fallBackLocale = property('fallBackLocale', 'en');
	var initDirs = new Array();
	
               
	initDirs.push(top.RELATIVEDIR + top.CONTENTDIR + top.LOCALE + "/");
	if (typeof fallBackLocale == "string" && top.LOCALE != fallBackLocale)
		initDirs.push(top.RELATIVEDIR + top.CONTENTDIR + fallBackLocale + "/");
	initDirs.push(top.RELATIVEDIR + top.SKINDIR + top.LOCALE + "/");
	if (typeof fallBackLocale == "string" && top.LOCALE != fallBackLocale)
		initDirs.push(top.RELATIVEDIR + top.SKINDIR + fallBackLocale + "/");
	initDirs.push(top.RELATIVEDIR + top.LOCALE);
	if (typeof fallBackLocale == "string" && top.LOCALE != fallBackLocale)
		initDirs.push(top.RELATIVEDIR + fallBackLocale + "/");
	return generateSearchDirs(startingDir, initDirs, null, true);
}

function getPropertiesFilesDirs(startingDir, relativeDir, fallBackLocale)
{
	var initDirs = new Array();
	initDirs.push(relativeDir);
	initDirs.push(relativeDir + top.LOCALE+'/');
	return generateSearchDirs(startingDir, initDirs, null, true);
}

function setFileExecutable(filename)
{
	try {
		if ( top.OSTYPE == "unix" )
		{
			var args = new Array(); 
			args[0] = "/bin/chmod"
      args[1] = "+x";
			args[2] = top.getNativeFileName(filename);
			top.runProgram(NO_DISKID,args,FOREGROUND,HIDDEN);
		}
		return true;
	}
	catch(e) {}
	return false;
}

function downloadAndRunFile(url, hidden)
{
	top.logCLPEnter("downloadAndRunFile", arguments);
	var localFileName = top.getNativeFileName(top.getEnv('LaunchPadTemp') + url.substring(url.lastIndexOf("/"), url.length));
	top.getRemoteFile(url, localFileName, true);
	top.logCLPExit("downloadAndRunFile", arguments);
}

top.inputValue = [];

/*	browseDialog(options)
 * 
 * 	*Optional* options: {
 * 				width: String, 		//Exploiter specification required to be px
 * 				height: String, 	//Exploiter specification required to be px
 * 				*Optional* browseFor: file || folder,		//Default - folder
 * 				*Optional* id: String,			//Default - generatedBrowseDialog<#1-1000>
 *				*Optional* title: String,		//Default - Browse...
 * 				*Optional* dialogText,			//Default - Browse...
 * 				*Optional* defaultLocation: String || Function,		//Default - root directory
 * 				*Optional* validationFunction: Function				// Default - return true 
 * 				}
 */
function browseDialog(options){
	
	try {
		var classAttName = (top.BROWSER=='IExplore')? 'className' : 'class';
				
		if(typeof options.id == 'undefined') {
			do {
				options.id = generateId("BrowseDialog");
			}
			while (!isIdNamespaceAvaliable(options.id));
		}else{
			if(!isIdNamespaceAvaliable(options.id))
				return 'undefined';
		}
		if (typeof options.title == 'undefined') {
			if (typeof options.browseFor == 'undefined' || options.browseFor == 'folder') 
				options.title = property('browseFoldersPromptTitle')
			else 
				options.title = property('browseFilesPromptTitle')
		}
		
		if (typeof options.dialogText == 'undefined') {
			if (typeof options.browseFor == 'undefined' || options.browseFor == 'folder') 
				options.dialogText = property('browseFoldersPromptText')
			else 
				options.dialogText = property('browseFilesPromptText')
		}
			
		if(typeof options.defaultLocation == 'undefined')
			options.defaultLocation = top.STARTINGDIR;
		
		if(typeof options.validationFunction == "undefined")
			options.validationFunction = function(){ return true; }; //Allow value to be returned always
		else if(typeof options.validationFunction == "Function")
			options.validationFunction = options.validationFunction;
		else if(typeof options.validationFunction == "String")
			options.validationFunction = new Function(options.id+"validationFx" ,options.validationFunction)
		
	
		
		/*	browseForFileHack()
		 * 
		 * 		Creates transparent input=file over normal input=text & input=button,
		 * 		filling their parent element. Data entered into invisible
		 * 		input=file field is immediately replicated to input=text field.
		 * 		Results in browse location as texbox value.
		 * 
		 * 		*Would be nice to have the "Browse" button click() when
		 * 		input=field is activated.*
		 * 		*IE offsetHeight/Width should also take into account borderHeight/Width
		 * 		for invisible element*
		 *  		
		 */
		function browseForFileHack(id){
			try {
			var myDoc = (top.IS_XUL?get_clp_root_doc():document);
						var container = myDoc.getElementById(id).parentNode;
						var input = document.createElement('input');
						input.id = id + "MaskingFileInput";
						input.name = id + "MaskingFileInput";
						input.type = "file";
						input.style.width =container.offsetWidth + "px";
						input.style.height = container.offsetHeight + "px";
						input.style.zIndex = 2;
						input.onkeypress = input.onkeydown = input.onkeyup = input.onchange = input.onmouseout = function () {
								if(input.value!='undefined'&&input.value!=null)
								myDoc.getElementById(id).value = input.value;
								}
						input.setAttribute(classAttName, "hidden maskingFileInputElement")
						container.appendChild(input);
					}
					catch(e){
						top.logException(e,arguments);
					}
				}
				
				
				/*	generateId()
				 * 		
				 * 		Opens file browse dialog for Internet Explorer on XP, 
				 * 		file location is returned.
				 * 
				 * 		return string if file is selected, undefined otherwise
				 */
				function browseForFileIE_XP(){
					var file;
					try {
						var browseDialog = new ActiveXObject("UserAccounts.CommonDialog")
						browseDialog.ShowOpen();
						file = browseDialog.FileName();
					}catch(e){
						top.logException(e,arguments);
					}
					return file;
				}
				
				/*	generateId()
				 * 
				 * 		Opens fiale browse dialog for Mozilla-based browsers, 
				 * 		file location is returned
				 * 
				 * 		return string if file is selected, undefined otherwise
				 */
				function browseForFileMozilla(){
					var file;
					try {
						var browseDialog = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
						browseDialog.init(window, options.title, browseDialog.modeOpen);
						if (browseDialog.show() != browseDialog.returnCancel) 
							file = browseDialog.file.path;
					}catch(e){
						top.logException(e,arguments);
					}
					return file;
				}
				/*	initializeFolderBrowse()
				 * 
				 * 		Opens a file browse dialog and places the returned address into
				 * 		textbox.
				 */
				function initializeFolderBrowse(){
					var myDoc = (top.IS_XUL?get_clp_root_doc():document);
					var brwsBtn = myDoc.getElementById(options.id+"FileInputBrowseButton");
					var textbox = myDoc.getElementById(options.id+"InputTextbox");
					brwsBtn.onclick = function(){
						textbox.value = browseForFolder();
					};
				}
				
				/*	initializeFileBrowse()
				 * 
				 * 		Opens a file browse dialog and places the returned address into
				 * 		textbox.
				 */
				function initializeFileBrowse(){
					var myDoc = (top.IS_XUL?get_clp_root_doc():document);
					var brwsBtn = myDoc.getElementById(options.id+"FileInputBrowseButton");
					var textbox = myDoc.getElementById(options.id+"InputTextbox");
					
					if(top.BROWSER=='IExplore'){
						if(top.OS=='Windows_XP'){
							brwsBtn.onclick = function(){
								var file = browseForFileIE_XP();
								if(typeof file != 'undefined' && file != null && file != '')
									textbox.value = file;
							};
						}else{
							browseForFileHack(options.id)
						}
						
					}else{
						brwsBtn.onclick = function(){
							var file = browseForFileMozilla()
							if(typeof file != 'undefined' && file != null && file != '')
								textbox.value = file;
						};
					}
				}
				
				/*
				 * Create the input=text  and input=button, could just as easily be div's or spans
				 * for buttons.
				 */
				var content = function(){
					var text = document.createElement('div');
					text.innerHTML = options.dialogText;
					//<span id="generateFileInputContainer" class="fileInputContainer">
					var container = document.createElement('span');
					container.id = options.id+"FileInputContainer";
					container.setAttribute(classAttName,"fileInputContainer");
					//<input type="text" id="generatedFileInputTextbox" value="Default Location" class="fileInputElements"/>
					var textbox = document.createElement('input');
					textbox.type="text"
					textbox.id = options.id+"InputTextbox";
					textbox.value = options.defaultLocation;
					textbox.size = 50;
					textbox.setAttribute(classAttName,"fileInputElements");
					//<input type="button" id="generatedFileInputBrowseBtn" name="myBrowseBtn" value="Browse" class="fileInputElements"/>
					var browseButton = document.createElement('input');
					browseButton.type="button"
					browseButton.id = options.id+"FileInputBrowseButton";
					browseButton.name = options.id+"FileInputBrowseButton";
					browseButton.value = property('promptBrowse');
					browseButton.setAttribute(classAttName,"fileInputElements");
					container.appendChild(textbox);
					container.appendChild(browseButton);
					var myDoc = (top.IS_XUL?get_clp_root_doc():document);
					myDoc.getElementById(options.id+'Content').appendChild(text);
					myDoc.getElementById(options.id+'Content').appendChild(container);
					if(options.browseFor=='file')
						initializeFileBrowse();
					else
						initializeFolderBrowse();
				} 
				
				top.showDialog(content,{
						id: options.id,
						title: options.title,
						buttons: [
								{
									id: options.id+"CancelButton",
									name: options.id+"CancelButton",
									value: property('promptCancel'),
									onclick: function(){ top.closeDialog(options.id); },
									enabled: true
								},
								{
									id: options.id+"OKButton",
									name: options.id+"OKButton",
									value: property('promptOK'),
									onclick: function(){ 
										var myDoc = (top.IS_XUL?get_clp_root_doc():document);
										if(options.validationFunction() == true)
											top.inputValue[options.id] = myDoc.getElementById(options.id+"InputTextbox").value
											top.closeDialog(options.id);
											 },
									enabled: true
								}
							]
					})
				
				do{
					threadDelay(1000);
				}while(typeof top.inputValue[options.id] == 'undefined'&&!isIdNamespaceAvaliable(options.id))
			} catch(e) {
		top.logException(e,arguments);
	}
	return top.inputValue[options.id];
}

/*	threadDelay(/int/ delay)
 * 
 * 	Delays the javascript thread for duration specified. 
 * 
 * 	Must be privilaged Mozilla profile or HTA application to use.
 * 
 * 		delay: int	
 */
function threadDelay(delay) {
	try {
		if (top.BROWSER == 'IExplore') {
			try {
				var shell = new ActiveXObject("WScript.Shell")
				rc = shell.run(getEnv('LaunchPadTemp') + "/" + 'sleep.vbs' + " " + delay, 0, true);
			} 
			catch (e) {
			}
		}
		else {
			try {
				var thread = Components.classes["@mozilla.org/thread-manager;1"].getService(Components.interfaces.nsIThreadManager).currentThread;
				
				this.delay = true;
				setTimeout("this.delay = false;", delay);
				while (this.delay) {

					thread.processNextEvent(true);
				}
			} 
			catch (e) {
			}
		}
	} catch(e) {
	top.logException(e,arguments);
	}
}
	
/*	generateId()
 * 
 * 		return string - generatedDialog<#>
 */
function generateId(prependValue){
	/*
	 * Generate a Id to be used for each dialog
	 */
	if(typeof prependValue == 'undefined' || prependValue == null)
		return "generated" + Math.floor(Math.random() * 1001);
	else
		return "generated" + prependValue + Math.floor(Math.random() * 1001);
}

/*	isIdNamespaceAvaliable(/string/ id)
 * 
 * 		id: string
 * 		return boolean - If Id is avaliable for use
 */
function isIdNamespaceAvaliable(id){
		if(id=='undefined'||id==null){
			return false;
		}
		/*
		 * Determine if provided Id is already found on document
		 */
		 var myDoc = (top.IS_XUL? get_clp_root_doc(): document);
		var dialog = myDoc.getElementById(id);
 	if (dialog != null && dialog != 'undefined') 
			return false;
		else
			return true;
}


function isIdeallyFocusable(element){
	var targetElements = ['A', 'BUTTON', 'INPUT', 'LABEL', 'SELECT', 'TEXTAREA'];
	for(var e in targetElements){
			if (element.tagName != null && typeof element.tagName != 'undefined' && element.tagName != 'undefined') {
				if (element.tagName.toLowerCase() == targetElements[e].toLowerCase()) {
					return true;
				}
			}
	}
	return false;
}

function isInherentlyFocusable(element){
	//via msdn 
	//Testing showed BODY & SPAN cannot be disabled without having negative effects
	var targetElements = ['A', 'ABBR', 'ACRONYM', 'ADDRESS', 'APPLET', 'AREA', 'B', 'BDO', 'BIG', 'BLOCKQUOTE',
	/* 'BODY',*/ 'BUTTON', 'CAPTION', 'CENTER', 'CITE', 'CUSTOM', 'DD', 'DEL', 'DFN', 'DIR', 'DL', 'document', 'DT',
	 'EM', 'EMBED', 'FIELDSET', 'FONT', 'FORM', 'FRAME', 'FRAMESET', 'hn', 'HR', 'I', 'IFRAME', 'IMG', 'INPUT',
	 'INS', 'ISINDEX', 'KBD', 'LABEL', 'LEGEND', 'LI', 'LISTING', 'MARQUEE', 'MENU', 'OBJECT', 'OL', 'P',
	 'PLAINTEXT', 'PRE', 'Q', 'RT', 'RUBY', 'S', 'SAMP', 'SELECT', 'SMALL', /*'SPAN',*/ 'STRIKE', 'STRONG', 'SUB',
	 'SUP', 'TABLE', 'TBODY', 'TD', 'TEXTAREA', 'TFOOT', 'TH', 'THEAD', 'TR', 'TT', 'U', 'UL', 'VAR', 'window',
	 'XMP'];
	for(var e in targetElements){
			if (element.tagName != null && typeof element.tagName != 'undefined' && element.tagName != 'undefined') {
				if (element.tagName.toLowerCase() == targetElements[e].toLowerCase()) {
					return true;
				}
			}
	}
	return false;
} 

/* hasTabIndex(element)
 * 		Evaluates the element parameter as whether it has a tab index specified
 * 
 * element: DOMElement
 * 
 * return boolean - true if has tab index
 */
function hasTabIndex(element){
	if (typeof element != 'undefined' && typeof element.tabindex != 'undefined' && element.tabindex != 'undefined')
		return true; 
	else
		return false;
}

/*	isFormElement(/DOMElement/ element)
 * 		Evaluates the element parameter as whether a form element or not
 * 
 * 	element: DOMElement
 * 
 *	return boolean - true if Form element
 */
function isFormElement(element){
	var targetElements = ['button' ,'input', 'select', 'textarea', 'object'];
	for(var e in targetElements){
			if (element.tagName != null && typeof element.tagName != 'undefined' && element.tagName != 'undefined') {
				if (element.tagName.toLowerCase() == targetElements[e].toLowerCase()) {
					return true;
				}
			}
	}
	return false;
}

function isElementDisabled(element){
	if(element.disabled==true)
		return true;
	return false;
}

dialogs = [];
hiddenDialogs = [];
/*	closeDialog(/String/ id)
 * 
 * 	id: string
 * 
 * 	return boolean - if successfully closed specified dialog
 */
function closeDialog(id){
			var myDoc = (top.IS_XUL?get_clp_root_doc():document);
			for(var d in dialogs){
				if(dialogs[d].id==id)
				{
					var dialog = myDoc.getElementById(id);
					if ((dialog != null) && (dialog != 'undefined')) {
						dialog.parentNode.removeChild(dialog);
					}
					
					dialogs.splice(d, 1);
					if(dialogs.length>0)
					{
						myDoc.getElementById(dialogs[dialogs.length-1].id+'MediumZIndex').style.display='block';
						
					}
					else
					{
						// Get around Mozilla limitation that won't let us change the display on an iframe element
						
						if (top.BROWSER != "Mozilla")
							myDoc.getElementById('root').style.display="block";
						myDoc.getElementById('notificationsWrapper').style.display="block";
					}
			return true;
			}
		}
		return false;
	
}



/*	showDialog(/String||<HTMLElement>NodeList||URI||Function/ content, /Object/ options)
 * 
 * 	Displays a dialog based on the parameters; content and options. In the case that a 
 *  function is provided as content, the function will be executed after all other
 *  dialog elements have been created. All options are optional, if not provided defaults
 *  will be used. If no options.title is provided, there will be no title bar; You will be
 *  required to provide a closure for the dialog. 
 * 
 *  content: String ||
 *  		 <HTMLElement>NodeList ||
 *  		 Document ||
 * 			 File URI ||
 * 			 Function
 * 
 * 	*Optional* options: {
 * 				*Optional* title: String,		//Default - Undefined - No title bar will be displayed
 * 				*Optional* id: String,			//Default - generatedDialog<#1-1000>
 * 				*Optional* width: String, 		//Default - 75% - Exploiter specification required to be px
 * 				*Optional* height: String, 		//Default - 75% - Exploiter specification required to be px
 * 				*Optional* buttons: [			//Default - Undefined - no button bar will be displayed
 * 					{ 
 * 					name: String,
 * 					id: String,
 * 					value: String,
 * 					onclick: Function,
 * 					*Optional* enabled: boolean			//Default - true
 * 					}
 * 				]
 * 				*Optional* setFocus: String || Function		//Default - Focuses on first focusable element
 * 				*Optional* onEnd: Function			//Default - Undefined
 * 				}
 *  
 *  return string - dialog id if successful, 'undefined'
 *  ***************************************************************************************
 * 
 *  showDialog(/String/ id, /boolean/ visible)
 *
 *  Does not currently active/deactive focusable elements. Implementation Incomplete
 *  
 *  Displays or hides a existing dialog 
 *  
 *  id: String
 *  visible: boolean
 *  
 *  returns boolean - if successfully displayed specified existing dialog specified by id
 */				
function showDialog(content, options){
	top.logCLPEnter("showDialog", arguments);
		try{
		var dialogTemplate = [];
		var connections = [];
		var styles = [];
		var onEndFunctions = [];
		var disabledElements = [];
		var hiddenElements = [];
		
		if(options === false) {
			return top.closeDialog(content);
		}
		
		/*	hideDialog()
		 * 
		 * 		id: string
		 * 		return boolean - if successfully hide specified dialog
		 */
		function hideDialog(id){
					var myDoc = (top.IS_XUL?get_clp_root_doc():document);
					for(var d in dialogs){
						if(dialogs[d].id==id)
						{
							var dialog = myDoc.getElementById(id);
							if ((dialog != null) && (dialog != 'undefined')) {
								dialog.style.display = 'none';
							}
							var dialogTemplateMediumZIndex = myDoc.getElementById(id+'MediumZIndex');
							if ((dialogTemplateMediumZIndex != null) && (dialogTemplateMediumZIndex != 'undefined')) {
								dialogTemplateMediumZIndex.style.display = 'none';
							}
							
							hiddenDialogs.push(dialogs[d]);
							dialogs.splice(d, 1);
							if(dialogs.length>0)
							{
								myDoc.getElementById(dialogs[dialogs.length-1].id+'MediumZIndex').style.display='block';
								
							}
							myDoc.getElementById(id + 'Span').parentNode.innerHTML=myDoc.getElementById(id + 'Span').parentNode.innerHTML;
					return true;
					}
				}
				return false;
			
		}
		
		/*	displayDialog()
		 * 
		 * 		id: string
		 * 		return boolean - if successfully displayed specified existing dialog
		 */		
		function displayDialog(id){
			var myDoc = (top.IS_XUL?get_clp_root_doc():document);
			for (var d in hiddenDialogs) {
				if (hiddenDialogs[d].id == id) {
					var dialogObject = hiddenDialogs[d];
					var dialog = myDoc.getElementById(id);
					if ((dialog != null) && (dialog != 'undefined')) {
					
						dialog.style.display = 'block';
						var dialogTemplateMediumZIndex = myDoc.getElementById(id + 'MediumZIndex');
						if ((dialogTemplateMediumZIndex != null) && (dialogTemplateMediumZIndex != 'undefined')) {
							dialogTemplateMediumZIndex.style.display = 'block';
						}
						var dialogTemplateHighZIndex = myDoc.getElementById(id + 'HighZIndex');
						if ((dialogTemplateHighZIndex != null) && (dialogTemplateHighZIndex != 'undefined')) {
							dialogTemplateHighZIndex.style.display = 'table';
						}
						if (dialogs.length > 0) {
							myDoc.getElementById(dialogs[dialogs.length - 1].id + 'MediumZIndex').style.display = 'none';
						}
						if (dialogObject.disabledElements != null && dialogObject.disabledElements.length != 'undefined' && dialogObject.disabledElements.length > 0) {
							disableElements(dialogObject.disabledElements, false);
						}
						dialogs.push(hiddenDialogs[d])
					/*	dialogs.push({
							id: id,
							dialogIndex: dialogTemplateHighZIndex.style.zIndex,
							semiTransparentIndex: dialogTemplateMediumZIndex.style.zIndex,
							disabledElements: dialogObject.disabledElements
						});*/
						hiddenDialogs.splice(d, 1);
						return true;
					}
					else {
						return false;
					}
				}
			}
		}
		
		/*	isContentValid()
		 * 
		 * 		return boolean - If content parameter is valid
		 */			
		function isContentValid(){
			//Test if html markup found if so leave alone, 
			return true;
		}
		
		/*	openDialog()
		 * 
		 * 		value: string || html mark-up
		 * 		parm: object
		 * 		return string - dialog id if successful, 'undefined' otherwise
		 */			
		function validCSSMeasurementIndicator(value, parm){

				if((value==null)||(value=='undefined')||(value==null)||(value=='undefined')){
					return false;
				/* Both parms must contain a objects	*
				* 	#EXCEPTION							*/
				}
				//If anything other than numeric values are found...
				if(value.match("\\D")){
					if(value.match("(-|%|em|pt)"))
					{						
						 /* If a negative value, %, em, or pt is found log 	*
						 * problem, will ignore value and use default, auto.*
						 *    #EXCEPTION  									*/
						return false;	
						
					}else if(value.match("px")){
						value=value.substring(0,value.length-2);
						if(parm=='width')
							options.width=value;
						else if(parm=='height')
							options.height=value;
						return true;
					}
					return false;
				}
				return true;
			
		}
		
		/*	isOptionsValid()
		 * 
		 * 		return boolean - If object parameter is valid
		 */
		function isOptionsValid(){
			var rc = true;
				/*
				 * If no options are passed to openDialog(content, {options})
				 * return true! We are not requiring options, defaults for all!
				 */
				if (typeof options == 'undefined' || options == null || options == 'undefined' ) {
					options = {};
				}

				/*
				 * If no id is provided in the options then generate one!
				 * Check if user defined id is already on page return 'undefined'
				 * Check if generated id is already on page, if so, generate a
				 * new one!
				 */
				if (options.id == null || options.id == 'undefined') {
					do {
						options.id = generateId("Dialog")
					}
					while (!isIdNamespaceAvaliable(options.id))
				}else{
					if(!isIdNamespaceAvaliable(options.id))
						rc = false;
				}				/*
				 * Verify width & height were passed as options, if not then use 'auto'
				 * If Found check width & height for numeric values, if not entirely numeric then
				 *   check for valid measurement type at end.
				 */
				if (typeof options.width == 'undefined' || options.width == null || options.width == 'undefined') {
					options.width = '550';
				}else{
					if(!validCSSMeasurementIndicator(options.width,'width'))
						rc = false;
				}
				if (typeof options.height == 'undefined' || options.height == null) {
					options.height = 'auto';
				}else{
					if(!validCSSMeasurementIndicator(options.height,'height'))
						rc = false;
				}
	
				return rc;
		}
		
		/*	initializeZIndexs()
		 * 		Sets the z-index for the dialog with regards to any other dialogs present
		 * 		
		 * 		Dependant on global dialogs[]
		 */		
		function initializeZIndexs(){
			if(dialogs.length>0){
				thisDialogIndex = parseInt(dialogs[dialogs.length-1].dialogIndex)+20;
				thisSemiTransparentIndex = parseInt(dialogs[dialogs.length-1].semiTransparentIndex)+20;
			}
		//	var dialog = dialogTemplate[options.id];
		}

		/*	initializeTitlebar()
		 * 		Retreives elements to be used in the creation of the dialog's titlebar, sets title's text,
		 * 		and configures elements	in DOM
		 */		
		function initializeTitlebar(){
				if (options.title != null && options.title != 'undefined') 
				{
					var dialogInnerContainer = dialogTemplate[options.id+'InnerContainer'];
					var img = dialogTemplate[options.id + 'CloseImg'];
					var imgContainer = dialogTemplate[options.id + 'CloseButtonContainer'];
					var title = dialogTemplate[options.id + 'TitleContainer'];
					var h1 = dialogTemplate[options.id + 'Title'];
					
					h1.innerHTML = options.title;
										
					imgContainer.appendChild(img);
					title.appendChild(imgContainer);
					title.appendChild(h1);
					dialogInnerContainer.appendChild(title);
					
				}
		}

		/*	initializeContent()
		 * 		Retreives elements to be used in the creation of dialog's content 
		 * 		and configures elements	in DOM
		 * 
		 * 		If content is a function then specified function is added to queue to
		 * 		be called at end of dialog creation, if content is a URI then create
		 * 		iFrame for content, otherwise insert content.
		 * 		
		 */	
		function initializeContent(){
				var dialogInnerContainer = dialogTemplate[options.id+'InnerContainer'];
				var dialogContentContainer = dialogTemplate[options.id + 'Content'];

				var height = (options.height == 'auto' || !options.height) ? 'auto' : (options.height - 35/*ButtonBar Height*/ - 40/*Titlebar Height*/ - 10/*Buttonbar padding*/) + "px";
				dialogContentContainer.style.height = height;
				//If we have a html file for content then use iframe
				var RE = (top.OSTYPE=='windows')? new RegExp(/^([a-zA-Z]\:|\\)\\([^\\]+\\)*[^\/:*?"<>|]+(\.(htm(l)?|HTM(L)?))$/) : new RegExp(/^\/{1}(((\/{1}\.{1})?\w+\/?)+(\.(htm(l)?|HTM(L)?)))$/);
				if (typeof content == 'function') {
					onEndFunctions.push(content);
				}else if( typeof content == 'object'){
					dialogContentContainer.appendChild(content);
				}			
				else if (content.match(RE)) {
					var iframe = [{
						type: "iframe",
						id: options.id+"IFrame",
						styles: [{ name: "height", value: "auto"},
								 { name: "height", value: "auto"}],
						attributes: [{ name: "frameborder", value: "0"},
									{ name: "APPLICATION", value: "yes"}],
						src: top.findURL(null, content)			
					}];

					createElements(iframe)
					var dialogContentIFrame = dialogTemplate[options.id+'IFrame'];
					dialogContentContainer.appendChild(dialogContentIFrame);

				}
				else {
					dialogContentContainer.innerHTML = content;
				}
				dialogInnerContainer.appendChild(dialogContentContainer);
				
		}
		

		/*	initializeButtonBar()
		 * 		Retreives elements to be used in the creation of dialog's buttonbar 
		 * 		and configures elements	in DOM
		 */	
		function initializeButtonBar(){
				var dialogInnerContainer = dialogTemplate[options.id+'InnerContainer'];
				var dialogButtonbar = dialogTemplate[options.id + 'ButtonBar'];
				var dialogButtonbarContainer = dialogTemplate[options.id + 'ButtonBarContainer'];
				var myDoc = (top.IS_XUL?get_clp_root_doc():document);
				for (var button in options.buttons) {
					var buttonTemplate = [{ 
						type: "input",
						id: options.buttons[button].id,
						attributes: [
							{ name: "type", value: "button"},
							{ name: "name", value: options.buttons[button].name},
							{ name: "value", value: options.buttons[button].value}
							],
						onclickFx: options.buttons[button].onclick
						}];
					createElements(buttonTemplate);
					var buttonElement = dialogTemplate[options.buttons[button].id];
					/*
					 * Use options.enabled if it is 'true' or 'false' otherwise ignore
					 */
					if (options.buttons[button].enabled != null && options.buttons[button].enabled != 'undefined') {
						if(options.buttons[button].enabled=='false'||options.buttons[button].enabled==false){
							//Create function to disable button after appended to DOM
							// Push this function to the front of onEndFunctions in case exploiter has used
							// a function for content or an additional onEnd function 
							onEndFunctions.unshift(function(){
								if(myDoc.getElementById(options.buttons[button].id) != null&&myDoc.getElementById(options.buttons[button].id) != 'undefined')
									myDoc.getElementById(options.buttons[button].id).setAttribute('disabled', 'true');
							})
						}
					}
					/*
					 * If not options.setFocus is defined then use first button of button bar
					 */
					if ( button == options.buttons-1 && (options.setFocus == null || typeof options.setFocus == 'undefined')){
						options.setFocus = function(){  myDoc.getElementById(options.buttons[button].id).focus(); }
					}
					dialogButtonbar.appendChild(buttonElement);
				}
				dialogButtonbarContainer.appendChild(dialogButtonbar);
				dialogInnerContainer.appendChild(dialogButtonbarContainer);
		}
		
		/*	initializeTemplateNameReplacements()
		 * 		Retreives templated dialog from DOM, copies dialog template, replaces templated ids
		 * 		with generated ids, places elements in dialogTemplate[] for later retrieval.
		 */	
		function initializeTemplateNameReplacements(){
		
				var dialogElementTemplates = [{
					templateName: 'dialogTemplate',
					newName: options.id
				}, {
					templateName: 'dialogTemplateMediumZIndex',
					newName: options.id + 'MediumZIndex'
				}, {
					templateName: 'dialogTemplateHighZIndex',
					newName: options.id + 'HighZIndex'
				}, {
					templateName: 'dialogTemplateSpan',
					newName: options.id + 'Span',
					styles: [{
						name: 'width',
						value: (options.width=='auto')? 'auto': options.width+'px'
					},{
						name: 'height',
						value: (options.height=='auto')? 'auto': options.height+'px'
					}]
				}, {
					templateName: 'dialogTemplateInnerContainer',
					newName: options.id + 'InnerContainer'
				}, {
					templateName: 'dialogTemplateAccessibilityDialogTitle',
					newName: options.id + 'AccessibilityDialogTitle'
				}];
				
			
				var myDoc = (top.IS_XUL?get_clp_root_doc():document);
				var rootElem = myDoc.getElementById(dialogElementTemplates[0].templateName).cloneNode(true);
			
				rootElem.id = dialogElementTemplates[0].newName;
				
				rootElem.innerHTML = myDoc.getElementById(dialogElementTemplates[0].templateName).innerHTML.replace(/dialogTemplate/g,options.id);
				
				//alert("rootElem.innerHTML = " + rootElem.innerHTML);
				if(dialogElementTemplates[0].styles != null&&dialogElementTemplates[0].styles!='undefined'&&dialogElementTemplates[0].styles.length>0){
						var templatedStyles = dialogElementTemplates[0].styles;
						for(var style in templatedStyles){
							styles.push({
								targetId: rootElem.id,
								name: templatedStyles[style].name,
								value: templatedStyles[style].value
							});
						}
				}
				if (dialogElementTemplates[0].onEndFx != null && dialogElementTemplates[0].onEndFx != 'undefined') {
						onEndFunctions.unshift(dialogElementTemplates[0].onEndFx);
				}
				dialogElementTemplates.splice(0,1);
				//replaceElementTemplates(rootElem, dialogElementTemplates  )
				dialogTemplate[rootElem.id]=rootElem;

				myDoc.body.appendChild(dialogTemplate[options.id]);
				
				dialogTemplate[options.id + 'MediumZIndex']=myDoc.getElementById(options.id + 'MediumZIndex');
				dialogTemplate[options.id + 'HighZIndex']=myDoc.getElementById(options.id + 'HighZIndex');
				dialogTemplate[options.id + 'Span']=myDoc.getElementById(options.id + 'Span');
				dialogTemplate[options.id + 'Span'].style.height = (options.height=='auto')? 'auto': options.height+'px';
				dialogTemplate[options.id + 'Span'].style.width = (options.width=='auto')? 'auto': options.width+'px';
				dialogTemplate[options.id + 'InnerContainer']=myDoc.getElementById(options.id + 'InnerContainer');
				
		}	
		
		/*	replaceElementTemplates(/DOMElement/ rootElement, /array/ dialogElementTemplates)
		 * 		Traverses the rootElement recursively looking for matching templates from 
		 * 		dialogElementTemplates. If one is found it replaces element's id with that specified
		 * 		in template. If template is found with style, push that onto global styles for 
		 * 		later implementation. Styles will be added prior to visibility of dialog. A 
		 * 		onEndFx function can be provided to execute after the dialog is visible.
		 * 
		 * 		template = { templateName: <String>originalName, 
		 * 					newName: <String>newName, 
		 * 					*Optional* styles: [{ name: <String>stlyeName, value: <String>styleValue}]},
		 * 					*Optional* onEndFx: <Function>
		 * 
		 * 	rootElement: DOMElement
		 *  dialogElementTemplates: array of templates
		 */	
		function replaceElementTemplates(rootElement, dialogElementTemplates){
			try {
				for (var e in dialogElementTemplates) {
						if (typeof dialogElementTemplates[e] != 'undefined' && typeof dialogElementTemplates[e].templateName != 'undefined' && rootElement.id == dialogElementTemplates[e].templateName) {
							rootElement.id = dialogElementTemplates[e].newName;
							dialogTemplate[rootElement.id] = rootElement;
							if (dialogElementTemplates[e].styles != null && dialogElementTemplates[e].styles != 'undefined' && dialogElementTemplates[e].styles.length > 0) {
								var templatedStyles = dialogElementTemplates[e].styles;
								for (var style in templatedStyles) {
									styles.push({
										targetId: rootElement.id,
										name: templatedStyles[style].name,
										value: templatedStyles[style].value
									});
								}
							}
							if (dialogElementTemplates[e].onEndFx != null && dialogElementTemplates[e].onEndFx != 'undefined') {
								onEndFunctions.unshift(dialogElementTemplates[e].onEndFx);
							}
							dialogElementTemplates.splice(e, 1)
						}
						if (rootElement.hasChildNodes()) {
							var children = rootElement.childNodes;
							for (var c = 0; c < children.length; c++) {
								if(dialogElementTemplates.length>0)
									replaceElementTemplates(children[c], dialogElementTemplates);
							}
						}
				}
			} 
			catch (e) {
				top.logException(e, arguments);
			}
		}
		
		
		/*	initializeNewElements()
		 * 
		 * 		Creates new elements to be used in the dialog from a specified template,
		 * 		places elements in dialogTemplate[] for later retrieval.
		 */
		function initializeNewElements(){
			var width = parseInt(options.width);
			//If browser is IExplorer then take into account margin/padding/border MS box-model
			//Would be nice to get margin/padding/border at onEndFx instead of hardcoded
			//OneUI theme using margin: 12px 20px 12px 12px (take right and left sides = 32px)
			if(top.BROWSER=='IExplore')
				width -= 32;
			width += "px";
			var elementTemplate = [{ 
						type: "div",
						id: options.id + 'TitleContainer',
						classes: [{name: "dialogTitleContainer"}],
						styles: [{
							name: "width",
							value: width
							}]
						},{ 
						type: "h1",
						id: options.id + 'Title'
						},{ 
						type: "a",
						id: options.id + 'CloseButtonContainer',
						classes: [{name: "dialogCloseButtonContainer"}],
						onclickFx: function(){ closeDialog(options.id); },
						onkeydownFx: function(e){ 
							if (!e) var e = window.event;
							if(e.keyCode == 12||e.keyCode == 32)
								closeDialog(options.id);  
							},
						onkeypressFx: function(e){ 
							if (!e) var e = window.event;
							if(e.keyCode == 12||e.keyCode == 32)
								closeDialog(options.id);  
							},
						attributes: [{ name: 'href', value: 'javascript:void 0'},{ name: 'title', value: property('closeDialog')}]
						},{ 
						type: "img",
						id: options.id + 'CloseImg',
						src: findURL(null, property('closeDialogImage', 'close.gif')),
						attributes: [{ name: 'alt', value: property('closeDialog')}]
						},{ 
						type: "div",
						id: options.id + 'Content',
						classes: [{name: "dialogContentContainer"}],
						styles: [{
							name: "width",
							value: width
							}]
						},{ 
						type: "div",
						id: options.id + 'ButtonBarContainer',
						classes: [{name: "dialogButtonBarContainer"}],
						styles: [{
							name: "width",
							value: width
							}]
						},{ 
						type: "div",
						id: options.id + 'ButtonBar',
						classes: [{name: "dialogButtonBar"}]
						}];
				return createElements(elementTemplate);
		}
		/*   createElements(/object/ elementsTemplate)
		 * 		Creates element from template and places elements in dialogTemplate[] for
		 * 		later retrieval. If template is found with style, push that onto global styles for 
		 * 		later implementation. Styles will be added prior to visibility of dialog. A 
		 * 		onEndFx function can be provided to execute after the dialog is visible.
		 * 
		 * 		template = { 
		 *				type: <String>elementType,
		 *				id: <String>elementId,
		 *				*Optional* src: <String>value,
		 *				*Optional* onclickFx: Function,
		 *				*Optional* onkeypressFx: Function,
		 *				*Optional* onkeydownFx: Function,
		 *				*Optional* onEndFx: Function,
		 *				*Optional* classes: [{name: <String>className}],
		 *				*Optional* styles: [{
		 *					name: <String>className,
		 *					value: <String>classValue
		 *					}],
		 *				*Optional* onEndFx: <Function>
		 *				}
		 *
		 *		Crux: Cannot use to create elements with styles after styles have been
		 *		applied; onEnd, onFocus
		 *
		 * 	elementsTemplate: (template)object
		 */
		function createElements(elementsTemplate){
		
			elements = [];
			var myDoc = (top.IS_XUL?get_clp_root_doc():document);
			for(var element in elementsTemplate){
				if((elementsTemplate[element]!=null&&element!='undefined')&&(elementsTemplate[element].id!=null&&elementsTemplate[element].id!='undefined')&&(elementsTemplate[element].type!=null&&elementsTemplate[element].type!='undefined'))
				{
					tempElement = myDoc.createElement(elementsTemplate[element].type);
					tempElement.id = elementsTemplate[element].id;
					//Looking for templated classes
					if(elementsTemplate[element].classes!=null&&elementsTemplate[element].classes!='undefined'&&elementsTemplate[element].classes.length>0)
					{
						var classString = "";
						for(var _class in elementsTemplate[element].classes){
							classString = classString+" "+ elementsTemplate[element].classes[_class].name;
						}		
						tempElement.setAttribute(classAttName,classString);
					}
					//Looking for templated attributes
					if(elementsTemplate[element].attributes!=null&&elementsTemplate[element].attributes!='undefined'&&elementsTemplate[element].attributes.length>0)
					{
						var attributes = elementsTemplate[element].attributes;
						for(var attribute in attributes){
							if( typeof attributes[attribute].name=='string'&&attributes[attribute].value!=null&&attributes[attribute].value!='undefined')
								tempElement.setAttribute(attributes[attribute].name,attributes[attribute].value);
						}		
					}
					//Looking for templated styles
					if(elementsTemplate[element].styles!=null&&elementsTemplate[element].styles!='undefined'&&elementsTemplate[element].styles.length>0)
					{
						var stylesFromTemplate = elementsTemplate[element].styles;
						for(var style in stylesFromTemplate){
								//Add to dialog's style array for later invocation
							styles.push({
								targetId: tempElement.id,
								name: stylesFromTemplate[style].name,
								value: stylesFromTemplate[style].value
							});
						}	
					}
					//Looking for templated src
					if(elementsTemplate[element].src!=null&&elementsTemplate[element].src!='undefined'){
						tempElement.src = elementsTemplate[element].src;
					}
					//Looking for templated onclick function
					if(elementsTemplate[element].onclickFx!=null&&elementsTemplate[element].onclickFx!='undefined'){
						if (typeof elementsTemplate[element].onclickFx == 'string') {
								//Add to dialog's connections array for later invocation
								connections.push({
									id: tempElement.id,
									onclickFx: new Function(tempElement.id+"OnclickFx" ,elementsTemplate[element].onclickFx)
								});
						}
						else 
							if (typeof elementsTemplate[element].onclickFx == 'function') {
								//Add to dialog's connections array for later invocation
								connections.push({
									id: tempElement.id,
									onclickFx: elementsTemplate[element].onclickFx
								});
							}
					}
					//Looking for templated onkeydown function
					if(elementsTemplate[element].onkeydownFx!=null&&elementsTemplate[element].onkeydownFx!='undefined'){
						if (typeof elementsTemplate[element].onkeydownFx == 'string') {
								//Add to dialog's connections array for later invocation
								connections.push({
									id: tempElement.id,
									onkeydownFx: new Function(tempElement.id+"OnkeydownFx" ,elementsTemplate[element].onkeydownFx)
								});
						}
						else 
							if (typeof elementsTemplate[element].onkeydownFx == 'function') {
								//Add to dialog's connections array for later invocation
								connections.push({
									id: tempElement.id,
									onkeydownFx: elementsTemplate[element].onkeydownFx
								});
							}
					}
					//Looking for templated onkeypress function
					if(elementsTemplate[element].onkeypressFx!=null&&elementsTemplate[element].onkeypressFx!='undefined'){
						if (typeof elementsTemplate[element].onkeypressFx == 'string') {
								//Add to dialog's connections array for later invocation
								connections.push({
									id: tempElement.id,
									onkeypressFx: new Function(tempElement.id+"onkeypressFx" ,elementsTemplate[element].onkeypressFx)
								});
						}
						else 
							if (typeof elementsTemplate[element].onkeypressFx == 'function') {
								//Add to dialog's connections array for later invocation
								connections.push({
									id: tempElement.id,
									onkeypressFx: elementsTemplate[element].onkeypressFx
								});
							}
					}
					if (elementsTemplate[element].onEndFx != null && elementsTemplate[element].onEndFx != 'undefined') {
						onEndFunctions.unshift(elementsTemplate[element].onEndFx);
					}
				}
				dialogTemplate[tempElement.id]=tempElement;
				elements[tempElement.id] = tempElement;
			}
			return elements;
		}
		
		/*	initializeConnections()
		 * 		Assigns all connection in gloabl connections
		 * 
		 */
		function initializeConnections(){
			var myDoc = (top.IS_XUL?get_clp_root_doc():document);
			for(var c in connections){
				if (typeof connections[c].id != 'undefined' && connections[c].id != null) {
					if (myDoc.getElementById(connections[c].id) != null && myDoc.getElementById(connections[c].id) != 'undefined') {
						if (typeof connections[c].onclickFx != 'undefined') 
							myDoc.getElementById(connections[c].id).onclick = connections[c].onclickFx;
						if (typeof connections[c].onkeydownFx != 'undefined') 
							myDoc.getElementById(connections[c].id).onkeydown = connections[c].onkeydownFx;
						if (typeof connections[c].onkeypressFx != 'undefined') 
							myDoc.getElementById(connections[c].id).onkeypress = connections[c].onkeypressFx;
					}
				}
			}
		}
		
		/*	initializeStyles()
		 * 		Assigns all styles in gloabl styles
		 */
		function initializeStyles(){
			for(var s in styles){
				createStyle(styles[s]);
			}
		}
		
		/*	createStyle(style)
		 * 		Assigns styles to elements based on a style template
		 * 		
		 * 		Create the cross-browser style implementation as needed!	
		 * 
		 * 		template = { name: <String>stlyeName, value: <String>styleValue }
		 * 
		 * 	style: (template)object
		 */
		function createStyle(style){
			try {
			    var myDoc = (top.IS_XUL?get_clp_root_doc():document);
				if (myDoc.getElementById(style.targetId) != null && myDoc.getElementById(style.targetId) != 'undefined') {
					if (typeof style.value == 'function') 
						style.value = style.value()
					if (style.name == 'width') 
						myDoc.getElementById(style.targetId).style.width = style.value;
					else 
						if (style.name == 'height') 
							myDoc.getElementById(style.targetId).style.height = style.value;
						else 
							if (style.name == 'background-color') 
								myDoc.getElementById(style.targetId).style.backgroundColor = style.value;
					
				}
			} 
			catch (e) {
				top.logException(e, arguments);
			}
		}
		
		/*	initializeOnEndFunctions()
		 * 		Invokes all functions in globabl onEndFunctions and onEnd 
		 * 		if passed in with options
		 */
		function initializeOnEndFunctions(){
			if(typeof options.onEnd == 'function'){
				onEndFunctions.push(options.onEnd);
			}
			for(var fx in onEndFunctions){
				callFunction(onEndFunctions[fx]);
			}
		}
		
		/*	callFunction(fx)
		 * 		Invokes function passed as parameter
		 * 
		 * 	fx: Function
		 */
		function callFunction(fx){
			if (typeof fx == 'string') {
				tFx = new Function(options.id+"onEndFunction"+ Math.floor(Math.random() * 1001) ,fx)
				tFx();
			}else if (typeof fx == 'function') {
				fx();
			}
		}
		
		/*  traverseFrames(container, fx)
		 * 		Recursively drills down all child documents from container calling function passed. Good for uses
		 * 		in which function needs to be called on all frames, including those defined by exploiter
		 * 
		 *	container: Window
		 * 	fx: Function
		 */
		function traverseFrames(container, fx){
			
			if (container.frames.length > 0) {
				var pos = 0;
				do {
					var workingWindow = container.frames[pos];
					if (workingWindow != null && typeof workingWindow != 'undefined' && typeof workingWindow.document != 'undefined') {
						fx(workingWindow);
						if (workingWindow.frames.length > 0) {
							traverseFrames(workingWindow, fx)
						}
					}
					pos++;
				}
				while (pos < container.frames.length)
			}
			
		}
		
		
		/* setFocusToFirstIdeallyFocusableElement()
		 * 
		 * 	Looks at all elements in dialog, provides a determination on the 
		 * 	element being focusable and whether it is the title's close icon
		 *  anchor element, it focuses on the first focusable element found 
		 */
		function setFocusToFirstIdeallyFocusableElement(){
			var myDoc = (top.IS_XUL?get_clp_root_doc():document);
			var dialogTitle = myDoc.getElementById(options.id + 'AccessibilityDialogTitle');
			dialogTitle.focus();
		}
		/* resetCurrentFocus()
		 * 
		 *  Removes focus from caller element or where ever it might be by 
		 *  creating a hidden focusable element, passing focus, and then 
		 *  removing the focused element.		 * 
		 */
		function resetCurrentFocus(){
			var focusableTemplate = [{ 
						type: "a",
						id: options.id+'FocusStealer',
						classes: [{ name: "hidden" }]
						}];
			createElements(focusableTemplate);
			var focusableElement = dialogTemplate[options.id+'FocusStealer'];
			document.body.appendChild(focusableElement);
			focusableElement.focus();
			document.body.removeChild(focusableElement);
					
		}
		/* initializeFocus()
		 * 
		 * 	Sets the Launchpad's focus to the dialog's required element.
		 * 
		 * 	If string is provided for options.setFocus then it is assumed 
		 * 	to be a element id of element to focus
		 * 
		 * 	If function is provided for options.setFocus then it is simply
		 *  ran after all dialog initilization has completed (including 
		 *  onEnd functions).
		 *  
		 *  If no options.setFocus is provided then set focus to what we have 
		 *  determined to be the ideal element inside the dialog. If a 
		 *  button has been specified in options.buttons during the 
		 *  creation of the dialog then the first button defined will 
		 *  take focus. If no button has been specified then focus will
		 *  be given to first focusable element inside the dialog. At no
		 *  point will the title's (if a title is defined) close dialog 
		 *  icon be the defualt for focus.
		 */
		function initializeFocus(){
			var myDoc = (top.IS_XUL?get_clp_root_doc():document);
			var dialogTitle = myDoc.getElementById(options.id + 'AccessibilityDialogTitle');
			dialogTitle.focus();
		}
		
		/*	createDialog()
		 * 
		 * 		return boolean - If dialog was created successfully 
		 */
		function createDialog(){
			
				if (!isContentValid() || !isOptionsValid())
					return false;

				initializeTemplateNameReplacements();
				initializeNewElements();
				initializeZIndexs(); 
				if(typeof options.title != 'undefined')
					initializeTitlebar();
			    initializeContent();
				if(options.buttons!=null&&options.buttons.length>0)
					initializeButtonBar();
				//Cross-browser style assignments must be post DOM append to skip hacks
				initializeStyles();
				
				var myDoc = (top.IS_XUL?get_clp_root_doc():document);
				myDoc.getElementById(options.id).style.display='block';

				//Cross-browser event connection invocation must be post visibile
				initializeConnections();
				
				//Push dialog to list of known visible dialogs
				dialogs.push({
				id: options.id,
				dialogIndex: thisDialogIndex,
				semiTransparentIndex: thisSemiTransparentIndex,
				disabledElements: disabledElements,
				hiddenElements: hiddenElements
				});
				
				initializeOnEndFunctions();
				// Get around Mozilla limitation that won't let us change the display on an iframe element
				var myDoc = (top.IS_XUL?get_clp_root_doc():document);
				if (top.BROWSER != "Mozilla")
					myDoc.getElementById('root').style.display="none";
				myDoc.getElementById('notificationsWrapper').style.display="none";
				initializeFocus();
				
				var dialogTitle = myDoc.getElementById(options.id + 'AccessibilityDialogTitle');
				dialogTitle.innerHTML = property('popupDialog','Popup Dialog Box');
				
				return true;
		}
		
		//Beef of openDialog()
		//If options are true, assume content is actually an id, will validate later and return boolean
		/*	Checking for function usage, showDialog(String id, boolean 'true')
		 * 		if options if found to be true show dialog specified in content (id)
		 *		if options is found to be false hide dialog specified in content (id)*/		

	if(options=='true' || options === true)
			return displayDialog(content);
		else if(options=='false' || options === false)
			return closeDialog(content);
		
	
		var classAttName = (top.BROWSER=='IExplore')? 'className' : 'class';
		var thisDialogIndex = '5000';
		var thisSemiTransparentIndex = '4999';
	
		if (createDialog()) {
			return options.id;
		} else {
			return 'undefined';
		}
	} catch(e) { 
	//alert("show dialog error\n" + e + "\n" + e.message + "\n" + e.stack);
	top.logException(e,arguments); }
}


/*	readXMLFile(options)
 *
 *	Loads a local XML file into XMLDocument DOM object to be used by callback 
 *		parameter provided in options.
 *
 *	*Note* 1-25-10:
 *	Needs test on all browsers and cross-platforms, addition of code from exploiter support request.
 *
 *	options: {
 *		fileName: <String>,		//Ex: "C:\\tmp\\source.xml"
 *								//Following examples will not work: 
 *								//	Bad Ex1: "\\\\networkPath\\source.xml"		Fix? Mount it.
 *								//		NET USE <DriveLetter>: <MountPath> /USER:<User(if required)> <Pass(if required)> /PERSISTENT:NO
 *								//	Bad Ex2: "http:\\\\www.ibm.com\\source.xml" 	Fix? Use AJAX with type text/xml & XMLDocument
 *		callback: Function		// Ex: function(xmlDoc){alert(xmlDoc.documentElement.childNodes.item(0).text);alert(xmlDoc.documentElement.tagName);} 
 *		*optional* srcValidator: Function	//Example provided in code below var srcValidatorFx }
 *
 * //Example call from userExtension.js: 
 * //top.readXMLFile({fileName: "c:\\temp\\source.xml", callback: function(xmlDoc){alert(xmlDoc.documentElement.childNodes.item(0).text);;}}); 
 *	returns undefined;
 */		
		
function readXMLFile(options){
  top.logCLPEnter("readXMLFile", arguments);
	try {
		var source = undefined;
		if (options && options.fileName) 
			source = options.fileName;
		var callee = getFunctionInvocation(arguments);
		var callback = (options && options.callback) ? options.callback : function(){
			top.logMessage("LPV31045S", callee);
		};
		var srcValidatorFx = (options && options.srcValidator)? options.srcValidator: function(source){
			//fileExists does not validate paths starting with 'file://' 
			if (!top.fileExists(source)) {
				top.logMessage("LPV20022S", source);
				callback(undefined);
				return false;
			}else{ 
				return true;
			}
		};
		if (srcValidatorFx(source)){
			//Will need to modify regexp and prepend to accept anything other than local disk URI
			if(!source.match(/file:\\\\/))
				source = 'file:\\\\' + source;
			var xmlDoc = getXMLDocument();
			if (top.BROWSER == 'IExplore') {
				xmlDoc.async = true;	//Mozilla does not provide a similar feature
				xmlDoc.onreadystatechange = function(){
					
					if (xmlDoc.readyState != 4) {
						return false;
					}
					else {
						callback(xmlDoc);
					}
				};
				if (!xmlDoc.load(source)) {
					top.logMessage("LPV20022S", source);
					callback(undefined);
				}
			}
			else {
				xmlDoc.onload = function(){
					callback(xmlDoc);
				};
				xmlDoc.load(source);
				if ("parsererror" == xmlDoc.nodeName) {
					top.logMessage("LPV20022S", source);
					callback(undefined);
				}
			}
		}
	} 
	catch (e) {
		top.logException(e,arguments);
	}
	top.logCLPExit("readXMLFile", arguments);
}	
/*	getXMLDocument()
 * 
 * 	Returns browser's XMLDocument object
 * 
 * 	returns XMLDocument
 */
function getXMLDocument(){
try{
	var xmlDoc = undefined;

	if(top.BROWSER=='IExplore'){
		var names = ["Msxml2.DOMDocument.6.0", "Msxml2.DOMDocument.3.0", "MSXML2.DOMDocument", "MSXML.DOMDocument", "Microsoft.XMLDOM"];
		for (var key in names) {
			try {
				xmlDoc = new ActiveXObject(names[key]);
			} 
			catch (e) {
			}
		}
	}else{
		xmlDoc = document.implementation.createDocument("", "", null);
	}
	return xmlDoc;
	}catch(e){top.logException(e,arguments); }
}

function centerLaunchpadWindow() 
{
	var height = property('launchpadHeight',600);
	var width = property('launchpadWidth',800);
	self.moveTo( (screen.width - width) / 2, (screen.height - height) / 2);
}

function isXpiFile(fileName) {
	return fileName.indexOf(top.CHROMEROOT) > -1;
}
