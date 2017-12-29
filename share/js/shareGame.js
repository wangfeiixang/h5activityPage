

 window.shareTipsPic = {
	android : '',
	ios		: ''
}
window.onload = function(){
	ajax();
	var oButton = document.getElementById("button");
	oButton.onclick = function(e){

		// console.log(111);
		
		var installDownloadUrl = {
				ios:document.querySelector('.ioslink').getAttribute('data-src') || '',
				android: document.querySelector('.androidlink').getAttribute('data-src') || ''
			}
	    var RedirectToNative = {
		   /**
			 * iosNativeUrl: string 必选 ios app上自定义的url scheme） 如 taobao://home(淘宝首页) etao://item?nid=xxx（一淘商品详情页）
			 * androidNativeUrl: string 必选 android app自定义的url scheme
			 * iosInstallUrl: string 必选 ios app store里的安装地址
			 * androidInstallUrl: string 必选 android app的apk地址
			 * package: string 可选 默认com.taobao.taobao android的包名，如淘宝为com.taobao.taobao，etao为com.taobao.etao
			 * iosOpenTime: int 可选默认800ms， 启动ios客户端所需时间，一般ios平台整体性能不错，打开速度较快
			 * androidOpenTime: int 可选默认2000ms，启动android客户端所需时间，android系统性能参差不齐所需启动时间也不齐，和android客户端本身启动时间也有关，比如3.0版本启动一淘客户端就平均比淘宝客户端要慢200ms
			 */
			init: function(config) {
				
				var self = this,
					isQQA = self.isQQ();
				self.platform = self._UA();

				// pc下 什么都不处理  pc访问下可能href可以链接去其他地址
				if(!self.platform) return;
				if (self.platform == 'ios') {
				  self.installUrl = config.iosInstallUrl;
				  self.nativeUrl = config.iosNativeUrl;
				  self.openTime = config.iosOpenTime || 800;
				} else {
				  self.installUrl = config.androidInstallUrl;
				  self.nativeUrl = config.androidNativeUrl;
				  self.openTime = config.androidOpenTime || 300;
				}

				// if( isQQA )
				// {
				// 	window.location.href = "http://a.app.qq.com/o/simple.jsp?pkgname=cn.com.sina.sports";
				// }

				self._gotoNative();
			},
			isQQ: function(){
				var ua = navigator.userAgent.toLowerCase();
			    var _isQQ = ua.indexOf('qq')>-1;

			    if( _isQQ ){
			        return true;
			    }
			    return false;
			},
			/**
			 * [_gotoNative 跳转至native，native超时打不开就去下载]
			 * @return 
			 */
			_gotoNative: function() {
				var self = this;
				var startTime = Date.now(),
					doc = document,
					body = doc.body,
					iframe = doc.createElement('iframe');
					iframe.id = 'J_redirectNativeFrame';
					iframe.style.display = 'none';
					iframe.src = self.nativeUrl;

				//运行在head中
				if(!body) {
					setTimeout(function(){
						doc.body.appendChild(iframe);
					}, 0);
				} else {
					body.appendChild(iframe);
				}

							
				
				setTimeout(function() {
					doc.body.removeChild(iframe);
					self._gotoDownload(startTime);
					/**
					 * 测试时间设置小于800ms时，在android下的UC浏览器会打开native app时并下载apk，
					 * 测试android+UC下打开native的时间最好大于800ms;
					 */
				}, self.openTime);
			},
			/**
			 * [_gotoInstall 去下载]
			 * @param  {[type]} startTime [开始时间]
			 * @return 
			 */
			_gotoDownload: function(startTime) {

				var self = this;
				var endTime = Date.now();
				if (endTime - startTime < self.openTime + 300) {
					// alert( startTime,endTime,self.openTime  )
					window.location = self.installUrl;
				}
			},
			/**
			 * [_UA 检测平台]
			 * @return string [ios|android| ]
			 */
			_UA: function() {
				var ua = navigator.userAgent;
				var a = ua.match(/Android/i);
				
				// ios
				//if (ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
				if (ua.match(/iphone|ipod|ipad/ig)){
					return 'ios';
				} else if (ua.match(/Android/i)) {
					return 'android';
				} else {
					return '';
				}
		}
	}

		var configObj = {
			iosInstallUrl: installDownloadUrl.ios,
			androidInstallUrl: installDownloadUrl.android,
			iosNativeUrl: 'zshiliu://',
			androidNativeUrl: 'zshiliu://'
		};

		RedirectToNative.init(configObj);
		firstWechat();
		initBind();
		
	}

	


		

};

function bindEventForApp(obj, ev, fn){

	if(!document.addEventListener){
		obj.attachEvent(ev,fn,e);
	}
	else{
		obj.addEventListener(ev,fn,false);
	}
}
function isWeixin(){
	var ua = navigator.userAgent.toLowerCase();
    if(ua.match(/MicroMessenger/i)=="micromessenger")  {
        return true;
    } else {
        return false;
    }
}
		
function bindTarget($obj,e){
	// alert($obj)
	var platform = getPlatform(),
		$img = document.getElementById('j_float_nav'),
		$nav_float = document.body.querySelector('.j_share_bg'),
		_isWeixin = isWeixin();

	bindEventForApp($obj,'click',function(e){
		// console.log('下载按钮',e.target)
		// alert(e)
		var dom = e.target,
			_className = dom.className,
			isIosLink = _className.indexOf('ioslink')>-1,
			isAndroidLink = _className.indexOf('androidlink')>-1,
			downloadURL = dom.getAttribute('data-src');

		if(_isWeixin){
			// alert(11)
			if(isIosLink || isAndroidLink){
        		if(platform == 'ios'){
        			$img.src = shareTipsPic.ios;
        		}
        		else{
        			$img.src = shareTipsPic.android;	
        		}
        		$nav_float.style.display = 'block';
			}else{
	        	$nav_float.style.display = 'none';
			}
		}
		else{
			if(isIosLink || isAndroidLink){
				window.location.href = downloadURL;
			}
		}
		e.stopPropagation();	
		
        // switch(_className){
        // 	case 'ioslink':
        // 	case 'androidlink':
        // 		if(platform == 'ios'){
        // 			$img.src = shareTipsPic.ios;
        // 		}
        // 		else{
        // 			$img.src = shareTipsPic.android;        			
        // 		}
        // 		$nav_float.style.display = 'block';
        // 		break;
        // 	default:
        // 		$nav_float.style.display = 'none';
        // 		break;
        // }
	});
}
function getPlatform() {
	var ua = navigator.userAgent;
	
	// ios
	if (ua.match(/iphone|ipod/ig)){
		return 'ios';
	} else if (ua.match(/Android/i)) {
		return 'android';
	} else {
		return '';
	}
}
function initBind(){
	// alert("start")
	var iosLink = document.body.querySelector('.ioslink'),
		androidLink = document.body.querySelector('.androidlink'),
		nav_float = document.body.querySelector('.j_share_bg');

	bindTarget(iosLink);
	bindTarget(androidLink);
	bindTarget(nav_float);
}

function firstWechat(){
	var ua = navigator.userAgent.toLowerCase();
	if(ua.match(/MicroMessenger/i)=="micromessenger")  {
		var platform = getPlatform(),
			$img = document.getElementById('j_float_nav'),
			$nav_float = document.body.querySelector('.j_share_bg');   	
        		if(platform == 'ios'){
        			$img.src = shareTipsPic.ios;
        		}
        		else{
        			$img.src = shareTipsPic.android;	
        		}
        		$nav_float.style.display = 'block';
    }	
}

function ajax(){
	$.ajax({
		url: "./01.json",
		dataType: "json",
		async:false,
		data:{
		   
		},
		success: function(data) {
			// console.log(data);
			if ( data.status == 1 ) {
				console.log( "数据接收到" )
				$("#userId").html( data.data.userId );
				$(".txtColor").html( data.data.price );
				$("#referralCode").html( data.data.code );
			} 
		}
	})
}