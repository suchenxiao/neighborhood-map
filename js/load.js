// 先测试能否链接谷歌地图API，再加载
  
(function(){
  fetch('https://maps.googleapis.com/maps/api/geocode/json?latlng=39.929074,116.310931&key=AIzaSyC_tE8_pY_gRt_MWsmrG2sGOBQHr4aYdJM')
  //.then(response => response.json())
  //.then(response => console.log(response))
  .catch(netError)
  .then(addJs)
  .catch(jsError);
  
  function addJs(){		
	var script = document.createElement("script");
	script.src = 'https://maps.googleapis.com/maps/api/js?libraries=places,geometry,drawing&key=AIzaSyC_tE8_pY_gRt_MWsmrG2sGOBQHr4aYdJM&v=3&callback=init';
	script.async = 'async';
	script.defer = 'defer';
	document.body.appendChild(script);
  }
  
  function netError(e){
	console.log(e);
	alert('哎呀，地图加载出错了，看看网络情况吧');
  }

  function jsError(e){
	console.log(e);
	alert('哎呀，出错了');
  }
})()
