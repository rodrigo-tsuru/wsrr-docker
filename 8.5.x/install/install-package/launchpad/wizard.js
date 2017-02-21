// Licensed Materials - Property of IBM
// 5648-F10 (C) Copyright International Business Machines Corp. 2008, 2014
// All Rights Reserved
// US Government Users Restricted Rights - Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.
top.navigationHistory = [];
var navOrder;

function enableAccessDefaultWizardAccessKeys(){
    if (top.isDojo())  return;  // hot keys don't work with dojo buttons yet
	
	top.logCLPEnter("enableAccessDefaultWizardAccessKeys", arguments);
	var assignKeysFx = function(){
		top.assignAccessKey({
			id: 'previousButton',
			accessKey: property('previousButtonHotkey',null)
		});
		top.assignAccessKey({
			id: 'nextButton',
			accessKey: property('nextButtonHotkey',null)
		});
		top.assignAccessKey({
			id: 'cancelButton',
			accessKey: property('cancelButtonHotkey',null)
		});
	}
	
	var waitFx = function(){
		//If we do it any earlier than top.footerPropertiesSet then we chance
		//having multiple access keys set since display value might change during jscp
		if (top.footerPropertiesSet != true ) {
			setTimeout(waitFx, 250)
		}
		else {
			assignKeysFx();
		}
	}
	if(isStringTrue(property('enableDefaultAccessKeys',false)))
		waitFx();
		
    top.logCLPExit("enableAccessDefaultWizardAccessKeys", arguments);
}


/*
 * Called when the launchpad is started.  Checks if this is a wizard.  If so, loads the footer and the wizard properties.
 * If not, hides the footer panel and enables side navigation. (Default LP behavior)
 */
function loadDefaultFooter(skipTimeout)
{

  if(!top.navigationLoaded)
  {
    setTimeout("loadDefaultFooter()", 250);
    return;
  }

  if(typeof top.navigationMode != "undefined" && top.navigationMode.toUpperCase() == "WIZARD")
  {
    setFooterProperties(top.navigationReferences.menu['default']);
    enableNavigation(top.startMenu, false);
    enableAndShowNavigationItemsFromProperties();
	enableAccessDefaultWizardAccessKeys();
  }
  else
  {
	showButtons(false);
  }
  top.footerLoaded = true;
}




function isStringTrue(string)
{
  if(string == true) return true;
	if(string == false) return false;
	if(typeof string == "string" && string.toUpperCase() == "TRUE") return true;
	return false;
}

function getBooleanString(string)
{
	return isStringTrue(string)?"true":"false";
}

/*
 * Enables or disables the button with the given id based on the value of enable.
 * @arg button_id the id of the button to enable/disable
 * @arg enable true to enable, false to disable
 */
function enableButton(button_id, enable)
{
  top.logCLPEnter("enableButton", arguments);
  //alert("enableButton "+ button_id + ", "  + enable);
  enable = isStringTrue(enable);
  if (getFooterContentWindow().enableButton) 
	getFooterContentWindow().enableButton(button_id, enable);
   else
  {
	var button = getFooterObj().getElementById(button_id);
	if (button != null) {
		button.disabled = !enable;
	}
  }
  top.logCLPExit("enableButton", arguments);
}

/*
 * Enables or disables all of the wizard buttons.
 * @arg enable true to enable, false to disable
 */
function enableButtons(enable)
{
 // alert("enableButtons");
  
  enable = isStringTrue(enable);
  enableButton('cancelButton', enable);
  enableButton('nextButton', enable);
  enableButton('previousButton', enable);
}

/*
 * Shows or hides the button with the given id based on the value of show.
 * @arg button_id the id of the button to hide/show
 * @arg enable true to show, false to hide
 */
function showButton(button_id, show)
{
  top.logCLPEnter("showButton", arguments);
  show = isStringTrue(show);

  if(show) showButtonBar(true);
//alert("show button : showbutton object: "+ getFooterObj().showButton);
  if (getFooterObj().showButton)
	getFooterObj().showButton(button_id, show);
  else
  {
	var button = getFooterObj().getElementById(button_id);
	if(button != null)
		button.style.display = show ? "inline" : "none";
  }
  
  
  top.logCLPExit("showButton", arguments);
}

/*
 * Shows or hides all of the wizard buttons. 
 * @arg enable true to show, false to hide
 */
function showButtons(show)
{
try {

  //top.logEnter("showButtons", arguments);
  show = isStringTrue(show);
//alert("show buttons = "+ show);
  showButtonBar(show);

  showButton('cancelButton', show);
  showButton('nextButton', show);
  showButton('previousButton', show);
  
  } catch (e) {
    alert("showButtons error "+ e);
  }
  
}


// Because the DOM in an extension is structured differently
// we need to access the footer object in a different manner
// if we are in IE or in Mozilla
function getFooterObj() {
  if (IS_XUL) {
     return document.getElementById("clpbrowser").contentDocument.getElementById("root").contentDocument.getElementById("footer").contentDocument;
  } else {
     return top.root.footer.document;
  }
} // end function getFooterObj()

// Sometimes we want the actual object
function getFooterNotContentDoc() {
  if (IS_XUL) {
     return document.getElementById("clpbrowser").contentDocument.getElementById("root").contentDocument.getElementById("footer");
  } else {
     return top.root.document.getElementById('footer');
  }


} // end function getFooterNotContentDoc()

// Sometimes we want the actual object
function getBannerNotContentDoc() {
  if (IS_XUL) {
     return document.getElementById("clpbrowser").contentDocument.getElementById("root").contentDocument.getElementById("banner");
  } else {
     return top.root.document.getElementById('banner');
  }


} // end 

// Sometimes we want the actual object
function getNavigationNotContentDoc() {
  if (IS_XUL) {
     return document.getElementById("clpbrowser").contentDocument.getElementById("root").contentDocument.getElementById("navigation");
  } else {
     return top.root.document.getElementById('navigation');
  }


} // end function 

function getFooterContentWindow() {
 if (IS_XUL) {
     return document.getElementById("clpbrowser").contentDocument.getElementById("root").contentDocument.getElementById("footer").contentWindow;
  } else {
     //return top.root.document.getElementById('footer');
	 return top.root.footer;
  }
}

function showButtonBar(show)
{
try {
  show = isStringTrue(show);   
  
  var buttonBar = getFooterObj().getElementById('buttonForm');
  //alert("show button bar button bar = "+ buttonBar);
  if(buttonBar != null) {
	if(show) 
		buttonBar.style.display="block";
	else
		buttonBar.style.display="none";
  }
  
  } catch (e) {
    alert("show button bar error " + e);
  }
  
}

/*
 * Sets the text for the given button to the given text.
 * @arg button_id the id of the button to change
 * @arg text the new text for the button to display
 */
function renameButton(button_id, text)
{	
try {
  var getFooterElement = function(button_id){return getFooterObj().getElementById(button_id);}
  var button = getFooterElement(button_id);
  if( button != null) {
  
    if ( button.originalValue) {
  	    if (text !=  button.originalValue) {
			button.value = text;
			button.label = text;
			button.originalValue = undefined;
			top.assignAccessKey({id: button_id, accessKey: property(button_id + 'Hotkey',null)});
		}
	}
	else {
		if (getFooterContentWindow().renameButton)
		{
			getFooterContentWindow().renameButton(button_id, text);
		}
		getFooterElement(button_id).value = text;
		getFooterElement(button_id).label = text;
	}
	getFooterElement(button_id).name = text;
  }
  
  var progressWrapper = getFooterObj().getElementById("progressWrapper");
  if (progressWrapper != null) {
	if (top.isBidiLocale())
		getFooterObj().getElementById("progressWrapper").style.marginLeft = Math.max(10, getFooterObj().getElementById('buttonForm').offsetWidth) +    "px";
	else
		getFooterObj().getElementById("progressWrapper").style.marginRight = Math.max(10, getFooterObj().getElementById('buttonForm').offsetWidth) +    "px";
  }
  
  } catch (e) {
    alert("error rename button " + button_id + "\n" + e);
  }
  
  
  top.logCLPExit("renameButton", arguments);
}

/*
 * Shows or hides a panel entirely.
 * @arg panelId either 'navigation', 'footer', or 'banner'
 * @arg show true to show, false to hide
 */
function showPanel(panelId, show)
{
 top.logCLPEnter("showPanel", arguments); 
 show = isStringTrue(show);


var rootObj = null;
if (top.IS_XUL) {
  rootObj = get_clp_root_obj();
} else {
  rootObj = top.root;
}

  if(panelId == 'navigation')
  {
    if(show)
    {
      var navigationWidth = top.evalJSCP(rootObj.property('navigationWidth', '250'), rootObj);
      getNavigationNotContentDoc().parentNode.cols=navigationWidth + ",*";
       getNavigationNotContentDoc().style.display="block";
    }
    else
    {
       getNavigationNotContentDoc().parentNode.cols="0,*";
       getNavigationNotContentDoc().style.display="none"; //also hides for screen readers
    }
  }
  else if(panelId == 'banner')
  {
    var currentRows = getBannerNotContentDoc().parentNode.rows;
    var rowsArray = currentRows.split(",");

    if(show)
    {
      var bannerHeight = top.evalJSCP(rootObj.property('bannerHeight', '48'), rootObj);
      getBannerNotContentDoc().parentNode.rows=bannerHeight + "," + rowsArray[1] + "," + rowsArray[2] + "," + rowsArray[3];
      getBannerNotContentDoc().style.display="block";
    }
    else
    {
      getBannerNotContentDoc().parentNode.rows="0," + rowsArray[1] + "," + rowsArray[2] + "," + rowsArray[3];
      getBannerNotContentDoc().style.display="none";
    }
  }
  else if(panelId == 'footer')
  {
    var currentRows = getFooterNotContentDoc().parentNode.rows;
    var rowsArray = currentRows.split(",");

    if(show)
    {
      var footerHeight = top.evalJSCP(rootObj.property('footerHeight', '48'), rootObj);
      getFooterNotContentDoc().parentNode.rows=rowsArray[0] + "," + rowsArray[1] + "," + footerHeight + "," + rowsArray[3];
      getFooterNotContentDoc().style.display="block";
    }
    else
    {
      getFooterNotContentDoc().parentNode.rows=rowsArray[0] + "," + rowsArray[1] + ",0," + rowsArray[3];
      getFooterNotContentDoc().style.display="none";
    }
  }
  top.logCLPExit("showPanel", arguments);
}

/*
 * By default, this goes to the next navigation page
 * If the nextAction property has been set for the current menu item, this will override the default behavior
 * However, if the nextAction() function is declared in the html page for this menu item, it will override everything else.
 */
function next()
{
  var contentWindow = getContentWindow();
  if(contentWindow && contentWindow.nextAction) //If nextAction is defined on the content page, executes that action
  {
    contentWindow.nextAction();
    return;
  }

  var actionText = top.navigationReferences[top.navigationCurrent]["nextAction"];
  var nextItem = top.getNextItem(top.navigationCurrent);
  var navOrder = getNavOrder();
  
  if(actionText)
  {
    if(contentWindow) contentWindow.eval(actionText);
    else eval(actionText);
  }
  else if (nextItem)
  {
    var nextItem = top.evalJSCP(nextItem, contentWindow);
    top.navigateTo(nextItem);
  }
  else if (top.navigationCurrent == navOrder[navOrder.length - 1])
  {
    top.Exit(false);
  }
}

/*
 * By default, this goes to the previous navigation page
 * If the previousAction property has been set for the current menu item, this will override the default behavior
 * However, if the previousAction() function is declared in the html page for this menu item, it will override everything else.
 */
function previous()
{
  var contentWindow = getContentWindow();
  if(contentWindow && contentWindow.previousAction) //If previousAction is defined on the content page, executes that action
  {
    contentWindow.previousAction();
    return;
  }
  
  var actionText = top.navigationReferences[top.navigationCurrent]["previousAction"];
  var prevItemPropertyText = top.navigationReferences[top.navigationCurrent]["previousItem"];

  if(actionText)
  {
    if(contentWindow) contentWindow.eval(actionText);
    else eval(actionText);
  }
  else if (prevItemPropertyText)
  {
    var prevItem = top.evalJSCP(prevItemPropertyText, contentWindow);
    top.navigateTo(prevItem);
  }
  else if (top.navigationHistory&&top.navigationHistory.length>1) //navigate to last know position 
  {

		top.navigationHistory.pop();//remove LOQ, currentposition
		var previousPageViewed = top.navigationHistory.pop();//get previous position in history

        top.navigateTo(previousPageViewed.page);  	
  }//Do not believe we should ever get past here if navigationHistory is working properly
  else //Default behavior goes to the previous page in the nav tree
  {
    var navOrder = getWizardNavOrder();
    var found = false;
    for(var i = 0; i < navOrder.length; i++)
    {
      if(navOrder[i] == top.navigationCurrent && i > 0)
      {
        found = true;
        top.navigateTo(navOrder[i-1]);
        break;
      }
    }
    if (!found)
		{
			// If we get here, we're currently sitting on a deactivated nav item. 
			//  Fallback to complete nav order to navigate to the previous item.
			var allNavOrder = getNavOrder();
			var found = false;
			for(var i = 0; i < allNavOrder.length; i++)
			{
				if(allNavOrder[i] == top.navigationCurrent && i > 0)
				{
					top.navigateTo(allNavOrder[i-1]);
					break;
				}
			}
		}
  }
}

/*
 * By default, this exits the launchpad
 * If the cancelAction property has been set for the current menu item, this will override the default behavior
 * However, if the cancelAction() function is declared in the html page for this menu item, it will override everything else.
 */
function cancel()
{  
  var contentWindow = getContentWindow();
  if(contentWindow && contentWindow.cancelAction) //If cancelAction is defined on the content page, executes that action
  {
    contentWindow.cancelAction();
    return;
  }
  
  var actionText = top.navigationReferences[top.navigationCurrent]["cancelAction"];
  if(actionText)
  {
	if(contentWindow) contentWindow.eval(actionText);
    else eval(actionText);
  }
  else
  {
    top.Exit(true);
  }
}

/*
 * This is called when the preloaded page is displayed corresponding to the given menu id.  Called from navigation.html method navigateTo
 * Runs asynchronously; waits for getContentWindow() to have jscp loaded so that footer properties can be evaluated with jscp
 */
function setFooterProperties(menu_id)
{
//alert("setFooterProperties START: " + menu_id);
  var hasWindow = hasContentWindow(menu_id);
  var contentWindow = getContentWindow(menu_id);
  if(hasWindow == null || (hasWindow && !contentWindow))
  {
    setTimeout("setFooterProperties('" + menu_id + "')", 200);   
    return;
  } 

  
  if(typeof top.navigationReferences[menu_id]["nextText"] != "undefined" && top.navigationReferences[menu_id]["nextText"] != null)
  {
    top.renameButton("nextButton", top.evalJSCP(top.navigationReferences[menu_id]["nextText"], contentWindow));
  }
  else
  {
    var navOrder = getNavOrder();
    top.renameButton("nextButton", menu_id == navOrder[navOrder.length - 1] ? property('buttonFinish', 'Finish') : property('buttonNext', property('buttonNext', 'Next'))); //Default is the word Next, except on the last page, where it says Finish
  }
  
  if(typeof top.navigationReferences[menu_id]["previousText"] != "undefined" && top.navigationReferences[menu_id]["previousText"] != null)
  {
    top.renameButton("previousButton", top.evalJSCP(top.navigationReferences[menu_id]["previousText"], contentWindow));
  }
  else
  {
    top.renameButton("previousButton", property('buttonBack', property('buttonPrevious', 'Previous')));
  }
  
  if(typeof top.navigationReferences[menu_id]["cancelText"] != "undefined" && top.navigationReferences[menu_id]["cancelText"] != null)
  {
    top.renameButton("cancelButton", top.evalJSCP(top.navigationReferences[menu_id]["cancelText"], contentWindow));
  }
  else
  {
    top.renameButton("cancelButton", property('buttonCancel', 'Cancel'));
  }
  
  if(typeof top.navigationReferences[menu_id]["helpText"] != "undefined" && top.navigationReferences[menu_id]["helpText"] != null)
  {
    top.renameButton("helpButton", top.evalJSCP(top.navigationReferences[menu_id]["helpText"], contentWindow));
  }
  else
  {
    top.renameButton("helpButton", property('buttonHelp', 'Help'));
  } 
  //alert("setFooterProperties point 2");
  setCustomEnableState('nextButton', 'enableNext', menu_id);
  setCustomEnableState('previousButton', 'enablePrevious', menu_id);
  setCustomEnableState('cancelButton', 'enableCancel', menu_id);
  //setCustomEnableState('helpButton', 'enableHelp', menu_id);
  // By default, previous button on the default menu should be disabled
  if(menu_id == top.navigationReferences.menu['default'] && !top.navigationReferences[menu_id]["enablePrevious"])
  {
    top.enableButton("previousButton", false);
  }
  
  if(top.navigationReferences[menu_id]["showButtons"])
  {
    top.showButtons(top.evalJSCP(top.navigationReferences[menu_id]["showButtons"], contentWindow));
  }
  else
  {
	top.showButtons(true);
  }
  
  if(top.navigationReferences[menu_id]["showNext"])
  {
    top.showButton("nextButton", top.evalJSCP(top.navigationReferences[menu_id]["showNext"], contentWindow));
  }
  
  if(top.navigationReferences[menu_id]["showPrevious"])
  {
    top.showButton("previousButton", top.evalJSCP(top.navigationReferences[menu_id]["showPrevious"], contentWindow));
  }
  
  if(top.navigationReferences[menu_id]["showCancel"])
  {
    top.showButton("cancelButton", top.evalJSCP(top.navigationReferences[menu_id]["showCancel"], contentWindow));
  }

  if(top.navigationReferences[menu_id]["showHelp"])
  {
    top.showButton("helpButton", top.evalJSCP(top.navigationReferences[menu_id]["showHelp"], contentWindow));
  }
  
  if(top.navigationReferences[menu_id]["showProgress"])
  {
    top.showProgress(top.evalJSCP(top.navigationReferences[menu_id]["showProgress"]));
  }

  waitForNextPage(menu_id);
  
  top.footerPropertiesSet = true;
 
}


/*
 * Reads the menu_id[enable] and menu_id[show] properties and changes navigation settings accordingly when the launchpad loads
 * PRE: navOrder array must be built
 * POST: navigation menu will obey properties
 */
function enableAndShowNavigationItemsFromProperties()
{
  var navOrder = getNavOrder();
  for(var i in navOrder)
  {
    var enableText = top.navigationReferences[navOrder[i]]["enable"];
    var showText = top.navigationReferences[navOrder[i]]["show"];
    var activateText = top.navigationReferences[navOrder[i]]["activate"];
    
    if(enableText)
    {
      enableNavigation(navOrder[i], enableText);
    }
    if(showText)
    {
      showNavigation(navOrder[i], showText);
    }
    if (activateText)
    {
      activateNavigation(navOrder[i], activateText);
    }
  }
}

/*
 * Retrieves the navOrder array
 * which contains a linear ordering of the navigation for the wizard
 */
function getNavOrder()
{
	if(!navOrder)
	{
		navOrder = new Array();
		var i = 0;
		for(var obj in top.navigationReferences)
		{
			if(obj != "menu")
			{
				navOrder[i] = obj;
				i++;
			}
		}
	}
	return navOrder;
}

/*
 * Retrieves the linear navigation order taking into account activated and deactivated wizard items.
 */
 function getWizardNavOrder()
{
	var wizardNavOrder = new Array();
	var i = 0;
	for(var obj in top.navigationReferences)
	{
		if(obj != "menu")
		{
			if ((top.navigationDocument.properties[obj]["activate"] == undefined) || isStringTrue(top.evalJSCP(top.navigationDocument.properties[obj]["activate"])))
			{
				wizardNavOrder[i] = obj;
				i++;
			}
		}
	}
return wizardNavOrder;
}

/*
 * Used to hide or show a navigation item
 * @arg menu_id the id of the navigation item to show or hide
 * @arg show true to show, false to hide
 */
function showNavigation(menu_id, show)
{
  top.logCLPEnter("showNavigation", arguments);
  show = isStringTrue(show);
  try 
  {
	var menu_idBlock = menu_id + "Block";
	if(menu_id == top.startMenu) //if menu id is the root, enable or disable all
    {
	  var navOrder = getNavOrder();
      for(var index in navOrder)
      {
        showNavigation(navOrder[index], show);
      }
	  top.logCLPExit("showNavigation", arguments);
      return;
    }
    
    if (!show)
    {
      top.navigationDocument.getElementById(menu_idBlock).style.display="none";
    }
    else
    {
      top.navigationDocument.getElementById(menu_idBlock).style.display="block";
    }
	if(top.navigationDocument.properties[menu_id].order != null)
    {
	  var childItems = getChildMenuItems(menu_id);
      for (var i = 0; i < childItems.length; i++)
      {
        showNavigation(childItems[i], show);
      }
    }
  }
  catch(e)
  { 
    top.logException(e,arguments);
  }
  top.logCLPExit("showNavigation", arguments);
}

/*
 * Used to enable or disable a navigation item
 * @arg menu_id the id of the navigation item to enable or disable
 * @arg enable true to enable, false to disable
 */
function enableNavigation(menu_id, enable)
{
  top.logCLPEnter("enableNavigation", arguments);
  enable = isStringTrue(enable);
  try
  {
	if(menu_id == top.startMenu) //if menu id is the root, enable or disable all
    {
	  var navOrder = getNavOrder();
      for(var index in navOrder)
      {
        enableNavigation(navOrder[index], enable);
      }
	  top.logCLPExit("enableNavigation", arguments);
      return;
    }

	var element = top.navigationDocument.getElementById(menu_id + "Span");
	var menuText = evalJSCP(property(menu_id+"[text]", top.navigationDocument.properties[menu_id]["text"]));
    if (!enable)
    {
      if (!element.enableCursor && element.enableCursor != "")
        element.enableCursor = (element.style.cursor == "") ? "" : element.style.cursor;
      element.style.cursor = 'default';
      element.innerHTML = menuText;
    }
    else 
    {
      if (element.enableCursor)
        element.style.cursor = element.enableCursor;
      else
        element.style.cursor = "hand";
      var anchorContents = '<a class="'+ top.navigationDocument.properties[menu_id].deselectedStyle + '" href="javascript:top.navigateTo(\'' + menu_id  + '\')">' + menuText +'</a>';
      element.innerHTML = anchorContents;
    }
	
    if(top.navigationDocument.properties[menu_id].order != null)
    {
	  var childItems = getChildMenuItems(menu_id);
      for (var i = 0; i < childItems.length; i++)
      {
        enableNavigation(childItems[i], enable);
      }
    }
  }
  catch(e)
  { 
    top.logException(e,arguments);
  }
  top.logCLPExit("enableNavigation", arguments);
}

/*
 * Used to enable or disable a navigation item
 * @arg menu_id the id of the navigation item to enable or disable
 * @arg enable true to enable, false to disable
 */
function activateNavigation(menu_id, activate)
{
  top.navigationDocument.properties[menu_id]["activate"] = getBooleanString(activate);
  if(top.navigationDocument.properties[menu_id].order != null)
  {
	  var childItems = getChildMenuItems(menu_id);
      for (var i = 0; i < childItems.length; i++)
      {
        activateNavigation(childItems[i], activate);
      }
  }
}





/*
* Returns a handle to the contentWindow displayed within the content frame.  If it is not yet loaded,
* this method will return null.  A callback function can be passed to this method which will
* be called once the page has finished loading.
* @arg menu_id the menu id. If this is not set, uses the current content page
* @arg callback the function to execute once the content window has finished loading
*/
function getContentWindow(menu_id, callback)
{

try {
  if(isEssentials())
  {
    return get_clp_root_obj.content;
  }
  
  if(!menu_id)
  {
    menu_id = top.navigationCurrent;
  }
  
  //If all pages are loaded and there is no page for this menu_id, we return null
  var check = hasContentWindow(menu_id);
  if(check != null && check == false) return null;
  var frame = null;
  
     frame = top.preloadDocument.getElementById("frame_" + menu_id);
//  	frame =  top.document.getElementById("root").document.getElementById('preload').document.getElementById("frame_" + menu_id);
  
    
  //If the frame is finished loading, we call the callback function if it is set and return the frame
  if(frame && frame.contentWindow.jscpLoaded)
  {
    if(callback) callback(menu_id, frame);
    return frame.contentWindow;
  }

  //We reach this if the frame is not yet loaded.  If a callback is set, we recurse this function until the page
  //has finished loading, then call the callback function
  if(callback)
  {
    var wrappedCallback = function(){ getContentWindow(menu_id, callback) };
    setTimeout(wrappedCallback, 250);
  }
  } catch (e) { }
  
  
  return null;
}

/* Similar to getContentWindow, but does not return the content window; simply waits for all windows in the menu_ids
 * array to finish loading, then calls the callback function
 */
function waitForContentWindows(menu_ids, callback)
{
  var flag = true;
  for(var i = 0; i < menu_ids.length; i++)
  {
    var id = menu_ids[i];
    var check = hasContentWindow(id);
    if(check != null && check == false) continue; //If there is no page for this menu_id, we do not need to wait for it
     
    var window = getContentWindow(id);
    //If any of these frames are not fully loaded, we do not perform the callback
    if(!window)
    {
      flag = false;
      break;
    }
  }
  if(flag)
  {
    callback();
  }
  else
  {
    var wrappedCallback = function(){ waitForContentWindows(menu_ids, callback) };
    setTimeout(wrappedCallback, 250);
  }
}

/*
 * If there is a next page, this function disables the next button until that page has been loaded, then it defaults
 * to the user's custom setting for nextEnable, or enables the button if none is set
 */
function waitForNextPage(menu_id)
{
  top.enableButton('nextButton', false);
  var nextItem = getNextItem(menu_id);

  if(nextItem)
  {
    //If the next item does not need to load because it is not a content window, we do not need to wait
    if(hasContentWindow(nextItem) != null && hasContentWindow(nextItem) == false)
    {
      setCustomEnableState('nextButton', 'enableNext', menu_id);
    }
    else
    {
      waitForContentWindows(new Array(menu_id, nextItem), function(){ setCustomEnableState('nextButton', 'enableNext', menu_id); });
    }
  }
  else //if there is no next page, we only need to wait for this window
  {
    waitForContentWindows(new Array(menu_id), function(){ setCustomEnableState('nextButton', 'enableNext', menu_id); });
  }
}

/*
 * If a custom nextItem has been set for this menu_id, it will be returned.  If not, the next item in the default order will be returned.
 * If there is no next item or a bad menu_id is given, this will return null.
 */
function getNextItem(menu_id, ignoreCustomValue, window)
{
  var navOrder = getWizardNavOrder();
  if (!menu_id)
    menu_id = top.navigationCurrent;
  if (!window)
    window = top;
  var nextItem = top.navigationReferences[menu_id]["nextItem"];
  var found = false;
  if(ignoreCustomValue || !nextItem)
  {
    for(var i = 0; i < navOrder.length; i++)
    {
      if(navOrder[i] == menu_id)
      {
        nextItem = navOrder[i + 1] ? navOrder[i + 1] : null;
        found = true;
        break;
      }
    }
    if(!found)
    {
      // If we get here, we're currently sitting on a deactivated nav item. 
      //  Fallback to complete nav order to navigate to the next item.
      var allNavOrder = getNavOrder();
      var found = false;
      for(var i = 0; i < allNavOrder.length; i++)
      {
        if(allNavOrder[i] == menu_id)
        {
          while(i < allNavOrder.length - 1)
          {            
            var activateText = top.navigationReferences[navOrder[i + 1]]["activate"];
            if(activateText != null && activateText.toUpperCase() == "FALSE")
            {
              nextItem = null;
              i++;
            }
            else
            {
              nextItem = allNavOrder[i+1];
              break;
            }
          }
          break;
        }
      }
    }
  }
  else
  {
    nextItem = top.evalJSCP(nextItem, window);
  }
  return nextItem;
}

/*
 * Sets the enabled state of a button corresponding to 'buttonId' based on the property menu_id[propertyId]
 * If this property is not set, the button is enabled by default.
 */
function setCustomEnableState(buttonId, propertyId, menu_id)
{// alert("setCustomEnableState");
  if(top.navigationReferences[menu_id][propertyId])
  {
    top.enableButton(buttonId, top.evalJSCP(top.navigationReferences[menu_id][propertyId],top.getContentWindow(menu_id)));
  }
  else
  {
    var enable = true;
    if(top.navigationReferences[menu_id]["enableButtons"])
    {
      enable = top.evalJSCP(top.navigationReferences[menu_id]["enableButtons"], top.getContentWindow(menu_id));
    }

    top.enableButton(buttonId, enable);
  }
}

/*
 * Waits for the page corresponding to menu_id to load if one exists before running the action.
 */
function runAction(menu_id, actionName)
{
  waitForContentWindows(new Array(menu_id), function() { runActionCallback(menu_id, actionName) });
}

/*
 * Executes the specified action for the given menu_id
 */
function runActionCallback(menu_id, actionName)
{
  var currentNavigationContentFrame = top.getContentWindow(menu_id);
  if(currentNavigationContentFrame && currentNavigationContentFrame[actionName])
  {
    currentNavigationContentFrame[actionName]();
  }
  if (top.navigationReferences[menu_id][actionName])
  {
	var context = currentNavigationContentFrame ? currentNavigationContentFrame : top;
    context.eval(top.navigationReferences[menu_id][actionName]);
  }
}

/*
 * Marks the given element with the given css class
 * If that class is already in the class list for the given element, no action is taken.
 * If it is not already in the class list for the given element, it appends it to the end.
 */
function addClass(element, className)
{
  var classArray = element.className.split(" ");
  var alreadyHasClass = false;
  
  for(var obj in classArray)
  {
    if(classArray[obj] == className)
    {
      alreadyHasClass = true;
    }
  }
  if(!alreadyHasClass)
  {
    element.className += " " + className;
  }
}

/*
 * Removes the given class name from the list of classes for element
  @arg element the element object
  @arg className the name of the class to be removed
 */
function removeClass(element, className)
{
  var classArray = element.className.split(" ");
  
  var newClassName = "";
  var multipleElements = false;
  for(var obj in classArray)
  {
    if(classArray[obj] != className)
    {
      newClassName += (multipleElements ? " " : "") + classArray[obj];
      multipleElements = true;
    }
  }
  element.className = newClassName;
}

/*
 * Returns the navigation element's span corresponding to the given menu id.
 * Use this function for setting selected/deselected styles.  These will be 
 * overriden by any styles set explicitly on the anchor.
 */
function getNavigationElementSpan(menu_id)
{


  return top.navigationDocument.getElementById(menu_id + "Span");
}

/*
 * Returns the navigation element's accessibility label corresponding to the given menu id.
 * Use this function for setting the accessibility label for that menu item.
 */
function getNavigationElementAccessibilityLabelElement(menu_id)
{
  return top.navigationDocument.getElementById(menu_id + "AccessibilityLabel");
}

function isMenuItemSubMenu(menu_id)
{
    return top.navigationReferences[menu_id].subMenu;
}

function setAccessibilityLabel(menu_id, label)
{ try {
	var labelElement = getNavigationElementAccessibilityLabelElement(menu_id);
    var newLabel = (isMenuItemSubMenu(menu_id) ? evalJSCP(property('accessibilityLabels[submenu]')):'') + evalJSCP(label);
    labelElement.title = newLabel;
    labelElement.alt = newLabel;
    } catch(e){}
}


//These are the default valid states for a navigation item
var wizardNavStates = ['default', 'error', 'warning', 'complete', 'unvisited', 'incomplete'];
top.wizardNavStates = wizardNavStates;

/*
 * Returns the navigation element corresponding to the given menu id.  Use this function
 * for changing the state.  It will override selected/deselected styles
 */
function getNavigationElementAnchor(menu_id)
{
  return top.navigationDocument.getElementById(menu_id);
}

//These are the default valid states for a navigation item
var wizardNavStates = ['default', 'error', 'warning', 'complete', 'unvisited', 'incomplete'];
top.wizardNavStates = wizardNavStates;

/*
 * Sets the state of the navigation item corresponding to menu_id to the given state.
 *  The state refers to the name of the css class to set the navigation item to.
 */
function setNavigationState(menu_id, state, recursive, accessibilityLabel)
{

  var hasWindow = hasContentWindow(menu_id);
  var contentWindow = getContentWindow(menu_id);
  if(hasWindow == null || (hasWindow && !contentWindow))
  {

    setTimeout("setNavigationState('" + menu_id + "','" + state + "'," + recursive +")", 200);   // NOTE should the 4th arg be included here?
    return;
  }
   top.logCLPEnter("setNavigationState", arguments);

  var navItem = getNavigationElementSpan(menu_id);
  var knownState = false; //Denotes whether the state provided is one of the known states, as listed in the navigationStates array
try {
  // If the state is not specified, use default logic to determine state (look for state property/function for this nav item/document)
  if(!state)
  {
	// Precedence: 
	// contentWindow.state function
	// menu_id[state] property
	// top.navigationState function
	// default: don't modify the state
	if(contentWindow && typeof contentWindow.state == "function")
	{
		state = contentWindow.state(menu_id);
	}
	else if(typeof top.navigationReferences[menu_id]["state"] != "undefined" && top.navigationReferences[menu_id]["state"] != null)
	{
		state = top.evalJSCP(top.navigationReferences[menu_id]["state"], contentWindow);
	}
	else if(typeof top.navigationState == "function")
	{
		state = top.navigationState(menu_id);
	}
  }
 
  // if a function is passed as the state, pass it the menu_id so it can return the state for that menu_id
  else if(typeof state == "function")
  {
	state = state(menu_id);
  }
  } catch (e) { }

  try {
  
  if(state)
  {
	for(var index in wizardNavStates) //Removes any of the other standard states on the nav element before setting its new state
	{
		var wizardState = wizardNavStates[index];
		removeClass(navItem, wizardState);
		if(state == wizardState)
		{
		  knownState = true;
		}
	}

	if(!knownState) //If this is a new state, it is added to the list of distinct states, since the nav item can be in only one state at a time
	{
	  wizardNavStates.push(state);
	}

	addClass(navItem, state);	
	
	if(state != 'unvisited' || top.navigationMode == 'wizard')
		setAccessibilityLabel(menu_id, property('accessibilityLabels[' + state +']', ""));
	else
		setAccessibilityLabel(menu_id, "");
  }
  
    } catch (e) { }
  
  
  
  if(recursive)
  {
	if(top.navigationDocument.properties[menu_id].order != null)
    {
      var childItems = getChildMenuItems(menu_id);
      for (var i = 0; i < childItems.length; i++)
      {
        setNavigationState(childItems[i], state, recursive);
      }
    }
  }
  
  top.logCLPExit("setNavigationState", arguments);
}

/*
 * Sets the state, activation, visibility, and enable properties of the navigation item corresponding to menu_id 
 *  The state refers to the name of the css class to set the navigation item to.
 */
function setNavigationProperties(menu_id, activate, show, enable, state, recursive)
{
  if((enable != undefined) && (enable != null))
  {
    enableNavigation(menu_id, enable);
  }
  if(( show != undefined) && ( show != null))
  {
    showNavigation(menu_id, show);
  }
  if ((activate != undefined) && (activate != null))
  {
  activateNavigation(menu_id, activate);
  }
  if (state)
  {
    setNavigationState(menu_id, state, recursive)
  }
}

/*
 * Returns the child items of menu_id
 */
function getChildMenuItems (menu_id)
{
  var children = new Array();
  for (var i = 0; i < top.navigationDocument.properties[menu_id].order.length; i++)
  {
    children.push(top.navigationDocument.properties[menu_id].order[i]);
  }
  return children;
}

/*
 * Returns if the navigation element corresponding to the given menu id is visible.  
 *  Checks parent if not set for itself.  Returns true if startMenu reached.
 */
function isNavigationVisible (menu_id)
{
	if (menu_id == top.startMenu)
		return true;
	var menu_idBlock = menu_id + "Block";
	var displaystyle = "";
	var menuBlockDiv = top.navigationDocument.getElementById(menu_idBlock);
	// Mozilla/Safari/etc.
	if(window.getComputedStyle)
		displaystyle = window.getComputedStyle(menuBlockDiv,null).display;
	// IE
	else if(menuBlockDiv.currentStyle)
		displaystyle = menuBlockDiv.currentStyle.display;
		
	if (displaystyle == "none")
		return false;
	else
		return isNavigationVisible(navigationReferences[menu_id].parentMenuName);
}

/*
 *  If the preloaded pages have finished loading, this returns whether or not there is a preloaded page corresponding to the given menu_id.
 *  If preload has NOT finished, we have no way of knowing, so this method will simply return null.
 */
function hasContentWindow(menu_id)
{
  if(top.preloadLoaded)
  {
    var element = top.preloadDocument.getElementById("preload_" + menu_id);
    return element != null;
  }
  return null;
}

//------------------------------------ PROGRESS BAR FUNCTIONS-------------------------------------------
var staticProgressBarHeight = '64px';
var progressBars = new Array();
var progressBarOptions = new Array();
top.abortProgress = new Array();

function createProgressBarHTML(dialogId)
{
  return '<div id="' + dialogId + 'progressWrapper" class="navigationMargin buttonsMargin hide progressBarWrapper">' +
    '<div id="frontCap" class="progressBarFrontCap">' +
      '<div id="endCap" class="progressBarEndCap">' +
        '<div id="progressBackground" class="progressBarBackground"> ' +
          '<div id="' + dialogId + 'progressForeground" class="progressBarForeground"></div> ' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div id="' + dialogId + 'progressDialogDescription" class="progressText navigationMargin"></div>' +
  '</div>';
}


/*
 * Shows or hides the progress bar.  Set show=true to show, or false to hide the progress bar.
 * If show is not set, defaults to true.
 */
function showProgress(show, dialogId, options)
{

  top.logCLPEnter("showProgress", arguments);
  options = options || {};
  var defaultOptions = {
    document: document,
    cancel: false
  };
  options = top.launchpad.extend(options, defaultOptions);
  
  if(show == null) show = true;
  show = isStringTrue(show); 

  var dialogTitle = "";
  
  if (dialogId)
  {
    var existingDiv = options.document.getElementById(dialogId);
    if(!show)
    {
      	top.closeDialog(dialogId);
    }
    else if (existingDiv)
    {
      progressBars[dialogId] = existingDiv;
      progressBarOptions[dialogId] = options;
      existingDiv.innerHTML = createProgressBarHTML(dialogId);
    }
    else if (show)
    {
      if (!options.cancel)
       {
      	top.showDialog(createProgressBarHTML(dialogId),{ id: dialogId, title: dialogTitle});
       }
       else
         top.showDialog(createProgressBarHTML(dialogId),{ id: dialogId, title: dialogTitle, buttons: [
         {
           id: dialogId + "CancelButton",
           name: dialogId + "CancelButton",
           value: property('buttonCancel'),
           onclick: function(){ top.abortProgress[dialogId] = true;  top.closeDialog(dialogId); }
         }
       ]});
    }  
  }
  else
  {
    wizard = typeof top.navigationMode != "undefined" && top.navigationMode.toUpperCase() == "WIZARD";
    top.enableButton('nextButton', !show);
    top.enableButton('previousButton', !show);
    
    getFooterNotContentDoc().style.display="block";
  }
  try 
  {
    var progressBar = getProgressBar(dialogId);
    progressBar.style.display = show ? "block" : "none";
    setProgressIndeterminate(dialogId);
	top.logCLPExit("showProgress", arguments);
    return progressBar.id;
  }
  catch(e)
  {
    // Just in case the dialog went away before why try to update it.
  }
  top.logCLPExit("showProgress", arguments);
  return null;
}

function setContent(element, content)
{
	element.innerHTML = content;
}

function getProgressBar(dialogId)
{
//alert("get progress bar: " + dialogId);
  var progressWrapper = null;
  if (dialogId)
	{
    var existingDiv = (progressBars[dialogId])?progressBarOptions[dialogId].document.getElementById(dialogId):null;
    if (existingDiv)
    {
      progressWrapper = progressBarOptions[dialogId].document.getElementById(dialogId + "progressWrapper");
    }
    else
    {
      progressWrapper = document.getElementById(dialogId + "progressWrapper");
    }
	}
  else
  {
    progressWrapper = getFooterObj().getElementById('progressWrapper');
  }
  return progressWrapper;
}

var backgroundColor;
var isIndeterminate = new Array();

function updateProgress(completed, total, dialogId, isLoopingIndeterminate)
{
  try
  {
    if(!total)
    {
      total = 100.0;
    }
    var progressBar = null;
    if (dialogId)
    {
      progressBar = getProgressBar(dialogId).ownerDocument.getElementById( dialogId + "progressForeground");
    }
    else
    {
      if (getFooterContentWindow().dojoUpdateProgress)
	  {
		getFooterContentWindow().dojoUpdateProgress(completed, total);
		return;
	  }		
	  else
		progressBar = getFooterObj().getElementById('progress');
  }
    
    if(!isLoopingIndeterminate)
    {
      isIndeterminate[dialogId?dialogId:'progressWrapper'] = false;
    }

    var percentComplete = Math.round((completed / total) * 100.0);
    percentCompleteString = percentComplete > 100 ? '100%' : percentComplete + '%';

    progressBar.style.width=percentCompleteString;
  }
  catch(e)  // If the progress bar dialog is closed while trying to update the progress, we will get an exception.  Squash it here.
  { 
  }
  
}

function setProgressIndeterminate(dialogId)
{
	if (getFooterContentWindow().dojoSetProgressIndeterminate)
	{
		getFooterContentWindow().dojoSetProgressIndeterminate();
	}		
	else
	{
		var startLoop = function() 
		{
			isIndeterminate[dialogId?dialogId:'progressWrapper'] = true;
			loopIndeterminate(null, dialogId);
		}
		isIndeterminate[dialogId?dialogId:'progressWrapper'] = false;
		setTimeout(startLoop, 50);
	}
}

function setProgressDescription(description, title, dialogId)
{
  if(!description) description = '';
  if(!title) title = '';
  var progressBar = getProgressBar(dialogId);
  if (!progressBar)
    return false;
	
  top.logCLPEnter("setProgressDescription", arguments);
  
  var progressTitle = dialogId?progressBar.ownerDocument.getElementById(dialogId + 'Title'):get_clp_root_doc().getElementById('progressTitle');
  var progressDescription = dialogId?progressBar.ownerDocument.getElementById(dialogId + 'progressDialogDescription'):getFooterObj().getElementById('progressDescription');
  
  var hideTitle = title == '';
  var hideDescription = description == '';
  try
  {
    progressTitle.style.display = hideTitle ? "none" : "block";
  }
  catch (e)
  {
    // standalone progress bars won't have a title.
  }
  if (progressDescription)
    progressDescription.style.display = hideDescription ? "none" : "block";
  
  if(description == '') description = '&nbsp;';
  if(title == '') title = '&nbsp;';

  try
  {
    if(!hideTitle) setContent(progressTitle, title);
  }
  catch (e)
  {
    // standalone progress bars won't have a title.
  }
  
  try
  {
    if(!hideDescription) setContent(progressDescription, description);
  }
  catch (e)
  {
    // If the progress bar is in a disposed dialog, this won't work.
  }
  top.logCLPExit("setProgressDescription", arguments);
}

function loopIndeterminate(percentComplete, dialogId)
{
    if (isIndeterminate[dialogId?dialogId:'progressWrapper'])
    {
        if(!percentComplete)
        {
            percentComplete = 0;
        }
        if(percentComplete == 100)
        {
            percentComplete = 0;
        }    
        top.updateProgress(percentComplete += 1, 100, dialogId, true);
        var callbackString = "";
        if (dialogId && dialogId != "undefined")
            callbackString = "loopIndeterminate(" + percentComplete + ",\"" + dialogId + "\")";
        else
            callbackString = "loopIndeterminate(" + percentComplete + ",null)";
        setTimeout(callbackString, 25);
    }
}
