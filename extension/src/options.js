

// Restores select box state to saved value from localStorage.
function restoreOptions() {

	console.log("restoring");

	var open_in = localStorage["open_in"];
	var showTips = localStorage["showTips"];

	var newtab = document.getElementById("new");
	var sametab = document.getElementById("same");

	var show = document.getElementById("showRadio");
	var dontShow = document.getElementById("dontShowRadio");

	if (!open_in || open_in == "newtab") {
		newtab.checked = true;
	} else {
		sametab.checked = true;
	}

	if (!showTips || showTips == "true") {
		show.checked = true;
	} else {
		dontShow.checked = true;
	}
}

//Get a radio button input value
function getRadioValue(radioButtons) {
	for (var i=0; i < radioButtons.length; i++)
	{
		if(radioButtons[i].checked) {
			return radioButtons[i].value;
		}
	}
}

document.addEventListener('DOMContentLoaded', function () {
	
	restoreOptions();

	document.getElementById("new").onclick = saveTabsOption;
	document.getElementById("same").onclick = saveTabsOption;

	document.getElementById("showRadio").onclick = saveTipsOption;
	document.getElementById("dontShowRadio").onclick = saveTipsOption;
	
});