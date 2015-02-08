/* 
	function selectionOnClick
	- sends text to Google Maps
 */

function selectionOnClick(info, tab) {
	sendTextToGM(info.selectionText);
}

/* 
	function sendTextToWA
	- opens a tab Google Maps using the supplied input
 */

function sendTextToGM(inString) {

	var input = encodeURIComponent(inString);
	optionedWA(input);

}

// helper function to deal with the "open in" option

function optionedWA(input) {
	
	if(localStorage["open_in"] == "sametab") {	
		chrome.tabs.getSelected( undefined, function(tab) {
			chrome.tabs.update(tab.id, {url: "http://www.maps.google.com/maps?q="+input}, undefined);
		}); 
	} else {
		chrome.tabs.create({"url" : "http://www.maps.google.com/maps?q=" + input, "active" : true});
	}
	
}

// right click context menu
chrome.contextMenus.create({
	"title" : "Find directions to '%s' with Google Maps", 
	"contexts" : ["selection"], 
	"onclick" : selectionOnClick
}); 

/* 
	function omniWA
	- naviagates current tab to W|A
	- used by omnibox
 */

function omniGM(inString) {
	if(inString=="") {
		if(localStorage["open_in"] == "sametab") {
			chrome.tabs.getSelected( undefined, function(tab) {
				chrome.tabs.update(tab.id, {url: "http://maps.google.com/"}, undefined);
				window.close();	
			}); 
		} else {
			chrome.tabs.create({"url" : "http://www.maps.google.com/", "active" : true});
		}
	} else {
		var input = encodeURIComponent(inString);	
		chrome.tabs.getSelected( undefined, function(tab) {
			chrome.tabs.update(tab.id, {url: "http://www.maps.google.com/maps?q="+input}, undefined);
		}); 
	}
}


//"omnibox" (reacting to users entering "m" in the URL input box)
chrome.omnibox.onInputEntered.addListener(omniGM);
chrome.omnibox.setDefaultSuggestion({"description" : "Find directions to '%s' with Google Maps"});
// chrome.omnibox.onInputChanged.addListener(inputChangedGM);


}
