var map, searchManager;
let userPos;
var myMapStyle = {
	"elements": {
		"water": { "fillColor": "#a1e0ff" },
		"waterPoint": { "iconColor": "#a1e0ff" },
		"transportation": { "strokeColor": "#aa6de0" },
		"road": { "fillColor": "#b892db" },
		"railway": { "strokeColor": "#a495b2" },
		"structure": { "fillColor": "#ffffff" },
		"runway": { "fillColor": "#ff7fed" },
		"area": { "fillColor": "#f39ebd" },
		"political": { "borderStrokeColor": "#fe6850", "borderOutlineColor": "#55ffff" },
		"point": { "iconColor": "#ffffff", "fillColor": "#FF6FA0", "strokeColor": "#DB4680" },
		"transit": { "fillColor": "#AA6DE0" }
	},
	"version": "1.0" 
};

function GetMap() {
//Get the map with the constructor Microsoft.Maps	
	map = new Microsoft.Maps.Map('#myMap', {
		customMapStyle: myMapStyle
	});
//Get the Searchbox with autosuggest
	Microsoft.Maps.loadModule(['Microsoft.Maps.AutoSuggest', 'Microsoft.Maps.Search'], function () {
		var manager = new Microsoft.Maps.AutosuggestManager({ map: map });
		manager.attachAutosuggest('#searchBox', '#searchBoxContainer', suggestionSelected);

		searchManager = new Microsoft.Maps.Search.SearchManager(map);
	});

//REQUEST USERS LOCATION
	navigator.geolocation.getCurrentPosition(function (position) {
		var loc = new Microsoft.Maps.Location(
			position.coords.latitude,
			position.coords.longitude);

		userPos = `${loc.latitude},${loc.longitude}`;	
		console.log(userPos);
		
		//Add a pushpin at the user's location.
		var pin = new Microsoft.Maps.Pushpin(loc);
		map.entities.push(pin);
	
		//Center the map on the user's location.
		map.setView({ center: loc, zoom: 17 });
		getElevation(userPos);
	});
	
};

//IF A SUGGESTION IS SELECTED BY USER
function suggestionSelected(result) {
	//Remove previously results from the map.
	map.entities.clear();

	//Show the suggestion as a pushpin and center map over it.
	var pin = new Microsoft.Maps.Pushpin(result.location);
	map.entities.push(pin);

	map.setView({ center: result.location, zoom: 17 });
	getElevation(`${result.location.latitude},${result.location.longitude}`);
}

//IF USER CLICKS ON SEARCH-BUTTON
document.querySelector('#searchButton').addEventListener("click", e => {
	e.preventDefault(); //Prevent page from reloading when clicked
	setTimeout(function(){ //setting a timeout to make sure the result list have its full length before scrolling down.
		document.getElementById("output").scrollIntoView(); //Scroll down to result
	}, 200);

	
	geocode();
});
function geocode() {
	//Remove previous results from the map.
	map.entities.clear();

	//Get users query and geocode it.
	var query = document.getElementById('searchBox').value;

	var searchRequest = {
		where: query,
		callback: function (r) {
			if (r && r.results && r.results.length > 0) {
				var pin, pins = [], locs = [], output = '<h3><span>👇🏻</span> Results <span>👇🏻</span></h3>';

				//Add a pushpin for each result to the map and create a list to display.
				for (var i = 0; i < r.results.length; i++) {
					//Create a pushpin for each result.	
					pin = new Microsoft.Maps.Pushpin(r.results[i].location, {
						text: i + 1 + ''
					});

					pins.push(pin);
					locs.push(r.results[i].location);
					console.log(r.results[i].location);
					//output += `<a onclick="pinChosenLoc('${r.results[i].location.latitude},${r.results[i].location.longitude}')">${r.results[i].name}</a></br>`;
					output += `<a class="searchRes" onclick="getElevation('${r.results[i].location.latitude},${r.results[i].location.longitude}'), pinChosenLoc()">${r.results[i].name}</a></br>`;
					console.log(output);
					//getElevation(`${r.results[i].location.latitude},${r.results[i].location.longitude}`);
				}

				//Add the pins to the map
				map.entities.push(pins);

				//Display list of results
				document.getElementById('output').innerHTML = output;

				//Determine a bounding box to best view the results.
				var bounds;

				if (r.results.length == 1) {
					bounds = r.results[0].bestView;
				} else {
					//Use the locations from the results to calculate a bounding box.
					bounds = Microsoft.Maps.LocationRect.fromLocations(locs);
				}

				map.setView({ bounds: bounds, padding: 30 });
			}
		},
		errorCallback: function (e) {
			document.getElementById('output').innerHTML = "No results found.";
		}
	};

	//Make the geocode request.
	searchManager.geocode(searchRequest);
}

const pinChosenLoc = (position) => {
		document.querySelector("main").scrollIntoView(); //scroll up to top (main)
	/*console.log(position);
	var pin = new Microsoft.Maps.Pushpin(position);
	map.entities.push(pin);

	//Center the map on the user's location.
	map.setView({ center: position, zoom: 17 });
	getElevation(`${position.latitude},${position.longitude}`);
	*/
}

//GET ELEVATION DATA FROM API
const getElevation = async (position) => {
	const res = await fetch(`http://dev.virtualearth.net/REST/v1/Elevation/List?points=${position}&key=AkwltF7UfGW9gmhG9mJp23mExWCOZHB2R6wxP6W52Jb52z9KDDGhEZOpOlhZtMnI`);

	const result = await res.json();
	const elevation = result.resourceSets[0].resources[0].elevations[0];
	
	console.log(position);
	console.log(elevation);

	document.querySelector('#elevation').innerHTML = `<span class="countup">${elevation}</span><span>m</span>`;

	runAnimations();
};


GetMap();

