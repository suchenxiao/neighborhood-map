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
      marker.setVisible(true);
      bounds.extend(marker.position);
    });
    map.fitBounds(bounds);
  },

  // 隐藏标记列表
  hideMarkers : function() {
    this.markers.forEach(function(marker) {
      marker.setVisible(false);
    });
  },

  // 清空标记列表
  clearMarkers : function() {
    this.markers.forEach(function(marker) {
      marker.setMap(null);
    });
    this.markers = [];
  },

  // 重设标记列表
  resetMarkers : function(places) {
    this.clearMarkers();
    this.markerPlaces(places);
  },

  // 重置标记样式
  resetIcons : function() {
    this.markers.forEach(function(mark){
      mark.setIcon(Mark.defaultIcon);
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

  // 为标记添加动画
  addAnimation : function(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
        marker.setAnimation(null);
    }, 1380);
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
          Mark.resetIcons();
          this.setIcon(Mark.highlightedIcon);
          Mark.addAnimation(this);
          map.setCenter(this.getPosition());
          Location.previewMode = false;
          Info.getPlacesDetails(this, Info.infowindow);
        }
      });
      marker.addListener('mouseover', function() {
        this.setIcon(Mark.highlightedIcon);
      });
      marker.addListener('mouseout', function() {
        if (Info.infowindow.marker != this) {
          this.setIcon(Mark.defaultIcon);
        }
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

      // 使用谷歌街景服务获取信息
      this.getPlacesDetails(marker, infowindow);

      // 打开信息窗口
      infowindow.open(map, marker);
    }
  },

  getPlacesDetails : function(marker, infowindow) {
      // 使用谷歌地点服务获取信息,图片以Instagram作为备选项
      var service = new google.maps.places.PlacesService(map);
      service.getDetails({
        placeId: marker.id
      }, function(place, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          // Set the marker property on this infowindow so it isn't created again.
          infowindow.marker = marker;
          var innerHTML = `<div>`;
          if (place.name) {
            innerHTML += `<strong>${place.name}</strong>`;
          }
          if (place.formatted_address) {
            innerHTML += `<br>${place.formatted_address}`;
          }
          if (place.formatted_phone_number) {
            innerHTML += `<br>${place.formatted_phone_number}`;
          }
          if (place.photos) {
            innerHTML += `<br><br><img src="${place.photos[0].getUrl({maxHeight: 100, maxWidth: 200})}" >`;
          } else {
            innerHTML += `<br><br>`;
            Instagram.addImage(place.name);
          }
          innerHTML += `</div>`;
          infowindow.setContent(innerHTML);
          infowindow.open(map, marker);
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick', function() {
            Mark.resetIcons();
            Location.previewMode = true;
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
        place_id : results[i].place_id,
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
      query: document.getElementById('search-text').value,
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
      }
    });
  },
};

//通过Instagram获取图片
var Instagram = {

  // 通过文本搜索，在信息窗口中加载图片
  addImage : function(text){
    var searchedForText = text;
    var imgHTML;
    $.ajax({
      url: ('https://api.unsplash.com/search/photos?page=1&query=' + text),
      headers: { Authorization : 'Client-ID 950396520af696bc57322dbae069c8dcfc9ead6edb575e736ed1df0beb5b63bb'}
    })
    .done(success)
    .fail(error)
    .done(appendHTML)

    function success(images){
      console.log('search instagram image success');
      const firstImg = images.results[0];
      imgHTML = `<img src="${firstImg.urls.regular}" alt="${searchedForText}" style = "max-height: 100px; max-width: 200px" >`;
    }

    function appendHTML(){
      Info.infowindow.setContent(Info.infowindow.content + imgHTML);
    }

    function error(){
      console.log('search instagram image error');
    }
  }
};


// 视图模型
var ViewModel = function() {
  var self = this;

  // 边栏是否显示
  this.optionsVisible = ko.observable(true);
  this.toggleOptions = function() {
    this.optionsVisible(!this.optionsVisible());
  };

  // 边栏功能 搜索/筛选
  this.mode = ko.observable('search'); // search || filt
  // 边栏的标题
  this.optionsTitle = ko.computed(function(){return (this.mode = 'search') ? '搜索模式' : '筛选模式';}, this);
  // 输入的内容
  this.inputText = ko.observable();
  // 按钮的文字
  this.btnText = ko.computed(function(){return (this.mode = 'search') ? '搜索' : '筛选'}, this);
  // 按钮的功能
  this.btnFunction = (this.mode = 'search') ? function(){SearchBox.textSearchPlaces()} : function(){alert('筛选')};
  // 展现的列表
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
    //Mark.hideMarkers(Mark.markers);
    Mark.resetIcons();
    Mark.markers[e.index].setIcon(Mark.highlightedIcon);
    Mark.markers[e.index].setMap(map);
    // 视角聚焦到目标位置
    map.setCenter(e.location);
    // 加载信息
    Info.populate(Mark.markers[e.index]);
  };

};
