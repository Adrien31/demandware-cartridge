'use strict';

/**
 * Controller that provides user interface for all pages
 * @module controllers/TMTranslation
 */

/* API Includes */
var ISML = require('dw/template/ISML');
var Site = require('dw/system/Site');

/* Script Modules */
var utils = require('~/cartridge/scripts/utils/Utils');
var logUtils = require('~/cartridge/scripts/utils/LogUtils');

/* Global variables */
var log = logUtils.getLogger("Translation Controller");

/**
* Form to show filter options for translation
*/
function newTranslation(){
	var registered = loginCheck();
	
	if(registered){
		ISML.renderTemplate('translation/filtertranslationitems');
	}
}

/**
* Dashboard page
*/
function followUp(){
	var registered = loginCheck();
	
	if(registered){
		ISML.renderTemplate('translation/followupontranslation');
	}
}

/**
* Registration link to TextMaster
*/
function register(){
	var apiConfig = require('~/cartridge/scripts/translation/GetAPIConfigurations');
	var config = apiConfig.output;
	var customCache = require('~/cartridge/scripts/utils/customCacheWebdav');
	
	if (utils.config.tmApiCache === 'disabled') {
		utils.resetLanguageCache();
	}
	
	var abilityListCache = customCache.getCache(utils.config.cache.url.languages.abilityList);
	
	config.ClearCache = abilityListCache !== null ? true : false;
	
	ISML.renderTemplate('translation/entertextmaster', config);
}

/**
* function 'newTranslation' posts data to this function
*/
function placeOrder(){
    var localeFrom = request.httpParameterMap.get("locale-from").stringValue;
    var mappedLanguageFrom = utils.getMappedLanguage(localeFrom);
    mappedLanguageFrom = mappedLanguageFrom ? mappedLanguageFrom : localeFrom;
    var localeToArray = request.httpParameterMap.get("locale-to[]").values.toArray();
    var languageMapping = utils.config.languageMapping;
    var localeTo;
    var tempLocale = [];
    
    for (var locale = 0; locale < localeToArray.length; locale++){
            for (var mapLang = 0; mapLang < languageMapping.length; mapLang++) {
                    if (localeToArray[locale] === languageMapping[mapLang].dw){
                            localeTo = languageMapping[mapLang].tm;
                    }
            }
            if (localeTo != undefined ){
                    tempLocale.push(localeTo);
            } else {
                    tempLocale.push(localeToArray[locale]);
            }
    }
    
    var mappedLanguageTo = tempLocale;
    var input = {
        LocaleFrom: request.httpParameterMap.get("locale-from").stringValue,
        MappedLocaleFrom: mappedLanguageFrom,
        ItemType: request.httpParameterMap.get("item-type").stringValue,
        CatalogID: request.httpParameterMap.get("catalog").stringValue,
        LocaleTo: request.httpParameterMap.get("locale-to[]").values.toArray(),
        MappedLocaleTo: mappedLanguageTo,
        Attributes: request.httpParameterMap.get("attribute[]").values.toArray(),
        Items: request.httpParameterMap.get("items").stringValue.split(",")
    };
	var transParams = require('~/cartridge/scripts/translation/SetupTranslationParameters');
	
	var output = transParams.output(input);
	ISML.renderTemplate('translation/placeorder', output);
}

/**
* Notification page on project creation
*/
function notification(){
	var input = {
			autoLaunchCount: request.httpParameterMap.get("autoLaunchCount").intValue,
			noAutoLaunchCount: request.httpParameterMap.get("noAutoLaunchCount").intValue,
			projectID: request.httpParameterMap.get("projectID").stringValue
		};
	
	ISML.renderTemplate('translation/notification', input);
}

/**
* Default attributes settings
*/
function defaultAttributes(){
	ISML.renderTemplate('translation/defaultattributessettings');
}

/**
* Check API key and API secret entered in Site Preference
*/
function loginCheck(){
	var APIKey = Site.current.getCustomPreferenceValue("TMApiKey") || "",
		APISecret = Site.current.getCustomPreferenceValue("TMApiSecret") || "";
	
	if(APIKey == "" || APISecret == ""){
		register();
		
		return false;
	}
	
	return true;
}

/**
 * Language mapping main page
 * */
function languageMapping() {
	var languageMapping = require('~/cartridge/scripts/translation/getLanguageMapping');
    ISML.renderTemplate('translation/languagemapping', {languageMapping: languageMapping.data});
}

/*
* Web exposed methods
*/
newTranslation.public = true;
followUp.public = true;
register.public = true;
placeOrder.public = true;
notification.public = true;
defaultAttributes.public = true;
languageMapping.public = true;

exports.New = newTranslation;
exports.FollowUp = followUp;
exports.Register = register;
exports.PlaceOrder = placeOrder;
exports.Notification = notification;
exports.DefaultAttributes = defaultAttributes;
exports.LanguageMapping = languageMapping;
