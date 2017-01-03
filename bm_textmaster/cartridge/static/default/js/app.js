(function($){
	var app = {
			init: function(){
				if($('.new-translation').length){
					this.newTranslation();
				}
			},
			urls:{
				categoryDropdown: "Translation-CategoryDropdown",
				translationItemList: "Translation-ItemList"
			},
			newTranslation: function(){
				var localeFrom, item, catalog, url;
				
				$('select[name=locale-from]').on('change',function(){
					localeFrom = $(this).val();
					$('input[name=locale-to]').prop("disabled",false);
					$('#locale-to-' + localeFrom).prop("checked",false);
					$('#locale-to-' + localeFrom).prop("disabled",true);
				});
				
				$('select[name=item-type]').on('change',function(){
					item = this.value;
					if($(this).val() == "product" || $(this).val() == "category"){
						$('.field-holder.catalog-list').addClass("show");
						$('.filter-items .category').removeClass('hide');
					}
					else{
						$('.field-holder.catalog-list').removeClass("show");
						$("select[name=catalog] option[value='']").prop("selected",true);
						$('.filter-items .category').addClass('hide');
					}
					
					if($(this).val() == "category"){
						$('.filter-items .search-status').addClass('hide');
					}
					else{
						$('.filter-items .search-status').removeClass('hide');
					}
					
					$('.attributes-main').removeClass("product").removeClass("category").removeClass("content");
					$('.attributes-main').addClass(item);
					$(this).removeClass('error-field');
					$('#items-holder').html('');
				});
				
				$('select[name=catalog]').on('change',function(){
					catalog = $(this).val();
					url = app.urls.categoryDropdown + "?catalog=" + catalog;
					$.get(url, function(data){
						$('select[name=filter-category]').html(data);
					});
					$(this).removeClass('error-field');
				});
				
				$('#filter-search').on("click", function(){
					var searchText = $(this).val(),
						itemType = $('select[name=item-type]').val(),
						catalog = $('select[name=catalog]').val(),
						onlineFlag = $('select[name=filter-online-flag]').val(),
						searchStatus = $('select[name=filter-search-status]').val(),
						category = $('select[name=filter-category]').val(),
						translatedFlag = $('select[name=filter-translated]').val(),
						error = false,
						postData = {
							itemType: itemType,
							catalog: catalog,
							onlineFlag: onlineFlag,
							searchStatus: searchStatus,
							category: category,
							translatedFlag: translatedFlag
						};
					
					if(itemType == ""){
						$('select[name=item-type]').addClass('error-field');
						error = true;
					}
					else if(itemType != "content" && catalog == ""){
						$('select[name=catalog]').addClass('error-field');
						error = true;
					}
					
					if(error){
						$('.common-error.search').addClass('show');
						return false;
					}
					
					$('.common-error.search').removeClass('show');
					$(this).prop("disabled",true).val("Please wait...");
					$.post(app.urls.translationItemList, postData, function(data){
						$('#items-holder').html(data);
						$('#filter-search').prop("disabled",false).val(searchText);
					});
				});
			}
	};
	
	$(document).ready(function(){
		app.init();
	});
})(jQuery);