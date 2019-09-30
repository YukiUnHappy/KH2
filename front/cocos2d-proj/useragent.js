(function(global) {
  "use strict";

  var frontBaseURL = global.frontBaseUrl;

  // 推奨OS,ブラウザの正規表現
  var os = {
    "pc": [
      /Mac\sOS\sX\s10_9_?/,         // OSX 10_9
      /Mac\sOS\sX\s10_1[0-9]_?/,    // OSX 10_10 以上
      /Windows\sNT\s6\.[1-9]/,      // windows 7 => NT 6.1以上
      /Windows\sNT\s10\.[0-9]/      // windows 10以上
    ],
    "sp": [
      /Android\s[6-9](?:\.[0-9])?/,                     // Android 6-9
      /Android\s[1-9][0-9]/,                            // Android 10以上
      /\((?:iPhone|iPad|iPod)[^\)]+9_?/,                // iOS 9
      /\((?:iPhone|iPad|iPod)[^\)]+[1-9][0-9]_[0-9]_?/  // iOS 10以上
    ]
  };

  var browser = {
    "pc": [
      /Chrome/
    ],
    "sp": [
      /Version\/\S+\sMobile\/\S+\sSafari\/\S+/,  // mobile safari
      /CriOS\/\S+\sMobile\/\S+\sSafari\/\S+/,    // chrome for ios
      /Chrome\/[.0-9]+\sMobile/,                 // chrome for android phone
      /Chrome\/[.0-9]+\s(?!Mobile)/              // chrome for android tablet
    ]
  };

  var methodsToImplement = [
    {"obj": Array.prototype, "methodName": "flatMap"} 
  ];

  var incompatibleURL = {
    "pc": {
      "os": frontBaseUrl + "/incompatible/pc/deprecated_device.html",
      "browser": frontBaseUrl + "/incompatible/pc/deprecated_browser.html",
      "webgl": frontBaseUrl + "/incompatible/pc/deprecated_webgl.html"
    },
    "sp": {
      "os": frontBaseUrl + "/incompatible/sp/deprecated_device.html",
      "browser": frontBaseUrl + "/incompatible/sp/deprecated_browser.html",
      "webgl": frontBaseUrl + "/incompatible/sp/deprecated_webgl.html"
    }
  };


  global.Platform = (function PlatformDefinition() {
    var _class = function(dmmObject) {
      // if (!dmmObject) {
      //   throw new Error("dmm object is needed");
      // }
      // if (typeof dmmObject != "object") {
      //   throw new Error("dmm object is not object");
      // }
      this.dmmObject = dmmObject;
    };

    // プラットフォームがPC版かどうかを返す
    _class.prototype.isPc = function() {
      // SP版プラットフォーム専用 dmm.requestRedirect があるかどうかを確認
      // if (this.dmmObject.requestRedirect) {
      //   return false;
      // } else {
        return true;
      // }
    };

    // UserAgentチェックが失敗したら適切な表示を行う
    _class.prototype.showIncompatibleViewIfCheckFailed = function(dfd, ua) {
      if (this.isPc()) {
        if (!ua.isCompatiblePcOS()) {
          this.showIncompatibleViewPcOS(ua);
          return dfd.reject("incompatible PC OS");
        }
        if (!ua.isCompatiblePcBrowser()) {
          this.showIncompatibleViewPcBrowser(ua);
          return dfd.reject("incompatible PC Browser");
        }
        if (!ua.isCompatibleWebGL()) {
          this.showIncompatibleViewPcWebGL(ua);
          return dfd.reject("incompatible PC WebGL");
        }
        return dfd.resolve();
      } else {
        if (!ua.isCompatibleSpOS()) {
          this.showIncompatibleViewSpOS(ua);
          return dfd.reject("incompatible SP OS");
        }
        if (!ua.isCompatibleSpBrowser()) {
          this.showIncompatibleViewSpBrowser(ua);
          return dfd.reject("incompatible SP Browser");
        }
        if (!ua.isCompatibleWebGL()) {
          this.showIncompatibleViewSpWebGL(ua);
          return dfd.reject("incompatible SP WebGL");
        }
        return dfd.resolve();
      }
    };
    _class.prototype.resizePcView = function(height) {
      if (global.gadgets.window) {
        global.gadgets.window.adjustHeight(height);
      }
    }

    var overwriteHTML = function(url) {
      return function() {
        var xhr = new XMLHttpRequest();
        var res = xhr.open("GET", url, /* async */false);
        xhr.send();
        if (xhr.status != 200) {
          document.body.innerHTML = "非推奨端末です!!";
          return;
        }

        var baseURL = url.replace(/[^\/]+$/, "");
        // ここで取得するHTMLはCSS,Imageがインライン化されている
        document.body.innerHTML = xhr.response.replace(/<\/?(?:html|head|meta|body)[^>]*>/g, "").replace(/<title>.+<\/title>/, "");
        this.resizePcView(800);
      };
    };

    var redirectURL = function(url) {
      return function() {
        // 遅延させないと謎のリダイレクトループに陥いる
        setTimeout(function() {
          // SP版はdmm.requestRedirectをするとプラットフォームiframe内でリダイレクトを行えるが、
          // 表示が期待したものではないため、iframeを外した状態にするためwindow.top.location を使う。
          window.top.location.href = url;
        }, 100);
      };
    };

    /*
     * PC版用の表示は iframeを外したredirectの場合、セキュリティチェックにひっかかって
     * ダイアログが表示される場合があるので、overwriteHTMLを使う。
     * SP版は逆にoverwriteHTMLだと表示が崩れるのでredirectURLを使う。
     * => 表示が崩れるが、何の表示もされない状態よりはマシということで
     *    overwriteHTMLを使うことになった
     */

    _class.prototype.showIncompatibleViewPcOS      = function(ua) {
      ((ua.isMSIEAndLessThanVersion10())
        ? redirectURL(incompatibleURL.pc.os)
        : overwriteHTML(incompatibleURL.pc.os)).bind(this)();
    };
    _class.prototype.showIncompatibleViewPcBrowser = function(ua) {
       ((ua.isMSIEAndLessThanVersion10())
        ? redirectURL(incompatibleURL.pc.browser)
        : overwriteHTML(incompatibleURL.pc.browser)).bind(this)();
    };
    _class.prototype.showIncompatibleViewPcWebGL   = function(ua) {
      ((ua.isMSIEAndLessThanVersion10())
          ? redirectURL(incompatibleURL.pc.webgl)
          : overwriteHTML(incompatibleURL.pc.webgl)).bind(this)();
    };
    _class.prototype.showIncompatibleViewSpOS      = overwriteHTML(incompatibleURL.sp.os);
    _class.prototype.showIncompatibleViewSpBrowser = overwriteHTML(incompatibleURL.sp.browser);
    _class.prototype.showIncompatibleViewSpWebGL   = overwriteHTML(incompatibleURL.sp.webgl);

    return _class;
  })();

  global.UserAgent = (function UserAgentDefinition() {
    var _class = function(str) { this.ua = str; };
    var createCheckFunc = function(regexpArray, methodArray) {
      var checkUA = function(ua) {
        var len = regexpArray.length;
        for(var i = 0; i < len; i++) {
          if (regexpArray[i].test(ua)) {
            return true;
          }
        };
        return false;
      };

      var checkMethod = function() {
        var len = methodArray.length;
        for(var i = 0; i < len; i++) {
          var obj = methodArray[i].obj;
          var methodName = methodArray[i].methodName;
          if (obj[methodName] instanceof Function) {
            return true;
          }
        }
        return false;
      };

      return function() {
        // method本体
        if (methodArray) {
          return checkUA(this.ua) && checkMethod();
        } else {
          return checkUA(this.ua);
        }
      };
    };
    _class.prototype.isCompatibleSpOS      = createCheckFunc(os.sp);
    _class.prototype.isCompatibleSpBrowser = createCheckFunc(browser.sp);
    _class.prototype.isCompatiblePcOS      = createCheckFunc(os.pc);
    _class.prototype.isCompatiblePcBrowser = createCheckFunc(browser.pc, methodsToImplement);
    _class.prototype.isCompatibleWebGL     = function() {
      try {
        var canvas = document.createElement('canvas');
        var webGLContext = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return !!(window.WebGLRenderingContext && webGLContext && webGLContext.getShaderPrecisionFormat);
      } catch (e) {
        return false;
      }
    };
    _class.prototype.isMSIEAndLessThanVersion10 = function() { return /MSIE\s[9876]/.test(this.ua); };
    return _class;
  })();

})((this || 0).self || global);
