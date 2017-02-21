// Licensed Materials - Property of IBM
// 5648-F10 (C) Copyright International Business Machines Corp. 2005, 2006, 2014
// All Rights Reserved
// US Government Users Restricted Rights - Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

// Listener function to process events from the browser code.
//
// The browser code adds the element <privilegedActionRequest> to the DOM and
// adds attributes to hold the action name and any parameters
// required.  An event is posted to trigger the listener in the browser code    
// to trigger this listener.

function processPrivilegedRequest(requestEvent) 
{
    Firebug.Console.log("Received request for privileged action from web page");

    var result = null;    
    var action = requestEvent.target.getAttribute("action");
    result = this[action].call(this, requestEvent);

    var doc = requestEvent.target.ownerDocument;
    var responseElement = doc.createElement("privilegedActionResponse");    
    responseElement.setAttribute("action", action);
    responseElement.setAttribute("result", result);    
    doc.documentElement.appendChild(responseElement); 
    var responseEvent = doc.createEvent("HTMLEvents");
    responseEvent.initEvent("privilegedActionResponse", true, false);
    responseElement.dispatchEvent(responseEvent);
}

function extGetFileSize(requestEvent) 
{
	var fileName = requestEvent.target.getAttribute("fileName");	
	try {		
	  var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
	  file.initWithPath(fileName);
	  if (file.exists())
	  {
	    Firebug.Console.log("file size=" + file.fileSize);
		return file.fileSize;
	  }
	  else
	  {
	    Firebug.Console.log(fileName + " does not exist");
			return -1;
		  }
	} catch(e)
	{
	    Firebug.Console.log(e);
	}
	Firebug.Console.log("getFileSize", arguments);
	return -1;
}

// get a list of child files
// securityFcn: function = new Function('return window')
// dir: string - parent directory
// returns: [file name strings]
function extGetFileList(requestEvent) 
{
	var dir = requestEvent.target.getAttribute("dirName");	
	try {
        var nsILocalFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        nsILocalFile.initWithPath(dir);
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
            return JSON.stringify(returnArray);
        }
    } catch(e)
    {
        Firebug.Console.log(e);
    }
    return top.UNDEFINED;
}

//create a directory on the system
//fileName: string - full native file name
//returns:  false if the directory was not created, true otherwise 
function extCreateDirectory(requestEvent)
{
	var dir = requestEvent.target.getAttribute("dirName");	
	var retVal = false;
    try {
        var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(dir);
		file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE , '0600');
		retVal = true;
	} catch(e)
    {
        Firebug.Console.log(e,arguments);
    }	
	return false;
}

//gets the value of an environment variable
//securityFcn: function = new Function('return window')
//anyvar: string - name of variable
//returns: string - value of variable
//       undefined - variable is not defined
function extSecureGetEnv(requestEvent)
{
	var varName = requestEvent.target.getAttribute("varName");	
	try {
		var v = null;
		try {
	    	if ( typeof Components.classes["@mozilla.org/process/environment;1"] != "undefined" )
	        {
	    		var env = Components.classes["@mozilla.org/process/environment;1"].getService(Components.interfaces.nsIEnvironment);
	            v = env.get(varName);
	        }
	    } catch(e)
	    {
	    	Firebug.Console.log("Caught exception:"+e);
	    }
	    try {
	    	if ( v == null )
	        {
	        	var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
	            v = process.getEnvironment(varName);
	        }
	     } catch(e)
	     {
	     }
	    return v;
	 } catch(e)
	 {
	   	Firebug.Console.log("Caught exception:"+e);
	 }
	 return top.UNDEFINED;
}