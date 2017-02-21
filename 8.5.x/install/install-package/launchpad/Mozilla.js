// Licensed Materials - Property of IBM
// 5648-F10 (C) Copyright International Business Machines Corp. 2005, 2006, 2014
// All Rights Reserved
// US Government Users Restricted Rights - Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

// change the mouse cursor to look busy or normal
// isBusy: boolean
// doc: document reference
// returns: undefined
/*
function busyCursor(isBusy,doc) {
  try {
    try {
        if (typeof doc.body != "undefined" && typeof doc.body.style != "undefined" && typeof doc.body.style.cursor != "undefined") {
            if (isBusy)
                doc.body.style.cursor='wait';
            else
                doc.body.style.cursor='default';
        }
        else if (typeof doc.all != "undefined" && typeof doc.all.length != "undefined") {
            var i;
            for (i=0; i < doc.all.length; i++) {
                if (isBusy)
                    doc.all[i].style.cursor = 'wait';
                else
                    doc.all[i].style.cursor = 'default';
            }
        }
    } catch(e) {}
  } catch(e) { top.logException(e,arguments); }
}
*/

// create a directory on the system
// fileName: string - full native file name
// returns:  false if the directory was not created, true otherwise 
function createDirectory(fileName)
{
    top.logCLPEnter("createDirectory", arguments);
	var retVal = false;
    try {
	    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(fileName);
		file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE , '0600');
		retVal = true;
	} catch(e)
    {
        top.logException(e,arguments);
    }	
	top.logCLPExit("createDirectory", arguments);
	return false;
}

// determine the size of a file
// fileName: string - full native file name
// returns:  size of the file or -1 if the file does not exist.
function getFileSize(fileName)
{
	top.logCLPEnter("getFileSize", arguments);
	fileName = fileName.replace("file://", "");
  fileName = top.getNativeFileName(fileName);
  try {
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
      var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
      file.initWithPath(fileName);
      if (file.exists())
	  {
        top.logCLPExit("getFileSize", arguments);
		return file.fileSize;
	  }
      else
	  {
        top.logCLPExit("getFileSize", arguments);
		return -1;
	  }
  } catch(e)
  {
      top.logException(e,arguments);
  }
	top.logCLPExit("getFileSize", arguments);
	return -1;
}

// determine if the file or folder exists
// fileName: string - full native file name
// shouldIndicateType: boolean - specifies whether to return a simple boolean value, or a truthy value (1 file exists, -1 directory exists, 0 does not exist)
// returns:  false if the file does not exist, true otherwise (or if shouldIndicateType is true, 1 if file exists, -1 directory exists, 0 file does not exist)
function fileExists(fileName, shouldIndicateType)
{
  top.logCLPEnter("fileExists", arguments);
    var retVal = 0;
	
	//This commented-out code functions for URLs on remote systems but not work for local files
	/*try {
		netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
		var xmlReq = new XMLHttpRequest();
		xmlReq.open("GET", fileName, false);
		xmlReq.send(null);
		
		alert(xmlReq.status);
		
		if (xmlReq.status == 200)
			return true;
	} catch(e)
	{
		top.logException(e,arguments);
	}
	return false;*/
	
    try {
	    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(fileName);
        if (file.exists())
			retVal = file.isDirectory()?-1:1;
    } catch(e)
    {
        top.logException(e,arguments);
    }	
	
	if(shouldIndicateType)
	{
		top.logCLPExit("fileExists", arguments);
		return retVal;
	}
	else
	{
	    top.logCLPExit("fileExists", arguments);
		return retVal != 0;
	}
	top.logCLPExit("fileExists", arguments);
	return retVal;
}


// determine if the file exists
// securityFcn: function = new Function('return window')
// fileName: string - full native file name
// returns: boolean
function secureFileExists(securityFcn,fileName,shouldLogException)
{
    try {
        if ( top.isSecure(securityFcn) )
            netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(fileName);
        if ( file.exists() )
            return true;
    } catch(e)
    {
      if(typeof shouldLogException == "undefined" || shouldLogException) top.logException(e,arguments);
    }
    return false;
}

// determine if the directory exists
// securityFcn: function = new Function('return window')
// directory: string - full native directory name
// returns: boolean
function secureDirectoryExists(securityFcn, directory)
{
    var retVal = false;
    try
    {
        if ( top.isSecure(securityFcn) )
        {
            netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");       
            var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
            file.initWithPath(directory);
     
            retVal = secureFileExists(securityFcn, directory) && file.isDirectory(); 
        }
    }
    catch (e)
    {     
        top.logException(e,arguments);
    }

    return retVal;
}

// gets the value of an environment variable
// securityFcn: function = new Function('return window')
// anyvar: string - name of variable
// returns: string - value of variable
//          undefined - variable is not defined
function secureGetEnv(securityFcn,anyvar)
{
    try {
        var v = null;
        try {
            if ( top.isSecure(securityFcn) )
                netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
            if ( typeof Components.classes["@mozilla.org/process/environment;1"] != "undefined" )
            {
                var env = Components.classes["@mozilla.org/process/environment;1"].getService(Components.interfaces.nsIEnvironment); 
                v = env.get(anyvar);
            }
        } catch(e)
        {
        }
        try {
            if ( v == null )
            {
                var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
                v = process.getEnvironment(anyvar);
            }
        } catch(e)
        {
        }
        return v;
    } catch(e)
    {
        top.logException(e,arguments);
    }
    return top.UNDEFINED;
}

// sets the value of an environment variable
// securityFcn: function = new Function('return window')
// anyvar: string - name of variable
// value: string - new value of variable
// returns: boolean - success status
function secureSetEnv(securityFcn,anyvar,value)
{
    try {
        var v;
        if ( top.isSecure(securityFcn) )
            netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        var env = Components.classes["@mozilla.org/process/environment;1"].getService(Components.interfaces.nsIEnvironment); 
        env.set(anyvar,value);
        return secureGetEnv(securityFcn,anyvar) == value;
    } catch(e)
    {
    }
    return false;
}

var elementArray = new Array();

// reenables a document element if the associated process has completed
// element: document element
// returns: undefined
function _enableElement()
{
    try {
        top.enableElement(elementArray.shift(), true);
    } catch(e)
    {
        top.logException(e,arguments);
    }
}

function getEnv(name)
{
	return secureGetEnv(new Function('return window'), name);
}
// executes an arbitrary command
// securityFcn: function = new Function('return window')
// topDir: string - CD mount point
// args: [strings] - command and parameters
// waitBoolean: boolean - foreground or background
// isHidden: boolean - visible window or silent
// element: document element - element to disable while running
// returns: int - return code
function secureRunProgram(securityFcn,topDir,argsIn,waitBoolean,isHidden,element,workingDirectory,callback,timeout,noQuotes)
{
   if(waitBoolean) {
      top.logMessage("LPV31044W", argsIn[0]);
   }

    if (!noQuotes) noQuotes = false
    try {
    	var args = new Array();
        for(var i = 0; i < argsIn.length; i++)
        {
          args[i] = argsIn[i]; //copy the args array
        }
        
        if (typeof waitBoolean == "undefined" || waitBoolean == null) waitBoolean = false; // long running
        if (typeof isHidden == "undefined" || isHidden == null) isHidden = false; // since some things like notepad have to run in visible mode
		if (!timeout) timeout = 5000;

        if ( typeof element != "undefined" && element != null ) {
			top.enableElement(element,false);
		}
		
        args[0] = top.getFullFileName(topDir,args[0]);
        //Since we prefix the command with /bin/bash, we'll almost never get an exception if the program the user
        //wants to run doesn't exist.  So, we have this check just in case.
        if (!programOnPath(securityFcn, args[0]) && !secureFileExists(securityFcn, args[0])) {
          top.logMessage("LPV22041W", args[0]);
        }
		
		if(top.isWindows() && isHidden)
		{
			args = [top.getNativeFileName(getEnv('LaunchPadTemp') + "/" + top.getScriptLauncherExeName())].concat(args);
		}
		else if(top.isWindows() && !isHidden)
		{
			args = ["-v"].concat(args);
			args = [top.getNativeFileName(getEnv('LaunchPadTemp') + "/" + top.getScriptLauncherExeName())].concat(args);
		}

        var processArgs = new Array();
        if ( waitBoolean == true )
		{
            for ( var i=0; i < top.commandForegroundPrefix.length; i++ ) processArgs.push(top.commandForegroundPrefix[i]);
		}
        else
		{
            for ( var i=0; i < top.commandBackgroundPrefix.length; i++ ) processArgs.push(top.commandBackgroundPrefix[i]);
		}
		if(workingDirectory || callback)
		{
			if(top.isWindows())
			{
				if(!isHidden) args = ["-v"].concat(args);
				args = [top.getNativeFileName(getEnv('LaunchPadTemp') + "/" + top.getScriptLauncherExeName())].concat(args);
			}
			if(workingDirectory) {
				args = [top.getNativeFileName(getEnv('LaunchPadTemp') + "/changeDirectory" + (top.isWindows() ? ".bat" : ".sh")), workingDirectory].concat(args);
				if(top.isWindows())  args = [top.getNativeFileName(getEnv('LaunchPadTemp') + "/" + top.getScriptLauncherExeName())].concat(args);
			}
			if(callback) {
				for (var i=0; i < args.length; i++)
				{
					var batchDelimitersRegExp = new RegExp(/[=,\s;]/).test(args[i]);
					if(batchDelimitersRegExp)
					{
					  // our args will get double-quoted later anyway
					  //args[i]='"' + args[i] + '"';
					}	
				}
				args = [top.getNativeFileName(getEnv('LaunchPadTemp') + "/callback" + (top.isWindows() ? ".bat" : ".sh")), top.createCallback(callback,element,timeout)].concat(args);
				if(top.isWindows()) args = [top.getNativeFileName(getEnv('LaunchPadTemp') + "/" + top.getScriptLauncherExeName())].concat(args);
			}
		}
		if (!top.isWindows())
			args = ['unset','MOZ_NO_REMOTE;'].concat(args);  // just in case the program being launched wants to use browsers later
        var commandStr = null;
        if ( waitBoolean == true )
        {
            if ( top.commandForegroundWrapperPrefix != null )
                commandStr = top.commandForegroundWrapperPrefix;
        }
        else
        {
            if ( top.commandBackgroundWrapperPrefix != null )
                commandStr = top.commandBackgroundWrapperPrefix;
        }
        if ( commandStr != null )
        {
            for ( var i=0; i < args.length; i++ )
            {
                var arg = args[i];
                var re = new RegExp(/^[;!@+=%:\\\/\-a-zA-Z0-9_]+$/);
                if ( !re.test(arg) && !noQuotes)
                {
                   arg = addQuotes(arg);
//                    if ( arg.indexOf('"') >= 0 )
//                        arg = "'" + arg + "'";
//                    else
//                        arg = '"' + arg + '"';
                }
                commandStr += ' ' + arg;
            }
            processArgs.push(commandStr);
        }
        else
        {
            for ( var i=0; i < args.length; i++ )
                processArgs.push(args[i]);
        }
        if ( top.isSecure(securityFcn) )
            netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        var FileFactory = new Components.Constructor("@mozilla.org/file/local;1","nsILocalFile","initWithPath");
        var program = new FileFactory(processArgs[0]);
        var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);

        process.init(program);
        processArgs.shift();
		process.run(waitBoolean, processArgs, processArgs.length);
		var rc = waitBoolean ? process.exitValue : 2;
        if (element && !callback)
        {
            if ( waitBoolean || ((typeof process.isRunning != "undefined") && !process.isRunning) )
			{
                top.enableElement(element,true);
			}
            else
            {
                elementArray.push(element);
                setTimeout('_enableElement()',5000);
            }
        }
        return rc;
    } catch(e)
    {
        try { 
			if (element && !callback) 
				top.enableElement(element,true);
		} catch(e2) { };
        top.logException(e,arguments);
    }	
    return top.UNDEFINED;
}



//Determines whether the given file can be found using the path, in case
//the full file name is not used to call runProgram.
//Returns true if the program is found on the path, false otherwise
function programOnPath(securityFcn, name)
{
  if ( top.isSecure(securityFcn) )
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
      
  var userEnvironment = Components.classes["@mozilla.org/process/environment;1"].getService(Components.interfaces.nsIEnvironment);
  var path = userEnvironment.get("PATH");
    
  var foundOnPath = false;
  var paths = path.split(top.isWindows() ? ";" : ":");
    
  for(var i in paths)
  {
	if(top.expandEnv)
	{
		paths[i] = top.expandEnv(paths[i]);
	}
    if(secureFileExists(securityFcn, paths[i] + top.PATHSEPARATOR + name, false))
    {
      foundOnPath = true;
      break;
    }
  }
  return foundOnPath;
}

// Initializes a callback and creates and returns a file that will contain the return code on exit.
// callback: function - the function to call when the batch finishes
// timeout: int - milliseconds to wait between polls to see if the batch file has completed
// returns: string - the path to the file that will contain the return code to be passed to the callback
function createCallback(callback,element,timeout)
{
	top.logCLPEnter("createCallback", arguments);
	netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
	var returnCodeFilePath = top.createTempFile('launchpadExecReturnCode');
	var returnCodeFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
	returnCodeFile.initWithPath(returnCodeFilePath);

	// Setup and start timeout for callback function
	var originalCallback = callback;
	callback = function()
	{
		try
		{
			netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");

			// Create a new instance of returnCodeFile on each recursion, else fileSize doesn't ever change
			var newFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
			newFile.initWithPath(returnCodeFile.path);

			if(newFile.fileSize > 0)
			{
				var returnCode = top.trim(readTextFile(returnCodeFile.path));
				returnCodeFile.remove(false);
				if(element) top.enableElement(element,true);
				originalCallback(returnCode);
			}
			else
			{
				setTimeout(callback,timeout);
			}
		}
		catch(e)
		{
			top.logException(e, arguments);
		}
	};
	setTimeout(callback,timeout);
	top.logCLPExit("createCallback", arguments);
	return returnCodeFile.path;
}

// read an external file
// securityFcn: function = new Function('return window')
// fileName: string - full native file name
// returns: [line strings]
function secureReadTextFile(securityFcn,fileName)
{
    try {
        var fileLines = new Array();
        if ( top.isSecure(securityFcn) )
            netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        var nsILocalFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        nsILocalFile.initWithPath( fileName );
        if ( nsILocalFile.exists() == false )
        {
            top.logMessage("LPV20022S", fileName);
        }
        var nsIFileInputStream = Components.classes["@mozilla.org/network/file-input-stream;1"]
        .createInstance( Components.interfaces.nsIFileInputStream);
        nsIFileInputStream.init( nsILocalFile, 0x01, 00004, null);
        var nsIBinaryInputStream = Components.classes["@mozilla.org/binaryinputstream;1"]
        .createInstance( Components.interfaces.nsIBinaryInputStream);
        nsIBinaryInputStream.setInputStream(nsIFileInputStream);
        var fileContents = top.UTF8toString(nsIBinaryInputStream.readBytes(nsIFileInputStream.available()));

        nsIFileInputStream.close();
        nsIBinaryInputStream.close();
        if (fileContents.length == 0)
          return top.UNDEFINED;
        //Removes BOM characters from the beginning of the file
        if (fileContents.charCodeAt(0) == '65279' || fileContents.charCodeAt(0) == '65534')
        {
            fileContents = fileContents.substring(1,fileContents.length);   
        }
        if (fileContents.length == 0)
          return top.UNDEFINED;
        fileLines = fileContents.split(/\r*\n/);
        if ( fileLines.length > 0 )
            if ( fileLines[fileLines.length-1].length == 0 )
                fileLines.pop();
        return fileLines;
    } catch(e)
    {
        top.logException(e,arguments);
    }
    return top.UNDEFINED;
}

// read an external file
// fileName: string - full native file name 
// returns: string - contents of file if readable, null otherwise
function readTextFile(fileName, encoding)
{
    top.logCLPEnter("readTextFile", arguments);
	try {
        netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        var nsILocalFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        nsILocalFile.initWithPath( fileName );

		// Assume UTF8 if no encoding specified
		if (!encoding) encoding = UTF8;
        if ( nsILocalFile.exists() == false )
        {
            top.logMessage("LPV20022S", fileName);
        }
		var nsIFileInputStream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance( Components.interfaces.nsIFileInputStream);
        nsIFileInputStream.init( nsILocalFile, 0x01, 00004, null);
		
		var fileContents = "";
		try {
			var replacementChar = Components.interfaces.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER;
			var nsIConverterInputStream = Components.classes["@mozilla.org/intl/converter-input-stream;1"]
				.createInstance(Components.interfaces.nsIConverterInputStream);
			nsIConverterInputStream.init(nsIFileInputStream, encoding, 0, replacementChar);

			var str = {};
				while (nsIConverterInputStream.readString(4096, str) != 0) {
				fileContents += str.value;
			}
			
			nsIFileInputStream.close();
			nsIConverterInputStream.close();
		}
		catch(e)
		{
			var nsIBinaryInputStream = Components.classes["@mozilla.org/binaryinputstream;1"]
				.createInstance( Components.interfaces.nsIBinaryInputStream);
			nsIBinaryInputStream.setInputStream(nsIFileInputStream);
			fileContents = top.UTF8toString(nsIBinaryInputStream.readBytes(nsIFileInputStream.available()));

			nsIFileInputStream.close();
			nsIBinaryInputStream.close();
		}

        //Removes BOM characters from the beginning of the file
        if (fileContents.charCodeAt(0) == '65279' || fileContents.charCodeAt(0) == '65534')
        {
            fileContents = fileContents.substring(1,fileContents.length);   
        }
		if (fileContents.charCodeAt(0) == '239' &&  fileContents.charCodeAt(1) == '187' && fileContents.charCodeAt(2) == '191')  //0xEF BB BF
		{
			fileContents = fileContents.substring(3,fileContents.length); 
		}
		top.logCLPExit("readTextFile", arguments);
		return fileContents;
    } catch(e)
    {
       if (e.message.indexOf("0x80004005") >= 0) {
          alert ("found message");
           top.logMessage("LPV20022S", fileName);
       } else {
          top.logException(e,arguments);
       }

    }
	top.logCLPExit("readTextFile", arguments);
    return null;
}

// get a list of child directories
// securityFcn: function = new Function('return window')
// dir: string - parent directory
// returns: [directory name strings]
function secureGetDirectories(securityFcn,dir)
{
    try {
        if ( top.isSecure(securityFcn) )
            netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        var nsILocalFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        nsILocalFile.initWithPath( top.getNativeFileName(dir) );
        if ( nsILocalFile.exists() == true )
        {
            var entries = nsILocalFile.directoryEntries;
            var returnArray = new Array();
            while ( entries.hasMoreElements() )
            {
                var entry = entries.getNext();
                entry.QueryInterface(Components.interfaces.nsIFile);
                if ( entry.leafName != "." && entry.leafName != ".." )
                {
                	//If directory is disconnected or corrupt we want to 
                	//   log it and move on to the next
					try{
					    if ( entry.isDirectory() )
					    {
							returnArray.push(entry.leafName);
					    }
	                } catch(e) 
	                {
	                    top.logException(e,arguments);
	                }
                }
            }
            return returnArray;
        }
    } catch(e)
    {      
        top.logException(e,arguments);
    }
    return top.UNDEFINED;
}

// get a list of child files
// securityFcn: function = new Function('return window')
// dir: string - parent directory
// returns: [file name strings]
function secureGetFiles(securityFcn,dir)
{
    try {
        if ( top.isSecure(securityFcn) )
            netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        var nsILocalFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        nsILocalFile.initWithPath( dir );
        if ( nsILocalFile.exists() == true )
        {
            var entries = nsILocalFile.directoryEntries;
            var returnArray = new Array();
            while ( entries.hasMoreElements() )
            {
                var entry = entries.getNext();
                entry.QueryInterface(Components.interfaces.nsIFile);
                if ( entry.isFile() )
                {
                    returnArray.push(entry.leafName);
                }
            }
            return returnArray;
        }
    } catch(e)
    {
        top.logException(e,arguments);
    }
    return top.UNDEFINED;
}

/*
function setBooleanPreference(s,v) {
  try {
    //netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
    //var prefs = Components.classes["@mozilla.org/preferences-service;1"].createInstance(Components.interfaces.nsIPrefBranch);
    if (prefs.getBoolPref(s) != v) {
    prefs.setBoolPref(s,v);
    }
  } catch(e) { top.logException(e,arguments); }
  return top.UNDEFINED;
}
*/

// exit launchpad
// securityFcn: function = new Function('return window')
// returns: undefined
function secureExit(securityFcn)
{
    try {
        if ( top.isSecure(securityFcn) )
            window.close();
    } catch(e)
    {
        top.logException(e,arguments);
    }
}

top.OPENMODE = 0;
top.SAVEMODE = 1;
// private function for log.html
function chooseFileName(mode,defaultName)
{
    try {
        netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        var nsIFilePicker = Components.interfaces.nsIFilePicker;
        var filePicker = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
        if ( mode == top.SAVEMODE )
            filePicker.init(window, null, nsIFilePicker.modeSave);
        else
            filePicker.init(window, null, nsIFilePicker.modeOpen);
        filePicker.defaultExtension  = defaultName.substring(defaultName.indexOf('.')+1);
        filePicker.defaultString  = defaultName.substring(0,defaultName.indexOf('.'));
        filePicker.appendFilters(nsIFilePicker.filterText);
        if ( filePicker.show() != nsIFilePicker.returnCancel )
        {
            return filePicker.file;
        }
    } catch(e)
    {
        top.logException(e,arguments);
    }
    return null;
}

// private function for log.html
// write an external file
// securityFcn: function = new Function('return window')
// fileName: string - full native file name
// lines: array of text lines
// returns: true of written, null if no file given, and UNDEFINED if exception
function secureWriteTextFile(securityFcn,nsILocalFile,lines)
{
    try {
        if ( nsILocalFile == null ) return null;
        if ( top.isSecure(securityFcn) )
            netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        var nsIFileOutputStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
        .createInstance( Components.interfaces.nsIFileOutputStream);
        nsIFileOutputStream.init( nsILocalFile, 0x40|0x20|0x08|0x02, 00004, null);
        for ( var i=0; i < lines.length; i++ )
        {
            var len = lines[i].length;
            var outlen = 0;
            while ( outlen < len )
                outlen += nsIFileOutputStream.write(lines[i].substring(outlen,len), len-outlen);
            if ( top.OSTYPE == "windows" )
            {            
                nsIFileOutputStream.write("\r", 1);
            }
            nsIFileOutputStream.write("\n", 1);
        }
        nsIFileOutputStream.flush();
        nsIFileOutputStream.close();
        return true;
    } catch(e)
    {
        top.logException(e,arguments);
    }
    return top.UNDEFINED;
}

// write a text file
// fileName: string - full native file name
// textToWrite:  string - content of text file
// append: boolean - true = append text to end of file,  false = overwrite existing file
// returns: true if file was written successfully, false otherwise
function writeTextFile(fileName, textToWrite, append, encoding)
{
	top.logCLPEnter("writeTextFile", arguments);
    try {
		netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        var nsILocalFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        nsILocalFile.initWithPath( fileName );

		if (!encoding) encoding = UTF8;
		
		var nsIFileOutputStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
        .createInstance( Components.interfaces.nsIFileOutputStream);
        var rwtflags = append?0x40|0x10|0x08|0x02 : 0x40|0x20|0x08|0x02;  // 0x20 is the truncate option 0x10 is to append
		nsIFileOutputStream.init( nsILocalFile, rwtflags, 00604, null);
		
		/*var nsIConverterOutputStream = Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(Components.interfaces.nsIConverterOutputStream);
		nsIConverterOutputStream.init(nsIFileOutputStream, charset, 4096, 0x0000); // 4096 is the buffer size
		nsIConverterOutputStream.writeString(textToWrite, textToWrite.length);
		nsIConverterOutputStream.flush();
		nsIFileOutputStream.flush();
		nsIConverterOutputStream.close();
		nsIFileOutputStream.close();*/
		var nsIScriptableUnicodeConverter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
                          .createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
		nsIScriptableUnicodeConverter.charset =  encoding;
		
		var convertedtext = nsIScriptableUnicodeConverter.ConvertFromUnicode(textToWrite);
		nsIFileOutputStream.write(convertedtext, convertedtext.length);
		convertedtext = nsIScriptableUnicodeConverter.Finish();
		if (convertedtext.length > 0)
			nsIFileOutputStream.write(convertedtext, convertedtext.length);
		nsIFileOutputStream.close();
		top.logCLPExit("writeTextFile", arguments);
		return true;
    } catch(e)
    {
        top.logException(e,arguments);
    }
	top.logCLPExit("writeTextFile", arguments);
    return false;
}

// write a binary file
// fileName: string - full native file name
// fileContents:  string - hexadecimal representation of binary file
// returns: true if file written successfully.  Undefined otherwise.
function writeBinaryFile(fileName, data)
{
	top.logCLPEnter("writeBinaryFile", arguments);
	var byteArray = top.convertHexStringToByteArray(data);
	fileName = top.getNativeFileName(fileName);
	netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
	var nsILocalFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
	nsILocalFile.initWithPath(fileName);
	top.createDirectory(nsILocalFile.parent.path);
    
	try 
	{
        if ( nsILocalFile == null ) return null;
        netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
		var nsIFileOutputStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance( Components.interfaces.nsIFileOutputStream);
		nsIFileOutputStream.init( nsILocalFile, 0x40|0x20|0x08|0x02, 00004, null);
		var nsIBinaryOutputStream = Components.classes["@mozilla.org/binaryoutputstream;1"].createInstance( Components.interfaces.nsIBinaryOutputStream);
		nsIBinaryOutputStream.setOutputStream(nsIFileOutputStream);
		nsIBinaryOutputStream.writeByteArray(byteArray, byteArray.length);
        nsIFileOutputStream.flush();
        nsIFileOutputStream.close();
		top.logCLPExit("writeBinaryFile", arguments);
        return true;
    } catch(e)
    {
        top.logException(e,arguments);
    }
	top.logCLPExit("writeBinaryFile", arguments);
    return top.UNDEFINED;
}

// Check to see if launchpad has internet access
// url: string - URL to test internet connection with
// checkIfValid: boolean (optional) Also checks that the file is valid (i.e., HTTP code 200)
// returnFileSize: boolean (optional) Returns the file size if 
// returns: true if internet available.  false otherwise.
function hasInternetAccess(url, checkIfValid, returnFileSize)
{
  if (!url)
    url = top.secureGetEnv(new Function('return window'), "LaunchPadInternetAccessURL");
  if (!url)
    url = top.property("LaunchPadInternetAccessURL", "http://www.ibm.com");
  if (!(url.indexOf("http://") > -1) && !(url.indexOf("https://") > -1) && !(url.indexOf("ftp://") > -1))
  {
    return returnFileSize?getFileSize(url):true;
  }
  netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
  netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
  var http = new XMLHttpRequest();     

  http.open('HEAD', url, false);
  try
  {
    http.send(null);
    if (returnFileSize)
    {
      if (http.getResponseHeader('Content-Length'))  //mozilla returns a non-existent header as null
        return (http.status == 200)?http.getResponseHeader('Content-Length'):0;
      else
        return (http.status == 200)?-1:0;
    }
    if (checkIfValid)
      return (http.status == 200);
    else
      return true;
  }  
  catch (e)
  {}
  return returnFileSize?0:false;
}

// Retrive a remote binary file
// urlToFile: string - URL to remote file
// localFileName:  string - local filename to which it will be written to
// execute: boolean - attempt to execute the file just downloaded
// returns: true if file written successfully.  Undefined otherwise.
function getRemoteFile(urlToFile, localFileName, execute)
{
  top.logCLPEnter("getRemoteFile", arguments);
  var downloadComplete = false;
  var intervalPoll;
  var webBrowser;
  top.abortProgress[urlToFile] = false;
  if (urlToFile)
	{
      if (!localFileName)
      {
        localFileName = top.getNativeFileName(top.getEnv('LaunchPadTemp') + urlToFile.substring(urlToFile.lastIndexOf("/"), urlToFile.length));
      }
      try 
      {
      var pollAborted = function ()
      {
        if (top.abortProgress[urlToFile])
        {
          clearInterval(intervalPoll);
          try 
          {
            netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
            webBrowser.cancelSave();
            var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);  
            file.initWithPath(top.getNativeFileName(localFileName)); 
            file.remove(false);
          }
          catch (e)
          {
            top.logException(e,arguments);
          }
        }
        if (downloadComplete)
          clearInterval(intervalPoll);
      }
      
      netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
			var bytesdownloaded = -1;
      var totalbytes = -1;
      var http = new XMLHttpRequest();
      http.open('HEAD', urlToFile, false);
      http.send(null);
      totalbytes = http.getResponseHeader('Content-Length');

			var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);  
			file.initWithPath(top.getNativeFileName(localFileName));  
			webBrowser = Components.classes['@mozilla.org/embedding/browser/nsWebBrowserPersist;1'].createInstance(Components.interfaces.nsIWebBrowserPersist);  
			var ioService = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService);  
			var uri = ioService.newURI(urlToFile, null, null);  
			webBrowser.persistFlags &= ~Components.interfaces.nsIWebBrowserPersist.PERSIST_FLAGS_NO_CONVERSION;
			webBrowser.progressListener = {
        onStateChange: function(progress, request, status, message) {
          if (status & Components.interfaces.nsIWebProgressListener.STATE_STOP)
          {
            top.setFileExecutable(top.getNativeFileName(localFileName));
            top.updateProgress(100, 100, urlToFile);
            top.setProgressDescription(property('downloadComplete'), property('downloadComplete'), urlToFile);
            setTimeout("top.showProgress(false, '" + urlToFile + "' );", 1000);
            if (execute && !top.abortProgress[urlToFile])
            {
              top.setFileExecutable(localFileName);
              var args = new Array();
              args[0] = localFileName;
              top.runProgram(NO_DISKID,args,BACKGROUND,VISIBLE);
            }
            downloadComplete = true;
			top.logCLPExit("getRemoteFile", arguments);
            return true;
          }
        }
      }
      intervalPoll = setInterval(pollAborted, 250);
      top.showProgress(true, urlToFile, {cancel:true});
      top.setProgressDescription(top.formatmsg(property('downloadingBytes'), totalbytes), property('updateDownloadingTitle'), urlToFile);
      webBrowser.saveURI(uri, null, null, null, null, file);
		} catch(e)
		{
			top.logException(e,arguments);
      		top.showProgress(false, urlToFile );
		}
	}
	top.logCLPExit("getRemoteFile", arguments);
	return top.UNDEFINED;
}

netscape.security.PrivilegeManager.enablePrivilege('UniversalBrowserWrite');

if ( secureGetEnv(new Function('return window'), "LaunchPadToolbarEnable" ) !='true' )
{
    window.locationbar.visible = false;
    window.menubar.visible = false;
    window.personalbar.visible = false;
    window.scrollbars.visible = false;
    window.statusbar.visible = false;
    window.toolbar.visible = false;
}

/*
    var query = top.document.location.search;
    if (query.length > 1) {
        query = query.substring(1);
        var tokens = query.split(",");
        for (var q=0; q < tokens.length; q++) {
            var keyvalue = tokens[q].split("=");
            if (keyvalue[0].length > 0) {
                if (keyvalue[1].length > 0) {
            var envVarOverride = unescape(keyvalue[0]).toUpperCase();
            if (envVarOverride == "LOCALE")
            top.LOCALE = unescape(keyvalue[1]);
            if (envVarOverride == "CONTENTDIR")
            top.CONTENTDIR = unescape(keyvalue[1]);
            if (envVarOverride == "OSTYPE")
            top.OSTYPE = unescape(keyvalue[1]);
            if (envVarOverride == "OS")
            top.OS = unescape(keyvalue[1]);
        }
            }
        }
    }
*/

// Init log filter now that we have access to env vars
logInitFilter();

//The reason for modifying the locale we're passed is that we haven't yet 
//been able to map it using the locale mapping mechanism.  So we might
//receive "en_us" but it will eventually be resolved to "en"  For now, we just 
//assume that we don't need a regional dialect and just use the base language.
//If this assumption is in correct, the proper locale/global properites will be loaded
//in Mozilla/IExplore.html
if (typeof top.LOCALE == "undefined" || top.LOCALE == null)
    {    
      top.LOCALE = top.trim(secureGetEnv(new Function('return window'), "LaunchPadLocale" ));
      if (top.LOCALE.length > 2 && top.LOCALE.toLowerCase() != "pt_br" && top.LOCALE.toLowerCase() != "zh_tw") 
      {          
          top.LOCALE = top.LOCALE.substring(0,2);
      }
      if (top.LOCALE == "pt_br") 
      {
          top.LOCALE = "pt_BR";
      }
      if (top.LOCALE == "zh_tw") 
      {
          top.LOCALE = "zh_TW";
      }
    }
if (top.LOCALE == null) top.LOCALE = "en";

if ( typeof top.OSTYPE == "undefined" || top.OSTYPE == null ) top.OSTYPE = secureGetEnv(new Function('return window'), "LaunchPadOSType" );

if ( typeof top.OS == "undefined" || top.OS == null ) top.OS = secureGetEnv(new Function('return window'), "LaunchPadOS" );

top.ARCHITECTURE = secureGetEnv(new Function('return window'), "LaunchPadArch");

//Set the target OS/Arch variables    
top.TARGETOS = secureGetEnv(new Function('return window'), "LaunchPadTargetOS");
if (top.TARGETOS == "")
{
top.TARGETOS = top.OS;
}
top.TARGETOSTYPE = secureGetEnv(new Function('return window'), "LaunchPadTargetOSType");
if (top.TARGETOSTYPE == "") 
{
  top.TARGETOSTYPE = top.OSTYPE;
}
top.TARGETARCHITECTURE = secureGetEnv(new Function('return window'), "LaunchPadTargetArch");
if (top.TARGETARCHITECTURE == "") 
{
  top.TARGETARCHITECTURE = top.ARCHITECTURE;
}

if (navigator.userAgent.indexOf('Firefox') != -1)
{
  top.BROWSER = "Firefox";
}
else if (navigator.userAgent.indexOf('SeaMonkey') != -1)
{
  top.BROWSER = "SeaMonkey";
}
else
{
  top.BROWSER = "Mozilla";
}

top.PATHSEPARATOR = top.getNativeFileSeparator();
top.STARTINGDIR = top.getStartingTopDir();
//    top.RELATIVEDIR = top.getStartingRelativeDir();

top.CONTENTDIR = secureGetEnv(new Function('return window'), "LaunchPadContentDirectory" );
top.SKINDIR = secureGetEnv(new Function('return window'), "LaunchPadSkinDirectory" );
top.STARTPAGE = secureGetEnv(new Function('return window'), "LaunchPadStartPage" );
top.COMPATIBILITYVERSION = secureGetEnv(new Function('return window'), "LaunchPadCompatibilityVersion" );
top.VIEWERPATH = secureGetEnv(new Function('return window'), "LaunchPadBrowser" );

top.commandBackgroundPrefix = [];
top.commandForegroundPrefix = []; 
// Wrappering is when the command needs to be sent as a single string instead of parsed arguments
// null means that it should be sent as parsed arguments
top.commandBackgroundWrapperPrefix = null;
top.commandForegroundWrapperPrefix = null;
if ( top.OSTYPE == "windows" )
{
    try {
        top.LaunchPadUSERPROFILE = secureGetEnv(new Function('return window'), "LaunchPadUSERPROFILE" );
        var profileOK;
        if ( typeof top.LaunchPadUSERPROFILE == "string" && top.LaunchPadUSERPROFILE != '' )
            profileOK = secureSetEnv(new Function('return window'), "USERPROFILE", top.LaunchPadUSERPROFILE);
        else
            profileOK = true;
        if ( !profileOK || !secureSetEnv(new Function('return window'), "MOZ_NO_REMOTE", '') )
        {
            top.COMSPEC = secureGetEnv(new Function('return window'), "ComSpec" );
            if ( typeof top.COMSPEC == "string" && top.COMSPEC != '' )
            {
                if ( !profileOK )
                    top.commandForegroundPrefix = [top.COMSPEC,"/c","set USERPROFILE="+top.LaunchPadUSERPROFILE,"&&","set MOZ_NO_REMOTE=&&"];
                else
                {
                    top.commandForegroundPrefix = [top.COMSPEC,"/c","set MOZ_NO_REMOTE=&&"];
                }
                top.commandBackgroundPrefix = top.commandForegroundPrefix;
            }
        }
    } 
    catch(e)
    {
    }    
    if ( typeof top.CURRENTPROFILE == "string" )
        secureRunProgram(new Function('return window'),top.STARTINGDIR,[top.RELATIVEDIR+top.getScriptLauncherExeName(),top.RELATIVEDIR+'MozillaPatch.bat',top.CURRENTPROFILE],false,true);
}
else if ( top.OSTYPE == "unix" )
{
    top.LaunchPadHOME = secureGetEnv(new Function('return window'), "LaunchPadHOME" );
    secureSetEnv(new Function('return window'), "LOGNAME", secureGetEnv(new Function('return window'), "LaunchPadLogName" ));

    if ( typeof top.LaunchPadHOME == "string" ) try
    {
        top.SHELL = secureGetEnv(new Function('return window'), "SHELL" );
        if ( typeof top.SHELL != "string" ) top.SHELL = "/bin/sh";
        top.commandForegroundPrefix = [top.SHELL,"-c"];
        top.commandBackgroundPrefix = top.commandForegroundPrefix;
        if ( secureSetEnv(new Function('return window'), "HOME", top.LaunchPadHOME) )
            top.commandForegroundWrapperPrefix = "";
        else
            top.commandForegroundWrapperPrefix = "HOME="+top.LaunchPadHOME;
        top.commandBackgroundWrapperPrefix = top.commandForegroundWrapperPrefix;
    }
    catch(e)
    {
    }
}

