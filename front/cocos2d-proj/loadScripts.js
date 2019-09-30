(function(global) {
  "use strict";
  var scripts = [
    "/cocos2d-proj/vendor/boombox.js/boombox.min.js",
    "/cocos2d-proj/vendor/lodash/dist/lodash.min.js",
    "/cocos2d-proj/vendor/jquery/dist/jquery.min.js",
    "/cocos2d-proj/components/core/src/config/KHEnvConfig.js",
    "/cocos2d-proj/vendor/WMAudio.js/lib/WebModule.js",
    "/cocos2d-proj/vendor/WMAudio.js/lib/WebAudio.js",
    "/cocos2d-proj/main.js"
  ].map(function(srcUrl) {
    return global.frontBaseUrl + srcUrl;
  });

  if (/* Production = */true) {
    console.log = function() {};
  }

  function loadAllScripts() {
    var promise = Q.resolve();
    var makeScript = function(dfd_) {
      var scr = document.createElement("script");
      scr.onload = (function(dfd__) {
        return function() {
          console.log("Load Complete: " + this.src);
          scr.onload = null;
          scr.onerror = null;
          dfd__.resolve();
        };
      })(dfd_);
      scr.onerror = (function(dfd__) {
        return function(err) {
          console.log("Load Error: " + err.target.src);
          scr.onload = null;
          scr.onerror = null;
          dfd__.reject(err)
        }
      })(dfd_);
      return scr;
    };
    scripts.forEach(function(srcUrl) {
      promise = promise.then(function() {
        var dfd_ = Q.defer();
        var scr = makeScript(dfd_);
        scr.src = srcUrl;
        document.body.appendChild(scr);
        return dfd_.promise;
      });
    });
    return promise;
  }

  function loadGameFrame() {
    var iframe = document.getElementById("game");
    var dfd = Q.defer();
    if (iframe) {
      // PC版フレームの表示はここのタイミングで行うのが良い
      var outer = document.getElementById("game-outer");
      if (outer) {
        outer.className += ' frame';
      }
      iframe.onload = (function(dfd_) {
        return function() {
          console.log("GameSrc Loaded:" + this.src);
          console.log("Start Game Initialize");
          dfd_.resolve();
        };
      })(dfd);
      iframe.setAttribute("src", iframe.getAttribute("game-src"));
    } else {
      dfd.reject(new Error("no iframe found"));
    }
    return dfd.promise;
  }

  function userAgentCheck() {
    var scr = document.createElement("script")
    scr.src = global.frontBaseUrl + "/cocos2d-proj/useragent.js";
    var dfd = Q.defer();
    scr.onload = function() {
      var platform = new global.Platform(global.dmm);
      var ua = new global.UserAgent(window.navigator.userAgent);
      platform.showIncompatibleViewIfCheckFailed(dfd, ua)
      dfd = null;
    };
    document.body.appendChild(scr);
    if (!dfd) {
      // 既にnullが設定されている => onloadが起動してnullを代入した(IE10対応)
      return Q.resolve();
    }
    return dfd.promise;
  }


  var interval = setInterval(function() {
    if (global.Q) {
      clearInterval(interval);
      userAgentCheck()
        .then(loadAllScripts)
        .then(loadGameFrame)
        .fail(function(err) { console.log("ERROR ", err); });
    }
  }, 10);

})((this || 0).self || global);
