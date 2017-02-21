# Licensed Materials - Property of IBM
# 5648-F10 (C) Copyright International Business Machines Corp. 2005, 2010
# All Rights Reserved
# US Government Users Restricted Rights - Use, duplication or disclosure
# restricted by GSA ADP Schedule Contract with IBM Corp.

echo 'user_pref("browser.frames.enabled", true);' >>$userviewprefpath/user.js
echo 'user_pref("browser.shell.checkDefaultBrowser", false);' >>$userviewprefpath/user.js
echo 'user_pref("javascript.enabled", true);' >>$userviewprefpath/user.js
echo 'user_pref("signon.rememberSignons", false);' >>$userviewprefpath/user.js
echo 'user_pref("browser.bookmarks.added_static_root", true);' >>$userviewprefpath/user.js
echo 'user_pref("intl.charsetmenu.browser.cache", "ISO-8859-1");' >>$userviewprefpath/user.js
echo 'user_pref("browser.search.opensidebarsearchpanel", false);' >>$userviewprefpath/user.js
echo 'user_pref("privacy.popups.first_popup", false);' >>$userviewprefpath/user.js
echo 'user_pref("browser.allowpopups", true);' >>$userviewprefpath/user.js
echo 'user_pref("dom.allow_scripts_to_close_windows", true);' >>$userviewprefpath/user.js
echo 'user_pref("dom.disable_window_move_resize", false);' >>$userviewprefpath/user.js
echo 'user_pref("dom.disable_open_during_load", false);' >>$userviewprefpath/user.js
echo 'user_pref("dom.max_script_run_time", 60);' >>$userviewprefpath/user.js
echo 'user_pref("nglayout.initialpaint.delay", 0);' >>$userviewprefpath/user.js
echo 'user_pref("browser.link.open_external", 2);' >>$userviewprefpath/user.js
echo 'user_pref("browser.EULA.3.accepted", true);' >>$userviewprefpath/user.js
echo 'user_pref("browser.EULA.4.accepted", true);' >>$userviewprefpath/user.js
echo 'user_pref("browser.EULA.5.accepted", true);' >>$userviewprefpath/user.js
echo 'user_pref("browser.rights.3.shown", true);' >>$userviewprefpath/user.js
echo 'user_pref("browser.rights.version", 3);' >>$userviewprefpath/user.js
echo 'user_pref("shell.checkDefaultApps", 0);' >>$userviewprefpath/user.js
echo 'user_pref("shell.checkDefaultClient", false);' >>$userviewprefpath/user.js
echo 'user_pref("signed.applets.codebase_principal_support", true);' >>$userviewprefpath/user.js
echo 'user_pref("dom.max_script_run_time",65530);' >>$userviewprefpath/user.js
echo 'user_pref("ui.key.contentAccess",4);' >>$userviewprefpath/user.js
