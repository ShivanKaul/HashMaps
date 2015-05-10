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

		// if the input query contains " to", split it up and format url correctly

		if (inputString.indexOf(" to") > -1) {
			var firstPart = inputString.substring(0, inputString.indexOf(" to"));
			firstPart = encodeURIComponent(firstPart);
			// ensure that the string is parsed correctly around "to"
			var secondPart = inputString.substring(inputString.indexOf(" to") + 4);
			secondPart = secondPart.trim();
		}

		// if user hasn't entered a search term for destination (e.g. "Montreal to"),
		// or simply has typed in only a single phrase (e.g. "Montreal"), then do a normal
		// search

		if (secondPart=="" || (typeof secondPart === 'undefined')) {
			// Correct parsing of destinationA to
			if (typeof firstPart === 'undefined') {
				inputURI = encodeURIComponent(inputString);
			}
			else inputURI = firstPart
			chrome.tabs.getSelected( undefined, function(tab) {
				chrome.tabs.update(tab.id, {url: "https://www.google.ca/maps/search/"+inputURI}, undefined);
			}); 
		}

		// If we have two search terms, then find directions in between them.

		else {
			// console.log(secondPart);
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

	if (inputString.indexOf(" to") > -1) {
		// console.log("Found to")
		var firstPart = inputString.substring(0, inputString.indexOf(" to"));
		firstPart = encodeURIComponent(firstPart);
		// ensure correct parsing of "from" and "to" parts of the search input
		var secondPart = inputString.substring(inputString.indexOf(" to") + 4);
		secondPart = secondPart.trim();
	}

	// if user hasn't entered a search term for destination, or not even a 'to'

	if (secondPart=="" || (typeof secondPart === 'undefined')) {
		// Correct parsing of origin
		if (typeof firstPart === 'undefined') {
			inputURI = encodeURIComponent(inputString);
		}
		else inputURI = firstPart

		// use the normal geocoding api to get json response

		var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + inputURI + "&region=" + country;
		$.ajax({
			url: queryURL,
			dataType: "json",
			statusCode: {
	        	502: function () {
	        		console.log("Error 502 thrown.")
	        	}
	        },
			success: function (queryResultO) {
				// get array of all results
				var results = queryResultO.results;
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
		// console.log("Second part: " + secondPart);  
		secondPart = encodeURIComponent(secondPart);

		var queryURLO = "https://maps.googleapis.com/maps/api/geocode/json?address=" + firstPart + "&region=" + country;
		var queryURLD = "https://maps.googleapis.com/maps/api/geocode/json?address=" + secondPart + "&region=" + country;
		
		function sendSecondAJAX() {
			return $.ajax({
				url: queryURLD
			})
		}

		// Use promises in order to nest AJAX calls
		var promise = sendSecondAJAX()

		// Final suggestions list
		all = []

		// Send origin request
		$.ajax({
			url: queryURLO,
			dataType: "json",
			statusCode: {
	        	502: function () {
	        		console.log("Error 502 thrown.")
	        	}
	        },
			success: function (queryResultO) {
				// get array of results for origin suggestions
				var Oresults = queryResultO.results;
				// if no suggestions found
				if(Oresults.length == 0) {return;}

				var Osuggestions = []
				// Get list of max 3 suggestions for origin
				for (i = 0; i < Math.min(3, Oresults.length); i++) {
					var name = Oresults[i].formatted_address
					Osuggestions.push(name)
				}
				// On success...
				promise.success(function (queryResultD) {
					var Dresults = queryResultD.results;
					if(Dresults.length == 0) {return;}
					var Dsuggestions = []
					for (i = 0; i < Math.min(2, Dresults.length); i++) {
						var name = Dresults[i].formatted_address
						Dsuggestions.push(name)
					}
					for (i = 0; i < Osuggestions.length; i++) {
						for (j = 0; j < Dsuggestions.length; j++) {
						var origin = Osuggestions[i]
						var dest = Dsuggestions[j]
						all.push({
							"content" : origin + " to " + dest, 
							"description" : "Did you mean: " + '<match>' + origin + '</match>' + " to " + '<match>' + dest + '</match>'
						})
							
						}
					}
					// Send suggestions
					suggestions(all)


				})
			}
		});
	}
}

// Reacting to user entering '#'
chrome.omnibox.onInputChanged.addListener(suggest);
chrome.omnibox.onInputEntered.addListener(navigate);
chrome.omnibox.setDefaultSuggestion({"description" : "Get directions for %s"});