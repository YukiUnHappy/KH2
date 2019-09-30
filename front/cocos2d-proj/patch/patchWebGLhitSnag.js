(function (global) {
  "use strict";

  // ActiveXは上手くラップできてない＆IE11(Trident)はcanvasモード遅すぎるので無視
  if( !window.XMLHttpRequest || navigator.userAgent.match(/(T|t)rident/)) return;

  var COOKIE_NAME = 'forceCanvasMode';
  var canvas = document.getElementById("gameCanvas");
  canvas._onWebGLContextLost = function(e) {
    e.preventDefault();
    alert("WebGLがブロックされました。\n\n一部の画面が正常に表示されない場合がありますが、\n非WebGLモードで再読み込みします。");

    Cookies.set(COOKIE_NAME, "1");
    location.reload();
  };
  canvas.addEventListener("webglcontextlost", canvas._onWebGLContextLost, false);

  var val =Cookies.get(COOKIE_NAME);
  console.debug("check cookie!", val);
  if(val !== "1") return;

  var canUseWebGL = function () {
    var canvas = document.createElement("Canvas");
    var attributes = {'stencil': true, 'preserveDrawingBuffer': true };

    var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
    var context = null;
    for (var i = 0; i < names.length; ++i) {
      try {
        context = canvas.getContext(names[i], attributes);
      } catch (e) {
      }
      if (context) {
        break;
      }
    }
    return context != null;
  };

  if (canUseWebGL()) {
    Cookies.set(COOKIE_NAME, "0");
    return;
  }

  var createWrappedXhr = function(orig, restoreFunc){
    var o = {
      _ax: orig,
      _status: "fake",
      _restore: restoreFunc,
      responseText: "",
      responseXml: null,
      readyState: 0,
      status: 0,
      statusText: 0,
      onReadyStateChange: null,
      onload: null
      // add the other properties...
    };
    o._onReadyStateChange = function() {
      var self = o;
      return function() {
        self.readyState   = self._ax.readyState;
        self.responseXml  = self._ax.responseXml;
        self.status       = self._ax.status;
        self.statusText   = self._ax.statusText;
        if (self.onReadyStateChange) self.onReadyStateChange();
      };
    }();
    o._onLoad = function() {
      var self = o;
      return function() {
        self.readyState   = self._ax.readyState;
        self.responseXml  = self._ax.responseXml;
        self.response     = self._ax.response;
        self.status       = self._ax.status;
        self.statusText   = self._ax.statusText;
        if (self.onload) self.onload();
      };
    }();
    o.open = function(bstrMethod, bstrUrl, varAsync, bstrUser, bstrPassword) {
      varAsync = (varAsync !== false);
      this._ax.onReadyStateChange = this._onReadyStateChange;
      if(this._ax.responseURL === undefined) this._ax.responseURL  = bstrUrl;
      return this._ax.open(bstrMethod, bstrUrl, varAsync, bstrUser, bstrPassword);
    };
    o.send = function(varBody) {
      if(this.onload) this._ax.onload = this._onLoad;
      if(this.responseType) this._ax.responseType = this.responseType;
      var ret =  this._ax.send(varBody);
      this._onReadyStateChange();
      Object.defineProperty( o, "responseText", { get: function(){
        var origText = this._ax.responseText;
        if(this._ax.responseURL.indexOf("/project.json") > 0){
          this._restore();
          console.debug("XmlHttpRequest override restored.");
          return origText.replace(/"?renderMode"?:\s?2/,"\"renderMode\": 1");
        }
        return origText;
      }} );
      return ret;
    };
    o.setRequestHeader = function(key, value) {
      return this._ax.setRequestHeader(key, value);
    };
    if (orig.overrideMimeType) {
      o.overrideMimeType = function(type) {
        return this._ax.overrideMimeType(type);
      };
    }
    return o;
  };

  // Mozilla系XmlHttpRequestをオーバーライド
  var xhr = window.XMLHttpRequest;
  if(xhr) {
    console.debug("override window.XMLHttpRequest");
    var origCtor = window.XMLHttpRequest;
    window.XMLHttpRequest = function() {
      var orig = new origCtor();
      return createWrappedXhr(orig, function(){ window.XMLHttpRequest = origCtor; });
    };
  }

  // IEのXmlHttpRequestをオーバーライド(未解決問題あり)
  var activeX = window.ActiveXObject;
  if(activeX) {
    console.debug("override ActiveXObject('MSXML2.XMLHTTP')");
    window.ActiveXObject = function(progid) {
      var ret = new activeX(progid);
      if(progid==="MSXML2.XMLHTTP"){
        return createWrappedXhr(ret, function(){ window.ActiveXObject = activeX; });
      }
      return ret;
    };
  }

})((this || 0).self || global);
