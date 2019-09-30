(function(global) {
  "use strict";

  var cc = global.cc;
  var existsRequestAnimationFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame;
  if(!existsRequestAnimationFrame) {
    return;
  }

  cc.EGLView.prototype.enableAutoFullScreen = function(){
    // autoFullScreen のエラーを出さないようにする。
    // 別途パッチファイルを作っても、なぜか適用前に実行されてしまうのでここに書く
    this._autoFullScreen = false;
  };

  cc.game._setAnimFrame = function () {
    this._lastTime = new Date();
    this._frameTime = 1000 / cc.game.config[cc.game.CONFIG_KEY.frameRate];
    // KAMIHIME-34221 バトル中はバックグラウンド進行できるように setInterval を使う。
    // バトル以外では、 cc.game._initEvents でpause処理が設定されるので、特に負荷になることもない。
    window.requestAnimFrame = this._stTime;
    window.cancelAnimationFrame = this._ctTime;
  };

})((this || 0).self || global);
