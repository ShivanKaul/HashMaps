/* 
	function navigate
	- navigates current tab to Google Maps with search terms
	- used by omnibox
 */

function navigate(inputString) {
	if(inputString=="") {
		// If empty, then go to Google Maps
		chrome.tabs.create({"url" : "https://www.google.ca/maps/search/", "active" : true});
	} else {
		var inputURI = encodeURIComponent(inputString);	
		chrome.tabs.getSelected( undefined, function(tab) {
			chrome.tabs.update(tab.id, {url: "https://www.google.ca/maps/search/"+inputURI}, undefined);
		}); 
	}
}


// Reacting to users entering "#" in the omnibox
chrome.omnibox.onInputEntered.addListener(navigate);
chrome.omnibox.setDefaultSuggestion({"description" : "Get directions for %s"});
