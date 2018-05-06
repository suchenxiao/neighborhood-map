// 加载地图
var map;
function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
	center: {lat: 39.929074, lng: 116.310931},
	zoom: 13
  });
}

// 加载数据
$(function(){
  var initialLocations = [
	{
	  index : 0,
	  title : 'Location 1',
	  location: {lat: 39.929074, lng: 116.310931}
	},
	{
	  index : 1,
	  title : 'Location 2',
	  location: {lat: 39.929074, lng: 116.310931}
	},
	{
	  index : 2,
	  title : 'Location 3',
	  location: {lat: 39.929074, lng: 116.310931}
	}
  ];
 
  
  var Location = function(data) {
    this.title = ko.observable(data.title);
  };

  var ViewModel = function() {
    var self = this;
	
    this.locationList = ko.observableArray([]);
    initialLocations.forEach(function(locationItem){
      self.locationList.push(new Location(locationItem));
    });
    
	this.optionsBoxShow = ko.observable(true);
	this.toggleOptionsBox = function() {
	  self.optionsBoxShow(!self.optionsBoxShow());
    }
  };
  
  ko.applyBindings(new ViewModel());
});