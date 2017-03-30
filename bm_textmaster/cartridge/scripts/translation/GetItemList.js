/**
*	Gets category list of a catalog
*
*	@input ItemType: String
*	@input Catalog: String
*	@input Category: String
*
*	@output ItemList: Array
*	@output Type: String
*
*/

// API Includes
var ProductMgr = require('dw/catalog/ProductMgr'),
	ContentMgr = require('dw/content/ContentMgr'),
	CatalogMgr = require('dw/catalog/CatalogMgr');
	
// Lib Includes
var LogUtils = require('~/cartridge/scripts/utils/LogUtils'),
	Utils = require('~/cartridge/scripts/utils/Utils');

// Global variables
var log;

function execute( pdict : PipelineDictionary ) : Number {
	var input, output;
	
	input = {
		ItemType: pdict.ItemType,
		Catalog: pdict.Catalog,
		Category: pdict.Category
	};
	output = getOutput(input);
	
	pdict.Type = output.Type;
	pdict.ItemList = output.ItemList;
	
	return PIPELET_NEXT;
}

function getOutput(input){
	var itemType = input.ItemType,
		catalog = input.Catalog ? CatalogMgr.getCatalog(input.Catalog) : null,
		categoryIDs = input.Category ? input.Category.split(",") : (catalog ? [catalog.getRoot().ID] : []),
		products, category, product, items = [], rootCategory, subCategories = [], library, rootContentFolder, subContentFolders = [],
		subContentFolder, contents, output = [], allCategories = [], categoryID;
	
	log = LogUtils.getLogger("GetItemList");
	
	if(!itemType || (itemType != "content" && !catalog)){
		log.error("Mandatory values are missing for getting item list");
		
		return {
			Type: itemType,
			ItemList: []
		}
	}
	
	/* Populate item list according to the itemType selected */
	switch(itemType){
		case "product":
			for each(categoryID in categoryIDs){
				category = CatalogMgr.getCategory(categoryID);
				allCategories.push(category);
				allCategories.push.apply(allCategories, Utils.getAllSubCategories(category));
			}
			
			for each(category in allCategories){
				products = category.getProducts();
				items.push.apply(items, products.toArray());
			}
			break;
		case "category":
			for each(categoryID in categoryIDs){
				rootCategory = CatalogMgr.getCategory(categoryID);
				subCategories = Utils.getAllSubCategories(rootCategory);
				
				for each(category in subCategories){
					if(!(Utils.isCategoryExistInList(items, category))){
						items.push(category);
					}
				}
			}
			break;
		case "content":
			library = ContentMgr.siteLibrary;
			rootContentFolder = library.root;
			subContentFolders = getSubContentFolders(rootContentFolder);
			/* read all contents of root content folder, convert to array and keep in items */
			contents = rootContentFolder.content;
			items = contents.toArray();
			
			/* read all contents of sub content folders, convert to array and append to items */
			for each(subContentFolder in subContentFolders){
				contents = subContentFolder.content;
				items.push.apply(items, contents.toArray());
			}
			
			break;
	}
	
	return {
		Type: itemType,
		ItemList: items
	}
}

/*
*	Gets all sub folders of a library root content folder, in an array
*/
function getSubContentFolders(contentFolder){
	var subContentFolders, subContentFolder, nextLevelContentFolders, output = [];
	
	subContentFolders = contentFolder.subFolders;
	for each(subContentFolder in subContentFolders){
		output.push(subContentFolder);
	}
	
	for each(subContentFolder in subContentFolders){
		nextLevelContentFolders = getSubContentFolders(subContentFolder);
		output.push.apply(output, nextLevelContentFolders);
	}
	
	return output;
}

module.exports = {
	output: function(input){
		return getOutput(input);
	}
}
