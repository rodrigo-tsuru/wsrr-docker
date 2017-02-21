#!/bin/sh
# Licensed Materials - Property of IBM
# 5648-F10 (C) Copyright International Business Machines Corp. 2010
# All Rights Reserved
# US Government Users Restricted Rights - Use, duplication or disclosure
# restricted by GSA ADP Schedule Contract with IBM Corp.



foundJava='false'
tempJavaVersionFile=/tmp/clp_java_version.txt

localJava=`eval "which java" 2> /dev/null`;
isJava=`expr match "$localJava" ".*java$"`

if [ $isJava -gt 0 ] ; then
   $localJava -version > $tempJavaVersionFile 2>&1

   javaVersion20=`grep -c "2\.0" $tempJavaVersionFile`
   javaVersion19=`grep -c "1\.9" $tempJavaVersionFile`
   javaVersion18=`grep -c "1\.8" $tempJavaVersionFile`
   javaVersion17=`grep -c "1\.7" $tempJavaVersionFile`
   javaVersion16=`grep -c "1\.6" $tempJavaVersionFile`
   javaVersion15=`grep -c "1\.5" $tempJavaVersionFile`
   ibmJava=`grep -c "IBM" $tempJavaVersionFile`


   if [ $javaVersion20 -gt 0  -a "$LAUNCHPAD_JAVA_20" = "true" ] ; then
	foundJava='true'
   fi

   if [ $javaVersion19 -gt 0  -a "$LAUNCHPAD_JAVA_19" = "true" ] ; then
	foundJava='true'
   fi

   if [ $javaVersion18 -gt 0  -a "$LAUNCHPAD_JAVA_18" = "true" ] ; then
	foundJava='true'
   fi

   if [ $javaVersion17 -gt 0  -a "$LAUNCHPAD_JAVA_17" = "true" ] ; then
	foundJava='true'
   fi
   if [ $javaVersion16 -gt 0  -a "$LAUNCHPAD_JAVA_16" = "true" ] ; then
	foundJava='true'
   fi

   if [ $javaVersion15 -gt 0  -a "$LAUNCHPAD_JAVA_15" = "true" ] ; then
	foundJava='true'
   fi
   
   if [ ! $ibmJava -gt 0 -a  "$foundJava" = "true"  ]  ; then
	foundJava='false'
   fi
   
fi

if [ "$foundJava" = "false" ] ; then
	# Find Executable files named java in the path, plus a few known locations
     PATH=$PATH:$LAUNCHPAD_JAVA_SEARCHPATH

    unset localJava
    IFS=:
	for i in $PATH
	do
	  j=$i/java

	  if [ -x $j ] ; then 
		$j -version > $tempJavaVersionFile 2>&1


		javaVersion20=`grep -c "2\.0" $tempJavaVersionFile`
		javaVersion19=`grep -c "1\.9" $tempJavaVersionFile`
		javaVersion18=`grep -c "1\.8" $tempJavaVersionFile`
		javaVersion17=`grep -c "1\.7" $tempJavaVersionFile`
		javaVersion16=`grep -c "1\.6" $tempJavaVersionFile`
		javaVersion15=`grep -c "1\.5" $tempJavaVersionFile`
		ibmJava=`grep -c "IBM" $tempJavaVersionFile`

	   if [ $javaVersion20 -gt 0  -a "$LAUNCHPAD_JAVA_20" = "true" ] ; then
		foundJava='true'
	   fi

	   if [ $javaVersion19 -gt 0  -a "$LAUNCHPAD_JAVA_19" = "true" ] ; then
		foundJava='true'
	   fi

	   if [ $javaVersion18 -gt 0  -a "$LAUNCHPAD_JAVA_18" = "true" ] ; then
		foundJava='true'
	   fi

	   if [ $javaVersion17 -gt 0  -a "$LAUNCHPAD_JAVA_17" = "true" ] ; then
		foundJava='true'
	   fi
	   if [ $javaVersion16 -gt 0  -a "$LAUNCHPAD_JAVA_16" = "true" ] ; then
		foundJava='true'
	   fi

	   if [ $javaVersion15 -gt 0  -a "$LAUNCHPAD_JAVA_15" = "true" ] ; then
		foundJava='true'
	   fi
	   
	   if [ ! $ibmJava -gt 0 -a  "$foundJava" = "true"  ]  ; then
		foundJava='false'
	   fi
   
		if [ "$foundJava" = "true" ] ; then
			if [ $ibmJava -gt 0 ] ; then 
				localJava=$j
				break
			fi
		fi
	   fi
	done

fi
echo $localJava

