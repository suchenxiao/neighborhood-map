// 初始化
function init() {
  
  // 加载地图
  map = new google.maps.Map(document.getElementById('map'), {
	center: {lat: 39.929074, lng: 116.310931},
	zoom: 13
  });
  
  // 初始化标记列表、样式
  Mark.init();
  // 初始化信息窗口
  Info.init();
  // 绘制初始地点标记
  Location.init();
  // 加载搜索框功能
  SearchBox.init();
  
  // 加载视图模型
  ko.applyBindings(new ViewModel());

  
}

//地图对象
var map;

// 标记对象
var Mark = {
	
  init : function() {
    // 储备标记列表
    this.markers = [];
	
	// 储备临时标记
	this.tempMarker = null;
	
    // 设置标记默认样式
	this.defaultIcon = this.makeMarkerIcon('66ccff');
	
	// 设置标记焦点样式
	this.highlightedIcon =  this.makeMarkerIcon('ff3333');
	
  },
    
  // 显示标记列表，并调整地图可视范围
  showMarkers : function() {
	var bounds = new google.maps.LatLngBounds();
	this.markers.forEach(function(marker) {
	  marker.setMap(map);
	  bounds.extend(marker.position);
	});
	map.fitBounds(bounds);
  },
  
  // 隐藏标记列表
  hideMarkers : function() {
	this.markers.forEach(function(marker) {
	  Info.infowindow.setContent('');
	  marker.setMap(null);
	});
  },
	  
  // 绘制标记样式
  makeMarkerIcon : function(markerColor) {
	var markerImage = new google.maps.MarkerImage(
	  'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
	  '|40|_|%E2%80%A2',
	  new google.maps.Size(21, 34),
	  new google.maps.Point(0, 0),
	  new google.maps.Point(10, 34),
	  new google.maps.Size(21,34));
	return markerImage;
  },
  
  // 设置位置标记
  mark : function(location){
	var marker = new google.maps.Marker({
	  position: location.location,
	  title: location.title,
	  animation: google.maps.Animation.DROP,
	  icon: Mark.defaultIcon,
	  id: location.index
	});
	marker.addListener('click', function() {
	  Info.populate(this);
	});
	marker.addListener('mouseover', function() {
	  this.setIcon(Mark.highlightedIcon);
	});
	marker.addListener('mouseout', function() {
	  this.setIcon(Mark.defaultIcon);
	});
	return marker;
  }
  
};

// 信息窗对象
var Info = {
  
  init : function() {
    this.infowindow = new google.maps.InfoWindow();
  },
  
  // 基于标记，显示信息
  populate : function (marker) {
    var infowindow = this.infowindow;
	// 检查点击的窗口是否已打开
	if (infowindow.marker != marker) {
	  // 清除已打开窗口内容
	  infowindow.setContent('');
	  infowindow.marker = marker;
	  // 信息窗关闭后，清除绑定的标记
	  infowindow.addListener('closeclick', function() {
		infowindow.marker = null;
	  });
	  //使用谷歌街景服务
	  var streetViewService = new google.maps.StreetViewService();
	  var radius = 50;
	  function getStreetView(data, status) {
		if (status == google.maps.StreetViewStatus.OK) {
		  var nearStreetViewLocation = data.location.latLng;
		  var heading = google.maps.geometry.spherical.computeHeading(
			nearStreetViewLocation, marker.position);
			infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
			var panoramaOptions = {
			  position: nearStreetViewLocation,
			  pov: {
				heading: heading,
				pitch: 30
			  }
			};
		  var panorama = new google.maps.StreetViewPanorama(
			document.getElementById('pano'), panoramaOptions);
		} else {
		  infowindow.setContent('<div>' + marker.title + '</div>' +
			'<div>No Street View Found</div>');
		}
	  }
	  
	  streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
	  
	  // 打开信息窗口
	  infowindow.open(map, marker);
	}
  },

}
  
// 地点对象
var Location = {
  locations : [
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
	  location: {lat: 39.915898, lng: 116.397211}
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
  ],
  
  init : function() {
    // 为初始地点绘制标记
	this.locations.forEach(function(locationItem){
	  var marker = Mark.mark(locationItem);
	  Mark.markers.push(marker);
	});
    Mark.showMarkers();
  }
  
};

// 搜索框对象
var SearchBox = {
  init : function(){
	// 加载搜索框
	this.box = new google.maps.places.SearchBox(document.getElementById('places-search'));
	// 绑定搜索框
	this.box.setBounds(map.getBounds());
  }
};

// 视图模型
var ViewModel = function() {
  var self = this;

  // 边栏显示，隐藏功能
  this.optionsBoxShow = ko.observable(true);
  this.toggleOptionsBox = function() {
	self.optionsBoxShow(!self.optionsBoxShow());
  }
    
  // 绑定位置列表
  this.locationList = ko.observableArray([]);
  Location.locations.forEach(function(locationItem){
	self.locationList.push(ko.observable(locationItem));
  });
  
  var previewMarker = false;
  
  // 预览位置标记
  this.setTempMarker = function(clickedPosition) {
	Mark.hideMarkers();
	if(Mark.tempMarker!=null) Mark.tempMarker.setMap(null);
	Mark.tempMarker = Mark.mark(clickedPosition);
	Mark.tempMarker.setMap(map);
	
	// 此方法导致直接跳转到对应地图区域，视觉效果较差
	// TODO: 视角平缓移动到目标位置
	var zoom = map.zoom;
	var bounds = new google.maps.LatLngBounds();
	bounds.extend(Mark.tempMarker.position);
	map.fitBounds(bounds);
    map.setZoom(zoom);
	
	previewMarker = true;
  };
  
  // 取消预览
  this.clearTempMarker = function() {
	if(previewMarker) {
	  Mark.tempMarker.setMap(null);
	  Mark.tempMarker = null;
	  Mark.showMarkers();
	  previewMarker = false;
	}
  };
  
  // 点击位置列表
  this.setMarker = function(clickedPosition) {
	self.setTempMarker(clickedPosition);
	previewMarker = false;
  };
  
};
	


