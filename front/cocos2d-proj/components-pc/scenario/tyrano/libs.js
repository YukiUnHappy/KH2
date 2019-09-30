(function($){
    boombox.setup();
    //jquery 拡張
    
     //アニメーション開始。未実装　キーフレアニメは投入したい
    $.fn.a2d=function(){

        return this.each(function(i){
            
            $(this).css("-webkit-animation-play-state",str);
            
        });
    };
    
    $.getBaseURL=function(){
    
        var str = location.pathname;
        var i = str.lastIndexOf('/');
        return str.substring(0,i+1);
   
    };

	$.isHTTP = function(str){
		if(str.substring(0,4) ==="http"){
			return true;
		}else{
			return false;
		}
	};

    $.play_audio=function(audio_obj){

        audio_obj.play();
    
    };
    
    $.getViewPort = function() {
        var width, heiht;
        
        if (self.innerHeight) {
            // all except Explorer
            width = self.innerWidth;
            height = self.innerHeight;
        } else if (document.documentElement && document.documentElement.clientHeight) {
            // Explorer 6 Strict Mode
            width = document.documentElement.clientWidth;
            height = document.documentElement.clientHeight;
        } else if (document.body) {
            // other Explorers
            width = document.body.clientWidth;
            height = document.body.clientHeight;
        }
        
        return {width: width, height: height};
    };
    
    $.escapeHTML = function(val, replace_str) {
        val = val || "";
        var t =$("<div />").text(val).html();
        
        if(replace_str){
            if(t === ""){
                t = replace_str;
            }
        }
        return t;
    };
    
    $.br = function(txtVal){
      
        txtVal = txtVal.replace(/\r\n/g, "<br />");
        txtVal = txtVal.replace(/(\n|\r)/g, "<br />");
        return txtVal;
        
    };
    
    //現在時刻を取得
    //現在の日
    $.getNowDate=function(){

        var nowdate = new Date();
        var year = nowdate.getFullYear(); // 年
        var mon  = nowdate.getMonth() + 1; // 月
        var date = nowdate.getDate(); // 日

        return year+"/"+mon+"/"+date;

    };
    
    //現在の時刻
    $.getNowTime=function(){

        var nowdate = new Date();
        
        var h = nowdate.getHours();
        var m = nowdate.getMinutes();
        var s = nowdate.getSeconds();

        return h+"："+m+"："+s;

    };
    
    
    
    
    $.convertSecToString = function(val) {
        if(val == 0) {
            return '-';
        }
        var day = Math.floor(val/(24*60*60));
        var hour = Math.floor((val%(24*60*60)/(60*60)));
        var minute = Math.floor(val%(24*60*60)%(60*60)/60);
        var second = Math.floor(val%(24*60*60)%(60*60)%60);
        
        var str = "";
        if(day !== 0){
            str += day + "日";
        }
        if(hour !== 0){
            str += hour + "時間";
        }
        if(minute !== 0){
            str += minute + "分";
        }
        if(second !== 0){
            str += second + "秒";
        }
        
        return str;
    };
    
    $.secToMinute = function(val) {
        if(val === 0){
            return "-";
        }
        
        var m = Math.floor(val / 60);
        var s = Math.floor(val % 60);
        var str = "";
        
        if(m !== 0){
            str += m + "分";
        }
        str += s + "秒";
        
        return str;
    };
    
   
    
    $.trim = function(str) {
        if(str) {
           
        } else {
            return "";
        }
       
        return str.replace(/^\s+|\s+$/g, ""); 
    };
    
    $.rmspace=function(str){
         
        str = str.replace(/ /g,"");
        str = str.replace(/　/g,"");
        str = str.replace(/\r\n?/g,"");
        
        return str;
            
    };
    
    $.replaceAll = function(text, searchString, replacement){
      
        return text.replace(new RegExp(searchString, "g"), replacement);
        
    };
    
    //指定した拡張子を付ける。拡張子がなければ
    $.setExt=function(name,ext_str){
        
        var tmp = name.split(".");
        if(tmp.length == 1){
            name = name + "."+ext_str;
        }
        
        return name;
        
    };
    
    //要素をクローンします
    $.cloneObject = function(source) {
        
        return $.extend(true,{},source);
    
    };
    
    //透明度を適切な値に変更
    $.convertOpacity=function(val){
        //255をマックスとして計算する
        
        var p = val / 255;
        
        return p;
        
    };  
    
    //パスにfgimage bgimage image が含まれていた場合、それを適応する
    $.convertStorage=function(path){
        
    };
    
    $.convertColor=function(val){
        
        if(val.indexOf("0x")!=-1){
            return val.replace("0x","#");
        }
        
        return val;
        
    } ;
    
    $.convertBold=function(flag){
        
        if(flag =="true"){
            return "bold";
        }
        
        return "";
        
    };
    
    $.send = function(url, obj, call_back) {
        //game.current_story_file = story_file;
        $.ajax({
            type:"POST",
            url: url ,
            data: obj,
            dataType: 'json',
            complete: function(){
                //通信終了時の処理
                $.hideLoading();
            },
            success: function(data, status){
                $.hideLoading();

                var data_obj = data;
                if(call_back){
                    call_back(data_obj);
                }
            }
        });
    };
    
    $.loadText = function(file_path,callback){
        var httpObj = jQuery.get(file_path + "?" + Math.floor(Math.random() * 1000000), null, function(obj){
            
                var order_str = "";
                
    
                if (httpObj) {
                    if (httpObj.responseText) {
                        order_str = httpObj.responseText;
                    }
                    else {
                    
                        order_str = obj;
                        
                    }
                }
                else {
                
                    order_str = obj;
                    
                }
                
                callback(order_str); // createOrder
            });
            
            if (httpObj.statusText === "error") {
                alert("ファイルが見つかりませんでした");
            }
    
    };
    
    //クッキーを取得
    $.getCookie = function(key) {
        var tmp = document.cookie + ";";
        var index1 = tmp.indexOf(key, 0);
        if(index1 != -1){
            tmp = tmp.substring(index1, tmp.length);
            var index2 = tmp.indexOf("=", 0) + 1;
            var index3 = tmp.indexOf(";", index2);
            return tmp.substring(index2, index3);
        }
        return null;
    };
    
    $.isNull = function(str){
        if(str == null){
            return "";
        }else{
           
        }
        
        return str;
    };
    
    $.dstop = function(){
        
      console.log("dstop");  
        
    };
    
    //ユーザ環境を取得
    $.userenv = function(){
      // [tx] 判定がいけてないのでコメントアウト
       /*
        var ua = navigator.userAgent;
        if(ua.indexOf('iPhone') > -1){
            return 'iphone';
        }else if(ua.indexOf('iPad') > -1){
            return 'iphone';
        }else if(ua.indexOf('Android') > -1 ){ 
            return 'android';
        }else{
            return "pc";
        }
        */
       // Surface系対応 => isModePc を trueにする
       // tyranoの場合はこのタイミングでないとSurface系のマウスが効かなくなる
       var isModePc = -1 < location.pathname.indexOf("components-pc");
       if (isModePc) {
          return "pc";
       }
       return ("ontouchend" in document) ? "smartphone" : "pc";
    
    };
    
    $.lang = function(key){
        
        if(tyrano_lang["word"][key]){
            return tyrano_lang["word"][key];
        }else{
            return "NOT_DEFINED";
        }
         
    };
    
    $.novel = function(key){
    
        if(tyrano_lang["novel"][key]){
            return tyrano_lang["novel"][key];
        }else{
            return "NOT_DEFINED";
        }
    
    };
    
    //ユーザのブラウザ情報を取得
    $.getBrowser = function(){
    
        var userAgent = window.navigator.userAgent.toLowerCase();
    
        if (userAgent.indexOf('msie') >= 0 || userAgent.indexOf('trident') >= 0) {
            return "msie";
        }
        else if (userAgent.indexOf("firefox") > -1) {
            return "firefox";
        }
        else if (userAgent.indexOf("opera") > -1) {
            return "opera";
        }
        else if (userAgent.indexOf("chrome") > -1) {
            return "chrome";
        }
        else if (userAgent.indexOf("safari") > -1) {
            return "safari";
        }
        else {
            return "unknown";
        }
    
    };
    
    $.swfName = function(str) {
        if (navigator.appName.indexOf("Microsoft") != -1) {
            return window[str];
        }else {
            return document[str];
        }
    };
    
    
    $.trans = function(method,j_obj,time,mode,callback){
    	
    	if(method =="crossfade" || mode=="show"){
    	
    	   var ta = {};
    	
    	   if(mode =="show"){
    	       ta = {"opacity":"show"};
    	   }else{
    	       ta = {"opacity":"hide"};
    	   }
    	
	    	j_obj.animate(
	    		ta,
	   			{
	   				duration: time, 
	   		    	easing: "linear",
	    		 	complete: function(){
	    		 		if(callback){
	    		 			callback();
	    		 		}
	    			}//end complerte
	    		}
	    	);
	    	
	    	return false;
	    
	    }else {
	       
	        if(mode=="hide"){
                j_obj.hide(method,time,function(){if(callback)callback();});
            }
            else if(mode=="show"){
                j_obj.show(method,time,function(){if(callback)callback();});
            }
	       
	    }
	    
    };
    
    
    //要素から空白のオブジェクトを削除して返却する
    $.minifyObject = function(obj){
        
        for(key in obj){
            if(obj[key] == null || obj[key]==""){
                delete obj[key];
            }
        }
        
        return obj;
        
    };
    
    $.setStorage = function(key,val){
        val = JSON.stringify(val);
		//localStorage.setItem(key, LZString.compress(escape(val)));
		localStorage.setItem(key, escape(val));
	};
	
	$.getStorage = function(key){
		
		try{
		
			var gv = "null";
    		
    		if(localStorage.getItem(key)){
    			//gv = unescape(LZString.decompress(localStorage.getItem(key)));
    			gv = unescape(localStorage.getItem(key));
    		}
    		
    		if(gv =="null") return null;
    		
		}catch(e){
		  alert("この環境はセーブ機能を利用できません。ローカルで実行している場合などに発生します");
		}
		
		return gv;
		
	};
    //オブジェクトの個数をもってきます。1
    $.countObj = function(obj){
        
        var num =0;
        for( key in obj ){
            num++;
        }
        return num;
    };
    
    //渡されたJqueryオブジェクトにクラスをセットします
    $.setName = function(jobj,str){
        
        str = $.trim(str);
        
        if(str =="") return;
        
        var array = str.split(",");
        for(var i=0;i<array.length;i++){
            jobj.addClass(array[i]);
            
        }
    
    };
    
    //フラッシュのインストール判定
    $.isFlashInstalled = function() {
          if ( navigator.plugins['Shockwave Flash'] ) {
            return true;
          }
          try {
            new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
            return true;
          } catch (e) {
            return false;
          }
    };
    
    
    /*スマホの場合は、タッチでクリックを置き換える*/
    /*タッチ系、一応出来たけど、動作確認よくしなければならなｋ，問題なければR9にも適応*/
    if ($.userenv() != "pc") {
        $.event.tap = function(o) {
            o.bind('touchstart', onTouchStart_);

              function onTouchStart_(e) {
                e.preventDefault();
                o.data('event.tap.moved', false)
                  .one('touchmove', onTouchMove_)
                  .one('touchend', onTouchEnd_);
                e.stopPropagation();
              }

              function onTouchMove_(e) {
                o.data('event.tap.moved', true);
                e.stopPropagation();
              }

              function onTouchEnd_(e) {
                if (!o.data('event.tap.moved')) {
                  o.unbind('touchmove', onTouchMove_);
                  o.trigger('click').click();
                  e.stopPropagation();
                }
              }
        };


        if (-1 < location.pathname.indexOf("components-pc") && 'ontouchend' in document) {
           // Surface系対応
           $.fn.tap = function(data, fn) {

            //alert("tap!");

            if (fn == null) {
              fn = data;
              data = null;
            }

            if (arguments.length > 0) {
              this.bind('tap', data, fn);
              $.event.tap(this);
            } else {
              this.trigger('tap');
            }
            return this;
          };

          if ($.attrFn) {
            $.attrFn['tap'] = true;
          }

          //クリック上書き
          //$.fn.click = $.fn.tap;

        } else if ('ontouchend' in document) {
          $.fn.tap = function(data, fn) {

            //alert("tap!");

            if (fn == null) {
              fn = data;
              data = null;
            }

            if (arguments.length > 0) {
              this.bind('tap', data, fn);
              $.event.tap(this);
            } else {
              this.trigger('tap');
            }
            return this;
          };

          if ($.attrFn) {
            $.attrFn['tap'] = true;
          }

          //クリック上書き
          $.fn.click = $.fn.tap;

        } else {
          //$.fn.tap = $.fn.click;
        }
    }

//////////////////////////////

    
    $.error_message = function(str){
        alert(str);
    };
    
    //クッキー設定
    $.setCookie = function (key, val) {
        document.cookie = key + "=" + escape(val) + ";expires=Fri, 31-Dec-2030 23:59:59;path=/;";
    }
     
   
})(jQuery);


jQuery.fn.outerHTML = function(s) {
  if (s) {
    this.before(s);  
    this.remove(); 
    return this;
  } else {
    var dummy = jQuery("<p>");
    var elem = this.eq(0); 
    dummy.append(elem.clone());
    return dummy.html();
  }
};




// t: current time, b: begInnIng value, c: change In value, d: duration
jQuery.easing['jswing'] = jQuery.easing['swing'];

jQuery.extend( jQuery.easing,
{
    def: 'easeOutQuad',
    swing: function (x, t, b, c, d) {
        //alert(jQuery.easing.default);
        return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
    },
    easeInQuad: function (x, t, b, c, d) {
        return c*(t/=d)*t + b;
    },
    easeOutQuad: function (x, t, b, c, d) {
        return -c *(t/=d)*(t-2) + b;
    },
    easeInOutQuad: function (x, t, b, c, d) {
        if ((t/=d/2) < 1) return c/2*t*t + b;
        return -c/2 * ((--t)*(t-2) - 1) + b;
    },
    easeInCubic: function (x, t, b, c, d) {
        return c*(t/=d)*t*t + b;
    },
    easeOutCubic: function (x, t, b, c, d) {
        return c*((t=t/d-1)*t*t + 1) + b;
    },
    easeInOutCubic: function (x, t, b, c, d) {
        if ((t/=d/2) < 1) return c/2*t*t*t + b;
        return c/2*((t-=2)*t*t + 2) + b;
    },
    easeInQuart: function (x, t, b, c, d) {
        return c*(t/=d)*t*t*t + b;
    },
    easeOutQuart: function (x, t, b, c, d) {
        return -c * ((t=t/d-1)*t*t*t - 1) + b;
    },
    easeInOutQuart: function (x, t, b, c, d) {
        if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
        return -c/2 * ((t-=2)*t*t*t - 2) + b;
    },
    easeInQuint: function (x, t, b, c, d) {
        return c*(t/=d)*t*t*t*t + b;
    },
    easeOutQuint: function (x, t, b, c, d) {
        return c*((t=t/d-1)*t*t*t*t + 1) + b;
    },
    easeInOutQuint: function (x, t, b, c, d) {
        if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
        return c/2*((t-=2)*t*t*t*t + 2) + b;
    },
    easeInSine: function (x, t, b, c, d) {
        return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
    },
    easeOutSine: function (x, t, b, c, d) {
        return c * Math.sin(t/d * (Math.PI/2)) + b;
    },
    easeInOutSine: function (x, t, b, c, d) {
        return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
    },
    easeInExpo: function (x, t, b, c, d) {
        return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
    },
    easeOutExpo: function (x, t, b, c, d) {
        return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
    },
    easeInOutExpo: function (x, t, b, c, d) {
        if (t==0) return b;
        if (t==d) return b+c;
        if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
        return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
    },
    easeInCirc: function (x, t, b, c, d) {
        return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
    },
    easeOutCirc: function (x, t, b, c, d) {
        return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
    },
    easeInOutCirc: function (x, t, b, c, d) {
        if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
        return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
    },
    easeInElastic: function (x, t, b, c, d) {
        var s=1.70158;var p=0;var a=c;
        if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
        if (a < Math.abs(c)) { a=c; var s=p/4; }
        else var s = p/(2*Math.PI) * Math.asin (c/a);
        return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
    },
    easeOutElastic: function (x, t, b, c, d) {
        var s=1.70158;var p=0;var a=c;
        if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
        if (a < Math.abs(c)) { a=c; var s=p/4; }
        else var s = p/(2*Math.PI) * Math.asin (c/a);
        return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
    },
    easeInOutElastic: function (x, t, b, c, d) {
        var s=1.70158;var p=0;var a=c;
        if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
        if (a < Math.abs(c)) { a=c; var s=p/4; }
        else var s = p/(2*Math.PI) * Math.asin (c/a);
        if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
        return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
    },
    easeInBack: function (x, t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        return c*(t/=d)*t*((s+1)*t - s) + b;
    },
    easeOutBack: function (x, t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
    },
    easeInOutBack: function (x, t, b, c, d, s) {
        if (s == undefined) s = 1.70158; 
        if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
        return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
    },
    easeInBounce: function (x, t, b, c, d) {
        return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
    },
    easeOutBounce: function (x, t, b, c, d) {
        if ((t/=d) < (1/2.75)) {
            return c*(7.5625*t*t) + b;
        } else if (t < (2/2.75)) {
            return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
        } else if (t < (2.5/2.75)) {
            return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
        } else {
            return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
        }
    },
    easeInOutBounce: function (x, t, b, c, d) {
        if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
        return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
    }
});






