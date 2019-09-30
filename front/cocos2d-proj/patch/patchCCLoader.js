(function (global) {
  'use strict';

  var cc = global.cc;

  /**
   * 初期ロード(project.json内のjsListを読み込むとき)でのバージョン番号付与
   * @param jsPath
   * @param isAsync
   * @param cb
   * @private
   */
  cc.loader._createScript = function (jsPath, isAsync, cb) {
    var d = document, s = cc.newElement('script');
    s.async = isAsync;
    // self._jsCache[jsPath] = true;
    if(cc.game.config["noCache"] && typeof jsPath === "string"){
      if(self._noCacheRex.test(jsPath))
        s.src = jsPath + "&_t=" + (new Date() - 0);
      else
        s.src = jsPath + "?_t=" + (new Date() - 0);
    }else{
      s.src = kh.getAddVersionQueryString(jsPath);
    }
    s.addEventListener('load', function loader() {
      s.parentNode.removeChild(s);
      this.removeEventListener('load', loader, false);
      cb();
    }, false);
    s.addEventListener('error', function () {
      s.parentNode.removeChild(s);
      cb("Load " + jsPath + " failed!");
    }, false);
    d.body.appendChild(s);
  }
})((this || 0).self || global);

