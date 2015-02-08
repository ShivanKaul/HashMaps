/* 
	function selectionOnClick
	- sends text to Google Maps
 */

function selectionOnClick(info, tab) {
	sendTextToGM(info.selectionText);
}

/* 
	function sendTextToGM
	- opens a tab Google Maps using the supplied input
 */

function sendTextToGM(inString) {

	var input = encodeURIComponent(inString);
	optionedGM(input);

}

function inputChangedGM(inString, suggest) {
	/*if (typeof jQuery == 'undefined') {
	
	    alert("jQuery library is not found!");
	    return;
	 
	}*/

	if(inString=="") {
		return;
	}
	
	var input = encodeURIComponent(inString);
	var autoUrl =  "https://maps.google.com/maps?q=%s" + input;

	$.ajax(autoUrl, {
		"dataType" : "json",
		"success" : function (jsonData) {
		
			//turn into SuggestResult array
			var resultsFromJson = jsonData.results;
			if(resultsFromJson.length == 0) {return;} // if we have no suggestions
			var suggestFromJson = []; //array of SuggestResult objects
			var len = Math.min(5, resultsFromJson.length); // max 5 suggestions
			for (i = 0; i < len; i++) {

				var descripString = resultsFromJson[i].input;
				/*if(!resultsFromJson[i].description) { // if a description is not available

					descripString = "Ask Wolfram|Alpha"; // use something generic

				} else {
					descripString = resultsFromJson[i].description;
				}

				descripString = resultsFromJson[i].input + " -- " + descripString;*/

				suggestFromJson.push({
					"content" : resultsFromJson[i].input, 
					"description" : descripString
				});
			}
			
			suggest(suggestFromJson);
		}
	});
			//}
		//}
	//});
}

// helper function to deal with the "open in" option

function optionedGM(input) {
	
		chrome.tabs.create({"url" : "https://www.maps.google.com/maps?q=" + input, "active" : true});
	
}

// right click context menu
chrome.contextMenus.create({
	"title" : "Find directions to '%s' with Google Maps", 
	"contexts" : ["selection"], 
	"onclick" : selectionOnClick
}); 

/* 
	function omniGM
	- naviagates current tab to Google Maps
	- used by omnibox
 */

function omniGM(inString) {
	if(inString=="") {

			chrome.tabs.create({"url" : "https://www.maps.google.com/", "active" : true});
	} else {
		var input = encodeURIComponent(inString);	
		chrome.tabs.getSelected( undefined, function(tab) {
			chrome.tabs.update(tab.id, {url: "https://www.maps.google.com/maps?q="+input}, undefined);
		}); 
	}
}


//"omnibox" (reacting to users entering "m" in the URL input box)
chrome.omnibox.onInputEntered.addListener(omniGM);
chrome.omnibox.setDefaultSuggestion({"description" : "Find directions to '%s' with Google Maps"});
chrome.omnibox.onInputChanged.addListener(inputChangedGM);


}
