HashMaps
-------------

[HashMaps](https://chrome.google.com/webstore/detail/hashmaps/ncbcjemlgfabkoebboepbofhbmhekion) is a Chrome Extension that lets you search for places and directions straight from the address bar. 

####How to Use:
Install [here](https://chrome.google.com/webstore/detail/hashmaps/ncbcjemlgfabkoebboepbofhbmhekion). Once installed, in the address bar, type in **#**, and press either Space or Tab. Now look for places or directions.

#####Searching for Places:
Simply type in the name of the place, and press Enter. Example: "McGill University". [Screencast.](https://www.youtube.com/watch?v=zGTYNvsGLgU)

#####Searching for Directions:
Type in the origin and the destination separated by a 'to', and press Enter. Example: "Montreal to New York". [Screencast.](https://www.youtube.com/watch?v=VPGPeumO-d4)

####Motivation
While travelling in India, I often want to look up directions and places on Google Maps. But given that internet speeds are still somewhat iffy, the process is a pain. To look up directions, I have to first load maps.google.com, then enter locations, and then search. That extra step of loading the landing page significantly slows things down.

But that's not why I wrote HashMaps.

Given Chrome's excellent address bar - Omnibox - I now no longer have to go to google.com to search for something; I can just search from the address bar (this is of course also true for Firefox, but it sometimes craps out when it sees a colon: it thinks you're supplying a port). The process feels much more natural. That was the idea behind this extension. I use Google Maps on a regular basis, and the extra step of going to maps.google.com seemed unnecessary. I should be able to search for directions using my address bar, just like I use it for searching for other things.

That, and I'm lazy.

####Blog entry
[2015-02-28: HashMaps](http://shivankaulsahib.me/blog/2015/02/28/hashmaps.html).

####Credits:
Icon credits: [Freepik](http://www.flaticon.com/authors/freepik).

####What's New:
- Stored **Home** and **Work** locations: There's an Options page for the extension where you can set addresses for your home and work place. This Options page can be easily accessed by clicking on the extension icon next to the address bar. Now, when you type in '**Home**' or '**Work**' as a search query the extension will automatically use your stored address for that location.
- Region Biasing: Using some Geolocating, I'm able to get the user's country code which I then use to bias the Google Maps API results, [extremely unsuccessfully](http://stackoverflow.com/questions/2647086/googles-geocoder-returns-wrong-country-ignoring-the-region-hint). 
- Suggestions! Start typing and see suggested locations. Don't worry, your search history isn't saved at all: all suggestions are created dynamically when you type by smartly interacting with the Google Maps API.
