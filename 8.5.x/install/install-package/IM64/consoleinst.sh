#!/bin/sh

# +------------------------------------------------------------------------+
# | Licensed Materials - Property of IBM                                   |
# | (C) Copyright IBM Corp. 2010, 2011.  All Rights Reserved.              |
# |                                                                        |
# | US Government Users Restricted Rights - Use, duplication or disclosure |
# | restricted by GSA ADP Schedule Contract with IBM Corp.                 |
# +------------------------------------------------------------------------+

processargs()
{
    accessRights=
    while [ $# -ne 0 ]; do
        case $1 in
        -accessRights | -aR)
            if [ $# -ne 1 ]; then
                accessRights=$2
            else
                accessRights=badarg
            fi
            break
            ;;
        esac
        shift
    done

    launcher=
    case "$accessRights" in
    "admin" | "")
        launcher=installc
        ;;
    "nonAdmin")
        launcher=userinstc
        ;;
    "group")
        launcher=groupinstc
        ;;
    *)
        echo The only allowed -accessRights values are admin, nonAdmin, and group
        exit 1
    esac

}

TEMP=/tmp
tempScript=$TEMP/consoleinst-$$.sh
scriptLoc=`dirname "$0"`
slash=`expr "$scriptLoc" : "\(/\)"`
if [ "X$slash" != "X/" ]; then
	scriptLoc=`pwd`/$scriptLoc
fi

if [ "$0" != "$tempScript" ]; then
    cp "$0" "$tempScript"
    cd "$TEMP"
    origScriptLoc=$scriptLoc
    export origScriptLoc
    exec "$tempScript" $@
    # should not return from above exec
    exit 1 
fi

processargs $@

restartScript=$TEMP/restartScript-$$.sh
restartScript2=$TEMP/restartScript2-$$.sh

# echo $restartScript
# echo $restartScript2
# echo $scriptLoc
# echo $origScriptLoc
# echo $launcher

rm -f "$restartScript"

"$origScriptLoc/$launcher" -c -restartScriptLocation "$restartScript" $@
status=$?
if [ $status -eq 0 ]; then
    while [ -f "$restartScript" ]; do
        mv -f "$restartScript" "$restartScript2"
        # echo Restarting Installation Manager
        "$restartScript2"
        status=$?
        if [ $status -ne 0 ]; then
            break
        fi
    done
fi

rm -f "$restartScript" "$restartScript2" "$tempScript"

exit $status
