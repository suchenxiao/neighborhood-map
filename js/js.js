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
	this.placeMarkers = [];
	
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
  hideMarkers : function(markers) {
	markers.forEach(function(marker) {
	  Info.infowindow.setContent('');
	  marker.setMap(null);
	});
  },
  
  // 清空标记列表
  clearMarkers : function() {
	this.hideMarkers(this.markers);
	this.markers = [];
  },
  
  // 重设标记列表
  resetMarkers : function(places) {
    this.clearMarkers();
	this.markerPlaces(places);
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
  
  // 通过地点加载标记
  markerPlaces : function(places) {
	var bounds = new google.maps.LatLngBounds();
	for (var i = 0; i < places.length; i++) {
	  var place = places[i];
	  var icon = {
		url: place.icon,
		size: new google.maps.Size(35, 35),
		origin: new google.maps.Point(0, 0),
		anchor: new google.maps.Point(15, 34),
		scaledSize: new google.maps.Size(25, 25)
	  };
	  var marker = new google.maps.Marker({
		map: map,
		//icon: icon,
		icon: Mark.defaultIcon,
		title: place.name,
		position: place.geometry.location,
		id: place.place_id
	  });
	  marker.addListener('click', function() {
		if (Info.infowindow.marker == this) {
		  console.log("This infowindow already is on this marker!");
		} else {
		  Info.getPlacesDetails(this, Info.infowindow);
		}
	  });
	  marker.addListener('mouseover', function() {
		this.setIcon(Mark.highlightedIcon);
	  });
	  marker.addListener('mouseout', function() {
		this.setIcon(Mark.defaultIcon);
	  });
	  this.markers.push(marker);
	  if (place.geometry.viewport) {
		// Only geocodes have viewport.
		bounds.union(place.geometry.viewport);
	  } else {
		bounds.extend(place.geometry.location);
	  }
	}
	map.fitBounds(bounds);
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
	  // 使用谷歌街景服务获取信息
	  // TODO: 替换成其他内容
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
		  infowindow.setContent('<div>' + marker.title + '</div>');
		}
	  }
	  streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
	  
	  // 打开信息窗口
	  infowindow.open(map, marker);
	}
  },
  
  getPlacesDetails : function(marker, infowindow) {
	  // 使用谷歌地点服务获取信息
	  // TODO: 替换成其他内容
      var service = new google.maps.places.PlacesService(map);
      service.getDetails({
        placeId: marker.id
      }, function(place, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          // Set the marker property on this infowindow so it isn't created again.
          infowindow.marker = marker;
          var innerHTML = '<div>';
          if (place.name) {
            innerHTML += '<strong>' + place.name + '</strong>';
          }
          if (place.formatted_address) {
            innerHTML += '<br>' + place.formatted_address;
          }
          if (place.formatted_phone_number) {
            innerHTML += '<br>' + place.formatted_phone_number;
          }
          if (place.photos) {
            innerHTML += '<br><br><img src="' + place.photos[0].getUrl(
                {maxHeight: 100, maxWidth: 200}) + '">';
          }
          innerHTML += '</div>';
          infowindow.setContent(innerHTML);
          infowindow.open(map, marker);
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
          });
        }
      });
    }

}
  
// 地点对象
var Location = {
  // 初始地点ID
  initPlaceIds : [
    'ChIJWWErs-ZS8DURdcUOnciALOI',
	'ChIJiaRNz-BS8DURW2N_nAufVJU',
	'ChIJtSM60VJT8DURWuNr0zAte2Q',
	'ChIJq4HNm91S8DURZGAQm-3qQ94',
	'ChIJWdpEnCtT8DUR_zktyc2S2lE',
  ],

  // 加载初始地点
  init : function() {

	var service = new google.maps.places.PlacesService(map);
    var details = [];

	this.initPlaceIds.forEach(function(id){
	  service.getDetails({placeId: id}, callback);
	});

	function callback(place, status) {
	  if (status == google.maps.places.PlacesServiceStatus.OK) {
		details.push(place);
	    if(details.length == Location.initPlaceIds.length ) {
		  Location.resetLocations(details);
	      Mark.resetMarkers(details);
		}
	  }
	}
  },

  // 储备地点列表
  locations : ko.observableArray([]),
  // 清空地点列表
  clearLocations : function(){
    this.locations([]);
	this.previewMode = true;
  },
  // 重设地点列表
  resetLocations : function(results){
    this.clearLocations();
	// 将结果转成位置列表格式
	var formatLocations = [];
	for(var i = 0; i < results.length; i++) {
	  formatLocations.push({
		index : i,
		title : results[i].name,
		location : results[i].geometry.location
	  });
	};
	formatLocations.forEach(function(locationItem) {
	  Location.locations.push(ko.observable(locationItem));	
	});
  },
  
};

// 搜索框对象
var SearchBox = {
  init : function(){
	var self = this;
	// 绑定搜索框-自动输入
	this.textBox = new google.maps.places.Autocomplete(document.getElementById('search-text'));
	this.textBox.bindTo('bounds', map);
    /*
	 * 另一种可能的实现方法
    var textBox = new google.maps.places.SearchBox(document.getElementById('search-text'));
    textBox.setBounds(map.getBounds());
	textBox.addListener('places_changed', function() {
         self.textSearchPlaces();
    });
	*/

	// 绑定ko视图模型
	this.searchText = ko.observable("");
	this.search = function(){
	  self.textSearchPlaces();	
	};
  },

  
  textSearchPlaces : function(){
    var bounds = map.getBounds();
	var placesService = new google.maps.places.PlacesService(map);
	placesService.textSearch({
	  query: this.searchText(),
	  bounds: bounds
	}, function(results, status) {
	  if (status === google.maps.places.PlacesServiceStatus.OK) {
		// 将返回的结果删减到10各以内
		while(results.length > 9){
		  results.pop();
		}
		// 重置位置列表
		Location.resetLocations(results);
		// 重置标记列表
		Mark.resetMarkers(results);
		console.log(results);
	  }
	});
  },
};

//通过Instagram获取图片
var Instagram = {

  // 通过文本搜索，返回图片HTML字符串
  searchImage : function(text){

	  $.ajax({
		url: ('https://api.unsplash.com/search/photos?page=1&query=' + text),
		headers: { Authorization : 'Client-ID 950396520af696bc57322dbae069c8dcfc9ead6edb575e736ed1df0beb5b63bb'}
	  })
	  .done(success)
	  .fail(error)
	  
	  function success(images){
		console.log('search image success');
		const firstImg = images.results[0];
		return '<img src=' + firstImg.urls.regular + 'alt=' + searchedForText + '>';
	  }

	  function error(){
		console.log('search image error');
	  }
  }

}

// 视图模型
var ViewModel = function() {
  var self = this;

  // 边栏显示，隐藏功能
  this.optionsBoxShow = ko.observable(true);
  this.toggleOptionsBox = function() {
	self.optionsBoxShow(!self.optionsBoxShow());
  }
    
  // 绑定位置列表
  this.locationList = Location.locations;
  
  // 预览位置标记
  this.previewMarker = function(e) {
	if (Location.previewMode) {
	  Mark.markers[e.index].setIcon(Mark.highlightedIcon);
	}
  };
  
  // 取消预览
  this.previewOver = function(e) {
	if (Location.previewMode) {
	  Mark.markers[e.index].setIcon(Mark.defaultIcon);
	}
  };
  
  // 点击位置列表
  this.zoomMarker = function(e) {
	// 关闭预览模式
	Location.previewMode = false;
	// 设置标记
	Mark.hideMarkers(Mark.markers);
	Mark.markers[e.index].setIcon(Mark.highlightedIcon);
	Mark.markers[e.index].setMap(map);
	// 视角聚焦到目标位置
	map.setCenter(e.location);
	// 加载信息
	Info.populate(Mark.markers[e.index]);
  };
  
  this.searchBox = ko.observable(SearchBox);
};
	


