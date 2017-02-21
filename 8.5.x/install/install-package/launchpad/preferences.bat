@ECHO off
REM Licensed Materials - Property of IBM
REM 5648-F10 (C) Copyright International Business Machines Corp. 2005 
REM All Rights Reserved
REM US Government Users Restricted Rights- Use, duplication or disclosure
REM restricted by GSA ADP Schedule Contract with IBM Corp.


ECHO user_pref("browser.frames.enabled", true); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("browser.shell.checkDefaultBrowser", false); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("javascript.enabled", true); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("security.fileuri.origin_policy", 4); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("security.enable_java", false); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("security.xpconnect.plugin.unrestricted", true); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("security.turn_off_all_security_so_that_viruses_can_take_over_this_computer", true); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("security.enablePrivilege.enable_for_tests", true); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("security.warn_entering_secure", false); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("security.warn_leaving_secure", false); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("security.warn_entering_weak", false); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("security.warn_viewing_mixed", false); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("security.warn_submit_insecure", false); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("signon.rememberSignons", false); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("update_notifications.enabled", false); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("browser.bookmarks.added_static_root", true); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("intl.charsetmenu.browser.cache", "ISO-8859-1"); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("autoadmin.failover_to_cached", true); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("advanced.always_load_images", true); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("advanced.system.supportDDEExec", true); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("browser.PICS.disable_for_this_session", true); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("privacy.popups.first_popup", false); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("browser.allowpopups", true); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("dom.disable_open_during_load", false); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("browser.block.target_new_window", false); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("browser.cache.enable", true); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("browser.turbo.enabled", false); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("dom.allow_scripts_to_close_windows", true); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("dom.disable_window_move_resize", false); >>"%LaunchPadProfilePath%\user.js"    
ECHO user_pref("nglayout.initialpaint.delay", 0); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("capability.principal.codebase.p0.granted", "UniversalXPConnect UniversalBrowserRead UniversalBrowserWrite"); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("security.fileuri.strict_origin_policy", false); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("browser.tabs.autoHide", true); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("browser.rights.3.shown", true); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("browser.rights.version", 3); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("shell.checkDefaultApps", 0); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("shell.checkDefaultClient", false); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("signed.applets.codebase_principal_support", true); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("capability.policy.default.XMLHttpRequest.open", "allAccess"); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("capability.principal.codebase.p0.granted", "UniversalXPConnect UniversalBrowserRead UniversalBrowserWrite UniversalPreferencesRead UniversalPreferencesWrite UniversalFileRead"); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("dom.max_script_run_time",65530); >>"%LaunchPadProfilePath%\user.js"
ECHO user_pref("ui.key.contentAccess",4); >>"%LaunchPadProfilePath%\user.js"