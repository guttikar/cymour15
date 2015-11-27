'use strict';

(function wrapper(){

	var rentalmap; 
	var infobox; // needs to be global so that only one infowindow remains open at a time
	var rentalmap_bounds; // for adjusting the zoom level to fit all stations in view.

	// ID of the Google Spreadsheet
	var rentalSheetID = "1BglSpb_E6p14dqc0Pix-Fots1JkQMkeqOeD7hJp8PeU";
	 
	// Make sure it is public or set to Anyone with link can view 
	var rentalSheetURL = "https://spreadsheets.google.com/feeds/list/" + rentalSheetID + "/od6/public/values?alt=json";

	var styleDarkGrey = [
		{
			"featureType":"all",
			"elementType":"labels.text.fill",
			"stylers":[	{"saturation":36},
						{"color":"#000000"},
						{"lightness":40}
					]
			},
		{
			"featureType":"all",
			"elementType":"labels.text.stroke",
			"stylers":[	{"visibility":"on"},
						{"color":"#000000"},
						{"lightness":16}
					]
			},
		{
			"featureType":"all",
			"elementType":"labels.icon",
			"stylers":[	{"visibility":"off"}
					]
			},
		{
			"featureType":"administrative",
			"elementType":"geometry.fill",
			"stylers":[	{"color":"#000000"},
						{"lightness":20}
					]
			},
		{
			"featureType":"administrative",
			"elementType":"geometry.stroke",
			"stylers":[	{"color":"#000000"},
						{"lightness":17},
						{"weight":1.2}
					]
			},
		{
			"featureType":"landscape",
			"elementType":"geometry",
			"stylers":[	{"color":"#000000"},
						{"lightness":20}
					]
			},
		{
			"featureType":"poi",
			"elementType":"geometry",
			"stylers":[	{"color":"#000000"},
						{"lightness":21}
					]
			},
		{
			"featureType":"road.highway",
			"elementType":"geometry.fill",
			"stylers":[	{"color":"#000000"},
						{"lightness":17}
					]
			},
		{
			"featureType":"road.highway",
			"elementType":"geometry.stroke",
			"stylers":[	{"color":"#000000"},
						{"lightness":29},
						{"weight":0.2}
					]
			},
		{
			"featureType":"road.arterial",
			"elementType":"geometry",
			"stylers":[	{"color":"#000000"},
						{"lightness":18}
					]
			},
		{
			"featureType":"road.local",
			"elementType":"geometry",
			"stylers":[	{"color":"#000000"},
						{"lightness":16}
					]
			},
		{
			"featureType":"transit",
			"elementType":"geometry",
			"stylers":[	{"color":"#000000"},
						{"lightness":19}
					]
			},
		{
			"featureType":"water",
			"elementType":"geometry",
			"stylers":[	{"color":"#686868"},
						{"lightness":1},
						{"weight": 0.1},
						{"gamma": 0.6}
					]
			}
	];

	function initializeMap() {
		var mapDiv = document.getElementById("rentals-map");
		var mapOptions = {
			center: new google.maps.LatLng(18.545013, 73.905668), //maps centered at Kalyani Nagar
			zoom: 12,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		rentalmap = new google.maps.Map(mapDiv, mapOptions);
		// var bikeLayer = new google.maps.BicyclingLayer();
	 //  	bikeLayer.setMap(rentalmap);
		rentalmap_bounds = new google.maps.LatLngBounds();
		rentalmap.set('styles', styleDarkGrey);
	}
	 	

// http GET request function that returns a promise
	function getHTTPFrom(url) {
	  // Return a new promise.
	  return new Promise(function(resolve, reject) {
	    // Do the usual XHR stuff
	    var req = new XMLHttpRequest();
	    req.open('GET', url);

	    req.onload = function() {
	      // This is called even on 404 etc
	      // so check the status
	      if (req.status >= 200 && req.status <300) { // any number between 200 and 299 is successful fetch
	        // Resolve the promise with the response text
	        resolve(req.response);
	      }
	      else {
	        // Otherwise reject with the status text
	        // which will hopefully be a meaningful error
	        reject(Error(req.statusText));
	      }
	    };

	    // Handle network errors
	    req.onerror = function() {
	      reject(Error("Network Error. Please check your network connection"));
	    };

	    // Make the request
	    req.send();
	  });
	}

// get JSON over HTTP
	function getJSONFrom(url){
		
		return getHTTPFrom(url)
				.then(JSON.parse)
				.catch ( function logError(error){
								console.log("Failed to get JSON from " + url + " because of " + error);
							}
				);
	}


	function infoBoxContent(station) {
		var day = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
		var htmlString = "<div class=\"availability\"><h2>"+station.name+"</h2>";
		htmlString += "<p>Total Cycles: "+ station.total +"</p><div class=\"week\">";
		var daily = station.dailyCount;
		for(var i=0;i<daily.length;i++){
			htmlString += "<div class=\"day\"><h4>"+day[i]+"</h4><p>" + daily[i] +"</p></div>";
		}
		htmlString += "</div>"; //End of week div
		htmlString += "</div>"; //End of availability div
		return htmlString;
	}

	function createStation(x){
		var str = x.content.$t;   // This looks like - "lat: 18.545013, lng: 73.905668, totalcycles: 9, monday: 7, ..., sunday:1"
		var arr = [];
		str.split(',').forEach(function(item){  // the split by ',' converts it to an array or strings ["lat: 18.545013",..., "sunday:1"] 
			arr.push(parseInt(item.split(':')[1])); // for each entry in the above array we split it with ':' and push second part (i.e. number) to arr.
		});
		var dailyCount = arr.slice(3); // we drop first three entries - lat, lng and totalcycles for daily available cycles.

		var station = {};
		station["name"] = x.gsx$stationname.$t;
		station["lat"] = x.gsx$lat.$t;
		station["lng"] = x.gsx$lng.$t;
		station["total"] = x.gsx$totalcycles.$t;
		station["dailyCount"] = dailyCount;
		station["infoBoxContent"] = infoBoxContent(station);
		
		return station;
	}

	function makeStationList(jsonObj){
		return new Promise(function (resolve,reject){
			if(jsonObj==='undefined'){
				reject(Error("Empty JSON Object. No data Received."));
			}
			
			var entry = jsonObj.feed.entry; // This contains the array of google Spreadsheet table rows with lots of extrenious info.
			var stationList = [];
			for(var item in entry){
				var station = createStation(entry[item]);
				stationList.push(station);
			} 
			resolve(stationList);
		});
	}

	function addMarker(map, station, location) {
		
		var marker = new google.maps.Marker({
			position: location,
			map: map,
			title: station.name,
			icon: '../img/rental-location-pin.svg',
			animation: google.maps.Animation.DROP
		});
		return marker;
	}
	

	function addInfoBox(map, marker, contentString) {
		google.maps.event.addListener(marker, 'click', function(){
			if(typeof infobox != 'undefined') infobox.close();
			
			infobox = new InfoBox({
		         content: contentString,
		         disableAutoPan: false,
		         // maxWidth: 150,
		         // pixelOffset: new google.maps.Size(-140, 0),
		         zIndex: null,
		        //  boxStyle: {
		        //     background: "url('http://google-maps-utility-library-v3.googlecode.com/svn/trunk/infobox/examples/tipbox.gif') no-repeat",
		        //     opacity: 0.75,
		        //     width: "280px"
		        // },
		        closeBoxMargin: "-12px 0 0 0",
		        // closeBoxURL: "http://www.google.com/intl/en_us/mapfiles/close.gif",
		        // infoBoxClearance: new google.maps.Size(1, 1)
		    });	
	    
	        infobox.open(map, marker);

		});
	}

	function addStationToMap(map, station) {

		var stationLoc = new google.maps.LatLng(station.lat,station.lng);
		rentalmap_bounds.extend(stationLoc);
		var marker = addMarker(map, station, stationLoc);	
		addInfoBox(map, marker,station.infoBoxContent);
	}

// We start fetching spreadsheet data asynchronously before starting to build the map, 
// so that by the time the DOM is ready, our locations array is also ready.
	
	var getRentalData = getJSONFrom(rentalSheetURL).catch(function (error){console.log("failed to getJSON " + error)});	
	var stationListReady = getRentalData.then(makeStationList).catch(function (error) {console.log("failed to make Stationlist because of"+ error)});	
	
	var mapInitialized = Promise.promisifyAll(google.maps.event.addDomListener(window, 'load', initializeMap)); 

	Promise.all([mapInitialized,stationListReady]).then(function stationAdder(resolved) {
		var stationList = resolved[1]; // resolved is an array of resolved promises - mapInitialized and staionListReady
		stationList.forEach(function (station) {
			addStationToMap(rentalmap, station);
	   	});
	   	rentalmap.fitBounds(rentalmap_bounds);
	}).catch(function (error){console.log("failed to add stations to map because of "+ error)});

})(); //End of IIFE wrapper


// var rental_location = [{name: "Kalyani Nagar", content: 9, lat: 18.545013, lng:73.905668},
// 						{name: "Karve Nagar", content: 7, lat:18.494586, lng:73.828946},
// 						{name: "Sinhagad Road", content: 8, lat:18.456755, lng:73.794958}
// 					];

