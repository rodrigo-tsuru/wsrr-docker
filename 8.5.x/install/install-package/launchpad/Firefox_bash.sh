#!/bin/bash
# Licensed Materials - Property of IBM
# 5648-F10 (C) Copyright International Business Machines Corp. 2005, 2007, 2014
# All Rights Reserved
# US Government Users Restricted Rights - Use, duplication or disclosure
# restricted by GSA ADP Schedule Contract with IBM Corp.

if [ -z "$LaunchPadBrowser" ]; then
    \cd ..
    rm -rf $LaunchPadTmpDir
	if [ "$RM_LICENSE" = "true" ];then
	  	if [ -f "$HOME/.firefox-license" ]; then
	  		rm -rf "$HOME/.firefox-license"
	  	fi
	fi
    $installsourcepath/NoBrowser.sh
    exit 1
fi

FirefoxVersion=`firefox -version | awk '{print $3}' | awk -F. '{print $1}'`
if [ $FirefoxVersion -gt 16 ]; then
	RequiresExtension=true
	LaunchPadURL="file://$installsourcepath/Firefox.html";
else
	LaunchPadURL="file://$installsourcepath/Mozilla.html";		
fi 
export LaunchPadURL

[ -f $HOME/.firefox-license ] && ln -sf $HOME/.firefox-license $LaunchPadTmpDir 2>/dev/null
[ -f $HOME/.Xauthority ] && ln -sf $HOME/.Xauthority $LaunchPadTmpDir 2>/dev/null

LaunchPadOS=`uname`; export LaunchPadOS
LaunchPadOSType=unix; export LaunchPadOSType

locale=`$installsourcepath/GetLocale.sh`
[ -n "$LaunchPadLocale" ] || LaunchPadLocale=$locale; export LaunchPadLocale

LaunchPadHOME=$HOME; export LaunchPadHOME
HOME=$LaunchPadTmpDir; export HOME
LaunchPadProfileName=Profile_$$ 

MOZ_NO_REMOTE=1; export MOZ_NO_REMOTE

	userprefpath=$LaunchPadTmpDir/$LaunchPadProfileName; export userprefpath
	mkdir $userprefpath >/dev/null 2>&1
	[ -d $LaunchPadBatchPath/firefox/profile ] && cp -rf $LaunchPadBatchPath/firefox/profile/* $userprefpath
	mkdir $userprefpath/extensions >/dev/null 2>&1
	if [ $RequiresExtension ]; then
		cp -rf $LaunchPadBatchPath/commonlaunchpad@ibm.com* $userprefpath/extensions
	fi	
	echo // >>$userprefpath/prefs.js
	echo // >>$userprefpath/user.js

	"$LaunchPadBrowser" -nosplash -CreateProfile "$LaunchPadProfileName $userprefpath" >/dev/null 2>&1

	#Inlines preferences.sh, which sets up permissions in user.js
	. $LaunchPadBatchPath/preferences.sh
	if [ ! $? -eq 0 ]; then
		source $LaunchPadBatchPath/preferences.sh
  	fi 
	
#Set up a profile to viewing URLs	
LaunchPadViewProfileName=View_Profile_$$
export LaunchPadViewProfileName

	userviewprefpath=$LaunchPadTmpDir/$LaunchPadViewProfileName; export userviewprefpath
	mkdir $userviewprefpath >/dev/null 2>&1
	[ -d $LaunchPadBatchPath/firefox/profile ] && cp -rf $LaunchPadBatchPath/firefox/profile/* $userviewprefpath
	echo // >>$userviewprefpath/prefs.js
	echo // >>$userviewprefpath/user.js

	"$LaunchPadBrowser" -nosplash -CreateProfile "$LaunchPadViewProfileName $userviewprefpath" >/dev/null 2>&1

	#Inlines viewpreferences.sh, which sets up permissions in user.js
	. $LaunchPadBatchPath/viewpreferences.sh
	if [ ! $? -eq 0 ]; then
		source $LaunchPadBatchPath/viewpreferences.sh
  	fi 

	exec /bin/sh -c "trap '' 1
	  if [ $RequiresExtension ]; then
	  	( set -x
	  	\"$LaunchPadBrowser\" -P $LaunchPadProfileName -profile $userprefpath -chrome chrome://commonlaunchpad/content/commonlaunchpad.xul )
	  	return_code=\$?;
	  else
	  	( set -x	  
	  	\"$LaunchPadBrowser\" -P $LaunchPadProfileName -profile $userprefpath $LaunchPadURL )
	    return_code=\$?;
	  fi
	  if [ \$return_code = 1 ]; then
		echo Firefox failed to start.  This may have been caused by a known defect in Firefox.  Attempting to restart Firefox.
		if [ $RequiresExtension ]; then
		  ( set -x
		  \"$LaunchPadBrowser\" -P $LaunchPadProfileName -profile $userprefpath -chrome chrome://commonlaunchpad/content/commonlaunchpad.xul )
		  return_code=\$?;
		else
	  	  ( set -x		
	  	  \"$LaunchPadBrowser\" -P $LaunchPadProfileName -profile $userprefpath $LaunchPadURL )
	      return_code=\$?;
	    fi
		if [ \$return_code = 1 -o \$return_code != 0 ]; then
			$installsourcepath/NoBrowser.sh
		fi 
	  elif [ \$return_code != 0 ]; then
			$installsourcepath/NoBrowser.sh
	  fi 
	  if [ \"\$RM_LICENSE\" = \"true\" ];then
		if [ -f \"\$HOME/.firefox-license\" ]; then
			rm -rf \"\$HOME/.firefox-license\"
		fi
	  fi
	  \cd ..
	  if [ -f \"$LaunchPadTmpDir\"/LaunchPadKeepTemp.txt ]; then
		rm \"$LaunchPadTmpDir\"/LaunchPadKeepTemp.txt
	  else
		rm -rf $LaunchPadTmpDir
	  fi"

 
