$.get("http://ipinfo.io", function(response) {
	country = response.country
}, "json");