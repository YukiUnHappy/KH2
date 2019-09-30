
(function() {
  "use strict";

  if (kh.env.mode === "Product") {
    console.log = console.warn = console.debug = console.info = function() {};
  }

  var enableWebAudio = !!(window.AudioContext || window.webkitAudioContext);
  boombox.setup({
    webaudio: { use: enableWebAudio },
    //htmlaudio: { use: true },
    loglevel: 5
  });

  // Android対応
  // 定期的に無音を再生させると、画面遷移でBGMやSEが再生されなくなることを防げる
  if (kh.env.isAndroid) {
    var silence = {media: "audio/wav", path: "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA"};
    boombox.load("silence", {src: [silence]}, function(err, audio) {
      setInterval(function() {
        this.play();
        //console.log("play silence");
      }.bind(audio), 1000);
    });
  }

  var httpsToHttp = function(path) {
    if (path == null || typeof path !== "string") {
      return path;
    }
    return path.replace("https", "http");
  };

  boombox.load = (function(origMethod) {
    return function() {
      if (!this.__kh_keys) {
        return origMethod.apply(this, arguments);
      }
      var params = arguments[1];
      var keys = this.__kh_keys;
      params.src.forEach(function(p) {
        keys.push(p.path);
      });
      origMethod.apply(this, arguments);
    };
  }.bind(boombox))(boombox.load);
  boombox.play = (function(origMethod) {
    return function() {
      if (boombox.WEB_AUDIO_CONTEXT.state === 'suspended') {
        boombox.WEB_AUDIO_CONTEXT.resume();
      }
      return origMethod.apply(this, arguments);
    };
  })(boombox.play);

  boombox.khMakeTempPool = function() {
    this.__kh_keys = [];
  };
  boombox.khPurgeTempPool = function() {
    while(0 < (this.__kh_keys || []).length) {
      boombox.remove(this.__kh_keys.shift());
    }
    this.__kh_keys = [];
  };
  // 画面遷移時に連打された場合にBGMが停止するので回避する為の 苦肉の策
  boombox.__proto__.onBlur_ = boombox.__proto__.onBlur;
  boombox.__proto__.onBlur = function() {};
  boombox.__proto__.onPageHide = function() {};
  boombox.__proto__.onVisibilityChange = function() {};

  var gameWindow = document.getElementById("game");
  var execPostMessageCallback = function(callbackToken, err, response) {
    gameWindow.contentWindow.postMessage( JSON.stringify(["keepPromise", [callbackToken, err, response]]), kh.env.gameUrl);
  };

  var shield = document.getElementById("shield");

  // シールドに通信中画像を追加する
  var _addShieldConnectingImgIfNotExists = function() {
    var shieldImgId = "shield_img";
    var shieldImg = document.getElementById( shieldImgId );
    if ( shieldImg ) {
      return;
    }
    var connectiongImgTag = document.createElement("img");
    var connectiongImgUrl = kh.env.gameUrl + "/front/images/connecting.png";
    connectiongImgTag.id = shieldImgId;
    connectiongImgTag.src = connectiongImgUrl;
    $(connectiongImgTag).css({
      "position": "absolute",
      "bottom": 0,
      "right": 0,
      "user-select": "none",
      "-webkit-user-select": "none",
      "-moz-user-select": "none",
      "-ms-user-select": "none"
    });
    shield.appendChild( connectiongImgTag );
  };

  // iPad 対応
  if (-1 < window.navigator.userAgent.indexOf("iPad")) {
    $("#wrapper").css("width", "89%");
  }

  // PC版の場合はkhが存在している
  var tmpElement = document.createElement('a');
  tmpElement.href = gameWindow.src;
  var validateDomain = typeof kh === "undefined" ? tmpElement.origin: kh.env.gameUrl;
  tmpElement = null;
  window.addEventListener("message", function receiveMessage(event) {
    if (event.origin !== validateDomain ) {
      return;
    }
    if (event.data === "postmessage.test") { return; }
    try {
      var args = JSON.parse(event.data);
      var cmd = args[0];
      var cmdArgs = args[1];
      (rpc[cmd] || function() {}).apply(null, cmdArgs);
    } catch(e) {
      console.error(e);
    }
  }, false);

  var bgmName = "";
  var bgmVolume = 1.0;
  var bgm;
  var bgmPlaying = false;
  var bgmPromise = Q.resolve();
  var voice = null;
  var seNum = 0;
  window.rpc = {
    updateHeight: function(height) {
      if (window.gadgets && gadgets.window) {
        //PC版のみ
        gadgets.window.adjustHeight();
        gameWindow.height = height + "px";
        shield.style.height = window.getComputedStyle(gameWindow).height;
      }
    },

    reload: function() {
      location.reload();
    },
    /**
     * BoomBoxのON/OFF
     *
     * @method boomBoxPower
     * @param {boolean} flag
     */
    boomBoxPower: function(flag) {
      boombox.power(flag);
    },
    /**
     * BoomBoxのSetup
     *
     * @method boomBoxSetup
     * @param {Object} param
     */
    boomBoxSetup: function(param) {
      boombox.setup(param);
    },
    /**
     * khMakeTempPoolをコールする
     *
     * @method boomBoxKhMakeTempPool
     */
    boomBoxKhMakeTempPool: function() {
      boombox.khMakeTempPool();
    },
    /**
     * khPurgeTempPoolをコールする
     *
     * @method boomBoxKhPurgeTempPool
     */
    boomBoxKhPurgeTempPool: function() {
      boombox.khPurgeTempPool();
    },
    /**
     * SE再生
     *
     * @method playSE
     * @param {String} name -- SE名
     * @param {Int} volume
     */
    playSE: function(name, volume) {
      seNum = (seNum & 1) ? 0 : 1;
      console.log("play: ",  seNum); // 連打時の安定再生の為 2つのどちらかを使う
      var se = boombox.get(name + seNum);
      if (se === undefined) {
        console.warn("Coul not find se object.");
        return;
      }
      if (se.ctx.state === "suspended" ) {
        se.ctx.resume();
      }

      se.volume(volume);
      se.play();
      boombox.resume(); // BGMがSE再生で不正に停止した場合、復旧を試みる
    },
    /**
     * BGM変更
     *
     * @method changeBGM
     * @param {String} name -- BGM名
     * @param {Array} param -- boombox用の src パラメータ [{"media": "audio/mp3", "path": path}]
     * @param {Int} volume
     *
     */
    changeBGM: function(name, param, volume) {
      bgmPlaying = true;
      if (bgmName === name) {
        if (bgmVolume === volume) {
          boombox.resume(); // BGMが不正に停止している場合、画面遷移時で復旧を試みる
          return;
        }
        var audio = boombox.get(name);
        if (audio) {
          if (!audio.isStop() && !audio.isPause()) {
            // 止まっていないのであればそのまま
            return;
          }
        }
      }

      //コピペーストを防ぐための中身ファンクション
      //実際のplayが行うplaySoundを呼んで、ロード完了コールバックの処理を行う
      var playBgm = function(_name, _param, _volume) {
        if (!bgmPlaying) {
          return;
        }
        return window.rpc.playSound(_name, _param, _volume, /* loop = */true).then(function(audio) {
          if (!bgmPlaying) {
            //ロード中にBGM再生を停止するコマンドが来たら(bgmPlayingがFalseになっている)サウンドOFFでも再生するのを防ぐためにstopを呼ぶ
            audio.stop();
            return;
          }
          bgm = audio;
        });
      };

      var resetPromise = function(e) {
        if(e instanceof Error){
          console.error(e);
          return;
        }
        bgmPromise = Q.resolve();
        return bgmPlaying = false;
      }

      bgmPromise = bgmPromise.then(function(){
        if (bgmName !== name) {
          return window.rpc.stopBGM()
          .then(function(){
            bgmName = name;
            bgmVolume = _.isNaN(volume) ? 0.5 : volume;
            bgmPlaying = true;
          })
          .then(playBgm.bind(this, name, param, volume));
        } else {
          bgmName = name;
          bgmVolume = volume === null ? 0.5 : volume;
          return playBgm(name, param, volume);
        }
      }).fail(resetPromise);
    },

    stopBGM: function() {
      bgmPlaying = false;
      bgmName = "";
      if (bgm) {
        var defer = Q.defer();
        var t = setInterval((function(bgm_) {
          // BGMをfadeoutさせる
          return function() {
            var volume;
            if (bgm_ && bgm_.gainNode && bgm_.gainNode && bgm_.gainNode.gain) {
              volume = bgm_.gainNode.gain.value;
            } else {
              volume = 0;
            }
            if (volume <= 0.01) {
              clearInterval(t);
              bgm_.stop();
              defer.resolve();
            }
            bgm_.volume(volume * 3 / 5);
          };
        })(bgm), 10);
        bgm = null;
        return defer.promise;
      }
      return Q.resolve();
    },
    /**
     * Voice再生 単一のVoiceを再生する
     *
     * @method playVoice
     * @param {String} name -- BGM名
     * @param {Array} param -- boombox用の src パラメータ [{"media": "audio/mp3", "path": path}]
     * @param {Int} volume
     *
     */
    playVoice: function(name, param, volume) {
      if (voice) {
        window.rpc.stopVoice();
      }
      window.rpc.playSound.call(this, name, param, volume).then(function(audio) {
        voice = audio;
      });
    },
    /**
     * Voice再生を停止する
     *
     * @method stopVoice
     *
     */
    stopVoice: function() {
      if (voice) {
        voice.stop();
        boombox.resume(); // BGMが不正に停止した場合、復旧を試みる
        voice = null;
      }
    },
    /**
     * 音声再生 ボイスのように一つの音だけの再生ではなく、複数の音を再生させる場合につかう
     *
     * @method playSound
     * @param {String} name -- BGM名
     * @param {Array} param -- boombox用の src パラメータ [{"media": "audio/mp3", "path": path}]
     * @param {Int} volume
     * @param {Bool} loop -- true: ループするBGM用, false: ループしない。
     */
    playSound: function(name, param, volume, loop) {
      var sound = null;
      if (sound = boombox.get(name)) {
        sound.volume(volume);

        if (sound.isStop()) {
          sound.play();
        }else{
          sound.replay();
        }

        boombox.resume(); // BGMが不正に停止した場合、復旧を試みる
        return Q.resolve(sound);
      }
      var dfd = Q.defer();
      boombox.load(name, {src: param}, function(err, audio) {
        if (err) {
          console.warn(err);
          return;
        }
        sound = audio;
        sound.volume(volume);
        sound.play();
        if (loop) {
          sound.setLoop(boombox.LOOP_NATIVE);
        }
        boombox.resume(); // BGMが不正に停止した場合、復旧を試みる
        dfd.resolve(sound);
      });
      return dfd.promise;
    },
    stopSound: function(name) {
      var audio = boombox.get(name);
      if (!audio) {
        console.warn("stopSound: no such audio: ", name);
        return;
      }
      audio.stop();
    },
    loadSound: function(name, param) {
      var counter = 0;
      var count = function() {
        counter++;
        if (counter === 2) {
          gameWindow.contentWindow.postMessage( JSON.stringify(["postSeLoadFinished", [name]]), kh.env.gameUrl);
        }
      };
      // ★★IE 判定で boombox をスキップ
      if (kh.env.isIE) {
        return;
      }
      [0, 1].forEach(function(n) { // 連打時の安定再生の為 2つロードしておく
        if (boombox.pool[name + n] != null) {
          count();
          return;
        }

        boombox.load(name + n, {src: param}, false, function() {
          count();
        });
      });
    },
    deployTouchShield: function() {
      console.debug("===シールドを展開中===");
      _addShieldConnectingImgIfNotExists();
      shield.style.display = "block";
    },
    removeTouchShield: function() {
      console.debug("===シールドを解除しました===");
      shield.style.display = "none";
    },

    deployLoading: function() {
      console.debug("===ローディングを展開中===");
      if (document.getElementById("loading")) {
        return;
      }
      var $gameWindow = $(gameWindow);
      var loadingBody = document.createElement("div");
      var width, height;
      var loadingImgUrl;
      var ulTop;
      var ulBackgroundX;
      var top;
      var left;
      loadingBody.id = "loading";

      if ( kh.env.isSp ) {
        // SP版
        width = 640;
        height = 900;
        top = "0";
        left = "0";
        ulTop = "286px";
        ulBackgroundX = "30px";

        window.addEventListener("resize", function resizeEvent() {
          var $loading = $(document.getElementById("loading"));
          if($loading.length === 0){
            return;
          }
          $loading.css({
            "width" : "640px",
            "height" : "900px",
          });
        }, {
          once: true,
          passive: false
        });
      } else {
        // PC版
        width = 960;
        height = 640;
        top = "12px";
        left = "10px";
        ulTop = "143px";
        ulBackgroundX = "200px";
      }
      loadingImgUrl = kh.env.gameUrl + "/front/images/loading.gif";

      loadingBody.innerHTML = [
        "<style>",
        "#loading{width: "+ width + "px; height: " + height + "px; z-index: 10000; display: block}",
        "#loading{background-color: #000}",
        "#loading{position: absolute; top: " + top +"; left: " + left + "}",
        "#loading__img{background: url(" + loadingImgUrl + ") center 0 no-repeat}",
        "#loading__img{width: 320px}",
        "#loading__img{height: 100px}",
        "#loading__img{position: absolute}",
        "#loading__img{bottom: 0}",
        "#loading__img{right: 0}",
        "#slide_ul li{line-height: 1.6; position: absolute; top: 100px; left: 0}",
        "#slide_ul li div{line-height: 1}",
        ".ticker{background: #000}",
        "</style>",
        "<div id='slide' class='ticker' height='100%'>",
        "<ul id='slide_ul'></ul>",
        "</div>",
        "<div id=\"loading__img\"></div>"
      ].join("\n");

      gameWindow.parentNode.appendChild(loadingBody);
      if ($("#replaceJS").length === 0) {
        window.rpc.loadTipsScript().then(window.rpc.prepareTips);
      } else {
        // すでに読み込み済みなら同期でTips表示を開始させる
        window.rpc.prepareTips();
      }

      // 背景画像の設定
      var plateImgUrl = kh.env.gameUrl + "/front/images/base_tips_plate.jpg";
      var slideUl = document.getElementById("slide_ul");
      slideUl.style.background = "url(" + plateImgUrl + ") " + ulBackgroundX + " 0px no-repeat";
      slideUl.style.top = ulTop;

    },

    /**
     * Tips文言の表示処理
     * @method prepareTips
     */
    prepareTips: function() {
      var slideUl = $("#slide_ul");
      // ランダムに並び替え
      var _tipsText = _.shuffle( tipsText );
      _.each(_tipsText, function(_text){
        slideUl.append(_text);
      });
      // クリックハンドラ登録、同時に最初のTips表示のためにイベント発火
      slideUl.on("click", window.rpc.showNextTips).trigger("click");
    },

    /**
     * 次のTipsを表示する
     */
    showNextTips: function() {
      var root = $("#slide_ul");
      var index = root.data("index") || 0;
      var list = root.find("li");
      // 次のTipsのインデックスをインクリメント
      root.data("index", (index + 1) % list.size());
      list.each(function(i, elm){
        // index に一致するTipsだけを表示
        $(elm).css("display", i == index ? "block" : "none");
      });
    },

    /**
     * tipsText.jsを読み込むelementを追加
     * @return {Promise} スクリプト読み込み完了時にresolveされる
     */
    loadTipsScript: function() {
      if ($("#replaceJS").length !== 0) {
        return Q.resolve();
      }
      var sc = document.createElement("script");
      sc.setAttribute("id","replaceJS");
      sc.src = kh.env.gameUrl + "/front/js/tipsText.js";
      var dfd = Q.defer();
      var onLoad = function(data) {
        this.removeEventListener("load", onLoad);
        onLoad = null;
        dfd.resolve();
      };
      sc.addEventListener("load", onLoad);
      document.body.appendChild(sc);
      return dfd.promise;
    },

    removeLoading: function() {
      console.debug("===ローディングを解除しました===");
      var dialogBody = document.getElementById("loading");
      // ★★ IE 対策
      if (kh.env.isIE && dialogBody && dialogBody.parentNode) {
        console.log("Remove the IE loading div.");
        dialogBody.parentNode.removeChild(dialogBody);
        dialogBody = null;
        return;
      }
      if( dialogBody ) {
        dialogBody.remove();
        dialogBody = null;
      }
    },

    openErrorDialog: function(error_code) {
      if (document.getElementById("error_dialog")) {
        return;
      }
      var dialogBody = document.createElement("div");
      var gameURL = kh.env.isR18 ? kh.env.R18GameURL: kh.env.GeneralGameURL;
      var width, height;
      var codeTop, codeLeft;
      var btnTop, btnLeft;
      var btnUrl, backgroundImgUrl;
      var margin;
      var $gameWindow = $(gameWindow);
      dialogBody.id = "error_dialog";
      if ( kh.env.isSp ) {
        // SP版
        width = 640;
        height = 900;
        btnUrl = "/front/images/error/btn.png";
        backgroundImgUrl = "/front/images/error/sp_error.jpg";
        margin = "0";
        codeTop = 0;
        codeLeft = 0;
        btnTop = 765;
        btnLeft = 184;

        window.addEventListener("resize", function resizeEvent() {
          var $loading = $(document.getElementById("loading"));
          if($loading.length === 0){
            return;
          }
          $loading.css({
            "width" : "640px",
            "height" : "900px",
          });
        }, {
          once: true,
          passive: false
        });
      } else {
        // PC版
        width = $gameWindow.parent().width();
        height = $gameWindow.parent().height();
        btnUrl = kh.env.gameUrl + "/front/images/error/btn.png";
        backgroundImgUrl = kh.env.gameUrl + "/front/images/error/pc_error.jpg";
        margin = "10px";
        codeTop = 150;
        codeLeft = 100;
        btnTop = 480;
        btnLeft = 186;
        error_code = "<br />" + error_code;
      }
      dialogBody.innerHTML = [
        "<style>",
        "#error_dialog{width: "+ width + "px; height: " + height + "px; z-index: 10000; display: block}",
        "#error_dialog{background: url(" + backgroundImgUrl + ") center 0 no-repeat}",
        "#error_dialog{margin: " + margin + " }",
        "#error_dialog{top: 0; left: 0}",
        "#error_dialog{position: absolute }",
        "#top_btn{background: url(" + btnUrl + "); width: 272px; height: 70px; outline: 0}",
        "#top_btn{position: absolute; top: " + btnTop + "px; left: " + btnLeft + "px}",
        "#top_btn:hover{background-position: 0 -70px}",
        "#error_code{position: absolute; top: " + codeTop + "px; left: " + codeLeft + "px; display: inline-block; color:#fff;}",
        "</style>",
        "<div id=\"error_code\"><h2>コード:"+ error_code +"</h2></div>",
        "<a id=\"top_btn\" target=\"_top\" href=" + gameURL + "><!-- topへ --></a>"
      ].join("\n");
      gameWindow.parentNode.appendChild(dialogBody);
    },

    /**
     * PC版の確認が来たらPC版であることを返答する
     */
    checkPcEdition: function() {
      if( typeof kh !== "undefined" ) {
        // PC版の場合のみ返す
        gameWindow.contentWindow.postMessage( JSON.stringify(["usePcEdition", [{}]]), kh.env.gameUrl );
      }
    },

    /**
     * リダイレクト
     * @param redirectURL 遷移先のURL
     */
    redirectURL: function (redirectURL){
      location.href = redirectURL;
    },

    /**
     * 【PC版のみ】
     * gadgets.io.makeRequestを実行して結果をiframeにpostMessageする
     */
    paymentRequest: function( paymentData ) {

      var itemParams = {};
      itemParams[opensocial.BillingItem.Field.SKU_ID] = paymentData['sku_id'];
      itemParams[opensocial.BillingItem.Field.PRICE] = paymentData['price'];
      itemParams[opensocial.BillingItem.Field.COUNT] = paymentData['count'];
      itemParams[opensocial.BillingItem.Field.DESCRIPTION] = paymentData['description'];
      itemParams[dmm.BillingItem.Field.NAME] = paymentData['name'];
      itemParams[dmm.BillingItem.Field.IMAGE_URL] = paymentData['image_url'];
      var item = opensocial.newBillingItem(itemParams);
      var params = {};
      params[opensocial.Payment.Field.ITEMS] = [item];
      params[opensocial.Payment.Field.PAYMENT_TYPE] = opensocial.Payment.PaymentType.PAYMENT;
      var payment = opensocial.newPayment(params);
      opensocial.requestPayment(payment, function(response) {
        if (response.hadError()) {
            alert("ポイント決済に失敗しました\n" + response.errorMessage_ );
        } else {
          var payment = response.getData();

          if (payment.getField(opensocial.Payment.Field.RESPONSE_CODE) === 'userCancelled') {
            return;
          }

          var paymentId = payment.getField( dmm.Payment.Field.PAYMENT_ID );
          var skuId = payment.getField("items")[0].getField("skuId");
          var gameFrame = $('#game').get(0).contentWindow;
          gameWindow.contentWindow.postMessage( JSON.stringify(["paymentResponse", [{paymentId: paymentId, skuId: skuId }]]), kh.env.gameUrl );
        }
      });

    },

    /**
     * 【PC版のみ】
     * makeRequestを実行して結果をiframeにpostMessageする
     */
    makeRequest: function( params ) {
      dmmApi.requestGameServer( params.url, params.data, params.method, true, gadgets.io.ContentType.JSON ).done( function(response) {
        gameWindow.contentWindow.postMessage( JSON.stringify(["makeRequestResponse", [{ deferCount: params.deferCount, data: response.data }]]), kh.env.gameUrl );
      });

    },
    /**
     * @method createInspection
     * @param {String} text -- Inspection対象の文字列
     * @param {Integer} callbackToken -- 下位iframe側で保持しているcallbackをよび出すためのキー
     */
    createInspection: function(text, callbackToken) {
      dmmApi.createInspection(text).then(function(record) {
        execPostMessageCallback(callbackToken, null, record);
      }, function(err) {
        execPostMessageCallback(callbackToken, err, null);
      });
    },
    /**
     * @method updateInspection
     * @param {String} textId -- InspectionAPIで使うtext_id
     * @param {String} text -- Inspection対象の文字列
     * @param {Integer} callbackToken -- 下位iframe側で保持しているcallbackをよび出すためのキー
     */
    updateInspection: function(textId, text, callbackToken) {
      dmmApi.updateInspection(textId, text).then(function(record) {
        execPostMessageCallback(callbackToken, null, record);
      }, function(err) {
        execPostMessageCallback(callbackToken, err, null);
      });
    },
    /**
     * @method showIOSSoundTouchField
     * @param {String} seName -- SE名
     * @param {Float} seVolume -- SEボリューム
     * @param {String} navigateTo -- ルーティング用パラメータ
     */
    showIOSSoundTouchField: function(seName, seVolume, navigateTo) {
      // iPhone6で音が鳴らない問題に対する対応
      // domのタッチイベント経由でないと音が鳴らないようなので、
      // canvasの上にdivをおいてタッチで音を鳴らしてdivを削除する対応を行っています
      //
      if (window.rpc._touchedIOS) {
        return;
      }

      // タッチDOMを作成
      var $touchField = $("<div>");
      $touchField.css({
        width: "100%",
        height: "100%",
        display: "block",
        position: "absolute",
        backgroundColor: "rgba(0, 0, 0, 0)"
      });
      $touchField.insertBefore($("#game"));

      // 無音の読み込みとタッチ時に再生
      var silentSoundName = "silent";
      var silentSoundPath = kh.env.gameUrl + "/front/cocos2d-proj/components/core/se/silence.mp3";
      var enableSound = function() {
        window.rpc.playSE( silentSoundName, 1 );
        if (navigateTo) {
          window.rpc.playSE(seName, seVolume);
          setTimeout(function() { // ボタンSEが安定しないので遅延させる
            gameWindow.contentWindow.postMessage( JSON.stringify(["navigate", [navigateTo]]), kh.env.gameUrl);
            $touchField.remove();
            $touchField = null;
          }, 100);
        } else {
          $touchField.remove();
          $touchField = null;
        }
        seVolume = null;
      };
      if (kh.env.isIOS) {
        WebModule.WebAudio.init( function() {
          window.rpc._touchedIOS = true;
          enableSound();
        }, $touchField.get(0));
      } else {
        // for android chrome 55
        $touchField.on("touchend", function() {
          window.rpc._touchedIOS = true;
          boombox.WEB_AUDIO_CONTEXT = new (window.AudioContext || window.webkitAudioContext);
          enableSound();
        });
      }
      window.rpc.loadSound( silentSoundName, [{"media": "audio/mp3", "path": silentSoundPath}] );
    }
  };

  if (kh.env.needSoundTouchField) {
    if (/\/payment_id\//.test(document.referrer)) {
      window.rpc.showIOSSoundTouchField();
    }
  }
})((this || 0).self || global);
