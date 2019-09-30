(function(global) {
  "use strict";

  global.kh = global.kh || {};
  var kh = global.kh || {};
  kh.version = kh.version || {};


  // 外部ファイルからバージョン番号を取得
  var date = new Date();
  var versionNum = 0;
  var request = new XMLHttpRequest();
  request.open("GET", "/front/json/version.json?d="+date.getTime(), false);
  request.send(null);
  try{
    versionNum = JSON.parse(request.response).version;
  } catch(e) {
    // 失敗した場合はミリ秒を使用
    versionNum = date.getTime();
  }


  /**
   * アプリバージョン
   * @attribute kh.version.app
   * @type {String}
   */
  kh.version.app = ( Number(versionNum) ? versionNum : "1" );

  /**
   * クエリーパラメータに追加する文字列
   * @attribute kh.addVersionQueryString
   * @type {String}
   */
  kh.versionQueryString = "?version=" + kh.version.app;

  /**
   * クエリパラメータにアプリバージョンを付ける
   * @method
   * @public
   * @param {string} url
   */
  kh.getAddVersionQueryString = function(url){
    if (url == null) {
      return;
    }
    var version = /(\?|\&)version\=/
    if (url.match(version) == null ) {
      if (url.indexOf("?") == -1) {
        url += "?version=" + kh.version.app;
      } else {
        url += "&version=" + kh.version.app;
      }
    }
    return url;
  };

})((this || 0).self || global);
