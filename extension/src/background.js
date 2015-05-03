/* 
	function navigate
	- navigates current tab to Google Maps with search term (if single place) or to/from (if two places)
	- used by omnibox
 */

function navigate(inputString) {

	if(inputString=="") {

		// If empty, then go to Google Maps Search landing page

		chrome.tabs.create({"url" : "https://www.google.ca/maps/search/", "active" : true});
	} 

	else {

		// if the input query contains " to ", split it up and format url correctly

		if (inputString.indexOf(" to ") > -1) {
			var firstPart = inputString.substring(0, inputString.indexOf(" to "));
			firstPart = encodeURIComponent(firstPart);
			// ensure that the string is parsed correctly around "to"
			var secondPart = inputString.substring(inputString.indexOf(" to ") + 4);
			secondPart = secondPart.trim();
		}

		// if user hasn't entered a search term for destination (e.g. "Montreal to"),
		// or simply has typed in only a single phrase (e.g. "Montreal"), then do a normal
		// search

		if (secondPart=="" || (typeof secondPart === 'undefined')) {
			var inputURI = encodeURIComponent(inputString);
			chrome.tabs.getSelected( undefined, function(tab) {
				chrome.tabs.update(tab.id, {url: "https://www.google.ca/maps/search/"+inputURI}, undefined);
			}); 
		}

		// If we have two search terms, then find directions in between them.

		else {
			console.log(secondPart);
			secondPart = encodeURIComponent(secondPart);
			var queryURLdir = "https://www.google.ca/maps/dir/" + firstPart + "\/" + secondPart;
			chrome.tabs.getSelected(undefined, function(tab) {
				chrome.tabs.update(tab.id, {url: queryURLdir}, undefined);
			});
		}
	}
}

/* 
	function suggest
	- suggests top 5 suggestions by querying the Google Geocoding API
*/
function suggest(inputString, suggestions) {

	// suggestions is an array of SuggestResults 

	if(inputString=="") {
		return;
	}

	// if the search query contains "to", split it up and find suggestions for both strings

	if (inputString.indexOf(" to ") > -1) {
		var firstPart = inputString.substring(0, inputString.indexOf(" to "));
		firstPart = encodeURIComponent(firstPart);
		// ensure correct parsing of "from" and "to" parts of the search input
		var secondPart = inputString.substring(inputString.indexOf(" to ") + 4);
		secondPart = secondPart.trim();
	}

	// if user hasn't entered a search term for destination, or not even a 'to'

	if (secondPart=="" || (typeof secondPart === 'undefined')) {
		var inputURI = encodeURIComponent(inputString);

		// use the normal geocoding api to get json response

		var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + inputURI + "&region=ca";
		$.ajax({
			url: queryURL,
			dataType: "json",
			statusCode: {
	        	502: function () {
	        		console.log("Error 502 thrown.")
	        	}
	        },
			success: function (queryResult) {
				// get array of all results
				var results = queryResult.results;
				// if no suggestions found
				if(results.length == 0) {return;}
				// initialize results
				var resultsNames = [];

				var num = Math.min(5, results.length); // a maximum of 5 suggestions
				for (i = 0; i < num; i++) {
					var name = results[i].formatted_address;

					resultsNames.push({
						"content" : name, 
						"description" : "Did you mean: " + '<match>' + name + '</match>'
					});
				}
				suggestions(resultsNames);

			}
		});
	}
	else {
		console.log(secondPart); // debug 
		secondPart = encodeURIComponent(secondPart);

		// use directions api for json response

		var queryURL = "http://maps.googleapis.com/maps/api/directions/json?origin=" + firstPart + "&destination=" + secondPart + "&region=ca";
		$.ajax({
			url: queryURL,
			dataType: "json",
			statusCode: {
	        	502: function () {
	        		console.log("Error 502 thrown.")
	        	}
	        },
			success: function (queryResult) {
				// get array of all routes
				var results = queryResult.routes;
				// if no suggestions found
				if(results.length == 0) {return;}
				// initialize results
				var resultsNames = [];

				var num = Math.min(5, results.length); // a maximum of 5 suggestions
				for (i = 0; i < num; i++) {
					var origin = results[i].legs[0].start_address;
					var dest = results[i].legs[0].end_address;

					var originURI = encodeURIComponent(origin);
					var destURI = encodeURIComponent(dest);

					var newURL = "http://maps.googleapis.com/maps/api/directions/json?origin=" + originURI + "&destination=" + destURI + "&region=ca";

					resultsNames.push({
						"content" : origin + " to " + dest, 
						"description" : "Did you mean: " + '<match>' + origin + '</match>' + " to " + '<match>' + dest + '</match>'
						// TODO: put first name in bold and rest of the address in dim
					});
				}
				suggestions(resultsNames);

			}
		});
	}
}

// Reacting to user entering '#'
chrome.omnibox.onInputChanged.addListener(suggest);
chrome.omnibox.onInputEntered.addListener(navigate);
chrome.omnibox.setDefaultSuggestion({"description" : "Get directions for %s"});