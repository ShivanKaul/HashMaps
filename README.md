HashMaps
-------------

[HashMaps](https://chrome.google.com/webstore/detail/hashmaps/ncbcjemlgfabkoebboepbofhbmhekion) lets you search for places and directions straight from the address bar. [Blog entry](http://shivankaulsahib.me/blog/2015/02/28/hashmaps.html).

####How to Use:
In the address bar (called an Omnibox in Chrome), type in # (the hash/pound/hashtag symbol), and press either Space or Tab. Now look for places or directions.

#####Searching for Places:
Simply type in the name of the place, and press Enter. Example: "McGill University". [Screencast.](https://www.youtube.com/watch?v=zGTYNvsGLgU)

#####Searching for Directions:
Type in the origin and the destination separated by a 'to', and press Enter. Example: "Montreal to New York". [Screencast.](https://www.youtube.com/watch?v=VPGPeumO-d4)

Great for when the internet speed is slow and you don't want to take the unnecessary step of first loading the Google Maps landing page. 

####What's New:
- Region Biasing: Using some Geolocating, I'm able to get the user's country code which I then use to bias the Google Maps API results, [extremely unsuccessfully](http://stackoverflow.com/questions/2647086/googles-geocoder-returns-wrong-country-ignoring-the-region-hint). 
- Suggestions! Start typing and see suggested locations. Don't worry, your search history isn't saved at all: all suggestions are created dynamically when you type by smartly interacting with the Google Maps API.
