'use strict';


var rentalmap; 
var infowindow; // needs to be global so that only one infowindow remains open at a time
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
// var styleYellowGreen = [{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"visibility":"on"},{"color":"#0096aa"},{"weight":"0.30"},{"saturation":"-75"},{"lightness":"5"},{"gamma":"1"}]},{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#0096aa"},{"saturation":"-75"},{"lightness":"5"}]},{"featureType":"administrative","elementType":"labels.text.stroke","stylers":[{"color":"#ffe146"},{"visibility":"on"},{"weight":"6"},{"saturation":"-28"},{"lightness":"0"}]},{"featureType":"administrative","elementType":"labels.icon","stylers":[{"visibility":"on"},{"color":"#e6007e"},{"weight":"1"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#ffe146"},{"saturation":"-28"},{"lightness":"0"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"color":"#0096aa"},{"visibility":"simplified"},{"saturation":"-75"},{"lightness":"5"},{"gamma":"1"}]},{"featureType":"road","elementType":"labels.text","stylers":[{"visibility":"on"},{"color":"#ffe146"},{"weight":8},{"saturation":"-28"},{"lightness":"0"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"visibility":"on"},{"color":"#0096aa"},{"weight":8},{"lightness":"5"},{"gamma":"1"},{"saturation":"-75"}]},{"featureType":"road","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"simplified"},{"color":"#0096aa"},{"saturation":"-75"},{"lightness":"5"},{"gamma":"1"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#0096aa"},{"saturation":"-75"},{"lightness":"5"},{"gamma":"1"}]},{"featureType":"water","elementType":"labels.text","stylers":[{"visibility":"simplified"},{"color":"#ffe146"},{"saturation":"-28"},{"lightness":"0"}]},{"featureType":"water","elementType":"labels.icon","stylers":[{"visibility":"off"}]}];
// var styleVintage = [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"administrative.country","elementType":"geometry.fill","stylers":[{"color":"#e7d5ba"}]},{"featureType":"administrative.locality","elementType":"labels.text.fill","stylers":[{"color":"#615439"}]},{"featureType":"administrative.land_parcel","elementType":"geometry.fill","stylers":[{"color":"#e7d5ba"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"color":"#e7d5ba"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#eee4d4"},{"visibility":"on"}]},{"featureType":"landscape.man_made","elementType":"geometry.stroke","stylers":[{"color":"#eee4d4"}]},{"featureType":"landscape.man_made","elementType":"labels.text.fill","stylers":[{"color":"#eee4d4"}]},{"featureType":"landscape.natural","elementType":"geometry.fill","stylers":[{"visibility":"on"}]},{"featureType":"landscape.natural.terrain","elementType":"geometry.fill","stylers":[{"saturation":"0"}]},{"featureType":"landscape.natural.terrain","elementType":"labels.text.fill","stylers":[{"color":"#eee4d4"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#fcefd2"}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#fcefd2"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#fcefd2"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"hue":"#ffb000"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"geometry.stroke","stylers":[{"color":"#fcefd2"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#7dacbc"},{"visibility":"on"}]}];

function initializeMap() {
	var mapDiv = document.getElementById("rentals-map");
	var mapOptions = {
		center: new google.maps.LatLng(18.545013, 73.905668), //maps centered at Kalyani Nagar
		zoom: 12,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	rentalmap = new google.maps.Map(mapDiv, mapOptions);
	// var bikeLayer = new google.maps.BicyclingLayer();
  	// bikeLayer.setMap(rentalmap);
	rentalmap_bounds = new google.maps.LatLngBounds();
	rentalmap.set('styles', styleDarkGrey);
}

google.maps.event.addDomListener(window, 'load',initializeMap);
 	
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

function infoWindowContent(station) {
	var str = "<div class=\"availability\"><h2>"+station.name+"</h2>";
	str += "<span>Availability</span><p>Total Cycles: "+ station.total +"</p>";
	str += "<table><tbody><tr><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th><th>Sun</th></tr>";
	str += "<tr>";
	var daily = station.dailyCount;
	for(var i=0;i<daily.length;i++){
		str += "<td>" + daily[i] +"</td>";
	}
	str += "</tr></tbody></table>";
	str += "</div>";
	return str;
}

function addInfoWindow(map, marker, contentString) {
	google.maps.event.addListener(marker, 'click', function(){
		if(typeof infowindow != 'undefined') infowindow.close();
		
		infowindow = new google.maps.InfoWindow({
			content: contentString
		});

		infowindow.open(map, marker);
	});	
}

function addStationToMap(map, station) {

	var stationLoc = new google.maps.LatLng(station.lat,station.lng);
	rentalmap_bounds.extend(stationLoc);
	var marker = addMarker(map, station, stationLoc);	
	addInfoWindow(map, marker,infoWindowContent(station));
}

function createStation(x){
	var str = x.content.$t;   // This looks like - "lat: 18.545013, lng: 73.905668, totalcycles: 9, monday: 7, ..., sunday:1"
	var arr = [];
	str.split(',').forEach(function(item){  // the slit by ',' converts it to an array or strings ["lat: 18.545013",..., "sunday:1"] 
		arr.push(parseInt(item.split(':')[1])); // for each entry in the above array we split it with ':' and push second part (i.e. number) to arr.
	});
	var dailyCount = arr.slice(3); // we drop first three entries - lat, lng and totalcycles for daily available cycles.

	var station = {};
	station["name"] = x.gsx$stationname.$t;
	station["lat"] = x.gsx$lat.$t;
	station["lng"] = x.gsx$lng.$t;
	station["total"] = x.gsx$totalcycles.$t;
	station["dailyCount"] = dailyCount;

	return station;
}
	
$.getJSON(rentalSheetURL, function(data) {
 
	var entry = data.feed.entry; // This contains the array of table rows with lots of extrenious info.
 	
   	for(var item in entry){
  
   		var station = createStation(entry[item]);
		addStationToMap(rentalmap, station);
   	}
   	rentalmap.fitBounds(rentalmap_bounds);


});





// var infowindow;

	// var rental_location = [{name: "Kalyani Nagar", content: 9, lat: 18.545013, lng:73.905668},
	// 						{name: "Karve Nagar", content: 7, lat:18.494586, lng:73.828946},
	// 						{name: "Sinhagad Road", content: 8, lat:18.456755, lng:73.794958}
	// 					];
