var lng = [];
var lat = [];
var radius=[];
var name=[];
var username = "evioapi@evio.in";
var password = "@dm1n3v10";
	
function make_base_auth(user, password) {
  var tok = user + ':' + password;
  var hash = btoa(tok);
  return "Basic " + hash;
}
$.ajax({
	type: "GET",
		url: 'https://evio.eztraxs.com/api/zone-details',
	contentType: "application/json; charset=utf-8",
	dataType: "json",
	success: function (data) {
		document.getElementById("id2").innerHTML = data.zonesCreated;
		document.getElementById("id1").innerHTML = data.registeredPersons;
	
		for (i = 0; i < data.zoneDetails.length; i++) {
		
			radius.push(data.zoneDetails[i].zone.radius);
			name[i]=data.zoneDetails[i].zoneName;
			lng.push(data.zoneDetails[i].zone.lng);
			lat.push(data.zoneDetails[i].zone.lat);
		}
		console.log();

		one(lng,lat,name,radius);

		document.getElementById("lng").innerHTML = lng;
		document.getElementById("lat").innerHTML = lat;
	}
	
	,
beforeSend: function (xhr) {
xhr.setRequestHeader('Authorization', make_base_auth(username, password));
}
});
var map = L.map('map', { attributionControl: false }).setView([20.5937, 78.9629], 5);
L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=EzYeYOL1fSlnjAO0FTCT').addTo(map);

console.log(lat.length);
function one(lat,lng,name,radius)
{
	console.log(name)
this.lat=lat;
this.lng=lng;
//console.log(this.lat);
var circle=[]
for (i = 0; i < lat.length; i++) {
	circle[i] = L.circle([lng[i], lat[i]], {
	color: 'red',
	fillColor: '#f03',
	fillOpacity: 0.5,
	radius: radius[i]
}).addTo(map);

}

//bing
var BING_KEY = 'AuhiCJHlGzhg93IqUH_oCpl_-ZUrIE6SPftlyGYUvr9Amx5nzA-WqGcPquyFZl4L'
var bingRoadLayer = L.tileLayer.bing({ bingMapsKey: BING_KEY, imagerySet: 'Road' }).addTo(map)
var bingAerialLayer = L.tileLayer.bing({ bingMapsKey: BING_KEY, imagerySet: 'AerialWithLabels' }).addTo(map)

//OverLayer Control		
var baseMaps = {
	'map' : map,
	'bing-Road': bingRoadLayer,
	'bing-Aerial': bingAerialLayer

};
var overlayMaps = {

};
L.control.layers(baseMaps, overlayMaps).addTo(map);
//add scale
L.control.scale().addTo(map);
}
