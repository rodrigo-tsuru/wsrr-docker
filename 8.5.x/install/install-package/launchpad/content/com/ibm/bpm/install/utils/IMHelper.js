// Licensed Materials - Property of IBM
// 5725-C94
// Copyright IBM Corporation 2013. All Rights Reserved.
// US Government Users Restricted Rights- Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

dojo.provide("com.ibm.bpm.install.utils.IMHelper");

dojo.declare("com.ibm.bpm.install.utils.IMHelper", [], {
    // Place comma-separated class attributes here. Note, instance attributes
    // should be initialized in the constructor. Variables initialized here
    // will be treated as 'static' class variables.

    imLocation: null,

    /*
     * Boolean value indicating is media spanned
     * 
     */

    isMediaSpanned: null,

    // Constructor function. Called when instance of this class is created
    constructor: function() {
        this.imLocation = osHelper.getIMLocation();
        this.isMediaSpanned = util.checkMediaSpanned();
    },

    startIM: function(admin) {

        var installXMLFileLoc = null;
        if (this.isMediaSpanned == 'false')// ESD
        {
            installXMLFileLoc = this.writeInstallImportXML();
            this.writePostInstallImportXML();
        } else// MSD
        {
            installXMLFileLoc = this.writeExistingWASIMInstallXML();
            this.writeExistingWASIMPostInstallXML();
        }

        if (admin) {
            // RTC 136097
            // adding system locale for IM to start in correct locale. If not supported by IM, it will start in default
            // English locale
            top.runProgram('DISK1', top.command('installIM.root', this.imLocation.replace("undefined",""), installXMLFileLoc, top.LOCALE), BACKGROUND, VISIBLE);
        } else {
            top.runProgram('DISK1', top.command('installIM.nonroot', this.imLocation.replace("undefined",""), installXMLFileLoc, top.LOCALE), BACKGROUND, VISIBLE);
        }

        return;
    },

    /**
     * Function installProduct launches the Installation Manager with required product offering(s)
     * 
     * @param -
     *            Boolean value representing the administrative status of Installing user
     */
    installProduct: function(admin) {
        installXMLFileLoc = this.writeIMInstallXML(admin, this.isMediaSpanned);
        this.writeIMPostInstallXML(admin, this.isMediaSpanned);
        // RTC 136097
        // adding system locale for IM to start in correct locale. If not supported by IM, it will start in default
        // English locale
        if (admin) {
            top.runProgram('DISK1', top.command('installIM.root', this.imLocation.replace("undefined",""), installXMLFileLoc, top.LOCALE),
                top.BROWSER == 'IExplore' ? FOREGROUND : BACKGROUND, VISIBLE, this);
        } else {
            top.runProgram('DISK1', top.command('installIM.nonroot', this.imLocation.replace("undefined",""), installXMLFileLoc, top.LOCALE),
                top.BROWSER == 'IExplore' ? FOREGROUND : BACKGROUND, VISIBLE, this);
        }

        return;
    },

    writeInstallImportXML: function() {
        var contents = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + "<agent-input>\n" + "<server>\n" + "<repository location=\'"
            + this.imLocation.replace("undefined","") + top.PATHSEPARATOR + "\'" + " temporary=\'true\'/>\n" + "<repository location=\'" + top.IMAGEDIR
            + "repository" + top.PATHSEPARATOR + "repository.config\'" + " temporary=\'true\' />\n"
            + "<repository location=\'http://public.dhe.ibm.com/software/websphere/repositories/\' temporary=\'true\' />\n" + "</server>\n"
            + "<install>\n" + "<offering features=\'agent_core,agent_jre\' id=\'" + property('InstallationManagerOfferingId') + "\' />\n"
            + "</install>\n" + "</agent-input>\n";

        var installImportFileName = "install_import.xml";
        var fileLoc = util.getTempFilename(installImportFileName);
        top.writeTextFile(fileLoc, contents, false, "UTF-8");
        return fileLoc;
    },

    // Single function to create xml file for 32 and 64 bit architecture.
    writeIMInstallXML: function(admin, isMediaSpanned) {
        var repos = osHelper.getRepos();
        var sdk = osHelper.getSDK();

        var installXMLFile = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + "<agent-input temporary=\'true\' >\n"
            + "<preference value=\"true\" name=\"com.ibm.cic.common.core.preferences.import.enabled\" />\n" + "<server>\n";

        installXMLFile = installXMLFile + "<repository location=\'" + this.imLocation.replace("undefined","") + "\' />\n";

        // Not sure abt below two lines
        if (top.diskLabel.edition == 'WBM') {
            installXMLFile = installXMLFile + "<repository location=\'" + top.IMAGEDIR + "IM_linux_ppc\' />\n" + "<repository location=\'"
                + top.IMAGEDIR + "IM_hpux_ia64_32\' />\n";

        }

        // add products repository adaptively
        if (isMediaSpanned == 'false') {

            if ((!((top.OS.indexOf("Windows") != -1) || (top.OS.indexOf('Linux') != -1))) || top.ARCHITECTURE == 's390x'
                || top.diskLabel.edition == 'WBM') {
                // ZLINUX,
                // AIX
                // and
                // Solaris
                installXMLFile = installXMLFile + "<repository location=\'" + top.IMAGEDIR + "repository' />\n";

            } else {
                installXMLFile = installXMLFile + "<repository location=\'" + top.IMAGEDIR + "repository" + "' />\n";

            }

        } else if (isMediaSpanned == 'true') {

            installXMLFile = installXMLFile + "<repository location=\'" + top.IMAGEDIR + "\' />\n";
        }
        // If installing WSRR Studio Ignore WAS, WSRR and DB2
        if (top.diskLabel.edition != 'WSRRSTUDIO') {
            installXMLFile = installXMLFile + "</server>\n" + "<install>\n" + "<offering features=\'agent_core,agent_jre\' id=\'"
                + property('InstallationManagerOfferingId') + "\'/>\n" + "<offering id=\'" + property('wasOfferingId')
                + "\' features=\'core.feature,ejbdeploy,thinclient,embeddablecontainer,samples," + sdk + "\'/>\n";
            installXMLFile = installXMLFile + osHelper.getDB2Offering(admin);
            installXMLFile = installXMLFile + this.getInstallOffering();            

            if (top.diskLabel.edition == 'WBM') {
                installXMLFile = installXMLFile + osHelper.getCognosOffering();
            }
        } else {
            installXMLFile = installXMLFile + "</server>\n" + "<install>\n" + "<offering features=\'agent_core,agent_jre\' id=\'"
                + property('InstallationManagerOfferingId') + "\'/>\n" + "<offering id=\'" + property('WSRRStudio.offering.id') + "\' />\n"
        }
        installXMLFile = installXMLFile + "<\/install>\n" + "</agent-input>";

        // logger using logger helper
        // var fileLoc=logger.write("install.xml",installXMLFile);
        var fileLoc = top.getEnv("LaunchPadTemp") + top.PATHSEPARATOR + 'install.xml';
        top.writeTextFile(fileLoc, installXMLFile, false, "UTF-8");

        return fileLoc;
    },

    // Single function to create (post-install.xml) file for 32 and 64 bit architecture.
    writeIMPostInstallXML: function(admin, isMediaSpanned) {

        var repos = osHelper.getRepos();
        var sdk = osHelper.getSDK();

        var installXMLFile = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + "<agent-input temporary=\'true\' >\n"
            + "<preference value=\"true\" name=\"com.ibm.cic.common.core.preferences.import.enabled\" />\n" + "<server>\n";

        // add products repository adaptively
        if (isMediaSpanned == 'false') {
            if ((!((top.OS.indexOf("Windows") != -1) || (top.OS.indexOf('Linux') != -1))) || top.ARCHITECTURE == 's390x'
                || top.diskLabel.edition == 'WBM') {
                // ZLINUX,
                // AIX
                // and
                // Solaris
                installXMLFile = installXMLFile + "<repository location=\'" + top.IMAGEDIR + "repository' />\n";

            } else {
                installXMLFile = installXMLFile + "<repository location=\'" + top.IMAGEDIR + "repository" + "' />\n";

            }
        } else if (isMediaSpanned == 'true') {

            installXMLFile = installXMLFile + "<repository location=\'" + top.IMAGEDIR + "\' />\n";
        }
        // If installing WSRR Studio Ignore WAS, WSRR and DB2
        if (top.diskLabel.edition != 'WSRRSTUDIO') {
            installXMLFile = installXMLFile + "</server>\n" + "<install>\n" + "<offering id=\'" + property('wasOfferingId')
                + "\' features=\'core.feature,ejbdeploy,thinclient,embeddablecontainer,samples," + sdk + "\'/>\n";
            installXMLFile = installXMLFile + osHelper.getDB2Offering(admin);
            installXMLFile = installXMLFile + this.getInstallOffering();          

            if (top.diskLabel.edition == 'WBM') {
                installXMLFile = installXMLFile + osHelper.getCognosOffering();
            }
        } else {
            installXMLFile = installXMLFile + "</server>\n" + "<install>\n"+ "<offering id=\'" + property('WSRRStudio.offering.id') + "\' />\n"
        }
        installXMLFile = installXMLFile + "<\/install>\n" + "</agent-input>";

        // TODO:
        // have to use loggerHelper to create and write contents into file
        var fileLoc = top.getEnv("LaunchPadTemp") + top.PATHSEPARATOR + 'post-install.xml';
        top.writeTextFile(fileLoc, installXMLFile, false, "UTF-8");

        return fileLoc;

    },

    /*
     * Function which writes post-install_import.xml file to launchpad temporary location if launchpad is updated
     */

    writePostInstallImportXML: function() {
        var contents = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + "<agent-input>\n" + "<server>\n" + "<repository location=\'"
            + top.IMAGEDIR + "repository" + top.PATHSEPARATOR + "repository.config\'" + " temporary=\'true\' />\n"
            + "<repository location=\'http://public.dhe.ibm.com/software/websphere/repositories/\' temporary=\'true\' />\n" + "</server>\n"
            + "</agent-input>\n";

        var fileLocation = top.getEnv("LaunchPadTemp") + top.PATHSEPARATOR + 'post-install_import.xml';
        top.writeTextFile(fileLocation, contents, false, "UTF-8");

        return fileLocation;
    },

    writeExistingWASIMInstallXML: function() {

        var installXMLFile = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + "<agent-input temporary=\'true\' >\n"
            + "<preference value=\"true\" name=\"com.ibm.cic.common.core.preferences.import.enabled\" />\n" + "<server>\n";
        installXMLFile = installXMLFile + "<repository location=\'" + this.imLocation.replace("undefined","") + "\' />\n";

        if (top.diskLabel.edition == 'WBM') {
            installXMLFile = installXMLFile + "<repository location=\'" + top.IMAGEDIR + "IM_linux_ppc\' />\n" + "<repository location=\'"
                + top.IMAGEDIR + "IM_hpux_ia64_32\' />\n";

        }

        installXMLFile = installXMLFile + "<repository location=\'" + top.IMAGEDIR + "\' />\n" + "</server>\n" + "<install>\n"
            + "<offering features=\'agent_core,agent_jre\' id=\'" + property('InstallationManagerOfferingId') + "\'/>\n" + "<\/install>\n"
            + "</agent-input>";

        var fileLoc = top.getEnv("LaunchPadTemp") + top.PATHSEPARATOR + 'install_importDVD.xml';
        top.writeTextFile(fileLoc, installXMLFile, false, "UTF-8");

        return fileLoc;
    },

    writeExistingWASIMPostInstallXML: function() {
        var installXMLFile = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + "<agent-input temporary=\'true\' >\n"
            + "<preference value=\"true\"+ name=\"com.ibm.cic.common.core.preferences.import.enabled\" />\n" + "<server>\n"
            + "<repository location=\'" + top.IMAGEDIR + "\' />\n" + "</server>\n" + "<install>\n" + "<\/install>\n" + "</agent-input>";

        var fileLoc = top.getEnv("LaunchPadTemp") + top.PATHSEPARATOR + 'post-install_importDVD.xml';
        top.writeTextFile(fileLoc, installXMLFile, false, "UTF-8");

        return fileLoc;
    },

    getInstallOffering: function() {
        var installXML = "";
        if (top.diskLabel.edition == 'WSRR') {
            installXML = installXML + "<offering id=\'" + property('WSRR.offering.id') + "\' />\n";
        }
        return installXML;
    },

    installWSRRClient: function(admin) {
        installXMLFileLoc = this.writeWSRRClientIMInstallXML(admin, this.isMediaSpanned);
        if (admin) {
            top.runProgram('DISK1', top.command('installIM.root', this.imLocation.replace("undefined",""), installXMLFileLoc, top.LOCALE), BACKGROUND, VISIBLE);
        } else {
            top.runProgram('DISK1', top.command('installIM.nonroot', this.imLocation.replace("undefined",""), installXMLFileLoc, top.LOCALE), BACKGROUND, VISIBLE);
        }
        return;
    },
    // This is a copy of the basic writeIMInstallXML function, but coded for the WSRR Client only client
    writeWSRRClientIMInstallXML: function(admin, isMediaSpanned) {
        var repos = osHelper.getRepos();
        var sdk = osHelper.getSDK();
        var installXMLFile = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + "<agent-input temporary=\'true\' >\n"
            + "<preference value=\"true\" name=\"com.ibm.cic.common.core.preferences.import.enabled\" />\n" + "<server>\n";

        installXMLFile = installXMLFile + "<repository location=\'" + this.imLocation.replace("undefined","") + "\' />\n";
        // add products repository adaptively
        if (isMediaSpanned == 'false') {

            if ((!((top.OS.indexOf("Windows") != -1) || (top.OS.indexOf('Linux') != -1))) || top.ARCHITECTURE == 's390x'
                || top.diskLabel.edition == 'WBM') {
                // ZLINUX,
                // AIX
                // and
                // Solaris
                installXMLFile = installXMLFile + "<repository location=\'" + top.IMAGEDIR + "repository' />\n";

            } else {
                installXMLFile = installXMLFile + "<repository location=\'" + top.IMAGEDIR + "repository" + "' />\n";
            }
        } else if (isMediaSpanned == 'true') {

            installXMLFile = installXMLFile + "<repository location=\'" + top.IMAGEDIR + "\' />\n";
        }

        installXMLFile = installXMLFile + "</server>\n" + "<install>\n" + "<offering features=\'agent_core,agent_jre\' id=\'"
            + property('InstallationManagerOfferingId') + "\'/>\n";
        installXMLFile = installXMLFile + "<offering id=\'" + property('WSRRClient.offering.id') + "\' />\n";

        installXMLFile = installXMLFile + "<\/install>\n" + "</agent-input>";

        // logger using logger helper
        // var fileLoc=logger.write("install.xml",installXMLFile);
        var fileLoc = top.getEnv("LaunchPadTemp") + top.PATHSEPARATOR + 'clientinstall.xml';
        top.writeTextFile(fileLoc, installXMLFile, false, "UTF-8");

        return fileLoc;
    }
});