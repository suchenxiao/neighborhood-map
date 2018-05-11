// 测试能付加载谷歌地图
  
(function(){
  fetch('https://maps.googleapis.com/maps/api/geocode/json?latlng=39.929074,116.310931&key=AIzaSyC_tE8_pY_gRt_MWsmrG2sGOBQHr4aYdJM')
  .then(addJs)
  .catch(error);
  
  function addJs(){		
	[
	  'js/jquery-3.3.1.min.js',
	  'js/knockout-3.2.0.js',
	  'js/js.js',
	  'https://maps.googleapis.com/maps/api/js?libraries=places,geometry,drawing&key=AIzaSyC_tE8_pY_gRt_MWsmrG2sGOBQHr4aYdJM&v=3&callback=init'
	].forEach(function(js){
	  var script = document.createElement("script");
	  script.src = js; 
	  document.body.appendChild(script);
	})
  }
  
  function error(e){
	console.log(e);
	alert('哎呀，地图加载失败了，看看网络情况吧');	
  }
})()
