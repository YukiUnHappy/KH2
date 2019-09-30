
(function(global) {
  "use strict";

  global.kh = global.kh || {};
  var kh = global.kh || {};
  kh.env = kh.env || {};
  var cc = global.cc;

  /**
   * プラットフォーム名
   * @attribute kh.env.platform
   * @type {String}
   */
  kh.env.platform = "dmm";

  /**
   * APIバージョン
   * @attribute kh.env.apiVersion
   * @type {String}
   */
  kh.env.apiVersion = "v1";

  /**
   * SP版/PC版の判定用のフラグ、PC版はgadget.xml直下では cc が読み込まれない
   *
   * @attribute kh.env.isSp
   * @type {Boolean}
   */
  if (typeof cc === 'undefined') {
    // index.html側で読み込む場合
    kh.env.isSp = false;
  } else {
    // app.html側で読み込む場合
    kh.env.isSp = (cc.game.config.designWidth === 640);
  }

  /**
   *
   * IOSかどうかの判定用フラグ
   * @attribute kh.env.isIOS
   * @type {Boolean}
   */
  if (typeof cc === 'undefined') {
    // index.html側で読み込む場合
    kh.env.isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  } else {
    // app.html側で読み込む場合
    kh.env.isIOS = (cc && cc.sys.os === cc.sys.OS_IOS) ? true : false;
  }
 
  /**
   * IEかどうかの判定用フラグ
   * @attribute kh.env.isIE
   * @type {Boolean}
   */
  var userAgent = window.navigator.userAgent.toLowerCase();
  kh.env.isIE = (userAgent.match(/(msie|MSIE)/) || userAgent.match(/(T|t)rident/)) ? true : false; //小文字化にしているけど念のため

  /**
   * Androidかどうかの判定用フラグ
   * @attribute kh.env.isAndroid
   * @type {Boolean}
   */
  var isChrome = /Chrome/.test(navigator.userAgent) && !/Version/.test(navigator.userAgent);
  kh.env.isAndroid = /Android/.test(navigator.userAgent);

  /**
   * iPhone6、Android chrome55で音が鳴らない問題に対する対応必要かどうかを判定する
   * iOSなら絶対いる。アンドロイドかつwebAudio使える環境は入ります。
   * @attribute kh.env.needSoundTouchField
   * @type {Boolean}
   */
  var enableWebAudio = !!(window.AudioContext || window.webkitAudioContext);
  kh.env.needSoundTouchField = kh.env.isIOS || (kh.env.isAndroid && enableWebAudio);


  /**
   * 動作環境の選択
   * 0:本番サーバー、
   * 1:DMMサンドボックス(debugX)、
   * 2:Vagrant繋ぎこみ環境、
   * 3:ローカル開発環境
   */
  kh.env.mode = ['Product', 'Sandbox', 'Vagrant', 'Localhost'][0];
  // 各mode条件判定のためのフラグ
  var modeProduct = (kh.env.mode==='Product');
  var modeSandbox = (kh.env.mode==='Sandbox');
  var modeVagrant = (kh.env.mode==='Vagrant');
  var modeLocalhost = (kh.env.mode==='Localhost');

  //環境毎のルートURL
  kh.env.urlRootBase = location.origin;

  //アップロード画像
  kh.env.imgRootBase = "/resources";

  //シナリオリソース
  kh.env.scenarioRootBase = "/resources/scenarios";

  //バトルリソース
  kh.env.battleResourceURL = "https://static-r.kamihimeproject.net/battle-resources";

  //サウンドはPC・SP・軽量版・通常版の分けが現在ありませんので、SPのNormalに固定
  kh.env.soundResourceURL = "https://static-r.kamihimeproject.net/sound-resources/sp/normal";

  // R18版のURL
  kh.env.R18GameURL = "/index.html";

  // 一般版のURL
  kh.env.GeneralGameURL = "/index.html";

  // R18フラグ
  kh.env.isR18 = true;

  // SmartBeat情報
  kh.env.smartBeat = {
    pc:{
      enabled: false,
      apiKey: "ba792238-0631-4d8e-b810-34428283dcb3",
      appVersion: "KAMI-PROD-PC-R18",
      appName: "KAMI-PROD-PC-R18"
    },
    sp:{
      enabled: false,
      apiKey: "3dfd0189-b7a1-4447-9a04-e0a13b4c5854",
      appVersion: "KAMI-PROD-SP",
      appName: "KAMI-PROD-SP"
    }
  };

  /**
   * ログサーバーURLルート
   *
   * @attribute kh.env.loggingUrlRoot
   * @type {string}
   */
  kh.env.loggingUrlRoot = 'https://log.haha.net';



  /**
   * postMessageでドメインチェックのためのAPIサーバーのアドレス
   *
   * @attribute kh.env.platformApiServer
   * @type {string}
   */
  kh.env.platformApiServer = modeProduct ? "http://osapi.qmm.com" : "http://sbx-osapi.qmm.com";

  /**
   * URLルート
   *
   * @attribute kh.env.urlRoot
   * @type {string}
   */
  kh.env.urlRoot = modeLocalhost ? location.href.replace(/^(https?:\/\/[^\/]+)\/.*$/, '$1') : kh.env.urlRootBase + "/" + kh.env.apiVersion;

  /**
   * ポイント決済用の決済トランザクション開始URL
   * フロントはこのURLにリダイレクトする
   *
   * @attribute kh.env.paymentRedirectURL
   * @type {string}
   */
  kh.env.paymentRedirectURL = kh.env.urlRoot.replace("https","http") + "/payment/transaction"; // gadget.jsはhttpでのみ提供されているためhttpsからhttpに変換

  if(!modeProduct){
    /**
     * モックを使うかどうかフラグ
     *
     * @attribute kh.env.useApiMock
     * @type {bool}
     */
    kh.env.useApiMock = false;

    /**
     * Pubsub関連の通信を使うかどうかフラグ
     *
     * @attribute kh.env.usePubsubMock
     * @type {bool}
     */
    kh.env.usePubsubMock = false;

    /**
     * tmp-mock/KHBattleResourcePathMockで定義されているパスを優先するかどうか
     *
     * @type {boolean}
     */
    kh.env.useResourcePathMock = false;

    /**
     * 難読化ファイルを使うかどうかフラグ
     * @type {bool}
     */
    kh.env.useUglifiedPathName = false;

    kh.env.useBattleResourceUglifiedPathName = false;

    kh.env.useSoundUglifiedPathName = false;

    /**
     * エラーログをサーバーに送信するかフラグ
     * ※ KAMIHIME-25327の対応で、本番含めsmartbeatがweb版に導入されたので、ロギングサーバーへの送信は停止する
     * @attribute kh.env.sendErrorLog
     * @type {bool}
     */
    kh.env.sendErrorLog = false;

    /**
     * ルーティングパラメーターの不備をエラーにするかフラグ
     * （falseの場合コンソールdebug）
     *
     * @attribute kh.env.riseErrorOnRoutingValidation
     * @type {bool}
     */
    kh.env.riseErrorOnRoutingValidation = true;
  } else {
    // 本番用設定、原則変更禁止
    kh.env.useApiMock = false;
    kh.env.usePubsubMock = false;
    kh.env.useResourcePathMock = false;
    kh.env.useUglifiedPathName = true;
    kh.env.useBattleResourceUglifiedPathName = true;
    kh.env.useSoundUglifiedPathName = true;
    kh.env.sendErrorLog = false;
    kh.env.riseErrorOnRoutingValidation = false;
  }

  Object.defineProperties(kh.env, {

    /**
     * 画像ファイルのルート
     * @type {string}
     */
    imgRoot: { get: function() {
      if (!kh.env.useUglifiedPathName) {
        // TODO+: ローカル環境とdebug環境の仕組みの統一
        return "/resources/normal";
      }
      return [
        kh.env.imgRootBase || "",
        (kh.env.isSp ? "sp" : "pc"),
        (kh.createInstance("playerGameConfig").getImageQuality())
      ].join("/");
    } },

    /**
     * バトルアニメ-シンファイルのルート
     * @type {string}
     */
    battleAnimationRoot: { get: function() {
      if (!kh.env.useBattleResourceUglifiedPathName) {
        // TODO+: ローカル環境とdebug環境の仕組みの統一
        return "/resources/battle-resources";
      }
      return [
        kh.env.battleResourceURL,
        (kh.env.isSp ? "sp" : "pc"),
        "normal"
      ].join("/");
    } },

    /**
     * バトルアニメ-シンファイルのルート
     * @type {string}
     */
    soundRoot: { get: function() {
      if (!kh.env.useBattleResourceUglifiedPathName) {
        // TODO+: ローカル環境とdebug環境の仕組みの統一
        return "/resources/sound";
      }
      return kh.env.soundResourceURL;
    } }
  });

  /**
   * Scenario & Sceneファイルのルート
   * @type {string}
   */
  kh.env.scenarioRoot =
    kh.env.useUglifiedPathName
      ? kh.env.scenarioRootBase
      : "/resources/scenarios";

  /**
   * PC版でゲームが展開されるiframeのID
   * @type {string}
   */
  kh.env.iframeId = "game";

  /**
   * PC版でゲームが展開されるiframeのsrcのドメイン名
   * @type {string}
   */
  kh.env.gameUrl = kh.env.urlRootBase;

  /**
   * フロントの cocos2d-projまでのパス
   * @type {string}
   */
  kh.env.frontRootPath = modeLocalhost ? "" : "/front";

})((this || 0).self || global);
