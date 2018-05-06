var map;
function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
	center: {lat: 39.929074, lng: 116.310931},
	zoom: 13
  });
}