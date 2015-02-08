/* 
	function omniGM
	- naviagates current tab to Google Maps
	- used by omnibox
 */

function omniGM(inString) {
	if(inString=="") {
		// If empty, then go to Google Maps
		chrome.tabs.create({"url" : "https://www.google.ca/maps/search/", "active" : true});
	} else {
		var input = encodeURIComponent(inString);	
		chrome.tabs.getSelected( undefined, function(tab) {
			chrome.tabs.update(tab.id, {url: "https://www.google.ca/maps/search/"+input}, undefined);
		}); 
	}
}


//"omnibox" (reacting to users entering "#" in the URL input box)
chrome.omnibox.onInputEntered.addListener(omniGM);
chrome.omnibox.setDefaultSuggestion({"description" : "Find directions to '%s' with Google Maps"});
