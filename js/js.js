// 地图变量
var map;
// 储备标记列表
var markers = [];
// 初始地点
var initialLocations = [
	{
	  index : 0,
	  title : '故宫博物院',
	  location: {lat: 39.923841, lng: 116.389809}
	},
	{
	  index : 1,
	  title : '西单图书大厦',
	  location: {lat: 39.919826, lng: 116.394788}
	},
	{
	  index : 2,
	  title : '天安门',
	  location: {lat: 39.919826, lng: 116.394788}
	},
	{
	  index : 3,
	  title : '王府井步行街',
	  location: {lat: 39.9105551, lng: 116.4103644}
	},
	{
	  index : 4,
	  title : '景山公园',
	  location: {lat: 39.9241704, lng: 116.3921251}
	}
];

// 初始化
function initMap() {
  // 加载地图
  map = new google.maps.Map(document.getElementById('map'), {
	center: {lat: 39.929074, lng: 116.310931},
	zoom: 13
  });
  // 加载搜索框
  var searchBox = new google.maps.places.SearchBox(document.getElementById('places-search'));
  // 绑定搜索框
  searchBox.setBounds(map.getBounds());
  // 加载信息窗口
  var largeInfowindow = new google.maps.InfoWindow();
  // 设置标记默认样式
  var defaultIcon = makeMarkerIcon('0091ff');
  // 设置标记焦点样式
  var highlightedIcon = makeMarkerIcon('FFFF24');
		
  // 为初始地点绘制标记
  initialLocations.forEach(function(locationItem){
	var position = locationItem.location;
	var title = locationItem.title;
	var id = locationItem.index;
	var marker = new google.maps.Marker({
	  position: position,
	  title: title,
	  animation: google.maps.Animation.DROP,
	  icon: defaultIcon,
	  id: id
	});
	marker.addListener('click', function() {
	  //populateInfoWindow(this, largeInfowindow);
	});
	marker.addListener('mouseover', function() {
	  this.setIcon(highlightedIcon);
	});
	marker.addListener('mouseout', function() {
	  this.setIcon(defaultIcon);
	});
	// 放入markers列表
	markers.push(marker);
  });
			
  // 加载UI
  (function() {
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
	showMarkers(markers);
  })()
  
}


// 显示标记列表，并调整地图可视范围
function showMarkers(markers) {
  var bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < markers.length; i++) {
	markers[i].setMap(map);
	bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}

// 隐藏标记列表
function hideMarkers(markers) {
  for (var i = 0; i < markers.length; i++) {
	markers[i].setMap(null);
  }
}
	  
// 绘制标记样式
function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
	'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
	'|40|_|%E2%80%A2',
	new google.maps.Size(21, 34),
	new google.maps.Point(0, 0),
	new google.maps.Point(10, 34),
	new google.maps.Size(21,34));
  return markerImage;
}