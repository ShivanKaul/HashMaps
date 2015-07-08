var home, work;

/* 
	function get_options
	- if user has defined addresses, get them
	- used to catch keywords entered by user and use them
 */
function get_options() {

  chrome.storage.sync.get({
  	homeAddress: '',
  	workAddress: ''
  }, function(items) {
    home = items.homeAddress;
    work = items.workAddress;
  });
  
}

/* 
	function get_correct_search_term
	- if user has defined addresses, use them instead of 'home' or 'work' or whatever and encode.
	- else, simply uri encode
 */

 function get_correct_search_term(term) {

 	term = term.trim()

 	if ("home" === term && home !== "") {
 		return encodeURIComponent(home);
 	}
 	else if ("work" === term && work !== "") {
 		return encodeURIComponent(work);
 	}
 	else return encodeURIComponent(term);

 }

 /* 
	function parse_input
	- get origin and dest, URL encoded, from input
 */

 function parse_input(inputString) {

 	var origin, dest = "";

 // NOTE: ~bar.indexOf("foo") is a nicer way of saying: if bar contains foo then give truthy value else falsy

 	if (~inputString.indexOf(" to")) {
			origin = inputString.substring(0, inputString.indexOf(" to"));
			origin = get_correct_search_term(origin);

			// ensure that the string is parsed correctly around "to"

			dest = inputString.substring(inputString.indexOf(" to") + 4);
			dest = dest.trim();
	}
	else {
		origin = get_correct_search_term(inputString);
	}

	if (dest !== "") {
		dest = get_correct_search_term(dest)
	}

	return [origin, dest]
 }


/* 
	function navigate
	- navigates current tab to Google Maps with search term (if single place) or to/from (if two places)
	- used by omnibox
 */

function navigate(inputString) {

	var origin, dest;

	if (inputString === "") {

		// If empty, then go to Google Maps Search landing page

		chrome.tabs.create({"url" : "https://www.google.ca/maps/search/", "active" : true});
	} 
	else {

		// if the input query contains " to", split it up and format url correctly

		var parsed = parse_input(inputString);
		origin = parsed[0];
		dest = parsed[1];

		// if user hasn't entered a search term for destination (e.g. "Montreal to"),
		// or simply has typed in only a single phrase (e.g. "Montreal"), then do a normal search

		if (dest === "") {
			chrome.tabs.getSelected(undefined, function(tab) {
				chrome.tabs.update(tab.id, {url: "https://www.google.ca/maps/search/" + origin}, undefined);
			})
		}

		// If we have two search terms, then find directions in between them.

		else {
			// console.log(dest);
			var queryURLdir = "https://www.google.ca/maps/dir/" + origin + "\/" + dest;
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

	var origin, dest;

	// NOTE: suggestions is an array of SuggestResults (Check: https://developer.chrome.com/extensions/omnibox)

	if (inputString === "") return;

	// if the search query contains "to", split it up and find suggestions for both strings

	var parsed = parse_input(inputString);
	origin = parsed[0];
	dest = parsed[1];

	// if user hasn't entered a search term for destination, or not even a 'to'

	if (dest === "") {

		// use the normal geocoding api to get json response

		var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + origin + "&region=" + country;
		$.ajax({
			url: queryURL,
			dataType: "json",
			statusCode: {
	        	502: function () {
	        		console.log("Error 502 thrown.")
	        	}
	        },
			success: function (queryResultO) {

				var results = queryResultO.results; // array

				if (results.length == 0) return;

				var resultsNames = [];

				for (i = 0; i < Math.min(5, results.length); i++) { // max of 5 suggestions
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

	else { //  Origin AND destination!

		// console.log("Second part: " + dest); 

		var queryURLO = "https://maps.googleapis.com/maps/api/geocode/json?address=" + origin + "&region=" + country;
		var queryURLD = "https://maps.googleapis.com/maps/api/geocode/json?address=" + dest + "&region=" + country;

		// Use promises in order to nest AJAX calls
		var promise = function sendSecondAJAX() {
			return $.ajax({
				url: queryURLD
			})
		}();

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

				var Oresults = queryResultO.results; // array

				if (Oresults.length == 0) return;

				var Osuggestions = []

				// Get list of max 3 suggestions for origin

				for (i = 0; i < Math.min(3, Oresults.length); i++) {
					var name = Oresults[i].formatted_address
					Osuggestions.push(name)
				}

				// On success...

				promise.success(function (queryResultD) {

					var Dresults = queryResultD.results;

					if (Dresults.length == 0) return;

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
chrome.omnibox.onInputChanged.addListener(get_options);
chrome.omnibox.onInputChanged.addListener(suggest);
chrome.omnibox.onInputEntered.addListener(navigate);
chrome.omnibox.setDefaultSuggestion({"description" : "Get directions for %s"});