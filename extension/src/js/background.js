var home, work;
var country = '';
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
function get_correct_search_term(rawTerm) {

    var term = rawTerm.trim().toLowerCase();

    if ("home" === term && home !== "") {
        return encodeURIComponent(home);
    } else if ("work" === term && work !== "") {
        return encodeURIComponent(work);
    } else return encodeURIComponent(term);
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
    } else {
        origin = get_correct_search_term(inputString);
    }

    if (dest !== "") {
        dest = get_correct_search_term(dest);
    }

    return [origin, dest];
}

/*
	function get
	- helper function to issue get request
*/
function get(url, callback) {
    var req = new XMLHttpRequest();
    req.open('GET', url);

    req.onload = function() {
        if (req.status == 200) {
            country = JSON.parse(req.response).country.toLowerCase();
            callback(null);
        } else {
            callback(req.statusText);
        }
    };

    req.onerror = function() {
        callback(req.statusText, true);
    };

    req.send();
}

/*
	function navigationBegin
	- navigates current tab to Google Maps with search term (if single place) or to/from (if two places)
	- used by omnibox
 */
function navigationBegin(inputString) {

	if (!country) {
	    get('http://ipinfo.io/json', navigationContinue.bind(null, inputString));
	} else navigationContinue(inputString, null);
}
/*
	function navigationContinue
	- continue navigation
 */
function navigationContinue(inputString, error) {

    var origin, dest;

    var countryTLD = '.com';

    if (error) {
        console.log('Error while trying to get extension dynamically: ' + error);
    } else {
    	countryTLD = '.' + country;
    }

    if (inputString === "") {

        // If empty, then go to Google Maps Search landing page

        chrome.tabs.create({ url: "http://www.google" + countryTLD + "/maps/search/", active: true });
    } else {

        // if the input query contains " to", split it up and format url correctly

        var parsed = parse_input(inputString);
        origin = parsed[0];
        dest = parsed[1];

        // if user hasn't entered a search term for destination (e.g. "Montreal to"),
        // or simply has typed in only a single phrase (e.g. "Montreal"), then do a normal search

        if (dest === "") {
            chrome.tabs.getSelected(undefined, function(tab) {
                chrome.tabs.update(tab.id, { url: "http://www.google" + countryTLD + "/maps/search/" + origin }, undefined);
            })
        }

        // If we have two search terms, then find directions in between them.
        else {
            var queryURLdir = "http://www.google" + countryTLD + "/maps/dir/" + origin + "\/" + dest;
            chrome.tabs.getSelected(undefined, function(tab) {
                chrome.tabs.update(tab.id, { url: queryURLdir }, undefined);
            });
        }
    }
}


/*
	function suggestBegin
	- suggests top 5 suggestions by querying the Google Geocoding API
*/
function suggestBegin(inputString, suggestions) {

	if (!country) {
		get('http://ipinfo.io/json', suggestContinue.bind(null, inputString, suggestions));
    } else suggestContinue(inputString, suggestions, null);
}
/*
	function suggestContinue
	- suggests top 5 suggestions by querying the Google Geocoding API
*/
function suggestContinue(inputString, suggestions, error) {

    var origin, dest;

    if (error) {
        console.log('Error while trying to get extension dynamically: ' + error);
    }

    // NOTE: suggestions is an array of SuggestResults
    // (Check: https://developer.chrome.com/extensions/omnibox)

    if (inputString === "") return;

    // if the search query contains "to", split it up and find suggestions for both strings

    var parsed = parse_input(inputString);
    origin = parsed[0];
    dest = parsed[1];

    // if user hasn't entered a search term for destination, or not even a 'to'

    if (dest === "") {

        // use the normal geocoding api to get json response

        var queryURL = "http://maps.googleapis.com/maps/api/geocode/json?address=" + origin + "&region=" + country;
        $.ajax({
            url: queryURL,
            dataType: "json",
            statusCode: {
                502: function() {
                    console.log("Error 502 thrown.")
                }
            },
            success: function(queryResultO) {

                var results = queryResultO.results; // array

                if (results.length == 0) return;

                var resultsNames = [];

                for (i = 0; i < Math.min(5, results.length); i++) { // max of 5 suggestions
                    var name = results[i].formatted_address;

                    resultsNames.push({
                        "content": name,
                        "description": "Did you mean: " + '<match>' + name + '</match>'
                    });
                }
                suggestions(resultsNames);

            }
        });
    } else { //  Origin AND destination!

        var queryURLO = "https://maps.googleapis.com/maps/api/geocode/json?address=" + origin + "&region=" + country;
        var queryURLD = "https://maps.googleapis.com/maps/api/geocode/json?address=" + dest + "&region=" + country;

        // Use promises in order to nest AJAX calls
        var promise = function sendSecondAJAX() {
            return $.ajax({
                url: queryURLD
            })
        }();

        // Final suggestions list
        all = [];

        // Send origin request
        $.ajax({
            url: queryURLO,
            dataType: "json",
            statusCode: {
                502: function() {
                    console.log("Error 502 thrown.");
                }
            },
            success: function(queryResultO) {

                var Oresults = queryResultO.results; // array

                if (Oresults.length == 0) return;

                var Osuggestions = [];

                // Get list of max 3 suggestions for origin

                for (i = 0; i < Math.min(3, Oresults.length); i++) {
                    var name = Oresults[i].formatted_address;
                    Osuggestions.push(name);
                }

                // On success...

                promise.success(function(queryResultD) {

                    var Dresults = queryResultD.results;

                    if (Dresults.length == 0) return;

                    var Dsuggestions = [];

                    for (i = 0; i < Math.min(2, Dresults.length); i++) {
                        var name = Dresults[i].formatted_address;
                        Dsuggestions.push(name);
                    }

                    for (i = 0; i < Osuggestions.length; i++) {

                        for (j = 0; j < Dsuggestions.length; j++) {
                            var origin = Osuggestions[i];
                            var dest = Dsuggestions[j];
                            all.push({
                                "content": origin + " to " + dest,
                                "description": "Did you mean: " + '<match>' + origin + '</match>' + " to " + '<match>' + dest + '</match>'
                            })
                        }
                    }
                    // Send suggestions
                    suggestions(all);
                })
            }
        });
    }
}



// Reacting to user entering '#'
chrome.omnibox.onInputChanged.addListener(get_options);
chrome.omnibox.onInputChanged.addListener(suggestBegin);
chrome.omnibox.onInputEntered.addListener(navigationBegin);
chrome.omnibox.setDefaultSuggestion({ "description": "Get directions for %s" });
