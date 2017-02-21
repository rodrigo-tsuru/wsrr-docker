// Licensed Materials - Property of IBM
// 5648-F10 (C) Copyright International Business Machines Corp. 2005, 2006, 2014
// All Rights Reserved
// US Government Users Restricted Rights - Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

function createLicensePanel(options) {
   top.logCLPEnter("createLicensePanel", arguments);
   

	options = options || {};
	var defaultOptions = {
		document: get_clp_root_doc(),
		id: 'license' + Math.round(Math.random() * 1000000000),
		groups: [{id: 'IBM', name: top.property('licenseGroupIBM'), licenses: ['license']}],
		provider: function (locale, id, group) {
			var licenseFileName = id + this.extension;
			var licenseFile = top.findFileInPaths(null, [this.directory + locale, this.directory + top.property('fallBackLocale','en'), this.directory], licenseFileName);
			var text;
			if(licenseFile == null) {
				this.failed = true;
				this.onFailure({locale: locale, id: id, group: group, file: licenseFile});
				text = top.formatmsg(property('licenseError'), licenseFileName);
			} else {
				text = this.converter(top.readTextFile(licenseFile), locale, id, group);			
			}
			return text;
		},
		converter: function(data, locale, id, group) {
			return data;
		},
		onFailure: function(){},
		directory: 'license/',
		extension: '.txt',
		type: 'text',
		className: { 
			text: 'licenseTextArea',
			html: 'licenseHTMLArea'
		},
		accept: function(){}, 
		decline: function(){},

		license: { 
			locale: top.LOCALE,
			group: null,
			id: null
		},
		
		locales: [{ id: top.LOCALE, name: top.property('localeName[' + top.LOCALE + ']') }, { id: 'en', name: top.property('localeName[' + 'en' + ']') }],
		isTranslatedLocale: function(locale, groupId) {
			var group = this.getGroup(groupId);
			var locales = group.locales;
			if(locales && locales.length) {
				for(var i in locales) {
					if(locales[i] == locale) {
						return true;
					}
				}
				return false;
			} else {
				return locale != 'en';
			}
		},

		changeLocale: function(locale){ this.setLocale(locale) },
		changeGroup: function(group){ this.setGroup(group)},				
		
		title:			top.property('licenseTitle'),
		subtitle:		top.property('licenseSubtitle'),
		readTermsText:	top.property('licenseReadTerms'),
		viewText:		top.property('licenseView'),
		xOfYText:		top.property('licenseXofY'),
		acceptText:		top.property('licenseAccept'),
		acceptBothText:	top.property('licenseAcceptBoth'),
		declineText:	top.property('licenseDecline'),
		printText:		top.property('print'),
		englishText:	top.property('localeName[en]'),
		
		template: '\
			<div class="licenseContainer" id="licenseContainer%1">\
				<h4 class="licenseTitle">%2</h4>\
				<p class="licenseSubtitle">%3</p>\
				<div class="licenseTextWrapper">\
					<div tabIndex="0" class="licenseTextArea" id="license%1" %4>\
					</div>\
				</div>\
				<div class="licenseButtonBox">\
					%5\
					<input type="button" value="%6" class="licensePrintButton" id="licensePrintButton%1">\
					<input type="button" value="%7" class="licenseLanguageButton" id="licenseLanguageButton%1" locale="en">\
					<input type="button" value="%8" group="%9" class="licenseGroupButton" id="licenseGroupButton%1" %10>\
				</div>\
				<div class="acceptDeclineLicenseButtons" style="clear:both">\
					<fieldset> \
					<legend>%2</legend>\
					<p class="licenseRadioButtonBlock"><input type="radio" name="group1" value="accept" id="licenseAcceptButton%1"><label for="licenseAcceptButton%1"> %11 </label></p>\
					<p class="licenseRadioButtonBlock"><input type="radio" name="group1" value="decline" id="licenseDeclineButton%1"><label for="licenseDeclineButton%1"> %12 </label></p>\
					</fieldset> \
				</div>\
			</div>',
			
		populateTemplate: function(){
			var displayNone = 'style="display: none"';
			var groups = this.groups;
			var totalGroups = groups.length;
			var readTermsText = (totalGroups > 1) ? top.formatmsg(this.readTermsText, groups[1].name) : property('unknown');
			var groupId = (totalGroups > 1) ? groups[1].id : '';
			var displayGroupButton = (totalGroups > 1) ? '' : displayNone;
			var selectionLists = this.createSelectionLists();
			var acceptText = (totalGroups <= 1) ? this.acceptText : top.formatmsg(this.acceptBothText, groups[0].name, groups[1].name);
			var height = this.height ? 'style="height:' + this.height + '"' : '';
			return top.formatmsg(this.template, this.id, this.title, this.subtitle, height, selectionLists, this.printText, this.englishText, readTermsText, groupId, displayGroupButton, acceptText, this.declineText);
		},

		setActions: function(){
			var element;
			var license = this;
			if(element = this.document.getElementById('licenseGroupButton' + this.id)) element.onclick = function(){ license.changeGroup(this.group) };
			if(element = this.document.getElementById('licenseLanguageButton' + this.id)) element.onclick = function(){ license.changeLocale(this.locale) };
			if(element = this.document.getElementById('licensePrintButton' + this.id)) element.onclick = function(){ license.print(this) };
			if(element = this.document.getElementById('licenseAcceptButton' + this.id)) element.onclick = function(){ license.accept() };
			if(element = this.document.getElementById('licenseDeclineButton' + this.id)) element.onclick = function(){ license.decline() };
			
			var total = license.groups.length;
			for(var index = 0; index < total; index++ ) {
				if(element = this.document.getElementById('licenseSelectionList' + license.groups[index].id)) element.onchange = function() { license.setId(this.options[this.selectedIndex].value) };
			}
		},
		
		createSelectionLists: function () {
		
			function createLicenseSelectionList(license, groupNumber, active, viewText) {
				var display = active ? '' : 'style="display:none"';
				var listText = '<label style="display:none" for="licenseSelectionList' + license.groups[groupNumber].id + '">' + viewText + '</label>' + 
				'<select class="licenseSelectionList" id="licenseSelectionList' + license.groups[groupNumber].id + '" ' + display + '>\n';
				
				var index = 1;
				var licenses = license.groups[groupNumber].licenses;
				var totalLicenses = licenses.length;
				var xOfYText = license.xOfYText;
				for(var index = 0; index < totalLicenses; ) {
					var selected = (index == 0 ? 'selected' : '');
					var optionText = '    <option ' + selected + ' value="' + licenses[index] + '">' + top.formatmsg(xOfYText, "" + (++index), "" + totalLicenses) + '</option>\n';
					listText += optionText;
				}

				listText += '</select>\n';
				return listText;
			}
			
			var total = this.groups.length;
			var listsText = '<div class="licenseListBox" id="licenseListBox'+ this.id +'">\n';
			listsText += this.viewText;
			for(var index = 0; index < total; index++ ) {
				listsText += createLicenseSelectionList(this, index, index == 0, this.viewText);
			}
			listsText += '</div>\n';
			return listsText;
		}, 
		
		getGroup: function(id) {
			var groups = this.groups;
			var length = groups.length;
			for(var i = 0; i < length; i++) {
				if(groups[i].id == id) return groups[i];
			}
			return null;
		},
				
		getType: function(id, groupId) {
			var type;
			var group = this.getGroup(groupId);
			if(group && group.type) {
				if(typeof group.type == 'string') {
					type = group.type;
				} else {
					type = group.type[id];
				}
			} else if(typeof this.type == 'string') {
				type = this.type;
			} else {
				type = this.type[id];
			}
			return type;
		},
		
		getClassName: function(type) {
			return this.className[type];
		},
		
		getPropertyName: function(type) {
			if(type == 'text' && top.BROWSER == 'IExplore') {
				return 'innerText';
			}
			return 'innerHTML';
		},

		updateText: function () {
			var type = this.getType(this.license.id, this.license.group);
			var className = this.getClassName(type);
			var propertyName = this.getPropertyName(type);
			var element = this.document.getElementById('license'+this.id);
			var licenseText = this.provider(this.license.locale, this.license.id, this.license.group);
			element[propertyName] = licenseText;
			element.className = className;
			
		},

		setId: function (id) {
			this.license.id = id;
			
			this.updateText();
		},

		setGroup: function (group) {

			var license = this;

			function showLanguageButton(show, licensePanelId) {
				var id = 'licenseLanguageButton' + licensePanelId;
				
				var selectionList = license.document.getElementById(id);
				selectionList.style.display = !show ? 'none' : 'inline';
			}
			
			function showLicenseSelectionList(show, groupId) {
				var id = 'licenseSelectionList' + groupId;
				
				var selectionList = license.document.getElementById(id);
				selectionList.style.display = !show ? 'none' : 'inline';
			}

			function getSelectedIndex(groupId) {
				var id = 'licenseSelectionList' + groupId;
				
				var selectionList = license.document.getElementById(id);
				
				return selectionList.selectedIndex;	
			}
			
			function showViewLicenseBox(show, licensePanelId) {
				var id = 'licenseListBox' + licensePanelId;
				
				var licenseListBox = license.document.getElementById(id);
				licenseListBox.style.display = !show ? 'none' : 'block';
			}
			
			var thisGroup = (group == this.groups[0].id ? this.groups[0] : this.groups[1]);
			var alternateGroup = (group == this.groups[0].id ? this.groups[1] : this.groups[0]);
			
			if(alternateGroup) showLicenseSelectionList(false, alternateGroup.id);
			showLanguageButton(this.isTranslatedLocale(top.LOCALE, thisGroup.id), this.id);
			showLicenseSelectionList(thisGroup.licenses.length > 1, thisGroup.id);
			showViewLicenseBox(thisGroup.licenses.length > 1, this.id);

			this.license.group = thisGroup.id;
			this.license.id = thisGroup.licenses[getSelectedIndex(thisGroup.id)];
			
			if(alternateGroup) {
				this.document.getElementById('licenseGroupButton' + this.id).group = alternateGroup.id;
				this.document.getElementById('licenseGroupButton' + this.id).value = top.formatmsg(this.readTermsText, alternateGroup.name);
			}

			this.updateText();
		},

		setLocale: function (locale) {
			this.license.locale = locale;
			
			var alternateLocale = (locale == this.locales[0].id ? this.locales[1] : this.locales[0]);
			this.document.getElementById('licenseLanguageButton' + this.id).locale = alternateLocale.id;
			this.document.getElementById('licenseLanguageButton' + this.id).value = alternateLocale.name;

			this.updateText();
		},
		inject: function() {
			var licenseTextTemplate = this.populateTemplate();
			var element = top.launchpad.get(this.id, this.document);
			if(!element) {
				element = top.launchpad.get(this.document.body);
				element.prepend('<div id="' + this.id + '"></div>');
				element = top.launchpad.get(this.id, this.document);
			}
			element.append(licenseTextTemplate);
		},
		create: function() {
			this.inject();
			this.setActions();
			this.setId(this.groups[0].licenses[0]);
			this.setGroup(this.groups[0].id);
			this.setLocale(top.LOCALE);
		},
		
		printTemplate: '\
			<div class="licensePrintContainer">\
				<h1 class="licensePrintTitle">%1</h1>\
				<h2 class="licensePrintSubtitle">%2</h2>\
				<hr>\
				<div class="licenseTextPrintWrapper">%3</div>\
			</div>',

		printGroupTemplate: '\
			<div class="licenseGroupPrintContainer">\
				<h3 class="licenseGroupPrintTitle">%1</h3>\
				<div class="licenseGroupTextPrintWrapper">%2</div>\
				<hr>\
			</div>',

		printXofYTemplate: '\
			<div class="licenseXofYPrintContainer">\
				<h4 class="licenseXofYPrintTitle">%1</h4>\
				<div class="licenseXofYTextPrintWrapper">%2</div>\
			</div>',

		printGroupTitleText: top.property('licensePrintGroupTitle'),
		printXofYTitleText: top.property('licensePrintXofYTitle'),
		
		formatPrintTemplate: function() {
			var text = '';
			for(var i = 0; i < this.groups.length; i++) {
				var groupText = this.formatPrintGroupTemplate(i);
				text += groupText;
			}
			text = top.formatmsg(this.printTemplate, this.title, this.subtitle, text);
			return text;
		},
		
		formatPrintGroupTemplate: function(groupNumber) {
			var text = '';
			for(var i = 0; i < this.groups[groupNumber].licenses.length; i++) {
				var licenseText = this.formatPrintXofYTemplate(i, groupNumber);
				text += licenseText;
			}

			if(this.groups.length > 1) {
				var printGroupTitle = top.formatmsg(this.printGroupTitleText, this.groups[groupNumber].name);
				text = top.formatmsg(this.printGroupTemplate, printGroupTitle, text);
			}
			return text;
		},
		
		formatPrintXofYTemplate: function(licenseNumber, groupNumber) {
			var text = this.formatPrint(licenseNumber, groupNumber);

			if(this.groups[groupNumber].licenses.length > 1) {
				var printXofYTitle = top.formatmsg(this.printXofYTitleText, '' + (licenseNumber + 1) , '' + this.groups[groupNumber].licenses.length);
				text = top.formatmsg(this.printXofYTemplate, printXofYTitle, text);
			}
			return text;
		},
		
		formatPrint: function(licenseNumber, groupNumber) {
			var text = this.printFormatProvider(this.license.locale, this.groups[groupNumber].licenses[licenseNumber], this.groups[groupNumber].id);
			return text;
		},
		
		printFormatProvider: function (locale, id, group) {
			var type = this.getType(this.license.id, this.license.group);
			var text = this.provider(locale, id, group);
			if(type == 'text') text = '<pre>' + text + '</pre>';
			return text;
		},
		
		print: function(element){ 
			var content = this.formatPrintTemplate();
			top.printContent(content, element);
		}
	};
	
	var license = top.launchpad.extend(options, defaultOptions);
	
	license.create();
	var printButtonElement = license.document.getElementById('licensePrintButton' + license.id);
	var options = { element: printButtonElement, accessKey: "p" };
	top.assignAccessKey(options);
	top.logCLPExit("createLicensePanel", arguments);
	return license;	
}
